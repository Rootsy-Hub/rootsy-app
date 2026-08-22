-- Cada caja elige un punto de venta fiscal creado en Facturas.

ALTER TABLE public.cash_registers
  ADD COLUMN IF NOT EXISTS arca_sale_point_id UUID
    REFERENCES public.arca_sale_points (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_cash_registers_arca_sale_point
  ON public.cash_registers (arca_sale_point_id);

COMMENT ON COLUMN public.cash_registers.arca_sale_point_id IS
  'Punto de venta ARCA usado al emitir con esta caja. Viene de arca_sale_points.';

-- Si el POP tiene un solo PDV, se lo asignamos a sus cajas.
UPDATE public.cash_registers AS cr
SET arca_sale_point_id = sp.id
FROM public.arca_sale_points AS sp
WHERE cr.pop_id = sp.pop_id
  AND cr.arca_sale_point_id IS NULL
  AND (
    SELECT count(*)
    FROM public.arca_sale_points AS only_sp
    WHERE only_sp.pop_id = cr.pop_id
  ) = 1;
