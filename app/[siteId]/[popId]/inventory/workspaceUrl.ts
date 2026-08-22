export const INVENTORY_CLEARING_IDS = [
  "home",
  "red",
  "overstock",
  "purchase",
  "pantry",
  "movements",
  "recommend",
  "ledger",
  "locations",
  "expiry",
] as const

export type InventoryClearingId = (typeof INVENTORY_CLEARING_IDS)[number]

export type InventoryRedFilter = "todas" | "negative" | "empty" | "below_min"

export const INVENTORY_PAGE_SIZES = [25, 50] as const
export const DEFAULT_INVENTORY_PAGE_SIZE = 25

export type InventoryWorkspaceUrlState = {
  clearing: InventoryClearingId
  q: string
  redFilter: InventoryRedFilter
  page: number
  pageSize: number
}

const CLEARING_SET = new Set<string>(INVENTORY_CLEARING_IDS)
const RED_FILTERS = new Set<InventoryRedFilter>([
  "todas",
  "negative",
  "empty",
  "below_min",
])

function parseClearing(raw: string | null): InventoryClearingId {
  const value = raw?.trim() ?? ""
  if (CLEARING_SET.has(value) && value !== "home") {
    return value as InventoryClearingId
  }
  return "home"
}

function parseRedFilter(raw: string | null): InventoryRedFilter {
  const value = raw?.trim() ?? ""
  return RED_FILTERS.has(value as InventoryRedFilter)
    ? (value as InventoryRedFilter)
    : "todas"
}

function parsePage(raw: string | null): number {
  const n = Number(raw)
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1
}

function parsePageSize(raw: string | null): number {
  const n = Number(raw)
  if (INVENTORY_PAGE_SIZES.includes(n as (typeof INVENTORY_PAGE_SIZES)[number])) {
    return n
  }
  return DEFAULT_INVENTORY_PAGE_SIZE
}

export function parseInventoryWorkspaceUrl(
  params: URLSearchParams,
): InventoryWorkspaceUrlState {
  return {
    clearing: parseClearing(params.get("c")),
    q: params.get("q")?.trim() ?? "",
    redFilter: parseRedFilter(params.get("rf")),
    page: parsePage(params.get("page")),
    pageSize: parsePageSize(params.get("ps")),
  }
}

export function mergeInventoryWorkspaceUrl(
  current: URLSearchParams,
  patch: Partial<InventoryWorkspaceUrlState>,
): URLSearchParams {
  const next = new URLSearchParams(current.toString())
  const merged = { ...parseInventoryWorkspaceUrl(current), ...patch }

  if (
    patch.page === undefined &&
    (patch.clearing !== undefined ||
      patch.q !== undefined ||
      patch.redFilter !== undefined ||
      patch.pageSize !== undefined)
  ) {
    merged.page = 1
  }

  if (merged.clearing !== "home") next.set("c", merged.clearing)
  else next.delete("c")

  if (merged.q) next.set("q", merged.q)
  else next.delete("q")

  if (merged.clearing === "red" && merged.redFilter !== "todas") {
    next.set("rf", merged.redFilter)
  } else {
    next.delete("rf")
  }

  if (merged.clearing !== "home" && merged.page > 1) {
    next.set("page", String(merged.page))
  } else {
    next.delete("page")
  }

  if (
    merged.clearing !== "home" &&
    merged.pageSize !== DEFAULT_INVENTORY_PAGE_SIZE
  ) {
    next.set("ps", String(merged.pageSize))
  } else {
    next.delete("ps")
  }

  return next
}
