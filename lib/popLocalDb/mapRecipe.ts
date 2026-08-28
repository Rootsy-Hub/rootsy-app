import type { MenuCatalogRecipe } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import type { RecipeTableRow } from "@/app/[siteId]/[popId]/recipes/actions"
import type { SqlParams } from "@/lib/popLocalDb/database"
import type { ArticleListPriceSnap, RecipeSnapshot } from "@/lib/popLocalDb/types"

type SqlRecipeRow = {
  id: unknown
  name: unknown
  description: unknown
  image_url: unknown
  category_id: unknown
  category_name: unknown
  sale_price: unknown
  iva: unknown
  is_active: unknown
  allow_negative_stock: unknown
  station_id: unknown
  list_prices: unknown
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : value == null ? fallback : String(value)
}

function asNullableString(value: unknown): string | null {
  const text = asString(value).trim()
  return text ? text : null
}

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function asBool(value: unknown): boolean {
  return value === 1 || value === true || value === "1"
}

function parseListPrices(raw: unknown): ArticleListPriceSnap[] {
  if (Array.isArray(raw)) {
    return raw.flatMap((row) => {
      if (!row || typeof row !== "object") return []
      const item = row as { listId?: unknown; amount?: unknown }
      const listId = asString(item.listId)
      const amount = Number(item.amount)
      if (!listId || !Number.isFinite(amount)) return []
      return [{ listId, amount }]
    })
  }
  if (typeof raw !== "string" || !raw.trim()) return []
  try {
    return parseListPrices(JSON.parse(raw) as unknown)
  } catch {
    return []
  }
}

export type RecipeDumpRow = Pick<
  RecipeTableRow,
  | "id"
  | "name"
  | "description"
  | "imageUrl"
  | "categoryId"
  | "categoryName"
  | "salePrice"
  | "iva"
  | "isActive"
  | "allowNegativeStock"
> & {
  stationId?: string | null
  listPrices?: ArticleListPriceSnap[]
}

export function recipeSnapshotToMenuCatalogRecipe(
  row: RecipeSnapshot,
  priceListId?: string,
): MenuCatalogRecipe {
  const principal = Number(row.salePrice) || 0
  const override =
    priceListId && priceListId !== "principal"
      ? row.listPrices.find((price) => price.listId === priceListId)?.amount
      : undefined
  const salePrice =
    override != null && Number.isFinite(override) ? override : principal
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    salePrice,
    iva: row.iva,
    categoryId: row.categoryId,
    categoryName: row.categoryName.trim() ? row.categoryName : "—",
    imageUrl: row.imageUrl,
    stationId: row.stationId,
  }
}

export function recipeDumpRowToSnapshot(
  row: RecipeDumpRow,
  stationId: string | null = null,
): RecipeSnapshot {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    imageUrl: row.imageUrl,
    categoryId: row.categoryId ?? "",
    categoryName: row.categoryName ?? "",
    salePrice: Number(row.salePrice) || 0,
    iva: Number(row.iva) || 0,
    isActive: row.isActive !== false,
    allowNegativeStock: Boolean(row.allowNegativeStock),
    stationId: row.stationId ?? stationId,
    listPrices: row.listPrices ?? [],
  }
}

export function sqlRecipeRowToSnapshot(row: SqlRecipeRow): RecipeSnapshot {
  return {
    id: asString(row.id),
    name: asString(row.name),
    description: asString(row.description),
    imageUrl: asNullableString(row.image_url),
    categoryId: asString(row.category_id),
    categoryName: asString(row.category_name),
    salePrice: asNumber(row.sale_price),
    iva: asNumber(row.iva),
    isActive: asBool(row.is_active),
    allowNegativeStock: asBool(row.allow_negative_stock),
    stationId: asNullableString(row.station_id),
    listPrices: parseListPrices(row.list_prices),
  }
}

export function recipeSnapshotBindValues(
  row: RecipeSnapshot,
  updatedAt = new Date().toISOString(),
): SqlParams {
  return [
    row.id,
    row.name,
    row.description,
    row.imageUrl,
    row.categoryId,
    row.categoryName,
    row.salePrice,
    row.iva,
    row.isActive ? 1 : 0,
    row.allowNegativeStock ? 1 : 0,
    row.stationId,
    JSON.stringify(row.listPrices),
    updatedAt,
  ]
}
