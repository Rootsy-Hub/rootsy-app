import { CHART_VENTAS_SERVICIOS_CODES } from "@/lib/saleRevenueChartAccounts"
import { resolveLedgerAccountForTreasuryPayment } from "@/lib/treasuryPaymentLedger"
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

export async function postServiceChargePaymentLedger(
  supabase: SupabaseClient,
  args: {
    popId: string
    userId: string
    serviceChargePaymentId: string
  },
): Promise<{ success: true } | { success: false; error: string }> {
  const { popId, userId, serviceChargePaymentId } = args

  const { data: payRow, error: payErr } = await supabase
    .from("service_charge_payments")
    .select(
      "id, amount, paid_at, payment_kind, treasury_account_id, accounting_entry_id, service_charge_id",
    )
    .eq("id", serviceChargePaymentId)
    .eq("pop_id", popId)
    .maybeSingle()

  if (payErr || !payRow) {
    return {
      success: false,
      error: payErr?.message || "Cobro de servicio no encontrado.",
    }
  }
  if (payRow.accounting_entry_id) {
    return { success: true }
  }

  const paymentKind =
    payRow.payment_kind != null ? String(payRow.payment_kind).trim() : ""
  const treasuryAccountId =
    payRow.treasury_account_id != null
      ? String(payRow.treasury_account_id)
      : null
  if (!paymentKind || !treasuryAccountId) {
    return { success: true }
  }

  const { data: chargeRow, error: chargeErr } = await supabase
    .from("service_charges")
    .select(
      `
      id,
      status,
      cancelled_at,
      service_types ( name )
    `,
    )
    .eq("id", String(payRow.service_charge_id))
    .eq("pop_id", popId)
    .maybeSingle()

  if (chargeErr || !chargeRow) {
    return { success: false, error: chargeErr?.message || "Cargo no encontrado." }
  }
  if (chargeRow.cancelled_at || String(chargeRow.status ?? "") === "cancelled") {
    return { success: false, error: "El cargo está cancelado." }
  }

  const amt = roundMoney(Number(payRow.amount ?? 0))
  if (!(amt > 0)) {
    return { success: false, error: "Importe de cobro inválido." }
  }

  const serviceType = chargeRow.service_types as { name?: string } | null
  const serviceName = String(serviceType?.name ?? "Servicio").trim() || "Servicio"
  const paidAt = String(payRow.paid_at ?? "").slice(0, 10)
  const entryDate = /^\d{4}-\d{2}-\d{2}$/.test(paidAt)
    ? paidAt
    : new Date().toISOString().slice(0, 10)

  const paymentAccountId = await resolveLedgerAccountForTreasuryPayment(
    supabase,
    popId,
    paymentKind,
    treasuryAccountId,
  )
  if (!paymentAccountId) {
    return {
      success: false,
      error:
        "Configurá una cuenta contable en tesorería o el plan de cuentas (caja/bancos) para registrar el cobro.",
    }
  }

  const revenueAccountId = await resolveAccountId(
    supabase,
    popId,
    CHART_VENTAS_SERVICIOS_CODES,
  )
  if (!revenueAccountId) {
    return {
      success: false,
      error:
        "No hay cuenta de ingresos por servicios (p. ej. 4.1.1.02) en el plan de cuentas.",
    }
  }

  const entryDescription = `Cobro de servicio — ${serviceName}`
  const nextNum = await nextEntryNumber(supabase, popId)
  const { data: entIns, error: entErr } = await supabase
    .from("accounting_entries")
    .insert({
      pop_id: popId,
      entry_number: nextNum,
      entry_date: entryDate,
      source_type: "service_charge_payment",
      source_id: serviceChargePaymentId,
      description: entryDescription,
      status: "draft",
      created_by: userId,
    })
    .select("id")
    .single()

  if (entErr || !entIns?.id) {
    return { success: false, error: entErr?.message || "No se pudo crear el asiento contable." }
  }
  const entryId = String(entIns.id)

  const { error: linesErr } = await supabase.from("accounting_entry_lines").insert([
    {
      entry_id: entryId,
      account_id: paymentAccountId,
      debit_amount: amt,
      credit_amount: 0,
      description: entryDescription,
      line_order: 1,
    },
    {
      entry_id: entryId,
      account_id: revenueAccountId,
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
    return { success: false, error: linesErr.message || "No se pudieron crear las líneas del asiento." }
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
    .from("service_charge_payments")
    .update({ accounting_entry_id: entryId })
    .eq("id", serviceChargePaymentId)
    .eq("pop_id", popId)
  if (linkErr) {
    return { success: false, error: linkErr.message || "No se pudo vincular el asiento al cobro." }
  }

  return { success: true }
}
