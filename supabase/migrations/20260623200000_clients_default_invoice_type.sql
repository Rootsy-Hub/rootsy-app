-- Comprobante por defecto al facturar a este cliente (label de saleInvoiceTypes / picker POS).
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS default_invoice_type_label TEXT;

COMMENT ON COLUMN clients.default_invoice_type_label IS
  'Etiqueta del tipo de comprobante sugerido en ventas (ej. Factura B). NULL = derivar de iva_condition.';
