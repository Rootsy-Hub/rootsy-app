-- Caja registradora: cuenta de efectivo destino para cobros en efectivo del turno.

ALTER TABLE public.cash_registers
  ADD COLUMN IF NOT EXISTS cash_treasury_account_id UUID
  REFERENCES public.treasury_accounts (id) ON DELETE RESTRICT;

-- Backfill: primera cuenta de efectivo activa del POP.
UPDATE public.cash_registers cr
SET cash_treasury_account_id = sub.id
FROM (
  SELECT DISTINCT ON (ta.pop_id)
    ta.pop_id,
    ta.id
  FROM public.treasury_accounts ta
  WHERE ta.kind = 'cash'
    AND ta.is_active = TRUE
  ORDER BY ta.pop_id, ta.sort_order ASC, ta.name ASC
) sub
WHERE cr.pop_id = sub.pop_id
  AND cr.cash_treasury_account_id IS NULL;

CREATE OR REPLACE FUNCTION public.validate_cash_register_treasury_pop ()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.cash_treasury_account_id IS NULL THEN
    RETURN NEW;
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM public.treasury_accounts ta
    WHERE ta.id = NEW.cash_treasury_account_id
      AND ta.pop_id = NEW.pop_id
      AND ta.kind = 'cash'
      AND ta.is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'cash_treasury_account_id must be an active cash treasury account for this POP';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cash_registers_treasury_pop ON public.cash_registers;
CREATE TRIGGER cash_registers_treasury_pop
  BEFORE INSERT OR UPDATE OF cash_treasury_account_id, pop_id
  ON public.cash_registers
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_cash_register_treasury_pop ();
