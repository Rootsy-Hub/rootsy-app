import type { TableSessionCheckoutSnapshot } from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"
import { roundSaleMoney } from "@/lib/saleLineDiscount"
import type { SaleQuoteLineGroup } from "@/lib/saleQuoteTypes"

export type UnresolvedQuoteCartItem = {
  name: string
  quantity: number
  amount: number | null
}

function lineKey(name: string): string {
  return name.trim().toLowerCase()
}

export function quoteVisibleLinesNetTotal(groups: SaleQuoteLineGroup[]): number {
  return roundSaleMoney(
    groups.reduce((sum, group) => {
      const lines = group.lines.reduce((acc, line) => acc + line.lineTotal, 0)
      return sum + lines - (group.promotionDiscount?.amount ?? 0)
    }, 0),
  )
}

export function quoteStoredAmountGap(
  groups: SaleQuoteLineGroup[],
  storedSubtotal: number,
): number {
  return roundSaleMoney(
    Math.max(0, storedSubtotal - quoteVisibleLinesNetTotal(groups)),
  )
}

function consumeDisplayedLine(
  leftover: { key: string }[],
  key: string | null,
): boolean {
  if (key) {
    const index = leftover.findIndex((line) => line.key === key)
    if (index >= 0) {
      leftover.splice(index, 1)
      return true
    }
    return false
  }
  if (leftover.length === 0) return false
  leftover.shift()
  return true
}

export function unresolvedQuoteCartItems(
  snapshot: TableSessionCheckoutSnapshot | null | undefined,
  groups: SaleQuoteLineGroup[],
): UnresolvedQuoteCartItem[] {
  const leftover = groups.flatMap((group) =>
    group.lines
      .map((line) => ({ key: lineKey(line.name) }))
      .filter((line) => line.key),
  )

  const unresolved: UnresolvedQuoteCartItem[] = []
  for (const item of snapshot?.carrito ?? []) {
    const name = item.snapshot?.nombre?.trim() ?? ""
    const key = name ? lineKey(name) : null
    if (consumeDisplayedLine(leftover, key)) continue
    const unit = Number(item.snapshot?.precio)
    const qty = Number(item.cantidad)
    const quantity = Number.isFinite(qty) && qty > 0 ? qty : 1
    unresolved.push({
      name: name || "Ítem que ya no está en el catálogo",
      quantity,
      amount:
        Number.isFinite(unit) && unit > 0
          ? roundSaleMoney(unit * quantity)
          : null,
    })
  }
  return unresolved
}

export function allocateUnresolvedQuoteGap(
  items: UnresolvedQuoteCartItem[],
  gap: number,
): { items: UnresolvedQuoteCartItem[]; remainder: number } {
  const known = items.reduce((sum, item) => sum + (item.amount ?? 0), 0)
  let leftover = roundSaleMoney(Math.max(0, gap - known))
  if (leftover <= 0.009) {
    return { items, remainder: 0 }
  }

  const unnamedIndex = items.findIndex((item) => item.amount == null)
  if (unnamedIndex >= 0) {
    return {
      items: items.map((item, index) =>
        index === unnamedIndex ? { ...item, amount: leftover } : item,
      ),
      remainder: 0,
    }
  }

  return { items, remainder: leftover }
}
