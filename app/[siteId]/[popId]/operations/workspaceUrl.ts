import {
  defaultOperationsModalFilters,
  OPERATIONS_COUNTER_FULFILLMENT_FILTERS,
  OPERATIONS_COUNTER_STATUS_FILTERS,
  OPERATIONS_EXPENSE_SOURCE_FILTERS,
  OPERATIONS_PURCHASE_KIND_FILTERS,
  OPERATIONS_SALE_STATUS_FILTERS,
  OPERATIONS_SERVICE_SCOPE_FILTERS,
  OPERATIONS_SERVICE_STATUS_FILTERS,
  OPERATIONS_TABLE_SESSION_FILTERS,
  type OperationsModalFilters,
} from "@/app/[siteId]/[popId]/operations/operationsFilters"
import type { DataWorkspaceDatePreset } from "@/lib/dataWorkspaceDateFilter"
import type { OperationsViewId } from "@/lib/operationsViewPreference"
import {
  appendWorkspaceTableSortParams,
  parseWorkspaceTableSortUrl,
  type WorkspaceTableSortDirection,
} from "@/lib/workspaceTableSort"
import type { DateRange } from "react-day-picker"

export const OPERATIONS_PAGE_SIZES = [10, 25, 50, 100] as const
export const DEFAULT_OPERATIONS_PAGE_SIZE = 25

export type OperationsTablePageSize = (typeof OPERATIONS_PAGE_SIZES)[number]

export const OPERATIONS_TABLE_SORT_KEYS = [
  "sold_at",
  "total",
  "created_at",
  "entry_date",
  "due_date",
] as const

export type OperationsWorkspaceUrlState = {
  view: OperationsViewId
  q: string
  page: number
  pageSize: OperationsTablePageSize
  datePreset: DataWorkspaceDatePreset
  customFrom: string | null
  customTo: string | null
  sort: string | null
  ord: WorkspaceTableSortDirection
  filters: OperationsModalFilters
}

const VIEWS = new Set<OperationsViewId>([
  "sales",
  "tables",
  "counter",
  "purchases",
  "expenses",
  "services",
])

const DATE_PRESETS = new Set<DataWorkspaceDatePreset>([
  "all",
  "today",
  "this_week",
  "this_month",
  "last_month",
  "last_7",
  "last_30",
  "custom",
])

function parseView(raw: string | null): OperationsViewId {
  const value = raw?.trim() ?? ""
  return VIEWS.has(value as OperationsViewId)
    ? (value as OperationsViewId)
    : "sales"
}

function parsePage(raw: string | null): number {
  const n = Number(raw)
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1
}

function parsePageSize(raw: string | null): OperationsTablePageSize {
  const n = Number(raw)
  if (OPERATIONS_PAGE_SIZES.includes(n as OperationsTablePageSize)) {
    return n as OperationsTablePageSize
  }
  return DEFAULT_OPERATIONS_PAGE_SIZE
}

function parseDatePreset(raw: string | null): DataWorkspaceDatePreset {
  const value = raw?.trim() ?? ""
  return DATE_PRESETS.has(value as DataWorkspaceDatePreset)
    ? (value as DataWorkspaceDatePreset)
    : "this_month"
}

function parseIsoDate(raw: string | null): string | null {
  const value = raw?.trim() ?? ""
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
}

function oneOf<T extends string>(
  raw: string | null,
  allowed: readonly T[],
): T | "" {
  const value = raw?.trim() ?? ""
  return allowed.includes(value as T) ? (value as T) : ""
}

function parseFilters(params: URLSearchParams): OperationsModalFilters {
  return {
    saleStatus: oneOf(params.get("ss"), OPERATIONS_SALE_STATUS_FILTERS),
    saleWithDiscount: params.get("swd") === "1",
    tableSession: oneOf(params.get("ts"), OPERATIONS_TABLE_SESSION_FILTERS),
    counterStatus: oneOf(params.get("cs"), OPERATIONS_COUNTER_STATUS_FILTERS),
    counterFulfillment: oneOf(
      params.get("cf"),
      OPERATIONS_COUNTER_FULFILLMENT_FILTERS,
    ),
    purchaseKind: oneOf(params.get("pk"), OPERATIONS_PURCHASE_KIND_FILTERS),
    purchaseFiscalOnly: params.get("pf") === "1",
    expenseSource: oneOf(params.get("es"), OPERATIONS_EXPENSE_SOURCE_FILTERS),
    serviceStatus: oneOf(params.get("sst"), OPERATIONS_SERVICE_STATUS_FILTERS),
    serviceScope: oneOf(params.get("ssc"), OPERATIONS_SERVICE_SCOPE_FILTERS),
  }
}

export function parseOperationsWorkspaceUrl(
  params: URLSearchParams,
): OperationsWorkspaceUrlState {
  const { sort, ord } = parseWorkspaceTableSortUrl(
    params,
    OPERATIONS_TABLE_SORT_KEYS,
  )
  const datePreset = parseDatePreset(params.get("dp"))
  return {
    view: parseView(params.get("view")),
    q: params.get("q")?.trim() ?? "",
    page: parsePage(params.get("page")),
    pageSize: parsePageSize(params.get("ps")),
    datePreset,
    customFrom: datePreset === "custom" ? parseIsoDate(params.get("df")) : null,
    customTo: datePreset === "custom" ? parseIsoDate(params.get("dt")) : null,
    sort,
    ord,
    filters: parseFilters(params),
  }
}

export function operationsCustomDateRange(
  state: OperationsWorkspaceUrlState,
): DateRange | undefined {
  if (state.datePreset !== "custom" || !state.customFrom || !state.customTo) {
    return undefined
  }
  return {
    from: new Date(`${state.customFrom}T12:00:00`),
    to: new Date(`${state.customTo}T12:00:00`),
  }
}

function setOrDelete(params: URLSearchParams, key: string, value: string) {
  if (value) params.set(key, value)
  else params.delete(key)
}

export function mergeOperationsWorkspaceUrl(
  current: URLSearchParams,
  patch: Partial<OperationsWorkspaceUrlState>,
): URLSearchParams {
  const next = new URLSearchParams(current.toString())
  const merged: OperationsWorkspaceUrlState = {
    ...parseOperationsWorkspaceUrl(current),
    ...patch,
    filters: patch.filters
      ? { ...defaultOperationsModalFilters(), ...patch.filters }
      : parseOperationsWorkspaceUrl(current).filters,
  }
  if (patch.filters) {
    merged.filters = { ...defaultOperationsModalFilters(), ...patch.filters }
  }

  if (
    patch.page === undefined &&
    (patch.view !== undefined ||
      patch.q !== undefined ||
      patch.datePreset !== undefined ||
      patch.customFrom !== undefined ||
      patch.customTo !== undefined ||
      patch.pageSize !== undefined ||
      patch.sort !== undefined ||
      patch.ord !== undefined ||
      patch.filters !== undefined)
  ) {
    merged.page = 1
  }

  if (merged.view !== "sales") next.set("view", merged.view)
  else next.delete("view")

  setOrDelete(next, "q", merged.q)

  if (merged.page > 1) next.set("page", String(merged.page))
  else next.delete("page")

  if (merged.pageSize !== DEFAULT_OPERATIONS_PAGE_SIZE) {
    next.set("ps", String(merged.pageSize))
  } else {
    next.delete("ps")
  }

  if (merged.datePreset !== "this_month") next.set("dp", merged.datePreset)
  else next.delete("dp")

  if (merged.datePreset === "custom" && merged.customFrom) {
    next.set("df", merged.customFrom)
  } else {
    next.delete("df")
  }
  if (merged.datePreset === "custom" && merged.customTo) {
    next.set("dt", merged.customTo)
  } else {
    next.delete("dt")
  }

  appendWorkspaceTableSortParams(next, {
    sort: merged.sort,
    ord: merged.ord,
  })

  const f = merged.filters
  setOrDelete(next, "ss", f.saleStatus)
  if (f.saleWithDiscount) next.set("swd", "1")
  else next.delete("swd")
  setOrDelete(next, "ts", f.tableSession)
  setOrDelete(next, "cs", f.counterStatus)
  setOrDelete(next, "cf", f.counterFulfillment)
  setOrDelete(next, "pk", f.purchaseKind)
  if (f.purchaseFiscalOnly) next.set("pf", "1")
  else next.delete("pf")
  setOrDelete(next, "es", f.expenseSource)
  setOrDelete(next, "sst", f.serviceStatus)
  setOrDelete(next, "ssc", f.serviceScope)

  return next
}
