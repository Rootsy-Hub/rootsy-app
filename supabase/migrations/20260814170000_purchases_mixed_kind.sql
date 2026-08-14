-- Compras mixtas: purchase_kind puede ser "mixed".

ALTER TABLE public.purchases
  DROP CONSTRAINT IF EXISTS purchases_purchase_kind_check;

ALTER TABLE public.purchases
  ADD CONSTRAINT purchases_purchase_kind_check
  CHECK (purchase_kind IN ('merchandise', 'raw_material', 'supply', 'mixed'));

COMMENT ON COLUMN public.purchases.purchase_kind IS
  'merchandise | raw_material | supply | mixed (varios tipos de ítem en la misma compra).';
