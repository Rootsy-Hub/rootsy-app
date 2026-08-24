-- Auditoría append-only + código de aprobación por usuario×POP.
-- TTL 8 meses en expires_at (sin job). RPC rootsy_apply_with_audit = negocio + audit.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.roles
  ADD COLUMN IF NOT EXISTS can_approve BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.roles.can_approve IS
  'Ciclo de vida: si es false, los miembros no generan código y se borra el hash. No se valida al aprobar una mutación.';

CREATE TABLE IF NOT EXISTS public.audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  resource TEXT NOT NULL,
  resource_id UUID,
  action TEXT NOT NULL,
  http_method TEXT NOT NULL,
  path TEXT NOT NULL,
  previous_state JSONB,
  new_state JSONB,
  requester_user_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
  approver_user_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
  execution_source TEXT NOT NULL,
  kind TEXT,
  CONSTRAINT audit_events_source_chk
    CHECK (execution_source IN ('user', 'rootsy_ai', 'system')),
  CONSTRAINT audit_events_action_chk
    CHECK (action IN ('create', 'update', 'delete'))
);

CREATE INDEX IF NOT EXISTS idx_audit_events_pop_occurred
  ON public.audit_events (pop_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_events_pop_resource
  ON public.audit_events (pop_id, resource, occurred_at DESC);

COMMENT ON TABLE public.audit_events IS
  'Rastro de mutaciones de la API. Append-only. expires_at = occurred_at + 8 meses.';

ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_events_select_pop ON public.audit_events;
CREATE POLICY audit_events_select_pop ON public.audit_events
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

CREATE TABLE IF NOT EXISTS public.pop_approval_codes (
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  code_fingerprint TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (pop_id, user_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pop_approval_codes_fingerprint
  ON public.pop_approval_codes (pop_id, code_fingerprint);

ALTER TABLE public.pop_approval_codes ENABLE ROW LEVEL SECURITY;

-- Sin políticas de write para authenticated: solo RPCs SECURITY DEFINER.

CREATE OR REPLACE FUNCTION public.rootsy_approval_fingerprint(
  p_pop_id UUID,
  p_code TEXT
) RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT encode(
    hmac(convert_to(p_pop_id::text || ':' || p_code, 'utf8'), 'rootsy-approval', 'sha256'),
    'hex'
  );
$$;

CREATE OR REPLACE FUNCTION public.rootsy_set_approval_code(
  p_pop_id UUID,
  p_code TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  fp TEXT;
  hashed TEXT;
  is_owner BOOLEAN;
  may_set BOOLEAN;
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;
  IF p_code IS NULL OR p_code !~ '^[0-9]{4,8}$' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_code');
  END IF;
  IF NOT public.user_has_pop_access(p_pop_id, uid) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'forbidden');
  END IF;

  SELECT owner_user_id = uid INTO is_owner
  FROM public.pops WHERE id = p_pop_id;
  IF NOT COALESCE(is_owner, FALSE) THEN
    SELECT COALESCE(r.can_approve, FALSE) INTO may_set
    FROM public.user_pop_roles upr
    JOIN public.roles r ON r.id = upr.role_id
    WHERE upr.pop_id = p_pop_id
      AND upr.user_id = uid
      AND upr.is_active = TRUE
    LIMIT 1;
    IF NOT COALESCE(may_set, FALSE) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'forbidden');
    END IF;
  END IF;

  fp := public.rootsy_approval_fingerprint(p_pop_id, p_code);
  IF EXISTS (
    SELECT 1 FROM public.pop_approval_codes
    WHERE pop_id = p_pop_id AND code_fingerprint = fp AND user_id <> uid
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'code_taken');
  END IF;

  hashed := crypt(p_code, gen_salt('bf', 8));
  INSERT INTO public.pop_approval_codes (pop_id, user_id, code_hash, code_fingerprint, updated_at)
  VALUES (p_pop_id, uid, hashed, fp, now())
  ON CONFLICT (pop_id, user_id) DO UPDATE
    SET code_hash = EXCLUDED.code_hash,
        code_fingerprint = EXCLUDED.code_fingerprint,
        updated_at = now();

  RETURN jsonb_build_object('ok', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.rootsy_clear_approval_code(
  p_pop_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;
  DELETE FROM public.pop_approval_codes
  WHERE pop_id = p_pop_id AND user_id = uid;
  RETURN jsonb_build_object('ok', true, 'has_code', FALSE);
END;
$$;

CREATE OR REPLACE FUNCTION public.rootsy_approval_code_status(
  p_pop_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  is_owner BOOLEAN;
  may_set BOOLEAN := FALSE;
  has_code BOOLEAN := FALSE;
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;
  IF NOT public.user_has_pop_access(p_pop_id, uid) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'forbidden');
  END IF;

  SELECT owner_user_id = uid INTO is_owner FROM public.pops WHERE id = p_pop_id;
  IF COALESCE(is_owner, FALSE) THEN
    may_set := TRUE;
  ELSE
    SELECT COALESCE(r.can_approve, FALSE) INTO may_set
    FROM public.user_pop_roles upr
    JOIN public.roles r ON r.id = upr.role_id
    WHERE upr.pop_id = p_pop_id AND upr.user_id = uid AND upr.is_active = TRUE
    LIMIT 1;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.pop_approval_codes
    WHERE pop_id = p_pop_id AND user_id = uid
  ) INTO has_code;

  RETURN jsonb_build_object(
    'ok', true,
    'can_set', COALESCE(may_set, FALSE),
    'has_code', has_code
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.rootsy_verify_approval_code(
  p_pop_id UUID,
  p_approver_user_id UUID,
  p_code TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored TEXT;
BEGIN
  IF p_code IS NULL OR p_code !~ '^[0-9]{4,8}$' THEN
    RETURN FALSE;
  END IF;
  SELECT code_hash INTO stored
  FROM public.pop_approval_codes
  WHERE pop_id = p_pop_id AND user_id = p_approver_user_id;
  IF stored IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN crypt(p_code, stored) = stored;
END;
$$;

CREATE OR REPLACE FUNCTION public.rootsy_wipe_approval_code_for_user(
  p_pop_id UUID,
  p_user_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.pop_approval_codes
  WHERE pop_id = p_pop_id AND user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rootsy_wipe_approval_codes_for_role(
  p_pop_id UUID,
  p_role_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.pop_approval_codes c
  USING public.user_pop_roles upr
  WHERE c.pop_id = p_pop_id
    AND c.user_id = upr.user_id
    AND upr.pop_id = p_pop_id
    AND upr.role_id = p_role_id
    AND upr.is_active = TRUE;
END;
$$;

-- ---------------------------------------------------------------------------
-- Dispatcher atómico
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rootsy_apply_with_audit(
  p_kind TEXT,
  p_payload JSONB,
  p_audit JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  pop UUID;
  op JSONB;
  tbl TEXT;
  row_data JSONB;
  rec_id UUID;
  first_id UUID;
  touched INT;
  col_list TEXT;
  allowed TEXT[] := ARRAY[
    'articles', 'article_costs', 'price_lists', 'price_list_items', 'categories',
    'clients', 'suppliers',
    'promotions', 'promotion_slots', 'promotion_slot_options',
    'recipes', 'recipe_ingredients', 'recipe_categories', 'comanda_stations',
    'services', 'service_categories', 'service_types', 'service_type_articles',
    'service_type_addons', 'service_type_addon_articles',
    'pop_printers',
    'expenses', 'expense_payments', 'expense_categories',
    'inventory_locations', 'inventory_movements', 'inventory_cost_layers',
    'inventory_layer_allocations', 'inventory_on_hand',
    'pop_manufacturing_runs',
    'cash_registers', 'cash_register_sessions', 'cash_register_movements',
    'treasury_accounts', 'treasury_settlements', 'treasury_reconciliation_marks',
    'treasury_pos_acreditations', 'bank_statement_lines',
    'accounting_chart_of_accounts',
    'checks',
    'current_account_receipts', 'current_account_applications',
    'sale_quotes', 'purchase_orders',
    'pops',
    'arca_sale_points',
    'pop_employees', 'pop_employee_attendance', 'pop_employee_francos',
    'pop_employee_payments', 'pop_invitations', 'user_pop_roles', 'roles',
    'accounting_entries', 'accounting_entry_lines',
    'sale_payments', 'purchase_payments', 'service_charge_payments'
  ];
  src TEXT;
  has_pop BOOLEAN;
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  pop := NULLIF(p_audit->>'pop_id', '')::UUID;
  IF pop IS NULL OR NOT public.user_has_pop_access(pop, uid) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'forbidden');
  END IF;

  src := COALESCE(p_audit->>'execution_source', 'user');
  IF src NOT IN ('user', 'rootsy_ai', 'system') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_source');
  END IF;

  FOR op IN SELECT jsonb_array_elements(COALESCE(p_payload->'ops', '[]'::jsonb))
  LOOP
    tbl := op->>'table';
    IF tbl IS NULL OR NOT (tbl = ANY (allowed)) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'table_not_allowed');
    END IF;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = tbl AND column_name = 'pop_id'
    ) INTO has_pop;

    IF op->>'op' = 'insert' THEN
      row_data := COALESCE(op->'row', '{}'::jsonb);
      IF has_pop THEN
        IF row_data->>'pop_id' IS NULL THEN
          row_data := row_data || jsonb_build_object('pop_id', pop);
        ELSIF (row_data->>'pop_id')::UUID <> pop THEN
          RETURN jsonb_build_object('ok', false, 'error', 'pop_mismatch');
        END IF;
      END IF;
      IF row_data->>'id' IS NULL OR row_data->>'id' = '' THEN
        rec_id := gen_random_uuid();
        row_data := row_data || jsonb_build_object('id', rec_id);
      ELSE
        rec_id := (row_data->>'id')::UUID;
      END IF;
      IF first_id IS NULL THEN
        first_id := rec_id;
      END IF;
      SELECT string_agg(quote_ident(k), ',')
      INTO col_list
      FROM jsonb_object_keys(row_data) AS k;
      EXECUTE format(
        'INSERT INTO %I (%s) SELECT %s FROM jsonb_populate_record(NULL::%I, $1)',
        tbl, col_list, col_list, tbl
      ) USING row_data;

    ELSIF op->>'op' = 'update' THEN
      rec_id := NULLIF(op->>'id', '')::UUID;
      row_data := COALESCE(op->'row', '{}'::jsonb);
      IF rec_id IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'missing_id');
      END IF;
      row_data := row_data - 'id' - 'pop_id';
      SELECT string_agg(quote_ident(k), ',')
      INTO col_list
      FROM jsonb_object_keys(row_data) AS k;
      IF col_list IS NULL OR col_list = '' THEN
        CONTINUE;
      END IF;
      IF tbl = 'pops' THEN
        EXECUTE format(
          'UPDATE %I SET (%s) = (SELECT %s FROM jsonb_populate_record(NULL::%I, $1)) WHERE id = $2',
          tbl, col_list, col_list, tbl
        ) USING row_data, pop;
      ELSIF has_pop THEN
        EXECUTE format(
          'UPDATE %I SET (%s) = (SELECT %s FROM jsonb_populate_record(NULL::%I, $1)) WHERE id = $2 AND pop_id = $3',
          tbl, col_list, col_list, tbl
        ) USING row_data, rec_id, pop;
      ELSE
        EXECUTE format(
          'UPDATE %I SET (%s) = (SELECT %s FROM jsonb_populate_record(NULL::%I, $1)) WHERE id = $2',
          tbl, col_list, col_list, tbl
        ) USING row_data, rec_id;
      END IF;
      GET DIAGNOSTICS touched = ROW_COUNT;
      IF touched = 0 THEN
        RETURN jsonb_build_object('ok', false, 'error', 'not_found');
      END IF;
      IF first_id IS NULL THEN
        first_id := rec_id;
      END IF;

    ELSIF op->>'op' = 'delete' THEN
      rec_id := NULLIF(op->>'id', '')::UUID;
      IF rec_id IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'missing_id');
      END IF;
      IF tbl = 'pops' THEN
        RETURN jsonb_build_object('ok', false, 'error', 'table_not_allowed');
      END IF;
      IF has_pop THEN
        EXECUTE format(
          'DELETE FROM %I WHERE id = $1 AND pop_id = $2',
          tbl
        ) USING rec_id, pop;
      ELSE
        EXECUTE format(
          'DELETE FROM %I WHERE id = $1',
          tbl
        ) USING rec_id;
      END IF;
      IF first_id IS NULL THEN
        first_id := rec_id;
      END IF;
    ELSE
      RETURN jsonb_build_object('ok', false, 'error', 'invalid_op');
    END IF;
  END LOOP;

  INSERT INTO public.audit_events (
    pop_id, occurred_at, expires_at, resource, resource_id, action,
    http_method, path, previous_state, new_state,
    requester_user_id, approver_user_id, execution_source, kind
  ) VALUES (
    pop,
    now(),
    now() + INTERVAL '8 months',
    COALESCE(p_audit->>'resource', 'unknown'),
    COALESCE(NULLIF(p_audit->>'resource_id', '')::UUID, first_id),
    COALESCE(p_audit->>'action', 'update'),
    COALESCE(p_audit->>'http_method', 'POST'),
    COALESCE(p_audit->>'path', ''),
    p_audit->'previous_state',
    p_audit->'new_state',
    COALESCE(NULLIF(p_audit->>'requester_user_id', '')::UUID, uid),
    NULLIF(p_audit->>'approver_user_id', '')::UUID,
    src,
    p_kind
  );

  RETURN jsonb_build_object('ok', true, 'id', first_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rootsy_set_approval_code(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rootsy_clear_approval_code(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rootsy_approval_code_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rootsy_verify_approval_code(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rootsy_apply_with_audit(TEXT, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rootsy_wipe_approval_code_for_user(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rootsy_wipe_approval_codes_for_role(UUID, UUID) TO authenticated;

DROP FUNCTION IF EXISTS public.hr_pop_owner_create_pop_role(UUID, TEXT, TEXT[]);
DROP FUNCTION IF EXISTS public.hr_pop_owner_sync_role_permissions(UUID, UUID, TEXT[]);

-- ---------------------------------------------------------------------------
-- HR: can_approve en create/sync + wipe de códigos
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.hr_pop_owner_create_pop_role (
  p_pop_id UUID,
  p_display_name TEXT,
  p_permission_grants TEXT[],
  p_can_approve BOOLEAN DEFAULT FALSE
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
    permission_grants,
    can_approve
  )
  VALUES (
    p_pop_id,
    slug,
    disp,
    NULL,
    FALSE,
    new_grants,
    COALESCE(p_can_approve, FALSE)
  )
  RETURNING * INTO r;

  RETURN jsonb_build_object('ok', true, 'role_id', r.id);
END;
$$;

CREATE OR REPLACE FUNCTION public.hr_pop_owner_sync_role_permissions (
  p_pop_id UUID,
  p_role_id UUID,
  p_permission_grants TEXT[],
  p_can_approve BOOLEAN DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tmpl jsonb;
  bad_cnt INT;
  new_grants JSONB;
  was_approve BOOLEAN;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.pops WHERE id = p_pop_id AND owner_user_id = auth.uid()
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'forbidden');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.roles WHERE id = p_role_id AND pop_id = p_pop_id
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
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

  SELECT can_approve INTO was_approve FROM public.roles WHERE id = p_role_id;

  UPDATE public.roles
  SET permission_grants = new_grants,
      can_approve = COALESCE(p_can_approve, can_approve)
  WHERE id = p_role_id AND pop_id = p_pop_id;

  IF COALESCE(p_can_approve, was_approve) = FALSE THEN
    PERFORM public.rootsy_wipe_approval_codes_for_role(p_pop_id, p_role_id);
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- ---------------------------------------------------------------------------
-- Plantilla administrator: audit:read + hermanas request_approval
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  r RECORD;
  grants JSONB;
  p TEXT;
  verbs TEXT[] := ARRAY['create', 'update', 'delete'];
  resources TEXT[] := ARRAY[
    'articles', 'cash_registers', 'clients', 'expenses', 'hr', 'inventory',
    'invoices', 'menu', 'operations', 'reports', 'statistics', 'alerts',
    'manufacturing', 'chat', 'comandas', 'purchases', 'purchase_orders',
    'payment_methods', 'printers', 'sale', 'quotes', 'mesas', 'mostrador',
    'recipes', 'services', 'service_charges', 'promotions', 'settings',
    'suppliers', 'checks', 'current_accounts', 'accounts'
  ];
  res TEXT;
  verb TEXT;
BEGIN
  FOR r IN
    SELECT id, permission_grants
    FROM public.roles
    WHERE lower(name) IN ('administrator', 'owner', 'administrador', 'dueño', 'dueno')
  LOOP
    grants := COALESCE(r.permission_grants, '[]'::jsonb);
    IF NOT grants @> '"audit:read"'::jsonb THEN
      grants := grants || '"audit:read"'::jsonb;
    END IF;
    FOREACH res IN ARRAY resources
    LOOP
      FOREACH verb IN ARRAY verbs
      LOOP
        p := res || ':' || verb || ':request_approval';
        IF NOT grants @> to_jsonb(p) THEN
          grants := grants || to_jsonb(p);
        END IF;
      END LOOP;
    END LOOP;
    UPDATE public.roles SET permission_grants = grants WHERE id = r.id;
  END LOOP;
END $$;
