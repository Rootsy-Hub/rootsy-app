-- HR: permisos mesas en plantilla administrator + RPC crear rol POP.

-- ---------------------------------------------------------------------------
-- Mesas en plantilla administrator (dueño + validación de permisos HR)
-- ---------------------------------------------------------------------------

UPDATE public.roles r
SET permission_grants = sub.merged
FROM (
  SELECT
    r2.id,
    COALESCE(
      (
        SELECT jsonb_agg(DISTINCT elem ORDER BY elem)
        FROM (
          SELECT jsonb_array_elements_text(r2.permission_grants) AS elem
          UNION ALL
          SELECT unnest(
            ARRAY[
              'mesas:read',
              'mesas:create',
              'mesas:update',
              'mesas:delete'
            ]::text[]
          )
        ) AS parts
      ),
      '[]'::jsonb
    ) AS merged
  FROM public.roles r2
  WHERE r2.name = 'administrator'
) AS sub
WHERE r.id = sub.id;

-- ---------------------------------------------------------------------------
-- Crear rol POP (solo dueño)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.hr_pop_owner_create_pop_role (
  p_pop_id UUID,
  p_display_name TEXT,
  p_permission_grants TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.roles%ROWTYPE;
  tmpl jsonb;
  bad_cnt INT;
  new_grants JSONB;
  slug TEXT;
  base_slug TEXT;
  suffix INT := 0;
  disp TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.pops WHERE id = p_pop_id AND owner_user_id = auth.uid()
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'forbidden');
  END IF;

  disp := trim(p_display_name);
  IF disp = '' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_display_name');
  END IF;

  SELECT permission_grants INTO tmpl
  FROM public.roles
  WHERE name = 'administrator'
  ORDER BY CASE WHEN pop_id IS NULL THEN 0 ELSE 1 END, id
  LIMIT 1;

  IF tmpl IS NULL THEN
    tmpl := '[]'::jsonb;
  END IF;

  SELECT COUNT(*) INTO bad_cnt
  FROM (
    SELECT DISTINCT trim(x) AS k
    FROM unnest(COALESCE(p_permission_grants, ARRAY[]::text[])) AS u(x)
    WHERE trim(x) <> ''
  ) AS g
  WHERE NOT EXISTS (
    SELECT 1
    FROM jsonb_array_elements_text(tmpl) AS allowed(k)
    WHERE allowed.k = g.k
  );

  IF bad_cnt > 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_permission');
  END IF;

  SELECT COALESCE(
    (
      SELECT to_jsonb(array_agg(s.k ORDER BY s.k))
      FROM (
        SELECT DISTINCT trim(x) AS k
        FROM unnest(COALESCE(p_permission_grants, ARRAY[]::text[])) AS u(x)
        WHERE trim(x) <> ''
      ) s
    ),
    '[]'::jsonb
  )
  INTO new_grants;

  base_slug := lower(
    regexp_replace(
      regexp_replace(trim(disp), '[^a-zA-Z0-9]+', '_', 'g'),
      '^_+|_+$',
      '',
      'g'
    )
  );
  IF base_slug = '' THEN
    base_slug := 'rol';
  END IF;
  slug := base_slug;

  WHILE EXISTS (
    SELECT 1 FROM public.roles
    WHERE pop_id = p_pop_id AND name = slug
  ) LOOP
    suffix := suffix + 1;
    slug := base_slug || '_' || suffix::text;
  END LOOP;

  INSERT INTO public.roles (
    pop_id,
    name,
    display_name,
    description,
    is_system,
    permission_grants
  )
  VALUES (
    p_pop_id,
    slug,
    disp,
    NULL,
    FALSE,
    new_grants
  )
  RETURNING * INTO r;

  RETURN jsonb_build_object('ok', true, 'role_id', r.id);
END;
$$;

COMMENT ON FUNCTION public.hr_pop_owner_create_pop_role IS
  'Dueño del POP: crea un rol propio con display_name y permission_grants validados contra plantilla administrator.';
