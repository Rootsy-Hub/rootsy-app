"use server"

import {
  entryDateIsoInTimezone,
  localDateExclusiveEndTimestamp,
  localDateStartTimestamp,
  timezoneForPopLedger,
} from "@/lib/entryDateTimezone"
import { loadPopOperationalContext } from "@/lib/popTimezoneServer"
import {
  expandCalendarBoundsForOperationalFetch,
  filterCashRegisterSessionsByOperationalPeriod,
  usesOperationalDayFilter,
} from "@/lib/popOperationalDay"
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
import {
  removeCashRegisterArcaPemFiles,
  uploadCashRegisterArcaPemFiles,
} from "@/lib/rootsyAfipStorage"
import { createClient } from "@/utils/supabase/server"
import {
  OPERATION_PAYMENT_KINDS,
  operationPaymentKindLabel,
  type OperationPaymentKind,
} from "@/lib/operationPaymentKinds"
import { formatCashRegisterSaleDetail } from "@/lib/cashRegisterOperationDetail"
import {
  formatCashRegisterSaleOperationLabel,
  loadCashRegisterSaleContextLabels,
  parseCashRegisterSaleChannel,
} from "@/lib/cashRegisterSaleContextLabels"
import { canCloseCashRegisterSession } from "@/lib/cashRegisterSessionAccess"
import {
  buildCashCloseAdjustmentLines,
  buildPaymentKindCloseAdjustmentLines,
  buildTreasuryLineCloseAdjustmentLines,
  loadSessionCobrosByTreasuryLine,
  loadSessionCobrosForClose,
  loadSessionNonCashCobrosByKind,
  type SessionCloseCobro,
  type SessionTreasuryLineCobro,
} from "@/lib/cashRegisterCloseAccounting"
import {
  buildClosingComparisonLines,
  buildClosingComparisonLinesByTreasury,
  closingComparisonNetDifference,
  formatTreasuryCloseLineLabel,
  type CashRegisterClosingComparisonLine,
} from "@/lib/cashRegisterCloseSettlement"

/** Totales del turno abierto en la tarjeta de caja (y coherente con el arqueo). */
export type CashRegisterOpenSessionTotals = {
  openingCash: number
  ventasEfectivo: number
  ingresosCajon: number
  egresosCajon: number
  efectivoTeoricoEnCajon: number
  /** Suma de ventas completadas del turno (todas las formas de pago). Requiere `sale:read`. */
  totalCobradoTurno: number | null
  /** Cobros del turno por medio de pago. Requiere `sale:read`. */
  cobrosPorMedio: { name: string; kind: string; total: number }[] | null
  /** Cobros del turno por cuenta · medio (detalle). Requiere `sale:read`. */
  cobrosPorCuenta: CashRegisterTreasuryLineCobro[] | null
  /** Cobros agrupados para el cierre (POS/banco por cuenta). Requiere `sale:read`. */
  cobrosParaCierre: CashRegisterCloseCobroLine[] | null
}

export type CashRegisterCloseCobroLine = {
  key: string
  treasuryAccountId: string | null
  paymentKind: string
  accountName: string | null
  label: string
  total: number
}

export type CashRegisterOpenSessionMeta = {
  arqueoNumber: number
  openedByUserId: string | null
  openedByName: string | null
  openingNote: string | null
}

export type CashRegisterTreasuryLineCobro = {
  key: string
  treasuryAccountId: string | null
  paymentKind: string
  accountName: string | null
  label: string
  total: number
}

export type CashTreasuryAccountOption = {
  id: string
  name: string
}

export type CashRegisterRow = {
  id: string
  name: string
  sortOrder: number
  isActive: boolean
  cashTreasuryAccountId: string | null
  openSessionId: string | null
  /** Si hay turno abierto: puede cerrarlo el usuario actual. */
  canCloseOpenSession: boolean
  /** Efectivo teórico en cajón si hay turno abierto (apertura + ventas efectivo + cajón). */
  cashBalance: number | null
  openedAt: string | null
  openSessionMeta: CashRegisterOpenSessionMeta | null
  openSessionTotals: CashRegisterOpenSessionTotals | null
  arcaPtoVta: number | null
  arcaCertificateSecretName: string | null
  arcaCertificateLastFour: string | null
  /** YYYY-MM-DD */
  arcaCertificateExpiresAt: string | null
  arcaCrtUploadedAt: string | null
  arcaKeyUploadedAt: string | null
}

export type PaymentMethodOption = {
  kind: OperationPaymentKind
  label: string
}

export type ClosingSnapshot = {
  cash: number
  /** Legacy: totales por forma de pago agregada. */
  payment_methods?: Record<string, number>
  /** Totales por cuenta · medio (`treasuryAccountId|paymentKind`). */
  treasury_lines?: Record<string, number>
  note?: string | null
}

export type CashRegisterSummaryMovement = {
  id: string
  sessionId: string
  sessionOpenedAt: string
  createdAt: string
  kind: "deposit" | "withdrawal"
  amount: number
  note: string | null
  createdBy: string | null
}

export type CashRegisterSummarySession = {
  id: string
  status: "open" | "closed"
  openedAt: string
  closedAt: string | null
  openingCash: number
  openingNote: string | null
  closingSnapshot: ClosingSnapshot | null
  movementDeposits: number
  movementWithdrawals: number
  /** Ventas completadas del turno. Requiere `sale:read`. */
  totalCobrado: number
  /** Cobros del turno por medio de pago. Requiere `sale:read`. */
  ventasPorMedio: { paymentKind: string; name: string; total: number }[]
  /** Cobros del turno por cuenta · medio (detalle). Requiere `sale:read`. */
  ventasPorCuenta: CashRegisterTreasuryLineCobro[]
  /** Cobros agrupados para cierre / comparación por cuenta. Requiere `sale:read`. */
  ventasParaCierre: CashRegisterCloseCobroLine[]
  /** Número secuencial de arqueo en esta caja (por fecha de apertura). */
  arqueoNumber: number
  openedByUserId: string | null
  openedByName: string | null
  closedByUserId: string | null
  closedByName: string | null
  efectivoTeorico: number
  /** Neto de diferencias del cierre (efectivo + medios informados vs cobrado). */
  cashArqueoDifference: number | null
}

export type CashRegistersPeriodReportRow = CashRegisterSummarySession & {
  registerId: string
  registerName: string
}

export type CashRegistersPeriodReportPopInfo = {
  popName: string
  popStreetAddress: string | null
  popFiscalCuit: string | null
  popFiscalRazonSocial: string | null
}

export type CashRegistersPeriodReportData = {
  rows: CashRegistersPeriodReportRow[]
  registerCount: number
  popInfo: CashRegistersPeriodReportPopInfo
}

export type CashRegisterSessionOperationRow = {
  id: string
  kind: "sale" | "deposit" | "withdrawal"
  saleId: string | null
  occurredAt: string
  operationLabel: string
  customerLabel: string
  detail: string
  paymentMethodLabel: string
  amount: number
}

export type CashRegisterSessionArqueoDetail = {
  registerName: string
  session: CashRegisterSummarySession
  closingComparison: CashRegisterClosingComparisonLine[]
  hasAccountingEntry: boolean
  operations: CashRegisterSessionOperationRow[]
}

export type CashRegisterSummaryClosingBlock = {
  sessionId: string
  openedAt: string
  closedAt: string | null
  lines: { label: string; amount: number }[]
}

export type CashRegisterSummarySale = {
  id: string
  cashRegisterSessionId: string
  soldAt: string
  total: number
  status: string
  createdBy: string | null
  customerName: string | null
  currency: string
}

export type CashRegisterArqueoVentaPorMedio = {
  paymentKind: string
  name: string
  kind: string
  /** Suma de cobros en ventas completadas (esta caja, histórico). */
  totalVentas: number
}

export type CashRegisterArqueoSesionAbierta = {
  sessionId: string
  openingCash: number
  ventasEfectivo: number
  ingresosCajon: number
  egresosCajon: number
  /** Efectivo que debería haber en cajón: apertura + ventas efectivo + ingresos − egresos. */
  efectivoTeoricoEnCajon: number
}

export type CashRegisterSummaryData = {
  registerName: string
  operationalDayCloseTime: string
  sessions: CashRegisterSummarySession[]
  movements: CashRegisterSummaryMovement[]
  /** false si el usuario no tiene permiso `sale:read` (no se listan ventas). */
  salesIncluded: boolean
  sales: CashRegisterSummarySale[]
  /** Totales por medio de pago desde ventas; efectivo teórico del turno abierto. */
  arqueo: {
    ventasPorMedioPago: CashRegisterArqueoVentaPorMedio[]
    sesionAbierta: CashRegisterArqueoSesionAbierta | null
  } | null
  totals: {
    depositTotal: number
    withdrawalTotal: number
    netCashMovements: number
  }
  closingBlocks: CashRegisterSummaryClosingBlock[]
  aggregatedClosingLines: { label: string; amount: number }[]
}

function computeSessionEfectivoTeorico(session: {
  openingCash: number
  movementDeposits: number
  movementWithdrawals: number
  ventasPorMedio: { paymentKind: string; total: number }[]
}): number {
  const ventasEfectivo =
    session.ventasPorMedio.find((row) => row.paymentKind === "cash")?.total ?? 0
  return (
    Math.round(
      (session.openingCash +
        ventasEfectivo +
        session.movementDeposits -
        session.movementWithdrawals) *
        100,
    ) / 100
  )
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

function enrichCashRegisterSessions(
  sessRows: {
    id: unknown
    opened_at: unknown
    opened_by?: unknown
    closed_by?: unknown
  }[],
  sessions: CashRegisterSummarySession[],
  userNames: Map<string, string>,
): void {
  const ordered = [...sessRows].sort(
    (a, b) =>
      new Date(String(a.opened_at ?? "")).getTime() -
      new Date(String(b.opened_at ?? "")).getTime(),
  )
  const arqueoNumberById = new Map<string, number>()
  ordered.forEach((row, index) => {
    arqueoNumberById.set(String(row.id), index + 1)
  })

  for (const session of sessions) {
    const raw = sessRows.find((row) => String(row.id) === session.id)
    const openedByUserId =
      raw?.opened_by != null ? String(raw.opened_by) : null
    const closedByUserId =
      raw?.closed_by != null ? String(raw.closed_by) : null
    session.arqueoNumber = arqueoNumberById.get(session.id) ?? 0
    session.openedByUserId = openedByUserId
    session.openedByName = openedByUserId
      ? (userNames.get(openedByUserId) ?? "Usuario")
      : null
    session.closedByUserId = closedByUserId
    session.closedByName = closedByUserId
      ? (userNames.get(closedByUserId) ?? "Usuario")
      : null
    session.efectivoTeorico = computeSessionEfectivoTeorico(session)
    session.cashArqueoDifference =
      session.status === "closed" && session.closingSnapshot
        ? closingComparisonNetDifference(
            buildClosingComparisonForSession(session),
          )
        : null
  }
}

function formatTreasuryPaymentLabelFromRow(p: {
  payment_kind?: unknown
  treasury_accounts?:
    | { name?: string }
    | Array<{ name?: string }>
    | null
}): string {
  const kind = p.payment_kind != null ? String(p.payment_kind).trim() : ""
  const taRaw = p.treasury_accounts
  const taName = Array.isArray(taRaw)
    ? taRaw[0]?.name?.trim()
    : taRaw?.name?.trim()
  const kindLabel = kind ? operationPaymentKindLabel(kind) : ""
  if (kindLabel && taName) return `${kindLabel} — ${taName}`
  return kindLabel || taName || "—"
}

function parseAmount(v: unknown): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 100) / 100
}

async function resolveAccountIdByCodes(
  supabase: Awaited<ReturnType<typeof createClient>>,
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

async function cancelAccountingEntry(
  supabase: Awaited<ReturnType<typeof createClient>>,
  entryId: string,
) {
  await supabase
    .from("accounting_entries")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", entryId)
}

async function computeEfectivoTeoricoSession(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  sessionId: string,
): Promise<
  | {
      success: true
      teorico: number
      openingCash: number
      ventasEfectivo: number
      ingresosCajon: number
      egresosCajon: number
    }
  | { success: false; error: string }
> {
  const { data: sess, error: se } = await supabase
    .from("cash_register_sessions")
    .select("id, opening_cash, status")
    .eq("id", sessionId)
    .eq("pop_id", popId)
    .maybeSingle()
  if (se || !sess?.id) {
    return { success: false, error: "No se pudo leer la sesión de caja." }
  }
  if (String(sess.status) !== "open") {
    return { success: false, error: "La sesión no está abierta." }
  }
  const openingCash = parseAmount(sess.opening_cash)
  const { data: saleRows } = await supabase
    .from("sales")
    .select("id")
    .eq("pop_id", popId)
    .eq("cash_register_session_id", sessionId)
    .eq("status", "completed")
  const saleIds = (saleRows || []).map((r) => String(r.id))
  let ventasEfectivo = 0
  if (saleIds.length > 0) {
    const { data: osp } = await supabase
      .from("sale_payments")
      .select("payment_kind, amount")
      .eq("pop_id", popId)
      .in("sale_id", saleIds)
    for (const row of osp || []) {
      if (String(row.payment_kind) === "cash") {
        ventasEfectivo += parseAmount(row.amount)
      }
    }
  }
  ventasEfectivo = Math.round(ventasEfectivo * 100) / 100
  const { data: movs } = await supabase
    .from("cash_register_movements")
    .select("kind, amount")
    .eq("session_id", sessionId)
    .eq("pop_id", popId)
  let ing = 0
  let eg = 0
  for (const m of movs || []) {
    const amt = parseAmount(m.amount)
    if (String(m.kind) === "deposit") ing += amt
    else if (String(m.kind) === "withdrawal") eg += amt
  }
  ing = Math.round(ing * 100) / 100
  eg = Math.round(eg * 100) / 100
  const teorico =
    Math.round((openingCash + ventasEfectivo + ing - eg) * 100) / 100
  return {
    success: true,
    teorico,
    openingCash,
    ventasEfectivo,
    ingresosCajon: ing,
    egresosCajon: eg,
  }
}

function mapCloseCobros(rows: SessionCloseCobro[]): CashRegisterCloseCobroLine[] {
  return rows.map((row) => ({
    key: row.key,
    treasuryAccountId: row.treasuryAccountId,
    paymentKind: row.paymentKind,
    accountName: row.accountName,
    label: row.label,
    total: row.total,
  }))
}

function mapTreasuryLineCobros(
  rows: SessionTreasuryLineCobro[],
): CashRegisterTreasuryLineCobro[] {
  return rows.map((row) => ({
    key: row.key,
    treasuryAccountId: row.treasuryAccountId,
    paymentKind: row.paymentKind,
    accountName: row.accountName,
    label: formatTreasuryCloseLineLabel(row.accountName, row.paymentKind),
    total: row.total,
  }))
}

function parseClosingSnapshot(raw: unknown): ClosingSnapshot | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const cash = parseAmount(o.cash)
  const pm: Record<string, number> = {}
  const pms = o.payment_methods
  if (pms && typeof pms === "object" && !Array.isArray(pms)) {
    for (const [k, v] of Object.entries(pms as Record<string, unknown>)) {
      pm[k] = parseAmount(v)
    }
  }
  const treasuryLines: Record<string, number> = {}
  const tls = o.treasury_lines
  if (tls && typeof tls === "object" && !Array.isArray(tls)) {
    for (const [k, v] of Object.entries(tls as Record<string, unknown>)) {
      treasuryLines[k] = parseAmount(v)
    }
  }
  const note = typeof o.note === "string" ? o.note : null
  return {
    cash,
    payment_methods: Object.keys(pm).length > 0 ? pm : undefined,
    treasury_lines:
      Object.keys(treasuryLines).length > 0 ? treasuryLines : undefined,
    note: note ?? undefined,
  }
}

function closingSnapshotUsesAccountLines(snapshot: ClosingSnapshot): boolean {
  const lines = snapshot.treasury_lines
  if (!lines) return false
  const keys = Object.keys(lines)
  if (keys.length === 0) return false
  return keys.some((key) => key.startsWith("ta:"))
}

function buildClosingComparisonForSession(
  session: CashRegisterSummarySession,
): CashRegisterClosingComparisonLine[] {
  const cs = session.closingSnapshot
  if (!cs) return []

  if (cs.treasury_lines && Object.keys(cs.treasury_lines).length > 0) {
    const useAccountLines = closingSnapshotUsesAccountLines(cs)
    const cobradoRows = useAccountLines
      ? session.ventasParaCierre
      : session.ventasPorCuenta
    return buildClosingComparisonLinesByTreasury({
      efectivoTeorico: session.efectivoTeorico,
      cashCounted: cs.cash,
      treasuryLines: cs.treasury_lines,
      cobradoPorLinea: cobradoRows.map((row) => ({
        key: row.key,
        paymentKind: row.paymentKind,
        treasuryAccountId: row.treasuryAccountId,
        accountName: row.accountName,
        label: row.label,
        total: row.total,
      })),
    })
  }

  return buildClosingComparisonLines({
    efectivoTeorico: session.efectivoTeorico,
    cashCounted: cs.cash,
    paymentMethods: cs.payment_methods ?? {},
    cobradoPorMedio: session.ventasPorMedio.map((row) => ({
      paymentKind: row.paymentKind,
      total: row.total,
    })),
  })
}

function buildClosingLinesForSession(
  session: CashRegisterSummarySession,
): { label: string; amount: number }[] {
  return buildClosingComparisonForSession(session).map((line) => ({
    label: line.label,
    amount: line.informado,
  }))
}

function buildClosingBlocksFromSessions(sessions: CashRegisterSummarySession[]): {
  closingBlocks: CashRegisterSummaryClosingBlock[]
  aggregatedClosingLines: { label: string; amount: number }[]
} {
  const closingBlocks: CashRegisterSummaryClosingBlock[] = []
  const agg = new Map<string, number>()
  for (const sess of sessions) {
    if (sess.status !== "closed" || !sess.closingSnapshot) continue
    const lines = buildClosingLinesForSession(sess)
    for (const line of lines) {
      const key =
        line.label === paymentMethodLabel("__cash_counted")
          ? "__agg_cash"
          : line.label
      agg.set(key, (agg.get(key) ?? 0) + line.amount)
    }
    closingBlocks.push({
      sessionId: sess.id,
      openedAt: sess.openedAt,
      closedAt: sess.closedAt,
      lines,
    })
  }
  const aggregatedClosingLines: { label: string; amount: number }[] = []
  if (agg.has("__agg_cash")) {
    aggregatedClosingLines.push({
      label: paymentMethodLabel("__cash_counted"),
      amount: Math.round((agg.get("__agg_cash") ?? 0) * 100) / 100,
    })
  }
  for (const [pid, total] of agg) {
    if (pid === "__agg_cash") continue
    aggregatedClosingLines.push({
      label: pid,
      amount: Math.round(total * 100) / 100,
    })
  }
  aggregatedClosingLines.sort((a, b) =>
    a.label.localeCompare(b.label, "es"),
  )
  return { closingBlocks, aggregatedClosingLines }
}

function looksLikePemCert(s: string): boolean {
  const t = s.trim()
  return t.includes("BEGIN CERTIFICATE") && t.includes("END CERTIFICATE")
}

function looksLikePemKey(s: string): boolean {
  const t = s.trim()
  return (
    (t.includes("BEGIN RSA PRIVATE KEY") ||
      t.includes("BEGIN PRIVATE KEY") ||
      t.includes("BEGIN EC PRIVATE KEY")) &&
    t.includes("END")
  )
}

async function computeCashBalance(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sessionId: string,
  openingCash: number,
): Promise<number> {
  const { data, error } = await supabase
    .from("cash_register_movements")
    .select("kind, amount")
    .eq("session_id", sessionId)
  if (error || !data) return openingCash
  let bal = openingCash
  for (const row of data) {
    const amt = parseAmount(row.amount)
    if (String(row.kind) === "deposit") bal += amt
    else if (String(row.kind) === "withdrawal") bal -= amt
  }
  return Math.round(bal * 100) / 100
}

async function loadCobrosTurnoPorMedio(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  sessionId: string,
): Promise<{
  totalCobrado: number
  porMedio: { name: string; kind: string; total: number }[]
}> {
  const { data: saleRows } = await supabase
    .from("sales")
    .select("id, total")
    .eq("pop_id", popId)
    .eq("cash_register_session_id", sessionId)
    .eq("status", "completed")
  let totalCobrado = 0
  for (const s of saleRows || []) {
    totalCobrado += parseAmount(s.total)
  }
  totalCobrado = Math.round(totalCobrado * 100) / 100
  const saleIds = (saleRows || []).map((r) => String(r.id))
  if (saleIds.length === 0) {
    return { totalCobrado: 0, porMedio: [] }
  }
  const { data: spRows } = await supabase
    .from("sale_payments")
    .select("payment_kind, amount")
    .eq("pop_id", popId)
    .in("sale_id", saleIds)
  const sums = new Map<string, number>()
  for (const row of spRows || []) {
    const kind = String(row.payment_kind ?? "other")
    sums.set(kind, (sums.get(kind) ?? 0) + parseAmount(row.amount))
  }
  const porMedio = [...sums.entries()]
    .map(([kind, total]) => ({
      name: operationPaymentKindLabel(kind),
      kind,
      total: Math.round(total * 100) / 100,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"))
  return { totalCobrado, porMedio }
}

export async function getCashRegistersPageData(popId: string): Promise<
  | {
      success: true
      popName: string
      popFiscalCuit: string | null
      popFiscalRazonSocial: string | null
      registers: CashRegisterRow[]
      cashTreasuryAccounts: CashTreasuryAccountOption[]
      paymentMethods: PaymentMethodOption[]
      canRead: boolean
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
    }
  | { success: false; error: string; redirect?: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso", redirect: "/home" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    const canRead = permissionKeysInclude(
      snap.keys,
      POP_PERMS.CASH_REGISTER_READ.resource,
      POP_PERMS.CASH_REGISTER_READ.action,
    )
    if (!canRead) {
      return {
        success: false,
        error: "You do not have permission to view cash registers.",
        redirect: popMenuHref(await getPopSiteId(popId), popId),
      }
    }
    const canCreate = permissionKeysInclude(
      snap.keys,
      POP_PERMS.CASH_REGISTER_CREATE.resource,
      POP_PERMS.CASH_REGISTER_CREATE.action,
    )
    const canUpdate = permissionKeysInclude(
      snap.keys,
      POP_PERMS.CASH_REGISTER_UPDATE.resource,
      POP_PERMS.CASH_REGISTER_UPDATE.action,
    )
    const canDelete = permissionKeysInclude(
      snap.keys,
      POP_PERMS.CASH_REGISTER_DELETE.resource,
      POP_PERMS.CASH_REGISTER_DELETE.action,
    )
    const popRes = await getPopById(popId)
    const popName =
      popRes.success && popRes.pop ? String(popRes.pop.name ?? "") : ""
    const popFiscalCuit =
      popRes.success && popRes.pop?.fiscalCuit
        ? String(popRes.pop.fiscalCuit).trim()
        : null
    const popFiscalRazonSocial =
      popRes.success && popRes.pop?.fiscalRazonSocial
        ? String(popRes.pop.fiscalRazonSocial).trim()
        : null
    const supabase = await createClient()
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    const currentUserId = currentUser?.id ?? null
    const { data: regs, error: regErr } = await supabase
      .from("cash_registers")
      .select(
        "id, name, sort_order, is_active, cash_treasury_account_id, arca_pto_vta, arca_certificate_secret_name, arca_certificate_last_four, arca_certificate_expires_at, arca_certificate_crt_uploaded_at, arca_certificate_key_uploaded_at",
      )
      .eq("pop_id", popId)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
    if (regErr) {
      return { success: false, error: regErr.message || "Could not load registers." }
    }
    const { data: openSessions, error: sessErr } = await supabase
      .from("cash_register_sessions")
      .select("id, cash_register_id, opening_cash, opened_at, opened_by, note")
      .eq("pop_id", popId)
      .eq("status", "open")
    if (sessErr) {
      return { success: false, error: sessErr.message || "Could not load sessions." }
    }
    const openByRegister = new Map<
      string,
      {
        id: string
        opening_cash: number
        opened_at: string
        opened_by: string | null
        note: string | null
      }
    >()
    for (const s of openSessions || []) {
      const rid = String(s.cash_register_id)
      openByRegister.set(rid, {
        id: String(s.id),
        opening_cash: parseAmount(s.opening_cash),
        opened_at: String(s.opened_at ?? ""),
        opened_by: s.opened_by != null ? String(s.opened_by) : null,
        note: s.note != null ? String(s.note) : null,
      })
    }
    const openUserIds = [...openByRegister.values()]
      .map((session) => session.opened_by)
      .filter(Boolean) as string[]
    const openUserNames = await loadUserDisplayNames(supabase, openUserIds)
    const arqueoNumberBySessionId = new Map<string, number>()
    for (const r of regs || []) {
      const registerId = String(r.id)
      const { data: registerSessions } = await supabase
        .from("cash_register_sessions")
        .select("id, opened_at")
        .eq("pop_id", popId)
        .eq("cash_register_id", registerId)
        .order("opened_at", { ascending: true })
      ;(registerSessions || []).forEach((sessionRow, index) => {
        arqueoNumberBySessionId.set(String(sessionRow.id), index + 1)
      })
    }
    const registers: CashRegisterRow[] = []
    for (const r of regs || []) {
      const id = String(r.id)
      const open = openByRegister.get(id)
      let cashBalance: number | null = null
      let openSessionId: string | null = null
      let canCloseOpenSession = false
      let openedAt: string | null = null
      let openSessionMeta: CashRegisterOpenSessionMeta | null = null
      let openSessionTotals: CashRegisterOpenSessionTotals | null = null
      if (open) {
        openSessionId = open.id
        openedAt = open.opened_at
        openSessionMeta = {
          arqueoNumber: arqueoNumberBySessionId.get(open.id) ?? 0,
          openedByUserId: open.opened_by,
          openedByName: open.opened_by
            ? (openUserNames.get(open.opened_by) ?? "Usuario")
            : null,
          openingNote: open.note?.trim() ? open.note.trim() : null,
        }
        if (currentUserId) {
          canCloseOpenSession = canCloseCashRegisterSession({
            currentUserId,
            openedByUserId: open.opened_by,
            permissionKeys: snap.keys,
          })
        }
        const ef = await computeEfectivoTeoricoSession(supabase, popId, open.id)
        if (ef.success) {
          cashBalance = ef.teorico
          let totalCobradoTurno: number | null = null
          let cobrosPorMedio: CashRegisterOpenSessionTotals["cobrosPorMedio"] =
            null
          let cobrosPorCuenta: CashRegisterOpenSessionTotals["cobrosPorCuenta"] =
            null
          let cobrosParaCierre: CashRegisterOpenSessionTotals["cobrosParaCierre"] =
            null
          if (canRead) {
            const cob = await loadCobrosTurnoPorMedio(
              supabase,
              popId,
              open.id,
            )
            totalCobradoTurno = cob.totalCobrado
            cobrosPorMedio = cob.porMedio
            const porCuenta = await loadSessionCobrosByTreasuryLine(
              supabase,
              popId,
              open.id,
            )
            cobrosPorCuenta = mapTreasuryLineCobros(porCuenta)
            const paraCierre = await loadSessionCobrosForClose(
              supabase,
              popId,
              open.id,
            )
            cobrosParaCierre = mapCloseCobros(paraCierre)
          }
          openSessionTotals = {
            openingCash: ef.openingCash,
            ventasEfectivo: ef.ventasEfectivo,
            ingresosCajon: ef.ingresosCajon,
            egresosCajon: ef.egresosCajon,
            efectivoTeoricoEnCajon: ef.teorico,
            totalCobradoTurno,
            cobrosPorMedio,
            cobrosPorCuenta,
            cobrosParaCierre,
          }
        } else {
          cashBalance = await computeCashBalance(
            supabase,
            open.id,
            open.opening_cash,
          )
        }
      }
      registers.push({
        id,
        name: String(r.name ?? ""),
        sortOrder: Number(r.sort_order ?? 0) || 0,
        isActive: Boolean(r.is_active),
        cashTreasuryAccountId:
          r.cash_treasury_account_id != null
            ? String(r.cash_treasury_account_id)
            : null,
        openSessionId,
        canCloseOpenSession,
        cashBalance,
        openedAt,
        openSessionMeta,
        openSessionTotals,
        arcaPtoVta:
          r.arca_pto_vta != null && Number.isFinite(Number(r.arca_pto_vta))
            ? Number(r.arca_pto_vta)
            : null,
        arcaCertificateSecretName:
          r.arca_certificate_secret_name != null
            ? String(r.arca_certificate_secret_name)
            : null,
        arcaCertificateLastFour:
          r.arca_certificate_last_four != null
            ? String(r.arca_certificate_last_four)
            : null,
        arcaCertificateExpiresAt:
          r.arca_certificate_expires_at != null
            ? String(r.arca_certificate_expires_at).slice(0, 10)
            : null,
        arcaCrtUploadedAt:
          r.arca_certificate_crt_uploaded_at != null
            ? String(r.arca_certificate_crt_uploaded_at)
            : null,
        arcaKeyUploadedAt:
          r.arca_certificate_key_uploaded_at != null
            ? String(r.arca_certificate_key_uploaded_at)
            : null,
      })
    }
    const { data: cashTaRows, error: cashTaErr } = await supabase
      .from("treasury_accounts")
      .select("id, name, sort_order")
      .eq("pop_id", popId)
      .eq("kind", "cash")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
    if (cashTaErr) {
      return {
        success: false,
        error: cashTaErr.message || "Could not load cash treasury accounts.",
      }
    }
    const cashTreasuryAccounts: CashTreasuryAccountOption[] = (
      cashTaRows || []
    ).map((row) => ({
      id: String(row.id),
      name: String(row.name ?? ""),
    }))

    const paymentMethods: PaymentMethodOption[] = OPERATION_PAYMENT_KINDS.filter(
      (k) => k.value !== "cash",
    ).map((k) => ({ kind: k.value, label: k.label }))
    return {
      success: true,
      popName,
      popFiscalCuit,
      popFiscalRazonSocial,
      registers,
      cashTreasuryAccounts,
      paymentMethods,
      canRead,
      canCreate,
      canUpdate,
      canDelete,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return { success: false, error: message }
  }
}

export async function createCashRegister(
  popId: string,
  input: { name: string; sortOrder: number; cashTreasuryAccountId: string },
): Promise<
  { success: true; registerId: string } | { success: false; error: string }
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
        POP_PERMS.CASH_REGISTER_CREATE.resource,
        POP_PERMS.CASH_REGISTER_CREATE.action,
      )
    ) {
      return { success: false, error: "No permission to create registers." }
    }
    const name = input.name.trim()
    if (!name) {
      return { success: false, error: "Name is required." }
    }
    const sortOrder = Math.trunc(Number(input.sortOrder))
    if (!Number.isFinite(sortOrder)) {
      return { success: false, error: "Invalid sort order." }
    }
    const cashTreasuryAccountId = input.cashTreasuryAccountId.trim()
    if (!/^[0-9a-f-]{36}$/i.test(cashTreasuryAccountId)) {
      return { success: false, error: "Elegí una cuenta de efectivo destino." }
    }
    const supabase = await createClient()
    const { data: inserted, error } = await supabase
      .from("cash_registers")
      .insert({
        pop_id: popId,
        name,
        sort_order: sortOrder,
        is_active: true,
        cash_treasury_account_id: cashTreasuryAccountId,
      })
      .select("id")
      .single()
    if (error || !inserted?.id) {
      return {
        success: false,
        error: error?.message || "Could not create.",
      }
    }
    return { success: true, registerId: String(inserted.id) }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return { success: false, error: message }
  }
}

export async function updateCashRegister(
  popId: string,
  registerId: string,
  input: {
    name: string
    sortOrder: number
    isActive: boolean
    cashTreasuryAccountId: string
    arcaPtoVta: number | null
    arcaCertificateSecretName: string | null
    arcaCertificateLastFour: string | null
    /** YYYY-MM-DD o vacío → null */
    arcaCertificateExpiresAt: string | null
  },
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
        POP_PERMS.CASH_REGISTER_UPDATE.resource,
        POP_PERMS.CASH_REGISTER_UPDATE.action,
      )
    ) {
      return { success: false, error: "No permission to update." }
    }
    const name = input.name.trim()
    if (!name) {
      return { success: false, error: "Name is required." }
    }
    const sortOrder = Math.trunc(Number(input.sortOrder))
    if (!Number.isFinite(sortOrder)) {
      return { success: false, error: "Invalid sort order." }
    }
    const pto = input.arcaPtoVta
    if (
      pto != null &&
      (!Number.isFinite(pto) || pto < 0 || pto > 99999)
    ) {
      return { success: false, error: "Punto de venta inválido (0–99999)." }
    }
    const cashTreasuryAccountId = input.cashTreasuryAccountId.trim()
    if (!/^[0-9a-f-]{36}$/i.test(cashTreasuryAccountId)) {
      return { success: false, error: "Elegí una cuenta de efectivo destino." }
    }
    const supabase = await createClient()
    const secretTrim = input.arcaCertificateSecretName?.trim() ?? ""
    const lastFourTrim = input.arcaCertificateLastFour?.trim() ?? ""
    const expRaw = input.arcaCertificateExpiresAt?.trim() ?? ""
    const arca_certificate_expires_at =
      expRaw.length > 0 ? expRaw.slice(0, 10) : null
    const { error } = await supabase
      .from("cash_registers")
      .update({
        name,
        sort_order: sortOrder,
        is_active: input.isActive,
        cash_treasury_account_id: cashTreasuryAccountId,
        arca_pto_vta: pto,
        arca_certificate_secret_name: secretTrim.length > 0 ? secretTrim : null,
        arca_certificate_last_four: lastFourTrim.length > 0 ? lastFourTrim : null,
        arca_certificate_expires_at,
      })
      .eq("id", registerId)
      .eq("pop_id", popId)
    if (error) {
      return { success: false, error: error.message || "Could not save." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return { success: false, error: message }
  }
}

export async function uploadCashRegisterArcaCertificates(
  popId: string,
  registerId: string,
  formData: FormData,
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
        POP_PERMS.CASH_REGISTER_UPDATE.resource,
        POP_PERMS.CASH_REGISTER_UPDATE.action,
      )
    ) {
      return { success: false, error: "No permission to update." }
    }
    const crt = formData.get("crt")
    const key = formData.get("key")
    if (!(crt instanceof File) || !(key instanceof File)) {
      return {
        success: false,
        error: "Subí el archivo .crt y el .key (ambos).",
      }
    }
    if (crt.size === 0 || key.size === 0) {
      return { success: false, error: "Los archivos no pueden estar vacíos." }
    }
    const crtName = crt.name.toLowerCase()
    const keyName = key.name.toLowerCase()
    if (!crtName.endsWith(".crt")) {
      return {
        success: false,
        error: "El certificado debe ser un archivo .crt.",
      }
    }
    if (!keyName.endsWith(".key")) {
      return {
        success: false,
        error: "La clave privada debe ser un archivo .key.",
      }
    }
    const certText = Buffer.from(await crt.arrayBuffer()).toString("utf8")
    const keyText = Buffer.from(await key.arrayBuffer()).toString("utf8")
    if (!looksLikePemCert(certText)) {
      return {
        success: false,
        error: "El .crt no parece un PEM de certificado válido.",
      }
    }
    if (!looksLikePemKey(keyText)) {
      return {
        success: false,
        error: "El .key no parece una clave privada PEM válida.",
      }
    }
    const up = await uploadCashRegisterArcaPemFiles({
      popId,
      registerId,
      certPemUtf8: certText,
      keyPemUtf8: keyText,
    })
    if (!up.success) return up
    const expField = formData.get("expiresAt")
    const expStr =
      typeof expField === "string" && expField.trim().length > 0
        ? expField.trim().slice(0, 10)
        : null
    const now = new Date().toISOString()
    const supabase = await createClient()
    const { error } = await supabase
      .from("cash_registers")
      .update({
        arca_certificate_crt_uploaded_at: now,
        arca_certificate_key_uploaded_at: now,
        arca_certificate_expires_at: expStr,
      })
      .eq("id", registerId)
      .eq("pop_id", popId)
    if (error) {
      return { success: false, error: error.message || "Could not save metadata." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error"
    if (
      message.includes("SUPABASE_SERVICE_ROLE_KEY") ||
      message.includes("URL de Supabase")
    ) {
      return {
        success: false,
        error:
          "Falta configurar el almacenamiento en el servidor (SUPABASE_SERVICE_ROLE_KEY).",
      }
    }
    return { success: false, error: message }
  }
}

export async function deleteCashRegister(
  popId: string,
  registerId: string,
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
        POP_PERMS.CASH_REGISTER_DELETE.resource,
        POP_PERMS.CASH_REGISTER_DELETE.action,
      )
    ) {
      return { success: false, error: "No permission to delete." }
    }
    const supabase = await createClient()
    const { data: open } = await supabase
      .from("cash_register_sessions")
      .select("id")
      .eq("pop_id", popId)
      .eq("cash_register_id", registerId)
      .eq("status", "open")
      .maybeSingle()
    if (open) {
      return {
        success: false,
        error: "Close the register before deleting it.",
      }
    }
    const { error } = await supabase
      .from("cash_registers")
      .delete()
      .eq("id", registerId)
      .eq("pop_id", popId)
    if (error) {
      return { success: false, error: error.message || "Could not delete." }
    }
    try {
      await removeCashRegisterArcaPemFiles(popId, registerId)
    } catch {
      /* best-effort: borrar objetos del bucket */
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return { success: false, error: message }
  }
}

export async function openCashSession(
  popId: string,
  registerId: string,
  openingCash: number,
  openingNote?: string | null,
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
        POP_PERMS.CASH_REGISTER_CREATE.resource,
        POP_PERMS.CASH_REGISTER_CREATE.action,
      )
    ) {
      return { success: false, error: "No permission to open a session." }
    }
    const cash = parseAmount(openingCash)
    if (cash < 0) {
      return { success: false, error: "Opening cash cannot be negative." }
    }
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user?.id) {
      return { success: false, error: "Not authenticated." }
    }
    const { data: regRow, error: regErr } = await supabase
      .from("cash_registers")
      .select("id, cash_treasury_account_id")
      .eq("id", registerId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (regErr || !regRow?.id) {
      return { success: false, error: "Caja no encontrada." }
    }
    if (!regRow.cash_treasury_account_id) {
      return {
        success: false,
        error:
          "Configurá la cuenta de efectivo destino en esta caja antes de abrir el turno.",
      }
    }
    const noteTrim = openingNote?.trim() ?? ""
    const { error } = await supabase.from("cash_register_sessions").insert({
      pop_id: popId,
      cash_register_id: registerId,
      status: "open",
      opened_by: user.id,
      opening_cash: cash,
      note: noteTrim.length > 0 ? noteTrim : null,
    })
    if (error) {
      return { success: false, error: error.message || "Could not open session." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return { success: false, error: message }
  }
}

export async function closeCashSession(
  popId: string,
  sessionId: string,
  snapshot: ClosingSnapshot,
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
        POP_PERMS.CASH_REGISTER_UPDATE.resource,
        POP_PERMS.CASH_REGISTER_UPDATE.action,
      )
    ) {
      return { success: false, error: "No permission to close a session." }
    }
    const cash = parseAmount(snapshot.cash)
    if (cash < 0) {
      return { success: false, error: "Cash total cannot be negative." }
    }
    const pm: Record<string, number> = {}
    for (const [k, v] of Object.entries(snapshot.payment_methods ?? {})) {
      const n = parseAmount(v)
      if (n < 0) {
        return { success: false, error: "Amounts cannot be negative." }
      }
      pm[k] = n
    }
    const treasuryLines: Record<string, number> = {}
    for (const [k, v] of Object.entries(snapshot.treasury_lines ?? {})) {
      const n = parseAmount(v)
      if (n < 0) {
        return { success: false, error: "Amounts cannot be negative." }
      }
      treasuryLines[k] = n
    }
    const useTreasuryLines = Object.keys(treasuryLines).length > 0
    const closeNote = snapshot.note?.trim() ?? ""
    const closing_snapshot: Record<string, unknown> = {
      cash,
      ...(useTreasuryLines
        ? { treasury_lines: treasuryLines }
        : { payment_methods: pm }),
    }
    if (closeNote.length > 0) {
      closing_snapshot.note = closeNote
    }
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user?.id) {
      return { success: false, error: "Not authenticated." }
    }

    const { data: openSessionRow, error: sessionLookupErr } = await supabase
      .from("cash_register_sessions")
      .select("id, opened_by, status")
      .eq("id", sessionId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (sessionLookupErr) {
      return {
        success: false,
        error: sessionLookupErr.message || "No se pudo validar el turno.",
      }
    }
    if (!openSessionRow?.id || String(openSessionRow.status) !== "open") {
      return {
        success: false,
        error: "Session not found or already closed.",
      }
    }
    const openedByUserId =
      openSessionRow.opened_by != null
        ? String(openSessionRow.opened_by)
        : null
    if (
      !canCloseCashRegisterSession({
        currentUserId: user.id,
        openedByUserId,
        permissionKeys: snap.keys,
      })
    ) {
      return {
        success: false,
        error:
          "Solo quien abrió el turno o un supervisor con permisos completos de cajas puede cerrarlo.",
      }
    }

    const teorRes = await computeEfectivoTeoricoSession(
      supabase,
      popId,
      sessionId,
    )
    if (!teorRes.success) {
      return { success: false, error: teorRes.error }
    }
    const counted = cash
    const teorico = teorRes.teorico
    const cashDiff = Math.round((counted - teorico) * 100) / 100
    let arqueoEntryId: string | null = null

    const cobrosByKind = await loadSessionNonCashCobrosByKind(
      supabase,
      popId,
      sessionId,
    )
    const cobrosByLine = await loadSessionCobrosForClose(
      supabase,
      popId,
      sessionId,
    )

    let entryLines: {
      account_id: string
      debit_amount: number
      credit_amount: number
      description: string | null
      line_order: number
    }[] = []
    let nextLineOrder = 1

    const cashLinesRes = await buildCashCloseAdjustmentLines(
      supabase,
      popId,
      cashDiff,
      nextLineOrder,
    )
    if (!cashLinesRes.success) {
      return { success: false, error: cashLinesRes.error }
    }
    entryLines = entryLines.concat(cashLinesRes.lines)
    nextLineOrder = cashLinesRes.nextLineOrder

    if (useTreasuryLines) {
      const tlLinesRes = await buildTreasuryLineCloseAdjustmentLines(
        supabase,
        popId,
        treasuryLines,
        cobrosByLine,
        nextLineOrder,
      )
      if (!tlLinesRes.success) {
        return { success: false, error: tlLinesRes.error }
      }
      entryLines = entryLines.concat(tlLinesRes.lines)
      nextLineOrder = tlLinesRes.nextLineOrder
    } else {
      const pmLinesRes = await buildPaymentKindCloseAdjustmentLines(
        supabase,
        popId,
        pm,
        cobrosByKind,
        nextLineOrder,
      )
      if (!pmLinesRes.success) {
        return { success: false, error: pmLinesRes.error }
      }
      entryLines = entryLines.concat(pmLinesRes.lines)
    }

    if (entryLines.length > 0) {
      const popRes = await getPopById(popId)
      if (!popRes.success || !popRes.pop) {
        return {
          success: false,
          error: popRes.error || "No se pudo validar el punto de venta.",
        }
      }
      const tz = timezoneForPopLedger(popRes.pop.country, popRes.pop.siteId)
      const entryDate = entryDateIsoInTimezone(tz)
      const descBase = "Ajustes de cierre de caja (arqueo y liquidación)"

      const { data: maxRow } = await supabase
        .from("accounting_entries")
        .select("entry_number")
        .eq("pop_id", popId)
        .order("entry_number", { ascending: false })
        .limit(1)
        .maybeSingle()
      const nextNum =
        maxRow?.entry_number != null && Number.isFinite(Number(maxRow.entry_number))
          ? Number(maxRow.entry_number) + 1
          : 1

      const { data: entIns, error: entErr } = await supabase
        .from("accounting_entries")
        .insert({
          pop_id: popId,
          entry_number: nextNum,
          entry_date: entryDate,
          source_type: "cash_register_close",
          source_id: sessionId,
          description: descBase,
          status: "draft",
          created_by: user.id,
        })
        .select("id")
        .single()
      if (entErr || !entIns?.id) {
        return {
          success: false,
          error: entErr?.message || "No se pudo crear el asiento de arqueo.",
        }
      }
      arqueoEntryId = String(entIns.id)

      const { error: linesErr } = await supabase.from("accounting_entry_lines").insert(
        entryLines.map((line) => ({ ...line, entry_id: arqueoEntryId })),
      )
      if (linesErr) {
        await cancelAccountingEntry(supabase, arqueoEntryId)
        return {
          success: false,
          error: linesErr.message || "No se pudo registrar el asiento de arqueo.",
        }
      }

      const { error: postErr } = await supabase
        .from("accounting_entries")
        .update({
          status: "posted",
          posted_at: new Date().toISOString(),
          posted_by: user.id,
        })
        .eq("id", arqueoEntryId)
      if (postErr) {
        await cancelAccountingEntry(supabase, arqueoEntryId)
        return {
          success: false,
          error: postErr.message || "No se pudo registrar el asiento de arqueo.",
        }
      }
    }

    const { data: closedRow, error } = await supabase
      .from("cash_register_sessions")
      .update({
        status: "closed",
        closed_at: new Date().toISOString(),
        closed_by: user.id,
        closing_snapshot,
      })
      .eq("id", sessionId)
      .eq("pop_id", popId)
      .eq("status", "open")
      .select("id")
      .maybeSingle()
    if (error) {
      if (arqueoEntryId) {
        await cancelAccountingEntry(supabase, arqueoEntryId)
      }
      return { success: false, error: error.message || "Could not close session." }
    }
    if (!closedRow) {
      if (arqueoEntryId) {
        await cancelAccountingEntry(supabase, arqueoEntryId)
      }
      return {
        success: false,
        error: "Session not found or already closed.",
      }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return { success: false, error: message }
  }
}

export async function addCashMovement(
  popId: string,
  sessionId: string,
  input: { kind: "deposit" | "withdrawal"; amount: number; note: string },
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
        POP_PERMS.CASH_REGISTER_CREATE.resource,
        POP_PERMS.CASH_REGISTER_CREATE.action,
      )
    ) {
      return { success: false, error: "No permission to add movements." }
    }
    const amount = parseAmount(input.amount)
    if (amount <= 0) {
      return { success: false, error: "Amount must be greater than zero." }
    }
    const supabase = await createClient()
    const { data: sess } = await supabase
      .from("cash_register_sessions")
      .select("opening_cash")
      .eq("id", sessionId)
      .eq("pop_id", popId)
      .eq("status", "open")
      .maybeSingle()
    if (!sess) {
      return { success: false, error: "Session is not open." }
    }
    const opening = parseAmount(sess.opening_cash)
    const bal = await computeCashBalance(supabase, sessionId, opening)
    if (input.kind === "withdrawal" && amount > bal) {
      return { success: false, error: "Withdrawal exceeds cash on hand." }
    }
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user?.id) {
      return { success: false, error: "Not authenticated." }
    }
    const note = input.note.trim()
    const { error } = await supabase.from("cash_register_movements").insert({
      pop_id: popId,
      session_id: sessionId,
      kind: input.kind,
      amount,
      note: note.length > 0 ? note : null,
      created_by: user.id,
    })
    if (error) {
      return { success: false, error: error.message || "Could not save movement." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return { success: false, error: message }
  }
}

function paymentMethodLabel(id: string): string {
  if (id === "__cash_counted") return "Efectivo (contado al cierre)"
  return operationPaymentKindLabel(id)
}

export async function getCashRegisterSummary(
  popId: string,
  registerId: string,
): Promise<
  | { success: true; data: CashRegisterSummaryData }
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
        POP_PERMS.CASH_REGISTER_READ.resource,
        POP_PERMS.CASH_REGISTER_READ.action,
      )
    ) {
      return { success: false, error: "No permission to view cash registers." }
    }
    const supabase = await createClient()
    const { operationalDayCloseTime } = await loadPopOperationalContext(
      supabase,
      popId,
    )
    const { data: reg, error: regErr } = await supabase
      .from("cash_registers")
      .select("id, name")
      .eq("pop_id", popId)
      .eq("id", registerId)
      .maybeSingle()
    if (regErr) {
      return { success: false, error: regErr.message || "Could not load register." }
    }
    if (!reg) {
      return { success: false, error: "Register not found." }
    }
    const registerName = String(reg.name ?? "")
    const { data: sessRows, error: sessErr } = await supabase
      .from("cash_register_sessions")
      .select(
        "id, status, opened_at, closed_at, opening_cash, note, closing_snapshot, opened_by, closed_by",
      )
      .eq("pop_id", popId)
      .eq("cash_register_id", registerId)
      .order("opened_at", { ascending: false })
    if (sessErr) {
      return { success: false, error: sessErr.message || "Could not load sessions." }
    }
    const sessionIds = (sessRows || []).map((s) => String(s.id))
    let moveRows: {
      id: unknown
      session_id: unknown
      kind: unknown
      amount: unknown
      note: unknown
      created_at: unknown
      created_by: unknown
    }[] = []
    if (sessionIds.length > 0) {
      const { data: m, error: mErr } = await supabase
        .from("cash_register_movements")
        .select("id, session_id, kind, amount, note, created_at, created_by")
        .eq("pop_id", popId)
        .in("session_id", sessionIds)
        .order("created_at", { ascending: false })
      if (mErr) {
        return { success: false, error: mErr.message || "Could not load movements." }
      }
      moveRows = m || []
    }
    const sessionOpenedAt = new Map<string, string>()
    for (const s of sessRows || []) {
      sessionOpenedAt.set(String(s.id), String(s.opened_at ?? ""))
    }
    const depWit = new Map<string, { dep: number; wit: number }>()
    for (const sid of sessionIds) {
      depWit.set(sid, { dep: 0, wit: 0 })
    }
    let depositTotal = 0
    let withdrawalTotal = 0
    for (const m of moveRows) {
      const amt = parseAmount(m.amount)
      const kind = String(m.kind)
      const bucket = depWit.get(String(m.session_id))
      if (kind === "deposit") {
        depositTotal += amt
        if (bucket) bucket.dep += amt
      } else if (kind === "withdrawal") {
        withdrawalTotal += amt
        if (bucket) bucket.wit += amt
      }
    }
    const sessions: CashRegisterSummarySession[] = []
    const sessionPaymentSums = new Map<
      string,
      Map<string, number>
    >()
    const sessionSaleTotals = new Map<string, number>()

    for (const s of sessRows || []) {
      const id = String(s.id)
      const st = String(s.status) === "closed" ? "closed" : "open"
      const dw = depWit.get(id) ?? { dep: 0, wit: 0 }
      const closingSnapshot =
        st === "closed" ? parseClosingSnapshot(s.closing_snapshot) : null
      sessions.push({
        id,
        status: st,
        openedAt: String(s.opened_at ?? ""),
        closedAt: s.closed_at != null ? String(s.closed_at) : null,
        openingCash: parseAmount(s.opening_cash),
        openingNote: s.note != null ? String(s.note) : null,
        closingSnapshot,
        movementDeposits: Math.round(dw.dep * 100) / 100,
        movementWithdrawals: Math.round(dw.wit * 100) / 100,
        totalCobrado: 0,
        ventasPorMedio: [],
        ventasPorCuenta: [],
        ventasParaCierre: [],
        arqueoNumber: 0,
        openedByUserId: null,
        openedByName: null,
        closedByUserId: null,
        closedByName: null,
        efectivoTeorico: 0,
        cashArqueoDifference: null,
      })
      sessionPaymentSums.set(id, new Map())
      sessionSaleTotals.set(id, 0)
    }
    const movements: CashRegisterSummaryMovement[] = moveRows.map((m) => ({
      id: String(m.id),
      sessionId: String(m.session_id),
      sessionOpenedAt: sessionOpenedAt.get(String(m.session_id)) ?? "",
      createdAt: String(m.created_at ?? ""),
      kind: String(m.kind) === "withdrawal" ? "withdrawal" : "deposit",
      amount: parseAmount(m.amount),
      note: m.note != null ? String(m.note) : null,
      createdBy: m.created_by != null ? String(m.created_by) : null,
    }))
    let closingBlocks: CashRegisterSummaryClosingBlock[] = []
    let aggregatedClosingLines: { label: string; amount: number }[] = []
    let arqueo: CashRegisterSummaryData["arqueo"] = null
    let sales: CashRegisterSummarySale[] = []
    const salesIncluded = true
    {
      const { data: completedSaleIds } = await supabase
        .from("sales")
        .select("id")
        .eq("pop_id", popId)
        .eq("cash_register_id", registerId)
        .eq("status", "completed")
      const saleIdList = (completedSaleIds || []).map((r) => String(r.id))
      let ventasPorMedioPago: CashRegisterArqueoVentaPorMedio[] = []
      if (saleIdList.length > 0) {
        const { data: spRows } = await supabase
          .from("sale_payments")
          .select("payment_kind, amount")
          .eq("pop_id", popId)
          .in("sale_id", saleIdList)
        const sums = new Map<string, number>()
        for (const row of spRows || []) {
          const kind = String(row.payment_kind ?? "other")
          sums.set(kind, (sums.get(kind) ?? 0) + parseAmount(row.amount))
        }
        ventasPorMedioPago = [...sums.entries()]
          .map(([paymentKind, total]) => ({
            paymentKind,
            name: operationPaymentKindLabel(paymentKind),
            kind: paymentKind,
            totalVentas: Math.round(total * 100) / 100,
          }))
          .sort((a, b) => a.name.localeCompare(b.name, "es"))
      }
      let sesionAbierta: CashRegisterArqueoSesionAbierta | null = null
      const openSess = (sessRows || []).find(
        (s) => String(s.status) === "open",
      )
      if (openSess) {
        const osid = String(openSess.id)
        const openingCash = parseAmount(openSess.opening_cash)
        const { data: osSaleIds } = await supabase
          .from("sales")
          .select("id")
          .eq("pop_id", popId)
          .eq("cash_register_session_id", osid)
          .eq("status", "completed")
        const osIdList = (osSaleIds || []).map((r) => String(r.id))
        let ventasEfectivo = 0
        if (osIdList.length > 0) {
          const { data: osp } = await supabase
            .from("sale_payments")
            .select("payment_kind, amount")
            .eq("pop_id", popId)
            .in("sale_id", osIdList)
          for (const row of osp || []) {
            if (String(row.payment_kind) === "cash") {
              ventasEfectivo += parseAmount(row.amount)
            }
          }
        }
        ventasEfectivo = Math.round(ventasEfectivo * 100) / 100
        const dw = depWit.get(osid) ?? { dep: 0, wit: 0 }
        const ingresosCajon = Math.round(dw.dep * 100) / 100
        const egresosCajon = Math.round(dw.wit * 100) / 100
        const efectivoTeoricoEnCajon =
          Math.round(
            (openingCash + ventasEfectivo + ingresosCajon - egresosCajon) *
              100,
          ) / 100
        sesionAbierta = {
          sessionId: osid,
          openingCash,
          ventasEfectivo,
          ingresosCajon,
          egresosCajon,
          efectivoTeoricoEnCajon,
        }
      }
      arqueo = { ventasPorMedioPago, sesionAbierta }
      const { data: saleRows, error: saleErr } = await supabase
        .from("sales")
        .select(
          "id, cash_register_session_id, sold_at, total, status, created_by, customer_name, currency",
        )
        .eq("pop_id", popId)
        .eq("cash_register_id", registerId)
        .order("sold_at", { ascending: false })
        .limit(500)
      if (saleErr) {
        return {
          success: false,
          error: saleErr.message || "No se pudieron cargar las ventas.",
        }
      }
      sales = (saleRows || []).map((r) => ({
        id: String(r.id),
        cashRegisterSessionId: String(r.cash_register_session_id ?? ""),
        soldAt: String(r.sold_at ?? ""),
        total: parseAmount(r.total),
        status: String(r.status ?? ""),
        createdBy: r.created_by != null ? String(r.created_by) : null,
        customerName: r.customer_name != null ? String(r.customer_name) : null,
        currency: String(r.currency ?? "ARS"),
      }))

      const sessionCompletedSaleIds = sales
        .filter((sale) => sale.status === "completed")
        .map((sale) => sale.id)
      if (sessionCompletedSaleIds.length > 0) {
        const saleSessionById = new Map(
          sales.map((sale) => [sale.id, sale.cashRegisterSessionId]),
        )
        const { data: spRows } = await supabase
          .from("sale_payments")
          .select("sale_id, payment_kind, amount")
          .eq("pop_id", popId)
          .in("sale_id", sessionCompletedSaleIds)
        for (const row of spRows || []) {
          const saleId = String(row.sale_id ?? "")
          const sessionId = saleSessionById.get(saleId)
          if (!sessionId) continue
          const kind = String(row.payment_kind ?? "other")
          const amt = parseAmount(row.amount)
          const bucket = sessionPaymentSums.get(sessionId)
          if (bucket) {
            bucket.set(kind, (bucket.get(kind) ?? 0) + amt)
          }
        }
        for (const sale of sales) {
          if (sale.status !== "completed") continue
          sessionSaleTotals.set(
            sale.cashRegisterSessionId,
            (sessionSaleTotals.get(sale.cashRegisterSessionId) ?? 0) +
              sale.total,
          )
        }
      }

      for (const session of sessions) {
        const payments = sessionPaymentSums.get(session.id)
        session.totalCobrado = Math.round(
          (sessionSaleTotals.get(session.id) ?? 0) * 100,
        ) / 100
        session.ventasPorMedio = payments
          ? [...payments.entries()]
              .map(([paymentKind, total]) => ({
                paymentKind,
                name: operationPaymentKindLabel(paymentKind),
                total: Math.round(total * 100) / 100,
              }))
              .sort((a, b) => a.name.localeCompare(b.name, "es"))
          : []
        const porCuenta = await loadSessionCobrosByTreasuryLine(
          supabase,
          popId,
          session.id,
        )
        session.ventasPorCuenta = mapTreasuryLineCobros(porCuenta)
        const paraCierre = await loadSessionCobrosForClose(
          supabase,
          popId,
          session.id,
        )
        session.ventasParaCierre = mapCloseCobros(paraCierre)
      }

      const userIds: string[] = []
      for (const s of sessRows || []) {
        if (s.opened_by) userIds.push(String(s.opened_by))
        if (s.closed_by) userIds.push(String(s.closed_by))
      }
      const userNames = await loadUserDisplayNames(supabase, userIds)
      enrichCashRegisterSessions(sessRows || [], sessions, userNames)
      ;({ closingBlocks, aggregatedClosingLines } =
        buildClosingBlocksFromSessions(sessions))
    }
    const data: CashRegisterSummaryData = {
      registerName,
      operationalDayCloseTime,
      sessions,
      movements,
      salesIncluded,
      sales,
      arqueo,
      totals: {
        depositTotal: Math.round(depositTotal * 100) / 100,
        withdrawalTotal: Math.round(withdrawalTotal * 100) / 100,
        netCashMovements:
          Math.round((depositTotal - withdrawalTotal) * 100) / 100,
      },
      closingBlocks,
      aggregatedClosingLines,
    }
    return { success: true, data }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return { success: false, error: message }
  }
}

const SESSION_ARQUEO_SALE_SELECT = `
  id,
  sold_at,
  status,
  total,
  discount_total,
  customer_name,
  client_id,
  sale_channel,
  table_session_id,
  counter_order_id,
  line_items,
  metadata,
  sale_payments (
    amount,
    sort_order,
    payment_kind,
    treasury_account_id,
    treasury_accounts ( name )
  )
`

export async function getCashRegisterSessionArqueoDetail(
  popId: string,
  sessionId: string,
): Promise<
  | { success: true; data: CashRegisterSessionArqueoDetail }
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
        POP_PERMS.CASH_REGISTER_READ.resource,
        POP_PERMS.CASH_REGISTER_READ.action,
      )
    ) {
      return { success: false, error: "No permission to view cash registers." }
    }

    const supabase = await createClient()
    const { data: sessRow, error: sessErr } = await supabase
      .from("cash_register_sessions")
      .select(
        "id, pop_id, cash_register_id, status, opened_at, closed_at, opening_cash, note, closing_snapshot, opened_by, closed_by",
      )
      .eq("id", sessionId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (sessErr || !sessRow?.id) {
      return { success: false, error: sessErr?.message || "Turno no encontrado." }
    }

    const registerId = String(sessRow.cash_register_id)
    const { data: regRow } = await supabase
      .from("cash_registers")
      .select("name")
      .eq("id", registerId)
      .eq("pop_id", popId)
      .maybeSingle()
    const registerName = String(regRow?.name ?? "")

    const { data: allSessRows } = await supabase
      .from("cash_register_sessions")
      .select("id, opened_at, opened_by, closed_by")
      .eq("pop_id", popId)
      .eq("cash_register_id", registerId)
      .order("opened_at", { ascending: true })

    const st = String(sessRow.status) === "closed" ? "closed" : "open"
    const closingSnapshot =
      st === "closed" ? parseClosingSnapshot(sessRow.closing_snapshot) : null

    const { data: moveRows } = await supabase
      .from("cash_register_movements")
      .select("id, kind, amount, note, created_at, created_by")
      .eq("pop_id", popId)
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })

    let dep = 0
    let wit = 0
    for (const m of moveRows || []) {
      const amt = parseAmount(m.amount)
      if (String(m.kind) === "deposit") dep += amt
      else if (String(m.kind) === "withdrawal") wit += amt
    }

    const session: CashRegisterSummarySession = {
      id: sessionId,
      status: st,
      openedAt: String(sessRow.opened_at ?? ""),
      closedAt: sessRow.closed_at != null ? String(sessRow.closed_at) : null,
      openingCash: parseAmount(sessRow.opening_cash),
      openingNote: sessRow.note != null ? String(sessRow.note) : null,
      closingSnapshot,
      movementDeposits: Math.round(dep * 100) / 100,
      movementWithdrawals: Math.round(wit * 100) / 100,
      totalCobrado: 0,
      ventasPorMedio: [],
      ventasPorCuenta: [],
      ventasParaCierre: [],
      arqueoNumber: 0,
      openedByUserId: sessRow.opened_by != null ? String(sessRow.opened_by) : null,
      openedByName: null,
      closedByUserId: sessRow.closed_by != null ? String(sessRow.closed_by) : null,
      closedByName: null,
      efectivoTeorico: 0,
      cashArqueoDifference: null,
    }

    const operations: CashRegisterSessionOperationRow[] = []
    const canReadSales = permissionKeysInclude(
      snap.keys,
      POP_PERMS.SALE_READ.resource,
      POP_PERMS.SALE_READ.action,
    )

    if (canReadSales) {
      const { data: saleRows } = await supabase
        .from("sales")
        .select(SESSION_ARQUEO_SALE_SELECT)
        .eq("pop_id", popId)
        .eq("cash_register_session_id", sessionId)
        .eq("status", "completed")
        .order("sold_at", { ascending: false })

      const { tableLabelsBySessionId, counterOrderLabelsByOrderId } =
        await loadCashRegisterSaleContextLabels(supabase, popId, saleRows || [])

      const paymentSums = new Map<string, number>()
      let totalCobrado = 0

      for (const row of saleRows || []) {
        const saleId = String(row.id)
        const saleChannel = parseCashRegisterSaleChannel(row.sale_channel)
        const sessionIdForTable =
          row.table_session_id != null ? String(row.table_session_id).trim() : ""
        const orderId =
          row.counter_order_id != null ? String(row.counter_order_id).trim() : ""
        const operationLabel = formatCashRegisterSaleOperationLabel({
          saleChannel,
          tableLabel: sessionIdForTable
            ? tableLabelsBySessionId.get(sessionIdForTable)
            : null,
          counterOrderLabel: orderId
            ? counterOrderLabelsByOrderId.get(orderId)
            : null,
        })
        const customerLabel =
          row.customer_name != null && String(row.customer_name).trim()
            ? String(row.customer_name).trim()
            : row.client_id
              ? "Cliente registrado"
              : "Consumidor final"
        const detail = formatCashRegisterSaleDetail(
          row.line_items,
          parseAmount(row.discount_total),
        )
        const paymentsRaw = row.sale_payments as
          | Array<{
              amount?: unknown
              sort_order?: unknown
              payment_kind?: unknown
              treasury_accounts?:
                | { name?: string }
                | Array<{ name?: string }>
                | null
            }>
          | null
        const payList = Array.isArray(paymentsRaw) ? [...paymentsRaw] : []
        payList.sort(
          (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0),
        )

        totalCobrado += parseAmount(row.total)

        if (payList.length === 0) {
          operations.push({
            id: saleId,
            kind: "sale",
            saleId,
            occurredAt: String(row.sold_at ?? ""),
            operationLabel,
            customerLabel,
            detail,
            paymentMethodLabel: "—",
            amount: parseAmount(row.total),
          })
        } else {
          for (const [index, payment] of payList.entries()) {
            const kind = String(payment.payment_kind ?? "other")
            const amount = parseAmount(payment.amount)
            paymentSums.set(kind, (paymentSums.get(kind) ?? 0) + amount)
            operations.push({
              id: `${saleId}-${index}`,
              kind: "sale",
              saleId,
              occurredAt: String(row.sold_at ?? ""),
              operationLabel,
              customerLabel,
              detail,
              paymentMethodLabel: formatTreasuryPaymentLabelFromRow(payment),
              amount,
            })
          }
        }
      }

      session.totalCobrado = Math.round(totalCobrado * 100) / 100
      session.ventasPorMedio = [...paymentSums.entries()]
        .map(([paymentKind, total]) => ({
          paymentKind,
          name: operationPaymentKindLabel(paymentKind),
          total: Math.round(total * 100) / 100,
        }))
        .sort((a, b) => a.name.localeCompare(b.name, "es"))
      const porCuenta = await loadSessionCobrosByTreasuryLine(
        supabase,
        popId,
        sessionId,
      )
      session.ventasPorCuenta = mapTreasuryLineCobros(porCuenta)
      const paraCierre = await loadSessionCobrosForClose(
        supabase,
        popId,
        sessionId,
      )
      session.ventasParaCierre = mapCloseCobros(paraCierre)
    }

    for (const m of moveRows || []) {
      const kind = String(m.kind) === "withdrawal" ? "withdrawal" : "deposit"
      operations.push({
        id: String(m.id),
        kind,
        saleId: null,
        occurredAt: String(m.created_at ?? ""),
        operationLabel: kind === "deposit" ? "Ingreso" : "Retiro",
        customerLabel: "—",
        detail:
          m.note != null && String(m.note).trim()
            ? String(m.note).trim()
            : kind === "deposit"
              ? "Ingreso al cajón"
              : "Retiro del cajón",
        paymentMethodLabel: "Efectivo",
        amount: parseAmount(m.amount),
      })
    }

    operations.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    )

    const userNames = await loadUserDisplayNames(supabase, [
      session.openedByUserId ?? "",
      session.closedByUserId ?? "",
    ])
    enrichCashRegisterSessions(allSessRows || [], [session], userNames)

    const closingComparison = closingSnapshot
      ? buildClosingComparisonForSession(session)
      : []

    const { data: entryRow } = await supabase
      .from("accounting_entries")
      .select("id")
      .eq("pop_id", popId)
      .eq("source_type", "cash_register_close")
      .eq("source_id", sessionId)
      .eq("status", "posted")
      .maybeSingle()

    return {
      success: true,
      data: {
        registerName,
        session,
        closingComparison,
        hasAccountingEntry: Boolean(entryRow?.id),
        operations,
      },
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return { success: false, error: message }
  }
}

export async function getCashRegistersPeriodReport(
  popId: string,
  options: { from: string | null; to: string | null },
): Promise<
  | { success: true; data: CashRegistersPeriodReportData }
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
        POP_PERMS.CASH_REGISTER_READ.resource,
        POP_PERMS.CASH_REGISTER_READ.action,
      )
    ) {
      return { success: false, error: "No permission to view cash registers." }
    }

    const supabase = await createClient()
    const { timeZone, operationalDayCloseTime } =
      await loadPopOperationalContext(supabase, popId)
    const useOperationalDayFilter = usesOperationalDayFilter(
      operationalDayCloseTime,
      options.from,
      options.to,
    )
    const sessionFetchBounds = useOperationalDayFilter
      ? expandCalendarBoundsForOperationalFetch(options.from, options.to)
      : { from: options.from, to: options.to }
    const { data: regs, error: regErr } = await supabase
      .from("cash_registers")
      .select("id, name")
      .eq("pop_id", popId)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
    if (regErr) {
      return { success: false, error: regErr.message || "Could not load registers." }
    }

    const registerRows = regs || []
    const registerNameById = new Map(
      registerRows.map((reg) => [String(reg.id), String(reg.name ?? "")]),
    )
    const popRes = await getPopById(popId)
    const popInfo: CashRegistersPeriodReportPopInfo = {
      popName:
        popRes.success && popRes.pop
          ? String(popRes.pop.name ?? "").trim()
          : "",
      popStreetAddress:
        popRes.success && popRes.pop?.streetAddress
          ? String(popRes.pop.streetAddress).trim()
          : null,
      popFiscalCuit:
        popRes.success && popRes.pop?.fiscalCuit
          ? String(popRes.pop.fiscalCuit).trim()
          : null,
      popFiscalRazonSocial:
        popRes.success && popRes.pop?.fiscalRazonSocial
          ? String(popRes.pop.fiscalRazonSocial).trim()
          : null,
    }

    if (registerRows.length === 0) {
      return {
        success: true,
        data: { rows: [], registerCount: 0, popInfo },
      }
    }

    let sessQuery = supabase
      .from("cash_register_sessions")
      .select(
        "id, cash_register_id, status, opened_at, closed_at, opening_cash, note, closing_snapshot, opened_by, closed_by",
      )
      .eq("pop_id", popId)
      .eq("status", "closed")
    const periodOrFilter = buildClosedCashRegisterSessionPeriodOrFilter(
      sessionFetchBounds.from,
      sessionFetchBounds.to,
      timeZone,
    )
    if (periodOrFilter) {
      sessQuery = sessQuery.or(periodOrFilter)
    }
    const { data: periodSessRows, error: sessErr } = await sessQuery
    if (sessErr) {
      return { success: false, error: sessErr.message || "Could not load sessions." }
    }

    let sessRows = periodSessRows || []
    if (useOperationalDayFilter) {
      sessRows = filterCashRegisterSessionsByOperationalPeriod(
        sessRows.map((row) => ({
          ...row,
          closedAt: row.closed_at != null ? String(row.closed_at) : null,
          openedAt: String(row.opened_at ?? ""),
        })),
        options.from,
        options.to,
        timeZone,
        operationalDayCloseTime,
      )
    }
    if (sessRows.length === 0) {
      return {
        success: true,
        data: { rows: [], registerCount: registerRows.length, popInfo },
      }
    }

    const sessionIds = sessRows.map((row) => String(row.id))
    const involvedRegisterIds = [
      ...new Set(sessRows.map((row) => String(row.cash_register_id))),
    ]

    const [{ data: moveRows, error: moveErr }, { data: saleRows, error: saleErr }] =
      await Promise.all([
        supabase
          .from("cash_register_movements")
          .select("session_id, kind, amount")
          .eq("pop_id", popId)
          .in("session_id", sessionIds),
        supabase
          .from("sales")
          .select("cash_register_session_id, total, status")
          .eq("pop_id", popId)
          .in("cash_register_session_id", sessionIds)
          .eq("status", "completed"),
      ])
    if (moveErr) {
      return { success: false, error: moveErr.message || "Could not load movements." }
    }
    if (saleErr) {
      return { success: false, error: saleErr.message || "Could not load sales." }
    }

    const depWit = new Map<string, { dep: number; wit: number }>()
    for (const sessionId of sessionIds) {
      depWit.set(sessionId, { dep: 0, wit: 0 })
    }
    for (const movement of moveRows || []) {
      const bucket = depWit.get(String(movement.session_id))
      if (!bucket) continue
      const amount = parseAmount(movement.amount)
      if (String(movement.kind) === "deposit") {
        bucket.dep += amount
      } else if (String(movement.kind) === "withdrawal") {
        bucket.wit += amount
      }
    }

    const sessionSaleTotals = new Map<string, number>()
    for (const sale of saleRows || []) {
      const sessionId = String(sale.cash_register_session_id ?? "")
      if (!sessionId) continue
      sessionSaleTotals.set(
        sessionId,
        (sessionSaleTotals.get(sessionId) ?? 0) + parseAmount(sale.total),
      )
    }

    const { data: numberingRows, error: numberingErr } = await supabase
      .from("cash_register_sessions")
      .select("id, cash_register_id, opened_at, opened_by, closed_by")
      .eq("pop_id", popId)
      .in("cash_register_id", involvedRegisterIds)
      .order("opened_at", { ascending: true })
    if (numberingErr) {
      return {
        success: false,
        error: numberingErr.message || "Could not load session numbers.",
      }
    }

    const userIds: string[] = []
    for (const row of sessRows) {
      if (row.opened_by) userIds.push(String(row.opened_by))
      if (row.closed_by) userIds.push(String(row.closed_by))
    }
    const userNames = await loadUserDisplayNames(supabase, userIds)

    const periodSessByRegister = new Map<string, typeof sessRows>()
    for (const row of sessRows) {
      const registerId = String(row.cash_register_id)
      const bucket = periodSessByRegister.get(registerId) ?? []
      bucket.push(row)
      periodSessByRegister.set(registerId, bucket)
    }

    const numberingByRegister = new Map<string, NonNullable<typeof numberingRows>>()
    for (const row of numberingRows || []) {
      const registerId = String(row.cash_register_id)
      const bucket = numberingByRegister.get(registerId) ?? []
      bucket.push(row)
      numberingByRegister.set(registerId, bucket)
    }

    const rows: CashRegistersPeriodReportRow[] = []
    for (const [registerId, registerSessRows] of periodSessByRegister) {
      const sessions: CashRegisterSummarySession[] = registerSessRows.map((row) => {
        const sessionId = String(row.id)
        const dw = depWit.get(sessionId) ?? { dep: 0, wit: 0 }
        return {
          id: sessionId,
          status: "closed" as const,
          openedAt: String(row.opened_at ?? ""),
          closedAt: row.closed_at != null ? String(row.closed_at) : null,
          openingCash: parseAmount(row.opening_cash),
          openingNote: row.note != null ? String(row.note) : null,
          closingSnapshot: parseClosingSnapshot(row.closing_snapshot),
          movementDeposits: Math.round(dw.dep * 100) / 100,
          movementWithdrawals: Math.round(dw.wit * 100) / 100,
          totalCobrado:
            Math.round((sessionSaleTotals.get(sessionId) ?? 0) * 100) / 100,
          ventasPorMedio: [],
          ventasPorCuenta: [],
          ventasParaCierre: [],
          arqueoNumber: 0,
          openedByUserId: null,
          openedByName: null,
          closedByUserId: null,
          closedByName: null,
          efectivoTeorico: 0,
          cashArqueoDifference: null,
        }
      })

      enrichCashRegisterSessions(
        numberingByRegister.get(registerId) ?? [],
        sessions,
        userNames,
      )

      for (const session of sessions) {
        rows.push({
          ...session,
          registerId,
          registerName: registerNameById.get(registerId) ?? "",
        })
      }
    }

    rows.sort(
      (a, b) =>
        new Date(b.closedAt ?? b.openedAt).getTime() -
        new Date(a.closedAt ?? a.openedAt).getTime(),
    )

    return {
      success: true,
      data: {
        rows,
        registerCount: registerRows.length,
        popInfo,
      },
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return { success: false, error: message }
  }
}

function buildClosedCashRegisterSessionPeriodOrFilter(
  from: string | null,
  to: string | null,
  timeZone: string,
): string | null {
  if (!from && !to) return null

  const start = from ? localDateStartTimestamp(timeZone, from) : null
  const endExclusive = to ? localDateExclusiveEndTimestamp(timeZone, to) : null
  const openedParts: string[] = []
  const closedParts: string[] = []

  if (start) {
    openedParts.push(`opened_at.gte.${start}`)
    closedParts.push(`closed_at.gte.${start}`)
  }
  if (endExclusive) {
    openedParts.push(`opened_at.lt.${endExclusive}`)
    closedParts.push(`closed_at.lt.${endExclusive}`)
  }

  const clauses: string[] = []
  if (openedParts.length > 0) {
    clauses.push(`and(${openedParts.join(",")})`)
  }
  if (closedParts.length > 0) {
    clauses.push(`and(${closedParts.join(",")})`)
  }
  if (clauses.length === 0) return null

  return clauses.join(",")
}
