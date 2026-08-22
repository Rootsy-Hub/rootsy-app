import type {
  CheckDepositAccount,
  CheckPartySearchItem,
  CheckTableRow,
  ClearPopCheckInput,
  CreatePopCheckInput,
  DepositPopCheckInput,
  GetPopChecksTableInput,
  RejectPopCheckInput,
} from "@/app/[siteId]/[popId]/checks/actions"
import type { CheckDirection } from "@/lib/checkDocuments"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }

export type PopChecksTableResult =
  | {
      success: true
      checks: CheckTableRow[]
      totalCount: number
      page: number
    }
  | {
      success: false
      error: string
      checks: CheckTableRow[]
      totalCount: number
      page: number
    }

type CheckListData = {
  checks: CheckTableRow[]
  totalCount: number
  page: number
}

const EMPTY_TABLE: Omit<
  Extract<PopChecksTableResult, { success: false }>,
  "success" | "error"
> = {
  checks: [],
  totalCount: 0,
  page: 1,
}

export function buildChecksListSearch(input: GetPopChecksTableInput): string {
  const params = new URLSearchParams()
  if (input.page) params.set("page", String(input.page))
  if (input.pageSize) params.set("pageSize", String(input.pageSize))
  const q = input.q?.trim() ?? ""
  if (q) params.set("q", q)
  if (input.direction) params.set("direction", input.direction)
  if (input.status) params.set("status", input.status)
  if (input.sort) params.set("sort", input.sort)
  if (input.ord && input.ord !== "asc") params.set("ord", input.ord)
  return params.toString()
}

function emptyError(error: string): PopChecksTableResult {
  return { success: false, error, ...EMPTY_TABLE }
}

export async function fetchPopChecksTable(
  popId: string,
  input: GetPopChecksTableInput,
): Promise<PopChecksTableResult> {
  const search = buildChecksListSearch(input)
  const res = await fetch(`/api/pops/${popId}/checks?${search}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<CheckListData>
    | ApiErr
    | null

  if (res.ok && json && "success" in json && json.success) {
    return { success: true, ...json.data }
  }

  return emptyError(
    json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  )
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

export async function createPopCheck(
  popId: string,
  input: CreatePopCheckInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/checks`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseMutate(res)
}

export async function depositPopCheck(
  popId: string,
  checkId: string,
  input: DepositPopCheckInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/checks/${checkId}/deposit`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseMutate(res)
}

export async function clearPopCheck(
  popId: string,
  checkId: string,
  input: ClearPopCheckInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/checks/${checkId}/clear`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseMutate(res)
}

export async function rejectPopCheck(
  popId: string,
  checkId: string,
  input: RejectPopCheckInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/checks/${checkId}/reject`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseMutate(res)
}

export async function voidPopCheck(
  popId: string,
  checkId: string,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/checks/${checkId}/void`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: "{}",
  })
  return parseMutate(res)
}

export async function fetchCheckDepositAccounts(
  popId: string,
): Promise<
  | { success: true; accounts: CheckDepositAccount[] }
  | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/checks/deposit-accounts`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<{ accounts: CheckDepositAccount[] }>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, accounts: json.data.accounts }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function searchCheckParties(
  popId: string,
  direction: CheckDirection,
  query: string,
): Promise<
  | { success: true; parties: CheckPartySearchItem[] }
  | { success: false; error: string }
> {
  const params = new URLSearchParams()
  params.set("direction", direction)
  const q = query.trim()
  if (q) params.set("q", q)
  const res = await fetch(`/api/pops/${popId}/checks/parties?${params}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<{ parties: CheckPartySearchItem[] }>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, parties: json.data.parties }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}
