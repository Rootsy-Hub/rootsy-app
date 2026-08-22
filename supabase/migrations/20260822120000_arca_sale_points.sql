-- Puntos de venta AFIP/ARCA del POP. Sale de cajas: cert + nro viven acá.

CREATE TABLE IF NOT EXISTS public.arca_sale_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  pto_vta INTEGER NOT NULL,
  certificate_expires_at DATE,
  certificate_crt_uploaded_at TIMESTAMPTZ,
  certificate_key_uploaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT arca_sale_points_pto_vta_range
    CHECK (pto_vta >= 1 AND pto_vta <= 99999),
  CONSTRAINT arca_sale_points_pop_pto_unique UNIQUE (pop_id, pto_vta)
);

CREATE INDEX IF NOT EXISTS idx_arca_sale_points_pop_pto
  ON public.arca_sale_points (pop_id, pto_vta);

DROP TRIGGER IF EXISTS arca_sale_points_set_updated_at ON public.arca_sale_points;
CREATE TRIGGER arca_sale_points_set_updated_at
  BEFORE UPDATE ON public.arca_sale_points
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

ALTER TABLE public.arca_sale_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS arca_sale_points_select_pop ON public.arca_sale_points;
CREATE POLICY arca_sale_points_select_pop ON public.arca_sale_points
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS arca_sale_points_insert_pop ON public.arca_sale_points;
CREATE POLICY arca_sale_points_insert_pop ON public.arca_sale_points
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS arca_sale_points_update_pop ON public.arca_sale_points;
CREATE POLICY arca_sale_points_update_pop ON public.arca_sale_points
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS arca_sale_points_delete_pop ON public.arca_sale_points;
CREATE POLICY arca_sale_points_delete_pop ON public.arca_sale_points
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

COMMENT ON TABLE public.arca_sale_points IS
  'Puntos de venta electrónicos ARCA del POP. El certificado vive en storage privado.';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cash_registers'
      AND column_name = 'arca_pto_vta'
  ) THEN
    RETURN;
  END IF;

INSERT INTO public.arca_sale_points (
  pop_id,
  pto_vta,
  certificate_expires_at,
  certificate_crt_uploaded_at,
  certificate_key_uploaded_at
)
SELECT DISTINCT ON (cr.pop_id, cr.arca_pto_vta)
  cr.pop_id,
  cr.arca_pto_vta,
  cr.arca_certificate_expires_at,
  cr.arca_certificate_crt_uploaded_at,
  cr.arca_certificate_key_uploaded_at
FROM public.cash_registers cr
WHERE cr.arca_pto_vta IS NOT NULL
  AND cr.arca_pto_vta >= 1
  AND cr.arca_pto_vta <= 99999
ORDER BY
  cr.pop_id,
  cr.arca_pto_vta,
  (cr.arca_certificate_crt_uploaded_at IS NOT NULL
    AND cr.arca_certificate_key_uploaded_at IS NOT NULL) DESC,
  cr.updated_at DESC NULLS LAST
ON CONFLICT (pop_id, pto_vta) DO UPDATE
SET
  certificate_expires_at = COALESCE(
    public.arca_sale_points.certificate_expires_at,
    EXCLUDED.certificate_expires_at
  ),
  certificate_crt_uploaded_at = COALESCE(
    public.arca_sale_points.certificate_crt_uploaded_at,
    EXCLUDED.certificate_crt_uploaded_at
  ),
  certificate_key_uploaded_at = COALESCE(
    public.arca_sale_points.certificate_key_uploaded_at,
    EXCLUDED.certificate_key_uploaded_at
  );
END $$;

ALTER TABLE public.cash_registers
  DROP COLUMN IF EXISTS arca_pto_vta,
  DROP COLUMN IF EXISTS arca_certificate_secret_name,
  DROP COLUMN IF EXISTS arca_certificate_last_four,
  DROP COLUMN IF EXISTS arca_certificate_expires_at,
  DROP COLUMN IF EXISTS arca_certificate_crt_uploaded_at,
  DROP COLUMN IF EXISTS arca_certificate_key_uploaded_at,
  DROP COLUMN IF EXISTS arca_afip_environment;
