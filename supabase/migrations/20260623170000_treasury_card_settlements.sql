-- Tesorería Fase 2: liquidación de tarjetas corporativas + cuenta pasivo

INSERT INTO public.accounting_chart_of_accounts (
  pop_id,
  code,
  name,
  account_type,
  nature,
  level,
  is_movement_account,
  parent_id,
  metadata
)
SELECT
  p.id,
  '2.1.1.03',
  'Tarjetas de crédito a pagar',
  'pasivo_corriente',
  'acreedora',
  4,
  true,
  NULL,
  '{"seed":"treasury_phase2"}'::jsonb
FROM public.pops p
WHERE NOT EXISTS (
  SELECT 1
  FROM public.accounting_chart_of_accounts a
  WHERE a.pop_id = p.id
    AND a.code = '2.1.1.03'
);

CREATE TABLE IF NOT EXISTS public.treasury_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  card_payment_method_id UUID NOT NULL REFERENCES public.payment_methods (id) ON DELETE RESTRICT,
  funding_payment_method_id UUID REFERENCES public.payment_methods (id) ON DELETE SET NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  settled_at DATE NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  accounting_entry_id UUID REFERENCES public.accounting_entries (id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_treasury_settlements_pop_card
  ON public.treasury_settlements (pop_id, card_payment_method_id, settled_at DESC);

CREATE INDEX IF NOT EXISTS idx_treasury_settlements_pop_date
  ON public.treasury_settlements (pop_id, settled_at DESC);

CREATE OR REPLACE FUNCTION public.treasury_settlements_same_pop_methods ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.payment_methods pm
    WHERE pm.id = NEW.card_payment_method_id AND pm.pop_id = NEW.pop_id
  ) THEN
    RAISE EXCEPTION 'treasury_settlements: tarjeta inválida para este POP';
  END IF;
  IF NEW.funding_payment_method_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.payment_methods pm
    WHERE pm.id = NEW.funding_payment_method_id AND pm.pop_id = NEW.pop_id
  ) THEN
    RAISE EXCEPTION 'treasury_settlements: medio de fondeo inválido para este POP';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS treasury_settlements_same_pop_methods ON public.treasury_settlements;
CREATE TRIGGER treasury_settlements_same_pop_methods
  BEFORE INSERT OR UPDATE OF pop_id, card_payment_method_id, funding_payment_method_id
  ON public.treasury_settlements
  FOR EACH ROW
  EXECUTE FUNCTION public.treasury_settlements_same_pop_methods ();

ALTER TABLE public.treasury_settlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS treasury_settlements_pop_member ON public.treasury_settlements;
CREATE POLICY treasury_settlements_pop_member
  ON public.treasury_settlements
  FOR ALL
  USING (public.user_is_member_of_active_pop (pop_id))
  WITH CHECK (public.user_is_member_of_active_pop (pop_id));

COMMENT ON TABLE public.treasury_settlements IS
  'Pago de resumen / liquidación de tarjeta corporativa (Debe tarjetas a pagar / Haber banco).';
