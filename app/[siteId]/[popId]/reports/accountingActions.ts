export type AccountType =
  | "activo_corriente"
  | "activo_no_corriente"
  | "pasivo_corriente"
  | "pasivo_no_corriente"
  | "patrimonio_neto"
  | "ingresos"
  | "costos"
  | "gastos"

export type AccountNature = "deudora" | "acreedora"

export type ChartAccountRow = {
  id: string
  parentId: string | null
  code: string
  name: string
  accountType: AccountType
  nature: AccountNature
  level: number
  isMovementAccount: boolean
}

export type ChartAccountSearchRow = {
  id: string
  code: string
  name: string
}

export type JournalEntrySummaryRow = {
  id: string
  entryNumber: number
  entryDate: string
  description: string
  sourceType: string
  totalDebit: number
  totalCredit: number
}

export type JournalEntryLineRow = {
  id: string
  accountCode: string
  accountName: string
  debitAmount: number
  creditAmount: number
  lineDescription: string | null
}

export type LedgerMovementRow = {
  id: string
  entryDate: string
  entryNumber: number
  entryDescription: string
  debitAmount: number
  creditAmount: number
  runningBalance: number
}

export type TrialBalanceRow = {
  accountCode: string
  accountName: string
  accountType: AccountType
  sumDebit: number
  sumCredit: number
  balance: number
}

export type FinancialSummaryRow = {
  label: string
  total: number
  accountTypes: AccountType[]
}

export type BalanceSheetSectionRow = {
  accountCode: string
  accountName: string
  balance: number
}

export type BalanceSheetSection = {
  key: "activo" | "pasivo" | "patrimonio"
  title: string
  rows: BalanceSheetSectionRow[]
  sectionTotal: number
}

export type BalanceSheetResult = {
  asOf: string
  sections: BalanceSheetSection[]
  resultadoAcumulado: number
  totalActivo: number
  totalPasivo: number
  totalPatrimonioCuentas: number
  totalPasivoPatrimonioYResultado: number
  diferenciaCuadre: number
}

export type IncomeStatementLine = {
  accountCode: string
  accountName: string
  accountType: AccountType
  balance: number
}

export type IncomeStatementResult = {
  from: string
  to: string
  ingresos: IncomeStatementLine[]
  costos: IncomeStatementLine[]
  gastos: IncomeStatementLine[]
  totalIngresos: number
  totalCostos: number
  totalGastos: number
  resultadoNeto: number
}

export type CashFlowRow = {
  accountCode: string
  accountName: string
  entityName: string | null
  entradas: number
  salidas: number
  neto: number
}

export type VatPositionRow = {
  accountCode: string
  accountName: string
  accountType: AccountType
  sumDebit: number
  sumCredit: number
  balance: number
}

export type ChartOfAccountsReportRow = ChartAccountRow & {
  balance: number
}

export type ChartOfAccountsReportData = {
  asOf: string
  rows: ChartOfAccountsReportRow[]
}
