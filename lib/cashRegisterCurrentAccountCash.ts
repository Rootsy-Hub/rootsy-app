import type { SupabaseClient } from "@supabase/supabase-js"

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

function parseAmount(value: unknown): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return roundMoney(n)
}

/** Efectivo de C/C imputado al turno: entra (cliente) o sale (proveedor). */
export async function loadSessionCurrentAccountCash(
  supabase: SupabaseClient,
  popId: string,
  sessionId: string,
): Promise<{ inbound: number; outbound: number }> {
  const { data } = await supabase
    .from("current_account_receipts")
    .select("direction, amount, payment_kind")
    .eq("pop_id", popId)
    .eq("cash_register_session_id", sessionId)
    .eq("payment_kind", "cash")

  let inbound = 0
  let outbound = 0
  for (const row of data ?? []) {
    const amount = parseAmount(row.amount)
    if (!(amount > 0)) continue
    if (String(row.direction) === "payable") outbound += amount
    else inbound += amount
  }
  return {
    inbound: roundMoney(inbound),
    outbound: roundMoney(outbound),
  }
}
