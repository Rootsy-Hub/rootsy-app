import type {
  ArticleTableRow,
  CreatePopArticleInput,
  GetPopArticlesTableInput,
  UpdatePopArticleInput,
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
    ["ventaSinStock", input.ventaSinStock],
  ]
  if (input.includeStock !== false) {
    flags.push(
      ["conStock", input.conStock],
      ["sinStock", input.sinStock],
      ["stockNegativo", input.stockNegativo],
    )
  }
  for (const [key, value] of flags) {
    const encoded = boolQuery(value)
    if (encoded) params.set(key, encoded)
  }
  if (input.includeStock === false) params.set("includeStock", "false")
  if (input.categoryId.trim()) params.set("categoryId", input.categoryId.trim())
  if (input.itemKinds.length > 0) {
    params.set("itemKinds", input.itemKinds.join(","))
  }
  if (input.ids && input.ids.length > 0) {
    params.set("ids", input.ids.join(","))
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

const ARTICLE_IDS_CHUNK = 80

export async function fetchPopArticlesByIds(
  popId: string,
  ids: string[],
): Promise<ArticleListItem[]> {
  const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))]
  const out: ArticleListItem[] = []
  for (let i = 0; i < unique.length; i += ARTICLE_IDS_CHUNK) {
    const chunk = unique.slice(i, i + ARTICLE_IDS_CHUNK)
    let page = 1
    for (;;) {
      const res = await fetchPopArticlesTable(popId, {
        page,
        pageSize: 100,
        search: "",
        soloActivos: false,
        soloInactivos: false,
        conDescuento: false,
        sinDescuento: false,
        conStock: false,
        sinStock: false,
        stockNegativo: false,
        ventaSinStock: false,
        includeStock: true,
        categoryId: "",
        itemKinds: [],
        ids: chunk,
        sort: "name",
        ord: "asc",
      })
      if (!res.success) throw new Error(res.error)
      out.push(...res.articles)
      if (page * 100 >= res.totalCount) break
      page += 1
    }
  }
  return out
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

export async function createPopArticle(
  popId: string,
  input: CreatePopArticleInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/articles`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseMutate(res)
}

export async function updatePopArticle(
  popId: string,
  articleId: string,
  input: UpdatePopArticleInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/articles/${articleId}`, {
    method: "PATCH",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseMutate(res)
}

export async function deletePopArticle(
  popId: string,
  articleId: string,
  confirmationTyped: string,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/articles/${articleId}`, {
    method: "DELETE",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ confirmationTyped }),
  })
  return parseMutate(res)
}

export async function uploadArticleImage(
  popId: string,
  formData: FormData,
): Promise<
  { success: true; imageUrl: string } | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/articles/image`, {
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
