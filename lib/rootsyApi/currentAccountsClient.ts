import type {
  ApplyPopCurrentAccountCreditInput,
  CurrentAccountEnrollmentCandidate,
  CurrentAccountLedgerLine,
  CurrentAccountOpenDocument,
  CurrentAccountPartyRow,
  GetPopCurrentAccountPartiesInput,
  SetPopCurrentAccountEnrollmentInput,
  SettleCurrentAccountInput,
} from "@/app/[siteId]/[popId]/current-accounts/actions"
import type {
  CurrentAccountAgingTotals,
  CurrentAccountDirection,
} from "@/lib/currentAccounts"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }

type MutateResult = { success: true } | { success: false; error: string }

export type PopCurrentAccountPartiesResult =
  | {
      success: true
      parties: CurrentAccountPartyRow[]
      totalCount: number
      page: number
      direction: CurrentAccountDirection
    }
  | {
      success: false
      error: string
      parties: CurrentAccountPartyRow[]
      totalCount: number
      page: number
      direction: CurrentAccountDirection
    }

export type PopCurrentAccountLedgerResult =
  | {
      success: true
      partyName: string
      balance: number
      openCount: number
      overdueAmount: number
      aging: CurrentAccountAgingTotals
      lines: CurrentAccountLedgerLine[]
      openDocuments: CurrentAccountOpenDocument[]
      unappliedCredit: number
      enrolled: boolean
      creditLimit: number | null
      termDays: number
      availableCredit: number | null
    }
  | {
      success: false
      error: string
      partyName?: string
      balance: number
      openCount: number
      overdueAmount: number
      aging: CurrentAccountAgingTotals
      lines: CurrentAccountLedgerLine[]
      openDocuments: CurrentAccountOpenDocument[]
      unappliedCredit: number
      enrolled: boolean
      creditLimit: number | null
      termDays: number
      availableCredit: number | null
    }

type ListData = {
  parties: CurrentAccountPartyRow[]
  totalCount: number
  page: number
  pageSize: number
  direction: CurrentAccountDirection
}

type LedgerData = {
  partyName: string
  balance: number
  openCount: number
  overdueAmount: number
  aging: CurrentAccountAgingTotals
  lines: CurrentAccountLedgerLine[]
  openDocuments: CurrentAccountOpenDocument[]
  unappliedCredit: number
  enrolled: boolean
  creditLimit: number | null
  termDays: number
  availableCredit: number | null
}

const EMPTY_TABLE: Omit<
  Extract<PopCurrentAccountPartiesResult, { success: false }>,
  "success" | "error"
> = {
  parties: [],
  totalCount: 0,
  page: 1,
  direction: "receivable",
}

const EMPTY_LEDGER: Omit<
  Extract<PopCurrentAccountLedgerResult, { success: false }>,
  "success" | "error"
> = {
  balance: 0,
  openCount: 0,
  overdueAmount: 0,
  aging: { current: 0, d1_30: 0, d31_60: 0, d61_plus: 0 },
  lines: [],
  openDocuments: [],
  unappliedCredit: 0,
  enrolled: false,
  creditLimit: null,
  termDays: 30,
  availableCredit: null,
}

export function buildCurrentAccountsListSearch(
  input: GetPopCurrentAccountPartiesInput,
): string {
  const params = new URLSearchParams()
  if (input.page) params.set("page", String(input.page))
  if (input.pageSize) params.set("pageSize", String(input.pageSize))
  const q = input.q?.trim() ?? ""
  if (q) params.set("q", q)
  if (input.direction) params.set("direction", input.direction)
  if (input.aging) params.set("aging", input.aging)
  if (input.sort) params.set("sort", input.sort)
  if (input.ord && input.ord !== "asc") params.set("ord", input.ord)
  return params.toString()
}

function emptyPartiesError(
  error: string,
  direction: CurrentAccountDirection = "receivable",
): PopCurrentAccountPartiesResult {
  return { success: false, error, ...EMPTY_TABLE, direction }
}

function emptyLedgerError(error: string): PopCurrentAccountLedgerResult {
  return { success: false, error, ...EMPTY_LEDGER }
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

export async function fetchPopCurrentAccountParties(
  popId: string,
  input: GetPopCurrentAccountPartiesInput,
): Promise<PopCurrentAccountPartiesResult> {
  const search = buildCurrentAccountsListSearch(input)
  const res = await fetch(`/api/pops/${popId}/current-accounts?${search}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<ListData>
    | ApiErr
    | null

  if (res.ok && json && "success" in json && json.success) {
    return { success: true, ...json.data }
  }

  return emptyPartiesError(
    json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
    input.direction || "receivable",
  )
}

export async function fetchPopCurrentAccountLedger(
  popId: string,
  input: { direction: CurrentAccountDirection; partyId: string },
): Promise<PopCurrentAccountLedgerResult> {
  const params = new URLSearchParams()
  params.set("direction", input.direction)
  const res = await fetch(
    `/api/pops/${popId}/current-accounts/parties/${input.partyId}?${params}`,
    { headers: { accept: "application/json" } },
  )
  const json = (await res.json().catch(() => null)) as
    | ApiOk<LedgerData>
    | ApiErr
    | null

  if (res.ok && json && "success" in json && json.success) {
    return { success: true, ...json.data }
  }

  return emptyLedgerError(
    json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  )
}

export async function searchPopCurrentAccountEnrollmentCandidates(
  popId: string,
  input: { direction: CurrentAccountDirection; q?: string },
): Promise<
  | { success: true; parties: CurrentAccountEnrollmentCandidate[] }
  | { success: false; error: string; parties: CurrentAccountEnrollmentCandidate[] }
> {
  const params = new URLSearchParams()
  params.set("direction", input.direction)
  const q = input.q?.trim() ?? ""
  if (q) params.set("q", q)
  const res = await fetch(
    `/api/pops/${popId}/current-accounts/candidates?${params}`,
    { headers: { accept: "application/json" } },
  )
  const json = (await res.json().catch(() => null)) as
    | ApiOk<{ parties: CurrentAccountEnrollmentCandidate[] }>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, parties: json.data.parties }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
    parties: [],
  }
}

export async function setPopCurrentAccountEnrollment(
  popId: string,
  input: SetPopCurrentAccountEnrollmentInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/current-accounts/enrollment`, {
    method: "PATCH",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseMutate(res)
}

export async function settlePopCurrentAccount(
  popId: string,
  input: SettleCurrentAccountInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/current-accounts/settle`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseMutate(res)
}

export async function applyPopCurrentAccountCredit(
  popId: string,
  input: ApplyPopCurrentAccountCreditInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/current-accounts/apply`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseMutate(res)
}

export async function fetchCurrentAccountPaymentContext(
  popId: string,
): Promise<
  | { success: true; context: TreasuryPaymentContext }
  | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/current-accounts/payment-context`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<TreasuryPaymentContext>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, context: json.data }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}
