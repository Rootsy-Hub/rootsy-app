import type { PromotionCartSelection } from "@/lib/promotionPricing"

export type MenuCartItemKind = "article" | "recipe" | "promotion"

export type MenuCartItem = {
  productoId: string
  cantidad: number
  kind?: MenuCartItemKind
  promotionSelections?: PromotionCartSelection[]
}

export function normalizeCartItemKind(
  kind: string | undefined | null,
): MenuCartItemKind {
  if (kind === "recipe") return "recipe"
  if (kind === "promotion") return "promotion"
  return "article"
}

export function cartItemKey(item: MenuCartItem): string {
  const kind = normalizeCartItemKind(item.kind)
  if (kind === "promotion") {
    const selKey =
      item.promotionSelections?.length
        ? item.promotionSelections
            .slice()
            .sort((a, b) => a.slotId.localeCompare(b.slotId))
            .map(
              (s) =>
                `${s.slotId}:${s.kind}:${s.refId}:${s.slotQuantity}`,
            )
            .join("|")
        : "pending"
    return `promotion:${item.productoId}:${selKey}`
  }
  return `${kind}:${item.productoId}`
}

export function cartItemsMatch(
  a: MenuCartItem,
  productoId: string,
  kind?: MenuCartItemKind,
  promotionSelections?: PromotionCartSelection[],
): boolean {
  const normalized = normalizeCartItemKind(kind ?? a.kind)
  if (normalized === "promotion") {
    if (a.productoId !== productoId || normalizeCartItemKind(a.kind) !== "promotion") {
      return false
    }
    const aKey =
      a.promotionSelections
        ?.slice()
        .sort((x, y) => x.slotId.localeCompare(y.slotId))
        .map(
          (s) =>
            `${s.slotId}:${s.kind}:${s.refId}:${s.slotQuantity}`,
        )
        .join("|") ?? ""
    const bKey =
      promotionSelections
        ?.slice()
        .sort((x, y) => x.slotId.localeCompare(y.slotId))
        .map(
          (s) =>
            `${s.slotId}:${s.kind}:${s.refId}:${s.slotQuantity}`,
        )
        .join("|") ?? ""
    return aKey === bKey
  }
  return (
    a.productoId === productoId &&
    normalizeCartItemKind(a.kind) === normalized
  )
}
