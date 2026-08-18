-- Secretos OAuth de la conexión MP del POP.
-- Sin policies para authenticated: solo service role.

CREATE TABLE IF NOT EXISTS public.pop_mercadopago_connection_secrets (
  connection_id UUID PRIMARY KEY
    REFERENCES public.pop_mercadopago_connections (id) ON DELETE CASCADE,
  access_token_cipher TEXT NOT NULL,
  refresh_token_cipher TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  mp_public_key TEXT,
  scopes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS pop_mercadopago_connection_secrets_set_updated_at
  ON public.pop_mercadopago_connection_secrets;
CREATE TRIGGER pop_mercadopago_connection_secrets_set_updated_at
  BEFORE UPDATE ON public.pop_mercadopago_connection_secrets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.pop_mercadopago_connection_secrets ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.pop_mercadopago_connection_secrets FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.pop_mercadopago_connection_secrets TO service_role;

COMMENT ON TABLE public.pop_mercadopago_connection_secrets IS
  'Access/refresh token cifrados de la conexión Mercado Pago del POP. No se exponen al cliente.';
