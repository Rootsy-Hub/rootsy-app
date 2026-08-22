import type {
  ArcaSalePointOption,
  CashRegisterOpenSessionTotals,
  CashRegisterRow,
  CashRegisterSessionArqueoDetail,
  CashRegisterSummaryData,
  CashRegisterSummaryMovement,
  CashRegisterSummarySession,
  CashRegistersPeriodReportData,
  CashTreasuryAccountOption,
  ClosingSnapshot,
  PaymentMethodOption,
} from "@/app/[siteId]/[popId]/cash-registers/actions"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }

export type CashRegistersPeriodTotals = {
  registerCount: number
  closedCount: number
  totalCobrado: number
  netDifference: number
  sessionsWithVariance: number
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

export async function fetchCashRegistersPeriodTotals(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<
  | { success: true; data: CashRegistersPeriodTotals }
  | { success: false; error: string }
> {
  return getJson<CashRegistersPeriodTotals>(
    `/api/pops/${popId}/cash-registers/period/totals?${periodSearch(from, to)}`,
  )
}

export async function fetchCashRegistersPeriodReport(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<
  | { success: true; data: CashRegistersPeriodReportData }
  | { success: false; error: string }
> {
  return getJson<CashRegistersPeriodReportData>(
    `/api/pops/${popId}/cash-registers/period?${periodSearch(from, to)}`,
  )
}

export type CashRegisterListRow = Omit<
  CashRegisterRow,
  "cashBalance" | "openSessionTotals"
> & {
  cashBalance: null
  openSessionTotals: null
}

export type CashRegisterOpenTotals = {
  cashBalance: number
  openSessionTotals: CashRegisterOpenSessionTotals
}

export type CashRegistersFormContext = {
  cashTreasuryAccounts: CashTreasuryAccountOption[]
  salePoints: ArcaSalePointOption[]
  paymentMethods: PaymentMethodOption[]
}

export type CashRegisterPageData = {
  registerId: string
  registerName: string
  isActive: boolean
  operationalDayCloseTime: string
  sessions: CashRegisterSummarySession[]
  movements: CashRegisterSummaryMovement[]
}

export type CashRegisterSessionMoney = Pick<
  CashRegisterSummarySession,
  | "totalCobrado"
  | "ventasPorMedio"
  | "ventasPorCuenta"
  | "ventasParaCierre"
  | "efectivoTeorico"
  | "cashArqueoDifference"
>

export type CashRegisterTotalsData = {
  sessionsById: Record<string, CashRegisterSessionMoney>
  arqueo: CashRegisterSummaryData["arqueo"]
  totals: CashRegisterSummaryData["totals"]
  closingBlocks: CashRegisterSummaryData["closingBlocks"]
  aggregatedClosingLines: CashRegisterSummaryData["aggregatedClosingLines"]
}

type MutateResult = { success: true } | { success: false; error: string }

async function parseMutate(res: Response): Promise<MutateResult> {
  const json = (await res.json().catch(() => null)) as
    | { success?: boolean; error?: string }
    | null
  if (res.ok && json && json.success) return { success: true }
  return {
    success: false,
    error:
      json && typeof json.error === "string" && json.error
        ? json.error
        : `HTTP ${res.status}`,
  }
}

export function mergeCashRegisterRow(
  row: CashRegisterListRow,
  open?: CashRegisterOpenTotals | null,
): CashRegisterRow {
  if (!row.openSessionId) {
    return { ...row, cashBalance: null, openSessionTotals: null }
  }
  if (!open) {
    return {
      ...row,
      cashBalance: null,
      openSessionTotals: null,
      canCloseOpenSession: false,
    }
  }
  return {
    ...row,
    cashBalance: open.cashBalance,
    openSessionTotals: open.openSessionTotals,
  }
}

export function mergeCashRegisterSummary(
  page: CashRegisterPageData,
  totals?: CashRegisterTotalsData | null,
): CashRegisterSummaryData {
  const sessions = page.sessions.map((session) => {
    const money = totals?.sessionsById[session.id]
    if (!money) return session
    return { ...session, ...money }
  })
  return {
    registerName: page.registerName,
    operationalDayCloseTime: page.operationalDayCloseTime,
    sessions,
    movements: page.movements,
    salesIncluded: true,
    sales: [],
    arqueo: totals?.arqueo ?? null,
    totals: totals?.totals ?? {
      depositTotal: 0,
      withdrawalTotal: 0,
      netCashMovements: 0,
    },
    closingBlocks: totals?.closingBlocks ?? [],
    aggregatedClosingLines: totals?.aggregatedClosingLines ?? [],
  }
}

export async function fetchCashRegisters(
  popId: string,
): Promise<
  { success: true; registers: CashRegisterListRow[] } | { success: false; error: string }
> {
  const res = await getJson<{ registers: CashRegisterListRow[] }>(
    `/api/pops/${popId}/cash-registers`,
  )
  if (!res.success) return res
  return { success: true, registers: res.data.registers }
}

export async function fetchCashRegistersOpenTotals(
  popId: string,
): Promise<
  | { success: true; byRegisterId: Record<string, CashRegisterOpenTotals> }
  | { success: false; error: string }
> {
  const res = await getJson<{
    byRegisterId: Record<string, CashRegisterOpenTotals>
  }>(`/api/pops/${popId}/cash-registers/open-totals`)
  if (!res.success) return res
  return { success: true, byRegisterId: res.data.byRegisterId }
}

export async function fetchCashRegistersFormContext(
  popId: string,
): Promise<
  { success: true; data: CashRegistersFormContext } | { success: false; error: string }
> {
  return getJson<CashRegistersFormContext>(
    `/api/pops/${popId}/cash-registers/form-context`,
  )
}

export async function fetchCashRegisterPage(
  popId: string,
  registerId: string,
): Promise<
  { success: true; data: CashRegisterPageData } | { success: false; error: string }
> {
  return getJson<CashRegisterPageData>(
    `/api/pops/${popId}/cash-registers/${registerId}`,
  )
}

export async function fetchCashRegisterTotals(
  popId: string,
  registerId: string,
): Promise<
  { success: true; data: CashRegisterTotalsData } | { success: false; error: string }
> {
  return getJson<CashRegisterTotalsData>(
    `/api/pops/${popId}/cash-registers/${registerId}/totals`,
  )
}

export async function fetchCashRegisterSessionArqueo(
  popId: string,
  sessionId: string,
): Promise<
  | { success: true; data: CashRegisterSessionArqueoDetail }
  | { success: false; error: string }
> {
  return getJson<CashRegisterSessionArqueoDetail>(
    `/api/pops/${popId}/cash-registers/sessions/${sessionId}/arqueo`,
  )
}

export async function createCashRegister(
  popId: string,
  input: {
    name: string
    sortOrder?: number
    cashTreasuryAccountId: string
    arcaSalePointId?: string | null
  },
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/cash-registers`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      name: input.name,
      sortOrder: input.sortOrder ?? 0,
      cashTreasuryAccountId: input.cashTreasuryAccountId,
      arcaSalePointId: input.arcaSalePointId ?? null,
    }),
  })
  return parseMutate(res)
}

export async function updateCashRegister(
  popId: string,
  registerId: string,
  input: {
    name: string
    sortOrder?: number
    isActive: boolean
    cashTreasuryAccountId: string
    arcaSalePointId?: string | null
  },
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/cash-registers/${registerId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      name: input.name,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive,
      cashTreasuryAccountId: input.cashTreasuryAccountId,
      arcaSalePointId: input.arcaSalePointId ?? null,
    }),
  })
  return parseMutate(res)
}

export async function deleteCashRegister(
  popId: string,
  registerId: string,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/cash-registers/${registerId}`, {
    method: "DELETE",
    headers: { accept: "application/json" },
  })
  return parseMutate(res)
}

export async function openCashSession(
  popId: string,
  registerId: string,
  openingCash: number,
  openingNote?: string | null,
): Promise<MutateResult> {
  const res = await fetch(
    `/api/pops/${popId}/cash-registers/${registerId}/sessions`,
    {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ openingCash, note: openingNote ?? null }),
    },
  )
  return parseMutate(res)
}

export async function closeCashSession(
  popId: string,
  sessionId: string,
  snapshot: ClosingSnapshot,
): Promise<MutateResult> {
  const res = await fetch(
    `/api/pops/${popId}/cash-registers/sessions/${sessionId}/close`,
    {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(snapshot),
    },
  )
  return parseMutate(res)
}

export async function addCashMovement(
  popId: string,
  sessionId: string,
  input: { kind: "deposit" | "withdrawal"; amount: number; note: string },
): Promise<MutateResult> {
  const res = await fetch(
    `/api/pops/${popId}/cash-registers/sessions/${sessionId}/movements`,
    {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        kind: input.kind,
        amount: input.amount,
        note: input.note,
      }),
    },
  )
  return parseMutate(res)
}
