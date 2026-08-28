import type { ArticleCategoryOption } from "@/app/[siteId]/[popId]/articles/actions"
import { isArticleItemKind } from "@/lib/articleItemKind"
import type { CategorySnapshot } from "@/lib/popLocalDb/types"

export type CategoryRealtimePatch = {
  id: string
  name?: string
  itemKind?: string
  sortOrder?: number
  showInSale?: boolean
  visible?: boolean
  showInMenu?: boolean
}

export function categoryPatchFromRealtimePayload(
  payload: Record<string, unknown>,
): CategoryRealtimePatch | null {
  const raw = payload.category
  const idFromPayload =
    typeof payload.categoryId === "string" ? payload.categoryId.trim() : ""
  if (!raw || typeof raw !== "object") {
    return idFromPayload ? { id: idFromPayload } : null
  }
  const row = raw as Record<string, unknown>
  const id =
    typeof row.id === "string" && row.id.trim() ? row.id.trim() : idFromPayload
  if (!id) return null
  return {
    id,
    name: typeof row.name === "string" ? row.name : undefined,
    itemKind: typeof row.itemKind === "string" ? row.itemKind : undefined,
    sortOrder:
      typeof row.sortOrder === "number" && Number.isFinite(row.sortOrder)
        ? row.sortOrder
        : undefined,
    showInSale: typeof row.showInSale === "boolean" ? row.showInSale : undefined,
    visible: typeof row.visible === "boolean" ? row.visible : undefined,
    showInMenu: typeof row.showInMenu === "boolean" ? row.showInMenu : undefined,
  }
}

export function categorySnapshotFromPatch(
  patch: CategoryRealtimePatch,
  existing: CategorySnapshot | null,
): CategorySnapshot | null {
  const name = patch.name?.trim() || existing?.name.trim() || ""
  if (!name) return null
  const itemKindRaw = patch.itemKind ?? existing?.itemKind ?? "merchandise"
  return {
    id: patch.id,
    name,
    itemKind: isArticleItemKind(itemKindRaw)
      ? itemKindRaw
      : (existing?.itemKind ?? "merchandise"),
    sortOrder: patch.sortOrder ?? existing?.sortOrder ?? 0,
    showInSale: patch.showInSale ?? existing?.showInSale ?? true,
    visible: patch.visible ?? existing?.visible ?? true,
    showInMenu: patch.showInMenu ?? existing?.showInMenu ?? true,
  }
}

export function applyCategoryPatchToSaleBoard(
  rows: ArticleCategoryOption[],
  patch: CategoryRealtimePatch,
  type: "categories.created" | "categories.updated" | "categories.deleted",
): ArticleCategoryOption[] | "invalidate" {
  if (type === "categories.deleted") {
    return rows.filter((row) => row.id !== patch.id)
  }
  const existing = rows.find((row) => row.id === patch.id)
  const showInSale = patch.showInSale ?? existing?.showInSale ?? true
  const itemKind = patch.itemKind ?? existing?.itemKind
  const onSaleBoard =
    showInSale &&
    (itemKind == null || (isArticleItemKind(itemKind) && itemKind === "merchandise"))

  if (!onSaleBoard) return rows.filter((row) => row.id !== patch.id)

  const name = patch.name ?? existing?.name
  if (!name) return "invalidate"

  const next: ArticleCategoryOption = {
    id: patch.id,
    name,
    itemKind:
      itemKind && isArticleItemKind(itemKind) ? itemKind : "merchandise",
    sortOrder: patch.sortOrder ?? existing?.sortOrder ?? 0,
    showInSale: true,
  }
  const without = rows.filter((row) => row.id !== patch.id)
  without.push(next)
  without.sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "es"),
  )
  return without
}
