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

export type InventoryWorkspaceUrlState = {
  clearing: InventoryClearingId
  q: string
  redFilter: InventoryRedFilter
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

export function parseInventoryWorkspaceUrl(
  params: URLSearchParams,
): InventoryWorkspaceUrlState {
  return {
    clearing: parseClearing(params.get("c")),
    q: params.get("q")?.trim() ?? "",
    redFilter: parseRedFilter(params.get("rf")),
  }
}

export function mergeInventoryWorkspaceUrl(
  current: URLSearchParams,
  patch: Partial<InventoryWorkspaceUrlState>,
): URLSearchParams {
  const next = new URLSearchParams(current.toString())
  const merged = { ...parseInventoryWorkspaceUrl(current), ...patch }

  if (merged.clearing !== "home") next.set("c", merged.clearing)
  else next.delete("c")

  if (merged.q) next.set("q", merged.q)
  else next.delete("q")

  if (merged.clearing === "red" && merged.redFilter !== "todas") {
    next.set("rf", merged.redFilter)
  } else {
    next.delete("rf")
  }

  return next
}
