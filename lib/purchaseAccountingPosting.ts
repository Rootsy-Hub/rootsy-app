import {
  CHART_IVA_CREDITO_CODES,
  CHART_INSUMOS_CODES,
  CHART_MATERIAS_PRIMAS_CODES,
  CHART_MERCADERIAS_CODES,
  CHART_PROVEEDORES_CODES,
} from "@/lib/argV3DefaultChartAccounts"
import type { ArticleItemKind } from "@/lib/articleItemKind"
import { resolveLedgerAccountForTreasuryPayment } from "@/lib/treasuryPaymentLedger"
import type { SupabaseClient } from "@supabase/supabase-js"

const INVENTORY_KIND_ORDER: readonly ArticleItemKind[] = [
  "merchandise",
  "raw_material",
  "supply",
]

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

function inventoryAccountCodes(kind: ArticleItemKind): readonly string[] {
  switch (kind) {
    case "raw_material":
      return CHART_MATERIAS_PRIMAS_CODES
    case "supply":
      return CHART_INSUMOS_CODES
    default:
      return CHART_MERCADERIAS_CODES
  }
}

function inventoryAccountError(kind: ArticleItemKind): string {
  switch (kind) {
    case "supply":
      return "No hay cuenta de Insumos en el plan de cuentas (p. ej. 1.1.3.04)."
    case "raw_material":
      return "No hay cuenta de Materias primas en el plan de cuentas."
    default:
      return "No hay cuenta de Mercaderías en el plan de cuentas."
  }
}

export type PurchaseReceiptLedgerLine = {
  itemKind: ArticleItemKind
  inventoryAmount: number
}

function groupInventoryAmountsByKind(
  lines: PurchaseReceiptLedgerLine[],
): Map<ArticleItemKind, number> {
  const grouped = new Map<ArticleItemKind, number>()
  for (const line of lines) {
    const amount = roundMoney(line.inventoryAmount)
    if (amount <= 0) continue
    grouped.set(line.itemKind, roundMoney((grouped.get(line.itemKind) ?? 0) + amount))
  }
  return grouped
}

function rebalanceGroupedInventoryAmounts(
  grouped: Map<ArticleItemKind, number>,
  expectedTotal: number,
): Map<ArticleItemKind, number> {
  const out = new Map(grouped)
  const currentTotal = roundMoney(
    [...out.values()].reduce((sum, amount) => sum + amount, 0),
  )
  const delta = roundMoney(expectedTotal - currentTotal)
  if (delta === 0 || out.size === 0) return out

  let targetKind: ArticleItemKind | null = null
  let targetAmount = -1
  for (const kind of INVENTORY_KIND_ORDER) {
    const amount = out.get(kind)
    if (amount == null) continue
    if (amount > targetAmount) {
      targetKind = kind
      targetAmount = amount
    }
  }
  if (!targetKind) {
    targetKind = [...out.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  }
  if (!targetKind) return out
  out.set(targetKind, roundMoney((out.get(targetKind) ?? 0) + delta))
  return out
}

export async function postPurchaseReceiptLedger(
  supabase: SupabaseClient,
  args: {
    popId: string
    userId: string
    purchaseId: string
    entryDate: string
    lines: PurchaseReceiptLedgerLine[]
    taxTotal: number
    total: number
    supplierName: string | null
  },
): Promise<{ success: true; entryId: string } | { success: false; error: string }> {
  const { popId, userId, purchaseId, entryDate } = args
  const taxTotal = roundMoney(args.taxTotal)
  const total = roundMoney(args.total)
  const inventoryTotalExpected = roundMoney(total - taxTotal)

  if (total <= 0) {
    return { success: false, error: "El total de la compra debe ser mayor que cero." }
  }
  if (inventoryTotalExpected < 0) {
    return { success: false, error: "El neto de inventario de la compra es inválido." }
  }

  const grouped = rebalanceGroupedInventoryAmounts(
    groupInventoryAmountsByKind(args.lines),
    inventoryTotalExpected,
  )
  if (grouped.size === 0) {
    return {
      success: false,
      error: "No hay importes de inventario para registrar en la compra.",
    }
  }

  const inventoryAccountIds = new Map<ArticleItemKind, string>()
  for (const kind of grouped.keys()) {
    const accountId = await resolveAccountId(
      supabase,
      popId,
      inventoryAccountCodes(kind),
    )
    if (!accountId) {
      return { success: false, error: inventoryAccountError(kind) }
    }
    inventoryAccountIds.set(kind, accountId)
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

  for (const kind of INVENTORY_KIND_ORDER) {
    const amount = grouped.get(kind)
    if (amount == null || amount <= 0) continue
    const accountId = inventoryAccountIds.get(kind)
    if (!accountId) continue
    lines.push({
      account_id: accountId,
      debit_amount: amount,
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
      "id, amount, paid_at, payment_kind, treasury_account_id, accounting_entry_id, purchase_id, notes",
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

  const paymentKind =
    payRow.payment_kind != null ? String(payRow.payment_kind) : "other"
  const treasuryAccountId =
    payRow.treasury_account_id != null
      ? String(payRow.treasury_account_id)
      : null
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
