import type {
  GetPopClientsTableInput,
  ClientTableRow,
  UpsertPopClientInput,
} from "@/app/[siteId]/[popId]/clients/actions"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string; redirect?: string }

export type PopClientsTableResult =
  | {
      success: true
      clients: ClientTableRow[]
      totalCount: number
      page: number
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
    }
  | {
      success: false
      error: string
      redirect?: string
      clients: ClientTableRow[]
      totalCount: number
      page: number
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
    }

type ClientListData = {
  clients: ClientTableRow[]
  totalCount: number
  page: number
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

const EMPTY_TABLE: Omit<
  Extract<PopClientsTableResult, { success: false }>,
  "success" | "error" | "redirect"
> = {
  clients: [],
  totalCount: 0,
  page: 1,
  canCreate: false,
  canUpdate: false,
  canDelete: false,
}

export function buildClientsListSearch(input: GetPopClientsTableInput): string {
  const params = new URLSearchParams()
  if (input.page) params.set("page", String(input.page))
  if (input.pageSize) params.set("pageSize", String(input.pageSize))
  const q = input.search?.trim() ?? ""
  if (q) params.set("q", q)
  if (input.soloActivos) params.set("soloActivos", "true")
  if (input.withEmail) params.set("withEmail", "true")
  if (input.withTaxId) params.set("withTaxId", "true")
  if (input.sort) params.set("sort", input.sort)
  if (input.ord && input.ord !== "asc") params.set("ord", input.ord)
  return params.toString()
}

function emptyError(error: string, redirect?: string): PopClientsTableResult {
  return { success: false, error, redirect, ...EMPTY_TABLE }
}

export async function fetchPopClientsTable(
  popId: string,
  input: GetPopClientsTableInput,
): Promise<PopClientsTableResult> {
  const search = buildClientsListSearch(input)
  const res = await fetch(`/api/pops/${popId}/clients?${search}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<ClientListData>
    | ApiErr
    | null

  if (res.ok && json && "success" in json && json.success) {
    return { success: true, ...json.data }
  }

  return emptyError(
    json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
    json && "redirect" in json ? json.redirect : undefined,
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

export async function createPopClient(
  popId: string,
  input: UpsertPopClientInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/clients`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseMutate(res)
}

export async function updatePopClient(
  popId: string,
  clientId: string,
  input: UpsertPopClientInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/clients/${clientId}`, {
    method: "PATCH",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseMutate(res)
}

export async function deletePopClient(
  popId: string,
  clientId: string,
  confirmationTyped: string,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/clients/${clientId}`, {
    method: "DELETE",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ confirmationTyped }),
  })
  return parseMutate(res)
}
