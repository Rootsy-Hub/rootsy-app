-- Conexión OAuth del POP a su cuenta vendedor de Mercado Pago.
-- Cuelga de la billetera de tesorería (no es una subcuenta).
-- Los tokens van en un secreto aparte, en el corte de OAuth.

CREATE TABLE IF NOT EXISTS public.pop_mercadopago_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  treasury_account_id UUID NOT NULL
    REFERENCES public.treasury_accounts (id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'disconnected',
  mp_user_id TEXT,
  mp_email TEXT,
  connected_at TIMESTAMPTZ,
  disconnected_at TIMESTAMPTZ,
  last_error TEXT,
  created_by UUID REFERENCES auth.users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pop_mercadopago_connections_status_check
    CHECK (status IN ('disconnected', 'connected', 'expired')),
  CONSTRAINT pop_mercadopago_connections_treasury_unique
    UNIQUE (treasury_account_id)
);

CREATE INDEX IF NOT EXISTS idx_pop_mp_connections_pop
  ON public.pop_mercadopago_connections (pop_id, status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pop_mp_connections_user_connected
  ON public.pop_mercadopago_connections (pop_id, mp_user_id)
  WHERE status = 'connected' AND mp_user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.pop_mercadopago_connections_validate_account()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  ta RECORD;
BEGIN
  SELECT pop_id, kind
  INTO ta
  FROM public.treasury_accounts
  WHERE id = NEW.treasury_account_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'pop_mercadopago_connections: cuenta de tesorería inexistente';
  END IF;
  IF ta.pop_id IS DISTINCT FROM NEW.pop_id THEN
    RAISE EXCEPTION 'pop_mercadopago_connections: la cuenta no pertenece a este POP';
  END IF;
  IF ta.kind IS DISTINCT FROM 'wallet' THEN
    RAISE EXCEPTION 'pop_mercadopago_connections: solo se conecta una billetera';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pop_mercadopago_connections_validate_account
  ON public.pop_mercadopago_connections;
CREATE TRIGGER pop_mercadopago_connections_validate_account
  BEFORE INSERT OR UPDATE OF pop_id, treasury_account_id
  ON public.pop_mercadopago_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.pop_mercadopago_connections_validate_account();

DROP TRIGGER IF EXISTS pop_mercadopago_connections_set_updated_at
  ON public.pop_mercadopago_connections;
CREATE TRIGGER pop_mercadopago_connections_set_updated_at
  BEFORE UPDATE ON public.pop_mercadopago_connections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.pop_mercadopago_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pop_mercadopago_connections_select_pop
  ON public.pop_mercadopago_connections;
CREATE POLICY pop_mercadopago_connections_select_pop
  ON public.pop_mercadopago_connections
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS pop_mercadopago_connections_insert_pop
  ON public.pop_mercadopago_connections;
CREATE POLICY pop_mercadopago_connections_insert_pop
  ON public.pop_mercadopago_connections
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS pop_mercadopago_connections_update_pop
  ON public.pop_mercadopago_connections;
CREATE POLICY pop_mercadopago_connections_update_pop
  ON public.pop_mercadopago_connections
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS pop_mercadopago_connections_delete_pop
  ON public.pop_mercadopago_connections;
CREATE POLICY pop_mercadopago_connections_delete_pop
  ON public.pop_mercadopago_connections
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

COMMENT ON TABLE public.pop_mercadopago_connections IS
  'Estado de la conexión OAuth del POP con su cuenta vendedor de Mercado Pago. Cuelga de la billetera de tesorería.';
