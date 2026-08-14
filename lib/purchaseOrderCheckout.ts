import type { PurchaseCatalogPaymentOption } from "@/app/[siteId]/[popId]/purchases/actions"
import type { PurchaseCatalogArticle } from "@/app/[siteId]/[popId]/purchases/actions"
import type { PurchaseCheckoutSnapshot } from "@/lib/purchaseOrderCheckoutState"
import type { PurchaseOrderLineSummary } from "@/lib/purchaseOrderTypes"
import { SUPPLIER_ACCOUNT_PAYMENT_LABEL } from "@/lib/operationPaymentLabels"
import { resolveSaleLineDiscount, roundSaleMoney } from "@/lib/saleLineDiscount"

export type PurchaseOrderCartItem = {
  lineId: string
  productoId: string
  articleCostId: string
  cantidad: number
}

export type PurchaseOrderSupplierSelection = {
  id: string | null
  manual: boolean
  name: string
  taxId: string
  ivaCondition: string | null
  defaultInvoiceTypeLabel: string | null
}

export type BuildPurchaseOrderCheckoutInput = {
  carrito: PurchaseOrderCartItem[]
  proveedorSeleccionado: PurchaseOrderSupplierSelection | null
  manualNombreProveedor: string
  proveedorTaxId: string
  compraIvaCondition: string
  documentNumber: string
  documentDate: string
  dueDate: string
  comprobanteTipo: string | null
  attachmentFileName: string | null
  payOnSupplierAccount: boolean
  metodoPagoSeleccionado: PurchaseCatalogPaymentOption | null
  cardInstallments: string
  modoDescuento: "porcentaje" | "fijo"
  valorDescuentoPorcentaje: number
  valorDescuentoFijo: number
  itemUnitCosts: Record<string, string>
  itemUpdateArticleCost: Record<string, boolean>
  itemDescuentoModo: Record<string, "porcentaje" | "fijo">
  itemDescuentoDraft: Record<string, string>
  itemComentarios: Record<string, string>
}

export function buildPurchaseOrderCheckoutSnapshot(
  input: BuildPurchaseOrderCheckoutInput,
): PurchaseCheckoutSnapshot {
  return {
    carrito: input.carrito.map((item) => ({ ...item })),
    proveedorSeleccionado: input.proveedorSeleccionado
      ? { ...input.proveedorSeleccionado }
      : null,
    manualNombreProveedor: input.manualNombreProveedor,
    proveedorTaxId: input.proveedorTaxId,
    compraIvaCondition: input.compraIvaCondition,
    documentNumber: input.documentNumber,
    documentDate: input.documentDate,
    dueDate: input.dueDate,
    comprobanteTipo: input.comprobanteTipo,
    attachmentFileName: input.attachmentFileName,
    payOnSupplierAccount: input.payOnSupplierAccount,
    metodoPagoSeleccionado: input.metodoPagoSeleccionado
      ? { ...input.metodoPagoSeleccionado }
      : null,
    cardInstallments: input.cardInstallments,
    modoDescuento: input.modoDescuento,
    valorDescuentoPorcentaje: input.valorDescuentoPorcentaje,
    valorDescuentoFijo: input.valorDescuentoFijo,
    itemUnitCosts: { ...input.itemUnitCosts },
    itemUpdateArticleCost: { ...input.itemUpdateArticleCost },
    itemDescuentoModo: { ...input.itemDescuentoModo },
    itemDescuentoDraft: { ...input.itemDescuentoDraft },
    itemComentarios: { ...input.itemComentarios },
  }
}

export function formatPurchaseOrderPaymentLabel(input: {
  payOnSupplierAccount: boolean
  metodoPagoSeleccionado: PurchaseCatalogPaymentOption | null
}): string | null {
  if (input.payOnSupplierAccount) return SUPPLIER_ACCOUNT_PAYMENT_LABEL
  return input.metodoPagoSeleccionado?.label ?? null
}

export function formatPurchaseOrderDiscountLabel(input: {
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

function parsePurchaseUnitCost(raw: string, fallback: number): number {
  const n = Number.parseFloat(raw.trim().replace(",", "."))
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.round(n * 100) / 100
}

export type PurchaseOrderLineBuildInput = {
  lineId: string
  cantidad: number
  productName: string
  costLabel: string
  unitCost: number
}

export function buildPurchaseOrderLineSummariesFromCart(input: {
  items: PurchaseOrderLineBuildInput[]
  itemDescuentoModo: Record<string, "porcentaje" | "fijo">
  itemDescuentoDraft: Record<string, string>
}): PurchaseOrderLineSummary[] {
  return input.items.map((item) => {
    const draft = input.itemDescuentoDraft[item.lineId] ?? ""
    const pricing = resolveSaleLineDiscount({
      listUnitPrice: item.unitCost,
      quantity: item.cantidad,
      manualDiscount:
        draft.trim() !== ""
          ? {
              mode: input.itemDescuentoModo[item.lineId] ?? "porcentaje",
              draft,
            }
          : null,
    })
    const name = item.costLabel.trim()
      ? `${item.productName} — ${item.costLabel}`
      : item.productName

    return {
      name,
      quantity: item.cantidad,
      unitPrice:
        item.cantidad > 0
          ? roundSaleMoney(pricing.lineSubtotal / item.cantidad)
          : 0,
      lineTotal: pricing.lineSubtotal,
    }
  })
}

export function buildPurchaseOrderLineSummariesFromSnapshot(
  snapshot: PurchaseCheckoutSnapshot,
  catalogArticles: PurchaseCatalogArticle[],
): PurchaseOrderLineSummary[] {
  const items: PurchaseOrderLineBuildInput[] = []

  for (const cartItem of snapshot.carrito) {
    const article = catalogArticles.find((a) => a.id === cartItem.productoId)
    const cost = article?.costs.find((c) => c.id === cartItem.articleCostId)
    if (!article || !cost) continue

    const fallback = cost.unitPrice
    const unitCost = parsePurchaseUnitCost(
      snapshot.itemUnitCosts[cartItem.lineId] ?? "",
      fallback,
    )

    items.push({
      lineId: cartItem.lineId,
      cantidad: cartItem.cantidad,
      productName: article.name,
      costLabel: cost.name,
      unitCost,
    })
  }

  return buildPurchaseOrderLineSummariesFromCart({
    items,
    itemDescuentoModo: snapshot.itemDescuentoModo,
    itemDescuentoDraft: snapshot.itemDescuentoDraft,
  })
}
