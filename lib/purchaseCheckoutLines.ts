import {
  resolveSaleLineDiscount,
  roundSaleMoney,
} from "@/lib/saleLineDiscount"

export type PurchaseCheckoutLineInput = {
  articleId: string
  quantity: number
  unitCost: number
  itemDiscountMode?: "porcentaje" | "fijo"
  itemDiscountDraft?: string
  comment?: string
  updateArticleCost?: boolean
}

export type PurchaseLineBuilt = {
  articleId: string
  name: string
  qty: number
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
  netUnitCost: number
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
  article: { name?: unknown; iva?: unknown },
): PurchaseLineBuilt | null {
  const articleId = input.articleId.trim()
  const qty = parseQty(input.quantity)
  const unitCost = parseMoney(input.unitCost)
  if (qty <= 0 || !articleId) return null
  if (unitCost < 0) return null

  const ivaPct = parseMoney(article.iva)
  const draft = input.itemDiscountDraft?.trim() ?? ""
  const lineDiscount = resolveSaleLineDiscount({
    listUnitPrice: unitCost,
    quantity: qty,
    manualDiscount:
      draft !== ""
        ? {
            mode: input.itemDiscountMode ?? "porcentaje",
            draft,
          }
        : null,
  })

  const comment = input.comment?.trim()

  return {
    articleId,
    name: String(article.name ?? "Artículo"),
    qty,
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
    fiscalLines.push({
      ...line,
      lineFinal,
      taxPart,
      netPart,
      netUnitCost: line.qty > 0 ? roundSaleMoney(netPart / line.qty) : 0,
    })
  }

  const lineItemsJson = fiscalLines.map((line) => ({
    article_id: line.articleId,
    quantity: line.qty,
    unit_cost: line.unitCost,
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
