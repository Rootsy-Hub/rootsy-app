import {
  catalogDiscountLabel,
  parseSnapshotTotals,
  type SaleDiscountSource,
} from "@/lib/saleSnapshot"

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

function parseQty(v: unknown): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 1e6) / 1e6
}

function parseMoney(v: unknown): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return roundMoney(n)
}

export type SalesDailyTotalsRow = {
  listSubtotal: number
  discountPromotions: number
  discountItemsCatalog: number
  discountItemsManual: number
  discountGeneral: number
  taxTotal: number
  total: number
  saleCount: number
}

export type SalesPeriodStats = SalesDailyTotalsRow & {
  dateFrom: string
  dateTo: string
  topPromotions: Array<{
    promotionKey: string
    promotionName: string
    promotionKind: "combo" | "quantity_deal"
    applications: number
    discountAmount: number
    revenueAmount: number
  }>
  topArticles: Array<{
    articleId: string
    nameSnapshot: string
    quantity: number
    revenueAmount: number
  }>
}

export type SaleAggregationInput = {
  metadata: unknown
  lineItems: unknown
  total: number
  taxTotal: number
}

type MutablePromoAgg = {
  promotionKey: string
  promotionName: string
  promotionKind: "combo" | "quantity_deal"
  applications: number
  discountAmount: number
  revenueAmount: number
}

type MutableArticleAgg = {
  articleId: string
  nameSnapshot: string
  quantity: number
  listAmount: number
  discountAmount: number
  revenueAmount: number
}

type MutableRecipeAgg = {
  recipeId: string
  nameSnapshot: string
  quantity: number
  listAmount: number
  discountAmount: number
  revenueAmount: number
}

type MutableDiscountAgg = {
  discountKind: "catalog" | "manual" | "general"
  discountLabel: string
  applications: number
  discountAmount: number
}

type MutableArticleInPromoAgg = {
  articleId: string
  promotionKey: string
  nameSnapshot: string
  quantity: number
}

export type SaleDayAggregation = {
  totals: SalesDailyTotalsRow
  promotions: MutablePromoAgg[]
  articles: MutableArticleAgg[]
  recipes: MutableRecipeAgg[]
  discounts: MutableDiscountAgg[]
  articleInPromo: MutableArticleInPromoAgg[]
}

function emptyDayAggregation(): SaleDayAggregation {
  return {
    totals: {
      listSubtotal: 0,
      discountPromotions: 0,
      discountItemsCatalog: 0,
      discountItemsManual: 0,
      discountGeneral: 0,
      taxTotal: 0,
      total: 0,
      saleCount: 0,
    },
    promotions: [],
    articles: [],
    recipes: [],
    discounts: [],
    articleInPromo: [],
  }
}

function discountLabelFromLine(o: Record<string, unknown>): string {
  const mode = o.item_discount_mode
  const value = o.item_discount_value
  if (mode === "porcentaje" || mode === "fijo") {
    return (
      catalogDiscountLabel(mode, value != null ? parseMoney(value) : null) ??
      "Descuento"
    )
  }
  return "Descuento"
}

export function aggregateSaleIntoDay(
  acc: SaleDayAggregation,
  sale: SaleAggregationInput,
): void {
  const meta =
    sale.metadata != null && typeof sale.metadata === "object"
      ? (sale.metadata as Record<string, unknown>)
      : {}
  const snapshotVersion = Number(meta.snapshot_version ?? 0) || 0
  const snapshotTotals = parseSnapshotTotals(meta.totals)

  acc.totals.saleCount += 1
  acc.totals.total = roundMoney(acc.totals.total + parseMoney(sale.total))
  acc.totals.taxTotal = roundMoney(acc.totals.taxTotal + parseMoney(sale.taxTotal))

  if (snapshotTotals && snapshotVersion >= 2) {
    acc.totals.listSubtotal = roundMoney(
      acc.totals.listSubtotal + snapshotTotals.listSubtotal,
    )
    acc.totals.discountPromotions = roundMoney(
      acc.totals.discountPromotions + snapshotTotals.discountPromotionsAmount,
    )
    acc.totals.discountItemsCatalog = roundMoney(
      acc.totals.discountItemsCatalog + snapshotTotals.discountItemsCatalogAmount,
    )
    acc.totals.discountItemsManual = roundMoney(
      acc.totals.discountItemsManual + snapshotTotals.discountItemsManualAmount,
    )
    acc.totals.discountGeneral = roundMoney(
      acc.totals.discountGeneral + snapshotTotals.discountGeneralAmount,
    )
  } else {
    const generalDiscount = parseMoney(meta.general_discount_amount)
    acc.totals.discountGeneral = roundMoney(
      acc.totals.discountGeneral + generalDiscount,
    )
  }

  const promoMap = new Map<string, MutablePromoAgg>()
  for (const row of acc.promotions) {
    promoMap.set(row.promotionKey, row)
  }
  const articleMap = new Map<string, MutableArticleAgg>()
  for (const row of acc.articles) {
    articleMap.set(row.articleId, row)
  }
  const recipeMap = new Map<string, MutableRecipeAgg>()
  for (const row of acc.recipes) {
    recipeMap.set(row.recipeId, row)
  }
  const discountMap = new Map<string, MutableDiscountAgg>()
  for (const row of acc.discounts) {
    discountMap.set(`${row.discountKind}:${row.discountLabel}`, row)
  }
  const articleInPromoMap = new Map<string, MutableArticleInPromoAgg>()
  for (const row of acc.articleInPromo) {
    articleInPromoMap.set(`${row.articleId}:${row.promotionKey}`, row)
  }

  const lines = Array.isArray(sale.lineItems) ? sale.lineItems : []
  let fallbackListSubtotal = 0

  for (const raw of lines) {
    if (!raw || typeof raw !== "object") continue
    const o = raw as Record<string, unknown>
    const qty = parseQty(o.quantity)
    const unitPrice = parseMoney(o.unit_price)
    const listLine =
      o.list_line_total != null
        ? parseMoney(o.list_line_total)
        : roundMoney(qty * unitPrice)
    const lineSubtotal =
      o.line_subtotal != null ? parseMoney(o.line_subtotal) : parseMoney(o.line_total)
    const itemDiscount = parseMoney(o.item_discount_amount)
    const discountSource = o.discount_source as SaleDiscountSource | undefined
    const lineKind = o.line_kind
    const nameSnapshot = String(o.name_snapshot ?? "—")

    if (!snapshotTotals || snapshotVersion < 2) {
      fallbackListSubtotal = roundMoney(fallbackListSubtotal + listLine)
      if (discountSource === "combo" || discountSource === "quantity_deal") {
        acc.totals.discountPromotions = roundMoney(
          acc.totals.discountPromotions + itemDiscount,
        )
      } else if (discountSource === "catalog") {
        acc.totals.discountItemsCatalog = roundMoney(
          acc.totals.discountItemsCatalog + itemDiscount,
        )
      } else if (discountSource === "manual") {
        acc.totals.discountItemsManual = roundMoney(
          acc.totals.discountItemsManual + itemDiscount,
        )
      }
    }

    if (discountSource === "combo" || discountSource === "quantity_deal") {
      const promotionKey =
        discountSource === "combo"
          ? `combo:${String(o.promotion_id ?? nameSnapshot)}`
          : `deal:${String(o.promotion_deal_id ?? o.line_group_id ?? nameSnapshot)}`
      const promotionName =
        discountSource === "combo"
          ? nameSnapshot
          : String(o.promotion_deal_name ?? nameSnapshot)
      const existing = promoMap.get(promotionKey)
      if (existing) {
        existing.applications += 1
        existing.discountAmount = roundMoney(existing.discountAmount + itemDiscount)
        existing.revenueAmount = roundMoney(existing.revenueAmount + lineSubtotal)
      } else {
        const next: MutablePromoAgg = {
          promotionKey,
          promotionName,
          promotionKind: discountSource === "combo" ? "combo" : "quantity_deal",
          applications: 1,
          discountAmount: itemDiscount,
          revenueAmount: lineSubtotal,
        }
        promoMap.set(promotionKey, next)
        acc.promotions.push(next)
      }
    }

    if (discountSource === "catalog" || discountSource === "manual") {
      const discountKind = discountSource
      const discountLabel = discountLabelFromLine(o)
      const key = `${discountKind}:${discountLabel}`
      const existing = discountMap.get(key)
      if (existing) {
        existing.applications += 1
        existing.discountAmount = roundMoney(existing.discountAmount + itemDiscount)
      } else {
        const next: MutableDiscountAgg = {
          discountKind,
          discountLabel,
          applications: 1,
          discountAmount: itemDiscount,
        }
        discountMap.set(key, next)
        acc.discounts.push(next)
      }
    }

    if (lineKind === "promotion") {
      const promotionKey = `combo:${String(o.promotion_id ?? nameSnapshot)}`
      const promoSnapshot = o.promotion_snapshot
      if (promoSnapshot != null && typeof promoSnapshot === "object") {
        const components = (promoSnapshot as Record<string, unknown>).components
        if (Array.isArray(components)) {
          for (const component of components) {
            if (!component || typeof component !== "object") continue
            const c = component as Record<string, unknown>
            const articleId = c.article_id != null ? String(c.article_id) : null
            if (!articleId) continue
            const componentQty = parseQty(c.quantity)
            const componentName = String(c.name_snapshot ?? "—")
            const mapKey = `${articleId}:${promotionKey}`
            const existing = articleInPromoMap.get(mapKey)
            if (existing) {
              existing.quantity = roundMoney(existing.quantity + componentQty)
            } else {
              const next: MutableArticleInPromoAgg = {
                articleId,
                promotionKey,
                nameSnapshot: componentName,
                quantity: componentQty,
              }
              articleInPromoMap.set(mapKey, next)
              acc.articleInPromo.push(next)
            }
          }
        }
      }
      continue
    }

    const articleId = o.article_id != null ? String(o.article_id) : null
    const recipeId = o.recipe_id != null ? String(o.recipe_id) : null

    if (articleId) {
      const existing = articleMap.get(articleId)
      if (existing) {
        existing.quantity = roundMoney(existing.quantity + qty)
        existing.listAmount = roundMoney(existing.listAmount + listLine)
        existing.discountAmount = roundMoney(existing.discountAmount + itemDiscount)
        existing.revenueAmount = roundMoney(existing.revenueAmount + lineSubtotal)
      } else {
        const next: MutableArticleAgg = {
          articleId,
          nameSnapshot,
          quantity: qty,
          listAmount: listLine,
          discountAmount: itemDiscount,
          revenueAmount: lineSubtotal,
        }
        articleMap.set(articleId, next)
        acc.articles.push(next)
      }
    }

    if (recipeId) {
      const existing = recipeMap.get(recipeId)
      if (existing) {
        existing.quantity = roundMoney(existing.quantity + qty)
        existing.listAmount = roundMoney(existing.listAmount + listLine)
        existing.discountAmount = roundMoney(existing.discountAmount + itemDiscount)
        existing.revenueAmount = roundMoney(existing.revenueAmount + lineSubtotal)
      } else {
        const next: MutableRecipeAgg = {
          recipeId,
          nameSnapshot,
          quantity: qty,
          listAmount: listLine,
          discountAmount: itemDiscount,
          revenueAmount: lineSubtotal,
        }
        recipeMap.set(recipeId, next)
        acc.recipes.push(next)
      }
    }
  }

  if (!snapshotTotals || snapshotVersion < 2) {
    acc.totals.listSubtotal = roundMoney(acc.totals.listSubtotal + fallbackListSubtotal)
  }

  const generalDiscount = parseMoney(meta.general_discount_amount)
  if (generalDiscount > 0) {
    const key = "general:Descuento general"
    const existing = discountMap.get(key)
    if (existing) {
      existing.applications += 1
      existing.discountAmount = roundMoney(existing.discountAmount + generalDiscount)
    } else {
      const next: MutableDiscountAgg = {
        discountKind: "general",
        discountLabel: "Descuento general",
        applications: 1,
        discountAmount: generalDiscount,
      }
      discountMap.set(key, next)
      acc.discounts.push(next)
    }
  }
}

export function sumDailyTotalsRows(rows: SalesDailyTotalsRow[]): SalesDailyTotalsRow {
  const out = emptyDayAggregation().totals
  for (const row of rows) {
    out.listSubtotal = roundMoney(out.listSubtotal + row.listSubtotal)
    out.discountPromotions = roundMoney(out.discountPromotions + row.discountPromotions)
    out.discountItemsCatalog = roundMoney(
      out.discountItemsCatalog + row.discountItemsCatalog,
    )
    out.discountItemsManual = roundMoney(
      out.discountItemsManual + row.discountItemsManual,
    )
    out.discountGeneral = roundMoney(out.discountGeneral + row.discountGeneral)
    out.taxTotal = roundMoney(out.taxTotal + row.taxTotal)
    out.total = roundMoney(out.total + row.total)
    out.saleCount += row.saleCount
  }
  return out
}

export { emptyDayAggregation }
