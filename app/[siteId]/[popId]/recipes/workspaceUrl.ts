import {
  DEFAULT_RECIPE_TABLE_PAGE_SIZE,
  RECIPE_TABLE_PAGE_SIZES,
} from "@/app/[siteId]/[popId]/recipes/recipeConstants"

export type RecipeWorkspaceView = "list"

export type RecipeTablePageSize = (typeof RECIPE_TABLE_PAGE_SIZES)[number]

export type RecipesWorkspaceUrlState = {
  view: RecipeWorkspaceView
  q: string
  page: number
  pageSize: RecipeTablePageSize
  soloActivos: boolean
  categoryId: string
}

const DEFAULTS: RecipesWorkspaceUrlState = {
  view: "list",
  q: "",
  page: 1,
  pageSize: DEFAULT_RECIPE_TABLE_PAGE_SIZE,
  soloActivos: false,
  categoryId: "",
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
  return {
    view: "list",
    q: params.get("q")?.trim() ?? "",
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1,
    pageSize: parsePageSize(params.get("ps")),
    soloActivos: params.get("solo") === "1",
    categoryId: params.get("cat")?.trim() ?? "",
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

  return next
}

export { RECIPE_TABLE_PAGE_SIZES, DEFAULT_RECIPE_TABLE_PAGE_SIZE }
