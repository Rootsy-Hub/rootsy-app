import { isArticleDiscountMode } from "@/lib/articleDiscount"
import { isArticleItemKind } from "@/lib/articleItemKind"
import type { ArticleSnapshot } from "@/lib/popLocalDb/types"

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

function asBool(value: unknown, fallback = false): boolean {
  if (value == null) return fallback
  return value === 1 || value === true || value === "1"
}

function parseListPrices(raw: unknown): ArticleSnapshot["listPrices"] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((row) => {
    if (!row || typeof row !== "object") return []
    const item = row as { listId?: unknown; amount?: unknown }
    const listId = asString(item.listId).trim()
    const amount = Number(item.amount)
    if (!listId || !Number.isFinite(amount)) return []
    return [{ listId, amount }]
  })
}

export function articleSnapshotFromRealtimePayload(
  raw: unknown,
): ArticleSnapshot | null {
  if (!raw || typeof raw !== "object") return null
  const row = raw as Record<string, unknown>
  const id = asString(row.id).trim()
  const name = asString(row.name).trim()
  if (!id || !name) return null
  const itemKindRaw = asString(row.itemKind, "merchandise")
  const itemKind = isArticleItemKind(itemKindRaw) ? itemKindRaw : "merchandise"
  const discountRaw = asNullableString(row.discountMode)
  return {
    id,
    name,
    description: asString(row.description),
    imageUrl: asNullableString(row.imageUrl),
    barcode: asNullableString(row.barcode),
    sku: asNullableString(row.sku),
    itemKind,
    categoryId: asString(row.categoryId),
    categoryName: asString(row.categoryName),
    salePrice: asNumber(row.salePrice),
    iva: asNumber(row.iva),
    discountMode:
      discountRaw && isArticleDiscountMode(discountRaw) ? discountRaw : null,
    discountValue: asNullableNumber(row.discountValue),
    unitOfMeasure: asString(row.unitOfMeasure, "unidad") || "unidad",
    isSellable: asBool(row.isSellable, true),
    isActive: asBool(row.isActive, true),
    allowNegativeStock: asBool(row.allowNegativeStock, false),
    stockOnHand: 0,
    listPrices: parseListPrices(row.listPrices),
  }
}

export function articleIdFromRealtimeEvent(payload: Record<string, unknown>) {
  if (typeof payload.articleId === "string" && payload.articleId.trim()) {
    return payload.articleId.trim()
  }
  const article = payload.article
  if (article && typeof article === "object" && "id" in article) {
    const id = (article as { id?: unknown }).id
    if (typeof id === "string" && id.trim()) return id.trim()
  }
  return null
}
