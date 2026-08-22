import {
  appendWorkspaceTableSortParams,
  parseWorkspaceTableSortUrl,
  type WorkspaceTableSortDirection,
} from "@/lib/workspaceTableSort"

export const SUPPLIER_TABLE_PAGE_SIZES = [10, 25, 50, 100] as const

export const DEFAULT_SUPPLIER_TABLE_PAGE_SIZE = 25

export const SUPPLIER_TABLE_SORT_KEYS = [
  "name",
  "email",
  "phone",
  "tax_id",
  "iva",
] as const

export type SupplierTableSortKey = (typeof SUPPLIER_TABLE_SORT_KEYS)[number]

const K = {
  q: "q",
  page: "page",
  ps: "ps",
  mail: "mail",
  tax: "tax",
  solo: "solo",
} as const

export type SuppliersWorkspaceUrlState = {
  q: string
  page: number
  pageSize: number
  withEmail: boolean
  withTaxId: boolean
  soloActivos: boolean
  sort: SupplierTableSortKey | null
  ord: WorkspaceTableSortDirection
}

function clampPageSize(n: number): number {
  return SUPPLIER_TABLE_PAGE_SIZES.includes(
    n as (typeof SUPPLIER_TABLE_PAGE_SIZES)[number],
  )
    ? n
    : DEFAULT_SUPPLIER_TABLE_PAGE_SIZE
}

export function parseSuppliersWorkspaceUrl(
  searchParams: URLSearchParams,
): SuppliersWorkspaceUrlState {
  const q = searchParams.get(K.q) ?? ""

  const pageRaw = Number(searchParams.get(K.page) ?? "1")
  const page =
    Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1

  const psRaw = Number(
    searchParams.get(K.ps) ?? String(DEFAULT_SUPPLIER_TABLE_PAGE_SIZE),
  )
  const pageSize = clampPageSize(
    Number.isFinite(psRaw) && psRaw >= 1
      ? Math.floor(psRaw)
      : DEFAULT_SUPPLIER_TABLE_PAGE_SIZE,
  )

  const { sort, ord } = parseWorkspaceTableSortUrl(
    searchParams,
    SUPPLIER_TABLE_SORT_KEYS,
  )

  return {
    q,
    page,
    pageSize,
    withEmail: searchParams.get(K.mail) === "1",
    withTaxId: searchParams.get(K.tax) === "1",
    soloActivos: searchParams.get(K.solo) === "1",
    sort: sort as SupplierTableSortKey | null,
    ord,
  }
}

export function buildSuppliersWorkspaceQuery(
  state: SuppliersWorkspaceUrlState,
): string {
  const n = new URLSearchParams()
  const qt = state.q.trim()
  if (qt) n.set(K.q, qt)
  if (state.page !== 1) n.set(K.page, String(state.page))
  if (state.pageSize !== DEFAULT_SUPPLIER_TABLE_PAGE_SIZE) {
    n.set(K.ps, String(state.pageSize))
  }
  if (state.withEmail) n.set(K.mail, "1")
  if (state.withTaxId) n.set(K.tax, "1")
  if (state.soloActivos) n.set(K.solo, "1")
  appendWorkspaceTableSortParams(n, {
    sort: state.sort,
    ord: state.ord,
  })
  return n.toString()
}

export function mergeSuppliersWorkspaceUrl(
  current: URLSearchParams,
  patch: Partial<SuppliersWorkspaceUrlState>,
): string {
  const merged: SuppliersWorkspaceUrlState = {
    ...parseSuppliersWorkspaceUrl(current),
    ...patch,
  }
  if (
    patch.page === undefined &&
    (patch.q !== undefined ||
      patch.withEmail !== undefined ||
      patch.withTaxId !== undefined ||
      patch.soloActivos !== undefined ||
      patch.sort !== undefined ||
      patch.ord !== undefined)
  ) {
    merged.page = 1
  }
  return buildSuppliersWorkspaceQuery(merged)
}
