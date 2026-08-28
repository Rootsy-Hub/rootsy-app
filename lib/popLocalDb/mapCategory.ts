import type { ArticleCategoryOption } from "@/app/[siteId]/[popId]/articles/actions"
import { isArticleItemKind } from "@/lib/articleItemKind"
import type { SqlParams } from "@/lib/popLocalDb/database"
import type { CategorySnapshot } from "@/lib/popLocalDb/types"

type SqlCategoryRow = {
  id: unknown
  name: unknown
  item_kind: unknown
  sort_order: unknown
  show_in_sale: unknown
  visible: unknown
  show_in_menu: unknown
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : value == null ? fallback : String(value)
}

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function asBool(value: unknown, fallback = true): boolean {
  if (value == null) return fallback
  return value === 1 || value === true || value === "1"
}

export type CategoryDto = {
  id: string
  name: string
  itemKind: string
  sortOrder: number
  showInSale?: boolean
  visible?: boolean
  showInMenu?: boolean
}

export function dtoToCategorySnapshot(row: CategoryDto): CategorySnapshot {
  const itemKindRaw = row.itemKind
  return {
    id: row.id,
    name: row.name,
    itemKind: isArticleItemKind(itemKindRaw) ? itemKindRaw : "merchandise",
    sortOrder: Number.isFinite(row.sortOrder) ? row.sortOrder : 0,
    showInSale: row.showInSale !== false,
    visible: row.visible !== false,
    showInMenu: row.showInMenu !== false,
  }
}

export function categorySnapshotToOption(
  row: CategorySnapshot,
): ArticleCategoryOption {
  return {
    id: row.id,
    name: row.name,
    itemKind: row.itemKind,
    sortOrder: row.sortOrder,
    showInSale: row.showInSale,
  }
}

export function sqlCategoryRowToSnapshot(row: SqlCategoryRow): CategorySnapshot {
  const itemKindRaw = asString(row.item_kind, "merchandise")
  return {
    id: asString(row.id),
    name: asString(row.name),
    itemKind: isArticleItemKind(itemKindRaw) ? itemKindRaw : "merchandise",
    sortOrder: asNumber(row.sort_order),
    showInSale: asBool(row.show_in_sale, true),
    visible: asBool(row.visible, true),
    showInMenu: asBool(row.show_in_menu, true),
  }
}

export function categorySnapshotBindValues(
  row: CategorySnapshot,
  updatedAt = new Date().toISOString(),
): SqlParams {
  return [
    row.id,
    row.name,
    row.itemKind,
    row.sortOrder,
    row.showInSale ? 1 : 0,
    row.visible ? 1 : 0,
    row.showInMenu ? 1 : 0,
    updatedAt,
  ]
}
