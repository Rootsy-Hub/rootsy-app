import type { ArticleItemKind } from "@/lib/articleItemKind"
import {
  resolveSaleLineDiscount,
  roundSaleMoney,
} from "@/lib/saleLineDiscount"
import { saleQuantityFromCostPurchase } from "@/lib/articleCosts"

export type PurchaseCheckoutLineInput = {
  articleId: string
  articleCostId: string
  /** Cantidad de unidades de costo (ej. maples). */
  costQuantity: number
  /** Precio por 1 unidad de costo. */
  unitCost: number
  itemDiscountMode?: "porcentaje" | "fijo"
  itemDiscountDraft?: string
  comment?: string
  /** Si true, actualiza article_costs.unit_price al confirmar. */
  updateArticleCost?: boolean
}

export type PurchaseLineBuilt = {
  articleId: string
  articleCostId: string
  itemKind: ArticleItemKind
  name: string
  costUnitLabel: string
  costQty: number
  saleQty: number
  saleUnitsPerCostUnit: number
  unitCost: number
  ivaPct: number
  listLineGross: number
  itemDiscountAmount: number
  itemDiscountMode: "porcentaje" | "fijo" | null
  itemDiscountValue: number | null
  lineGross: number
  comment: string | null
  updateArticleCost: boolean
}

export type PurchaseFiscalLine = PurchaseLineBuilt & {
  lineFinal: number
  taxPart: number
  netPart: number
  /** Costo neto por unidad de costo (post descuentos). */
  netUnitCost: number
  /** Costo por unidad de venta (post descuentos). */
  unitCostSaleUom: number
}

export type FinalizePurchaseCheckoutResult = {
  subtotalAfterItems: number
  generalDiscount: number
  itemDiscountTotal: number
  discountTotal: number
  total: number
  subtotalNet: number
  taxTotal: number
  fiscalLines: PurchaseFiscalLine[]
  lineItemsJson: Record<string, unknown>[]
}

function parseQty(v: unknown): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 1e6) / 1e6
}

function parseMoney(v: unknown): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return roundSaleMoney(n)
}

export function buildPurchaseLineFromInput(
  input: PurchaseCheckoutLineInput,
  article: { name?: unknown; iva?: unknown; itemKind: ArticleItemKind },
  cost: {
    costUnitLabel: string
    saleUnitsPerCostUnit: number
  },
): PurchaseLineBuilt | null {
  const articleId = input.articleId.trim()
  const articleCostId = input.articleCostId.trim()
  const costQty = parseQty(input.costQuantity)
  const unitCost = parseMoney(input.unitCost)
  const saleUnitsPerCostUnit = parseQty(cost.saleUnitsPerCostUnit)
  if (costQty <= 0 || !articleId || !articleCostId) return null
  if (unitCost < 0) return null
  if (saleUnitsPerCostUnit <= 0) return null

  const saleQty = saleQuantityFromCostPurchase(costQty, saleUnitsPerCostUnit)
  if (saleQty <= 0) return null

  const ivaPct = parseMoney(article.iva)
  const draft = input.itemDiscountDraft?.trim() ?? ""
  const lineDiscount = resolveSaleLineDiscount({
    listUnitPrice: unitCost,
    quantity: costQty,
    manualDiscount:
      draft !== ""
        ? {
            mode: input.itemDiscountMode ?? "porcentaje",
            draft,
          }
        : null,
  })

  const comment = input.comment?.trim()
  const costUnitLabel = cost.costUnitLabel.trim() || "unidad de costo"

  return {
    articleId,
    articleCostId,
    itemKind: article.itemKind,
    name: String(article.name ?? "Artículo"),
    costUnitLabel,
    costQty,
    saleQty,
    saleUnitsPerCostUnit,
    unitCost,
    ivaPct,
    listLineGross: lineDiscount.listLineSubtotal,
    itemDiscountAmount: lineDiscount.itemDiscountAmount,
    itemDiscountMode: lineDiscount.itemDiscountMode,
    itemDiscountValue: lineDiscount.itemDiscountValue,
    lineGross: lineDiscount.lineSubtotal,
    comment: comment ? comment : null,
    updateArticleCost: input.updateArticleCost === true,
  }
}

export function finalizePurchaseCheckout(
  built: PurchaseLineBuilt[],
  generalDiscountMode: "porcentaje" | "fijo" = "porcentaje",
  generalDiscountValue = 0,
): FinalizePurchaseCheckoutResult {
  const subtotalAfterItems = roundSaleMoney(
    built.reduce((acc, line) => acc + line.lineGross, 0),
  )

  const discountVal = Number(generalDiscountValue)
  let generalDiscount = 0
  if (Number.isFinite(discountVal) && discountVal > 0) {
    generalDiscount =
      generalDiscountMode === "porcentaje"
        ? roundSaleMoney(
            subtotalAfterItems *
              (Math.min(100, Math.max(0, discountVal)) / 100),
          )
        : roundSaleMoney(
            Math.min(Math.max(0, discountVal), subtotalAfterItems),
          )
  }

  const itemDiscountTotal = roundSaleMoney(
    built.reduce((acc, line) => acc + line.itemDiscountAmount, 0),
  )
  const discountTotal = roundSaleMoney(itemDiscountTotal + generalDiscount)
  const total = roundSaleMoney(subtotalAfterItems - generalDiscount)

  const scale =
    subtotalAfterItems > 0 ? roundSaleMoney(total / subtotalAfterItems) : 1

  const fiscalLines: PurchaseFiscalLine[] = []
  let sumTax = 0
  let sumNet = 0

  for (const line of built) {
    const lineFinal = roundSaleMoney(line.lineGross * scale)
    let taxPart = 0
    let netPart = lineFinal
    if (line.ivaPct > 0) {
      taxPart = roundSaleMoney((lineFinal * line.ivaPct) / (100 + line.ivaPct))
      netPart = roundSaleMoney(lineFinal - taxPart)
    }
    sumTax = roundSaleMoney(sumTax + taxPart)
    sumNet = roundSaleMoney(sumNet + netPart)
    const netUnitCost =
      line.costQty > 0 ? roundSaleMoney(netPart / line.costQty) : 0
    const unitCostSaleUom =
      line.saleQty > 0 ? roundSaleMoney(lineFinal / line.saleQty) : 0
    fiscalLines.push({
      ...line,
      lineFinal,
      taxPart,
      netPart,
      netUnitCost,
      unitCostSaleUom,
    })
  }

  const lineItemsJson = fiscalLines.map((line) => ({
    article_id: line.articleId,
    article_cost_id: line.articleCostId,
    item_kind: line.itemKind,
    cost_quantity: line.costQty,
    cost_unit_label: line.costUnitLabel,
    sale_units_per_cost_unit: line.saleUnitsPerCostUnit,
    sale_quantity: line.saleQty,
    quantity: line.costQty,
    unit_cost: line.unitCost,
    unit_cost_sale_uom: line.unitCostSaleUom,
    iva: line.ivaPct,
    item_discount_mode: line.itemDiscountMode,
    item_discount_value: line.itemDiscountValue,
    item_discount_amount: line.itemDiscountAmount,
    line_subtotal: line.lineGross,
    line_total: line.lineFinal,
    name_snapshot: line.name,
    comment: line.comment,
  }))

  return {
    subtotalAfterItems,
    generalDiscount,
    itemDiscountTotal,
    discountTotal,
    total,
    subtotalNet: sumNet,
    taxTotal: sumTax,
    fiscalLines,
    lineItemsJson,
  }
}
