import type { RecipeCategoryOption } from "@/app/[siteId]/[popId]/recipes/actions"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }

type CategoryDto = {
  id: string
  name: string
  sortOrder: number
  showInMenu: boolean
  isActive: boolean
  stationId: string | null
  stationName?: string | null
}

function mapCategory(row: CategoryDto): RecipeCategoryOption {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sortOrder,
    showInMenu: row.showInMenu !== false,
    isActive: row.isActive !== false,
    stationId: row.stationId,
    stationName: row.stationName ?? null,
  }
}

type MutateResult = { success: true } | { success: false; error: string }

async function parseMutate(res: Response): Promise<MutateResult> {
  const json = (await res.json().catch(() => null)) as
    | ApiOk<unknown>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true }
  }
  return {
    success: false,
    error: json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function fetchPopRecipeCategories(
  popId: string,
): Promise<RecipeCategoryOption[]> {
  const res = await fetch(`/api/pops/${popId}/recipe-categories`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<CategoryDto[]>
    | ApiErr
    | null
  if (!res.ok || !json || !("success" in json) || !json.success) {
    const error = json && "error" in json ? json.error : `HTTP ${res.status}`
    throw new Error(error || "No se pudieron cargar las categorías")
  }
  return json.data.map(mapCategory)
}

export async function createPopRecipeCategory(
  popId: string,
  name: string,
  stationId: string | null = null,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/recipe-categories`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ name, stationId }),
  })
  return parseMutate(res)
}

export async function updatePopRecipeCategory(
  popId: string,
  categoryId: string,
  name: string,
  stationId?: string | null,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/recipe-categories/${categoryId}`, {
    method: "PATCH",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      ...(stationId !== undefined ? { stationId } : {}),
    }),
  })
  return parseMutate(res)
}

export async function deletePopRecipeCategory(
  popId: string,
  categoryId: string,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/recipe-categories/${categoryId}`, {
    method: "DELETE",
    headers: { accept: "application/json" },
  })
  return parseMutate(res)
}

export async function syncPopRecipeCategoryLayout(
  popId: string,
  updates: { id: string; sortOrder: number; showInMenu: boolean }[],
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/recipe-categories/layout`, {
    method: "PATCH",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ updates }),
  })
  return parseMutate(res)
}

export async function fetchPopRecipeCategoryCount(
  popId: string,
  categoryId: string,
): Promise<{ success: true; count: number } | { success: false; error: string }> {
  const res = await fetch(`/api/pops/${popId}/recipe-categories/${categoryId}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<CategoryDto & { recipeCount?: number }>
    | ApiErr
    | null
  if (!res.ok || !json || !("success" in json) || !json.success) {
    return {
      success: false,
      error: json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
    }
  }
  return { success: true, count: json.data.recipeCount ?? 0 }
}
