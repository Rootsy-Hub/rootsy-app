import type { MenuCatalogArticle, MenuCatalogPromotion } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import type { TableSessionCheckoutSnapshot } from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"
import type { SaleCatalogPaymentOption } from "@/app/[siteId]/[popId]/sale/actions"
import type { OperationCartLineOverrideState } from "@/components/sale-operation/OperationCartLineRow"
import {
  buildMenuProductMap,
  computeMenuQuantityDealApplications,
  menuPromotionToProduct,
} from "@/lib/menuCheckoutPromotions"
import { menuArticleToProduct } from "@/lib/menuCatalogProduct"
import {
  buildMostradorCartDisplayRows,
  cartDetailItemsFromCarrito,
} from "@/lib/mostradorCartDisplay"
import { normalizeCartItemKind, resolveCartLineId, type MenuCartItem } from "@/lib/menuCart"
import { buildSaleComprobantePreviewLineGroups } from "@/lib/saleComprobantePreview"
import { roundSaleMoney } from "@/lib/saleLineDiscount"
import type { MostradorCartDisplayRow } from "@/lib/mostradorCartDisplay"
import { CLIENT_ACCOUNT_PAYMENT_LABEL } from "@/lib/operationPaymentLabels"
import type { SaleQuoteLineSummary } from "@/lib/saleQuoteTypes"

type SaleQuoteClientSelection = {
  id: string | null
  manual: boolean
  name: string
  taxId: string | null
  email?: string | null
  ivaCondition: string | null
  defaultInvoiceTypeLabel: string | null
} | null

export type BuildSaleQuoteCheckoutInput = {
  carrito: MenuCartItem[]
  clienteSeleccionado: SaleQuoteClientSelection
  manualNombreCliente: string
  fiscalDocVenta: string
  ventaIvaCondition: string
  comprobante: string | null
  metodoPagoSeleccionado: SaleCatalogPaymentOption | null
  payOnClientAccount: boolean
  modoDescuento: "porcentaje" | "fijo"
  valorDescuentoPorcentaje: number
  valorDescuentoFijo: number
  cartLineOverrides: Pick<
    OperationCartLineOverrideState,
    | "itemDescuentoModo"
    | "itemDescuentoDraft"
    | "itemDescuentoSuprimido"
    | "itemComentarios"
  >
}

export function buildSaleQuoteCheckoutSnapshot(
  input: BuildSaleQuoteCheckoutInput,
): TableSessionCheckoutSnapshot {
  return {
    carrito: input.carrito.map((item) => ({ ...item })),
    clienteSeleccionado: input.clienteSeleccionado
      ? { ...input.clienteSeleccionado }
      : null,
    manualNombreCliente: input.manualNombreCliente,
    fiscalDocVenta: input.fiscalDocVenta,
    ventaIvaCondition: input.ventaIvaCondition,
    comprobante: input.comprobante,
    metodoPagoSeleccionado: input.metodoPagoSeleccionado
      ? { ...input.metodoPagoSeleccionado }
      : null,
    payOnClientAccount: input.payOnClientAccount,
    modoDescuento: input.modoDescuento,
    valorDescuentoPorcentaje: input.valorDescuentoPorcentaje,
    valorDescuentoFijo: input.valorDescuentoFijo,
    itemDescuentoModo: { ...input.cartLineOverrides.itemDescuentoModo },
    itemDescuentoDraft: { ...input.cartLineOverrides.itemDescuentoDraft },
    itemDescuentoSuprimido: { ...input.cartLineOverrides.itemDescuentoSuprimido },
    itemComentarios: { ...input.cartLineOverrides.itemComentarios },
  }
}

export function formatSaleQuotePaymentLabel(input: {
  payOnClientAccount: boolean
  metodoPagoSeleccionado: SaleCatalogPaymentOption | null
}): string | null {
  if (input.payOnClientAccount) return CLIENT_ACCOUNT_PAYMENT_LABEL
  return input.metodoPagoSeleccionado?.label ?? null
}

export function formatSaleQuoteDiscountLabel(input: {
  modoDescuento: "porcentaje" | "fijo"
  valorDescuentoPorcentaje: number
  valorDescuentoFijo: number
  descuentoMonto: number
}): string | null {
  if (input.descuentoMonto <= 0) return null
  if (input.modoDescuento === "porcentaje" && input.valorDescuentoPorcentaje > 0) {
    return `${input.valorDescuentoPorcentaje}%`
  }
  if (input.modoDescuento === "fijo" && input.valorDescuentoFijo > 0) {
    return `Fijo ${input.valorDescuentoFijo.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }
  return null
}

export function buildQuoteLineSummariesFromDisplayRows(
  rows: MostradorCartDisplayRow[],
  overrides: Pick<
    OperationCartLineOverrideState,
    "itemDescuentoModo" | "itemDescuentoDraft" | "itemDescuentoSuprimido"
  >,
): SaleQuoteLineSummary[] {
  const groups = buildSaleComprobantePreviewLineGroups(rows, overrides)
  const summaries: SaleQuoteLineSummary[] = []

  for (const group of groups) {
    const promoDiscount = group.promotionDiscount?.amount ?? 0
    const groupListTotal = group.lines.reduce(
      (sum, line) => sum + line.listLineTotal,
      0,
    )

    for (const line of group.lines) {
      let lineTotal = line.lineTotal
      if (promoDiscount > 0 && groupListTotal > 0) {
        const share = line.listLineTotal / groupListTotal
        lineTotal = roundSaleMoney(
          Math.max(0, line.lineTotal - promoDiscount * share),
        )
      }

      if (line.quantity <= 0 || lineTotal <= 0) continue

      summaries.push({
        name: quoteLineNameFromDescription(line.description),
        quantity: line.quantity,
        unitPrice:
          line.quantity > 0
            ? roundSaleMoney(lineTotal / line.quantity)
            : 0,
        lineTotal,
      })
    }
  }

  return summaries
}

function quoteLineNameFromDescription(description: string): string {
  const trimmed = description.trim()
  if (!trimmed) return "Ítem"
  return trimmed
    .toLowerCase()
    .replace(/(^|\s|\/)\S/g, (match) => match.toUpperCase())
}

export function buildQuoteLineSummariesFromCheckoutSnapshot(
  snapshot: TableSessionCheckoutSnapshot,
  catalog: {
    articles: MenuCatalogArticle[]
    promotions: MenuCatalogPromotion[]
    quantityDeals: MenuCatalogPromotion[]
  },
): SaleQuoteLineSummary[] {
  const productosCatalogo = [
    ...catalog.promotions.map(menuPromotionToProduct),
    ...catalog.articles.map(menuArticleToProduct),
  ]
  const productosByKey = buildMenuProductMap(productosCatalogo)

  const carrito: MenuCartItem[] = snapshot.carrito
    .map((item) => {
      const kind = normalizeCartItemKind(item.kind)
      const producto =
        productosByKey.get(`${kind}:${item.productoId}`) ?? null
      if (kind === "promotion" && !item.promotionSelections?.length) {
        return null
      }
      if (kind !== "promotion" && !producto) return null
      return {
        lineId: item.lineId,
        productoId: item.productoId,
        cantidad: item.cantidad,
        kind,
        promotionSelections: item.promotionSelections,
        paidLocked: item.paidLocked,
        producto,
      }
    })
    .filter((item): item is MenuCartItem => item != null)

  const overrides = {
    itemDescuentoModo: snapshot.itemDescuentoModo ?? {},
    itemDescuentoDraft: snapshot.itemDescuentoDraft ?? {},
    itemDescuentoSuprimido: snapshot.itemDescuentoSuprimido ?? {},
    itemComentarios: snapshot.itemComentarios ?? {},
  }

  const applications = computeMenuQuantityDealApplications({
    carrito,
    productosByKey,
    quantityDeals: catalog.quantityDeals,
    overrides,
  })

  const rows = buildMostradorCartDisplayRows({
    items: cartDetailItemsFromCarrito(
      carrito.map((item) => ({
        lineId: resolveCartLineId(item),
        productoId: item.productoId,
        kind: item.kind,
        cantidad: item.cantidad,
        producto: item.producto,
        promotionSelections: item.promotionSelections,
        paidLocked: item.paidLocked,
      })),
    ),
    applications,
    overrides,
    productosByKey,
  })

  return buildQuoteLineSummariesFromDisplayRows(rows, overrides)
}
