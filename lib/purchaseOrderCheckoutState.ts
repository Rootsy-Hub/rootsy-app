import type { PurchaseCatalogPaymentOption } from "@/app/[siteId]/[popId]/purchases/actions"
import { isValidOperationPaymentKind } from "@/lib/operationPaymentKinds"

export type PurchaseCartItem = {
  lineId: string
  productoId: string
  articleCostId: string
  cantidad: number
}

export type PurchaseSupplierSelection = {
  id: string | null
  manual: boolean
  name: string
  taxId: string
  ivaCondition: string | null
  defaultInvoiceTypeLabel: string | null
}

export type PurchaseCheckoutSnapshot = {
  carrito: PurchaseCartItem[]
  proveedorSeleccionado: PurchaseSupplierSelection | null
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
  itemExpiresAt: Record<string, string>
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v != null && !Array.isArray(v)
}

function parseStringRecord(v: unknown): Record<string, string> {
  if (!isRecord(v)) return {}
  const out: Record<string, string> = {}
  for (const [k, val] of Object.entries(v)) {
    if (typeof val === "string") out[k] = val
  }
  return out
}

function parseBooleanRecord(v: unknown): Record<string, boolean> {
  if (!isRecord(v)) return {}
  const out: Record<string, boolean> = {}
  for (const [k, val] of Object.entries(v)) {
    if (typeof val === "boolean") out[k] = val
  }
  return out
}

function parseDescuentoModoRecord(
  v: unknown,
): Record<string, "porcentaje" | "fijo"> {
  if (!isRecord(v)) return {}
  const out: Record<string, "porcentaje" | "fijo"> = {}
  for (const [k, val] of Object.entries(v)) {
    if (val === "porcentaje" || val === "fijo") out[k] = val
  }
  return out
}

function parseCartItem(v: unknown): PurchaseCartItem | null {
  if (!isRecord(v)) return null
  const lineId = typeof v.lineId === "string" ? v.lineId.trim() : ""
  const productoId = typeof v.productoId === "string" ? v.productoId : ""
  const articleCostId =
    typeof v.articleCostId === "string" ? v.articleCostId : ""
  const cantidad = Number(v.cantidad)
  if (!lineId || !productoId || !articleCostId) return null
  if (!Number.isFinite(cantidad) || cantidad <= 0) return null
  return {
    lineId,
    productoId,
    articleCostId,
    cantidad: Math.round(cantidad),
  }
}

function parseSupplier(v: unknown): PurchaseSupplierSelection | null {
  if (!isRecord(v)) return null
  return {
    id: typeof v.id === "string" ? v.id : null,
    manual: Boolean(v.manual),
    name: typeof v.name === "string" ? v.name : "",
    taxId: typeof v.taxId === "string" ? v.taxId : "",
    ivaCondition:
      typeof v.ivaCondition === "string" ? v.ivaCondition : null,
    defaultInvoiceTypeLabel:
      typeof v.defaultInvoiceTypeLabel === "string"
        ? v.defaultInvoiceTypeLabel
        : null,
  }
}

function parsePaymentOption(v: unknown): PurchaseCatalogPaymentOption | null {
  if (!isRecord(v)) return null
  const kindRaw = v.kind
  if (typeof kindRaw !== "string" || !isValidOperationPaymentKind(kindRaw)) {
    return null
  }
  const treasuryAccountId =
    typeof v.treasuryAccountId === "string" ? v.treasuryAccountId : ""
  const label = typeof v.label === "string" ? v.label : ""
  if (!treasuryAccountId || !label.trim()) return null
  return { kind: kindRaw, treasuryAccountId, label }
}

export function parsePurchaseCheckoutSnapshot(
  raw: unknown,
): PurchaseCheckoutSnapshot | null {
  if (!isRecord(raw)) return null

  const carrito = Array.isArray(raw.carrito)
    ? raw.carrito
        .map(parseCartItem)
        .filter((item): item is PurchaseCartItem => item != null)
    : []

  const modoDescuento =
    raw.modoDescuento === "fijo" ? "fijo" : ("porcentaje" as const)

  return {
    carrito,
    proveedorSeleccionado: parseSupplier(raw.proveedorSeleccionado),
    manualNombreProveedor:
      typeof raw.manualNombreProveedor === "string"
        ? raw.manualNombreProveedor
        : "",
    proveedorTaxId:
      typeof raw.proveedorTaxId === "string" ? raw.proveedorTaxId : "",
    compraIvaCondition:
      typeof raw.compraIvaCondition === "string" ? raw.compraIvaCondition : "",
    documentNumber:
      typeof raw.documentNumber === "string" ? raw.documentNumber : "",
    documentDate: typeof raw.documentDate === "string" ? raw.documentDate : "",
    dueDate: typeof raw.dueDate === "string" ? raw.dueDate : "",
    comprobanteTipo:
      typeof raw.comprobanteTipo === "string" ? raw.comprobanteTipo : null,
    attachmentFileName:
      typeof raw.attachmentFileName === "string"
        ? raw.attachmentFileName
        : null,
    payOnSupplierAccount: Boolean(raw.payOnSupplierAccount),
    metodoPagoSeleccionado: parsePaymentOption(raw.metodoPagoSeleccionado),
    cardInstallments:
      typeof raw.cardInstallments === "string" ? raw.cardInstallments : "1",
    modoDescuento,
    valorDescuentoPorcentaje: Number.isFinite(
      Number(raw.valorDescuentoPorcentaje),
    )
      ? Math.max(0, Number(raw.valorDescuentoPorcentaje))
      : 0,
    valorDescuentoFijo: Number.isFinite(Number(raw.valorDescuentoFijo))
      ? Math.max(0, Number(raw.valorDescuentoFijo))
      : 0,
    itemUnitCosts: parseStringRecord(raw.itemUnitCosts),
    itemUpdateArticleCost: parseBooleanRecord(raw.itemUpdateArticleCost),
    itemDescuentoModo: parseDescuentoModoRecord(raw.itemDescuentoModo),
    itemDescuentoDraft: parseStringRecord(raw.itemDescuentoDraft),
    itemComentarios: parseStringRecord(raw.itemComentarios),
    itemExpiresAt: parseStringRecord(raw.itemExpiresAt),
  }
}
