import type {
  GetPopSuppliersTableInput,
  SupplierTableRow,
  UpsertPopSupplierInput,
} from "@/app/[siteId]/[popId]/suppliers/actions"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string; redirect?: string }

export type SupplierOption = {
  id: string
  name: string
}

export async function fetchPopSupplierOptions(
  popId: string,
  options?: { q?: string },
): Promise<SupplierOption[]> {
  const params = new URLSearchParams()
  const q = options?.q?.trim()
  if (q) params.set("q", q)
  const search = params.toString()
  const res = await fetch(
    `/api/pops/${popId}/suppliers${search ? `?${search}` : ""}`,
    {
      headers: { accept: "application/json" },
    },
  )
  const json = (await res.json().catch(() => null)) as
    | ApiOk<SupplierOption[]>
    | ApiErr
    | null
  if (!res.ok || !json || !("success" in json) || !json.success) {
    const error = json && "error" in json ? json.error : `HTTP ${res.status}`
    throw new Error(error || "No se pudieron cargar los proveedores")
  }
  return json.data
}

export type PopSuppliersTableResult =
  | {
      success: true
      suppliers: SupplierTableRow[]
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
      suppliers: SupplierTableRow[]
      totalCount: number
      page: number
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
    }

type SupplierListData = {
  suppliers: SupplierTableRow[]
  totalCount: number
  page: number
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

const EMPTY_TABLE: Omit<
  Extract<PopSuppliersTableResult, { success: false }>,
  "success" | "error" | "redirect"
> = {
  suppliers: [],
  totalCount: 0,
  page: 1,
  canCreate: false,
  canUpdate: false,
  canDelete: false,
}

export function buildSuppliersListSearch(
  input: GetPopSuppliersTableInput,
): string {
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

function emptyError(error: string, redirect?: string): PopSuppliersTableResult {
  return { success: false, error, redirect, ...EMPTY_TABLE }
}

export async function fetchPopSuppliersTable(
  popId: string,
  input: GetPopSuppliersTableInput,
): Promise<PopSuppliersTableResult> {
  const search = buildSuppliersListSearch(input)
  const res = await fetch(`/api/pops/${popId}/suppliers/table?${search}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<SupplierListData>
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

export async function createPopSupplier(
  popId: string,
  input: UpsertPopSupplierInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/suppliers`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseMutate(res)
}

export async function updatePopSupplier(
  popId: string,
  supplierId: string,
  input: UpsertPopSupplierInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/suppliers/${supplierId}`, {
    method: "PATCH",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseMutate(res)
}

export async function deletePopSupplier(
  popId: string,
  supplierId: string,
  confirmationTyped: string,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/suppliers/${supplierId}`, {
    method: "DELETE",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ confirmationTyped }),
  })
  return parseMutate(res)
}
