import type { ArticleCategoryOption } from "@/app/[siteId]/[popId]/articles/actions"
import type { ArticleItemKind } from "@/lib/articleItemKind"
import { isArticleItemKind } from "@/lib/articleItemKind"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }

type CategoryDto = {
  id: string
  name: string
  itemKind: string
  sortOrder: number
  showInSale: boolean
}

function mapCategory(row: CategoryDto): ArticleCategoryOption {
  return {
    id: row.id,
    name: row.name,
    itemKind: isArticleItemKind(row.itemKind)
      ? row.itemKind
      : ("merchandise" as ArticleItemKind),
    sortOrder: row.sortOrder,
    showInSale: row.showInSale !== false,
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

export async function fetchPopArticleCategories(
  popId: string,
  filters?: { itemKind?: ArticleItemKind; showInSale?: boolean },
): Promise<ArticleCategoryOption[]> {
  const params = new URLSearchParams()
  if (filters?.itemKind) params.set("itemKind", filters.itemKind)
  if (filters?.showInSale != null) {
    params.set("showInSale", filters.showInSale ? "true" : "false")
  }
  const search = params.toString()
  const res = await fetch(
    `/api/pops/${popId}/categories${search ? `?${search}` : ""}`,
    { headers: { accept: "application/json" } },
  )
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

export async function createPopArticleCategory(
  popId: string,
  input: { name: string; itemKind?: ArticleItemKind; sortOrder?: number },
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/categories`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      itemKind: input.itemKind ?? "merchandise",
      showInSale: true,
      sortOrder: input.sortOrder,
    }),
  })
  return parseMutate(res)
}

export async function updatePopArticleCategory(
  popId: string,
  categoryId: string,
  input: { name: string },
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/categories/${categoryId}`, {
    method: "PATCH",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ name: input.name }),
  })
  return parseMutate(res)
}

export async function deletePopArticleCategory(
  popId: string,
  categoryId: string,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/categories/${categoryId}`, {
    method: "DELETE",
    headers: { accept: "application/json" },
  })
  return parseMutate(res)
}

export async function syncPopArticleCategoryLayout(
  popId: string,
  updates: { id: string; sortOrder: number; showInSale: boolean }[],
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/categories/layout`, {
    method: "PATCH",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ updates }),
  })
  return parseMutate(res)
}

export async function fetchPopArticleCategoryCount(
  popId: string,
  categoryId: string,
): Promise<{ success: true; count: number } | { success: false; error: string }> {
  const res = await fetch(`/api/pops/${popId}/categories/${categoryId}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<CategoryDto & { articleCount?: number }>
    | ApiErr
    | null
  if (!res.ok || !json || !("success" in json) || !json.success) {
    return {
      success: false,
      error: json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
    }
  }
  return { success: true, count: json.data.articleCount ?? 0 }
}
