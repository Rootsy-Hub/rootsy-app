import type {
  CashRegisterOpenSessionTotals,
  CashRegisterSummaryClosingBlock,
  CashRegisterSummaryData,
  CashRegisterSummarySale,
  CashRegisterSummarySession,
  CashRegistersPeriodReportRow,
} from "@/app/[siteId]/[popId]/cash-registers/actions"
import { isoDateInBounds } from "@/lib/dataWorkspaceDateFilter"

export function sessionTotalCobrado(
  sessionId: string,
  sales: CashRegisterSummarySale[],
): number {
  let total = 0
  for (const sale of sales) {
    if (sale.cashRegisterSessionId !== sessionId) continue
    if (sale.status !== "completed") continue
    total += sale.total
  }
  return Math.round(total * 100) / 100
}

export function sessionMatchesPeriod(
  session: CashRegisterSummarySession,
  from: string | null,
  to: string | null,
  timeZone?: string,
): boolean {
  if (!from && !to) return true
  if (isoDateInBounds(session.openedAt, from, to, timeZone)) return true
  if (
    session.closedAt &&
    isoDateInBounds(session.closedAt, from, to, timeZone)
  ) {
    return true
  }
  return false
}

export function filterClosedSessionsInPeriod(
  sessions: CashRegisterSummarySession[],
  from: string | null,
  to: string | null,
  timeZone?: string,
): CashRegisterSummarySession[] {
  return sessions.filter((session) => {
    if (session.status !== "closed") return false
    return sessionMatchesPeriod(session, from, to, timeZone)
  })
}

export function filterSessionsForArqueoTable(
  sessions: CashRegisterSummarySession[],
  from: string | null,
  to: string | null,
  timeZone?: string,
): CashRegisterSummarySession[] {
  const openSession = findOpenSession(sessions)
  const closedInPeriod = sessions
    .filter((session) => session.status === "closed")
    .filter((session) => sessionMatchesPeriod(session, from, to, timeZone))
    .sort(
      (a, b) =>
        new Date(b.closedAt ?? b.openedAt).getTime() -
        new Date(a.closedAt ?? a.openedAt).getTime(),
    )

  if (openSession) {
    return [openSession, ...closedInPeriod]
  }

  return closedInPeriod
}

export function findClosingBlock(
  sessionId: string,
  closingBlocks: CashRegisterSummaryClosingBlock[],
): CashRegisterSummaryClosingBlock | null {
  return closingBlocks.find((block) => block.sessionId === sessionId) ?? null
}

export function computePeriodHeaderTotals(
  sessions: CashRegisterSummarySession[],
  from: string | null,
  to: string | null,
  timeZone?: string,
): { totalCobrado: number; netIngresosRetiros: number } {
  const filtered = filterClosedSessionsInPeriod(sessions, from, to, timeZone)
  let totalCobrado = 0
  let netIngresosRetiros = 0
  for (const session of filtered) {
    totalCobrado += session.totalCobrado
    netIngresosRetiros +=
      session.movementDeposits - session.movementWithdrawals
  }
  return {
    totalCobrado: Math.round(totalCobrado * 100) / 100,
    netIngresosRetiros: Math.round(netIngresosRetiros * 100) / 100,
  }
}

export function openSessionHeaderTotals(
  totals: CashRegisterOpenSessionTotals | null | undefined,
): {
  totalCobrado: number | null
  efectivoEnCaja: number | null
  efectivoInicial: number | null
  netIngresosRetiros: number | null
} {
  if (!totals) {
    return {
      totalCobrado: null,
      efectivoEnCaja: null,
      efectivoInicial: null,
      netIngresosRetiros: null,
    }
  }
  return {
    totalCobrado: totals.totalCobradoTurno,
    efectivoEnCaja: totals.efectivoTeoricoEnCajon,
    efectivoInicial: totals.openingCash,
    netIngresosRetiros:
      Math.round((totals.ingresosCajon - totals.egresosCajon) * 100) / 100,
  }
}

export function findOpenSession(
  sessions: CashRegisterSummarySession[],
): CashRegisterSummarySession | null {
  return sessions.find((session) => session.status === "open") ?? null
}

export function buildSessionArqueoView(
  session: CashRegisterSummarySession,
  data: CashRegisterSummaryData,
) {
  return {
    session,
    closingBlock: findClosingBlock(session.id, data.closingBlocks),
    totalCobrado: session.totalCobrado,
    ventasPorMedio: session.ventasPorMedio,
  }
}

const MONEY_EPS = 0.005

export function filterRowsForPopArqueoReport(
  rows: CashRegistersPeriodReportRow[],
  from: string | null,
  to: string | null,
  timeZone?: string,
): CashRegistersPeriodReportRow[] {
  return rows
    .filter((row) => row.status === "closed")
    .filter((row) => sessionMatchesPeriod(row, from, to, timeZone))
    .sort(
      (a, b) =>
        new Date(b.closedAt ?? b.openedAt).getTime() -
        new Date(a.closedAt ?? a.openedAt).getTime(),
    )
}

export function computePopArqueoPeriodSummary(
  rows: CashRegistersPeriodReportRow[],
): {
  arqueoCount: number
  closedCount: number
  openCount: number
  totalCobrado: number
  netDifference: number
  sessionsWithVariance: number
} {
  const closedRows = rows.filter((row) => row.status === "closed")
  let totalCobrado = 0
  let netDifference = 0
  let sessionsWithVariance = 0

  for (const row of closedRows) {
    totalCobrado += row.totalCobrado
    if (row.cashArqueoDifference != null) {
      netDifference += row.cashArqueoDifference
      if (Math.abs(row.cashArqueoDifference) >= MONEY_EPS) {
        sessionsWithVariance += 1
      }
    }
  }

  return {
    arqueoCount: rows.length,
    closedCount: closedRows.length,
    openCount: rows.length - closedRows.length,
    totalCobrado: Math.round(totalCobrado * 100) / 100,
    netDifference: Math.round(netDifference * 100) / 100,
    sessionsWithVariance,
  }
}

export function sessionEfectivoTeorico(session: CashRegisterSummarySession): number {
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
