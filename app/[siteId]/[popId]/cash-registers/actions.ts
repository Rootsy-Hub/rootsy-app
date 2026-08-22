import type { CashRegisterOperationSaleLine } from "@/lib/cashRegisterOperationDetail"
import type { CashRegisterClosingComparisonLine } from "@/lib/cashRegisterCloseSettlement"
import type { OperationPaymentKind } from "@/lib/operationPaymentKinds"

export type CashRegisterOpenSessionTotals = {
  openingCash: number
  ventasEfectivo: number
  ingresosCajon: number
  egresosCajon: number
  efectivoTeoricoEnCajon: number
  totalCobradoTurno: number | null
  cobrosPorMedio: { name: string; kind: string; total: number }[] | null
  cobrosPorCuenta: CashRegisterTreasuryLineCobro[] | null
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
  canCloseOpenSession: boolean
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
  payment_methods?: Record<string, number>
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
  totalCobrado: number
  ventasPorMedio: { paymentKind: string; name: string; total: number }[]
  ventasPorCuenta: CashRegisterTreasuryLineCobro[]
  ventasParaCierre: CashRegisterCloseCobroLine[]
  arqueoNumber: number
  openedByUserId: string | null
  openedByName: string | null
  closedByUserId: string | null
  closedByName: string | null
  efectivoTeorico: number
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
  totalVentas: number
}

export type CashRegisterArqueoSesionAbierta = {
  sessionId: string
  openingCash: number
  ventasEfectivo: number
  ingresosCajon: number
  egresosCajon: number
  efectivoTeoricoEnCajon: number
}

export type CashRegisterSummaryData = {
  registerName: string
  operationalDayCloseTime: string
  sessions: CashRegisterSummarySession[]
  movements: CashRegisterSummaryMovement[]
  salesIncluded: boolean
  sales: CashRegisterSummarySale[]
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
