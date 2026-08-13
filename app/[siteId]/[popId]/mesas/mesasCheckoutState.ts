import type { MenuCartItemKind } from "@/lib/menuCart"
import type { PromotionCartSelection } from "@/lib/promotionPricing"
import type { SaleCatalogPaymentOption } from "@/app/[siteId]/[popId]/sale/actions"
import { healLegacyLockedGeneralDiscount } from "@/lib/generalDiscountLock"

export type MesasCartItem = {
  lineId?: string
  productoId: string
  cantidad: number
  kind?: MenuCartItemKind
  promotionSelections?: PromotionCartSelection[]
  paidLocked?: boolean
}

export type MesasClienteSeleccionado = {
  id: string | null
  manual: boolean
  name: string
  taxId: string | null
  ivaCondition: string | null
  defaultInvoiceTypeLabel: string | null
}

export type TableSessionCheckoutSnapshot = {
  carrito: MesasCartItem[]
  clienteSeleccionado: MesasClienteSeleccionado | null
  manualNombreCliente: string
  fiscalDocVenta: string
  ventaIvaCondition: string
  comprobante: string | null
  metodoPagoSeleccionado: SaleCatalogPaymentOption | null
  payOnClientAccount: boolean
  modoDescuento: "porcentaje" | "fijo"
  valorDescuentoPorcentaje: number
  valorDescuentoFijo: number
  itemDescuentoModo?: Record<string, "porcentaje" | "fijo">
  itemDescuentoDraft?: Record<string, string>
  itemDescuentoSuprimido?: Record<string, true>
  itemComentarios?: Record<string, string>
  /** Unidades ya cobradas en pagos parciales (clave → cantidad). */
  paidPartialUnits?: Record<string, number>
  /** Suma acumulada de pagos parciales en esta sesión/pedido. */
  totalPagadoAcumulado?: number
  /** Tras el primer cobro parcial con descuento general, no se puede editar. */
  descuentoGeneralBloqueado?: boolean
  /** @deprecated Solo lectura legacy para restaurar % tras bloqueo antiguo. */
  subtotalBaseDescuentoGeneral?: number
  /** @deprecated Solo lectura legacy para restaurar % tras bloqueo antiguo. */
  descuentoGeneralTotalFijo?: number
}

export function emptyTableSessionCheckout(
  defaultComprobante: string | null = null,
): TableSessionCheckoutSnapshot {
  return {
    carrito: [],
    clienteSeleccionado: null,
    manualNombreCliente: "",
    fiscalDocVenta: "",
    ventaIvaCondition: "",
    comprobante: defaultComprobante,
    metodoPagoSeleccionado: null,
    payOnClientAccount: false,
    modoDescuento: "porcentaje",
    valorDescuentoPorcentaje: 0,
    valorDescuentoFijo: 0,
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v != null && !Array.isArray(v)
}

function parsePromotionSelections(v: unknown): PromotionCartSelection[] | undefined {
  if (!Array.isArray(v)) return undefined
  const out: PromotionCartSelection[] = []
  for (const raw of v) {
    if (typeof raw !== "object" || raw == null) continue
    const row = raw as Record<string, unknown>
    const slotId = typeof row.slotId === "string" ? row.slotId : ""
    const slotLabel = typeof row.slotLabel === "string" ? row.slotLabel : ""
    const kindRaw = row.kind
    const kind =
      kindRaw === "recipe" ? "recipe" : kindRaw === "article" ? "article" : null
    const refId = typeof row.refId === "string" ? row.refId : ""
    const name = typeof row.name === "string" ? row.name : ""
    const listUnitPrice = Number(row.listUnitPrice)
    const slotQuantity = Number(row.slotQuantity)
    const iva = Number(row.iva)
    if (!slotId || !kind || !refId) continue
    out.push({
      slotId,
      slotLabel,
      kind,
      refId,
      name,
      listUnitPrice: Number.isFinite(listUnitPrice) ? listUnitPrice : 0,
      slotQuantity:
        Number.isFinite(slotQuantity) && slotQuantity > 0
          ? Math.round(slotQuantity)
          : 1,
      iva: Number.isFinite(iva) ? iva : 0,
    })
  }
  return out.length > 0 ? out : undefined
}

function parseCartItem(v: unknown): MesasCartItem | null {
  if (!isRecord(v)) return null
  const productoId = typeof v.productoId === "string" ? v.productoId : ""
  const cantidad = Number(v.cantidad)
  if (!productoId || !Number.isFinite(cantidad) || cantidad <= 0) return null
  const kindRaw = v.kind
  const kind: MenuCartItemKind | undefined =
    kindRaw === "recipe"
      ? "recipe"
      : kindRaw === "article"
        ? "article"
        : kindRaw === "promotion"
          ? "promotion"
          : undefined
  const promotionSelections = parsePromotionSelections(v.promotionSelections)
  const lineId =
    typeof v.lineId === "string" && v.lineId.trim()
      ? v.lineId.trim()
      : undefined
  return {
    ...(lineId ? { lineId } : {}),
    productoId,
    cantidad: Math.round(cantidad),
    ...(kind ? { kind } : {}),
    ...(promotionSelections ? { promotionSelections } : {}),
    ...(v.paidLocked === true ? { paidLocked: true } : {}),
  }
}

function parseCliente(v: unknown): MesasClienteSeleccionado | null {
  if (!isRecord(v)) return null
  return {
    id: typeof v.id === "string" ? v.id : null,
    manual: Boolean(v.manual),
    name: typeof v.name === "string" ? v.name : "",
    taxId: typeof v.taxId === "string" ? v.taxId : null,
    ivaCondition: typeof v.ivaCondition === "string" ? v.ivaCondition : null,
    defaultInvoiceTypeLabel:
      typeof v.defaultInvoiceTypeLabel === "string"
        ? v.defaultInvoiceTypeLabel
        : null,
  }
}

function parseStringRecord(v: unknown): Record<string, string> | undefined {
  if (!isRecord(v)) return undefined
  const out: Record<string, string> = {}
  for (const [k, val] of Object.entries(v)) {
    if (typeof val === "string") out[k] = val
  }
  return Object.keys(out).length > 0 ? out : undefined
}

function parseDescuentoModoRecord(
  v: unknown,
): Record<string, "porcentaje" | "fijo"> | undefined {
  if (!isRecord(v)) return undefined
  const out: Record<string, "porcentaje" | "fijo"> = {}
  for (const [k, val] of Object.entries(v)) {
    if (val === "porcentaje" || val === "fijo") out[k] = val
  }
  return Object.keys(out).length > 0 ? out : undefined
}

function parseSuprimidoRecord(v: unknown): Record<string, true> | undefined {
  if (!isRecord(v)) return undefined
  const out: Record<string, true> = {}
  for (const k of Object.keys(v)) {
    if (v[k] === true) out[k] = true
  }
  return Object.keys(out).length > 0 ? out : undefined
}

export function parseTableSessionCheckout(
  raw: unknown,
): TableSessionCheckoutSnapshot | null {
  if (!isRecord(raw)) return null

  const carrito = Array.isArray(raw.carrito)
    ? raw.carrito.map(parseCartItem).filter((x): x is MesasCartItem => x != null)
    : []

  const modoDescuento =
    raw.modoDescuento === "fijo" ? "fijo" : ("porcentaje" as const)

  const metodoRaw = raw.metodoPagoSeleccionado
  const metodoPagoSeleccionado =
    isRecord(metodoRaw) &&
    typeof metodoRaw.kind === "string" &&
    typeof metodoRaw.treasuryAccountId === "string" &&
    typeof metodoRaw.label === "string"
      ? {
          kind: metodoRaw.kind as SaleCatalogPaymentOption["kind"],
          treasuryAccountId: metodoRaw.treasuryAccountId,
          label: metodoRaw.label,
        }
      : null

  return healLegacyLockedGeneralDiscount({
    carrito,
    clienteSeleccionado: parseCliente(raw.clienteSeleccionado),
    manualNombreCliente:
      typeof raw.manualNombreCliente === "string" ? raw.manualNombreCliente : "",
    fiscalDocVenta:
      typeof raw.fiscalDocVenta === "string" ? raw.fiscalDocVenta : "",
    ventaIvaCondition:
      typeof raw.ventaIvaCondition === "string" ? raw.ventaIvaCondition : "",
    comprobante: typeof raw.comprobante === "string" ? raw.comprobante : null,
    metodoPagoSeleccionado,
    payOnClientAccount: Boolean(raw.payOnClientAccount),
    modoDescuento,
    valorDescuentoPorcentaje: Number.isFinite(Number(raw.valorDescuentoPorcentaje))
      ? Math.max(0, Number(raw.valorDescuentoPorcentaje))
      : 0,
    valorDescuentoFijo: Number.isFinite(Number(raw.valorDescuentoFijo))
      ? Math.max(0, Number(raw.valorDescuentoFijo))
      : 0,
    itemDescuentoModo: parseDescuentoModoRecord(raw.itemDescuentoModo),
    itemDescuentoDraft: parseStringRecord(raw.itemDescuentoDraft),
    itemDescuentoSuprimido: parseSuprimidoRecord(raw.itemDescuentoSuprimido),
    itemComentarios: parseStringRecord(raw.itemComentarios),
    paidPartialUnits: parseNumericRecord(raw.paidPartialUnits),
    totalPagadoAcumulado: Number.isFinite(Number(raw.totalPagadoAcumulado))
      ? Math.max(0, Number(raw.totalPagadoAcumulado))
      : 0,
    descuentoGeneralBloqueado: raw.descuentoGeneralBloqueado === true,
    subtotalBaseDescuentoGeneral: Number.isFinite(
      Number(raw.subtotalBaseDescuentoGeneral),
    )
      ? Math.max(0, Number(raw.subtotalBaseDescuentoGeneral))
      : 0,
    descuentoGeneralTotalFijo: Number.isFinite(
      Number(raw.descuentoGeneralTotalFijo),
    )
      ? Math.max(0, Number(raw.descuentoGeneralTotalFijo))
      : 0,
  })
}

function parseNumericRecord(v: unknown): Record<string, number> | undefined {
  if (!isRecord(v)) return undefined
  const out: Record<string, number> = {}
  for (const [k, val] of Object.entries(v)) {
    const n = Number(val)
    if (Number.isFinite(n) && n > 0) out[k] = n
  }
  return Object.keys(out).length > 0 ? out : undefined
}

export function readCheckoutFromSessionMetadata(
  metadata: unknown,
): TableSessionCheckoutSnapshot | null {
  if (!isRecord(metadata)) return null
  return parseTableSessionCheckout(metadata.checkout)
}

/** Estado visual en el plano — persistido en table_sessions.metadata.floor_status */
export type MesaSessionFloorStatus = "open" | "paying"

const MESA_FLOOR_STATUS_PAYING = "paying" as const

export function readFloorStatusFromSessionMetadata(
  metadata: unknown,
): MesaSessionFloorStatus {
  if (!isRecord(metadata)) return "open"
  return metadata.floor_status === MESA_FLOOR_STATUS_PAYING ? "paying" : "open"
}

export function floorStatusToSessionMetadataValue(
  floorStatus: MesaSessionFloorStatus,
): typeof MESA_FLOOR_STATUS_PAYING | null {
  return floorStatus === "paying" ? MESA_FLOOR_STATUS_PAYING : null
}
