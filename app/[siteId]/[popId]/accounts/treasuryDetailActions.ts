import type { OperationPaymentKind } from "@/lib/operationPaymentKinds"
import type { TreasuryAccountKind } from "@/lib/treasuryAccountKinds"

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
    | "employee_payment"
    | "card_settlement"
    | "funding_out"
    | "cash_register_close"
    | "pos_liquidation"
    | "pos_liquidation_fee"
  date: string
  occurredAt?: string
  amount: number
  label: string
  adjustmentAmount?: number
  direction: "in" | "out"
  balanceImpact: TreasuryMovementBalanceImpact
  reconciled: boolean
  linkedStatementLineId: string | null
  sourceAccountName?: string | null
  treasuryAccountLabel?: string | null
  paymentKind?: OperationPaymentKind | null
  saleChannel?: "pos" | "table" | "counter" | null
}

export type TreasuryPeriodSummary = {
  openingBalance: number | null
  currentBalance: number
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
  principalAmount: number
  adjustmentAmount?: number
  settledAt: string
  notes?: string
}

export type TreasuryReconciliationEventRow = {
  id: string
  kind: "pos_acreditation" | "card_settlement" | "cash_register_close_adjustment"
  eventDate: string
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

export type RecordPosAcreditationInput = {
  posTreasuryAccountId: string
  motherTreasuryAccountId: string
  principalAmount: number
  adjustmentAmount?: number
  creditedAt: string
  notes?: string
}

export type TreasuryPeriodReportRow = {
  id: string
  name: string
  kind: TreasuryAccountKind
  brandKey: string | null
  isActive: boolean
  chartAccountCode: string
  openingBalance: number | null
  closingBalance: number
  periodIn: number
  periodOut: number
  toLiquidateBalance: number | null
  toPayBalance: number | null
  hasPosIntegration: boolean
  hasCardIntegration: boolean
}

export type TreasuryPeriodReportPopInfo = {
  popName: string
  popStreetAddress: string | null
  popFiscalCuit: string | null
  popFiscalRazonSocial: string | null
}

export type TreasuryPeriodReportData = {
  rows: TreasuryPeriodReportRow[]
  popInfo: TreasuryPeriodReportPopInfo
}
