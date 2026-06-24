import {
  CHART_TARJETAS_CREDITO_A_PAGAR_CODES,
} from "@/lib/argV3DefaultChartAccounts"
import { resolvePaymentMethodLedgerAccount } from "@/lib/paymentLedgerAccounts"
import type { SupabaseClient } from "@supabase/supabase-js"

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
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

async function nextEntryNumber(
  supabase: SupabaseClient,
  popId: string,
): Promise<number> {
  const { data: maxRow } = await supabase
    .from("accounting_entries")
    .select("entry_number")
    .eq("pop_id", popId)
    .order("entry_number", { ascending: false })
    .limit(1)
    .maybeSingle()
  return maxRow?.entry_number != null && Number.isFinite(Number(maxRow.entry_number))
    ? Number(maxRow.entry_number) + 1
    : 1
}

export async function postTreasurySettlementLedger(
  supabase: SupabaseClient,
  args: {
    popId: string
    userId: string
    settlementId: string
  },
): Promise<{ success: true } | { success: false; error: string }> {
  const { popId, userId, settlementId } = args

  const { data: row, error: rowErr } = await supabase
    .from("treasury_settlements")
    .select(
      "id, amount, settled_at, notes, card_payment_method_id, funding_payment_method_id, accounting_entry_id",
    )
    .eq("id", settlementId)
    .eq("pop_id", popId)
    .maybeSingle()

  if (rowErr || !row) {
    return { success: false, error: "Liquidación de tesorería no encontrada." }
  }
  if (row.accounting_entry_id) {
    return { success: true }
  }

  const amt = roundMoney(Number(row.amount))
  if (!(amt > 0)) {
    return { success: false, error: "Importe de liquidación inválido." }
  }

  const entryDate = String(row.settled_at ?? "").slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entryDate)) {
    return { success: false, error: "Fecha de liquidación inválida." }
  }

  const { data: cardPm } = await supabase
    .from("payment_methods")
    .select("name")
    .eq("id", String(row.card_payment_method_id))
    .eq("pop_id", popId)
    .maybeSingle()
  const cardLabel = String(cardPm?.name ?? "Tarjeta").trim()
  const entryDescription = `Pago resumen tarjeta — ${cardLabel}`

  let liabilityAccountId = await resolvePaymentMethodLedgerAccount(
    supabase,
    popId,
    String(row.card_payment_method_id),
    "pay",
  )
  if (!liabilityAccountId) {
    liabilityAccountId = await resolveAccountId(
      supabase,
      popId,
      CHART_TARJETAS_CREDITO_A_PAGAR_CODES,
    )
  }
  if (!liabilityAccountId) {
    return {
      success: false,
      error: "No hay cuenta Tarjetas de crédito a pagar en el plan de cuentas.",
    }
  }

  const fundingPmId =
    row.funding_payment_method_id != null
      ? String(row.funding_payment_method_id)
      : null
  const bankAccountId = await resolvePaymentMethodLedgerAccount(
    supabase,
    popId,
    fundingPmId,
    "pay",
  )
  if (!bankAccountId) {
    return {
      success: false,
      error:
        "Configurá una cuenta bancaria en el medio de pago usado para pagar el resumen.",
    }
  }

  const nextNum = await nextEntryNumber(supabase, popId)
  const { data: entIns, error: entErr } = await supabase
    .from("accounting_entries")
    .insert({
      pop_id: popId,
      entry_number: nextNum,
      entry_date: entryDate,
      source_type: "treasury_settlement",
      source_id: settlementId,
      description: entryDescription,
      status: "draft",
      created_by: userId,
    })
    .select("id")
    .single()

  if (entErr || !entIns?.id) {
    return { success: false, error: entErr?.message || "No se pudo crear el asiento." }
  }
  const entryId = String(entIns.id)

  const { error: linesErr } = await supabase.from("accounting_entry_lines").insert([
    {
      entry_id: entryId,
      account_id: liabilityAccountId,
      debit_amount: amt,
      credit_amount: 0,
      description: entryDescription,
      line_order: 1,
    },
    {
      entry_id: entryId,
      account_id: bankAccountId,
      debit_amount: 0,
      credit_amount: amt,
      description: entryDescription,
      line_order: 2,
    },
  ])
  if (linesErr) {
    await supabase
      .from("accounting_entries")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", entryId)
    return { success: false, error: linesErr.message || "No se pudieron crear las líneas." }
  }

  const { error: postErr } = await supabase
    .from("accounting_entries")
    .update({
      status: "posted",
      posted_at: new Date().toISOString(),
      posted_by: userId,
    })
    .eq("id", entryId)
  if (postErr) {
    await supabase
      .from("accounting_entries")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", entryId)
    return { success: false, error: postErr.message || "No se pudo registrar el asiento." }
  }

  const { error: linkErr } = await supabase
    .from("treasury_settlements")
    .update({ accounting_entry_id: entryId })
    .eq("id", settlementId)
    .eq("pop_id", popId)
  if (linkErr) {
    return {
      success: false,
      error:
        linkErr.message ||
        "El asiento quedó registrado pero no se pudo vincular a la liquidación.",
    }
  }

  return { success: true }
}
