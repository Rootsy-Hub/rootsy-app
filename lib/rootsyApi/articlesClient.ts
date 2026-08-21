import type {
  ArticleTableRow,
  GetPopArticlesTableInput,
} from "@/app/[siteId]/[popId]/articles/actions"
import type { ArticleCostRow } from "@/lib/articleCosts"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string; redirect?: string }

export type ArticleListPriceAmount = {
  listId: string
  amount: number
}

export type ArticleListItem = ArticleTableRow & {
  costs: ArticleCostRow[]
  listPrices: ArticleListPriceAmount[]
}

export type PopArticlesTableResult =
  | {
      success: true
      articles: ArticleListItem[]
      totalCount: number
      page: number
      canCreate: boolean
      canPostInitialStock: boolean
      canUpdate: boolean
      canDelete: boolean
    }
  | {
      success: false
      error: string
      redirect?: string
      articles: ArticleListItem[]
      totalCount: number
      page: number
      canCreate: boolean
      canPostInitialStock: boolean
      canUpdate: boolean
      canDelete: boolean
    }

type ArticleListData = {
  articles: ArticleListItem[]
  totalCount: number
  page: number
  canCreate: boolean
  canPostInitialStock: boolean
  canUpdate: boolean
  canDelete: boolean
}

const EMPTY_TABLE: Omit<Extract<PopArticlesTableResult, { success: false }>, "success" | "error" | "redirect"> =
  {
    articles: [],
    totalCount: 0,
    page: 1,
    canCreate: false,
    canPostInitialStock: false,
    canUpdate: false,
    canDelete: false,
  }

function boolQuery(value: boolean): string | undefined {
  return value ? "true" : undefined
}

export function buildArticlesListSearch(input: GetPopArticlesTableInput): string {
  const params = new URLSearchParams()
  params.set("page", String(input.page))
  params.set("pageSize", String(input.pageSize))
  const q = input.search.trim()
  if (q) params.set("q", q)
  const flags: Array<[string, boolean]> = [
    ["soloActivos", input.soloActivos],
    ["soloInactivos", input.soloInactivos],
    ["conDescuento", input.conDescuento],
    ["sinDescuento", input.sinDescuento],
    ["conStock", input.conStock],
    ["sinStock", input.sinStock],
    ["stockNegativo", input.stockNegativo],
    ["ventaSinStock", input.ventaSinStock],
  ]
  for (const [key, value] of flags) {
    const encoded = boolQuery(value)
    if (encoded) params.set(key, encoded)
  }
  if (input.categoryId.trim()) params.set("categoryId", input.categoryId.trim())
  if (input.itemKinds.length > 0) {
    params.set("itemKinds", input.itemKinds.join(","))
  }
  if (input.sort) params.set("sort", input.sort)
  if (input.ord && input.ord !== "asc") params.set("ord", input.ord)
  return params.toString()
}

function emptyError(error: string, redirect?: string): PopArticlesTableResult {
  return { success: false, error, redirect, ...EMPTY_TABLE }
}

export async function fetchPopArticlesTable(
  popId: string,
  input: GetPopArticlesTableInput,
): Promise<PopArticlesTableResult> {
  const search = buildArticlesListSearch(input)
  const res = await fetch(`/api/pops/${popId}/articles?${search}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<ArticleListData>
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

export async function fetchPopArticle(
  popId: string,
  articleId: string,
): Promise<ArticleListItem> {
  const res = await fetch(`/api/pops/${popId}/articles/${articleId}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<ArticleListItem>
    | ApiErr
    | null
  if (!res.ok || !json || !("success" in json) || !json.success) {
    const error = json && "error" in json ? json.error : `HTTP ${res.status}`
    throw new Error(error || "No se pudo cargar el artículo")
  }
  return json.data
}
