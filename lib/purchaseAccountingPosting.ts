import {
  CHART_GASTOS_GENERALES_CODES,
  CHART_IVA_CREDITO_CODES,
  CHART_MATERIAS_PRIMAS_CODES,
  CHART_MERCADERIAS_CODES,
  CHART_PROVEEDORES_CODES,
} from "@/lib/argV3DefaultChartAccounts"
import { resolvePaymentMethodLedgerAccount } from "@/lib/paymentLedgerAccounts"
import type { PurchaseKind } from "@/app/[siteId]/[popId]/purchases/actions"
import type { SupabaseClient } from "@supabase/supabase-js"

const PAYMENT_KIND_ACCOUNT_FALLBACK: Record<string, readonly string[]> = {
  cash: ["1.1.1.01"],
  transfer: ["1.1.1.02"],
  card_debit: ["1.1.1.03"],
  card_credit: ["1.1.1.03"],
  other: ["1.1.1.04", "1.1.1.01"],
}

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

function inventoryAccountCodes(kind: PurchaseKind): readonly string[] {
  switch (kind) {
    case "raw_material":
      return CHART_MATERIAS_PRIMAS_CODES
    case "supply":
      return CHART_GASTOS_GENERALES_CODES
    default:
      return CHART_MERCADERIAS_CODES
  }
}

export async function postPurchaseReceiptLedger(
  supabase: SupabaseClient,
  args: {
    popId: string
    userId: string
    purchaseId: string
    purchaseKind: PurchaseKind
    entryDate: string
    subtotalNet: number
    taxTotal: number
    total: number
    supplierName: string | null
  },
): Promise<{ success: true; entryId: string } | { success: false; error: string }> {
  const { popId, userId, purchaseId, purchaseKind, entryDate } = args
  const subtotalNet = roundMoney(args.subtotalNet)
  const taxTotal = roundMoney(args.taxTotal)
  const total = roundMoney(args.total)

  if (total <= 0) {
    return { success: false, error: "El total de la compra debe ser mayor que cero." }
  }

  const inventoryId = await resolveAccountId(
    supabase,
    popId,
    inventoryAccountCodes(purchaseKind),
  )
  if (!inventoryId) {
    return {
      success: false,
      error:
        purchaseKind === "supply"
          ? "No hay cuenta de gastos/insumos en el plan de cuentas."
          : "No hay cuenta de inventario en el plan de cuentas.",
    }
  }

  const proveedoresId = await resolveAccountId(supabase, popId, CHART_PROVEEDORES_CODES)
  if (!proveedoresId) {
    return {
      success: false,
      error: "No hay cuenta Proveedores (p. ej. 2.1.1.01) en el plan de cuentas.",
    }
  }

  const ivaId =
    taxTotal > 0
      ? await resolveAccountId(supabase, popId, CHART_IVA_CREDITO_CODES)
      : null
  if (taxTotal > 0 && !ivaId) {
    return {
      success: false,
      error: "No hay cuenta IVA crédito fiscal (p. ej. 1.1.2.03) en el plan de cuentas.",
    }
  }

  const label = args.supplierName?.trim() || "Proveedor"
  const entryDescription = `Compra — ${label}`

  const nextNum = await nextEntryNumber(supabase, popId)
  const { data: entIns, error: entErr } = await supabase
    .from("accounting_entries")
    .insert({
      pop_id: popId,
      entry_number: nextNum,
      entry_date: entryDate,
      source_type: "purchase",
      source_id: purchaseId,
      description: entryDescription,
      status: "draft",
      created_by: userId,
    })
    .select("id")
    .single()

  if (entErr || !entIns?.id) {
    return { success: false, error: entErr?.message || "No se pudo crear el asiento de compra." }
  }
  const entryId = String(entIns.id)

  const lines: {
    account_id: string
    debit_amount: number
    credit_amount: number
    description: string
    line_order: number
  }[] = []
  let order = 1

  if (subtotalNet > 0) {
    lines.push({
      account_id: inventoryId,
      debit_amount: subtotalNet,
      credit_amount: 0,
      description: entryDescription,
      line_order: order++,
    })
  }
  if (taxTotal > 0 && ivaId) {
    lines.push({
      account_id: ivaId,
      debit_amount: taxTotal,
      credit_amount: 0,
      description: entryDescription,
      line_order: order++,
    })
  }
  lines.push({
    account_id: proveedoresId,
    debit_amount: 0,
    credit_amount: total,
    description: entryDescription,
    line_order: order,
  })

  const { error: linesErr } = await supabase
    .from("accounting_entry_lines")
    .insert(lines.map((l) => ({ ...l, entry_id: entryId })))
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
    return { success: false, error: postErr.message || "No se pudo registrar el asiento de compra." }
  }

  return { success: true, entryId }
}

export async function postPurchasePaymentLedger(
  supabase: SupabaseClient,
  args: {
    popId: string
    userId: string
    purchasePaymentId: string
  },
): Promise<{ success: true } | { success: false; error: string }> {
  const { popId, userId, purchasePaymentId } = args

  const { data: payRow, error: payErr } = await supabase
    .from("purchase_payments")
    .select(
      "id, amount, paid_at, payment_method_id, accounting_entry_id, purchase_id, notes",
    )
    .eq("id", purchasePaymentId)
    .eq("pop_id", popId)
    .maybeSingle()
  if (payErr || !payRow) {
    return { success: false, error: "Pago de compra no encontrado." }
  }
  if (payRow.accounting_entry_id) {
    return { success: true }
  }

  const amt = roundMoney(Number(payRow.amount))
  if (amt <= 0) {
    return { success: false, error: "Importe de pago inválido." }
  }

  const entryDate =
    payRow.paid_at != null ? String(payRow.paid_at).slice(0, 10) : new Date().toISOString().slice(0, 10)

  const { data: purchaseRow } = await supabase
    .from("purchases")
    .select("supplier_name, document_number")
    .eq("id", payRow.purchase_id)
    .maybeSingle()
  const supplierLabel =
    purchaseRow?.supplier_name?.trim() ||
    purchaseRow?.document_number?.trim() ||
    "Proveedor"
  const entryDescription = `Pago compra — ${supplierLabel}`

  const proveedoresId = await resolveAccountId(supabase, popId, CHART_PROVEEDORES_CODES)
  if (!proveedoresId) {
    return {
      success: false,
      error: "No hay cuenta Proveedores en el plan de cuentas.",
    }
  }

  let paymentAccountId: string | null = null
  const pmId = payRow.payment_method_id != null ? String(payRow.payment_method_id) : ""
  if (pmId) {
    paymentAccountId = await resolvePaymentMethodLedgerAccount(
      supabase,
      popId,
      pmId,
      "pay",
    )
    if (!paymentAccountId) {
      const { data: pmRow } = await supabase
        .from("payment_methods")
        .select("kind")
        .eq("id", pmId)
        .eq("pop_id", popId)
        .maybeSingle()
      const pmKind = String(pmRow?.kind ?? "other")
      const codes = PAYMENT_KIND_ACCOUNT_FALLBACK[pmKind] ?? PAYMENT_KIND_ACCOUNT_FALLBACK.other
      paymentAccountId = await resolveAccountId(supabase, popId, codes)
    }
  } else {
    paymentAccountId = await resolveAccountId(
      supabase,
      popId,
      PAYMENT_KIND_ACCOUNT_FALLBACK.other,
    )
  }
  if (!paymentAccountId) {
    return {
      success: false,
      error:
        "Configurá una cuenta contable en el medio de pago o el plan de cuentas (caja/bancos).",
    }
  }

  const nextNum = await nextEntryNumber(supabase, popId)
  const { data: entIns, error: entErr } = await supabase
    .from("accounting_entries")
    .insert({
      pop_id: popId,
      entry_number: nextNum,
      entry_date: entryDate,
      source_type: "purchase_payment",
      source_id: purchasePaymentId,
      description: entryDescription,
      status: "draft",
      created_by: userId,
    })
    .select("id")
    .single()

  if (entErr || !entIns?.id) {
    return { success: false, error: entErr?.message || "No se pudo crear el asiento de pago." }
  }
  const entryId = String(entIns.id)

  const { error: linesErr } = await supabase.from("accounting_entry_lines").insert([
    {
      entry_id: entryId,
      account_id: proveedoresId,
      debit_amount: amt,
      credit_amount: 0,
      description: entryDescription,
      line_order: 1,
    },
    {
      entry_id: entryId,
      account_id: paymentAccountId,
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
    return { success: false, error: linesErr.message || "No se pudieron crear las líneas del pago." }
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
    return { success: false, error: postErr.message || "No se pudo registrar el asiento de pago." }
  }

  const { error: linkErr } = await supabase
    .from("purchase_payments")
    .update({ accounting_entry_id: entryId })
    .eq("id", purchasePaymentId)
    .eq("pop_id", popId)
  if (linkErr) {
    return {
      success: false,
      error:
        linkErr.message ||
        "El asiento quedó registrado pero no se pudo vincular al pago.",
    }
  }

  return { success: true }
}
