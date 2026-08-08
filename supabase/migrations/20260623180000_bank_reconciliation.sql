-- Conciliación bancaria Fase 3: extracto + marcas de conciliación

CREATE TABLE IF NOT EXISTS public.bank_statement_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  payment_method_id UUID NOT NULL REFERENCES public.payment_methods (id) ON DELETE CASCADE,
  line_date DATE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'csv')),
  created_by UUID NOT NULL REFERENCES auth.users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bank_statement_lines_pop_pm
  ON public.bank_statement_lines (pop_id, payment_method_id, line_date DESC);

CREATE TABLE IF NOT EXISTS public.treasury_reconciliation_marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  payment_method_id UUID NOT NULL REFERENCES public.payment_methods (id) ON DELETE CASCADE,
  movement_kind TEXT NOT NULL CHECK (
    movement_kind IN ('sale', 'purchase', 'expense', 'funding_out')
  ),
  movement_ref_id TEXT NOT NULL,
  statement_line_id UUID REFERENCES public.bank_statement_lines (id) ON DELETE SET NULL,
  reconciled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reconciled_by UUID NOT NULL REFERENCES auth.users (id),
  CONSTRAINT treasury_reconciliation_marks_unique
    UNIQUE (pop_id, movement_kind, movement_ref_id)
);

CREATE INDEX IF NOT EXISTS idx_treasury_reconciliation_marks_pm
  ON public.treasury_reconciliation_marks (pop_id, payment_method_id);

CREATE INDEX IF NOT EXISTS idx_treasury_reconciliation_marks_statement
  ON public.treasury_reconciliation_marks (statement_line_id)
  WHERE statement_line_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.bank_statement_lines_same_pop_method ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.payment_methods pm
    WHERE pm.id = NEW.payment_method_id AND pm.pop_id = NEW.pop_id
  ) THEN
    RAISE EXCEPTION 'bank_statement_lines: medio de pago inválido para este POP';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bank_statement_lines_same_pop_method ON public.bank_statement_lines;
CREATE TRIGGER bank_statement_lines_same_pop_method
  BEFORE INSERT OR UPDATE OF pop_id, payment_method_id
  ON public.bank_statement_lines
  FOR EACH ROW
  EXECUTE FUNCTION public.bank_statement_lines_same_pop_method ();

ALTER TABLE public.bank_statement_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treasury_reconciliation_marks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bank_statement_lines_pop_member ON public.bank_statement_lines;
CREATE POLICY bank_statement_lines_pop_member
  ON public.bank_statement_lines
  FOR ALL
  USING (public.user_is_member_of_active_pop (pop_id))
  WITH CHECK (public.user_is_member_of_active_pop (pop_id));

DROP POLICY IF EXISTS treasury_reconciliation_marks_pop_member ON public.treasury_reconciliation_marks;
CREATE POLICY treasury_reconciliation_marks_pop_member
  ON public.treasury_reconciliation_marks
  FOR ALL
  USING (public.user_is_member_of_active_pop (pop_id))
  WITH CHECK (public.user_is_member_of_active_pop (pop_id));

COMMENT ON TABLE public.bank_statement_lines IS
  'Líneas de extracto bancario importadas o cargadas a mano para conciliación.';

COMMENT ON TABLE public.treasury_reconciliation_marks IS
  'Marca de conciliación de un movimiento interno con opcional vínculo a línea de extracto.';
