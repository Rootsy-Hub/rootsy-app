-- Catálogo de servicios: campos de facturación/contrato + permisos CRUD

ALTER TABLE public.service_types
  ADD COLUMN IF NOT EXISTS billing_period text NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS billing_period_label text,
  ADD COLUMN IF NOT EXISTS service_details jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS contract_sections jsonb NOT NULL DEFAULT '[]'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'service_types_billing_period_check'
  ) THEN
    ALTER TABLE public.service_types
      ADD CONSTRAINT service_types_billing_period_check
      CHECK (billing_period IN ('none', 'weekly', 'monthly', 'yearly', 'custom'));
  END IF;
END $$;

COMMENT ON COLUMN public.service_types.billing_period IS
  'Periodicidad de cobro del tipo de servicio (catálogo).';

COMMENT ON COLUMN public.service_types.service_details IS
  'Detalles personalizables del servicio: [{ "label", "value" }].';

COMMENT ON COLUMN public.service_types.contract_sections IS
  'Secciones del contrato/plantilla: [{ "title", "body" }].';

-- Permisos services en roles owner/administrator
DO $$
DECLARE
  r RECORD;
  grants JSONB;
  new_perms JSONB := '["services:read","services:create","services:update","services:delete"]'::jsonb;
  p TEXT;
BEGIN
  FOR r IN
    SELECT id, permission_grants
    FROM public.roles
    WHERE lower(name) IN ('administrator', 'owner', 'administrador', 'dueño', 'dueno')
  LOOP
    grants := COALESCE(r.permission_grants, '[]'::jsonb);
    FOR p IN SELECT jsonb_array_elements_text(new_perms)
    LOOP
      IF NOT grants @> to_jsonb(p) THEN
        grants := grants || to_jsonb(p);
      END IF;
    END LOOP;
    UPDATE public.roles SET permission_grants = grants WHERE id = r.id;
  END LOOP;
END $$;

-- Módulo Servicios en catálogo JSON de rubros (backoffice / consistencia)
UPDATE public._business_types
SET modules = jsonb_set(
  modules,
  '{shared,operar}',
  (modules->'shared'->'operar') || '[{"key":"services","label":"Servicios"}]'::jsonb
)
WHERE NOT COALESCE(modules->'shared'->'operar', '[]'::jsonb) @> '[{"key":"services"}]'::jsonb;
