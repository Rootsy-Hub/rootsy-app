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
  type MostradorCartDisplayRow,
} from "@/lib/mostradorCartDisplay"
import { normalizeCartItemKind, resolveCartLineId } from "@/lib/menuCart"

export type ChannelCheckoutTicketDisplay = {
  rows: MostradorCartDisplayRow[]
  paidPartialUnits: Record<string, number>
  orderTotal: number
  paidTotal: number
  pendingTotal: number
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
  })
  const quantityDealDiscounts = computeMenuQuantityDealDiscounts({
    carrito,
    productosByKey,
    quantityDeals: input.menuQuantityDeals,
    overrides,
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
  const subtotal = catalogTotals.subtotal
  const descuentoMonto =
    input.checkout.modoDescuento === "porcentaje"
      ? subtotal * ((input.checkout.valorDescuentoPorcentaje ?? 0) / 100)
      : Math.min(input.checkout.valorDescuentoFijo ?? 0, subtotal)
  const orderTotal = Math.max(0, subtotal - descuentoMonto)
  const pendingTotal = Math.max(0, orderTotal - paidTotal)

  const rows = buildMostradorCartDisplayRows({
    items: cartDetailItemsFromCarrito(itemsDetallados),
    applications: quantityDealApplications,
    overrides,
    productosByKey,
  })

  return {
    rows,
    paidPartialUnits,
    orderTotal,
    paidTotal,
    pendingTotal,
  }
}
