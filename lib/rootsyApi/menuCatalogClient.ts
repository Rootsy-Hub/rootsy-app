import type {
  MenuCatalogArticle,
  MenuCatalogCategorySection,
  MenuCatalogPromotion,
  MenuCatalogRecipe,
} from "@/app/[siteId]/[popId]/menu-catalog/actions"
import type { SaleOpenCashSession } from "@/app/[siteId]/[popId]/sale/actions"
import type { OperateCatalogItemsFilter } from "@/lib/operateCatalogPage"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isUuid(value: string | null | undefined): value is string {
  return Boolean(value && UUID_RE.test(value))
}

export type MenuCatalogBootstrap = {
  popName: string
  categorySections: MenuCatalogCategorySection[]
  promotions: MenuCatalogPromotion[]
  quantityDeals: MenuCatalogPromotion[]
  canReadClients: boolean
  canReadPaymentMethods: boolean
  canCreateSale: boolean
  canReadCashRegisters: boolean
  openCashSession: SaleOpenCashSession | null
  invoiceTypeSiteId: string
}

export type MenuCatalogItemsPage = {
  articles: MenuCatalogArticle[]
  recipes: MenuCatalogRecipe[]
  nextOffset: number | null
}

async function parseOk<T>(
  res: Response,
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  const json = (await res.json().catch(() => null)) as ApiOk<T> | ApiErr | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, data: json.data }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function fetchMenuCatalog(
  popId: string,
): Promise<
  | { success: true } & MenuCatalogBootstrap
  | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/menu-catalog`, {
    headers: { accept: "application/json" },
  })
  const parsed = await parseOk<MenuCatalogBootstrap>(res)
  if (!parsed.success) return parsed
  return { success: true, ...parsed.data }
}

export async function fetchMenuCatalogItemsPage(
  popId: string,
  filter: OperateCatalogItemsFilter,
  offset = 0,
): Promise<
  | { success: true; page: MenuCatalogItemsPage }
  | { success: false; error: string }
> {
  const params = new URLSearchParams({
    section: filter.section,
    offset: String(offset),
  })
  if (filter.search.trim()) params.set("search", filter.search.trim())
  if (isUuid(filter.categoryId)) params.set("categoryId", filter.categoryId)
  if (isUuid(filter.priceListId)) params.set("priceListId", filter.priceListId)

  const res = await fetch(
    `/api/pops/${popId}/menu-catalog/items?${params}`,
    { headers: { accept: "application/json" } },
  )
  const parsed = await parseOk<MenuCatalogItemsPage>(res)
  if (!parsed.success) return parsed
  return { success: true, page: parsed.data }
}

export async function fetchMenuCatalogItemsByIds(
  popId: string,
  articleIds: string[],
  recipeIds: string[],
  priceListId?: string,
): Promise<
  | {
      success: true
      articles: MenuCatalogArticle[]
      recipes: MenuCatalogRecipe[]
    }
  | { success: false; error: string }
> {
  const articles = [...new Set(articleIds.filter(Boolean))]
  const recipes = [...new Set(recipeIds.filter(Boolean))]
  if (articles.length === 0 && recipes.length === 0) {
    return { success: true, articles: [], recipes: [] }
  }
  const params = new URLSearchParams()
  if (articles.length > 0) params.set("articleIds", articles.join(","))
  if (recipes.length > 0) params.set("recipeIds", recipes.join(","))
  if (isUuid(priceListId)) params.set("priceListId", priceListId)
  const res = await fetch(
    `/api/pops/${popId}/menu-catalog/items-by-ids?${params}`,
    { headers: { accept: "application/json" } },
  )
  const parsed = await parseOk<{
    articles: MenuCatalogArticle[]
    recipes: MenuCatalogRecipe[]
  }>(res)
  if (!parsed.success) return parsed
  return {
    success: true,
    articles: parsed.data.articles,
    recipes: parsed.data.recipes,
  }
}

export async function findMenuCatalogItemByScan(
  popId: string,
  rawQuery: string,
  priceListId?: string,
): Promise<
  | {
      success: true
      article: MenuCatalogArticle | null
      recipe: MenuCatalogRecipe | null
    }
  | { success: false; error: string }
> {
  const q = rawQuery.trim()
  if (!q) return { success: true, article: null, recipe: null }
  const params = new URLSearchParams({ q })
  if (isUuid(priceListId)) params.set("priceListId", priceListId)
  const res = await fetch(
    `/api/pops/${popId}/menu-catalog/scan?${params}`,
    { headers: { accept: "application/json" } },
  )
  const parsed = await parseOk<{
    article: MenuCatalogArticle | null
    recipe: MenuCatalogRecipe | null
  }>(res)
  if (!parsed.success) return parsed
  return {
    success: true,
    article: parsed.data.article,
    recipe: parsed.data.recipe,
  }
}
