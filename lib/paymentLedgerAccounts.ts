import {
  CHART_CAJA_EFECTIVO_CODES,
  CHART_TARJETAS_CREDITO_A_PAGAR_CODES,
  CHART_TARJETAS_COBRAR_CODES,
} from "@/lib/argV3DefaultChartAccounts"
import type { SupabaseClient } from "@supabase/supabase-js"

export type PaymentLedgerContext = "receive" | "pay"

const RECEIVE_KIND_FALLBACK: Record<string, readonly string[]> = {
  cash: CHART_CAJA_EFECTIVO_CODES,
  transfer: ["1.1.1.02"],
  card_debit: CHART_TARJETAS_COBRAR_CODES,
  card_credit: CHART_TARJETAS_COBRAR_CODES,
  other: ["1.1.1.04", "1.1.1.01"],
}

const PAY_KIND_FALLBACK: Record<string, readonly string[]> = {
  cash: CHART_CAJA_EFECTIVO_CODES,
  transfer: ["1.1.1.02"],
  card_debit: ["1.1.1.02"],
  card_credit: CHART_TARJETAS_CREDITO_A_PAGAR_CODES,
  other: ["1.1.1.04", "1.1.1.01"],
}

async function resolveAccountId(
  supabase: SupabaseClient,
  popId: string,
  codes: readonly string[],
): Promise<string | null> {
  for (const code of codes) {
    const { data: row } = await supabase
      .from("accounting_chart_of_accounts")
      .select("id")
      .eq("pop_id", popId)
      .eq("code", code)
      .maybeSingle()
    if (row?.id) return String(row.id)
  }
  return null
}

export async function resolvePaymentMethodLedgerAccount(
  supabase: SupabaseClient,
  popId: string,
  paymentMethodId: string | null | undefined,
  context: PaymentLedgerContext,
): Promise<string | null> {
  const pmId = paymentMethodId?.trim() || ""
  if (!pmId) {
    const fallback = PAY_KIND_FALLBACK.other
    return resolveAccountId(supabase, popId, fallback)
  }

  const { data: pmRow } = await supabase
    .from("payment_methods")
    .select("id, kind, usage, accounting_account_id")
    .eq("id", pmId)
    .eq("pop_id", popId)
    .maybeSingle()

  if (!pmRow?.id) return null

  if (pmRow.accounting_account_id) {
    return String(pmRow.accounting_account_id)
  }

  const pmKind = String(pmRow.kind ?? "other")
  const map = context === "receive" ? RECEIVE_KIND_FALLBACK : PAY_KIND_FALLBACK
  return resolveAccountId(supabase, popId, map[pmKind] ?? map.other)
}

export async function resolveDefaultLedgerAccountForMethod(
  supabase: SupabaseClient,
  popId: string,
  kind: string,
  usage: string,
): Promise<{ id: string } | { error: string }> {
  const context: PaymentLedgerContext =
    usage === "receive" ? "receive" : usage === "pay" ? "pay" : "pay"
  const fakePmKind = kind
  const codes =
    (context === "receive" ? RECEIVE_KIND_FALLBACK : PAY_KIND_FALLBACK)[
      fakePmKind
    ] ??
    (context === "receive" ? RECEIVE_KIND_FALLBACK : PAY_KIND_FALLBACK).other
  const id = await resolveAccountId(supabase, popId, codes)
  if (!id) {
    return {
      error:
        "No hay cuenta predeterminada para este tipo en el plan de cuentas.",
    }
  }
  return { id }
}
