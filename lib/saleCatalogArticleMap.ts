import type { SaleCatalogArticle } from "@/app/[siteId]/[popId]/sale/actions"
import type { ArticleDiscountMode } from "@/lib/articleDiscount"
import {
  articleHasCatalogDiscount,
  effectiveArticleSalePrice,
  isArticleDiscountMode,
} from "@/lib/articleDiscount"

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
): SaleCatalogArticle {
  const cat = row.categories as unknown as { name?: string } | null
  const listPrice = Number(row.sale_price ?? 0) || 0
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
  }
}
