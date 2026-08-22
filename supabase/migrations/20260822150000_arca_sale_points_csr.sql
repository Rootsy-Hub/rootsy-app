ALTER TABLE public.arca_sale_points
  ADD COLUMN IF NOT EXISTS certificate_csr_uploaded_at TIMESTAMPTZ;

COMMENT ON COLUMN public.arca_sale_points.certificate_csr_uploaded_at IS
  'Pedido CSR generado por Rootsy. La clave privada no se expone al usuario.';
