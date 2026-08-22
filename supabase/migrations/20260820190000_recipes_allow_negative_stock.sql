-- Permite vender la receta aunque algún ingrediente quede por debajo de cero.
ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS allow_negative_stock BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.recipes.allow_negative_stock IS
  'Si es true, las ventas de esta receta pueden descontar ingredientes por debajo de cero.';
