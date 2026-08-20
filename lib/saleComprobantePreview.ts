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
import type { PopEmisorIvaCondition } from "@/lib/saleComprobanteRules"

/** Leyenda en Recibo X: no es comprobante fiscal válido. */
export const SALE_COMPROBANTE_RECIBO_X_DISCLAIMER =
  "Documento interno sin validez fiscal. No reemplaza factura ni comprobante autorizado por ARCA."

export type SaleComprobanteInvoiceVariant = "A" | "B" | "C"

export type SaleComprobanteEmitterContext = {
  tradeName: string
  razonSocial: string
  address: string | null
  cuit: string | null
  ingresosBrutos: string | null
  inicioActividades: string | null
  phone: string | null
  arcaPtoVta: number | null
  ivaCondition: PopEmisorIvaCondition
  ivaConditionLabel: string
  hasValidFiscalCuit: boolean
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
  id: string
  category: string
  lines: SaleComprobantePreviewLine[]
  /** Descuento de promoción aplicado debajo de las líneas del grupo. */
  promotionDiscount?: SaleComprobantePreviewLineDiscount | null
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
  /** Suma de precios de lista antes de cualquier descuento. */
  subtotalSinDescuentos: number
  /** Detalle de descuentos para el bloque DESCUENTOS del ticket. */
  discountLines: SaleComprobantePreviewLineDiscount[]
  /** Total ahorrado (suma de descuentos). */
  savings: number
  /** @deprecated Usar subtotalSinDescuentos / discountLines */
  subtotal: number
  /** @deprecated Usar discountLines */
  discountAmount: number
  netTaxable: number
  vatRows: SaleComprobantePreviewVatRow[]
  vatTotal: number
  /** IVA incluido en el total (ley 27.743). */
  ivaContenido: number
  total: number
  invoiceVariant: SaleComprobanteInvoiceVariant | null
  showsFiscalFooter: boolean
  /** IVA discriminado (neto + alícuotas) — Factura A. */
  showsVatDiscrimination: boolean
  /** Ley 27.743 — Factura B a consumidor final. */
  showsLey27743: boolean
  /** Alícuota IVA en líneas de ítems. */
  showsLineVatRate: boolean
  /** @deprecated Usar showsVatDiscrimination / showsLey27743 */
  showsVatBreakdown: boolean
  /** Aviso en Recibo X: documento sin validez fiscal. */
  internalDisclaimer: string | null
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

const ticketAmountFmt = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
})

export function formatSaleComprobanteMoney(value: number): string {
  return ticketAmountFmt.format(roundSaleMoney(value))
}

/** Importe estilo ticket térmico (sin símbolo, coma decimal). */
export function formatSaleComprobanteTicketAmount(value: number): string {
  return formatSaleComprobanteMoney(value)
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
  if (
    pricing.itemDiscountMode === "porcentaje" &&
    pricing.itemDiscountValue != null &&
    pricing.itemDiscountValue > 0
  ) {
    const value = pricing.itemDiscountValue
    const formatted = Number.isInteger(value)
      ? String(value)
      : value.toLocaleString("es-AR", { maximumFractionDigits: 2 })
    return `${formatted}%`
  }

  if (
    pricing.itemDiscountMode === "fijo" &&
    pricing.itemDiscountValue != null &&
    pricing.itemDiscountValue > 0
  ) {
    return formatSaleComprobanteMoney(pricing.itemDiscountValue)
  }

  if (row.promoGroupLabel?.trim() && row.promoGroupVariant === "promotion") {
    return row.promoGroupLabel.trim()
  }

  if (pricing.descuentoCatalogoLabel?.trim()) {
    return pricing.descuentoCatalogoLabel.trim().replace(/^−\s*/, "")
  }

  const cloud = row.topCloudLabel?.trim()
  if (cloud) {
    if (
      row.promoGroupDiscountMode === "porcentaje" &&
      /^\d+([.,]\d+)?$/.test(cloud)
    ) {
      return `${cloud}%`
    }
    return cloud
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
    row.promotionMeta &&
    row.promotionSelections &&
    (row.kind === "promotion" || row.variant === "combo_component")
  ) {
    if (row.variant === "combo_component" && row.hidePrice) {
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
            row.variant === "combo_component" ? 1 : row.cantidad,
          )
        : null
    if (parentQty) {
      const discount = roundSaleMoney(
        Math.max(0, parentQty.precioBase - parentQty.precioFinal),
      )
      return {
        unitListPrice:
          row.cantidad > 0
            ? roundSaleMoney(parentQty.precioBase / row.cantidad)
            : parentQty.precioUnitario,
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

function isPromotionGroupRow(row: MostradorCartDisplayRow): boolean {
  return Boolean(row.promoGroupKey?.trim() && row.promoGroupVariant === "promotion")
}

function shouldOmitFromRegularPreview(row: MostradorCartDisplayRow): boolean {
  return row.variant === "combo_component" && row.hidePrice
}

function resolvePromoItemListPricing(row: MostradorCartDisplayRow): {
  unitListPrice: number
  listLineTotal: number
  lineTotal: number
} {
  if (row.quantityDealListTotal != null) {
    const listLineTotal = row.quantityDealListTotal
    return {
      unitListPrice:
        row.cantidad > 0
          ? roundSaleMoney(listLineTotal / row.cantidad)
          : 0,
      listLineTotal,
      lineTotal: listLineTotal,
    }
  }

  const unitListPrice = roundSaleMoney(
    row.producto?.precioOriginal ?? row.producto?.precio ?? 0,
  )
  const listLineTotal = roundSaleMoney(unitListPrice * row.cantidad)
  return {
    unitListPrice,
    listLineTotal,
    lineTotal: listLineTotal,
  }
}

function resolvePromotionGroupDiscountAmount(
  batch: MostradorCartDisplayRow[],
): number {
  const first = batch[0]
  if (!first) return 0

  if (first.quantityDealGroupPricing) {
    const { listTotal, finalTotal } = first.quantityDealGroupPricing
    return roundSaleMoney(Math.max(0, listTotal - finalTotal))
  }

  if (
    first.variant === "combo_component" &&
    first.promotionMeta &&
    first.promotionSelections?.length
  ) {
    const priced = resolvePromotionCartPricing(
      first.promotionMeta,
      first.promotionSelections,
      1,
    )
    return roundSaleMoney(Math.max(0, priced.precioBase - priced.precioFinal))
  }

  const discountFromLines = roundSaleMoney(
    batch.reduce((sum, row) => sum + (row.quantityDealDiscountTotal ?? 0), 0),
  )
  if (discountFromLines > 0) return discountFromLines

  const listTotal = roundSaleMoney(
    batch.reduce((sum, row) => sum + resolvePromoItemListPricing(row).listLineTotal, 0),
  )
  const finalFromLines = roundSaleMoney(
    batch.reduce((sum, row) => {
      const pricing = resolvePromoItemListPricing(row)
      const lineDiscount = row.quantityDealDiscountTotal ?? 0
      return sum + pricing.listLineTotal - lineDiscount
    }, 0),
  )
  return roundSaleMoney(Math.max(0, listTotal - finalFromLines))
}

function buildPromoGroupPreviewSection(
  batch: MostradorCartDisplayRow[],
  groupIndex: number,
): SaleComprobantePreviewLineGroup {
  const label = batch[0]?.promoGroupLabel?.trim() || "Promoción"
  const groupId =
    batch[0]?.promoGroupKey?.trim() || `promo-preview:${groupIndex}:${label}`
  const lines = batch.map((row) => {
    const pricing = resolvePromoItemListPricing(row)
    const category =
      row.producto?.categoria?.trim() && row.producto.categoria !== "—"
        ? row.producto.categoria.trim()
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
      discounts: [],
    }
  })

  const discountAmount = resolvePromotionGroupDiscountAmount(batch)

  return {
    id: groupId,
    category: label,
    lines,
    promotionDiscount:
      discountAmount > 0 ? { label, amount: discountAmount } : null,
  }
}

function buildRegularPreviewLine(
  row: MostradorCartDisplayRow,
  overrides: SaleComprobantePreviewCartInput["cartLineOverrides"],
): SaleComprobantePreviewLine | null {
  if (shouldOmitFromRegularPreview(row)) return null

  const pricing = resolveComprobanteRowPricing(row, overrides)
  const category =
    row.producto?.categoria?.trim() && row.producto.categoria !== "—"
      ? row.producto.categoria.trim()
      : row.kind === "promotion"
        ? "Promociones"
        : row.kind === "recipe"
          ? "Recetas"
          : "General"

  const line: SaleComprobantePreviewLine = {
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

  if (line.lineTotal <= 0 && line.quantity <= 0) return null
  return line
}

export function buildSaleComprobantePreviewLineGroups(
  rows: MostradorCartDisplayRow[],
  overrides: SaleComprobantePreviewCartInput["cartLineOverrides"],
): SaleComprobantePreviewLineGroup[] {
  const groups: SaleComprobantePreviewLineGroup[] = []
  let index = 0
  let promoGroupIndex = 0

  while (index < rows.length) {
    const row = rows[index]

    if (isPromotionGroupRow(row)) {
      const promoKey = row.promoGroupKey!
      const batch: MostradorCartDisplayRow[] = []
      while (
        index < rows.length &&
        rows[index].promoGroupKey === promoKey &&
        rows[index].promoGroupVariant === "promotion"
      ) {
        batch.push(rows[index]!)
        index += 1
      }
      if (batch.length > 0) {
        groups.push(buildPromoGroupPreviewSection(batch, promoGroupIndex))
        promoGroupIndex += 1
      }
      continue
    }

    const regularBatch: MostradorCartDisplayRow[] = []
    while (index < rows.length && !isPromotionGroupRow(rows[index]!)) {
      regularBatch.push(rows[index]!)
      index += 1
    }

    const regularLines = regularBatch
      .map((regularRow) => buildRegularPreviewLine(regularRow, overrides))
      .filter((line): line is SaleComprobantePreviewLine => line != null)

    groups.push(...groupSaleComprobantePreviewLines(regularLines))
  }

  return groups
}

export function buildSaleComprobantePreviewLines(
  rows: MostradorCartDisplayRow[],
  overrides: SaleComprobantePreviewCartInput["cartLineOverrides"],
): SaleComprobantePreviewLine[] {
  return buildSaleComprobantePreviewLineGroups(rows, overrides).flatMap(
    (group) => group.lines,
  )
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
      groups.push({
        id: `category:${category}:${groups.length}`,
        category,
        lines: [line],
      })
    }
  }

  return groups
}

function computeSubtotalSinDescuentos(
  lineGroups: SaleComprobantePreviewLineGroup[],
): number {
  return roundSaleMoney(
    lineGroups.reduce(
      (sum, group) =>
        sum +
        group.lines.reduce((lineSum, line) => lineSum + line.listLineTotal, 0),
      0,
    ),
  )
}

function collectPreviewDiscountLines(
  lineGroups: SaleComprobantePreviewLineGroup[],
  generalDiscountAmount: number,
): SaleComprobantePreviewLineDiscount[] {
  const discounts: SaleComprobantePreviewLineDiscount[] = []

  for (const group of lineGroups) {
    for (const line of group.lines) {
      for (const discount of line.discounts) {
        if (discount.amount > 0) discounts.push(discount)
      }
    }
    if (group.promotionDiscount && group.promotionDiscount.amount > 0) {
      discounts.push(group.promotionDiscount)
    }
  }

  if (generalDiscountAmount > 0) {
    discounts.push({
      label: "Descuento general",
      amount: generalDiscountAmount,
    })
  }

  return discounts
}

function computePreviewSavings(
  discountLines: SaleComprobantePreviewLineDiscount[],
): number {
  return roundSaleMoney(
    discountLines.reduce((sum, discount) => sum + discount.amount, 0),
  )
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

function resolveInvoiceVariant(
  label: string | null,
): SaleComprobanteInvoiceVariant | null {
  if (label === "Factura A") return "A"
  if (label === "Factura B") return "B"
  if (label === "Factura C") return "C"
  return null
}

function resolvePreviewFiscalDisplay(
  variant: SaleComprobanteInvoiceVariant | null,
): {
  showsVatDiscrimination: boolean
  showsLey27743: boolean
  showsLineVatRate: boolean
} {
  if (variant === "A") {
    return {
      showsVatDiscrimination: true,
      showsLey27743: false,
      showsLineVatRate: true,
    }
  }
  if (variant === "B") {
    return {
      showsVatDiscrimination: false,
      showsLey27743: true,
      showsLineVatRate: true,
    }
  }
  if (variant === "C") {
    return {
      showsVatDiscrimination: false,
      showsLey27743: false,
      showsLineVatRate: false,
    }
  }
  return {
    showsVatDiscrimination: false,
    showsLey27743: false,
    showsLineVatRate: false,
  }
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

  const lineGroups = buildSaleComprobantePreviewLineGroups(
    input.cartDisplayRows,
    input.cartLineOverrides,
  )

  const subtotal = roundSaleMoney(Math.max(0, input.subtotal))
  const discountAmount = roundSaleMoney(Math.max(0, input.discountAmount))
  const total = roundSaleMoney(Math.max(0, input.total))
  const subtotalSinDescuentos = computeSubtotalSinDescuentos(lineGroups)
  const discountLines = collectPreviewDiscountLines(lineGroups, discountAmount)
  const savings = computePreviewSavings(discountLines)
  const invoiceVariant = resolveInvoiceVariant(input.comprobanteLabel)
  const fiscalDisplay = resolvePreviewFiscalDisplay(invoiceVariant)
  const vat =
    invoiceVariant === "A" || invoiceVariant === "B"
      ? computeVatBreakdown(total)
      : {
          netTaxable: total,
          vatRows: [] as SaleComprobantePreviewVatRow[],
          vatTotal: 0,
        }
  const ivaContenido =
    invoiceVariant === "B" ? vat.vatTotal : 0
  const showsVatBreakdown = fiscalDisplay.showsVatDiscrimination

  const cbteCodigo =
    invoiceType != null
      ? String(invoiceType.arcaCbteTipo).padStart(3, "0")
      : null

  const customerIvaLabel = input.customerIvaLabel?.trim() || null

  let footerNote: string | null = null
  let internalDisclaimer: string | null = null
  if (resolved.kind === "none") {
    footerNote = "No se emitirá comprobante fiscal para esta operación."
  } else if (resolved.kind === "internal") {
    internalDisclaimer = SALE_COMPROBANTE_RECIBO_X_DISCLAIMER
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
    subtotalSinDescuentos,
    discountLines,
    savings,
    subtotal,
    discountAmount,
    netTaxable: vat.netTaxable,
    vatRows: vat.vatRows,
    vatTotal: vat.vatTotal,
    ivaContenido,
    total,
    invoiceVariant,
    showsFiscalFooter: resolved.kind === "arca",
    showsVatDiscrimination: fiscalDisplay.showsVatDiscrimination,
    showsLey27743: fiscalDisplay.showsLey27743,
    showsLineVatRate: fiscalDisplay.showsLineVatRate,
    showsVatBreakdown,
    internalDisclaimer,
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
