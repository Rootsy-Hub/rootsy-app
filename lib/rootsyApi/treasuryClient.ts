import type {
  TreasuryAccountTableRow,
  TreasuryChildAccountKind,
  TreasuryChildAccountRow,
  TreasuryFundingOption,
  UpsertTreasuryAccountInput,
} from "@/app/[siteId]/[popId]/accounts/actions"
import type {
  PaymentMethodMovementRow,
  TreasuryAccountDetailResult,
  TreasuryPeriodReportData,
} from "@/app/[siteId]/[popId]/accounts/treasuryDetailActions"
import type { PopMercadoPagoConnectionPublic } from "@/lib/popMercadoPago"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }

export type TreasuryPeriodTotals = {
  accountCount: number
  closingBalance: number
  periodIn: number
  periodOut: number
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

export async function fetchTreasuryPeriodTotals(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<
  { success: true; data: TreasuryPeriodTotals } | { success: false; error: string }
> {
  return getJson<TreasuryPeriodTotals>(
    `/api/pops/${popId}/treasury/period/totals?${periodSearch(from, to)}`,
  )
}

export async function fetchTreasuryPeriodReport(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<
  | { success: true; data: TreasuryPeriodReportData }
  | { success: false; error: string }
> {
  return getJson<TreasuryPeriodReportData>(
    `/api/pops/${popId}/treasury/period?${periodSearch(from, to)}`,
  )
}

export type TreasuryAccountListRow = Omit<
  TreasuryAccountTableRow,
  | "toLiquidateBalance"
  | "toPayBalance"
  | "outstandingBalance"
  | "settledTotal"
  | "ledgerBalance"
>

export type TreasuryAccountBalance = {
  ledgerBalance: number | null
  toLiquidateBalance: number
  toPayBalance: number
  outstandingBalance: number
  settledTotal: number
}

export type TreasuryAccountTotals = {
  ledgerBalance: number | null
  toLiquidateBalance: number
  toPayBalance: number
  openingBalance: number | null
  currentBalance: number | null
  periodIn: number
  periodOut: number
  children: Array<{
    id: string
    ledgerBalance: number | null
    outstandingBalance: number
    settledTotal: number
  }>
}

export type TreasuryAccountPageData = {
  account: TreasuryAccountListRow
  children: TreasuryChildAccountRow[]
  isMother: boolean
  parentAccount: { id: string; name: string } | null
  fundingAccounts: TreasuryFundingOption[]
  mercadopagoConnection: PopMercadoPagoConnectionPublic | null
}

type MutateResult = { success: true } | { success: false; error: string }

const EMPTY_MONEY: TreasuryAccountBalance = {
  ledgerBalance: null,
  toLiquidateBalance: 0,
  toPayBalance: 0,
  outstandingBalance: 0,
  settledTotal: 0,
}

export function mergeTreasuryAccountRow(
  row: TreasuryAccountListRow,
  balance?: TreasuryAccountBalance | null,
): TreasuryAccountTableRow {
  return { ...row, ...(balance ?? EMPTY_MONEY) }
}

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

export async function fetchTreasuryAccounts(
  popId: string,
): Promise<
  | {
      success: true
      rows: TreasuryAccountListRow[]
      fundingAccounts: TreasuryFundingOption[]
    }
  | { success: false; error: string }
> {
  const res = await getJson<{
    rows: TreasuryAccountListRow[]
    fundingAccounts: TreasuryFundingOption[]
  }>(`/api/pops/${popId}/treasury`)
  if (!res.success) return res
  return {
    success: true,
    rows: res.data.rows,
    fundingAccounts: res.data.fundingAccounts,
  }
}

export async function fetchTreasuryAccountBalances(
  popId: string,
): Promise<
  | { success: true; balances: Record<string, TreasuryAccountBalance> }
  | { success: false; error: string }
> {
  const res = await getJson<{
    balances: Record<string, TreasuryAccountBalance>
  }>(`/api/pops/${popId}/treasury/balances`)
  if (!res.success) return res
  return { success: true, balances: res.data.balances }
}

export async function fetchTreasuryAccountPage(
  popId: string,
  accountId: string,
): Promise<
  { success: true; data: TreasuryAccountPageData } | { success: false; error: string }
> {
  return getJson<TreasuryAccountPageData>(
    `/api/pops/${popId}/treasury/${accountId}`,
  )
}

export async function fetchTreasuryAccountTotals(
  popId: string,
  accountId: string,
  from: string | null,
  to: string | null,
): Promise<
  { success: true; data: TreasuryAccountTotals } | { success: false; error: string }
> {
  return getJson<TreasuryAccountTotals>(
    `/api/pops/${popId}/treasury/${accountId}/totals?${periodSearch(from, to)}`,
  )
}

export async function fetchTreasuryAccountMovements(
  popId: string,
  accountId: string,
  from: string | null,
  to: string | null,
  relatedIds: string[],
): Promise<
  | { success: true; data: TreasuryAccountDetailResult }
  | { success: false; error: string }
> {
  const params = new URLSearchParams(periodSearch(from, to))
  if (relatedIds.length > 0) params.set("related", relatedIds.join(","))
  const qs = params.toString()
  const res = await getJson<TreasuryAccountDetailResult>(
    `/api/pops/${popId}/treasury/${accountId}/movements${qs ? `?${qs}` : ""}`,
  )
  if (!res.success) return res
  return {
    success: true,
    data: {
      ...res.data,
      movements: res.data.movements as PaymentMethodMovementRow[],
      periodSummary: null,
    },
  }
}

export async function createTreasuryAccount(
  popId: string,
  input: UpsertTreasuryAccountInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/treasury`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      name: input.name,
      kind: input.kind,
      sortOrder: input.sortOrder,
      brandKey: input.brandKey ?? null,
    }),
  })
  return parseMutate(res)
}

export async function updateTreasuryAccount(
  popId: string,
  accountId: string,
  name: string,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/treasury/${accountId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ name }),
  })
  return parseMutate(res)
}

export async function setTreasuryAccountActive(
  popId: string,
  accountId: string,
  isActive: boolean,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/treasury/${accountId}/active`, {
    method: "PATCH",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ isActive }),
  })
  return parseMutate(res)
}

export async function deleteTreasuryAccount(
  popId: string,
  accountId: string,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/treasury/${accountId}`, {
    method: "DELETE",
    headers: { accept: "application/json" },
  })
  return parseMutate(res)
}

export async function createTreasuryChildAccount(
  popId: string,
  parentId: string,
  kind: TreasuryChildAccountKind,
  name: string,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/treasury/${parentId}/children`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ kind, name }),
  })
  return parseMutate(res)
}
