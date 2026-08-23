-- Tesorería: la tabla nació sin RLS. Un cliente con la anon key veía
-- y podía cambiar cuentas de todos los POPs. Mismo candado que el resto.

ALTER TABLE public.treasury_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS treasury_accounts_select_pop ON public.treasury_accounts;
CREATE POLICY treasury_accounts_select_pop ON public.treasury_accounts
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS treasury_accounts_insert_pop ON public.treasury_accounts;
CREATE POLICY treasury_accounts_insert_pop ON public.treasury_accounts
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS treasury_accounts_update_pop ON public.treasury_accounts;
CREATE POLICY treasury_accounts_update_pop ON public.treasury_accounts
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS treasury_accounts_delete_pop ON public.treasury_accounts;
CREATE POLICY treasury_accounts_delete_pop ON public.treasury_accounts
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));
