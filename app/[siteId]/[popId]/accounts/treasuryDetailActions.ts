"use server"

import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { validatePopAccess } from "@/lib/popHelpers"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import {
  postPosAcreditationLedger,
  postTreasurySettlementLedger,
} from "@/lib/treasuryReconciliationLedger"
import { resolveTreasuryAccountLedgerAccountId } from "@/lib/treasuryAccountResolve"
import { requireAuthenticatedUser } from "@/lib/authHelpers"
import { parseBankStatementCsv } from "@/lib/parseBankStatementCsv"
import {
  type OperationPaymentKind,
  isValidOperationPaymentKind,
} from "@/lib/operationPaymentKinds"
import {
  type TreasuryAccountKind,
  isCardPayableChartCode,
  isMotherTreasuryAccount,
  isSettlementReceivableChartCode,
  treasuryKindLabel,
} from "@/lib/treasuryAccountKinds"
import { loadPopLedgerTimeZone } from "@/lib/popTimezoneServer"
import { toPopCalendarDate } from "@/lib/popTimezone"
import {
  formatTreasuryPosSaleLabel,
  formatTreasuryPurchasePaymentLabel,
  formatTreasuryExpensePaymentLabel,
  parseTreasurySaleChannel,
} from "@/app/[siteId]/[popId]/accounts/treasuryAccountUiUtils"
import { createClient } from "@/utils/supabase/server"

export type TreasurySettlementRow = {
  id: string
  amount: number
  settledAt: string
  notes: string
  fundingMethodName: string | null
}

export type TreasuryMovementBalanceImpact = "real" | "informative"

export type PaymentMethodMovementRow = {
  id: string
  movementRefId: string
  kind:
    | "sale"
    | "purchase"
    | "expense"
    | "card_settlement"
    | "funding_out"
    | "cash_register_close"
    | "pos_liquidation"
    | "pos_liquidation_fee"
  date: string
  /** Instante del movimiento para ordenar y mostrar hora (ISO timestamptz o fecha). */
  occurredAt?: string
  amount: number
  label: string
  /** Comisiones POS u otros cargos de tarjeta asociados al movimiento. */
  adjustmentAmount?: number
  direction: "in" | "out"
  /** Si afecta el saldo real de la cuenta madre o solo el subledger pendiente. */
  balanceImpact: TreasuryMovementBalanceImpact
  reconciled: boolean
  linkedStatementLineId: string | null
  sourceAccountName?: string | null
  treasuryAccountLabel?: string | null
  paymentKind?: OperationPaymentKind | null
  saleChannel?: "pos" | "table" | "counter" | null
}

export type TreasuryPeriodSummary = {
  /** Saldo real al cierre del día anterior al inicio del período. */
  openingBalance: number | null
  /** Saldo real al cierre del período seleccionado (hoy si no hay hasta). */
  currentBalance: number
}

export type TreasuryAccountDetailOptions = {
  dateFrom?: string
  dateTo?: string
  /** Incluye movimientos de cuentas hijas (POS, tarjetas) además de la principal. */
  includeRelatedAccounts?: boolean
  relatedTreasuryAccountIds?: string[]
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

export type TreasuryAccountDetailResult = {
  settlements: TreasurySettlementRow[]
  movements: PaymentMethodMovementRow[]
  /** Totales de movimientos que afectan el saldo real en el período. */
  movementTotals: { in: number; out: number; net: number }
  periodSummary: TreasuryPeriodSummary | null
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

export type RecordTreasurySettlementForAccountInput = {
  cardTreasuryAccountId: string
  fundingTreasuryAccountId: string
  /** Monto pagado aplicado al pasivo de la tarjeta. */
  principalAmount: number
  /** Comisiones, intereses e impuestos adicionales. */
  adjustmentAmount?: number
  settledAt: string
  notes?: string
}

export type TreasuryReconciliationEventRow = {
  id: string
  kind: "pos_acreditation" | "card_settlement" | "cash_register_close_adjustment"
  eventDate: string
  /** Instante del evento para ordenar y mostrar hora. */
  eventOccurredAt?: string
  accountName: string
  principalAmount: number
  adjustmentAmount: number
  totalAmount: number
  notes: string
  accountingEntryId: string | null
  accountingEntryNumber: number | null
  accountingEntryStatus: string | null
  createdByName?: string | null
}

export type TreasuryPosSummaryMovementRow = {
  id: string
  kind:
    | "pos_sale"
    | "cash_register_close"
    | "purchase_payment"
    | "expense_payment"
  date: string
  amount: number
  direction: "in" | "out"
  label: string
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

function parseAmount(v: unknown): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return roundMoney(n)
}

function parseTreasuryKind(v: unknown): TreasuryAccountKind {
  const k = String(v ?? "other")
  if (k === "cash" || k === "bank" || k === "wallet" || k === "card_payable") {
    return k
  }
  return "other"
}

type TreasuryAccountMeta = {
  name: string
  kind: TreasuryAccountKind
  chartCode: string
}

function parsePaymentKind(v: unknown): OperationPaymentKind | null {
  const k = String(v ?? "").trim()
  return isValidOperationPaymentKind(k) ? k : null
}

function resolveTreasuryAccountLabel(
  meta: TreasuryAccountMeta | undefined,
): string {
  if (!meta) return "—"
  const name = meta.name.trim()
  if (name) return name
  if (isSettlementReceivableChartCode(meta.chartCode)) return "Terminal POS"
  if (isCardPayableChartCode(meta.chartCode) || meta.kind === "card_payable") {
    return "Tarjeta corporativa"
  }
  return treasuryKindLabel(meta.kind)
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

function dayBeforeIso(isoDate: string): string {
  const dt = new Date(`${isoDate.slice(0, 10)}T12:00:00`)
  dt.setDate(dt.getDate() - 1)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`
}

async function resolvePopLedgerTimeZone(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
): Promise<string> {
  return loadPopLedgerTimeZone(supabase, popId)
}

function saleLocalDate(soldAt: unknown, timeZone: string): string {
  return toPopCalendarDate(String(soldAt ?? ""), timeZone)
}

function resolveMovementBalanceImpact(
  kind: PaymentMethodMovementRow["kind"],
  sourceAccountName?: string | null,
): TreasuryMovementBalanceImpact {
  switch (kind) {
    case "pos_liquidation":
      return "real"
    case "pos_liquidation_fee":
    case "cash_register_close":
      return "informative"
    case "sale":
      return sourceAccountName ? "informative" : "real"
    default:
      return "real"
  }
}

async function computeMotherPendingTotalsAsOf(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  relatedIds: string[],
  accountMeta: Map<string, TreasuryAccountMeta>,
  asOfDate: string,
): Promise<{ toLiquidate: number; toPay: number }> {
  let toLiquidate = 0
  let toPay = 0
  for (const childId of relatedIds) {
    const meta = accountMeta.get(childId)
    if (!meta) continue
    if (isSettlementReceivableChartCode(meta.chartCode)) {
      const balance = await computeChildPendingBalanceAsOf(
        supabase,
        popId,
        childId,
        "pos",
        asOfDate,
      )
      toLiquidate = roundMoney(toLiquidate + balance)
    } else if (
      isCardPayableChartCode(meta.chartCode) ||
      meta.kind === "card_payable"
    ) {
      const balance = await computeChildPendingBalanceAsOf(
        supabase,
        popId,
        childId,
        "card_payable",
        asOfDate,
      )
      toPay = roundMoney(toPay + balance)
    }
  }
  return { toLiquidate, toPay }
}

function computePeriodMovementTotals(movements: PaymentMethodMovementRow[]): {
  movementTotals: { in: number; out: number; net: number }
} {
  let realIn = 0
  let realOut = 0

  for (const m of movements) {
    if (m.balanceImpact !== "real") continue
    if (m.direction === "in") realIn = roundMoney(realIn + m.amount)
    else realOut = roundMoney(realOut + m.amount)
  }

  return {
    movementTotals: {
      in: realIn,
      out: realOut,
      net: roundMoney(realIn - realOut),
    },
  }
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

async function requireTreasuryUpdate(
  popId: string,
): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
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

async function computeLifetimePaidOutForAccount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  treasuryAccountId: string,
): Promise<number> {
  let total = 0
  for (const table of ["purchase_payments", "expense_payments"] as const) {
    const { data } = await supabase
      .from(table)
      .select("amount")
      .eq("pop_id", popId)
      .eq("treasury_account_id", treasuryAccountId)
    for (const row of data || []) {
      total = roundMoney(total + parseAmount(row.amount))
    }
  }
  return total
}

async function computeSettledForAccount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  treasuryAccountId: string,
): Promise<number> {
  const { data } = await supabase
    .from("treasury_settlements")
    .select("amount")
    .eq("pop_id", popId)
    .eq("card_treasury_account_id", treasuryAccountId)
  let total = 0
  for (const row of data || []) {
    total = roundMoney(total + parseAmount(row.amount))
  }
  return total
}

async function computeChartAccountBalance(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  chartAccountId: string,
): Promise<number> {
  const { data: accRow } = await supabase
    .from("accounting_chart_of_accounts")
    .select("nature")
    .eq("pop_id", popId)
    .eq("id", chartAccountId)
    .maybeSingle()
  if (!accRow) return 0

  const nature = String(accRow.nature ?? "deudora")
  const { data: entryRows } = await supabase
    .from("accounting_entries")
    .select("id")
    .eq("pop_id", popId)
    .eq("status", "posted")
  const entryIds = (entryRows || []).map((r) => String(r.id))
  if (entryIds.length === 0) return 0

  const { data: lineRows } = await supabase
    .from("accounting_entry_lines")
    .select("debit_amount, credit_amount")
    .eq("account_id", chartAccountId)
    .in("entry_id", entryIds)

  let balance = 0
  for (const ln of lineRows || []) {
    const d = parseAmount(ln.debit_amount)
    const c = parseAmount(ln.credit_amount)
    const delta = nature === "acreedora" ? c - d : d - c
    balance = roundMoney(balance + delta)
  }
  return balance
}

async function computeChartAccountBalanceAsOf(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  chartAccountId: string,
  asOfDate: string,
): Promise<number> {
  const { data: accRow } = await supabase
    .from("accounting_chart_of_accounts")
    .select("nature")
    .eq("pop_id", popId)
    .eq("id", chartAccountId)
    .maybeSingle()
  if (!accRow) return 0

  const nature = String(accRow.nature ?? "deudora")
  const { data: entryRows } = await supabase
    .from("accounting_entries")
    .select("id")
    .eq("pop_id", popId)
    .eq("status", "posted")
    .lte("entry_date", asOfDate)
  const entryIds = (entryRows || []).map((r) => String(r.id))
  if (entryIds.length === 0) return 0

  const { data: lineRows } = await supabase
    .from("accounting_entry_lines")
    .select("debit_amount, credit_amount")
    .eq("account_id", chartAccountId)
    .in("entry_id", entryIds)

  let balance = 0
  for (const ln of lineRows || []) {
    const d = parseAmount(ln.debit_amount)
    const c = parseAmount(ln.credit_amount)
    const delta = nature === "acreedora" ? c - d : d - c
    balance = roundMoney(balance + delta)
  }
  return balance
}

async function computePaidOutAsOf(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  treasuryAccountId: string,
  asOfDate: string,
): Promise<number> {
  let total = 0
  for (const table of ["purchase_payments", "expense_payments"] as const) {
    const { data } = await supabase
      .from(table)
      .select("amount, paid_at")
      .eq("pop_id", popId)
      .eq("treasury_account_id", treasuryAccountId)
      .lte("paid_at", asOfDate)
    for (const row of data || []) {
      total = roundMoney(total + parseAmount(row.amount))
    }
  }
  return total
}

async function computeSettledPrincipalAsOf(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  cardTreasuryAccountId: string,
  asOfDate: string,
): Promise<number> {
  const { data } = await supabase
    .from("treasury_settlements")
    .select("principal_amount, amount, settled_at")
    .eq("pop_id", popId)
    .eq("card_treasury_account_id", cardTreasuryAccountId)
    .lte("settled_at", asOfDate)
  let total = 0
  for (const row of data || []) {
    total = roundMoney(
      total + parseAmount(row.principal_amount ?? row.amount),
    )
  }
  return total
}

async function computeChildPendingBalanceAsOf(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  childTreasuryAccountId: string,
  childRole: "pos" | "card_payable",
  asOfDate: string,
): Promise<number> {
  if (childRole === "pos") {
    const ledgerId = await resolveTreasuryAccountLedgerAccountId(
      supabase,
      popId,
      childTreasuryAccountId,
    )
    if (!ledgerId) return 0
    return computeChartAccountBalanceAsOf(
      supabase,
      popId,
      ledgerId,
      asOfDate,
    )
  }

  const charged = await computePaidOutAsOf(
    supabase,
    popId,
    childTreasuryAccountId,
    asOfDate,
  )
  const settled = await computeSettledPrincipalAsOf(
    supabase,
    popId,
    childTreasuryAccountId,
    asOfDate,
  )
  return roundMoney(Math.max(0, charged - settled))
}

export async function getTreasuryChildPendingBalanceAsOf(
  popId: string,
  childTreasuryAccountId: string,
  childRole: "pos" | "card_payable",
  asOfDate: string,
): Promise<
  | { success: true; balance: number }
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
      return { success: false, error: "Sin permiso para consultar saldos." }
    }

    const childId = childTreasuryAccountId.trim()
    const date = asOfDate.trim()
    if (!childId) {
      return { success: false, error: "Integración inválida." }
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { success: false, error: "Fecha inválida." }
    }

    const supabase = await createClient()
    const balance = await computeChildPendingBalanceAsOf(
      supabase,
      popId,
      childId,
      childRole,
      date,
    )
    return { success: true, balance }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

async function computePeriodGrossForChildAccount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  childTreasuryAccountId: string,
  childRole: "pos" | "card_payable",
  inDateRange: (iso: string) => boolean,
  ledgerTimeZone: string,
): Promise<number> {
  if (childRole === "pos") {
    const { data: spRows, error: spErr } = await supabase
      .from("sale_payments")
      .select(
        `
          amount,
          sales!inner (
            sold_at,
            status
          )
        `,
      )
      .eq("pop_id", popId)
      .eq("treasury_account_id", childTreasuryAccountId)
      .eq("sales.status", "completed")

    if (spErr) {
      throw new Error(spErr.message || "No se pudieron cargar cobros del período.")
    }

    let total = 0
    for (const row of spRows || []) {
      const sale = row.sales as unknown as { sold_at?: string } | null
      const date = saleLocalDate(sale?.sold_at, ledgerTimeZone)
      if (!inDateRange(date)) continue
      total = roundMoney(total + parseAmount(row.amount))
    }
    return total
  }

  let total = 0
  for (const table of ["purchase_payments", "expense_payments"] as const) {
    const { data, error } = await supabase
      .from(table)
      .select("amount, paid_at")
      .eq("pop_id", popId)
      .eq("treasury_account_id", childTreasuryAccountId)

    if (error) {
      throw new Error(error.message || "No se pudieron cargar cargos del período.")
    }

    for (const row of data || []) {
      const date = String(row.paid_at ?? "").slice(0, 10)
      if (!inDateRange(date)) continue
      total = roundMoney(total + parseAmount(row.amount))
    }
  }
  return total
}

async function loadPosCashRegisterCloseAdjustmentEvents(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  childTreasuryAccountId: string,
  childName: string,
  inDateRange: (iso: string) => boolean,
): Promise<TreasuryReconciliationEventRow[]> {
  const ledgerId = await resolveTreasuryAccountLedgerAccountId(
    supabase,
    popId,
    childTreasuryAccountId,
  )
  if (!ledgerId) return []

  const { data: entryRows } = await supabase
    .from("accounting_entries")
    .select("id, entry_date, entry_number, status, description")
    .eq("pop_id", popId)
    .eq("source_type", "cash_register_close")
    .eq("status", "posted")

  const entryIds = (entryRows || []).map((row) => String(row.id))
  if (entryIds.length === 0) return []

  const entryById = new Map(
    (entryRows || []).map((row) => [String(row.id), row]),
  )

  const { data: lineRows } = await supabase
    .from("accounting_entry_lines")
    .select("id, entry_id, debit_amount, credit_amount, description")
    .eq("account_id", ledgerId)
    .in("entry_id", entryIds)

  const events: TreasuryReconciliationEventRow[] = []
  for (const line of lineRows || []) {
    const entryId = String(line.entry_id ?? "")
    const entry = entryById.get(entryId)
    if (!entry) continue

    const eventDate = String(entry.entry_date ?? "").slice(0, 10)
    if (!inDateRange(eventDate)) continue

    const debit = parseAmount(line.debit_amount)
    const credit = parseAmount(line.credit_amount)
    const net = roundMoney(debit - credit)
    if (Math.abs(net) < 0.01) continue

    const notes =
      (typeof line.description === "string" && line.description.trim()) ||
      (typeof entry.description === "string" && entry.description.trim()) ||
      "Ajuste de cierre de caja"

    events.push({
      id: String(line.id),
      kind: "cash_register_close_adjustment",
      eventDate,
      accountName: childName,
      principalAmount: net,
      adjustmentAmount: 0,
      totalAmount: net,
      notes,
      accountingEntryId: entryId,
      accountingEntryNumber:
        entry.entry_number != null && Number.isFinite(Number(entry.entry_number))
          ? Number(entry.entry_number)
          : null,
      accountingEntryStatus:
        entry.status != null ? String(entry.status) : null,
    })
  }

  return events
}

async function loadUserDisplayNames(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userIds: string[],
): Promise<Map<string, string>> {
  const unique = [...new Set(userIds.filter(Boolean))]
  const map = new Map<string, string>()
  if (unique.length === 0) return map
  const { data } = await supabase
    .from("users")
    .select("id, first_name, last_name")
    .in("id", unique)
  for (const row of data || []) {
    const name =
      `${String(row.first_name ?? "").trim()} ${String(row.last_name ?? "").trim()}`.trim()
    map.set(String(row.id), name || "Usuario")
  }
  return map
}

type TreasurySaleLabelSourceRow = {
  table_session_id?: string | null
  counter_order_id?: string | null
}

async function loadTableLabelsBySessionIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  sessionIds: string[],
): Promise<Map<string, string>> {
  const labelsBySessionId = new Map<string, string>()
  if (sessionIds.length === 0) return labelsBySessionId

  const { data: sessions, error } = await supabase
    .from("table_sessions")
    .select("id, dining_table_id, table_session_tables ( dining_table_id )")
    .eq("pop_id", popId)
    .in("id", sessionIds)

  if (error || !sessions?.length) return labelsBySessionId

  const tableIds = new Set<string>()
  for (const session of sessions) {
    if (session.dining_table_id) {
      tableIds.add(String(session.dining_table_id))
    }
    const extras = session.table_session_tables as
      | Array<{ dining_table_id?: string }>
      | null
    for (const row of extras ?? []) {
      if (row.dining_table_id) tableIds.add(String(row.dining_table_id))
    }
  }

  if (tableIds.size === 0) return labelsBySessionId

  const { data: tables } = await supabase
    .from("dining_tables")
    .select("id, label")
    .eq("pop_id", popId)
    .in("id", [...tableIds])

  const labelByTableId = new Map<string, string>()
  for (const table of tables ?? []) {
    const label = typeof table.label === "string" ? table.label.trim() : ""
    if (label) labelByTableId.set(String(table.id), label)
  }

  for (const session of sessions) {
    const orderedTableIds = [String(session.dining_table_id)]
    const extras = session.table_session_tables as
      | Array<{ dining_table_id?: string }>
      | null
    for (const row of extras ?? []) {
      const tableId = row.dining_table_id ? String(row.dining_table_id) : ""
      if (tableId && !orderedTableIds.includes(tableId)) {
        orderedTableIds.push(tableId)
      }
    }
    const labels = orderedTableIds
      .map((tableId) => labelByTableId.get(tableId))
      .filter((label): label is string => Boolean(label))
    if (labels.length > 0) {
      labelsBySessionId.set(String(session.id), labels.join(" + "))
    }
  }

  return labelsBySessionId
}

async function loadCounterOrderLabelsByOrderIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  orderIds: string[],
): Promise<Map<string, string>> {
  const labelByOrderId = new Map<string, string>()
  if (orderIds.length === 0) return labelByOrderId

  const { data, error } = await supabase
    .from("counter_orders")
    .select("id, order_number")
    .eq("pop_id", popId)
    .in("id", orderIds)

  if (error || !data?.length) return labelByOrderId

  for (const row of data) {
    const orderNumber = Number(row.order_number)
    if (!Number.isFinite(orderNumber)) continue
    labelByOrderId.set(String(row.id), `#${orderNumber}`)
  }

  return labelByOrderId
}

async function loadTreasurySaleContextLabels(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  saleRows: TreasurySaleLabelSourceRow[],
): Promise<{
  tableLabelsBySessionId: Map<string, string>
  counterOrderLabelsByOrderId: Map<string, string>
}> {
  const sessionIds = [
    ...new Set(
      saleRows
        .map((row) =>
          row.table_session_id != null ? String(row.table_session_id).trim() : "",
        )
        .filter(Boolean),
    ),
  ]
  const orderIds = [
    ...new Set(
      saleRows
        .map((row) =>
          row.counter_order_id != null ? String(row.counter_order_id).trim() : "",
        )
        .filter(Boolean),
    ),
  ]

  const [tableLabelsBySessionId, counterOrderLabelsByOrderId] = await Promise.all([
    loadTableLabelsBySessionIds(supabase, popId, sessionIds),
    loadCounterOrderLabelsByOrderIds(supabase, popId, orderIds),
  ])

  return { tableLabelsBySessionId, counterOrderLabelsByOrderId }
}

type TreasurySalePaymentSaleFields = TreasurySaleLabelSourceRow & {
  sold_at?: string
  customer_name?: string | null
  sale_channel?: string | null
}

function parseTreasuryExpensePaymentFields(expense: unknown): {
  description?: string | null
  categoryName?: string | null
} {
  if (!expense || typeof expense !== "object") return {}
  const row = expense as {
    description?: string | null
    expense_categories?:
      | { name?: string | null }
      | Array<{ name?: string | null }>
      | null
  }
  const categoryRel = row.expense_categories
  const category = Array.isArray(categoryRel) ? categoryRel[0] : categoryRel
  return {
    description: row.description,
    categoryName: category?.name ?? null,
  }
}

function formatTreasurySalePaymentLabel(
  sale: TreasurySalePaymentSaleFields | null | undefined,
  tableLabelsBySessionId: Map<string, string>,
  counterOrderLabelsByOrderId: Map<string, string>,
  options?: {
    paymentKind?: string | null
    usePaymentKindForPosChannel?: boolean
  },
): string {
  const saleChannel = parseTreasurySaleChannel(sale?.sale_channel)
  const sessionId =
    sale?.table_session_id != null ? String(sale.table_session_id).trim() : ""
  const orderId =
    sale?.counter_order_id != null ? String(sale.counter_order_id).trim() : ""

  return formatTreasuryPosSaleLabel({
    saleChannel,
    tableLabel: sessionId ? tableLabelsBySessionId.get(sessionId) : null,
    counterOrderLabel: orderId ? counterOrderLabelsByOrderId.get(orderId) : null,
    customerName: sale?.customer_name,
    paymentKind: options?.paymentKind,
    usePaymentKindForPosChannel: options?.usePaymentKindForPosChannel,
  })
}

async function loadPosSummaryMovements(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  childTreasuryAccountId: string,
  childName: string,
  inDateRange: (iso: string) => boolean,
  ledgerTimeZone: string,
): Promise<TreasuryPosSummaryMovementRow[]> {
  const movements: TreasuryPosSummaryMovementRow[] = []

  const { data: spRows, error: spErr } = await supabase
    .from("sale_payments")
    .select(
      `
        id,
        amount,
        sales!inner (
          sold_at,
          status,
          customer_name,
          sale_channel,
          table_session_id,
          counter_order_id
        )
      `,
    )
    .eq("pop_id", popId)
    .eq("treasury_account_id", childTreasuryAccountId)
    .eq("sales.status", "completed")

  if (spErr) {
    throw new Error(spErr.message || "No se pudieron cargar cobros POS.")
  }

  const saleRowsForLabels = (spRows || []).map((row) => {
    const sale = row.sales as unknown as TreasurySalePaymentSaleFields | null
    return {
      table_session_id: sale?.table_session_id,
      counter_order_id: sale?.counter_order_id,
    }
  })
  const { tableLabelsBySessionId, counterOrderLabelsByOrderId } =
    await loadTreasurySaleContextLabels(supabase, popId, saleRowsForLabels)

  for (const row of spRows || []) {
    const sale = row.sales as unknown as TreasurySalePaymentSaleFields | null
    const date = saleLocalDate(sale?.sold_at, ledgerTimeZone)
    if (!inDateRange(date)) continue
    movements.push({
      id: String(row.id),
      kind: "pos_sale",
      date,
      amount: parseAmount(row.amount),
      direction: "in",
      label: formatTreasurySalePaymentLabel(
        sale,
        tableLabelsBySessionId,
        counterOrderLabelsByOrderId,
      ),
    })
  }

  const closeEvents = await loadPosCashRegisterCloseAdjustmentEvents(
    supabase,
    popId,
    childTreasuryAccountId,
    childName,
    inDateRange,
  )
  for (const event of closeEvents) {
    const signed = event.principalAmount
    if (Math.abs(signed) < 0.01) continue
    movements.push({
      id: event.id,
      kind: "cash_register_close",
      date: event.eventDate,
      amount: Math.abs(signed),
      direction: signed < 0 ? "out" : "in",
      label: event.notes.trim() || "Ajuste de cierre de caja",
    })
  }

  movements.sort((a, b) => {
    const dc = b.date.localeCompare(a.date)
    if (dc !== 0) return dc
    return b.id.localeCompare(a.id)
  })
  return movements
}

async function loadCardConsumptionMovements(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  childTreasuryAccountId: string,
  inDateRange: (iso: string) => boolean,
): Promise<TreasuryPosSummaryMovementRow[]> {
  const movements: TreasuryPosSummaryMovementRow[] = []

  const { data: ppRows, error: ppErr } = await supabase
    .from("purchase_payments")
    .select(
      `
        id,
        amount,
        paid_at,
        purchases (
          supplier_name,
          document_number,
          purchase_kind
        )
      `,
    )
    .eq("pop_id", popId)
    .eq("treasury_account_id", childTreasuryAccountId)

  if (ppErr) {
    throw new Error(ppErr.message || "No se pudieron cargar consumos de compras.")
  }

  for (const row of ppRows || []) {
    const pur = row.purchases as unknown as {
      supplier_name?: string | null
      document_number?: string | null
      purchase_kind?: string | null
    } | null
    const date = String(row.paid_at ?? "").slice(0, 10)
    if (!inDateRange(date)) continue
    movements.push({
      id: String(row.id),
      kind: "purchase_payment",
      date,
      amount: parseAmount(row.amount),
      direction: "out",
      label: formatTreasuryPurchasePaymentLabel({
        purchaseKind: pur?.purchase_kind,
        supplierName: pur?.supplier_name,
        documentNumber: pur?.document_number,
      }),
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
          description,
          expense_categories ( name )
        )
      `,
    )
    .eq("pop_id", popId)
    .eq("treasury_account_id", childTreasuryAccountId)

  if (epErr) {
    throw new Error(epErr.message || "No se pudieron cargar consumos de gastos.")
  }

  for (const row of epRows || []) {
    const exp = parseTreasuryExpensePaymentFields(row.expenses)
    const date = String(row.paid_at ?? "").slice(0, 10)
    if (!inDateRange(date)) continue
    movements.push({
      id: String(row.id),
      kind: "expense_payment",
      date,
      amount: parseAmount(row.amount),
      direction: "out",
      label: formatTreasuryExpensePaymentLabel({
        categoryName: exp.categoryName,
        description: exp.description,
      }),
    })
  }

  movements.sort((a, b) => {
    const dc = b.date.localeCompare(a.date)
    if (dc !== 0) return dc
    return b.id.localeCompare(a.id)
  })
  return movements
}

function netPosSummaryMovements(movements: TreasuryPosSummaryMovementRow[]): number {
  let total = 0
  for (const m of movements) {
    if (m.direction === "in") total = roundMoney(total + m.amount)
    else total = roundMoney(total - m.amount)
  }
  return total
}

export async function getTreasuryAccountDetail(
  popId: string,
  treasuryAccountId: string,
  options?: TreasuryAccountDetailOptions,
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
      .select(
        `
        id,
        kind,
        name,
        accounting_chart_of_accounts ( code )
      `,
      )
      .eq("id", taId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (taErr || !taRow?.id) {
      return { success: false, error: "Cuenta no encontrada." }
    }

    const accountKind = parseTreasuryKind(taRow.kind)
    const isCardPayable = accountKind === "card_payable"
    const isCashAccount = accountKind === "cash"
    const isMovementsHeavyAccount =
      isCashAccount || accountKind === "bank" || accountKind === "wallet"
    const primaryName = String(taRow.name ?? "")
    const primaryChart = taRow.accounting_chart_of_accounts as unknown as {
      code?: string
    } | null
    const primaryChartCode = String(primaryChart?.code ?? "")

    const relatedIds = options?.includeRelatedAccounts
      ? (options.relatedTreasuryAccountIds ?? []).filter((id) => id && id !== taId)
      : []
    const isMotherAccount = isMotherTreasuryAccount(primaryChartCode)
    const movementFetchLimit = isMovementsHeavyAccount
      ? 500
      : relatedIds.length > 0
        ? 200
        : 80
    const paymentOutFetchLimit = isMovementsHeavyAccount
      ? 200
      : relatedIds.length > 0
        ? 120
        : 40
    /** En cuenta madre solo cargamos cobros/pagos directos; lo pendiente (POS) no va al extracto. */
    const movementAccountIds =
      isMotherAccount && !isCardPayable ? [taId] : [taId, ...relatedIds]

    const accountNames = new Map<string, string>()
    const accountMeta = new Map<string, TreasuryAccountMeta>()
    accountNames.set(taId, primaryName)
    accountMeta.set(taId, {
      name: primaryName,
      kind: accountKind,
      chartCode: primaryChartCode,
    })
    if (relatedIds.length > 0) {
      const { data: nameRows } = await supabase
        .from("treasury_accounts")
        .select(
          `
          id,
          name,
          kind,
          accounting_chart_of_accounts ( code )
        `,
        )
        .eq("pop_id", popId)
        .in("id", relatedIds)
      for (const r of nameRows || []) {
        const id = String(r.id)
        const kind = parseTreasuryKind(r.kind)
        const chart = r.accounting_chart_of_accounts as unknown as {
          code?: string
        } | null
        const chartCode = String(chart?.code ?? "")
        const name = String(r.name ?? "")
        accountNames.set(id, name)
        accountMeta.set(id, { name, kind, chartCode })
      }
    }

    const treasuryLabelFor = (treasuryAccountId: string) =>
      resolveTreasuryAccountLabel(accountMeta.get(treasuryAccountId))

    const dateFrom = options?.dateFrom?.trim() ?? ""
    const dateTo = options?.dateTo?.trim() ?? ""
    const inDateRange = (iso: string) => {
      const d = iso.slice(0, 10)
      if (dateFrom && d < dateFrom) return false
      if (dateTo && d > dateTo) return false
      return true
    }
    const ledgerTimeZone = await resolvePopLedgerTimeZone(supabase, popId)

    const settlements: TreasurySettlementRow[] = []
    if (isCardPayable) {
      const { data: settleRows, error: settleErr } = await supabase
        .from("treasury_settlements")
        .select("id, amount, settled_at, notes, funding_treasury_account_id")
        .eq("pop_id", popId)
        .eq("card_treasury_account_id", taId)
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
              r.funding_treasury_account_id
                ? String(r.funding_treasury_account_id)
                : "",
            )
            .filter(Boolean),
        ),
      ]
      const fundingNames = new Map<string, string>()
      if (fundingIds.length > 0) {
        const { data: fundRows } = await supabase
          .from("treasury_accounts")
          .select("id, name")
          .eq("pop_id", popId)
          .in("id", fundingIds)
        for (const f of fundRows || []) {
          fundingNames.set(String(f.id), String(f.name ?? ""))
        }
      }

      for (const r of settleRows || []) {
        const fid =
          r.funding_treasury_account_id != null
            ? String(r.funding_treasury_account_id)
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
      | "movementRefId"
      | "reconciled"
      | "linkedStatementLineId"
      | "balanceImpact"
    >[] = []

    const { data: spRows, error: spErr } = await supabase
      .from("sale_payments")
      .select(
        `
          id,
          amount,
          sale_id,
          treasury_account_id,
          payment_kind,
          sales!inner (
            sold_at,
            status,
            customer_name,
            sale_channel,
            table_session_id,
            counter_order_id
          )
        `,
      )
      .eq("pop_id", popId)
      .in("treasury_account_id", movementAccountIds)
      .eq("sales.status", "completed")
      .limit(movementFetchLimit)

    if (spErr) {
      return {
        success: false,
        error: spErr.message || "No se pudieron cargar cobros.",
      }
    }

    const movementSaleRowsForLabels = (spRows || []).map((row) => {
      const sale = row.sales as unknown as TreasurySalePaymentSaleFields | null
      return {
        table_session_id: sale?.table_session_id,
        counter_order_id: sale?.counter_order_id,
      }
    })
    const {
      tableLabelsBySessionId: movementTableLabelsBySessionId,
      counterOrderLabelsByOrderId: movementCounterOrderLabelsByOrderId,
    } = await loadTreasurySaleContextLabels(
      supabase,
      popId,
      movementSaleRowsForLabels,
    )

    for (const r of spRows || []) {
      const sale = r.sales as unknown as TreasurySalePaymentSaleFields | null
      const saleChannel = parseTreasurySaleChannel(sale?.sale_channel)
      const sourceTaId =
        r.treasury_account_id != null ? String(r.treasury_account_id) : taId
      const date = saleLocalDate(sale?.sold_at, ledgerTimeZone)
      if (!inDateRange(date)) continue
      movements.push({
        id: String(r.id),
        kind: "sale",
        date,
        occurredAt: String(sale?.sold_at ?? "").trim() || date,
        amount: parseAmount(r.amount),
        label: formatTreasurySalePaymentLabel(
          sale,
          movementTableLabelsBySessionId,
          movementCounterOrderLabelsByOrderId,
          {
            paymentKind: parsePaymentKind(r.payment_kind),
            usePaymentKindForPosChannel: true,
          },
        ),
        direction: "in",
        saleChannel,
        paymentKind: parsePaymentKind(r.payment_kind),
        treasuryAccountLabel: treasuryLabelFor(sourceTaId),
        sourceAccountName:
          sourceTaId !== taId
            ? (accountNames.get(sourceTaId) ?? null)
            : null,
      })
    }

    const { data: ppRows, error: ppErr } = await supabase
      .from("purchase_payments")
      .select(
        `
          id,
          amount,
          paid_at,
          created_at,
          treasury_account_id,
          payment_kind,
          purchases (
            supplier_name,
            document_number,
            purchase_kind
          )
        `,
      )
      .eq("pop_id", popId)
      .in("treasury_account_id", movementAccountIds)
      .order("paid_at", { ascending: false })
      .limit(paymentOutFetchLimit)

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
        purchase_kind?: string | null
      } | null
      const sourceTaId =
        r.treasury_account_id != null ? String(r.treasury_account_id) : taId
      const date = String(r.paid_at ?? "").slice(0, 10)
      if (!inDateRange(date)) continue
      movements.push({
        id: String(r.id),
        kind: "purchase",
        date,
        occurredAt: String(r.created_at ?? r.paid_at ?? "").trim() || date,
        amount: parseAmount(r.amount),
        label: formatTreasuryPurchasePaymentLabel({
          purchaseKind: pur?.purchase_kind,
          supplierName: pur?.supplier_name,
          documentNumber: pur?.document_number,
        }),
        direction: "out",
        paymentKind: parsePaymentKind(r.payment_kind),
        treasuryAccountLabel: treasuryLabelFor(sourceTaId),
        sourceAccountName:
          sourceTaId !== taId
            ? (accountNames.get(sourceTaId) ?? null)
            : null,
      })
    }

    const { data: epRows, error: epErr } = await supabase
      .from("expense_payments")
      .select(
        `
          id,
          amount,
          paid_at,
          created_at,
          treasury_account_id,
          payment_kind,
          expenses (
            description,
            expense_categories ( name )
          )
        `,
      )
      .eq("pop_id", popId)
      .in("treasury_account_id", movementAccountIds)
      .order("paid_at", { ascending: false })
      .limit(paymentOutFetchLimit)

    if (epErr) {
      return {
        success: false,
        error: epErr.message || "No se pudieron cargar pagos de gastos.",
      }
    }

    for (const r of epRows || []) {
      const exp = parseTreasuryExpensePaymentFields(r.expenses)
      const sourceTaId =
        r.treasury_account_id != null ? String(r.treasury_account_id) : taId
      const date = String(r.paid_at ?? "").slice(0, 10)
      if (!inDateRange(date)) continue
      movements.push({
        id: String(r.id),
        kind: "expense",
        date,
        occurredAt: String(r.created_at ?? r.paid_at ?? "").trim() || date,
        amount: parseAmount(r.amount),
        label: formatTreasuryExpensePaymentLabel({
          categoryName: exp.categoryName,
          description: exp.description,
        }),
        direction: "out",
        paymentKind: parsePaymentKind(r.payment_kind),
        treasuryAccountLabel: treasuryLabelFor(sourceTaId),
        sourceAccountName:
          sourceTaId !== taId
            ? (accountNames.get(sourceTaId) ?? null)
            : null,
      })
    }

    if (!isCardPayable) {
      const { data: fundSettleRows } = await supabase
        .from("treasury_settlements")
        .select(
          "id, amount, principal_amount, adjustment_amount, settled_at, created_at, notes, card_treasury_account_id",
        )
        .eq("pop_id", popId)
        .eq("funding_treasury_account_id", taId)
        .order("settled_at", { ascending: false })
        .limit(30)

      const cardIds = [
        ...new Set(
          (fundSettleRows || [])
            .map((r) =>
              r.card_treasury_account_id
                ? String(r.card_treasury_account_id)
                : "",
            )
            .filter(Boolean),
        ),
      ]
      const cardNames = new Map<string, string>()
      if (cardIds.length > 0) {
        const { data: cardRows } = await supabase
          .from("treasury_accounts")
          .select("id, name")
          .eq("pop_id", popId)
          .in("id", cardIds)
        for (const c of cardRows || []) {
          cardNames.set(String(c.id), String(c.name ?? ""))
        }
      }

      for (const r of fundSettleRows || []) {
        const cid =
          r.card_treasury_account_id != null
            ? String(r.card_treasury_account_id)
            : ""
        const date = String(r.settled_at ?? "").slice(0, 10)
        if (!inDateRange(date)) continue
        const principal = parseAmount(r.principal_amount ?? r.amount)
        const adjustment = parseAmount(r.adjustment_amount ?? 0)
        movements.push({
          id: `fund-${String(r.id)}`,
          kind: "funding_out",
          date,
          occurredAt: String(r.created_at ?? r.settled_at ?? "").trim() || date,
          amount: principal,
          label: `Resumen tarjeta — ${cardNames.get(cid) ?? "Tarjeta"}`,
          adjustmentAmount: adjustment,
          direction: "out",
          paymentKind: "transfer",
          treasuryAccountLabel: treasuryLabelFor(taId),
        })
      }

      const { data: posAcredRows } = await supabase
        .from("treasury_pos_acreditations")
        .select(
          "id, principal_amount, adjustment_amount, credited_at, created_at, notes, pos_treasury_account_id",
        )
        .eq("pop_id", popId)
        .eq("mother_treasury_account_id", taId)
        .order("credited_at", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(120)

      const acredPosIds = [
        ...new Set(
          (posAcredRows || [])
            .map((row) =>
              row.pos_treasury_account_id
                ? String(row.pos_treasury_account_id)
                : "",
            )
            .filter(Boolean),
        ),
      ]
      const acredPosNames = new Map<string, string>()
      if (acredPosIds.length > 0) {
        const { data: acredNameRows } = await supabase
          .from("treasury_accounts")
          .select("id, name")
          .eq("pop_id", popId)
          .in("id", acredPosIds)
        for (const row of acredNameRows || []) {
          acredPosNames.set(String(row.id), String(row.name ?? ""))
        }
      }

      for (const row of posAcredRows || []) {
        const date = String(row.credited_at ?? "").slice(0, 10)
        if (!inDateRange(date)) continue
        const posId =
          row.pos_treasury_account_id != null
            ? String(row.pos_treasury_account_id)
            : ""
        const posName = acredPosNames.get(posId) ?? "POS"
        const principal = parseAmount(row.principal_amount)
        const adjustment = parseAmount(row.adjustment_amount ?? 0)
        const notes = String(row.notes ?? "").trim()

        if (principal > 0) {
          movements.push({
            id: String(row.id),
            kind: "pos_liquidation",
            date,
            occurredAt: String(row.created_at ?? row.credited_at ?? "").trim() || date,
            amount: principal,
            label: notes || `Recibido — ${posName}`,
            adjustmentAmount: adjustment,
            direction: "in",
            treasuryAccountLabel: posName,
            sourceAccountName: posName,
          })
        }
      }
    }

    movements.sort((a, b) => {
      const aKey = (a.occurredAt ?? a.date).trim()
      const bKey = (b.occurredAt ?? b.date).trim()
      const dc = bKey.localeCompare(aKey)
      if (dc !== 0) return dc
      return b.id.localeCompare(a.id)
    })

    const movementsWithImpact = movements.map((m) => ({
      ...m,
      balanceImpact: resolveMovementBalanceImpact(m.kind, m.sourceAccountName),
    }))

    const supportsBankReconciliation = !isCardPayable && !isCashAccount
    const markByKey = new Map<string, { statementLineId: string | null }>()
    const linkedStatementIds = new Set<string>()
    let statementLines: BankStatementLineRow[] = []

    if (supportsBankReconciliation) {
      const { data: markRows } = await supabase
        .from("treasury_reconciliation_marks")
        .select("movement_kind, movement_ref_id, statement_line_id")
        .eq("pop_id", popId)
        .eq("treasury_account_id", taId)

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

    const movementDisplayLimit = isMovementsHeavyAccount
      ? movementFetchLimit
      : relatedIds.length > 0
        ? 100
        : 60
    const allEnrichedMovements = movementsWithImpact
      .map((m) => enrichMovement(m, markByKey))
      .filter((m) => m.balanceImpact === "real")
    const { movementTotals } = computePeriodMovementTotals(allEnrichedMovements)
    const enrichedMovements = allEnrichedMovements.slice(0, movementDisplayLimit)

    let periodSummary: TreasuryPeriodSummary | null = null
    if (isMotherAccount && !isCardPayable) {
      const today = new Date()
      const closingAsOf =
        dateTo ||
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

      const motherLedgerId = await resolveTreasuryAccountLedgerAccountId(
        supabase,
        popId,
        taId,
      )
      let currentBalance = 0
      if (motherLedgerId) {
        currentBalance = await computeChartAccountBalanceAsOf(
          supabase,
          popId,
          motherLedgerId,
          closingAsOf,
        )
      }

      let openingBalance: number | null = null
      if (dateFrom && motherLedgerId) {
        openingBalance = await computeChartAccountBalanceAsOf(
          supabase,
          popId,
          motherLedgerId,
          dayBeforeIso(dateFrom),
        )
      }

      periodSummary = {
        openingBalance,
        currentBalance,
      }
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
        movementTotals,
        periodSummary,
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

export async function importBankStatementCsv(
  popId: string,
  treasuryAccountId: string,
  csvText: string,
): Promise<
  | { success: true; imported: number; warnings: string[] }
  | { success: false; error: string }
> {
  try {
    const auth = await requireTreasuryUpdate(popId)
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
    const { data: taRow, error: taErr } = await supabase
      .from("treasury_accounts")
      .select("id")
      .eq("id", taId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (taErr || !taRow?.id) {
      return { success: false, error: "Cuenta de tesorería inválida." }
    }

    const rows = parsed.lines.map((l) => ({
      pop_id: popId,
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
    const auth = await requireTreasuryUpdate(popId)
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
    const { data: taRow, error: taErr } = await supabase
      .from("treasury_accounts")
      .select("id")
      .eq("id", taId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (taErr || !taRow?.id) {
      return { success: false, error: "Cuenta de tesorería inválida." }
    }

    const { data, error } = await supabase
      .from("bank_statement_lines")
      .insert({
        pop_id: popId,
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
    const auth = await requireTreasuryUpdate(popId)
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
  treasuryAccountId: string,
  movementKind: PaymentMethodMovementRow["kind"],
  movementRefId: string,
  statementLineId?: string | null,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const auth = await requireTreasuryUpdate(popId)
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
    const taId = treasuryAccountId.trim()
    let stmtId: string | null = statementLineId?.trim() || null

    if (stmtId) {
      const { data: stmtRow, error: stmtErr } = await supabase
        .from("bank_statement_lines")
        .select("id")
        .eq("id", stmtId)
        .eq("pop_id", popId)
        .eq("treasury_account_id", taId)
        .maybeSingle()
      if (stmtErr || !stmtRow) {
        return { success: false, error: "Línea de extracto inválida." }
      }
    }

    const { error } = await supabase.from("treasury_reconciliation_marks").upsert(
      {
        pop_id: popId,
        treasury_account_id: taId,
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
    const auth = await requireTreasuryUpdate(popId)
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

export async function recordTreasurySettlementForAccount(
  popId: string,
  input: RecordTreasurySettlementForAccountInput,
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

    const cardTaId = input.cardTreasuryAccountId?.trim()
    const fundTaId = input.fundingTreasuryAccountId?.trim()
    const settledAt = input.settledAt?.trim()
    const principal = roundMoney(Number(input.principalAmount))
    const adjustment = roundMoney(Number(input.adjustmentAmount ?? 0))

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
    if (!(principal > 0)) {
      return { success: false, error: "El importe debe ser mayor a cero." }
    }
    if (adjustment < 0) {
      return {
        success: false,
        error: "Los cargos del resumen no pueden ser negativos.",
      }
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(settledAt)) {
      return { success: false, error: "Fecha de pago inválida." }
    }

    const user = await requireAuthenticatedUser()
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

    const outstanding = await computeChildPendingBalanceAsOf(
      supabase,
      popId,
      cardTaId,
      "card_payable",
      settledAt,
    )
    if (principal > outstanding + 0.0001) {
      return {
        success: false,
        error: `Los consumos a cancelar superan la deuda pendiente al ${settledAt} (${outstanding.toFixed(2)}).`,
      }
    }

    const { data: ins, error: insErr } = await supabase
      .from("treasury_settlements")
      .insert({
        pop_id: popId,
        card_treasury_account_id: cardTaId,
        funding_treasury_account_id: fundTaId,
        amount: principal,
        principal_amount: principal,
        adjustment_amount: adjustment,
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

export type RecordPosAcreditationInput = {
  posTreasuryAccountId: string
  motherTreasuryAccountId: string
  /** Monto acreditado en la cuenta madre. */
  principalAmount: number
  /** Comisiones, intereses e impuestos retenidos. */
  adjustmentAmount?: number
  creditedAt: string
  notes?: string
}

export async function recordPosAcreditationForAccount(
  popId: string,
  input: RecordPosAcreditationInput,
): Promise<{ success: true; entryId: string } | { success: false; error: string }> {
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
      return { success: false, error: "Sin permiso para registrar acreditaciones." }
    }

    const posTaId = input.posTreasuryAccountId?.trim()
    const motherTaId = input.motherTreasuryAccountId?.trim()
    const creditedAt = input.creditedAt?.trim()
    const principal = roundMoney(Number(input.principalAmount))
    const adjustment = roundMoney(Number(input.adjustmentAmount ?? 0))

    if (!posTaId || !motherTaId) {
      return { success: false, error: "Cuenta POS o madre inválida." }
    }
    if (!(principal > 0)) {
      return { success: false, error: "El importe debe ser mayor a cero." }
    }
    if (adjustment < 0) {
      return { success: false, error: "Las comisiones e impuestos no pueden ser negativos." }
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(creditedAt)) {
      return { success: false, error: "Fecha de acreditación inválida." }
    }

    const user = await requireAuthenticatedUser()
    const supabase = await createClient()

    const { data: posTa, error: posErr } = await supabase
      .from("treasury_accounts")
      .select("id, name, parent_treasury_account_id, kind")
      .eq("id", posTaId)
      .eq("pop_id", popId)
      .eq("is_active", true)
      .maybeSingle()
    if (posErr || !posTa?.id) {
      return { success: false, error: "Terminal POS no encontrado." }
    }
    if (String(posTa.parent_treasury_account_id ?? "") !== motherTaId) {
      return {
        success: false,
        error: "El terminal no pertenece a esta cuenta madre.",
      }
    }

    const posBalance = await computeChildPendingBalanceAsOf(
      supabase,
      popId,
      posTaId,
      "pos",
      creditedAt,
    )
    const totalSettlement = roundMoney(principal + adjustment)
    if (totalSettlement > posBalance + 0.0001) {
      return {
        success: false,
        error: `El total supera el saldo a liquidar al ${creditedAt} (${posBalance.toFixed(2)}).`,
      }
    }

    const { data: ins, error: insErr } = await supabase
      .from("treasury_pos_acreditations")
      .insert({
        pop_id: popId,
        pos_treasury_account_id: posTaId,
        mother_treasury_account_id: motherTaId,
        principal_amount: principal,
        adjustment_amount: adjustment,
        credited_at: creditedAt,
        notes: input.notes?.trim() || "",
        created_by: user.uid,
      })
      .select("id")
      .single()

    if (insErr || !ins?.id) {
      return {
        success: false,
        error: insErr?.message || "No se pudo registrar la acreditación.",
      }
    }
    const acreditationId = String(ins.id)

    const ledger = await postPosAcreditationLedger(supabase, {
      popId,
      userId: user.uid,
      acreditationId,
    })
    if (!ledger.success) {
      await supabase
        .from("treasury_pos_acreditations")
        .delete()
        .eq("id", acreditationId)
        .eq("pop_id", popId)
      return { success: false, error: ledger.error }
    }

    const { data: linked } = await supabase
      .from("treasury_pos_acreditations")
      .select("accounting_entry_id")
      .eq("id", acreditationId)
      .eq("pop_id", popId)
      .maybeSingle()

    return {
      success: true,
      entryId: String(linked?.accounting_entry_id ?? acreditationId),
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function getTreasuryReconciliationHistory(
  popId: string,
  motherTreasuryAccountId: string,
  options?: {
    childTreasuryAccountId?: string
    childRole?: "pos" | "card_payable"
    dateFrom?: string
    dateTo?: string
  },
): Promise<
  | {
      success: true
      events: TreasuryReconciliationEventRow[]
      periodGrossAmount: number
      periodPendingBalance: number
      openingPendingBalance: number | null
      periodToLiquidate: number
      summaryMovements: TreasuryPosSummaryMovementRow[]
    }
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
      return { success: false, error: "Sin permiso para ver conciliaciones." }
    }

    const motherId = motherTreasuryAccountId.trim()
    const childId = options?.childTreasuryAccountId?.trim() ?? ""
    const childRole = options?.childRole
    const dateFrom = options?.dateFrom?.trim() ?? ""
    const dateTo = options?.dateTo?.trim() ?? ""
    const inDateRange = (iso: string) => {
      const d = iso.slice(0, 10)
      if (dateFrom && d < dateFrom) return false
      if (dateTo && d > dateTo) return false
      return true
    }
    const supabase = await createClient()
    const ledgerTimeZone = await resolvePopLedgerTimeZone(supabase, popId)

    const { data: childRows } = await supabase
      .from("treasury_accounts")
      .select("id")
      .eq("pop_id", popId)
      .eq("parent_treasury_account_id", motherId)

    const childIds = (childRows || []).map((r) => String(r.id))
    const events: TreasuryReconciliationEventRow[] = []

    const fetchCards = childRole !== "pos"
    const fetchPos = childRole !== "card_payable"

    if (childIds.length > 0 && fetchCards) {
      let settleQuery = supabase
        .from("treasury_settlements")
        .select(
          "id, principal_amount, amount, adjustment_amount, settled_at, created_at, notes, accounting_entry_id, card_treasury_account_id, created_by",
        )
        .eq("pop_id", popId)
        .order("settled_at", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(120)

      if (childId) {
        settleQuery = settleQuery.eq("card_treasury_account_id", childId)
      } else {
        settleQuery = settleQuery.in("card_treasury_account_id", childIds)
      }

      const { data: settleRows, error: settleErr } = await settleQuery

      if (settleErr) {
        return {
          success: false,
          error: settleErr.message || "No se pudo cargar liquidaciones.",
        }
      }

      const cardIds = [
        ...new Set(
          (settleRows || [])
            .map((r) =>
              r.card_treasury_account_id
                ? String(r.card_treasury_account_id)
                : "",
            )
            .filter(Boolean),
        ),
      ]
      const cardNames = new Map<string, string>()
      if (cardIds.length > 0) {
        const { data: nameRows } = await supabase
          .from("treasury_accounts")
          .select("id, name")
          .eq("pop_id", popId)
          .in("id", cardIds)
        for (const r of nameRows || []) {
          cardNames.set(String(r.id), String(r.name ?? ""))
        }
      }

      for (const r of settleRows || []) {
        const date = String(r.settled_at ?? "").slice(0, 10)
        if (!inDateRange(date)) continue
        const principal = roundMoney(Number(r.principal_amount ?? r.amount))
        const adjustment = roundMoney(Number(r.adjustment_amount ?? 0))
        const cid =
          r.card_treasury_account_id != null
            ? String(r.card_treasury_account_id)
            : ""
        events.push({
          id: String(r.id),
          kind: "card_settlement",
          eventDate: String(r.settled_at ?? "").slice(0, 10),
          eventOccurredAt: String(r.created_at ?? r.settled_at ?? "").trim(),
          accountName: cardNames.get(cid) ?? "Tarjeta",
          principalAmount: principal,
          adjustmentAmount: adjustment,
          totalAmount: roundMoney(principal + adjustment),
          notes: String(r.notes ?? ""),
          accountingEntryId:
            r.accounting_entry_id != null ? String(r.accounting_entry_id) : null,
          accountingEntryNumber: null,
          accountingEntryStatus: null,
          createdByName:
            r.created_by != null ? String(r.created_by) : null,
        })
      }
    }

    if (fetchPos) {
      let posQuery = supabase
        .from("treasury_pos_acreditations")
        .select(
          "id, principal_amount, adjustment_amount, credited_at, created_at, notes, accounting_entry_id, pos_treasury_account_id, created_by",
        )
        .eq("pop_id", popId)
        .eq("mother_treasury_account_id", motherId)
        .order("credited_at", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(120)

      if (childId) {
        posQuery = posQuery.eq("pos_treasury_account_id", childId)
      }

      const { data: posRows, error: posErr } = await posQuery

    if (posErr) {
      return {
        success: false,
        error: posErr.message || "No se pudo cargar acreditaciones POS.",
      }
    }

    const posIds = [
      ...new Set(
        (posRows || [])
          .map((r) =>
            r.pos_treasury_account_id ? String(r.pos_treasury_account_id) : "",
          )
          .filter(Boolean),
      ),
    ]
    const posNames = new Map<string, string>()
    if (posIds.length > 0) {
      const { data: nameRows } = await supabase
        .from("treasury_accounts")
        .select("id, name")
        .eq("pop_id", popId)
        .in("id", posIds)
      for (const r of nameRows || []) {
        posNames.set(String(r.id), String(r.name ?? ""))
      }
    }

    for (const r of posRows || []) {
      const date = String(r.credited_at ?? "").slice(0, 10)
      if (!inDateRange(date)) continue
      const principal = roundMoney(Number(r.principal_amount))
      const adjustment = roundMoney(Number(r.adjustment_amount ?? 0))
      const pid =
        r.pos_treasury_account_id != null
          ? String(r.pos_treasury_account_id)
          : ""
      events.push({
        id: String(r.id),
        kind: "pos_acreditation",
        eventDate: String(r.credited_at ?? "").slice(0, 10),
        eventOccurredAt: String(r.created_at ?? r.credited_at ?? "").trim(),
        accountName: posNames.get(pid) ?? "POS",
        principalAmount: principal,
        adjustmentAmount: adjustment,
        totalAmount: roundMoney(principal + adjustment),
        notes: String(r.notes ?? ""),
        accountingEntryId:
          r.accounting_entry_id != null ? String(r.accounting_entry_id) : null,
        accountingEntryNumber: null,
        accountingEntryStatus: null,
        createdByName: r.created_by != null ? String(r.created_by) : null,
      })
    }
    }

    const createdByIds = [
      ...new Set(
        events
          .map((e) => e.createdByName)
          .filter((id): id is string => Boolean(id)),
      ),
    ]
    const userNames = await loadUserDisplayNames(supabase, createdByIds)
    for (const event of events) {
      if (!event.createdByName) continue
      event.createdByName = userNames.get(event.createdByName) ?? "Usuario"
    }

    const entryIds = [
      ...new Set(
        events
          .map((e) => e.accountingEntryId)
          .filter((id): id is string => Boolean(id)),
      ),
    ]
    const entryMeta = new Map<
      string,
      { entryNumber: number | null; status: string | null }
    >()
    if (entryIds.length > 0) {
      const { data: entryRows } = await supabase
        .from("accounting_entries")
        .select("id, entry_number, status")
        .eq("pop_id", popId)
        .in("id", entryIds)
      for (const r of entryRows || []) {
        entryMeta.set(String(r.id), {
          entryNumber:
            r.entry_number != null && Number.isFinite(Number(r.entry_number))
              ? Number(r.entry_number)
              : null,
          status: r.status != null ? String(r.status) : null,
        })
      }
    }

    for (const event of events) {
      if (!event.accountingEntryId) continue
      const meta = entryMeta.get(event.accountingEntryId)
      if (!meta) continue
      event.accountingEntryNumber = meta.entryNumber
      event.accountingEntryStatus = meta.status
    }

    events.sort((a, b) => {
      const aKey = (a.eventOccurredAt ?? a.eventDate).trim()
      const bKey = (b.eventOccurredAt ?? b.eventDate).trim()
      const dc = bKey.localeCompare(aKey)
      if (dc !== 0) return dc
      return b.id.localeCompare(a.id)
    })

    const periodReconciledPrincipal = events.reduce(
      (sum, event) => sum + event.principalAmount,
      0,
    )

    let periodGrossAmount = 0
    let periodPendingBalance = 0
    let openingPendingBalance: number | null = null
    let periodToLiquidate = 0
    let summaryMovements: TreasuryPosSummaryMovementRow[] = []

    if (childId && childRole) {
      periodGrossAmount = await computePeriodGrossForChildAccount(
        supabase,
        popId,
        childId,
        childRole,
        inDateRange,
        ledgerTimeZone,
      )
      if (childRole === "pos") {
        const asOf =
          dateTo && /^\d{4}-\d{2}-\d{2}$/.test(dateTo)
            ? dateTo
            : new Date().toISOString().slice(0, 10)
        periodPendingBalance = Math.max(
          0,
          await computeChildPendingBalanceAsOf(
            supabase,
            popId,
            childId,
            "pos",
            asOf,
          ),
        )
        if (dateFrom && /^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) {
          openingPendingBalance = Math.max(
            0,
            await computeChildPendingBalanceAsOf(
              supabase,
              popId,
              childId,
              "pos",
              dayBeforeIso(dateFrom),
            ),
          )
        }
        const { data: childRow } = await supabase
          .from("treasury_accounts")
          .select("name")
          .eq("id", childId)
          .maybeSingle()
        const childName = String(childRow?.name ?? "POS")
        summaryMovements = await loadPosSummaryMovements(
          supabase,
          popId,
          childId,
          childName,
          inDateRange,
          ledgerTimeZone,
        )
        periodToLiquidate = netPosSummaryMovements(summaryMovements)
      } else {
        periodPendingBalance = roundMoney(
          Math.max(0, periodGrossAmount - periodReconciledPrincipal),
        )
        summaryMovements = await loadCardConsumptionMovements(
          supabase,
          popId,
          childId,
          inDateRange,
        )
      }
    }

    return {
      success: true,
      events,
      periodGrossAmount,
      periodPendingBalance,
      openingPendingBalance,
      periodToLiquidate,
      summaryMovements,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
