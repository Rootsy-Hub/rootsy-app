import type {
  GetPopServicesTableInput,
  ServiceArticleOption,
  ServiceDetail,
  ServiceTableRow,
  UpsertServiceInput,
} from "@/app/[siteId]/[popId]/services/actions"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string; redirect?: string }

export type ServiceListItem = ServiceTableRow

export type PopServicesTableResult =
  | {
      success: true
      services: ServiceListItem[]
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
      services: ServiceListItem[]
      totalCount: number
      page: number
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
    }

type ServiceListData = {
  services: ServiceListItem[]
  totalCount: number
  page: number
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

const EMPTY_TABLE: Omit<
  Extract<PopServicesTableResult, { success: false }>,
  "success" | "error" | "redirect"
> = {
  services: [],
  totalCount: 0,
  page: 1,
  canCreate: false,
  canUpdate: false,
  canDelete: false,
}

export function buildServicesListSearch(input: GetPopServicesTableInput): string {
  const params = new URLSearchParams()
  if (input.page) params.set("page", String(input.page))
  if (input.pageSize) params.set("pageSize", String(input.pageSize))
  const q = input.q?.trim() ?? ""
  if (q) params.set("q", q)
  if (input.soloActivos) params.set("soloActivos", "true")
  if (input.categoryId?.trim()) params.set("categoryId", input.categoryId.trim())
  if (input.sort) params.set("sort", input.sort)
  if (input.ord && input.ord !== "asc") params.set("ord", input.ord)
  return params.toString()
}

function emptyError(error: string, redirect?: string): PopServicesTableResult {
  return { success: false, error, redirect, ...EMPTY_TABLE }
}

export async function fetchPopServicesTable(
  popId: string,
  input: GetPopServicesTableInput,
): Promise<PopServicesTableResult> {
  const search = buildServicesListSearch(input)
  const res = await fetch(`/api/pops/${popId}/services?${search}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<ServiceListData>
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

export async function fetchPopService(
  popId: string,
  serviceId: string,
): Promise<ServiceDetail> {
  const res = await fetch(`/api/pops/${popId}/services/${serviceId}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<ServiceDetail>
    | ApiErr
    | null
  if (!res.ok || !json || !("success" in json) || !json.success) {
    const error = json && "error" in json ? json.error : `HTTP ${res.status}`
    throw new Error(error || "No se pudo cargar el servicio")
  }
  return json.data
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

export async function createPopService(
  popId: string,
  input: UpsertServiceInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/services`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseMutate(res)
}

export async function updatePopService(
  popId: string,
  serviceId: string,
  input: UpsertServiceInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/services/${serviceId}`, {
    method: "PATCH",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseMutate(res)
}

export async function deletePopService(
  popId: string,
  serviceId: string,
  confirmationTyped: string,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/services/${serviceId}`, {
    method: "DELETE",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ confirmationTyped }),
  })
  return parseMutate(res)
}

export async function uploadServiceImage(
  popId: string,
  formData: FormData,
): Promise<
  { success: true; imageUrl: string } | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/services/image`, {
    method: "POST",
    headers: { accept: "application/json" },
    body: formData,
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<{ imageUrl: string }>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, imageUrl: json.data.imageUrl }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function searchServiceArticleOptions(
  popId: string,
  input: {
    query?: string
    limit?: number
    excludeIds?: string[]
  } = {},
): Promise<
  | { success: true; articles: ServiceArticleOption[] }
  | { success: false; error: string }
> {
  const params = new URLSearchParams()
  const q = input.query?.trim() ?? ""
  if (q) params.set("q", q)
  if (input.limit) params.set("limit", String(input.limit))
  if (input.excludeIds && input.excludeIds.length > 0) {
    params.set("exclude", input.excludeIds.join(","))
  }
  const res = await fetch(`/api/pops/${popId}/services/articles?${params}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<ServiceArticleOption[]>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, articles: json.data }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}
