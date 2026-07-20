-- Mesas Fase 1: salones, layout de mesas, elementos del plano, permisos y rol Mozos.
-- RLS: user_is_member_of_active_pop(pop_id).

-- ---------------------------------------------------------------------------
-- Salones
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.dining_salons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT dining_salons_name_nonempty CHECK (char_length(trim(name)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS dining_salons_pop_name_active_idx
  ON public.dining_salons (pop_id, lower(trim(name)))
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_dining_salons_pop_active
  ON public.dining_salons (pop_id, is_active, sort_order)
  WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- Mesas: layout en plano
-- ---------------------------------------------------------------------------

ALTER TABLE public.dining_tables
  ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES public.dining_salons (id) ON DELETE RESTRICT;

ALTER TABLE public.dining_tables
  ADD COLUMN IF NOT EXISTS label TEXT;

ALTER TABLE public.dining_tables
  ADD COLUMN IF NOT EXISTS pos_x INTEGER NOT NULL DEFAULT 48;

ALTER TABLE public.dining_tables
  ADD COLUMN IF NOT EXISTS pos_y INTEGER NOT NULL DEFAULT 48;

ALTER TABLE public.dining_tables
  ADD COLUMN IF NOT EXISTS shape JSONB NOT NULL DEFAULT '{"kind":"round","size":"m"}'::jsonb;

UPDATE public.dining_tables
SET label = trim(name)
WHERE label IS NULL OR trim(label) = '';

CREATE UNIQUE INDEX IF NOT EXISTS dining_tables_salon_label_active_idx
  ON public.dining_tables (salon_id, lower(trim(label)))
  WHERE deleted_at IS NULL AND salon_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_dining_tables_salon_active
  ON public.dining_tables (salon_id, sort_order)
  WHERE deleted_at IS NULL AND salon_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Elementos del plano (paredes, barra, ingreso, etc.)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.dining_floor_decors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES public.dining_salons (id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  pos_x INTEGER NOT NULL DEFAULT 48,
  pos_y INTEGER NOT NULL DEFAULT 48,
  width INTEGER NOT NULL CHECK (width > 0),
  height INTEGER NOT NULL CHECK (height > 0),
  label TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT dining_floor_decors_kind_check
    CHECK (
      kind IN (
        'wall_h',
        'wall_v',
        'plant',
        'planter',
        'pillar',
        'bar',
        'entrance'
      )
    )
);

CREATE INDEX IF NOT EXISTS idx_dining_floor_decors_salon_active
  ON public.dining_floor_decors (salon_id, sort_order)
  WHERE deleted_at IS NULL;

CREATE OR REPLACE FUNCTION public.dining_floor_decors_same_pop_as_salon ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  p UUID;
BEGIN
  SELECT pop_id INTO p FROM public.dining_salons WHERE id = NEW.salon_id;
  IF p IS NULL THEN
    RAISE EXCEPTION 'dining_floor_decors: salón inexistente';
  END IF;
  IF p <> NEW.pop_id THEN
    RAISE EXCEPTION 'dining_floor_decors: pop_id debe coincidir con el salón';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS dining_floor_decors_same_pop_as_salon ON public.dining_floor_decors;
CREATE TRIGGER dining_floor_decors_same_pop_as_salon
  BEFORE INSERT OR UPDATE OF pop_id, salon_id
  ON public.dining_floor_decors
  FOR EACH ROW
  EXECUTE FUNCTION public.dining_floor_decors_same_pop_as_salon ();

CREATE OR REPLACE FUNCTION public.dining_tables_same_pop_as_salon ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  p UUID;
BEGIN
  IF NEW.salon_id IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT pop_id INTO p FROM public.dining_salons WHERE id = NEW.salon_id;
  IF p IS NULL THEN
    RAISE EXCEPTION 'dining_tables: salón inexistente';
  END IF;
  IF p <> NEW.pop_id THEN
    RAISE EXCEPTION 'dining_tables: pop_id debe coincidir con el salón';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS dining_tables_same_pop_as_salon ON public.dining_tables;
CREATE TRIGGER dining_tables_same_pop_as_salon
  BEFORE INSERT OR UPDATE OF pop_id, salon_id
  ON public.dining_tables
  FOR EACH ROW
  EXECUTE FUNCTION public.dining_tables_same_pop_as_salon ();

-- ---------------------------------------------------------------------------
-- Permisos mesas (catálogo global, si existe la tabla)
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF to_regclass('public.permissions') IS NOT NULL THEN
    INSERT INTO public.permissions (resource, action, description)
    VALUES
      ('mesas', 'read', 'Ver mesas y plano del salón'),
      ('mesas', 'create', 'Cargar pedidos en mesas'),
      ('mesas', 'update', 'Editar plano, mesas y pedidos cargados'),
      ('mesas', 'delete', 'Cancelar sesiones y reservas de mesas')
    ON CONFLICT DO NOTHING;
  END IF;
EXCEPTION
  WHEN undefined_column THEN
    NULL;
  WHEN unique_violation THEN
    NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Rol template "Mozos" por POP (sin usuarios asignados)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.ensure_pop_mesas_mozos_role (p_pop_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_pop_id IS NULL THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.roles r
    WHERE r.pop_id = p_pop_id
      AND r.name = 'mozos'
  ) THEN
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
      'mozos',
      'Mozos',
      'Carga de pedidos en mesas (sin editar plano ni modificar pedidos ajenos).',
      FALSE,
      '["mesas:read", "mesas:create"]'::jsonb
    );
  END IF;
END;
$$;

DO $$
DECLARE
  pid UUID;
BEGIN
  FOR pid IN SELECT id FROM public.pops
  LOOP
    PERFORM public.ensure_pop_mesas_mozos_role(pid);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.pops_after_insert_mesas_mozos_role ()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.ensure_pop_mesas_mozos_role(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pops_after_insert_mesas_mozos_role ON public.pops;
CREATE TRIGGER pops_after_insert_mesas_mozos_role
  AFTER INSERT ON public.pops
  FOR EACH ROW
  EXECUTE FUNCTION public.pops_after_insert_mesas_mozos_role ();

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS dining_salons_set_updated_at ON public.dining_salons;
CREATE TRIGGER dining_salons_set_updated_at
  BEFORE UPDATE ON public.dining_salons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

DROP TRIGGER IF EXISTS dining_floor_decors_set_updated_at ON public.dining_floor_decors;
CREATE TRIGGER dining_floor_decors_set_updated_at
  BEFORE UPDATE ON public.dining_floor_decors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  t TEXT;
  tables text[] := ARRAY[
    'dining_salons',
    'dining_floor_decors'
  ];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    EXECUTE format(
      'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;
       DROP POLICY IF EXISTS %I ON public.%I;
       CREATE POLICY %I ON public.%I FOR SELECT TO authenticated
         USING (public.user_is_member_of_active_pop(pop_id));
       DROP POLICY IF EXISTS %I ON public.%I;
       CREATE POLICY %I ON public.%I FOR INSERT TO authenticated
         WITH CHECK (public.user_is_member_of_active_pop(pop_id));
       DROP POLICY IF EXISTS %I ON public.%I;
       CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated
         USING (public.user_is_member_of_active_pop(pop_id))
         WITH CHECK (public.user_is_member_of_active_pop(pop_id));
       DROP POLICY IF EXISTS %I ON public.%I;
       CREATE POLICY %I ON public.%I FOR DELETE TO authenticated
         USING (public.user_is_member_of_active_pop(pop_id));',
      t,
      t || '_select_pop', t, t || '_select_pop', t,
      t || '_insert_pop', t, t || '_insert_pop', t,
      t || '_update_pop', t, t || '_update_pop', t,
      t || '_delete_pop', t, t || '_delete_pop', t
    );
  END LOOP;
END $$;

COMMENT ON TABLE public.dining_salons IS
  'Salones o sectores del local para el plano de mesas.';

COMMENT ON TABLE public.dining_floor_decors IS
  'Elementos fijos del plano (paredes, barra, ingreso). label es texto libre visible en UI.';

COMMENT ON COLUMN public.dining_tables.label IS
  'Número o código visible de la mesa (ej. 6, P1).';

COMMENT ON COLUMN public.dining_tables.shape IS
  'Forma en plano: {"kind":"round|square|rect","size":"s|m|l|..."}.';

COMMENT ON COLUMN public.dining_floor_decors.label IS
  'Texto libre (ej. Salida emergencia, Barra tragos, Entrada principal).';
