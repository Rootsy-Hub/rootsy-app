import { computeGeneralDiscountMonto } from "@/lib/generalDiscountLock"
import { menuCartOrderTotals } from "@/lib/menuCheckoutPromotions"
import { roundSaleMoney } from "@/lib/saleLineDiscount"

type CatalogTotals = ReturnType<typeof menuCartOrderTotals>

export function computeOrderTotalBreakdown(input: {
  catalogTotals: CatalogTotals
  modoDescuento: "porcentaje" | "fijo"
  valorDescuentoPorcentaje: number
  valorDescuentoFijo: number
  totalPagado?: number
}) {
  const subtotalOriginal = input.catalogTotals.subtotalOriginal
  const descuentoItemsMonto = roundSaleMoney(
    input.catalogTotals.descuentoCatalogoMonto +
      input.catalogTotals.descuentoManualMonto,
  )
  const promocionesAplicadasMonto = roundSaleMoney(
    input.catalogTotals.descuentoPromoMonto +
      input.catalogTotals.descuentoQuantityDealMonto,
  )
  const subtotalBeforeGeneral = input.catalogTotals.subtotal
  const descuentoMonto = computeGeneralDiscountMonto({
    subtotal: subtotalBeforeGeneral,
    modoDescuento: input.modoDescuento,
    valorDescuentoPorcentaje: input.valorDescuentoPorcentaje,
    valorDescuentoFijo: input.valorDescuentoFijo,
  })
  const orderTotalNet = roundSaleMoney(
    Math.max(0, subtotalBeforeGeneral - descuentoMonto),
  )
  const totalPagado = roundSaleMoney(Math.max(0, input.totalPagado ?? 0))
  const total = roundSaleMoney(Math.max(0, orderTotalNet - totalPagado))

  return {
    subtotalOriginal,
    descuentoItemsMonto,
    promocionesAplicadasMonto,
    subtotalBeforeGeneral,
    descuentoMonto,
    orderTotalNet,
    totalPagado,
    total,
    hayDescuentoItems: descuentoItemsMonto > 0,
    hayDescuento: descuentoMonto > 0,
  }
}
