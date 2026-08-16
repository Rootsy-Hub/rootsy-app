import type {
  SaleQuoteLineDiscount,
  SaleQuoteLineGroup,
  SaleQuoteLineSummary,
} from "@/lib/saleQuoteTypes"
import { roundSaleMoney } from "@/lib/saleLineDiscount"

export function quoteLineGroupsItemCount(groups: SaleQuoteLineGroup[]): number {
  return groups.reduce(
    (sum, group) =>
      sum + group.lines.reduce((lineSum, line) => lineSum + line.quantity, 0),
    0,
  )
}

export function buildQuoteLineSummariesFromLineGroups(
  groups: SaleQuoteLineGroup[],
): SaleQuoteLineSummary[] {
  return groups.flatMap((group) =>
    group.lines.map((line) => ({
      name: line.name,
      quantity: line.quantity,
      unitPrice:
        line.quantity > 0
          ? roundSaleMoney(line.lineTotal / line.quantity)
          : 0,
      lineTotal: line.lineTotal,
    })),
  )
}

export function quoteSubtotalSinDescuentos(groups: SaleQuoteLineGroup[]): number {
  return roundSaleMoney(
    groups.reduce(
      (sum, group) =>
        sum +
        group.lines.reduce((lineSum, line) => lineSum + line.listLineTotal, 0),
      0,
    ),
  )
}

export function quoteHasInlineDiscounts(groups: SaleQuoteLineGroup[]): boolean {
  return groups.some(
    (group) =>
      (group.promotionDiscount?.amount ?? 0) > 0 ||
      group.lines.some((line) => line.discounts.some((d) => d.amount > 0)),
  )
}

export function resolveQuoteLineGroups(
  metadata: {
    lineGroups?: SaleQuoteLineGroup[]
    lineSummaries?: SaleQuoteLineSummary[]
  },
): SaleQuoteLineGroup[] {
  if (metadata.lineGroups?.length) return metadata.lineGroups
  if (!metadata.lineSummaries?.length) return []

  return [
    {
      id: "legacy-lines",
      category: "Detalle",
      lines: metadata.lineSummaries.map((line, index) => ({
        name: line.name,
        quantity: line.quantity,
        unitListPrice: line.unitPrice,
        listLineTotal: line.lineTotal,
        lineTotal: line.lineTotal,
        discounts: [],
      })),
      promotionDiscount: null,
    },
  ]
}

export type QuotePdfTableRow =
  | { kind: "group"; label: string }
  | { kind: "line"; cells: [string, string, string, string] }
  | { kind: "discount"; label: string; amount: string }

export function buildQuotePdfTableRows(
  groups: SaleQuoteLineGroup[],
  formatMoney: (n: number) => string,
): QuotePdfTableRow[] {
  const rows: QuotePdfTableRow[] = []

  for (const group of groups) {
    const showGroupHeader =
      group.category.trim().length > 0 &&
      group.category.trim().toLowerCase() !== "general" &&
      group.category.trim().toLowerCase() !== "detalle"

    if (showGroupHeader) {
      rows.push({ kind: "group", label: group.category })
    }

    for (const line of group.lines) {
      rows.push({
        kind: "line",
        cells: [
          line.name,
          String(line.quantity),
          formatMoney(line.unitListPrice),
          formatMoney(line.listLineTotal),
        ],
      })
      for (const discount of line.discounts) {
        if (discount.amount <= 0) continue
        rows.push({
          kind: "discount",
          label: discount.label,
          amount: `-${formatMoney(discount.amount)}`,
        })
      }
    }

    if (group.promotionDiscount && group.promotionDiscount.amount > 0) {
      rows.push({
        kind: "discount",
        label: group.promotionDiscount.label,
        amount: `-${formatMoney(group.promotionDiscount.amount)}`,
      })
    }
  }

  return rows
}
