import type { OperationPurchaseLineItem } from "@/app/[siteId]/[popId]/operations/actions"
import { formatArticleDiscountBadge } from "@/lib/articleDiscount"
import type {
  MostradorCartDisplayRow,
  MostradorCartGroupPricing,
} from "@/lib/mostradorCartDisplay"

function roundMoney(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 100) / 100
}

export function resolvePurchaseLineSubtotal(
  line: OperationPurchaseLineItem,
  purchase: {
    total: number
    discountInfo: { subtotalBeforeGeneralDiscount: number | null }
  },
): number {
  if (line.lineSubtotal != null && line.lineSubtotal > 0) {
    return line.lineSubtotal
  }
  const subBeforeGeneral = purchase.discountInfo.subtotalBeforeGeneralDiscount
  if (
    subBeforeGeneral != null &&
    subBeforeGeneral > 0 &&
    purchase.total > 0 &&
    line.lineTotal > 0
  ) {
    return roundMoney((line.lineTotal * subBeforeGeneral) / purchase.total)
  }
  return line.lineTotal
}

export function resolvePurchaseItemDiscountAmount(
  line: OperationPurchaseLineItem,
  purchase: {
    total: number
    discountInfo: { subtotalBeforeGeneralDiscount: number | null }
  },
): number {
  if (line.itemDiscountAmount > 0) return line.itemDiscountAmount
  const gross = roundMoney(line.quantity * line.unitCost)
  const lineSub = resolvePurchaseLineSubtotal(line, purchase)
  const guess = roundMoney(gross - lineSub)
  return guess > 0 ? guess : 0
}

function discountLabelForLine(line: OperationPurchaseLineItem): string | undefined {
  if (line.itemDiscountMode === "porcentaje" && line.itemDiscountValue != null) {
    return formatArticleDiscountBadge("porcentaje", line.itemDiscountValue)
  }
  if (line.itemDiscountMode === "fijo" && line.itemDiscountValue != null) {
    return formatArticleDiscountBadge("fijo", line.itemDiscountValue)
  }
  if (line.itemDiscountAmount > 0) {
    return formatArticleDiscountBadge("fijo", line.itemDiscountAmount)
  }
  return undefined
}

function pushPurchaseRow(
  rows: MostradorCartDisplayRow[],
  lineIndex: number,
  line: OperationPurchaseLineItem,
  purchase: {
    id: string
    total: number
    discountInfo: { subtotalBeforeGeneralDiscount: number | null }
  },
) {
  const listTotal = roundMoney(line.quantity * line.unitCost)
  const finalTotal = resolvePurchaseLineSubtotal(line, purchase)
  const itemDiscount = resolvePurchaseItemDiscountAmount(line, purchase)
  const isDiscountGroup = itemDiscount > 0.004
  const label = discountLabelForLine(line)
  const groupKey = isDiscountGroup ? `discount:${lineIndex}` : undefined

  rows.push({
    productoId: line.articleId ?? `line-${lineIndex}`,
    kind: "article",
    producto: null,
    discountEditingDisabled: true,
    commentEditingDisabled: true,
    showGreenBorder: isDiscountGroup,
    topCloudVariant: "none",
    rowKey: `${purchase.id}-line:${lineIndex}`,
    lineId: `line:${lineIndex}`,
    cartLineId: String(lineIndex),
    variant: "product",
    nombre: line.nameSnapshot,
    cantidad: line.quantity,
    promoGroupKey: groupKey,
    promoGroupLabel: label,
    promoGroupVariant: isDiscountGroup ? "discount" : undefined,
    promoGroupDiscountMode: line.itemDiscountMode ?? undefined,
    comment: line.comment ?? undefined,
    readOnlyPricing: { listTotal, finalTotal },
  })
}

export function buildPurchaseDetailCartDisplayRows(
  purchase: {
    id: string
    total: number
    discountInfo: { subtotalBeforeGeneralDiscount: number | null }
    lineItems: OperationPurchaseLineItem[]
  },
): MostradorCartDisplayRow[] {
  const rows: MostradorCartDisplayRow[] = []
  purchase.lineItems.forEach((line, lineIndex) => {
    pushPurchaseRow(rows, lineIndex, line, purchase)
  })
  return rows
}

export function resolvePurchaseListSubtotal(
  purchase: {
    total: number
    discountInfo: {
      subtotalBeforeGeneralDiscount: number | null
      itemDiscountTotal: number
    }
    lineItems: OperationPurchaseLineItem[]
  },
): number {
  if (purchase.discountInfo.subtotalBeforeGeneralDiscount != null) {
    return purchase.discountInfo.subtotalBeforeGeneralDiscount
  }
  return roundMoney(
    purchase.lineItems.reduce(
      (sum, line) => sum + resolvePurchaseLineSubtotal(line, purchase),
      0,
    ),
  )
}

export function resolvePurchaseTotals(purchase: {
  id: string
  total: number
  taxTotal: number
  discountInfo: {
    subtotalBeforeGeneralDiscount: number | null
    generalDiscountAmount: number
    itemDiscountTotal: number
  }
  lineItems: OperationPurchaseLineItem[]
  accruesInputVat: boolean
  vatIncludedEstimate?: number | null
}) {
  const listSubtotal = roundMoney(
    purchase.lineItems.reduce(
      (sum, line) => sum + roundMoney(line.quantity * line.unitCost),
      0,
    ),
  )
  const itemDiscountTotal =
    purchase.discountInfo.itemDiscountTotal > 0
      ? purchase.discountInfo.itemDiscountTotal
      : roundMoney(
          purchase.lineItems.reduce(
            (sum, line) =>
              sum + resolvePurchaseItemDiscountAmount(line, purchase),
            0,
          ),
        )
  const generalDiscount = purchase.discountInfo.generalDiscountAmount
  let taxTotal = purchase.taxTotal
  if (taxTotal <= 0 && purchase.accruesInputVat) {
    taxTotal =
      purchase.vatIncludedEstimate ??
      roundMoney(
        purchase.lineItems.reduce((sum, line) => {
          if (line.iva <= 0 || line.lineTotal <= 0) return sum
          return (
            sum + roundMoney((line.lineTotal * line.iva) / (100 + line.iva))
          )
        }, 0),
      )
  }

  return {
    listSubtotal,
    itemDiscountTotal,
    generalDiscount,
    taxTotal,
    total: purchase.total,
  }
}

export type { MostradorCartGroupPricing }
