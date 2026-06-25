"use server"

import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import {
  getPopById,
  getPopSiteId,
  validatePopAccess,
} from "@/lib/popHelpers"
import { popMenuHref } from "@/lib/popRoutes"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import { monthBoundsISO } from "@/lib/expenseMonth"
import { resolveDefaultLedgerAccountForMethod } from "@/lib/paymentLedgerAccounts"
import { postTreasurySettlementLedger } from "@/lib/treasurySettlementPosting"
import { requireAuthenticatedUser } from "@/lib/authHelpers"
import { parseBankStatementCsv } from "@/lib/parseBankStatementCsv"
import {
  type TreasuryAccountKind,
  treasuryKindLabel,
} from "@/lib/treasuryAccountKinds"
import {
  getPrimaryPaymentMethodForTreasuryAccount,
  listPaymentMethodIdsForTreasuryAccount,
} from "@/lib/treasuryAccountResolve"
import { createClient } from "@/utils/supabase/server"

export type PaymentMethodKind =
  | "cash"
  | "card_debit"
  | "card_credit"
  | "transfer"
  | "other"

export type PaymentMethodUsage = "receive" | "pay" | "both"

export type AccountingChartOption = {
  id: string
  code: string
  name: string
  label: string
}

export type PaymentMethodTableRow = {
  id: string
  name: string
  kind: PaymentMethodKind
  usage: PaymentMethodUsage
  isActive: boolean
  sortOrder: number
  accountingAccountId: string | null
  accountingAccountLabel: string | null
  receivedMonthTotal: number
  paidOutMonthTotal: number
  /** Consumos acumulados menos liquidaciones (tarjetas corporativas). */
  outstandingBalance: number
  settledTotal: number
  /** Saldo contable de la cuenta vinculada (null si no aplica). */
  ledgerBalance: number | null
  isCardPayable: boolean
}

export type FundingMethodOption = {
  id: string
  name: string
  kind: PaymentMethodKind
}

export type TreasurySettlementRow = {
  id: string
  amount: number
  settledAt: string
  notes: string
  fundingMethodName: string | null
}

export type PaymentMethodMovementRow = {
  id: string
  movementRefId: string
  kind: "sale" | "purchase" | "expense" | "card_settlement" | "funding_out"
  date: string
  amount: number
  label: string
  direction: "in" | "out"
  reconciled: boolean
  linkedStatementLineId: string | null
}

export type BankStatementLineRow = {
  id: string
  lineDate: string
  description: string
  amount: number
  direction: "in" | "out"
  source: "manual" | "csv"
  reconciled: boolean
}

export type PaymentMethodDetailResult = {
  settlements: TreasurySettlementRow[]
  movements: PaymentMethodMovementRow[]
  movementTotals: { in: number; out: number; net: number }
  statementLines: BankStatementLineRow[]
  supportsBankReconciliation: boolean
  reconciliationSummary: {
    movementsReconciled: number
    movementsPending: number
    statementReconciled: number
    statementPending: number
    statementTotalIn: number
    statementTotalOut: number
  }
}

export type PaymentsHubSummary = {
  year: number
  month: number
  monthLabel: string
  receivedMonthTotal: number
  paidOutMonthTotal: number
  netMonthTotal: number
}

export type UpsertPopPaymentMethodInput = {
  name: string
  kind: PaymentMethodKind
  usage: PaymentMethodUsage
  sortOrder: number
  treasuryAccountId: string
}

const PAYMENT_KINDS: PaymentMethodKind[] = [
  "cash",
  "card_debit",
  "card_credit",
  "transfer",
  "other",
]

const PAYMENT_USAGES: PaymentMethodUsage[] = ["receive", "pay", "both"]

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

function parseAmount(v: unknown): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return roundMoney(n)
}

function parseKind(raw: unknown): PaymentMethodKind {
  const k = String(raw ?? "other")
  return PAYMENT_KINDS.includes(k as PaymentMethodKind)
    ? (k as PaymentMethodKind)
    : "other"
}

function parseUsage(raw: unknown): PaymentMethodUsage {
  const u = String(raw ?? "both")
  return PAYMENT_USAGES.includes(u as PaymentMethodUsage)
    ? (u as PaymentMethodUsage)
    : "both"
}

function monthLabelEs(year: number, month1: number): string {
  const d = new Date(year, month1 - 1, 1)
  return new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(d)
}

async function resolveDefaultLedgerAccountId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  kind: PaymentMethodKind,
): Promise<{ id: string } | { error: string }> {
  const { data, error } = await supabase.rpc("payment_method_default_account_id", {
    p_pop_id: popId,
    p_kind: kind,
  })
  if (error) {
    return { error: error.message || "No se pudo vincular la cuenta contable." }
  }
  if (data == null || String(data).length === 0) {
    return {
      error:
        "No hay cuenta predeterminada para este tipo en el plan (códigos 1.1.1.01 a 1.1.1.04).",
    }
  }
  return { id: String(data) }
}

async function resolveLedgerAccountId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  kind: PaymentMethodKind,
  usage: PaymentMethodUsage,
  explicitId: string | null | undefined,
): Promise<{ id: string } | { error: string }> {
  const trimmed = explicitId?.trim() || ""
  if (trimmed) {
    const { data: accRow, error: accErr } = await supabase
      .from("accounting_chart_of_accounts")
      .select("id")
      .eq("id", trimmed)
      .eq("pop_id", popId)
      .eq("is_movement_account", true)
      .maybeSingle()
    if (accErr || !accRow?.id) {
      return {
        error: "La cuenta contable elegida no es válida para este punto de venta.",
      }
    }
    return { id: String(accRow.id) }
  }
  const preferred = await resolveDefaultLedgerAccountForMethod(
    supabase,
    popId,
    kind,
    usage,
  )
  if (!("error" in preferred)) {
    return preferred
  }
  return resolveDefaultLedgerAccountId(supabase, popId, kind)
}

async function loadChartOptions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
): Promise<
  | { success: true; options: AccountingChartOption[]; labelById: Map<string, string> }
  | { success: false; error: string }
> {
  const { data: accRows, error: accErr } = await supabase
    .from("accounting_chart_of_accounts")
    .select("id, code, name")
    .eq("pop_id", popId)
    .eq("is_movement_account", true)
    .order("code", { ascending: true })
  if (accErr) {
    return { success: false, error: accErr.message || "No se pudo cargar el plan de cuentas." }
  }
  const labelById = new Map<string, string>()
  const options: AccountingChartOption[] = []
  for (const a of accRows || []) {
    const id = String(a.id)
    const code = String(a.code ?? "")
    const name = String(a.name ?? "")
    const label = `${code} — ${name}`
    labelById.set(id, label)
    options.push({ id, code, name, label })
  }
  return { success: true, options, labelById }
}

async function computeMonthTotalsByPaymentMethod(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  year: number,
  month1: number,
): Promise<Map<string, { received: number; paidOut: number }>> {
  const totals = new Map<string, { received: number; paidOut: number }>()
  const bump = (pmId: string, field: "received" | "paidOut", amount: number) => {
    if (!pmId || amount <= 0) return
    const prev = totals.get(pmId) ?? { received: 0, paidOut: 0 }
    prev[field] = roundMoney(prev[field] + amount)
    totals.set(pmId, prev)
  }

  const { start, end } = monthBoundsISO(year, month1)
  const soldAtEnd = `${end}T23:59:59.999`

  const { data: saleRows } = await supabase
    .from("sales")
    .select("id")
    .eq("pop_id", popId)
    .eq("status", "completed")
    .gte("sold_at", start)
    .lte("sold_at", soldAtEnd)

  const saleIds = (saleRows || []).map((r) => String(r.id))
  if (saleIds.length > 0) {
    const { data: spRows } = await supabase
      .from("sale_payments")
      .select("payment_method_id, amount")
      .eq("pop_id", popId)
      .in("sale_id", saleIds)
    for (const row of spRows || []) {
      bump(String(row.payment_method_id), "received", parseAmount(row.amount))
    }
  }

  const { data: purchasePayRows } = await supabase
    .from("purchase_payments")
    .select("payment_method_id, amount")
    .eq("pop_id", popId)
    .gte("paid_at", start)
    .lte("paid_at", end)

  for (const row of purchasePayRows || []) {
    if (row.payment_method_id == null) continue
    bump(String(row.payment_method_id), "paidOut", parseAmount(row.amount))
  }

  const { data: expensePayRows } = await supabase
    .from("expense_payments")
    .select("payment_method_id, amount")
    .eq("pop_id", popId)
    .gte("paid_at", start)
    .lte("paid_at", end)

  for (const row of expensePayRows || []) {
    if (row.payment_method_id == null) continue
    bump(String(row.payment_method_id), "paidOut", parseAmount(row.amount))
  }

  return totals
}

async function computeLifetimePaidOutByMethod(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
): Promise<Map<string, number>> {
  const totals = new Map<string, number>()
  const bump = (pmId: string, amount: number) => {
    if (!pmId || amount <= 0) return
    totals.set(pmId, roundMoney((totals.get(pmId) ?? 0) + amount))
  }

  const { data: purchasePayRows } = await supabase
    .from("purchase_payments")
    .select("payment_method_id, amount")
    .eq("pop_id", popId)
  for (const row of purchasePayRows || []) {
    if (row.payment_method_id == null) continue
    bump(String(row.payment_method_id), parseAmount(row.amount))
  }

  const { data: expensePayRows } = await supabase
    .from("expense_payments")
    .select("payment_method_id, amount")
    .eq("pop_id", popId)
  for (const row of expensePayRows || []) {
    if (row.payment_method_id == null) continue
    bump(String(row.payment_method_id), parseAmount(row.amount))
  }

  return totals
}

async function computeSettlementsByCard(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
): Promise<Map<string, number>> {
  const totals = new Map<string, number>()
  const { data, error } = await supabase
    .from("treasury_settlements")
    .select("card_payment_method_id, amount")
    .eq("pop_id", popId)
  if (error) {
    return totals
  }
  for (const row of data || []) {
    const id = String(row.card_payment_method_id)
    totals.set(id, roundMoney((totals.get(id) ?? 0) + parseAmount(row.amount)))
  }
  return totals
}

async function computeLedgerBalancesByAccount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  accountIds: string[],
): Promise<Map<string, number>> {
  const balances = new Map<string, number>()
  if (accountIds.length === 0) return balances

  const { data: accRows } = await supabase
    .from("accounting_chart_of_accounts")
    .select("id, nature")
    .eq("pop_id", popId)
    .in("id", accountIds)
  const natureById = new Map<string, string>()
  for (const a of accRows || []) {
    natureById.set(String(a.id), String(a.nature ?? "deudora"))
  }

  const { data: entryRows } = await supabase
    .from("accounting_entries")
    .select("id")
    .eq("pop_id", popId)
    .eq("status", "posted")
  const entryIds = (entryRows || []).map((r) => String(r.id))
  if (entryIds.length === 0) {
    for (const id of accountIds) balances.set(id, 0)
    return balances
  }

  const { data: lineRows } = await supabase
    .from("accounting_entry_lines")
    .select("account_id, debit_amount, credit_amount")
    .in("account_id", accountIds)
    .in("entry_id", entryIds)

  for (const id of accountIds) {
    balances.set(id, 0)
  }
  for (const ln of lineRows || []) {
    const aid = String(ln.account_id)
    const d = parseAmount(ln.debit_amount)
    const c = parseAmount(ln.credit_amount)
    const nature = natureById.get(aid) ?? "deudora"
    const prev = balances.get(aid) ?? 0
    const delta = nature === "acreedora" ? c - d : d - c
    balances.set(aid, roundMoney(prev + delta))
  }
  return balances
}

function isCardPayableRow(kind: PaymentMethodKind, usage: PaymentMethodUsage): boolean {
  return (
    kind === "card_credit" && (usage === "pay" || usage === "both")
  )
}

function movementRefId(
  kind: PaymentMethodMovementRow["kind"],
  id: string,
): string {
  if (kind === "funding_out" && id.startsWith("fund-")) {
    return id.slice(5)
  }
  return id
}

function enrichMovement(
  row: Omit<
    PaymentMethodMovementRow,
    "movementRefId" | "reconciled" | "linkedStatementLineId"
  >,
  markByKey: Map<string, { statementLineId: string | null }>,
): PaymentMethodMovementRow {
  const refId = movementRefId(row.kind, row.id)
  const mark = markByKey.get(`${row.kind}:${refId}`)
  return {
    ...row,
    movementRefId: refId,
    reconciled: Boolean(mark),
    linkedStatementLineId: mark?.statementLineId ?? null,
  }
}

export async function createPopPaymentMethod(
  popId: string,
  input: UpsertPopPaymentMethodInput,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.PAYMENT_METHOD_CREATE.resource,
        POP_PERMS.PAYMENT_METHOD_CREATE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para crear medios de pago." }
    }
    const name = input.name.trim()
    if (!name) {
      return { success: false, error: "El nombre es obligatorio." }
    }
    const sortOrder = Number(input.sortOrder)
    if (!Number.isFinite(sortOrder)) {
      return { success: false, error: "Orden inválido." }
    }
    const usage = parseUsage(input.usage)
    const treasuryAccountId = input.treasuryAccountId?.trim()
    if (!treasuryAccountId) {
      return {
        success: false,
        error: "Elegí la cuenta de tesorería donde se acredita el cobro.",
      }
    }
    const supabase = await createClient()
    const { data: taRow, error: taErr } = await supabase
      .from("treasury_accounts")
      .select("id, accounting_chart_account_id")
      .eq("pop_id", popId)
      .eq("id", treasuryAccountId)
      .eq("is_active", true)
      .maybeSingle()
    if (taErr || !taRow?.id) {
      return { success: false, error: "Cuenta de tesorería inválida." }
    }
    const { error } = await supabase.from("payment_methods").insert({
      pop_id: popId,
      name,
      kind: input.kind,
      usage: "receive",
      is_active: true,
      sort_order: Math.trunc(sortOrder),
      accounting_account_id: String(taRow.accounting_chart_account_id),
      treasury_account_id: treasuryAccountId,
    })
    if (error) {
      return { success: false, error: error.message || "No se pudo crear." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function updatePopPaymentMethod(
  popId: string,
  rowId: string,
  input: UpsertPopPaymentMethodInput,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.PAYMENT_METHOD_UPDATE.resource,
        POP_PERMS.PAYMENT_METHOD_UPDATE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para editar medios de pago." }
    }
    const name = input.name.trim()
    if (!name) {
      return { success: false, error: "El nombre es obligatorio." }
    }
    const sortOrder = Number(input.sortOrder)
    if (!Number.isFinite(sortOrder)) {
      return { success: false, error: "Orden inválido." }
    }
    const usage = parseUsage(input.usage)
    const treasuryAccountId = input.treasuryAccountId?.trim()
    if (!treasuryAccountId) {
      return {
        success: false,
        error: "Elegí la cuenta de tesorería donde se acredita el cobro.",
      }
    }
    const supabase = await createClient()
    const { data: taRow, error: taErr } = await supabase
      .from("treasury_accounts")
      .select("id, accounting_chart_account_id")
      .eq("pop_id", popId)
      .eq("id", treasuryAccountId)
      .eq("is_active", true)
      .maybeSingle()
    if (taErr || !taRow?.id) {
      return { success: false, error: "Cuenta de tesorería inválida." }
    }
    const { error } = await supabase
      .from("payment_methods")
      .update({
        name,
        kind: input.kind,
        usage: "receive",
        sort_order: Math.trunc(sortOrder),
        accounting_account_id: String(taRow.accounting_chart_account_id),
        treasury_account_id: treasuryAccountId,
      })
      .eq("id", rowId)
      .eq("pop_id", popId)
    if (error) {
      return { success: false, error: error.message || "No se pudo guardar." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function deletePopPaymentMethod(
  popId: string,
  rowId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.PAYMENT_METHOD_DELETE.resource,
        POP_PERMS.PAYMENT_METHOD_DELETE.action,
      )
    ) {
      return {
        success: false,
        error: "Sin permiso para eliminar medios de pago.",
      }
    }
    const supabase = await createClient()
    const { error } = await supabase
      .from("payment_methods")
      .delete()
      .eq("id", rowId)
      .eq("pop_id", popId)
    if (error) {
      return { success: false, error: error.message || "No se pudo eliminar." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export type RecordTreasurySettlementInput = {
  cardPaymentMethodId: string
  fundingPaymentMethodId: string
  amount: number
  settledAt: string
  notes?: string
}

export async function recordTreasurySettlement(
  popId: string,
  input: RecordTreasurySettlementInput,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.PAYMENT_METHOD_UPDATE.resource,
        POP_PERMS.PAYMENT_METHOD_UPDATE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para registrar liquidaciones." }
    }

    const cardId = input.cardPaymentMethodId?.trim()
    const fundingId = input.fundingPaymentMethodId?.trim()
    const settledAt = input.settledAt?.trim()
    const amt = roundMoney(Number(input.amount))

    if (!cardId) {
      return { success: false, error: "Elegí la tarjeta a liquidar." }
    }
    if (!fundingId) {
      return { success: false, error: "Elegí desde qué cuenta vas a pagar." }
    }
    if (cardId === fundingId) {
      return {
        success: false,
        error: "La cuenta de pago debe ser distinta de la tarjeta.",
      }
    }
    if (!(amt > 0)) {
      return { success: false, error: "El importe debe ser mayor a cero." }
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(settledAt)) {
      return { success: false, error: "Fecha de pago inválida." }
    }

    const user = await requireAuthenticatedUser()
    const supabase = await createClient()

    const { data: cardPm, error: cardErr } = await supabase
      .from("payment_methods")
      .select("id, kind, usage, treasury_account_id")
      .eq("id", cardId)
      .eq("pop_id", popId)
      .eq("is_active", true)
      .maybeSingle()
    if (cardErr || !cardPm) {
      return { success: false, error: "Tarjeta inválida." }
    }
    const cardKind = parseKind(cardPm.kind)
    const cardUsage = parseUsage(cardPm.usage)
    if (!isCardPayableRow(cardKind, cardUsage)) {
      return {
        success: false,
        error: "Este medio no es una tarjeta corporativa liquidable.",
      }
    }

    const { data: fundPm, error: fundErr } = await supabase
      .from("payment_methods")
      .select("id, kind, usage, treasury_account_id")
      .eq("id", fundingId)
      .eq("pop_id", popId)
      .eq("is_active", true)
      .maybeSingle()
    if (fundErr || !fundPm) {
      return { success: false, error: "Medio de fondeo inválido." }
    }
    if (parseKind(fundPm.kind) === "card_credit") {
      return {
        success: false,
        error: "Pagá el resumen desde banco, efectivo o transferencia.",
      }
    }

    const lifetimePaid = await computeLifetimePaidOutByMethod(supabase, popId)
    const settlements = await computeSettlementsByCard(supabase, popId)
    const charged = lifetimePaid.get(cardId) ?? 0
    const settled = settlements.get(cardId) ?? 0
    const outstanding = roundMoney(charged - settled)
    if (amt > outstanding + 0.0001) {
      return {
        success: false,
        error: `El importe supera la deuda pendiente (${outstanding.toFixed(2)}).`,
      }
    }

    const cardTreasuryAccountId = cardPm.treasury_account_id
      ? String(cardPm.treasury_account_id)
      : null
    const fundingTreasuryAccountId = fundPm.treasury_account_id
      ? String(fundPm.treasury_account_id)
      : null

    const { data: ins, error: insErr } = await supabase
      .from("treasury_settlements")
      .insert({
        pop_id: popId,
        card_payment_method_id: cardId,
        funding_payment_method_id: fundingId,
        card_treasury_account_id: cardTreasuryAccountId,
        funding_treasury_account_id: fundingTreasuryAccountId,
        amount: amt,
        settled_at: settledAt,
        notes: input.notes?.trim() || "",
        created_by: user.uid,
      })
      .select("id")
      .single()

    if (insErr || !ins?.id) {
      return {
        success: false,
        error: insErr?.message || "No se pudo registrar la liquidación.",
      }
    }
    const settlementId = String(ins.id)

    const ledger = await postTreasurySettlementLedger(supabase, {
      popId,
      userId: user.uid,
      settlementId,
    })
    if (!ledger.success) {
      await supabase
        .from("treasury_settlements")
        .delete()
        .eq("id", settlementId)
        .eq("pop_id", popId)
      return { success: false, error: ledger.error }
    }

    return { success: true, id: settlementId }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function getPopPaymentsHub(
  popId: string,
  year: number,
  month1: number,
): Promise<
  | {
      success: true
      rows: PaymentMethodTableRow[]
      summary: PaymentsHubSummary
      chartAccounts: AccountingChartOption[]
      fundingMethods: FundingMethodOption[]
      popName: string
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
      canSettle: boolean
    }
  | {
      success: false
      error: string
      redirect?: string
      rows: PaymentMethodTableRow[]
      summary: PaymentsHubSummary
      chartAccounts: AccountingChartOption[]
      fundingMethods: FundingMethodOption[]
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
      canSettle: boolean
      popName?: string
    }
> {
  const now = new Date()
  const y = Number.isFinite(year) && year >= 2000 ? Math.trunc(year) : now.getFullYear()
  const m =
    Number.isFinite(month1) && month1 >= 1 && month1 <= 12
      ? Math.trunc(month1)
      : now.getMonth() + 1

  const emptySummary: PaymentsHubSummary = {
    year: y,
    month: m,
    monthLabel: monthLabelEs(y, m),
    receivedMonthTotal: 0,
    paidOutMonthTotal: 0,
    netMonthTotal: 0,
  }
  const empty = {
    rows: [] as PaymentMethodTableRow[],
    summary: emptySummary,
    chartAccounts: [] as AccountingChartOption[],
    fundingMethods: [] as FundingMethodOption[],
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canSettle: false,
  }

  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return {
        success: false,
        error: access.error || "Sin acceso",
        redirect: "/home",
        ...empty,
      }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.PAYMENT_METHOD_READ.resource,
        POP_PERMS.PAYMENT_METHOD_READ.action,
      )
    ) {
      return {
        success: false,
        error:
          "No tenés permiso para ver medios de pago de este punto de venta.",
        redirect: popMenuHref(await getPopSiteId(popId), popId),
        ...empty,
      }
    }
    const canCreate = permissionKeysInclude(
      snap.keys,
      POP_PERMS.PAYMENT_METHOD_CREATE.resource,
      POP_PERMS.PAYMENT_METHOD_CREATE.action,
    )
    const canUpdate = permissionKeysInclude(
      snap.keys,
      POP_PERMS.PAYMENT_METHOD_UPDATE.resource,
      POP_PERMS.PAYMENT_METHOD_UPDATE.action,
    )
    const canDelete = permissionKeysInclude(
      snap.keys,
      POP_PERMS.PAYMENT_METHOD_DELETE.resource,
      POP_PERMS.PAYMENT_METHOD_DELETE.action,
    )
    const canSettle = canUpdate

    const popRes = await getPopById(popId)
    const popName =
      popRes.success && popRes.pop ? String(popRes.pop.name ?? "") : ""
    const supabase = await createClient()

    const chart = await loadChartOptions(supabase, popId)
    if (!chart.success) {
      return {
        success: false,
        error: chart.error,
        ...empty,
        popName,
        canCreate,
        canUpdate,
        canDelete,
        canSettle: canUpdate,
      }
    }

    const { data, error } = await supabase
      .from("payment_methods")
      .select(
        "id, name, kind, usage, is_active, sort_order, accounting_account_id",
      )
      .eq("pop_id", popId)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })

    if (error) {
      return {
        success: false,
        error: error.message || "No se pudieron cargar los medios de pago.",
        ...empty,
        chartAccounts: chart.options,
        popName,
        canCreate,
        canUpdate,
        canDelete,
        canSettle: canUpdate,
      }
    }

    const monthTotals = await computeMonthTotalsByPaymentMethod(supabase, popId, y, m)
    const lifetimePaid = await computeLifetimePaidOutByMethod(supabase, popId)
    const settlementsByCard = await computeSettlementsByCard(supabase, popId)

    const accountIds = [
      ...new Set(
        (data || [])
          .map((r) => (r.accounting_account_id ? String(r.accounting_account_id) : ""))
          .filter(Boolean),
      ),
    ]
    const ledgerByAccount = await computeLedgerBalancesByAccount(
      supabase,
      popId,
      accountIds,
    )

    const fundingMethods: FundingMethodOption[] = (data || [])
      .filter((r) => {
        const kind = parseKind(r.kind)
        const usage = parseUsage(r.usage)
        return (
          Boolean(r.is_active) &&
          (usage === "pay" || usage === "both") &&
          kind !== "card_credit"
        )
      })
      .map((r) => ({
        id: String(r.id),
        name: String(r.name ?? ""),
        kind: parseKind(r.kind),
      }))

    let receivedMonthTotal = 0
    let paidOutMonthTotal = 0

    const rows: PaymentMethodTableRow[] = (data || []).map((r) => {
      const id = String(r.id)
      const kind = parseKind(r.kind)
      const usage = parseUsage(r.usage)
      const aid = r.accounting_account_id
        ? String(r.accounting_account_id)
        : null
      const mt = monthTotals.get(id) ?? { received: 0, paidOut: 0 }
      if (usage === "receive" || usage === "both") {
        receivedMonthTotal = roundMoney(receivedMonthTotal + mt.received)
      }
      if (usage === "pay" || usage === "both") {
        paidOutMonthTotal = roundMoney(paidOutMonthTotal + mt.paidOut)
      }
      const charged = lifetimePaid.get(id) ?? 0
      const settled = settlementsByCard.get(id) ?? 0
      const outstandingBalance = roundMoney(Math.max(0, charged - settled))
      const cardPayable = isCardPayableRow(kind, usage)
      return {
        id,
        name: String(r.name ?? ""),
        kind,
        usage,
        isActive: Boolean(r.is_active),
        sortOrder: Number(r.sort_order ?? 0) || 0,
        accountingAccountId: aid,
        accountingAccountLabel: aid ? (chart.labelById.get(aid) ?? "—") : null,
        receivedMonthTotal: mt.received,
        paidOutMonthTotal: mt.paidOut,
        outstandingBalance: cardPayable ? outstandingBalance : 0,
        settledTotal: cardPayable ? settled : 0,
        ledgerBalance: aid != null ? (ledgerByAccount.get(aid) ?? 0) : null,
        isCardPayable: cardPayable,
      }
    })

    const summary: PaymentsHubSummary = {
      year: y,
      month: m,
      monthLabel: monthLabelEs(y, m),
      receivedMonthTotal,
      paidOutMonthTotal,
      netMonthTotal: roundMoney(receivedMonthTotal - paidOutMonthTotal),
    }

    return {
      success: true,
      rows,
      summary,
      chartAccounts: chart.options,
      fundingMethods,
      popName,
      canCreate,
      canUpdate,
      canDelete,
      canSettle,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return {
      success: false,
      error: message,
      ...empty,
      popName: "",
    }
  }
}

export async function getPaymentMethodDetail(
  popId: string,
  paymentMethodId: string,
  mode: "receive" | "pay",
): Promise<
  | { success: true; data: PaymentMethodDetailResult }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.PAYMENT_METHOD_READ.resource,
        POP_PERMS.PAYMENT_METHOD_READ.action,
      )
    ) {
      return {
        success: false,
        error: "No tenés permiso para ver medios de pago.",
      }
    }

    const pmId = paymentMethodId.trim()
    if (!pmId) {
      return { success: false, error: "Medio de pago inválido." }
    }

    const supabase = await createClient()
    const { data: pmRow, error: pmErr } = await supabase
      .from("payment_methods")
      .select("id, kind, usage")
      .eq("id", pmId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (pmErr || !pmRow) {
      return { success: false, error: "Medio de pago no encontrado." }
    }

    const kind = parseKind(pmRow.kind)
    const usage = parseUsage(pmRow.usage)
    const cardPayable = isCardPayableRow(kind, usage)

    const settlements: TreasurySettlementRow[] = []
    if (mode === "pay" && cardPayable) {
      const { data: settleRows, error: settleErr } = await supabase
        .from("treasury_settlements")
        .select(
          "id, amount, settled_at, notes, funding_payment_method_id",
        )
        .eq("pop_id", popId)
        .eq("card_payment_method_id", pmId)
        .order("settled_at", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50)

      if (settleErr) {
        return {
          success: false,
          error: settleErr.message || "No se pudieron cargar liquidaciones.",
        }
      }

      const fundingIds = [
        ...new Set(
          (settleRows || [])
            .map((r) =>
              r.funding_payment_method_id
                ? String(r.funding_payment_method_id)
                : "",
            )
            .filter(Boolean),
        ),
      ]
      const fundingNames = new Map<string, string>()
      if (fundingIds.length > 0) {
        const { data: fundRows } = await supabase
          .from("payment_methods")
          .select("id, name")
          .eq("pop_id", popId)
          .in("id", fundingIds)
        for (const f of fundRows || []) {
          fundingNames.set(String(f.id), String(f.name ?? ""))
        }
      }

      for (const r of settleRows || []) {
        const fid =
          r.funding_payment_method_id != null
            ? String(r.funding_payment_method_id)
            : ""
        settlements.push({
          id: String(r.id),
          amount: parseAmount(r.amount),
          settledAt: String(r.settled_at ?? "").slice(0, 10),
          notes: String(r.notes ?? ""),
          fundingMethodName: fid ? (fundingNames.get(fid) ?? null) : null,
        })
      }
    }

    const movements: Omit<
      PaymentMethodMovementRow,
      "movementRefId" | "reconciled" | "linkedStatementLineId"
    >[] = []
    const pushMovement = (
      row: Omit<
        PaymentMethodMovementRow,
        "movementRefId" | "reconciled" | "linkedStatementLineId"
      >,
    ) => {
      movements.push(row)
    }

    if (mode === "receive") {
      const { data: spRows, error: spErr } = await supabase
        .from("sale_payments")
        .select(
          `
          id,
          amount,
          sale_id,
          sales!inner (
            sold_at,
            status,
            customer_name
          )
        `,
        )
        .eq("pop_id", popId)
        .eq("payment_method_id", pmId)
        .eq("sales.status", "completed")
        .limit(80)

      if (spErr) {
        return {
          success: false,
          error: spErr.message || "No se pudieron cargar cobros.",
        }
      }

      const saleMovements: Omit<
        PaymentMethodMovementRow,
        "movementRefId" | "reconciled" | "linkedStatementLineId"
      >[] = []
      for (const r of spRows || []) {
        const sale = r.sales as unknown as {
          sold_at?: string
          customer_name?: string | null
        } | null
        const date = String(sale?.sold_at ?? "").slice(0, 10)
        const customer = sale?.customer_name?.trim() || "Venta"
        saleMovements.push({
          id: String(r.id),
          kind: "sale",
          date,
          amount: parseAmount(r.amount),
          label: customer,
          direction: "in",
        })
      }
      saleMovements.sort((a, b) => b.date.localeCompare(a.date))
      for (const m of saleMovements.slice(0, 50)) {
        pushMovement(m)
      }
    } else {
      const { data: ppRows, error: ppErr } = await supabase
        .from("purchase_payments")
        .select(
          `
          id,
          amount,
          paid_at,
          purchases (
            supplier_name,
            document_number
          )
        `,
        )
        .eq("pop_id", popId)
        .eq("payment_method_id", pmId)
        .order("paid_at", { ascending: false })
        .limit(40)

      if (ppErr) {
        return {
          success: false,
          error: ppErr.message || "No se pudieron cargar pagos de compras.",
        }
      }

      for (const r of ppRows || []) {
        const pur = r.purchases as unknown as {
          supplier_name?: string | null
          document_number?: string | null
        } | null
        const label =
          pur?.supplier_name?.trim() ||
          pur?.document_number?.trim() ||
          "Compra"
        pushMovement({
          id: String(r.id),
          kind: "purchase",
          date: String(r.paid_at ?? "").slice(0, 10),
          amount: parseAmount(r.amount),
          label,
          direction: "out",
        })
      }

      const { data: epRows, error: epErr } = await supabase
        .from("expense_payments")
        .select(
          `
          id,
          amount,
          paid_at,
          expenses (
            description
          )
        `,
        )
        .eq("pop_id", popId)
        .eq("payment_method_id", pmId)
        .order("paid_at", { ascending: false })
        .limit(40)

      if (epErr) {
        return {
          success: false,
          error: epErr.message || "No se pudieron cargar pagos de gastos.",
        }
      }

      for (const r of epRows || []) {
        const exp = r.expenses as unknown as { description?: string | null } | null
        pushMovement({
          id: String(r.id),
          kind: "expense",
          date: String(r.paid_at ?? "").slice(0, 10),
          amount: parseAmount(r.amount),
          label: exp?.description?.trim() || "Gasto",
          direction: "out",
        })
      }

      if (!cardPayable) {
        const { data: fundSettleRows } = await supabase
          .from("treasury_settlements")
          .select(
            "id, amount, settled_at, notes, card_payment_method_id",
          )
          .eq("pop_id", popId)
          .eq("funding_payment_method_id", pmId)
          .order("settled_at", { ascending: false })
          .limit(30)

        const cardIds = [
          ...new Set(
            (fundSettleRows || [])
              .map((r) => String(r.card_payment_method_id))
              .filter(Boolean),
          ),
        ]
        const cardNames = new Map<string, string>()
        if (cardIds.length > 0) {
          const { data: cardRows } = await supabase
            .from("payment_methods")
            .select("id, name")
            .eq("pop_id", popId)
            .in("id", cardIds)
          for (const c of cardRows || []) {
            cardNames.set(String(c.id), String(c.name ?? ""))
          }
        }

        for (const r of fundSettleRows || []) {
          const cid = String(r.card_payment_method_id)
          pushMovement({
            id: `fund-${String(r.id)}`,
            kind: "funding_out",
            date: String(r.settled_at ?? "").slice(0, 10),
            amount: parseAmount(r.amount),
            label: `Resumen tarjeta — ${cardNames.get(cid) ?? "Tarjeta"}`,
            direction: "out",
          })
        }
      }
    }

    movements.sort((a, b) => {
      const dc = b.date.localeCompare(a.date)
      if (dc !== 0) return dc
      return b.id.localeCompare(a.id)
    })

    const supportsBankReconciliation = !(mode === "pay" && cardPayable)
    const markByKey = new Map<string, { statementLineId: string | null }>()
    const linkedStatementIds = new Set<string>()
    let statementLines: BankStatementLineRow[] = []

    if (supportsBankReconciliation) {
      const { data: markRows } = await supabase
        .from("treasury_reconciliation_marks")
        .select("movement_kind, movement_ref_id, statement_line_id")
        .eq("pop_id", popId)
        .eq("payment_method_id", pmId)

      for (const m of markRows || []) {
        const kind = String(m.movement_kind)
        const ref = String(m.movement_ref_id)
        const sid =
          m.statement_line_id != null ? String(m.statement_line_id) : null
        markByKey.set(`${kind}:${ref}`, { statementLineId: sid })
        if (sid) linkedStatementIds.add(sid)
      }

      const { data: stmtRows, error: stmtErr } = await supabase
        .from("bank_statement_lines")
        .select("id, line_date, description, amount, direction, source")
        .eq("pop_id", popId)
        .eq("payment_method_id", pmId)
        .order("line_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(100)

      if (stmtErr) {
        return {
          success: false,
          error: stmtErr.message || "No se pudo cargar el extracto bancario.",
        }
      }

      statementLines = (stmtRows || []).map((r) => {
        const id = String(r.id)
        return {
          id,
          lineDate: String(r.line_date ?? "").slice(0, 10),
          description: String(r.description ?? ""),
          amount: parseAmount(r.amount),
          direction: String(r.direction) === "in" ? "in" : "out",
          source: String(r.source) === "csv" ? "csv" : "manual",
          reconciled: linkedStatementIds.has(id),
        }
      })
    }

    const enrichedMovements = movements
      .map((m) => enrichMovement(m, markByKey))
      .slice(0, 60)

    let totalIn = 0
    let totalOut = 0
    for (const m of enrichedMovements) {
      if (m.direction === "in") totalIn = roundMoney(totalIn + m.amount)
      else totalOut = roundMoney(totalOut + m.amount)
    }

    let stmtIn = 0
    let stmtOut = 0
    let statementReconciled = 0
    for (const s of statementLines) {
      if (s.direction === "in") stmtIn = roundMoney(stmtIn + s.amount)
      else stmtOut = roundMoney(stmtOut + s.amount)
      if (s.reconciled) statementReconciled += 1
    }

    const movementsReconciled = enrichedMovements.filter((m) => m.reconciled).length

    return {
      success: true,
      data: {
        settlements,
        movements: enrichedMovements,
        movementTotals: {
          in: totalIn,
          out: totalOut,
          net: roundMoney(totalIn - totalOut),
        },
        statementLines,
        supportsBankReconciliation,
        reconciliationSummary: {
          movementsReconciled,
          movementsPending: enrichedMovements.length - movementsReconciled,
          statementReconciled,
          statementPending: statementLines.length - statementReconciled,
          statementTotalIn: stmtIn,
          statementTotalOut: stmtOut,
        },
      },
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

async function requirePaymentMethodUpdate(
  popId: string,
): Promise<
  | { ok: true; userId: string }
  | { ok: false; error: string }
> {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { ok: false, error: access.error || "Sin acceso" }
  }
  const snap = await loadPopPermissionsSnapshot(popId)
  if (
    !permissionKeysInclude(
      snap.keys,
      POP_PERMS.PAYMENT_METHOD_UPDATE.resource,
      POP_PERMS.PAYMENT_METHOD_UPDATE.action,
    )
  ) {
    return { ok: false, error: "Sin permiso para conciliar movimientos." }
  }
  const user = await requireAuthenticatedUser()
  return { ok: true, userId: user.uid }
}

export async function importBankStatementCsv(
  popId: string,
  treasuryAccountId: string,
  csvText: string,
): Promise<
  | { success: true; imported: number; warnings: string[] }
  | { success: false; error: string }
> {
  try {
    const auth = await requirePaymentMethodUpdate(popId)
    if (!auth.ok) return { success: false, error: auth.error }

    const taId = treasuryAccountId.trim()
    const parsed = parseBankStatementCsv(csvText)
    if (parsed.lines.length === 0) {
      return {
        success: false,
        error:
          parsed.errors[0] ||
          "No se importó ninguna línea. Revisá el formato del CSV.",
      }
    }

    const supabase = await createClient()
    const pmId = await getPrimaryPaymentMethodForTreasuryAccount(
      supabase,
      popId,
      taId,
    )
    if (!pmId) {
      return {
        success: false,
        error:
          "Esta cuenta no tiene un medio de pago vinculado para conciliar. Creá una forma de pago que apunte a esta cuenta.",
      }
    }

    const rows = parsed.lines.map((l) => ({
      pop_id: popId,
      payment_method_id: pmId,
      treasury_account_id: taId,
      line_date: l.lineDate,
      description: l.description,
      amount: l.amount,
      direction: l.direction,
      source: "csv" as const,
      created_by: auth.userId,
    }))

    const { error } = await supabase.from("bank_statement_lines").insert(rows)
    if (error) {
      return { success: false, error: error.message || "No se pudo importar." }
    }

    return {
      success: true,
      imported: rows.length,
      warnings: parsed.errors,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function addManualBankStatementLine(
  popId: string,
  treasuryAccountId: string,
  input: {
    lineDate: string
    description: string
    amount: number
    direction: "in" | "out"
  },
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const auth = await requirePaymentMethodUpdate(popId)
    if (!auth.ok) return { success: false, error: auth.error }

    const lineDate = input.lineDate.trim()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(lineDate)) {
      return { success: false, error: "Fecha inválida." }
    }
    const amt = roundMoney(Number(input.amount))
    if (!(amt > 0)) {
      return { success: false, error: "El importe debe ser mayor a cero." }
    }

    const supabase = await createClient()
    const taId = treasuryAccountId.trim()
    const pmId = await getPrimaryPaymentMethodForTreasuryAccount(
      supabase,
      popId,
      taId,
    )
    if (!pmId) {
      return {
        success: false,
        error:
          "Esta cuenta no tiene un medio de pago vinculado para conciliar.",
      }
    }
    const { data, error } = await supabase
      .from("bank_statement_lines")
      .insert({
        pop_id: popId,
        payment_method_id: pmId,
        treasury_account_id: taId,
        line_date: lineDate,
        description: input.description.trim() || "Movimiento extracto",
        amount: amt,
        direction: input.direction,
        source: "manual",
        created_by: auth.userId,
      })
      .select("id")
      .single()

    if (error || !data?.id) {
      return { success: false, error: error?.message || "No se pudo guardar." }
    }
    return { success: true, id: String(data.id) }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function deleteBankStatementLine(
  popId: string,
  lineId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const auth = await requirePaymentMethodUpdate(popId)
    if (!auth.ok) return { success: false, error: auth.error }

    const supabase = await createClient()
    const { error } = await supabase
      .from("bank_statement_lines")
      .delete()
      .eq("id", lineId.trim())
      .eq("pop_id", popId)
    if (error) {
      return { success: false, error: error.message || "No se pudo eliminar." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function setMovementReconciliation(
  popId: string,
  paymentMethodId: string,
  movementKind: PaymentMethodMovementRow["kind"],
  movementRefId: string,
  statementLineId?: string | null,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const auth = await requirePaymentMethodUpdate(popId)
    if (!auth.ok) return { success: false, error: auth.error }

    const kind = movementKind
    if (!["sale", "purchase", "expense", "funding_out"].includes(kind)) {
      return { success: false, error: "Tipo de movimiento inválido." }
    }
    const refId = movementRefId.trim()
    if (!refId) {
      return { success: false, error: "Referencia de movimiento inválida." }
    }

    const supabase = await createClient()
    const pmId = paymentMethodId.trim()
    let stmtId: string | null = statementLineId?.trim() || null

    if (stmtId) {
      const { data: stmtRow, error: stmtErr } = await supabase
        .from("bank_statement_lines")
        .select("id")
        .eq("id", stmtId)
        .eq("pop_id", popId)
        .eq("payment_method_id", pmId)
        .maybeSingle()
      if (stmtErr || !stmtRow) {
        return { success: false, error: "Línea de extracto inválida." }
      }
    }

    const { error } = await supabase.from("treasury_reconciliation_marks").upsert(
      {
        pop_id: popId,
        payment_method_id: pmId,
        movement_kind: kind,
        movement_ref_id: refId,
        statement_line_id: stmtId,
        reconciled_at: new Date().toISOString(),
        reconciled_by: auth.userId,
      },
      { onConflict: "pop_id,movement_kind,movement_ref_id" },
    )

    if (error) {
      return {
        success: false,
        error: error.message || "No se pudo marcar como conciliado.",
      }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function clearMovementReconciliation(
  popId: string,
  movementKind: PaymentMethodMovementRow["kind"],
  movementRefId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const auth = await requirePaymentMethodUpdate(popId)
    if (!auth.ok) return { success: false, error: auth.error }

    const supabase = await createClient()
    const { error } = await supabase
      .from("treasury_reconciliation_marks")
      .delete()
      .eq("pop_id", popId)
      .eq("movement_kind", movementKind)
      .eq("movement_ref_id", movementRefId.trim())
    if (error) {
      return { success: false, error: error.message || "No se pudo desmarcar." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

function parseTreasuryKind(v: unknown): TreasuryAccountKind {
  const k = String(v ?? "other")
  if (k === "cash" || k === "bank" || k === "wallet" || k === "card_payable") {
    return k
  }
  return "other"
}

export type TreasuryAccountDetailResult = PaymentMethodDetailResult & {
  reconciliationPaymentMethodId: string | null
}

export async function getTreasuryAccountDetail(
  popId: string,
  treasuryAccountId: string,
): Promise<
  | { success: true; data: TreasuryAccountDetailResult }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.PAYMENT_METHOD_READ.resource,
        POP_PERMS.PAYMENT_METHOD_READ.action,
      )
    ) {
      return { success: false, error: "Sin permiso para ver esta cuenta." }
    }

    const taId = treasuryAccountId.trim()
    const supabase = await createClient()
    const { data: taRow, error: taErr } = await supabase
      .from("treasury_accounts")
      .select("id, kind")
      .eq("id", taId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (taErr || !taRow?.id) {
      return { success: false, error: "Cuenta no encontrada." }
    }

    const kind = parseTreasuryKind(taRow.kind)
    const isCard = kind === "card_payable"
    const pmIds = await listPaymentMethodIdsForTreasuryAccount(
      supabase,
      popId,
      taId,
    )
    const primaryPm = pmIds[0] ?? null

    if (isCard) {
      if (!primaryPm) {
        return {
          success: false,
          error:
            "Esta tarjeta corporativa no tiene formas de pago vinculadas.",
        }
      }
      const res = await getPaymentMethodDetail(popId, primaryPm, "pay")
      if (!res.success) return res
      return {
        success: true,
        data: {
          ...res.data,
          reconciliationPaymentMethodId: primaryPm,
        },
      }
    }

    if (primaryPm) {
      const [recv, pay] = await Promise.all([
        getPaymentMethodDetail(popId, primaryPm, "receive"),
        getPaymentMethodDetail(popId, primaryPm, "pay"),
      ])
      if (!recv.success) return recv
      if (!pay.success) return pay

      const movements = [...recv.data.movements, ...pay.data.movements]
      movements.sort((a, b) => {
        const dc = b.date.localeCompare(a.date)
        if (dc !== 0) return dc
        return b.id.localeCompare(a.id)
      })

      const enrichedMovements = movements.slice(0, 60)
      let totalIn = 0
      let totalOut = 0
      for (const m of enrichedMovements) {
        if (m.direction === "in") totalIn = roundMoney(totalIn + m.amount)
        else totalOut = roundMoney(totalOut + m.amount)
      }

      const stmtLines =
        pay.data.statementLines.length > 0
          ? pay.data.statementLines
          : recv.data.statementLines

      return {
        success: true,
        data: {
          settlements: pay.data.settlements,
          movements: enrichedMovements,
          movementTotals: {
            in: totalIn,
            out: totalOut,
            net: roundMoney(totalIn - totalOut),
          },
          statementLines: stmtLines,
          supportsBankReconciliation: pay.data.supportsBankReconciliation,
          reconciliationSummary: {
            movementsReconciled:
              recv.data.reconciliationSummary.movementsReconciled +
              pay.data.reconciliationSummary.movementsReconciled,
            movementsPending:
              recv.data.reconciliationSummary.movementsPending +
              pay.data.reconciliationSummary.movementsPending,
            statementReconciled: pay.data.reconciliationSummary.statementReconciled,
            statementPending: pay.data.reconciliationSummary.statementPending,
            statementTotalIn: pay.data.reconciliationSummary.statementTotalIn,
            statementTotalOut: pay.data.reconciliationSummary.statementTotalOut,
          },
          reconciliationPaymentMethodId: primaryPm,
        },
      }
    }

    const { data: stmtRows, error: stmtErr } = await supabase
      .from("bank_statement_lines")
      .select("id, line_date, description, amount, direction, source")
      .eq("pop_id", popId)
      .eq("treasury_account_id", taId)
      .order("line_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100)

    if (stmtErr) {
      return {
        success: false,
        error: stmtErr.message || "No se pudo cargar el extracto bancario.",
      }
    }

    const statementLines: BankStatementLineRow[] = (stmtRows || []).map((r) => ({
      id: String(r.id),
      lineDate: String(r.line_date ?? "").slice(0, 10),
      description: String(r.description ?? ""),
      amount: parseAmount(r.amount),
      direction: String(r.direction) === "in" ? "in" : "out",
      source: String(r.source) === "csv" ? "csv" : "manual",
      reconciled: false,
    }))

    return {
      success: true,
      data: {
        settlements: [],
        movements: [],
        movementTotals: { in: 0, out: 0, net: 0 },
        statementLines,
        supportsBankReconciliation: true,
        reconciliationSummary: {
          movementsReconciled: 0,
          movementsPending: 0,
          statementReconciled: 0,
          statementPending: statementLines.length,
          statementTotalIn: statementLines
            .filter((l) => l.direction === "in")
            .reduce((s, l) => roundMoney(s + l.amount), 0),
          statementTotalOut: statementLines
            .filter((l) => l.direction === "out")
            .reduce((s, l) => roundMoney(s + l.amount), 0),
        },
        reconciliationPaymentMethodId: null,
      },
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export type RecordTreasurySettlementForAccountInput = {
  cardTreasuryAccountId: string
  fundingTreasuryAccountId: string
  amount: number
  settledAt: string
  notes?: string
}

export async function recordTreasurySettlementForAccount(
  popId: string,
  input: RecordTreasurySettlementForAccountInput,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const cardTaId = input.cardTreasuryAccountId?.trim()
    const fundTaId = input.fundingTreasuryAccountId?.trim()
    if (!cardTaId) {
      return { success: false, error: "Elegí la tarjeta a liquidar." }
    }
    if (!fundTaId) {
      return { success: false, error: "Elegí desde qué cuenta vas a pagar." }
    }
    if (cardTaId === fundTaId) {
      return {
        success: false,
        error: "La cuenta de pago debe ser distinta de la tarjeta.",
      }
    }

    const supabase = await createClient()
    const { data: cardTa, error: cardTaErr } = await supabase
      .from("treasury_accounts")
      .select("id, kind")
      .eq("id", cardTaId)
      .eq("pop_id", popId)
      .eq("is_active", true)
      .maybeSingle()
    if (cardTaErr || !cardTa?.id) {
      return { success: false, error: "Tarjeta corporativa inválida." }
    }
    if (parseTreasuryKind(cardTa.kind) !== "card_payable") {
      return {
        success: false,
        error: "La cuenta seleccionada no es una tarjeta corporativa.",
      }
    }

    const { data: fundTa, error: fundTaErr } = await supabase
      .from("treasury_accounts")
      .select("id, kind")
      .eq("id", fundTaId)
      .eq("pop_id", popId)
      .eq("is_active", true)
      .maybeSingle()
    if (fundTaErr || !fundTa?.id) {
      return { success: false, error: "Cuenta de fondeo inválida." }
    }
    if (parseTreasuryKind(fundTa.kind) === "card_payable") {
      return {
        success: false,
        error: "Pagá el resumen desde banco, efectivo o billetera.",
      }
    }

    const cardPm = await getPrimaryPaymentMethodForTreasuryAccount(
      supabase,
      popId,
      cardTaId,
    )
    if (!cardPm) {
      return {
        success: false,
        error:
          "Vinculá al menos una forma de pago a esta tarjeta para registrar liquidaciones.",
      }
    }

    const fundPm = await getPrimaryPaymentMethodForTreasuryAccount(
      supabase,
      popId,
      fundTaId,
    )
    if (!fundPm) {
      return {
        success: false,
        error:
          "La cuenta de origen no tiene medios vinculados. Creá una forma de pago o usá otra cuenta.",
      }
    }

    return recordTreasurySettlement(popId, {
      cardPaymentMethodId: cardPm,
      fundingPaymentMethodId: fundPm,
      amount: input.amount,
      settledAt: input.settledAt,
      notes: input.notes,
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export type TreasuryAccountOption = {
  id: string
  name: string
  kind: TreasuryAccountKind
  isSystemDefault: boolean
}

export type PaymentMethodPosRow = {
  id: string
  name: string
  kind: PaymentMethodKind
  isActive: boolean
  sortOrder: number
  treasuryAccountId: string
  treasuryAccountName: string
  treasuryAccountKind: TreasuryAccountKind
}

export async function getPaymentMethodsPosList(popId: string): Promise<
  | {
      success: true
      rows: PaymentMethodPosRow[]
      treasuryAccounts: TreasuryAccountOption[]
      popName: string
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
    }
  | {
      success: false
      error: string
      redirect?: string
      rows: PaymentMethodPosRow[]
      treasuryAccounts: TreasuryAccountOption[]
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
      popName?: string
    }
> {
  const empty = {
    rows: [] as PaymentMethodPosRow[],
    treasuryAccounts: [] as TreasuryAccountOption[],
    canCreate: false,
    canUpdate: false,
    canDelete: false,
  }

  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return {
        success: false,
        error: access.error || "Sin acceso",
        redirect: "/home",
        ...empty,
      }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.PAYMENT_METHOD_READ.resource,
        POP_PERMS.PAYMENT_METHOD_READ.action,
      )
    ) {
      return {
        success: false,
        error: "No tenés permiso para ver formas de pago.",
        redirect: popMenuHref(await getPopSiteId(popId), popId),
        ...empty,
      }
    }

    const canCreate = permissionKeysInclude(
      snap.keys,
      POP_PERMS.PAYMENT_METHOD_CREATE.resource,
      POP_PERMS.PAYMENT_METHOD_CREATE.action,
    )
    const canUpdate = permissionKeysInclude(
      snap.keys,
      POP_PERMS.PAYMENT_METHOD_UPDATE.resource,
      POP_PERMS.PAYMENT_METHOD_UPDATE.action,
    )
    const canDelete = permissionKeysInclude(
      snap.keys,
      POP_PERMS.PAYMENT_METHOD_DELETE.resource,
      POP_PERMS.PAYMENT_METHOD_DELETE.action,
    )

    const popRes = await getPopById(popId)
    const popName =
      popRes.success && popRes.pop ? String(popRes.pop.name ?? "") : ""
    const supabase = await createClient()

    const { data: taRows, error: taErr } = await supabase
      .from("treasury_accounts")
      .select("id, name, kind, is_system_default")
      .eq("pop_id", popId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })

    if (taErr) {
      return {
        success: false,
        error: taErr.message || "No se pudieron cargar las cuentas.",
        ...empty,
        popName,
        canCreate,
        canUpdate,
        canDelete,
      }
    }

    const treasuryAccounts: TreasuryAccountOption[] = (taRows || []).map(
      (r) => ({
        id: String(r.id),
        name: String(r.name ?? ""),
        kind: parseTreasuryKind(r.kind),
        isSystemDefault: Boolean(r.is_system_default),
      }),
    )

    const taNameById = new Map(
      treasuryAccounts.map((t) => [t.id, t.name] as const),
    )
    const taKindById = new Map(
      treasuryAccounts.map((t) => [t.id, t.kind] as const),
    )

    const { data, error } = await supabase
      .from("payment_methods")
      .select(
        "id, name, kind, usage, is_active, sort_order, treasury_account_id",
      )
      .eq("pop_id", popId)
      .in("usage", ["receive", "both"])
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })

    if (error) {
      return {
        success: false,
        error: error.message || "No se pudieron cargar las formas de pago.",
        ...empty,
        treasuryAccounts,
        popName,
        canCreate,
        canUpdate,
        canDelete,
      }
    }

    const rows: PaymentMethodPosRow[] = (data || [])
      .filter((r) => r.treasury_account_id != null)
      .map((r) => {
        const taId = String(r.treasury_account_id)
        return {
          id: String(r.id),
          name: String(r.name ?? ""),
          kind: parseKind(r.kind),
          isActive: Boolean(r.is_active),
          sortOrder: Number(r.sort_order ?? 0),
          treasuryAccountId: taId,
          treasuryAccountName: taNameById.get(taId) ?? treasuryKindLabel(taKindById.get(taId) ?? "other"),
          treasuryAccountKind: taKindById.get(taId) ?? "other",
        }
      })

    return {
      success: true,
      rows,
      treasuryAccounts,
      popName,
      canCreate,
      canUpdate,
      canDelete,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message, ...empty, popName: "" }
  }
}

/** @deprecated Usar getPopPaymentsHub */
export async function getPopPaymentMethodsTable(popId: string) {
  const now = new Date()
  const res = await getPopPaymentsHub(
    popId,
    now.getFullYear(),
    now.getMonth() + 1,
  )
  if (!res.success) {
    return {
      success: false as const,
      error: res.error,
      redirect: res.redirect,
      rows: res.rows,
      canCreate: res.canCreate,
      canUpdate: res.canUpdate,
      canDelete: res.canDelete,
      popName: res.popName,
    }
  }
  return {
    success: true as const,
    rows: res.rows,
    popName: res.popName,
    canCreate: res.canCreate,
    canUpdate: res.canUpdate,
    canDelete: res.canDelete,
  }
}
