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
import type { MostradorCartDisplayRow } from "@/lib/mostradorCartDisplay"
import { CLIENT_ACCOUNT_PAYMENT_LABEL } from "@/lib/operationPaymentLabels"
import type {
  SaleQuoteLineGroup,
  SaleQuoteLineSummary,
} from "@/lib/saleQuoteTypes"
import {
  buildQuoteLineSummariesFromLineGroups,
} from "@/lib/saleQuoteDocumentLines"

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

export function buildQuoteLineGroupsFromDisplayRows(
  rows: MostradorCartDisplayRow[],
  overrides: Pick<
    OperationCartLineOverrideState,
    | "itemDescuentoModo"
    | "itemDescuentoDraft"
    | "itemDescuentoSuprimido"
    | "itemComentarios"
  >,
): SaleQuoteLineGroup[] {
  return buildSaleComprobantePreviewLineGroups(rows, overrides)
    .map((group) => ({
      id: group.id,
      category: group.category,
      promotionDiscount: group.promotionDiscount
        ? {
            label: group.promotionDiscount.label,
            amount: group.promotionDiscount.amount,
          }
        : null,
      lines: group.lines.map((line) => ({
        name: quoteLineNameFromDescription(line.description),
        quantity: line.quantity,
        unitListPrice: line.unitListPrice,
        listLineTotal: line.listLineTotal,
        lineTotal: line.lineTotal,
        discounts: line.discounts
          .filter((discount) => discount.amount > 0)
          .map((discount) => ({
            label: discount.label,
            amount: discount.amount,
          })),
      })),
    }))
    .filter((group) => group.lines.length > 0)
}

export function buildQuoteLineSummariesFromDisplayRows(
  rows: MostradorCartDisplayRow[],
  overrides: Pick<
    OperationCartLineOverrideState,
    | "itemDescuentoModo"
    | "itemDescuentoDraft"
    | "itemDescuentoSuprimido"
    | "itemComentarios"
  >,
): SaleQuoteLineSummary[] {
  return buildQuoteLineSummariesFromLineGroups(
    buildQuoteLineGroupsFromDisplayRows(rows, overrides),
  )
}

function quoteLineNameFromDescription(description: string): string {
  const trimmed = description.trim()
  if (!trimmed) return "Ítem"
  return trimmed
    .toLowerCase()
    .replace(/(^|\s|\/)\S/g, (match) => match.toUpperCase())
}

export function buildQuoteLineGroupsFromCheckoutSnapshot(
  snapshot: TableSessionCheckoutSnapshot,
  catalog: {
    articles: MenuCatalogArticle[]
    promotions: MenuCatalogPromotion[]
    quantityDeals: MenuCatalogPromotion[]
  },
): SaleQuoteLineGroup[] {
  const rows = buildQuoteDisplayRowsFromCheckoutSnapshot(snapshot, catalog)
  const overrides = {
    itemDescuentoModo: snapshot.itemDescuentoModo ?? {},
    itemDescuentoDraft: snapshot.itemDescuentoDraft ?? {},
    itemDescuentoSuprimido: snapshot.itemDescuentoSuprimido ?? {},
    itemComentarios: snapshot.itemComentarios ?? {},
  }
  return buildQuoteLineGroupsFromDisplayRows(rows, overrides)
}

function buildQuoteDisplayRowsFromCheckoutSnapshot(
  snapshot: TableSessionCheckoutSnapshot,
  catalog: {
    articles: MenuCatalogArticle[]
    promotions: MenuCatalogPromotion[]
    quantityDeals: MenuCatalogPromotion[]
  },
): MostradorCartDisplayRow[] {
  const productosCatalogo = [
    ...catalog.promotions.map(menuPromotionToProduct),
    ...catalog.articles.map(menuArticleToProduct),
  ]
  const productosByKey = buildMenuProductMap(productosCatalogo)

  const carrito: MenuCartItem[] = snapshot.carrito.flatMap((item) => {
    const kind = normalizeCartItemKind(item.kind)
    const producto =
      productosByKey.get(`${kind}:${item.productoId}`) ?? null
    if (kind === "promotion" && !item.promotionSelections?.length) {
      return []
    }
    if (kind !== "promotion" && !producto) return []
    return [
      {
        lineId: item.lineId,
        productoId: item.productoId,
        cantidad: item.cantidad,
        kind,
        promotionSelections: item.promotionSelections,
        paidLocked: item.paidLocked,
        comandaStatus: item.comandaStatus,
      },
    ]
  })

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
      carrito.map((item) => {
        const kind = normalizeCartItemKind(item.kind)
        const producto =
          productosByKey.get(`${kind}:${item.productoId}`) ?? null
        return {
          lineId: resolveCartLineId(item),
          productoId: item.productoId,
          kind: item.kind,
          cantidad: item.cantidad,
          producto,
          promotionSelections: item.promotionSelections,
          paidLocked: item.paidLocked,
          comandaStatus: item.comandaStatus,
        }
      }),
    ),
    applications,
    overrides,
    productosByKey,
  })

  return rows
}

export function buildQuoteLineSummariesFromCheckoutSnapshot(
  snapshot: TableSessionCheckoutSnapshot,
  catalog: {
    articles: MenuCatalogArticle[]
    promotions: MenuCatalogPromotion[]
    quantityDeals: MenuCatalogPromotion[]
  },
): SaleQuoteLineSummary[] {
  return buildQuoteLineSummariesFromLineGroups(
    buildQuoteLineGroupsFromCheckoutSnapshot(snapshot, catalog),
  )
}
