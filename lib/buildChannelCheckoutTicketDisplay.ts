import type { MenuCatalogArticle, MenuCatalogPromotion, MenuCatalogRecipe } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import type { TableSessionCheckoutSnapshot } from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"
import {
  menuArticleToProduct,
  menuRecipeToProduct,
  type MenuCatalogProduct,
} from "@/lib/menuCatalogProduct"
import {
  buildMenuProductMap,
  computeMenuQuantityDealApplications,
  computeMenuQuantityDealDiscounts,
  menuCartOrderTotals,
  buildMenuCartTotalsLines,
  menuPromotionToProduct,
} from "@/lib/menuCheckoutPromotions"
import {
  buildMostradorCartDisplayRows,
  cartDetailItemsFromCarrito,
  countAppliedPromotions,
  type MostradorCartDisplayRow,
} from "@/lib/mostradorCartDisplay"
import { normalizeCartItemKind, resolveCartLineId } from "@/lib/menuCart"
import { computeOrderTotalBreakdown } from "@/lib/orderTotalBreakdown"

export type ChannelCheckoutTicketDisplay = {
  rows: MostradorCartDisplayRow[]
  paidPartialUnits: Record<string, number>
  orderTotal: number
  paidTotal: number
  pendingTotal: number
  subtotalOriginal: number
  descuentoItemsMonto: number
  promocionesAplicadasMonto: number
  promocionesAplicadasCount: number
  descuentoGeneralMonto: number
  hayDescuentoItems: boolean
  hayDescuentoGeneral: boolean
}

export function buildChannelCheckoutTicketDisplay(input: {
  checkout: TableSessionCheckoutSnapshot
  menuArticles: MenuCatalogArticle[]
  menuRecipes: MenuCatalogRecipe[]
  menuPromotions: MenuCatalogPromotion[]
  menuQuantityDeals: MenuCatalogPromotion[]
}): ChannelCheckoutTicketDisplay {
  const productosCatalogo: MenuCatalogProduct[] = [
    ...input.menuPromotions.map(menuPromotionToProduct),
    ...input.menuRecipes.map(menuRecipeToProduct),
    ...input.menuArticles.map(menuArticleToProduct),
  ]
  const productosByKey = buildMenuProductMap(productosCatalogo)

  const carrito = input.checkout.carrito ?? []
  const paidPartialUnits = input.checkout.paidPartialUnits ?? {}
  const paidTotal = Math.max(0, input.checkout.totalPagadoAcumulado ?? 0)

  const overrides = {
    itemDescuentoModo: input.checkout.itemDescuentoModo ?? {},
    itemDescuentoDraft: input.checkout.itemDescuentoDraft ?? {},
    itemDescuentoSuprimido: input.checkout.itemDescuentoSuprimido ?? {},
    itemComentarios: input.checkout.itemComentarios ?? {},
  }

  const quantityDealApplications = computeMenuQuantityDealApplications({
    carrito,
    productosByKey,
    quantityDeals: input.menuQuantityDeals,
    overrides,
    paidPartialUnits,
  })
  const quantityDealDiscounts = computeMenuQuantityDealDiscounts({
    carrito,
    productosByKey,
    quantityDeals: input.menuQuantityDeals,
    overrides,
    paidPartialUnits,
  })

  const itemsDetallados = carrito
    .map((item) => {
      const kind = normalizeCartItemKind(item.kind)
      const producto = productosByKey.get(`${kind}:${item.productoId}`) ?? null
      if (kind === "promotion" && !item.promotionSelections?.length) return null
      if (kind !== "promotion" && !producto) return null
      return {
        ...item,
        kind,
        lineId: resolveCartLineId({ ...item, kind }),
        cartLineKey: resolveCartLineId({ ...item, kind }),
        producto,
      }
    })
    .filter((item): item is NonNullable<typeof item> => item != null)

  const cartTotalsInput = buildMenuCartTotalsLines({
    items: itemsDetallados,
    quantityDealApplications,
    quantityDealDiscounts,
    itemDescuentoModo: overrides.itemDescuentoModo,
    itemDescuentoDraft: overrides.itemDescuentoDraft,
    itemDescuentoSuprimido: overrides.itemDescuentoSuprimido,
  })

  const catalogTotals = menuCartOrderTotals(cartTotalsInput)
  const breakdown = computeOrderTotalBreakdown({
    catalogTotals,
    modoDescuento: input.checkout.modoDescuento ?? "porcentaje",
    valorDescuentoPorcentaje: input.checkout.valorDescuentoPorcentaje ?? 0,
    valorDescuentoFijo: input.checkout.valorDescuentoFijo ?? 0,
    totalPagado: paidTotal,
  })

  const comboPromoLineCount = carrito.reduce(
    (sum, item) =>
      normalizeCartItemKind(item.kind) === "promotion" ? sum + item.cantidad : sum,
    0,
  )
  const promocionesAplicadasCount = countAppliedPromotions({
    applications: quantityDealApplications,
    comboLineCount: comboPromoLineCount,
  })

  const rows = buildMostradorCartDisplayRows({
    items: cartDetailItemsFromCarrito(itemsDetallados),
    applications: quantityDealApplications,
    overrides,
    productosByKey,
  })

  return {
    rows,
    paidPartialUnits,
    orderTotal: breakdown.orderTotalNet,
    paidTotal,
    pendingTotal: breakdown.total,
    subtotalOriginal: breakdown.subtotalOriginal,
    descuentoItemsMonto: breakdown.descuentoItemsMonto,
    promocionesAplicadasMonto: breakdown.promocionesAplicadasMonto,
    promocionesAplicadasCount,
    descuentoGeneralMonto: breakdown.descuentoMonto,
    hayDescuentoItems: breakdown.hayDescuentoItems,
    hayDescuentoGeneral: breakdown.hayDescuento,
  }
}
