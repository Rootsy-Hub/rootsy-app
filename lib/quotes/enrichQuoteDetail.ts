import "server-only"

import {
  getMenuCatalog,
  getMenuCatalogItemsByIds,
} from "@/app/[siteId]/[popId]/menu-catalog/actions"
import { parseTableSessionCheckout } from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"
import {
  buildQuoteLineGroupsFromCheckoutSnapshot,
  buildQuoteLineSummariesFromCheckoutSnapshot,
} from "@/lib/saleQuoteCheckout"
import type { SaleQuoteDetail, SaleQuoteLineGroup } from "@/lib/saleQuoteTypes"
import { quoteLineGroupsItemCount } from "@/lib/saleQuoteDocumentLines"
import { quoteStoredAmountGap } from "@/lib/saleQuoteViewGaps"
import { collectCartCatalogEnsureIds } from "@/lib/menuCatalogProduct"

function lineKey(name: string): string {
  return name.trim().toLowerCase()
}

function checkoutItemCoverage(
  groups: SaleQuoteLineGroup[] | undefined,
  carrito: SaleQuoteDetail["checkoutSnapshot"]["carrito"],
): number {
  const listed = new Set<string>()
  for (const group of groups ?? []) {
    for (const line of group.lines) {
      const key = lineKey(line.name)
      if (key) listed.add(key)
    }
  }
  let covered = 0
  for (const item of carrito) {
    const name = item.snapshot?.nombre?.trim() ?? ""
    if (name && listed.has(lineKey(name))) covered += 1
  }
  return covered
}

function lineCoverage(
  groups: SaleQuoteLineGroup[] | undefined,
  storedSubtotal: number,
  carrito: SaleQuoteDetail["checkoutSnapshot"]["carrito"],
) {
  const list = groups ?? []
  return {
    count: quoteLineGroupsItemCount(list),
    gap: quoteStoredAmountGap(list, storedSubtotal),
    covered: checkoutItemCoverage(list, carrito),
  }
}

export async function enrichSaleQuoteDetail(
  popId: string,
  quote: SaleQuoteDetail,
): Promise<SaleQuoteDetail> {
  const snapshot = parseTableSessionCheckout(quote.checkoutSnapshot)
  const next: SaleQuoteDetail = snapshot
    ? { ...quote, checkoutSnapshot: snapshot }
    : quote
  if (!snapshot) return next

  const ids = collectCartCatalogEnsureIds(snapshot.carrito)
  const [catalog, byIds] = await Promise.all([
    getMenuCatalog(popId, { items: "none" }),
    getMenuCatalogItemsByIds(popId, ids.articleIds, ids.recipeIds),
  ])

  const rebuiltGroups = buildQuoteLineGroupsFromCheckoutSnapshot(snapshot, {
    articles: byIds.success ? byIds.articles : [],
    recipes: byIds.success ? byIds.recipes : [],
    promotions: catalog.success ? catalog.promotions : [],
    quantityDeals: catalog.success ? catalog.quantityDeals : [],
  })
  if (rebuiltGroups.length === 0) return next

  const savedGroups = next.metadata.lineGroups
  const saved = lineCoverage(savedGroups, next.subtotal, snapshot.carrito)
  const rebuilt = lineCoverage(rebuiltGroups, next.subtotal, snapshot.carrito)
  const preferRebuilt =
    !savedGroups?.length ||
    rebuilt.gap + 0.009 < saved.gap ||
    rebuilt.covered > saved.covered ||
    (Math.abs(rebuilt.gap - saved.gap) <= 0.009 &&
      rebuilt.covered >= saved.covered &&
      rebuilt.count > saved.count)
  if (!preferRebuilt) return next

  return {
    ...next,
    metadata: {
      ...next.metadata,
      lineGroups: rebuiltGroups,
      lineSummaries: buildQuoteLineSummariesFromCheckoutSnapshot(snapshot, {
        articles: byIds.success ? byIds.articles : [],
        recipes: byIds.success ? byIds.recipes : [],
        promotions: catalog.success ? catalog.promotions : [],
        quantityDeals: catalog.success ? catalog.quantityDeals : [],
      }),
    },
  }
}
