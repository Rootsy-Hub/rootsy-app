import type { SupabaseClient } from "@supabase/supabase-js"

/** Primer medio de pago vinculado (compat. extracto / conciliación). */
export async function getPrimaryPaymentMethodForTreasuryAccount(
  supabase: SupabaseClient,
  popId: string,
  treasuryAccountId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("payment_methods")
    .select("id")
    .eq("pop_id", popId)
    .eq("treasury_account_id", treasuryAccountId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle()
  return data?.id ? String(data.id) : null
}

export async function listPaymentMethodIdsForTreasuryAccount(
  supabase: SupabaseClient,
  popId: string,
  treasuryAccountId: string,
): Promise<string[]> {
  const { data } = await supabase
    .from("payment_methods")
    .select("id")
    .eq("pop_id", popId)
    .eq("treasury_account_id", treasuryAccountId)
  return (data ?? []).map((r) => String(r.id))
}

export async function resolveTreasuryAccountLedgerAccountId(
  supabase: SupabaseClient,
  popId: string,
  treasuryAccountId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("treasury_accounts")
    .select("accounting_chart_account_id")
    .eq("pop_id", popId)
    .eq("id", treasuryAccountId)
    .maybeSingle()
  return data?.accounting_chart_account_id
    ? String(data.accounting_chart_account_id)
    : null
}
