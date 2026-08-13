import {
  DEFAULT_SERVICE_TABLE_PAGE_SIZE,
  SERVICE_TABLE_PAGE_SIZES,
} from "@/app/[siteId]/[popId]/services/serviceConstants"
import {
  appendWorkspaceTableSortParams,
  parseWorkspaceTableSortUrl,
  type WorkspaceTableSortDirection,
} from "@/lib/workspaceTableSort"

export type ServiceWorkspaceView = "list"

export type ServiceTablePageSize = (typeof SERVICE_TABLE_PAGE_SIZES)[number]

export const SERVICE_TABLE_SORT_KEYS = [
  "name",
  "default_price",
  "billing_period",
] as const

export type ServiceTableSortKey = (typeof SERVICE_TABLE_SORT_KEYS)[number]

export const DEFAULT_SERVICE_TABLE_SORT: ServiceTableSortKey = "name"

export type ServicesWorkspaceUrlState = {
  view: ServiceWorkspaceView
  q: string
  page: number
  pageSize: ServiceTablePageSize
  soloActivos: boolean
  categoryId: string
  sort: ServiceTableSortKey | null
  ord: WorkspaceTableSortDirection
}

const DEFAULTS: ServicesWorkspaceUrlState = {
  view: "list",
  q: "",
  page: 1,
  pageSize: DEFAULT_SERVICE_TABLE_PAGE_SIZE,
  soloActivos: false,
  categoryId: "",
  sort: null,
  ord: "asc",
}

function parsePageSize(raw: string | null): ServiceTablePageSize {
  const n = Number(raw)
  if (SERVICE_TABLE_PAGE_SIZES.includes(n as ServiceTablePageSize)) {
    return n as ServiceTablePageSize
  }
  return DEFAULT_SERVICE_TABLE_PAGE_SIZE
}

export function parseServicesWorkspaceUrl(
  params: URLSearchParams,
): ServicesWorkspaceUrlState {
  const pageRaw = Number(params.get("page"))
  const { sort, ord } = parseWorkspaceTableSortUrl(
    params,
    SERVICE_TABLE_SORT_KEYS,
  )
  return {
    view: "list",
    q: params.get("q")?.trim() ?? "",
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1,
    pageSize: parsePageSize(params.get("ps")),
    soloActivos: params.get("solo") === "1",
    categoryId: params.get("cat")?.trim() ?? "",
    sort: sort as ServiceTableSortKey | null,
    ord,
  }
}

export function mergeServicesWorkspaceUrl(
  current: URLSearchParams,
  patch: Partial<ServicesWorkspaceUrlState>,
): URLSearchParams {
  const next = new URLSearchParams(current.toString())
  const merged = { ...parseServicesWorkspaceUrl(current), ...patch }

  if (merged.q) next.set("q", merged.q)
  else next.delete("q")

  if (merged.page > 1) next.set("page", String(merged.page))
  else next.delete("page")

  if (merged.pageSize !== DEFAULT_SERVICE_TABLE_PAGE_SIZE) {
    next.set("ps", String(merged.pageSize))
  } else {
    next.delete("ps")
  }

  if (merged.soloActivos) next.set("solo", "1")
  else next.delete("solo")

  if (merged.categoryId) next.set("cat", merged.categoryId)
  else next.delete("cat")

  appendWorkspaceTableSortParams(next, {
    sort: merged.sort,
    ord: merged.ord,
  })

  if (
    patch.page === undefined &&
    (patch.q !== undefined ||
      patch.soloActivos !== undefined ||
      patch.categoryId !== undefined ||
      patch.sort !== undefined ||
      patch.ord !== undefined)
  ) {
    if (merged.page !== 1) next.set("page", "1")
    else next.delete("page")
  }

  return next
}

export { SERVICE_TABLE_PAGE_SIZES, DEFAULT_SERVICE_TABLE_PAGE_SIZE }
