import type { SaleCatalogArticle } from "@/app/[siteId]/[popId]/sale/actions"
import type { ArticleListItem } from "@/lib/rootsyApi/articlesClient"
import type { ArticleDiscountMode } from "@/lib/articleDiscount"
import {
  articleHasCatalogDiscount,
  effectiveArticleSalePrice,
  isArticleDiscountMode,
} from "@/lib/articleDiscount"
import { articleListItemToSnapshot } from "@/lib/popLocalDb/mapArticle"
import type { ArticleSnapshot } from "@/lib/popLocalDb/types"

export const SALE_CATALOG_ARTICLE_SELECT = `
  id,
  name,
  description,
  sale_price,
  iva,
  discount_mode,
  discount_value,
  category_id,
  unit_of_measure,
  image_url,
  barcode,
  categories ( id, name )
` as const

export function mapSaleCatalogArticleRow(
  row: Record<string, unknown>,
  listPriceOverride?: number,
): SaleCatalogArticle {
  const cat = row.categories as unknown as { name?: string } | null
  const principal = Number(row.sale_price ?? 0) || 0
  const listPrice =
    listPriceOverride != null && Number.isFinite(listPriceOverride)
      ? listPriceOverride
      : principal
  const rawDiscountMode = row.discount_mode
  const discountMode: ArticleDiscountMode | null =
    typeof rawDiscountMode === "string" && isArticleDiscountMode(rawDiscountMode)
      ? rawDiscountMode
      : null
  const discountRaw = row.discount_value
  const discountValue =
    discountRaw != null && Number.isFinite(Number(discountRaw))
      ? Number(discountRaw)
      : null
  const hasDiscount = articleHasCatalogDiscount(discountMode, discountValue)
  const effectivePrice = effectiveArticleSalePrice(
    listPrice,
    discountMode,
    discountValue,
  )
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    salePrice: effectivePrice,
    originalSalePrice: hasDiscount ? listPrice : undefined,
    discountMode: hasDiscount ? discountMode : null,
    discountValue: hasDiscount ? discountValue : null,
    iva: Number(row.iva ?? 0) || 0,
    categoryId: String(row.category_id ?? ""),
    categoryName: cat?.name ? String(cat.name) : "—",
    unitOfMeasure: String(row.unit_of_measure ?? "unidad"),
    imageUrl:
      typeof row.image_url === "string" && row.image_url.trim()
        ? row.image_url.trim()
        : null,
    barcode:
      row.barcode != null && String(row.barcode).trim()
        ? String(row.barcode).trim()
        : null,
    stockOnHand:
      row.stock_on_hand != null && Number.isFinite(Number(row.stock_on_hand))
        ? Number(row.stock_on_hand)
        : row.stockOnHand != null && Number.isFinite(Number(row.stockOnHand))
          ? Number(row.stockOnHand)
          : undefined,
    allowNegativeStock:
      row.allow_negative_stock === true ||
      row.allow_negative_stock === 1 ||
      row.allow_negative_stock === "1" ||
      row.allowNegativeStock === true,
  }
}

export function articleSnapshotToSaleCatalogArticle(
  row: ArticleSnapshot,
  priceListId?: string,
): SaleCatalogArticle {
  const principal = Number(row.salePrice ?? 0) || 0
  const override =
    priceListId && priceListId !== "principal"
      ? row.listPrices.find((price) => price.listId === priceListId)?.amount
      : undefined
  const listPrice =
    override != null && Number.isFinite(override) ? override : principal
  const hasDiscount = articleHasCatalogDiscount(
    row.discountMode,
    row.discountValue,
  )
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    salePrice: effectiveArticleSalePrice(
      listPrice,
      row.discountMode,
      row.discountValue,
    ),
    originalSalePrice: hasDiscount ? listPrice : undefined,
    discountMode: hasDiscount ? row.discountMode : null,
    discountValue: hasDiscount ? row.discountValue : null,
    iva: row.iva,
    categoryId: row.categoryId,
    categoryName: row.categoryName.trim() ? row.categoryName : "—",
    unitOfMeasure: row.unitOfMeasure,
    imageUrl: row.imageUrl,
    barcode: row.barcode,
    stockOnHand: row.stockOnHand,
    allowNegativeStock: row.allowNegativeStock,
  }
}

export function articleListItemToSaleCatalogArticle(
  row: ArticleListItem,
  priceListId?: string,
): SaleCatalogArticle {
  return articleSnapshotToSaleCatalogArticle(
    articleListItemToSnapshot(row),
    priceListId,
  )
}
