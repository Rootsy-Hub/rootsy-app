import type {
  CreateRecipeInput,
  GetPopRecipesTableInput,
  RecipeDetail,
  RecipeIngredientOption,
  RecipeTableRow,
  UpdateRecipeInput,
} from "@/app/[siteId]/[popId]/recipes/actions"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string; redirect?: string }

export type RecipeListItem = RecipeTableRow

export type PopRecipesTableResult =
  | {
      success: true
      recipes: RecipeListItem[]
      totalCount: number
      page: number
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
    }
  | {
      success: false
      error: string
      redirect?: string
      recipes: RecipeListItem[]
      totalCount: number
      page: number
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
    }

type RecipeListData = {
  recipes: RecipeListItem[]
  totalCount: number
  page: number
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

const EMPTY_TABLE: Omit<
  Extract<PopRecipesTableResult, { success: false }>,
  "success" | "error" | "redirect"
> = {
  recipes: [],
  totalCount: 0,
  page: 1,
  canCreate: false,
  canUpdate: false,
  canDelete: false,
}

export function buildRecipesListSearch(input: GetPopRecipesTableInput): string {
  const params = new URLSearchParams()
  if (input.page) params.set("page", String(input.page))
  if (input.pageSize) params.set("pageSize", String(input.pageSize))
  const q = input.q?.trim() ?? ""
  if (q) params.set("q", q)
  if (input.soloActivos) params.set("soloActivos", "true")
  if (input.categoryId?.trim()) params.set("categoryId", input.categoryId.trim())
  if (input.sort) params.set("sort", input.sort)
  if (input.ord && input.ord !== "asc") params.set("ord", input.ord)
  return params.toString()
}

function emptyError(error: string, redirect?: string): PopRecipesTableResult {
  return { success: false, error, redirect, ...EMPTY_TABLE }
}

export async function fetchPopRecipesTable(
  popId: string,
  input: GetPopRecipesTableInput,
): Promise<PopRecipesTableResult> {
  const search = buildRecipesListSearch(input)
  const res = await fetch(`/api/pops/${popId}/recipes?${search}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<RecipeListData>
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

export async function fetchPopRecipe(
  popId: string,
  recipeId: string,
): Promise<RecipeDetail> {
  const res = await fetch(`/api/pops/${popId}/recipes/${recipeId}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<RecipeDetail>
    | ApiErr
    | null
  if (!res.ok || !json || !("success" in json) || !json.success) {
    const error = json && "error" in json ? json.error : `HTTP ${res.status}`
    throw new Error(error || "No se pudo cargar la receta")
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

export async function createPopRecipe(
  popId: string,
  input: CreateRecipeInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/recipes`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseMutate(res)
}

export async function updatePopRecipe(
  popId: string,
  recipeId: string,
  input: UpdateRecipeInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/recipes/${recipeId}`, {
    method: "PATCH",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseMutate(res)
}

export async function deletePopRecipe(
  popId: string,
  recipeId: string,
  confirmationTyped: string,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/recipes/${recipeId}`, {
    method: "DELETE",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ confirmationTyped }),
  })
  return parseMutate(res)
}

export async function uploadRecipeImage(
  popId: string,
  formData: FormData,
): Promise<
  { success: true; imageUrl: string } | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/recipes/image`, {
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

export async function searchRecipeIngredientOptions(
  popId: string,
  query: string,
  excludeIds: string[] = [],
): Promise<
  | { success: true; ingredients: RecipeIngredientOption[] }
  | { success: false; error: string }
> {
  const params = new URLSearchParams()
  const q = query.trim()
  if (q) params.set("q", q)
  if (excludeIds.length > 0) params.set("exclude", excludeIds.join(","))
  const res = await fetch(`/api/pops/${popId}/recipes/ingredients?${params}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<RecipeIngredientOption[]>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, ingredients: json.data }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function getRecipeIngredientOptionsByIds(
  popId: string,
  articleIds: string[],
): Promise<
  | { success: true; ingredients: RecipeIngredientOption[] }
  | { success: false; error: string }
> {
  const ids = [...new Set(articleIds.map((id) => id.trim()).filter(Boolean))]
  if (ids.length === 0) return { success: true, ingredients: [] }
  const params = new URLSearchParams()
  params.set("ids", ids.join(","))
  const res = await fetch(`/api/pops/${popId}/recipes/ingredients?${params}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<RecipeIngredientOption[]>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, ingredients: json.data }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}
