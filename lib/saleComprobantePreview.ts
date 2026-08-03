import { resolveCatalogCartLinePricing } from "@/components/sale-operation/saleCatalogProduct"
import type { CartLineOverrideSnapshot } from "@/lib/menuCartLineMerge"
import {
  type MostradorCartDisplayRow,
} from "@/lib/mostradorCartDisplay"
import { resolvePromotionCartPricing } from "@/lib/menuCheckoutPromotions"
import {
  findSaleInvoiceTypeByLabel,
  type SaleInvoiceTypeOption,
} from "@/lib/saleInvoiceTypes"
import {
  isInternalSaleComprobante,
  SALE_COMPROBANTE_SIN_LABEL,
} from "@/lib/saleComprobantePicker"
import { roundSaleMoney } from "@/lib/saleLineDiscount"

export type SaleComprobanteEmitterContext = {
  tradeName: string
  razonSocial: string
  address: string | null
  cuit: string | null
  ingresosBrutos: string | null
  inicioActividades: string | null
  phone: string | null
  arcaPtoVta: number | null
}

export type SaleComprobantePreviewLineDiscount = {
  label: string
  amount: number
}

export type SaleComprobantePreviewLine = {
  description: string
  category: string | null
  quantity: number
  unitListPrice: number
  vatRate: number
  listLineTotal: number
  lineTotal: number
  barcode: string | null
  discounts: SaleComprobantePreviewLineDiscount[]
}

export type SaleComprobantePreviewLineGroup = {
  category: string
  lines: SaleComprobantePreviewLine[]
}

export type SaleComprobantePreviewVatRow = {
  label: string
  net: number
  vat: number
}

export type SaleComprobantePreviewKind = "none" | "internal" | "arca"

export type SaleComprobantePreviewModel = {
  kind: SaleComprobantePreviewKind
  title: string
  receptorSubtitle: string | null
  cbteCodigo: string | null
  cbteTipo: number | null
  emitter: SaleComprobanteEmitterContext
  ptoVta: string
  cbteNro: string
  issuedAt: Date
  customerName: string
  customerTaxId: string | null
  customerIvaLabel: string | null
  paymentMethodLabel: string | null
  lineGroups: SaleComprobantePreviewLineGroup[]
  subtotal: number
  discountAmount: number
  netTaxable: number
  vatRows: SaleComprobantePreviewVatRow[]
  vatTotal: number
  total: number
  showsFiscalFooter: boolean
  showsVatBreakdown: boolean
  footerNote: string | null
}

export type SaleComprobantePreviewCartInput = {
  cartDisplayRows: MostradorCartDisplayRow[]
  cartLineOverrides: Pick<
    CartLineOverrideSnapshot,
    | "itemDescuentoModo"
    | "itemDescuentoDraft"
    | "itemDescuentoSuprimido"
    | "itemComentarios"
  >
  subtotal: number
  discountAmount: number
  total: number
}

export type BuildSaleComprobantePreviewInput = SaleComprobantePreviewCartInput & {
  siteId: string
  comprobanteLabel: string | null
  emitter: SaleComprobanteEmitterContext | null
  customerName: string
  customerTaxId: string | null
  customerIvaLabel: string | null
  paymentMethodLabel?: string | null
  issuedAt?: Date
}

const moneyFmt = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const ticketAmountFmt = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
})

export function formatSaleComprobanteMoney(value: number): string {
  return moneyFmt.format(roundSaleMoney(value))
}

/** Importe estilo ticket térmico (sin símbolo, coma decimal). */
export function formatSaleComprobanteTicketAmount(value: number): string {
  return ticketAmountFmt.format(roundSaleMoney(value))
}

export function formatSaleComprobanteCuit(value: string | null | undefined): string {
  const digits = String(value ?? "").replace(/\D/g, "")
  if (digits.length !== 11) return value?.trim() || "—"
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`
}

export function formatSaleComprobantePtoVta(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "00001"
  return String(Math.max(0, Math.floor(value))).padStart(5, "0")
}

export function formatSaleComprobanteCbteNro(value = 1): string {
  return String(Math.max(1, Math.floor(value))).padStart(8, "0")
}

export function formatSaleComprobanteTicketDate(
  date: Date,
  timeZone: string,
): string {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(date)
}

export function formatSaleComprobanteTicketTime(
  date: Date,
  timeZone: string,
): string {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date)
}

export function formatSaleComprobanteActivityDate(
  value: string | null | undefined,
): string {
  const raw = value?.trim()
  if (!raw) return "—"
  const iso = raw.slice(0, 10)
  const [y, m, d] = iso.split("-")
  if (y && m && d) return `${d}/${m}/${y}`
  return raw
}

function resolveRowVatRate(row: MostradorCartDisplayRow): number {
  const iva = row.producto?.iva
  if (iva != null && Number.isFinite(iva) && iva > 0) return iva
  return 21
}

function resolveLineBarcode(row: MostradorCartDisplayRow): string | null {
  if (row.kind !== "article") return null
  const barcode = row.producto?.barcode?.trim()
  return barcode || null
}

function resolveDiscountLabel(
  row: MostradorCartDisplayRow,
  pricing: ReturnType<typeof resolveCatalogCartLinePricing>,
): string {
  if (row.promoGroupLabel?.trim()) return row.promoGroupLabel.trim()
  if (row.topCloudLabel?.trim()) return row.topCloudLabel.trim()
  if (pricing.descuentoCatalogoLabel?.trim()) {
    return pricing.descuentoCatalogoLabel.trim()
  }
  if (pricing.discountSource === "manual") return "Descuento"
  return "Promoción"
}

function resolveComprobanteRowPricing(
  row: MostradorCartDisplayRow,
  overrides: SaleComprobantePreviewCartInput["cartLineOverrides"],
): {
  unitListPrice: number
  listLineTotal: number
  lineTotal: number
  discounts: SaleComprobantePreviewLineDiscount[]
} {
  if (row.readOnlyPricing) {
    const { listTotal, finalTotal } = row.readOnlyPricing
    const discount = roundSaleMoney(Math.max(0, listTotal - finalTotal))
    return {
      unitListPrice:
        row.cantidad > 0 ? roundSaleMoney(listTotal / row.cantidad) : 0,
      listLineTotal: listTotal,
      lineTotal: finalTotal,
      discounts:
        discount > 0 ? [{ label: "Descuento", amount: discount }] : [],
    }
  }

  if (
    row.variant === "product" &&
    row.quantityDealListTotal != null
  ) {
    const listTotal = row.quantityDealListTotal
    const discount = row.quantityDealDiscountTotal ?? 0
    const label =
      row.promoGroupLabel?.trim() ||
      row.topCloudLabel?.trim() ||
      "Promoción"
    return {
      unitListPrice:
        row.cantidad > 0 ? roundSaleMoney(listTotal / row.cantidad) : 0,
      listLineTotal: listTotal,
      lineTotal: roundSaleMoney(Math.max(0, listTotal - discount)),
      discounts: discount > 0 ? [{ label, amount: discount }] : [],
    }
  }

  if (
    row.variant === "combo_component" &&
    row.promotionMeta &&
    row.promotionSelections
  ) {
    if (row.hidePrice) {
      return {
        unitListPrice: 0,
        listLineTotal: 0,
        lineTotal: 0,
        discounts: [],
      }
    }
    const parentQty =
      row.promotionSelections.length > 0
        ? resolvePromotionCartPricing(
            row.promotionMeta,
            row.promotionSelections,
            1,
          )
        : null
    if (parentQty) {
      const discount = roundSaleMoney(
        Math.max(0, parentQty.precioBase - parentQty.precioFinal),
      )
      return {
        unitListPrice: parentQty.precioFinal,
        listLineTotal: parentQty.precioBase,
        lineTotal: parentQty.precioFinal,
        discounts:
          discount > 0
            ? [
                {
                  label: row.promotionMeta.name?.trim() || "Combo",
                  amount: discount,
                },
              ]
            : [],
      }
    }
  }

  const pricing = resolveCatalogCartLinePricing(
    row.producto,
    row.cantidad,
    overrides.itemDescuentoSuprimido[row.cartLineId]
      ? null
      : overrides.itemDescuentoDraft[row.cartLineId]?.trim()
        ? {
            mode: overrides.itemDescuentoModo[row.cartLineId] ?? "porcentaje",
            draft: overrides.itemDescuentoDraft[row.cartLineId] ?? "",
          }
        : null,
    {
      suppressCatalogDiscount:
        row.discountEditingDisabled ||
        overrides.itemDescuentoSuprimido[row.cartLineId] === true,
    },
  )

  const discounts: SaleComprobantePreviewLineDiscount[] = []
  if (pricing.itemDiscountAmount > 0) {
    discounts.push({
      label: resolveDiscountLabel(row, pricing),
      amount: pricing.itemDiscountAmount,
    })
  }

  return {
    unitListPrice:
      row.cantidad > 0
        ? roundSaleMoney(pricing.precioBase / row.cantidad)
        : 0,
    listLineTotal: pricing.precioBase,
    lineTotal: pricing.precioFinal,
    discounts,
  }
}

export function buildSaleComprobantePreviewLines(
  rows: MostradorCartDisplayRow[],
  overrides: SaleComprobantePreviewCartInput["cartLineOverrides"],
): SaleComprobantePreviewLine[] {
  return rows
    .filter((row) => !(row.variant === "combo_component" && row.hidePrice))
    .map((row) => {
      const pricing = resolveComprobanteRowPricing(row, overrides)
      const category =
        row.producto?.categoria?.trim() && row.producto.categoria !== "—"
          ? row.producto.categoria.trim()
          : row.kind === "promotion"
            ? "Promociones"
            : row.kind === "recipe"
              ? "Recetas"
              : "General"

      return {
        description: (row.nombre.trim() || "Ítem").toUpperCase(),
        category,
        quantity: row.cantidad,
        unitListPrice: pricing.unitListPrice,
        vatRate: resolveRowVatRate(row),
        listLineTotal: pricing.listLineTotal,
        lineTotal: pricing.lineTotal,
        barcode: resolveLineBarcode(row),
        discounts: pricing.discounts,
      }
    })
    .filter((line) => line.lineTotal > 0 || line.quantity > 0)
}

export function groupSaleComprobantePreviewLines(
  lines: SaleComprobantePreviewLine[],
): SaleComprobantePreviewLineGroup[] {
  const groups: SaleComprobantePreviewLineGroup[] = []
  const indexByCategory = new Map<string, number>()

  for (const line of lines) {
    const category = line.category?.trim() || "General"
    const existing = indexByCategory.get(category)
    if (existing != null) {
      groups[existing].lines.push(line)
    } else {
      indexByCategory.set(category, groups.length)
      groups.push({ category, lines: [line] })
    }
  }

  return groups
}

function resolvePreviewKind(
  label: string | null,
): { kind: SaleComprobantePreviewKind; title: string; invoiceType?: SaleInvoiceTypeOption } {
  if (label == null || label === SALE_COMPROBANTE_SIN_LABEL) {
    return { kind: "none", title: SALE_COMPROBANTE_SIN_LABEL }
  }
  if (isInternalSaleComprobante(label)) {
    return { kind: "internal", title: label.toUpperCase() }
  }
  const invoiceType = label.startsWith("Factura")
    ? label.toUpperCase()
    : label.toUpperCase()
  return { kind: "arca", title: invoiceType }
}

function resolveReceptorSubtitle(
  comprobanteLabel: string | null,
  customerIvaLabel: string | null,
): string | null {
  if (comprobanteLabel === "Factura B") {
    return "A CONSUMIDOR FINAL"
  }
  if (
    customerIvaLabel?.toLowerCase().includes("consumidor final") ||
    customerIvaLabel?.toLowerCase().includes("monotributo")
  ) {
    return `A ${customerIvaLabel.toUpperCase()}`
  }
  return null
}

function showsVatBreakdownForLabel(label: string | null): boolean {
  if (label == null || isInternalSaleComprobante(label)) return false
  if (label === SALE_COMPROBANTE_SIN_LABEL) return false
  if (label === "Factura C") return false
  return label.startsWith("Factura")
}

function computeVatBreakdown(total: number): {
  netTaxable: number
  vatRows: SaleComprobantePreviewVatRow[]
  vatTotal: number
} {
  const netTaxable = roundSaleMoney(total / 1.21)
  const vatTotal = roundSaleMoney(total - netTaxable)
  return {
    netTaxable,
    vatTotal,
    vatRows: [
      {
        label: "IVA 21%",
        net: netTaxable,
        vat: vatTotal,
      },
    ],
  }
}

export function buildSaleComprobantePreview(
  input: BuildSaleComprobantePreviewInput,
): SaleComprobantePreviewModel | null {
  const emitter = input.emitter
  if (!emitter) return null

  const resolved = resolvePreviewKind(input.comprobanteLabel)
  const invoiceType =
    resolved.kind === "arca" && input.comprobanteLabel
      ? findSaleInvoiceTypeByLabel(input.siteId, input.comprobanteLabel)
      : undefined

  const lines = buildSaleComprobantePreviewLines(
    input.cartDisplayRows,
    input.cartLineOverrides,
  )
  const lineGroups = groupSaleComprobantePreviewLines(lines)

  const subtotal = roundSaleMoney(Math.max(0, input.subtotal))
  const discountAmount = roundSaleMoney(Math.max(0, input.discountAmount))
  const total = roundSaleMoney(Math.max(0, input.total))
  const showsVatBreakdown = showsVatBreakdownForLabel(input.comprobanteLabel)
  const vat = showsVatBreakdown
    ? computeVatBreakdown(total)
    : { netTaxable: total, vatRows: [] as SaleComprobantePreviewVatRow[], vatTotal: 0 }

  const cbteCodigo =
    invoiceType != null
      ? String(invoiceType.arcaCbteTipo).padStart(3, "0")
      : null

  const customerIvaLabel = input.customerIvaLabel?.trim() || null

  let footerNote: string | null = null
  if (resolved.kind === "none") {
    footerNote = "No se emitirá comprobante fiscal para esta operación."
  } else if (resolved.kind === "internal") {
    footerNote =
      "Documento interno no válido como factura. No tiene validez fiscal ni CAE."
  }

  const title =
    resolved.kind === "arca" && cbteCodigo
      ? `${resolved.title} (Cod. ${cbteCodigo})`
      : resolved.title

  return {
    kind: resolved.kind,
    title,
    receptorSubtitle: resolveReceptorSubtitle(
      input.comprobanteLabel,
      customerIvaLabel,
    ),
    cbteCodigo,
    cbteTipo: invoiceType?.arcaCbteTipo ?? null,
    emitter,
    ptoVta: formatSaleComprobantePtoVta(emitter.arcaPtoVta),
    cbteNro: formatSaleComprobanteCbteNro(1),
    issuedAt: input.issuedAt ?? new Date(),
    customerName: input.customerName.trim() || "Consumidor final",
    customerTaxId: input.customerTaxId?.trim() || null,
    customerIvaLabel,
    paymentMethodLabel: input.paymentMethodLabel?.trim() || null,
    lineGroups,
    subtotal,
    discountAmount,
    netTaxable: vat.netTaxable,
    vatRows: vat.vatRows,
    vatTotal: vat.vatTotal,
    total,
    showsFiscalFooter: resolved.kind === "arca",
    showsVatBreakdown,
    footerNote,
  }
}

/** @deprecated Usar formatSaleComprobanteTicketDate + formatSaleComprobanteTicketTime */
export function formatSaleComprobanteDate(
  date: Date,
  timeZone: string,
): string {
  return `${formatSaleComprobanteTicketDate(date, timeZone)} ${formatSaleComprobanteTicketTime(date, timeZone)}`
}
