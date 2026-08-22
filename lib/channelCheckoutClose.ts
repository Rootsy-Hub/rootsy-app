import type { MenuCartItem } from "@/lib/menuCart"
import {
  hasAnyPartialPayment,
  isCheckoutFullyPaid,
  type PartialCheckoutPaidState,
} from "@/lib/partialCheckoutSelection"
import type { QuantityDealApplication } from "@/lib/promotionPricing"

export type ChannelCloseMode = "settle" | "release"

export type ChannelCloseEligibility = {
  canClose: boolean
  mode: ChannelCloseMode | null
  blockReason: string | null
}

export function evaluateChannelCloseEligibility(input: {
  carrito: MenuCartItem[]
  paidPartialUnits: PartialCheckoutPaidState["paidPartialUnits"]
  totalPagadoAcumulado: number
  quantityDealApplications: QuantityDealApplication[]
  isAlreadySettled?: boolean
}): ChannelCloseEligibility {
  const {
    carrito,
    paidPartialUnits,
    totalPagadoAcumulado,
    quantityDealApplications,
    isAlreadySettled = false,
  } = input

  if (isAlreadySettled) {
    return {
      canClose: false,
      mode: null,
      blockReason: "Ya está cerrado.",
    }
  }

  const billableCarrito = carrito.filter((item) => item.comandaStatus !== "voided")
  const hasItems = billableCarrito.length > 0
  const hasPartialPayment = hasAnyPartialPayment({
    paidPartialUnits,
    totalPagadoAcumulado,
  })
  const checkoutFullyPaid =
    hasItems &&
    isCheckoutFullyPaid({
      carrito: billableCarrito,
      paidPartialUnits,
      quantityDealApplications,
    })

  if (!hasItems && !hasPartialPayment) {
    return { canClose: true, mode: "release", blockReason: null }
  }

  if (!hasItems && hasPartialPayment) {
    return { canClose: true, mode: "settle", blockReason: null }
  }

  if (hasItems && !checkoutFullyPaid) {
    if (hasPartialPayment) {
      return {
        canClose: false,
        mode: null,
        blockReason:
          "Hay ítems cobrados y otros pendientes. Terminá el cobro antes de liberar la mesa.",
      }
    }
    return {
      canClose: false,
      mode: null,
      blockReason: "Hay ítems sin cobrar. Cobrá el pedido antes de liberar la mesa.",
    }
  }

  if (checkoutFullyPaid) {
    if (!hasPartialPayment && totalPagadoAcumulado <= 0) {
      return {
        canClose: false,
        mode: null,
        blockReason: "El pedido aún no tiene cobros registrados.",
      }
    }
    return { canClose: true, mode: "settle", blockReason: null }
  }

  return {
    canClose: false,
    mode: null,
    blockReason: "No se puede liberar la mesa en este estado.",
  }
}
