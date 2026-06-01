export const CLIENT_TABLE_PAGE_SIZES = [10, 25, 50, 100] as const

export const DEFAULT_CLIENT_TABLE_PAGE_SIZE = 25

const K = {
  view: "v",
  q: "q",
  page: "page",
  ps: "ps",
  mail: "mail",
  tax: "tax",
  solo: "solo",
} as const

export type ClientsWorkspaceUrlState = {
  view: string
  q: string
  page: number
  pageSize: number
  withEmail: boolean
  withTaxId: boolean
  soloActivos: boolean
}

const ALLOWED_VIEWS = new Set(["list", "new-client"])

function clampPageSize(n: number): number {
  return CLIENT_TABLE_PAGE_SIZES.includes(n as (typeof CLIENT_TABLE_PAGE_SIZES)[number])
    ? n
    : DEFAULT_CLIENT_TABLE_PAGE_SIZE
}

export function parseClientsWorkspaceUrl(
  searchParams: URLSearchParams,
): ClientsWorkspaceUrlState {
  const rawView = searchParams.get(K.view) ?? "list"
  const view = ALLOWED_VIEWS.has(rawView) ? rawView : "list"

  const q = searchParams.get(K.q) ?? ""

  const pageRaw = Number(searchParams.get(K.page) ?? "1")
  const page =
    Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1

  const psRaw = Number(searchParams.get(K.ps) ?? String(DEFAULT_CLIENT_TABLE_PAGE_SIZE))
  const pageSize = clampPageSize(
    Number.isFinite(psRaw) && psRaw >= 1 ? Math.floor(psRaw) : DEFAULT_CLIENT_TABLE_PAGE_SIZE,
  )

  return {
    view,
    q,
    page,
    pageSize,
    withEmail: searchParams.get(K.mail) === "1",
    withTaxId: searchParams.get(K.tax) === "1",
    soloActivos: searchParams.get(K.solo) === "1",
  }
}

export function buildClientsWorkspaceQuery(
  state: ClientsWorkspaceUrlState,
): string {
  const n = new URLSearchParams()
  if (state.view !== "list") n.set(K.view, state.view)
  const qt = state.q.trim()
  if (qt) n.set(K.q, qt)
  if (state.page !== 1) n.set(K.page, String(state.page))
  if (state.pageSize !== DEFAULT_CLIENT_TABLE_PAGE_SIZE) {
    n.set(K.ps, String(state.pageSize))
  }
  if (state.withEmail) n.set(K.mail, "1")
  if (state.withTaxId) n.set(K.tax, "1")
  if (state.soloActivos) n.set(K.solo, "1")
  return n.toString()
}

export function mergeClientsWorkspaceUrl(
  current: URLSearchParams,
  patch: Partial<ClientsWorkspaceUrlState>,
): string {
  const merged: ClientsWorkspaceUrlState = {
    ...parseClientsWorkspaceUrl(current),
    ...patch,
  }
  if (patch.page === undefined && (patch.q !== undefined || patch.withEmail !== undefined || patch.withTaxId !== undefined || patch.soloActivos !== undefined)) {
    merged.page = 1
  }
  return buildClientsWorkspaceQuery(merged)
}
