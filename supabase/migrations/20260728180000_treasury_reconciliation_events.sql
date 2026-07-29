-- Eventos de conciliación tesorería: comisiones/impuestos y acreditaciones POS persistentes.

ALTER TABLE public.treasury_settlements
  ADD COLUMN IF NOT EXISTS principal_amount NUMERIC(15, 2),
  ADD COLUMN IF NOT EXISTS adjustment_amount NUMERIC(15, 2) NOT NULL DEFAULT 0;

UPDATE public.treasury_settlements
SET principal_amount = amount
WHERE principal_amount IS NULL;

ALTER TABLE public.treasury_settlements
  ALTER COLUMN principal_amount SET NOT NULL;

ALTER TABLE public.treasury_settlements
  DROP CONSTRAINT IF EXISTS treasury_settlements_adjustment_amount_nonneg;

ALTER TABLE public.treasury_settlements
  ADD CONSTRAINT treasury_settlements_adjustment_amount_nonneg
  CHECK (adjustment_amount >= 0);

COMMENT ON COLUMN public.treasury_settlements.principal_amount IS
  'Importe aplicado al pasivo de tarjeta (Debe tarjetas a pagar).';
COMMENT ON COLUMN public.treasury_settlements.adjustment_amount IS
  'Comisiones, intereses e impuestos adicionales (Debe gastos / Haber banco).';

CREATE TABLE IF NOT EXISTS public.treasury_pos_acreditations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  pos_treasury_account_id UUID NOT NULL REFERENCES public.treasury_accounts (id) ON DELETE RESTRICT,
  mother_treasury_account_id UUID NOT NULL REFERENCES public.treasury_accounts (id) ON DELETE RESTRICT,
  principal_amount NUMERIC(15, 2) NOT NULL CHECK (principal_amount > 0),
  adjustment_amount NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (adjustment_amount >= 0),
  credited_at DATE NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  accounting_entry_id UUID REFERENCES public.accounting_entries (id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_treasury_pos_acreditations_pop_mother
  ON public.treasury_pos_acreditations (pop_id, mother_treasury_account_id, credited_at DESC);

CREATE INDEX IF NOT EXISTS idx_treasury_pos_acreditations_pop_pos
  ON public.treasury_pos_acreditations (pop_id, pos_treasury_account_id, credited_at DESC);

ALTER TABLE public.treasury_pos_acreditations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS treasury_pos_acreditations_pop_member ON public.treasury_pos_acreditations;
CREATE POLICY treasury_pos_acreditations_pop_member
  ON public.treasury_pos_acreditations
  FOR ALL
  USING (public.user_is_member_of_active_pop (pop_id))
  WITH CHECK (public.user_is_member_of_active_pop (pop_id));

COMMENT ON TABLE public.treasury_pos_acreditations IS
  'Liquidación de cobros POS hacia cuenta madre (Debe banco / Debe gastos / Haber POS).';
