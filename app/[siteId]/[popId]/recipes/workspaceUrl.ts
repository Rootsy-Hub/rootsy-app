import {
  DEFAULT_RECIPE_TABLE_PAGE_SIZE,
  RECIPE_TABLE_PAGE_SIZES,
} from "@/app/[siteId]/[popId]/recipes/recipeConstants"
import {
  appendWorkspaceTableSortParams,
  parseWorkspaceTableSortUrl,
  type WorkspaceTableSortDirection,
} from "@/lib/workspaceTableSort"

export type RecipeWorkspaceView = "list"

export type RecipeTablePageSize = (typeof RECIPE_TABLE_PAGE_SIZES)[number]

export const RECIPE_TABLE_SORT_KEYS = [
  "name",
  "sale_price",
  "cost_price",
] as const

export type RecipeTableSortKey = (typeof RECIPE_TABLE_SORT_KEYS)[number]

export const DEFAULT_RECIPE_TABLE_SORT: RecipeTableSortKey = "name"

export type RecipesWorkspaceUrlState = {
  view: RecipeWorkspaceView
  q: string
  page: number
  pageSize: RecipeTablePageSize
  soloActivos: boolean
  categoryId: string
  sort: RecipeTableSortKey | null
  ord: WorkspaceTableSortDirection
}

const DEFAULTS: RecipesWorkspaceUrlState = {
  view: "list",
  q: "",
  page: 1,
  pageSize: DEFAULT_RECIPE_TABLE_PAGE_SIZE,
  soloActivos: false,
  categoryId: "",
  sort: null,
  ord: "asc",
}

function parsePageSize(raw: string | null): RecipeTablePageSize {
  const n = Number(raw)
  if (
    RECIPE_TABLE_PAGE_SIZES.includes(n as RecipeTablePageSize)
  ) {
    return n as RecipeTablePageSize
  }
  return DEFAULT_RECIPE_TABLE_PAGE_SIZE
}

export function parseRecipesWorkspaceUrl(
  params: URLSearchParams,
): RecipesWorkspaceUrlState {
  const pageRaw = Number(params.get("page"))
  const { sort, ord } = parseWorkspaceTableSortUrl(
    params,
    RECIPE_TABLE_SORT_KEYS,
  )
  return {
    view: "list",
    q: params.get("q")?.trim() ?? "",
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1,
    pageSize: parsePageSize(params.get("ps")),
    soloActivos: params.get("solo") === "1",
    categoryId: params.get("cat")?.trim() ?? "",
    sort: sort as RecipeTableSortKey | null,
    ord,
  }
}

export function mergeRecipesWorkspaceUrl(
  current: URLSearchParams,
  patch: Partial<RecipesWorkspaceUrlState>,
): URLSearchParams {
  const next = new URLSearchParams(current.toString())
  const merged = { ...parseRecipesWorkspaceUrl(current), ...patch }

  if (merged.q) next.set("q", merged.q)
  else next.delete("q")

  if (merged.page > 1) next.set("page", String(merged.page))
  else next.delete("page")

  if (merged.pageSize !== DEFAULT_RECIPE_TABLE_PAGE_SIZE) {
    next.set("ps", String(merged.pageSize))
  } else {
    next.delete("ps")
  }

  if (merged.soloActivos) next.set("solo", "1")
  else next.delete("solo")

  if (merged.categoryId) next.set("cat", merged.categoryId)
  else next.delete("cat")

  appendWorkspaceTableSortParams(next, {
    sort: merged.sort,
    ord: merged.ord,
  })

  if (
    patch.page === undefined &&
    (patch.q !== undefined ||
      patch.soloActivos !== undefined ||
      patch.categoryId !== undefined ||
      patch.sort !== undefined ||
      patch.ord !== undefined)
  ) {
    if (merged.page !== 1) next.set("page", "1")
    else next.delete("page")
  }

  return next
}

export { RECIPE_TABLE_PAGE_SIZES, DEFAULT_RECIPE_TABLE_PAGE_SIZE }
