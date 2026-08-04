import {
  ARTICLE_ITEM_KINDS,
  parseItemKindsCsv,
  type ArticleItemKind,
} from "@/lib/articleItemKind"

export const ARTICLE_TABLE_PAGE_SIZES = [10, 25, 50, 100] as const

export const DEFAULT_ARTICLE_TABLE_PAGE_SIZE = 25

const K = {
  view: "v",
  q: "q",
  page: "page",
  ps: "ps",
  solo: "solo",
  inact: "inact",
  disc: "disc",
  nodisc: "nodisc",
  stock: "stock",
  nostock: "nostock",
  neg: "neg",
  negsale: "negsale",
  cat: "cat",
  kinds: "kinds",
} as const

export type ArticlesModalFilters = {
  soloActivos: boolean
  soloInactivos: boolean
  conDescuento: boolean
  sinDescuento: boolean
  conStock: boolean
  sinStock: boolean
  stockNegativo: boolean
  ventaSinStock: boolean
}

export type ArticlesWorkspaceUrlState = ArticlesModalFilters & {
  view: string
  q: string
  page: number
  pageSize: number
  categoryId: string
  /** Vacío = todos los tipos visibles. */
  itemKinds: ArticleItemKind[]
}

export function defaultArticlesModalFilters(): ArticlesModalFilters {
  return {
    soloActivos: false,
    soloInactivos: false,
    conDescuento: false,
    sinDescuento: false,
    conStock: false,
    sinStock: false,
    stockNegativo: false,
    ventaSinStock: false,
  }
}

export function articlesModalFiltersFromWorkspace(
  state: Pick<ArticlesWorkspaceUrlState, keyof ArticlesModalFilters>,
): ArticlesModalFilters {
  return {
    soloActivos: state.soloActivos,
    soloInactivos: state.soloInactivos,
    conDescuento: state.conDescuento,
    sinDescuento: state.sinDescuento,
    conStock: state.conStock,
    sinStock: state.sinStock,
    stockNegativo: state.stockNegativo,
    ventaSinStock: state.ventaSinStock,
  }
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

  const itemKinds = parseItemKindsCsv(
    searchParams.get(K.kinds) ?? searchParams.get("kind"),
  )

  return {
    view,
    q,
    page,
    pageSize,
    soloActivos: searchParams.get(K.solo) === "1",
    soloInactivos: searchParams.get(K.inact) === "1",
    conDescuento: searchParams.get(K.disc) === "1",
    sinDescuento: searchParams.get(K.nodisc) === "1",
    conStock: searchParams.get(K.stock) === "1",
    sinStock: searchParams.get(K.nostock) === "1",
    stockNegativo: searchParams.get(K.neg) === "1",
    ventaSinStock: searchParams.get(K.negsale) === "1",
    categoryId,
    itemKinds,
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
  if (state.soloInactivos) n.set(K.inact, "1")
  if (state.conDescuento) n.set(K.disc, "1")
  if (state.sinDescuento) n.set(K.nodisc, "1")
  if (state.conStock) n.set(K.stock, "1")
  if (state.sinStock) n.set(K.nostock, "1")
  if (state.stockNegativo) n.set(K.neg, "1")
  if (state.ventaSinStock) n.set(K.negsale, "1")
  if (state.categoryId.trim()) n.set(K.cat, state.categoryId.trim())
  if (
    state.itemKinds.length > 0 &&
    state.itemKinds.length < ARTICLE_ITEM_KINDS.length
  ) {
    n.set(K.kinds, state.itemKinds.join(","))
  }
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
      patch.soloInactivos !== undefined ||
      patch.conDescuento !== undefined ||
      patch.sinDescuento !== undefined ||
      patch.conStock !== undefined ||
      patch.sinStock !== undefined ||
      patch.stockNegativo !== undefined ||
      patch.ventaSinStock !== undefined ||
      patch.categoryId !== undefined ||
      patch.itemKinds !== undefined)
  ) {
    merged.page = 1
  }
  return buildArticlesWorkspaceQuery(merged)
}
