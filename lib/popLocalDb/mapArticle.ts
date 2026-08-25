import type { ArticleListItem } from "@/lib/rootsyApi/articlesClient"
import { isArticleDiscountMode } from "@/lib/articleDiscount"
import { isArticleItemKind } from "@/lib/articleItemKind"
import type { SqlParams } from "@/lib/popLocalDb/database"
import type { ArticleSnapshot } from "@/lib/popLocalDb/types"

type SqlArticleRow = {
  id: unknown
  name: unknown
  description: unknown
  image_url: unknown
  barcode: unknown
  sku: unknown
  item_kind: unknown
  category_id: unknown
  category_name: unknown
  sale_price: unknown
  iva: unknown
  discount_mode: unknown
  discount_value: unknown
  unit_of_measure: unknown
  is_sellable: unknown
  is_active: unknown
  allow_negative_stock: unknown
  stock_on_hand: unknown
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

function asNullableNumber(value: unknown): number | null {
  if (value == null || value === "") return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function asBool(value: unknown): boolean {
  return value === 1 || value === true || value === "1"
}

function parseListPrices(raw: unknown): ArticleSnapshot["listPrices"] {
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

export function articleListItemToSnapshot(row: ArticleListItem): ArticleSnapshot {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    imageUrl: row.imageUrl,
    barcode: row.barcode,
    sku: row.sku,
    itemKind: row.itemKind,
    categoryId: row.categoryId ?? "",
    categoryName: row.categoryName ?? "",
    salePrice: Number(row.salePrice) || 0,
    iva: Number(row.iva) || 0,
    discountMode: row.discountMode,
    discountValue: row.discountValue,
    unitOfMeasure: row.unitOfMeasure || "unidad",
    isSellable: row.isSellable,
    isActive: row.isActive,
    allowNegativeStock: row.allowNegativeStock,
    stockOnHand: Number(row.stockOnHand) || 0,
    listPrices: (row.listPrices ?? []).map((price) => ({
      listId: price.listId,
      amount: price.amount,
    })),
  }
}

export function sqlArticleRowToSnapshot(row: SqlArticleRow): ArticleSnapshot | null {
  const itemKindRaw = asString(row.item_kind)
  if (!isArticleItemKind(itemKindRaw)) return null
  const discountRaw = asNullableString(row.discount_mode)
  return {
    id: asString(row.id),
    name: asString(row.name),
    description: asString(row.description),
    imageUrl: asNullableString(row.image_url),
    barcode: asNullableString(row.barcode),
    sku: asNullableString(row.sku),
    itemKind: itemKindRaw,
    categoryId: asString(row.category_id),
    categoryName: asString(row.category_name),
    salePrice: asNumber(row.sale_price),
    iva: asNumber(row.iva),
    discountMode:
      discountRaw && isArticleDiscountMode(discountRaw) ? discountRaw : null,
    discountValue: asNullableNumber(row.discount_value),
    unitOfMeasure: asString(row.unit_of_measure, "unidad"),
    isSellable: asBool(row.is_sellable),
    isActive: asBool(row.is_active),
    allowNegativeStock: asBool(row.allow_negative_stock),
    stockOnHand: asNumber(row.stock_on_hand),
    listPrices: parseListPrices(row.list_prices),
  }
}

export function articleSnapshotBindValues(
  row: ArticleSnapshot,
  updatedAt: string,
): SqlParams {
  return [
    row.id,
    row.name,
    row.description,
    row.imageUrl,
    row.barcode,
    row.sku,
    row.itemKind,
    row.categoryId,
    row.categoryName,
    row.salePrice,
    row.iva,
    row.discountMode,
    row.discountValue,
    row.unitOfMeasure,
    row.isSellable ? 1 : 0,
    row.isActive ? 1 : 0,
    row.allowNegativeStock ? 1 : 0,
    row.stockOnHand,
    JSON.stringify(row.listPrices),
    updatedAt,
  ]
}
