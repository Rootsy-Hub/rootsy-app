import {
  isArticleItemKind,
  type ArticleItemKind,
} from "@/lib/articleItemKind"
import { saleQuantityFromCostPurchase } from "@/lib/articleCosts"

export type PurchaseKind =
  | "merchandise"
  | "raw_material"
  | "supply"
  | "mixed"

export const PURCHASE_KIND_LABEL: Record<PurchaseKind, string> = {
  merchandise: "Mercadería",
  raw_material: "Materia prima",
  supply: "Insumo",
  mixed: "Mixta",
}

export function isPurchaseKind(value: string): value is PurchaseKind {
  return (
    value === "merchandise" ||
    value === "raw_material" ||
    value === "supply" ||
    value === "mixed"
  )
}

export function purchaseKindLabel(kind: string): string {
  if (isPurchaseKind(kind)) return PURCHASE_KIND_LABEL[kind]
  return kind
}

export function derivePurchaseKindFromItemKinds(
  kinds: readonly ArticleItemKind[],
): PurchaseKind {
  const unique = [...new Set(kinds.filter(isArticleItemKind))]
  if (unique.length === 0) return "merchandise"
  if (unique.length === 1) return unique[0]!
  return "mixed"
}

export function derivePurchaseKindFromCartItems(
  cart: Array<{ productoId: string; articleCostId: string; cantidad: number }>,
  articles: Array<{
    id: string
    itemKind: ArticleItemKind
    costs: Array<{ id: string; saleUnitsPerCostUnit: number }>
  }>,
): PurchaseKind {
  const kinds: ArticleItemKind[] = []
  for (const item of cart) {
    const article = articles.find((a) => a.id === item.productoId)
    const cost = article?.costs.find((c) => c.id === item.articleCostId)
    if (!article || !cost) continue
    const saleQty = saleQuantityFromCostPurchase(
      item.cantidad,
      cost.saleUnitsPerCostUnit,
    )
    if (saleQty <= 0) continue
    kinds.push(article.itemKind)
  }
  return derivePurchaseKindFromItemKinds(kinds)
}
