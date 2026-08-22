"use server"

import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { getPopById, validatePopAccess } from "@/lib/popHelpers"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import { createClient } from "@/utils/supabase/server"
import {
  operationPaymentKindLabel,
  type OperationPaymentKind,
} from "@/lib/operationPaymentKinds"
import {
  formatCashRegisterSaleDetail,
  parseCashRegisterSaleTicket,
  type CashRegisterOperationSaleLine,
} from "@/lib/cashRegisterOperationDetail"
import {
  formatCashRegisterSaleOperationLabel,
  loadCashRegisterSaleContextLabels,
  parseCashRegisterSaleChannel,
} from "@/lib/cashRegisterSaleContextLabels"
import {
  loadSessionCobrosByTreasuryLine,
  loadSessionCobrosForClose,
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

export type ArcaSalePointOption = {
  id: string
  ptoVta: number
  configured: boolean
}

export type CashRegisterRow = {
  id: string
  name: string
  sortOrder: number
  isActive: boolean
  cashTreasuryAccountId: string | null
  arcaSalePointId: string | null
  arcaPtoVta: number | null
  openSessionId: string | null
  /** Si hay turno abierto: puede cerrarlo el usuario actual. */
  canCloseOpenSession: boolean
  /** Efectivo teórico en cajón si hay turno abierto (apertura + ventas efectivo + cajón). */
  cashBalance: number | null
  openedAt: string | null
  openSessionMeta: CashRegisterOpenSessionMeta | null
  openSessionTotals: CashRegisterOpenSessionTotals | null
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
  lines: CashRegisterOperationSaleLine[]
  showLines: boolean
  generalDiscountAmount: number
}

export type CashRegisterSessionArqueoDetail = {
  registerName: string
  popName: string
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
    const popRes = await getPopById(popId)
    const popName =
      popRes.success && popRes.pop ? String(popRes.pop.name ?? "").trim() : ""

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
        const ticket = parseCashRegisterSaleTicket(
          row.line_items,
          parseAmount(row.discount_total),
        )
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
            lines: ticket.lines,
            showLines: true,
            generalDiscountAmount: ticket.generalDiscountAmount,
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
              lines: ticket.lines,
              showLines: index === 0,
              generalDiscountAmount: ticket.generalDiscountAmount,
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
        lines: [],
        showLines: false,
        generalDiscountAmount: 0,
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
        popName,
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
