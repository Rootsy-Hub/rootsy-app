-- Datos fiscales y estado en proveedores (paridad con clientes).
ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS iva_condition TEXT,
  ADD COLUMN IF NOT EXISTS address_line TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN public.suppliers.iva_condition IS
  'Condición IVA AFIP del proveedor (mismos valores que clients.iva_condition).';

COMMENT ON COLUMN public.suppliers.address_line IS
  'Domicilio fiscal o comercial del proveedor.';

COMMENT ON COLUMN public.suppliers.is_active IS
  'Si false, el proveedor puede ocultarse con el filtro «Solo activos».';
