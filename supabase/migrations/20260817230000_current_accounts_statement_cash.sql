-- Extracto operable: vencimiento en ventas y cobro/pago C/C en la caja abierta.

ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS due_date DATE;

UPDATE public.sales
SET due_date = (timezone('UTC', sold_at))::date
WHERE due_date IS NULL;

UPDATE public.sales
SET due_date = due_date + 30
WHERE on_account = TRUE
  AND due_date IS NOT NULL;

COMMENT ON COLUMN public.sales.due_date IS
  'Vencimiento de la venta. En ventas a cuenta el alta usa 30 días si no se indica otra fecha.';

ALTER TABLE public.current_account_receipts
  ADD COLUMN IF NOT EXISTS cash_register_session_id UUID
    REFERENCES public.cash_register_sessions (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_ca_receipts_cash_session
  ON public.current_account_receipts (cash_register_session_id)
  WHERE cash_register_session_id IS NOT NULL;

COMMENT ON COLUMN public.current_account_receipts.cash_register_session_id IS
  'Turno de caja al que entra un cobro o pago en efectivo desde cuenta corriente.';
