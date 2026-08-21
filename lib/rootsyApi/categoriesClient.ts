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

export async function fetchPopArticleCategories(
  popId: string,
): Promise<ArticleCategoryOption[]> {
  const res = await fetch(`/api/pops/${popId}/categories`, {
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
