export const ARTICLE_TABLE_PAGE_SIZES = [10, 25, 50, 100] as const

export const DEFAULT_ARTICLE_TABLE_PAGE_SIZE = 25

const K = {
  view: "v",
  q: "q",
  page: "page",
  ps: "ps",
  solo: "solo",
  cat: "cat",
} as const

export type ArticlesWorkspaceUrlState = {
  view: string
  q: string
  page: number
  pageSize: number
  soloActivos: boolean
  categoryId: string
}

const ALLOWED_VIEWS = new Set(["list", "new-article"])

function clampPageSize(n: number): number {
  return ARTICLE_TABLE_PAGE_SIZES.includes(
    n as (typeof ARTICLE_TABLE_PAGE_SIZES)[number],
  )
    ? n
    : DEFAULT_ARTICLE_TABLE_PAGE_SIZE
}

export function parseArticlesWorkspaceUrl(
  searchParams: URLSearchParams,
): ArticlesWorkspaceUrlState {
  const rawView = searchParams.get(K.view) ?? "list"
  const view = ALLOWED_VIEWS.has(rawView) ? rawView : "list"

  const q = searchParams.get(K.q) ?? ""

  const pageRaw = Number(searchParams.get(K.page) ?? "1")
  const page =
    Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1

  const psRaw = Number(
    searchParams.get(K.ps) ?? String(DEFAULT_ARTICLE_TABLE_PAGE_SIZE),
  )
  const pageSize = clampPageSize(
    Number.isFinite(psRaw) && psRaw >= 1 ? Math.floor(psRaw) : DEFAULT_ARTICLE_TABLE_PAGE_SIZE,
  )

  const catRaw = searchParams.get(K.cat)?.trim() ?? ""
  const categoryId = /^[0-9a-f-]{36}$/i.test(catRaw) ? catRaw : ""

  return {
    view,
    q,
    page,
    pageSize,
    soloActivos: searchParams.get(K.solo) === "1",
    categoryId,
  }
}

export function buildArticlesWorkspaceQuery(state: ArticlesWorkspaceUrlState): string {
  const n = new URLSearchParams()
  if (state.view !== "list") n.set(K.view, state.view)
  const qt = state.q.trim()
  if (qt) n.set(K.q, qt)
  if (state.page !== 1) n.set(K.page, String(state.page))
  if (state.pageSize !== DEFAULT_ARTICLE_TABLE_PAGE_SIZE) {
    n.set(K.ps, String(state.pageSize))
  }
  if (state.soloActivos) n.set(K.solo, "1")
  if (state.categoryId.trim()) n.set(K.cat, state.categoryId.trim())
  return n.toString()
}

export function mergeArticlesWorkspaceUrl(
  current: URLSearchParams,
  patch: Partial<ArticlesWorkspaceUrlState>,
): string {
  const merged: ArticlesWorkspaceUrlState = {
    ...parseArticlesWorkspaceUrl(current),
    ...patch,
  }
  if (
    patch.page === undefined &&
    (patch.q !== undefined ||
      patch.soloActivos !== undefined ||
      patch.categoryId !== undefined)
  ) {
    merged.page = 1
  }
  return buildArticlesWorkspaceQuery(merged)
}
