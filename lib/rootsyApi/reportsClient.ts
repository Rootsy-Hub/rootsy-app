import type {
  BalanceSheetResult,
  CashFlowRow,
  ChartAccountSearchRow,
  ChartOfAccountsReportData,
  FinancialSummaryRow,
  IncomeStatementResult,
  JournalEntryLineRow,
  JournalEntrySummaryRow,
  LedgerMovementRow,
  TrialBalanceRow,
  VatPositionRow,
  AccountNature,
} from "@/app/[siteId]/[popId]/reports/accountingActions"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }

export type OperationalTotalKind =
  | "sales"
  | "purchases"
  | "expenses"
  | "issued-invoices"
  | "received-invoices"

export type OperationalTotalsData = {
  kind: OperationalTotalKind
  count: number
  total: number
  iva: number | null
}

function periodSearch(from: string | null, to: string | null): string {
  const params = new URLSearchParams()
  if (from) params.set("from", from)
  if (to) params.set("to", to)
  return params.toString()
}

async function getJson<T>(
  path: string,
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  const res = await fetch(path, { headers: { accept: "application/json" } })
  const json = (await res.json().catch(() => null)) as ApiOk<T> | ApiErr | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, data: json.data }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function fetchReportOperationalTotals(
  popId: string,
  kind: OperationalTotalKind,
  from: string | null,
  to: string | null,
): Promise<
  | { success: true; data: OperationalTotalsData }
  | { success: false; error: string }
> {
  const params = new URLSearchParams()
  params.set("kind", kind)
  if (from) params.set("from", from)
  if (to) params.set("to", to)
  return getJson<OperationalTotalsData>(
    `/api/pops/${popId}/reports/totals?${params.toString()}`,
  )
}

export async function fetchAccountingTrialBalance(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<
  { success: true; rows: TrialBalanceRow[] } | { success: false; error: string }
> {
  const res = await getJson<{ rows: TrialBalanceRow[] }>(
    `/api/pops/${popId}/reports/trial-balance?${periodSearch(from, to)}`,
  )
  if (!res.success) return res
  return { success: true, rows: res.data.rows }
}

export async function fetchAccountingIncomeStatement(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<
  | { success: true; data: IncomeStatementResult }
  | { success: false; error: string }
> {
  return getJson<IncomeStatementResult>(
    `/api/pops/${popId}/reports/income-statement?${periodSearch(from, to)}`,
  )
}

export async function fetchAccountingBalanceSheet(
  popId: string,
  asOf: string | null,
): Promise<
  { success: true; data: BalanceSheetResult } | { success: false; error: string }
> {
  const params = new URLSearchParams()
  if (asOf) params.set("asOf", asOf)
  return getJson<BalanceSheetResult>(
    `/api/pops/${popId}/reports/balance-sheet?${params.toString()}`,
  )
}

export async function fetchAccountingCashFlow(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<
  { success: true; rows: CashFlowRow[] } | { success: false; error: string }
> {
  const res = await getJson<{ rows: CashFlowRow[] }>(
    `/api/pops/${popId}/reports/cash-flow?${periodSearch(from, to)}`,
  )
  if (!res.success) return res
  return { success: true, rows: res.data.rows }
}

export async function fetchAccountingVatPosition(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<
  { success: true; rows: VatPositionRow[] } | { success: false; error: string }
> {
  const res = await getJson<{ rows: VatPositionRow[] }>(
    `/api/pops/${popId}/reports/vat-position?${periodSearch(from, to)}`,
  )
  if (!res.success) return res
  return { success: true, rows: res.data.rows }
}

export async function fetchAccountingFinancialSummaries(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<
  | { success: true; summaries: FinancialSummaryRow[] }
  | { success: false; error: string }
> {
  const res = await getJson<{ summaries: FinancialSummaryRow[] }>(
    `/api/pops/${popId}/reports/summaries?${periodSearch(from, to)}`,
  )
  if (!res.success) return res
  return { success: true, summaries: res.data.summaries }
}

export async function fetchAccountingJournalTotals(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<
  | {
      success: true
      totalCount: number
      periodTotalDebit: number
      periodTotalCredit: number
    }
  | { success: false; error: string }
> {
  const res = await getJson<{
    totalCount: number
    periodTotalDebit: number
    periodTotalCredit: number
  }>(`/api/pops/${popId}/reports/journal/totals?${periodSearch(from, to)}`)
  if (!res.success) return res
  return { success: true, ...res.data }
}

export async function fetchAccountingJournalEntries(
  popId: string,
  from: string | null,
  to: string | null,
  options?: { page?: number; pageSize?: number },
): Promise<
  | {
      success: true
      entries: JournalEntrySummaryRow[]
      hasMore: boolean
      totalCount: number
      page: number
    }
  | { success: false; error: string }
> {
  const params = new URLSearchParams(periodSearch(from, to))
  if (options?.page) params.set("page", String(options.page))
  if (options?.pageSize) params.set("pageSize", String(options.pageSize))
  const res = await getJson<{
    entries: JournalEntrySummaryRow[]
    hasMore: boolean
    totalCount: number
    page: number
    pageSize: number
  }>(`/api/pops/${popId}/reports/journal?${params.toString()}`)
  if (!res.success) return res
  return {
    success: true,
    entries: res.data.entries,
    hasMore: res.data.hasMore,
    totalCount: res.data.totalCount,
    page: res.data.page,
  }
}

export async function fetchAccountingEntryLines(
  popId: string,
  entryId: string,
): Promise<
  { success: true; lines: JournalEntryLineRow[] } | { success: false; error: string }
> {
  const res = await getJson<{ lines: JournalEntryLineRow[] }>(
    `/api/pops/${popId}/reports/journal/${entryId}/lines`,
  )
  if (!res.success) return res
  return { success: true, lines: res.data.lines }
}

export async function fetchAccountingLedgerTotals(
  popId: string,
  accountCode: string,
  from: string | null,
  to: string | null,
): Promise<
  | {
      success: true
      accountName: string
      nature: AccountNature
      totalCount: number
      totalDebit: number
      totalCredit: number
      closingBalance: number
    }
  | { success: false; error: string }
> {
  const params = new URLSearchParams(periodSearch(from, to))
  params.set("accountCode", accountCode)
  const res = await getJson<{
    accountName: string
    nature: AccountNature
    totalCount: number
    totalDebit: number
    totalCredit: number
    closingBalance: number
  }>(`/api/pops/${popId}/reports/ledger/totals?${params.toString()}`)
  if (!res.success) return res
  return { success: true, ...res.data }
}

export async function fetchAccountingLedgerForAccount(
  popId: string,
  accountCode: string,
  from: string | null,
  to: string | null,
  options?: { page?: number; pageSize?: number },
): Promise<
  | {
      success: true
      accountName: string
      nature: AccountNature
      rows: LedgerMovementRow[]
      hasMore: boolean
      totalCount: number
      page: number
    }
  | { success: false; error: string }
> {
  const params = new URLSearchParams(periodSearch(from, to))
  params.set("accountCode", accountCode)
  if (options?.page) params.set("page", String(options.page))
  if (options?.pageSize) params.set("pageSize", String(options.pageSize))
  const res = await getJson<{
    accountName: string
    nature: AccountNature
    rows: LedgerMovementRow[]
    hasMore: boolean
    totalCount: number
    page: number
  }>(`/api/pops/${popId}/reports/ledger?${params.toString()}`)
  if (!res.success) return res
  return { success: true, ...res.data }
}

export async function searchAccountingChartAccounts(
  popId: string,
  query: string,
): Promise<
  | { success: true; accounts: ChartAccountSearchRow[] }
  | { success: false; error: string }
> {
  const params = new URLSearchParams()
  if (query.trim()) params.set("q", query.trim())
  const res = await getJson<{ accounts: ChartAccountSearchRow[] }>(
    `/api/pops/${popId}/reports/chart-of-accounts/search?${params.toString()}`,
  )
  if (!res.success) return res
  return { success: true, accounts: res.data.accounts }
}

export async function fetchChartOfAccountsReport(
  popId: string,
  asOfDate: string | null,
): Promise<
  | { success: true; data: ChartOfAccountsReportData }
  | { success: false; error: string }
> {
  const params = new URLSearchParams()
  if (asOfDate) params.set("asOf", asOfDate)
  return getJson<ChartOfAccountsReportData>(
    `/api/pops/${popId}/reports/chart-of-accounts?${params.toString()}`,
  )
}
