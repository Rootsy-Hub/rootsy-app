"use server"

import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { getPopById, getPopSiteId, validatePopAccess } from "@/lib/popHelpers"
import { popMenuHref, siteIdFromPopRow } from "@/lib/popRoutes"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import { resolveWorkspaceTableListOrder } from "@/lib/workspaceTableSort"
import {
  CLIENT_IVA_CONDITION_OPTIONS,
} from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import {
  DEFAULT_SALE_SITE_ID,
  findSaleInvoiceTypeByArcaCbteTipo,
} from "@/lib/saleInvoiceTypes"
import { saleComprobanteAccruesOutputVat } from "@/lib/saleComprobantePicker"
import { purchaseComprobanteAccruesInputVat } from "@/lib/purchaseComprobantePicker"
import { resolveOperationPaymentMethodLabel } from "@/lib/operationPaymentLabels"
import { operationPaymentKindLabel } from "@/lib/operationPaymentKinds"
import {
  groupChannelOperationSales,
  parseChannelSaleMetadata,
} from "@/lib/channelOperationSales"
import {
  counterSaleMatchesOperationsFilters,
  saleMatchesOperationsFilters,
  tableSaleMatchesOperationsFilters,
  type OperationsListFiltersInput,
} from "@/app/[siteId]/[popId]/operations/operationsFilters"
import { buildChannelCheckoutTicketDisplay } from "@/lib/buildChannelCheckoutTicketDisplay"
import { getMenuCatalog } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import { readCheckoutFromSessionMetadata } from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"
import {
  parseLineDisplay,
  parseSnapshotTotals,
  type SaleLineDisplay,
  type SaleSnapshotTotals,
} from "@/lib/saleSnapshot"
import {
  localDateExclusiveEndTimestamp,
  localDateStartTimestamp,
  timezoneForPopLedger,
} from "@/lib/entryDateTimezone"
import { createClient } from "@/utils/supabase/server"
import { loadPopOperationalContext } from "@/lib/popTimezoneServer"
import {
  DEFAULT_OPERATIONAL_DAY_CLOSE_TIME,
  expandCalendarBoundsForOperationalFetch,
  filterSalesByOperationalPeriod,
  usesOperationalDayFilter,
} from "@/lib/popOperationalDay"
import {
  saleComprobanteLabel,
  saleHasComprobante,
} from "@/lib/operationSaleComprobante"
import {
  isServiceBillingPeriod,
  isServiceDiscountMode,
  type ServiceBillingPeriod,
  type ServiceDiscountMode,
} from "@/lib/serviceCatalogTypes"
import {
  billingPeriodDisplayForCharge,
  isServiceChargeBillingScope,
  resolveServiceChargeEffectiveStatus,
  roundServiceChargeMoney,
  todayIsoDateOnly,
  type ServiceChargeBillingScope,
  type ServiceChargeEffectiveStatus,
  type ServiceChargePaymentMode,
  type ServiceChargeStoredStatus,
} from "@/lib/serviceChargeTypes"

export type OperationSaleLineItem = {
  articleId: string | null
  recipeId: string | null
  promotionId: string | null
  lineKind: "article" | "recipe" | "promotion" | null
  nameSnapshot: string
  quantity: number
  unitPrice: number
  lineTotal: number
  iva: number
  lineDiscount: number
  itemDiscountMode: "porcentaje" | "fijo" | null
  itemDiscountValue: number | null
  itemDiscountAmount: number
  lineSubtotal: number | null
  comment: string | null
  discountSource: "none" | "catalog" | "manual" | "quantity_deal" | "combo" | null
  promotionDealId: string | null
  promotionDealName: string | null
  lineGroupId: string | null
  listLineTotal: number | null
  taxBase: number | null
  taxAmount: number | null
  generalDiscountShare: number | null
  display: SaleLineDisplay | null
  promotionSnapshot: {
    listTotal?: number
    promoDiscount?: number
    components?: Array<{
      name_snapshot?: string
      quantity?: number
      article_id?: string | null
      recipe_id?: string | null
      slot_id?: string | null
    }>
  } | null
}

export type OperationSalePayment = {
  amount: number
  methodName: string
}

export type OperationSaleArcaInvoice = {
  id: string
  tipoLabel: string
  arcaCbteTipo: number
  arcaRegimen: string
  ptoVta: number
  cbteNro: string
  cbteFch: string
  docTipo: number | null
  docNro: string
  receptorRazonSocial: string
  impTotal: number
  impNeto: number
  impIva: number
  cae: string | null
  caeFchVto: string | null
  status: string
}

export type OperationSaleQuantityDealSummary = {
  promotionId: string
  promotionName: string
  discountAmount: number
}

export type OperationSaleDiscountInfo = {
  itemDiscountTotal: number
  generalDiscountAmount: number
  generalDiscountMode: "porcentaje" | "fijo" | null
  generalDiscountValue: number | null
  subtotalBeforeGeneralDiscount: number | null
  quantityDealApplications: OperationSaleQuantityDealSummary[]
}

export type OperationSaleSnapshotInfo = {
  version: number | null
  totals: SaleSnapshotTotals | null
}

export type OperationSaleChannel = "pos" | "table" | "counter"

export type OperationSaleDetailContext = {
  channel: OperationSaleChannel
  soldAt: string | null
  soldByName: string | null
  customerName: string | null
  tableLabel: string | null
  openedAt: string | null
  closedAt: string | null
  openedByName: string | null
  closedByName: string | null
  waiterName: string | null
  guestCount: number | null
  note: string | null
  counterOrderLabel: string | null
  fulfillmentType: "pickup" | "delivery" | null
  deliveryAddress: string | null
  phone: string | null
  driverName: string | null
  estimatedMinutes: number | null
  deliveredAt: string | null
}

export type OperationSaleChargeRow = {
  saleId: string
  soldAt: string
  amount: number
  methodName: string
  comprobanteLabel: string | null
  hasComprobante: boolean
  sale: OperationSaleRow
}

export type OperationSaleRow = {
  id: string
  soldAt: string
  status: string
  saleChannel: OperationSaleChannel
  /** Importe registrado en esta venta (cobro parcial o total). */
  saleAmount: number
  total: number
  subtotal: number
  taxTotal: number
  discountTotal: number
  discountInfo: OperationSaleDiscountInfo
  snapshotInfo: OperationSaleSnapshotInfo
  clientId: string | null
  customerName: string | null
  customerTaxId: string | null
  invoiceTypeLabel: string | null
  accruesOutputVat: boolean
  arcaInvoice: OperationSaleArcaInvoice | null
  currency: string
  lineItems: OperationSaleLineItem[]
  payments: OperationSalePayment[]
  paymentMethodLabel: string
  tableLabel: string | null
  /** Número visible del pedido de mostrador (ej. #12). */
  counterOrderLabel: string | null
  tableSessionId?: string | null
  counterOrderId?: string | null
  /** Total del pedido/mesa (mesas/mostrador). */
  channelOrderTotal?: number | null
  /** Total cobrado acumulado en pagos parciales. */
  channelPaidTotal?: number | null
  /** Ventas individuales agrupadas en esta fila. */
  groupedSaleIds?: string[]
  isChannelGrouped?: boolean
  soldByName: string | null
  customerIvaConditionLabel: string
  /** Mesas/mostrador: apertura de sesión o pedido. */
  channelOpenedAt?: string | null
  channelOpenedByName?: string | null
  /** Mesas: cierre de sesión (null = abierta). Mostrador: entrega o cancelación. */
  channelClosedAt?: string | null
  channelClosedByName?: string | null
  channelWaiterName?: string | null
  channelCounterStatus?: string | null
  channelFulfillmentType?: "pickup" | "delivery" | null
}

export type OperationExpenseLedgerRow = {
  entryId: string
  expenseId: string | null
  expensePaymentId: string | null
  sourceType: "expense_payment" | "expense_void"
  operationDate: string
  operationAt: string
  amount: number
  expenseAmount: number | null
  categoryName: string
  description: string
  paymentMethodLabel: string
  recordedByName: string | null
}

export type OperationServiceChargePaymentRow = {
  id: string
  amount: number
  paidAt: string
  paymentKind: string | null
  notes: string
}

export type OperationServiceChargeRow = {
  id: string
  createdAt: string
  dueDate: string
  clientId: string
  clientName: string
  serviceTypeId: string
  serviceName: string
  billingPeriod: ServiceBillingPeriod
  billingPeriodLabel: string | null
  billingScope: ServiceChargeBillingScope
  paymentMode: ServiceChargePaymentMode
  periodCount: number
  sequenceIndex: number
  periodStart: string | null
  periodEnd: string | null
  periodDisplay: string
  unitPrice: number
  discountMode: ServiceDiscountMode
  discountValue: number | null
  discountAmount: number
  amount: number
  paidTotal: number
  balance: number
  storedStatus: ServiceChargeStoredStatus
  effectiveStatus: ServiceChargeEffectiveStatus
  cancelledAt: string | null
  notes: string
  payments: OperationServiceChargePaymentRow[]
}

export type OperationPurchaseLineItem = {
  articleId: string | null
  nameSnapshot: string
  quantity: number
  unitCost: number
  lineTotal: number
  iva: number
  itemDiscountMode: "porcentaje" | "fijo" | null
  itemDiscountValue: number | null
  itemDiscountAmount: number
  lineSubtotal: number | null
  comment: string | null
}

export type OperationPurchaseDiscountInfo = OperationSaleDiscountInfo

export type OperationPurchasePayment = {
  amount: number
  methodName: string
  paidAt: string
}

export type OperationPurchaseRow = {
  id: string
  operationDate: string
  operationAt: string
  status: string
  purchaseKind: string
  subtotal: number
  total: number
  taxTotal: number
  paidTotal: number
  supplierId: string | null
  supplierName: string
  documentNumber: string | null
  currency: string
  discountTotal: number
  discountInfo: OperationPurchaseDiscountInfo
  lineItems: OperationPurchaseLineItem[]
  payments: OperationPurchasePayment[]
  paymentMethodLabel: string
  purchasedByName: string | null
  documentKindLabel: string | null
  accruesInputVat: boolean
  supplierIvaConditionLabel: string
  vatIncludedEstimate: number | null
}

function parseMoney(v: unknown): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 100) / 100
}

function relOne<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null
  return Array.isArray(v) ? (v[0] ?? null) : v
}

function parseQty(v: unknown): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 1e6) / 1e6
}

function parsePromotionSnapshot(raw: unknown): OperationSaleLineItem["promotionSnapshot"] {
  if (raw == null || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const components = Array.isArray(o.components)
    ? o.components
        .filter((c): c is Record<string, unknown> => c != null && typeof c === "object")
        .map((c) => ({
          name_snapshot:
            typeof c.name_snapshot === "string" ? c.name_snapshot : undefined,
          quantity:
            c.quantity != null ? parseQty(c.quantity) : undefined,
          article_id:
            c.article_id != null ? String(c.article_id) : null,
          recipe_id:
            c.recipe_id != null ? String(c.recipe_id) : null,
          slot_id:
            typeof c.slot_id === "string" && c.slot_id.trim()
              ? c.slot_id.trim()
              : null,
        }))
    : undefined
  return {
    listTotal: o.list_total != null ? parseMoney(o.list_total) : undefined,
    promoDiscount: o.promo_discount != null ? parseMoney(o.promo_discount) : undefined,
    components,
  }
}

function parseLineItems(raw: unknown): OperationSaleLineItem[] {
  if (!Array.isArray(raw)) return []
  const out: OperationSaleLineItem[] = []
  for (const row of raw) {
    if (!row || typeof row !== "object") continue
    const o = row as Record<string, unknown>
    const discountRaw = o.discount_source
    const discountSource =
      discountRaw === "catalog" ||
      discountRaw === "manual" ||
      discountRaw === "quantity_deal" ||
      discountRaw === "combo" ||
      discountRaw === "none"
        ? discountRaw
        : null
    const lineKindRaw = o.line_kind
    const lineKind =
      lineKindRaw === "article" ||
      lineKindRaw === "recipe" ||
      lineKindRaw === "promotion"
        ? lineKindRaw
        : null
    out.push({
      articleId: o.article_id != null ? String(o.article_id) : null,
      recipeId: o.recipe_id != null ? String(o.recipe_id) : null,
      promotionId: o.promotion_id != null ? String(o.promotion_id) : null,
      lineKind,
      nameSnapshot: String(o.name_snapshot ?? "—"),
      quantity: parseQty(o.quantity),
      unitPrice: parseMoney(o.unit_price),
      lineTotal: parseMoney(o.line_total),
      iva: parseMoney(o.iva),
      lineDiscount: parseMoney(o.line_discount),
      itemDiscountMode:
        o.item_discount_mode === "porcentaje" || o.item_discount_mode === "fijo"
          ? o.item_discount_mode
          : null,
      itemDiscountValue:
        o.item_discount_value != null
          ? parseMoney(o.item_discount_value)
          : null,
      itemDiscountAmount: parseMoney(o.item_discount_amount),
      lineSubtotal:
        o.line_subtotal != null ? parseMoney(o.line_subtotal) : null,
      comment:
        typeof o.comment === "string" && o.comment.trim()
          ? o.comment.trim()
          : null,
      discountSource,
      promotionDealId:
        o.promotion_deal_id != null ? String(o.promotion_deal_id) : null,
      promotionDealName:
        typeof o.promotion_deal_name === "string" && o.promotion_deal_name.trim()
          ? o.promotion_deal_name.trim()
          : null,
      lineGroupId:
        typeof o.line_group_id === "string" && o.line_group_id.trim()
          ? o.line_group_id.trim()
          : null,
      listLineTotal:
        o.list_line_total != null ? parseMoney(o.list_line_total) : null,
      taxBase: o.tax_base != null ? parseMoney(o.tax_base) : null,
      taxAmount: o.tax_amount != null ? parseMoney(o.tax_amount) : null,
      generalDiscountShare:
        o.general_discount_share != null
          ? parseMoney(o.general_discount_share)
          : null,
      display: parseLineDisplay(o.display),
      promotionSnapshot: parsePromotionSnapshot(o.promotion_snapshot),
    })
  }
  return out
}

function parseBooleanMetadataFlag(
  metadata: unknown,
  key: string,
): boolean {
  if (metadata == null || typeof metadata !== "object") return false
  return (metadata as Record<string, unknown>)[key] === true
}

function parseCustomerIvaConditionLabel(
  metadata: unknown,
  customerName: string | null,
): string {
  if (metadata != null && typeof metadata === "object") {
    const raw = (metadata as Record<string, unknown>).customer_iva_condition
    if (typeof raw === "string" && raw.trim()) {
      const label = CLIENT_IVA_CONDITION_OPTIONS.find((o) => o.value === raw)?.label
      return label ?? raw
    }
  }
  if (!customerName?.trim()) return "Consumidor final"
  return "—"
}

function parseSupplierIvaConditionLabel(ivaCondition: unknown): string {
  if (ivaCondition != null && String(ivaCondition).trim()) {
    const raw = String(ivaCondition).trim()
    const label = CLIENT_IVA_CONDITION_OPTIONS.find((o) => o.value === raw)?.label
    return label ?? raw
  }
  return "—"
}

function parsePurchaseComprobanteInfo(
  metadata: unknown,
  documentKindFallback: string | null = null,
): {
  documentKindLabel: string | null
  accruesInputVat: boolean
  vatIncludedEstimate: number | null
} {
  let documentKind = documentKindFallback?.trim() || null
  if (!documentKind && metadata != null && typeof metadata === "object") {
    const raw = (metadata as Record<string, unknown>).purchase_document_kind
    if (typeof raw === "string" && raw.trim()) {
      documentKind = raw.trim()
    }
  }

  const accruesFromKind = purchaseComprobanteAccruesInputVat(documentKind)
  let accruesInputVat = accruesFromKind
  if (!documentKind && metadata != null && typeof metadata === "object") {
    const flag = (metadata as Record<string, unknown>).purchase_accrues_input_vat
    if (typeof flag === "boolean") {
      accruesInputVat = flag
    }
  }

  let vatIncludedEstimate: number | null = null
  if (metadata != null && typeof metadata === "object") {
    const estimate = Number(
      (metadata as Record<string, unknown>).vat_included_estimate,
    )
    if (Number.isFinite(estimate) && estimate > 0) {
      vatIncludedEstimate = parseMoney(estimate)
    }
  }

  return {
    documentKindLabel: documentKind,
    accruesInputVat,
    vatIncludedEstimate,
  }
}

function parseSaleMetadata(
  metadata: unknown,
  fiscalSiteId: string,
): { invoiceTypeLabel: string | null; accruesOutputVat: boolean } {
  if (metadata == null || typeof metadata !== "object") {
    return { invoiceTypeLabel: null, accruesOutputVat: false }
  }
  const o = metadata as Record<string, unknown>
  const rawLabel = o.invoice_type_label
  const invoiceTypeLabel =
    typeof rawLabel === "string" && rawLabel.trim() ? rawLabel.trim() : null

  if (typeof o.invoice_accrues_output_vat === "boolean") {
    return { invoiceTypeLabel, accruesOutputVat: o.invoice_accrues_output_vat }
  }

  return {
    invoiceTypeLabel,
    accruesOutputVat: saleComprobanteAccruesOutputVat(
      fiscalSiteId,
      invoiceTypeLabel,
    ),
  }
}

function parseSaleDiscountInfo(metadata: unknown): OperationSaleDiscountInfo {
  const empty: OperationSaleDiscountInfo = {
    itemDiscountTotal: 0,
    generalDiscountAmount: 0,
    generalDiscountMode: null,
    generalDiscountValue: null,
    subtotalBeforeGeneralDiscount: null,
    quantityDealApplications: [],
  }
  if (metadata == null || typeof metadata !== "object") return empty
  const o = metadata as Record<string, unknown>
  const mode = o.general_discount_mode
  const qtyDealsRaw = o.quantity_deal_applications
  const quantityDealApplications: OperationSaleQuantityDealSummary[] = []
  if (Array.isArray(qtyDealsRaw)) {
    for (const row of qtyDealsRaw) {
      if (!row || typeof row !== "object") continue
      const d = row as Record<string, unknown>
      quantityDealApplications.push({
        promotionId: String(d.promotion_id ?? ""),
        promotionName: String(d.promotion_name ?? "Promoción"),
        discountAmount: parseMoney(d.discount_amount),
      })
    }
  }
  return {
    itemDiscountTotal: parseMoney(o.item_discount_total),
    generalDiscountAmount: parseMoney(o.general_discount_amount),
    generalDiscountMode:
      mode === "porcentaje" || mode === "fijo" ? mode : null,
    generalDiscountValue:
      o.general_discount_value != null
        ? parseMoney(o.general_discount_value)
        : null,
    subtotalBeforeGeneralDiscount:
      o.subtotal_before_general_discount != null
        ? parseMoney(o.subtotal_before_general_discount)
        : null,
    quantityDealApplications,
  }
}

function parseSaleSnapshotInfo(metadata: unknown): OperationSaleSnapshotInfo {
  if (metadata == null || typeof metadata !== "object") {
    return { version: null, totals: null }
  }
  const o = metadata as Record<string, unknown>
  const versionRaw = o.snapshot_version
  const version =
    versionRaw != null && Number.isFinite(Number(versionRaw))
      ? Number(versionRaw)
      : null
  return {
    version,
    totals: parseSnapshotTotals(o.totals),
  }
}

function parsePurchaseDiscountInfo(
  metadata: unknown,
): OperationPurchaseDiscountInfo {
  return parseSaleDiscountInfo(metadata)
}

function parsePurchaseLineItems(raw: unknown): OperationPurchaseLineItem[] {
  if (!Array.isArray(raw)) return []
  const out: OperationPurchaseLineItem[] = []
  for (const row of raw) {
    if (!row || typeof row !== "object") continue
    const o = row as Record<string, unknown>
    out.push({
      articleId: o.article_id != null ? String(o.article_id) : null,
      nameSnapshot: String(o.name_snapshot ?? "—"),
      quantity: parseQty(o.quantity),
      unitCost: parseMoney(o.unit_cost),
      lineTotal: parseMoney(o.line_total),
      iva: parseMoney(o.iva),
      itemDiscountMode:
        o.item_discount_mode === "porcentaje" || o.item_discount_mode === "fijo"
          ? o.item_discount_mode
          : null,
      itemDiscountValue:
        o.item_discount_value != null
          ? parseMoney(o.item_discount_value)
          : null,
      itemDiscountAmount: parseMoney(o.item_discount_amount),
      lineSubtotal:
        o.line_subtotal != null ? parseMoney(o.line_subtotal) : null,
      comment:
        typeof o.comment === "string" && o.comment.trim()
          ? o.comment.trim()
          : null,
    })
  }
  return out
}

export type OperationsListView =
  | "sales"
  | "sales-report"
  | "tables"
  | "counter"
  | "purchases"
  | "expenses"
  | "services"

export type GetOperationsListInput = {
  view: OperationsListView
  dateFrom: string | null
  dateTo: string | null
  search: string
  page: number
  pageSize: number
  /** Compras con crédito fiscal (Factura A/B). */
  fiscalOnly?: boolean
  filters?: OperationsListFiltersInput
  sort?: string | null
  ord?: "asc" | "desc"
}

const OPERATIONS_SALES_LIST_SORT = {
  allowed: {
    sold_at: "sold_at",
    total: "total",
  },
  defaultColumn: "sold_at" as const,
  defaultAscending: false,
}

const OPERATIONS_PURCHASES_LIST_SORT = {
  allowed: {
    created_at: "created_at",
    total: "total",
  },
  defaultColumn: "created_at" as const,
  defaultAscending: false,
}

const OPERATIONS_EXPENSES_LIST_SORT = {
  allowed: {
    entry_date: "entry_date",
  },
  defaultColumn: "entry_date" as const,
  defaultAscending: false,
}

const OPERATIONS_SERVICES_LIST_SORT = {
  allowed: {
    due_date: "due_date",
    created_at: "created_at",
    total: "amount",
  },
  defaultColumn: "created_at" as const,
  defaultAscending: false,
}

function resolveOperationsSalesListOrder(input: GetOperationsListInput) {
  return resolveWorkspaceTableListOrder(
    { sort: input.sort ?? null, ord: input.ord ?? "asc" },
    OPERATIONS_SALES_LIST_SORT,
  )
}

function resolveOperationsPurchasesListOrder(input: GetOperationsListInput) {
  return resolveWorkspaceTableListOrder(
    { sort: input.sort ?? null, ord: input.ord ?? "asc" },
    OPERATIONS_PURCHASES_LIST_SORT,
  )
}

function resolveOperationsExpensesListOrder(input: GetOperationsListInput) {
  return resolveWorkspaceTableListOrder(
    { sort: input.sort ?? null, ord: input.ord ?? "asc" },
    OPERATIONS_EXPENSES_LIST_SORT,
  )
}

function resolveOperationsServicesListOrder(input: GetOperationsListInput) {
  return resolveWorkspaceTableListOrder(
    { sort: input.sort ?? null, ord: input.ord ?? "asc" },
    OPERATIONS_SERVICES_LIST_SORT,
  )
}

const OPERATIONS_LIST_PAGE_SIZES = [10, 25, 50, 100] as const
const DEFAULT_OPERATIONS_LIST_PAGE_SIZE = 25

function normalizeOperationsListPaging(page: number, pageSize: number) {
  const sizes = new Set<number>(
    OPERATIONS_LIST_PAGE_SIZES as unknown as number[],
  )
  const ps = sizes.has(pageSize) ? pageSize : DEFAULT_OPERATIONS_LIST_PAGE_SIZE
  const p = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1
  return { page: p, pageSize: ps }
}

function escapeIlikeToken(raw: string): string {
  return raw.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_")
}

function dateTimeStart(isoDate: string, timeZone: string): string {
  return localDateStartTimestamp(timeZone, isoDate)
}

function dateTimeExclusiveEnd(isoDate: string, timeZone: string): string {
  return localDateExclusiveEndTimestamp(timeZone, isoDate)
}

function quotePostgrestValue(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
}

function buildSalesSearchOrClause(raw: string): string | null {
  const t = raw.trim().replace(/,/g, " ").trim()
  if (!t) return null
  const pattern = `%${escapeIlikeToken(t)}%`
  return [
    `customer_name.ilike.${pattern}`,
    `customer_tax_id.ilike.${pattern}`,
    `status.ilike.${pattern}`,
  ].join(",")
}

function buildPurchasesSearchOrClause(raw: string): string | null {
  const t = raw.trim().replace(/,/g, " ").trim()
  if (!t) return null
  const pattern = `%${escapeIlikeToken(t)}%`
  return [
    `supplier_name.ilike.${pattern}`,
    `document_number.ilike.${pattern}`,
    `status.ilike.${pattern}`,
    `purchase_kind.ilike.${pattern}`,
  ].join(",")
}

function buildExpensesSearchOrClause(raw: string): string | null {
  const t = raw.trim().replace(/,/g, " ").trim()
  if (!t) return null
  const pattern = `%${escapeIlikeToken(t)}%`
  return `description.ilike.${pattern}`
}

function appendSalesDateFilter<
  Q extends {
    gte: (col: string, val: string) => Q
    lt: (col: string, val: string) => Q
  },
>(q: Q, dateFrom: string | null, dateTo: string | null, timeZone: string): Q {
  let x = q
  if (dateFrom) x = x.gte("sold_at", dateTimeStart(dateFrom, timeZone))
  if (dateTo) x = x.lt("sold_at", dateTimeExclusiveEnd(dateTo, timeZone))
  return x
}

function appendPurchasesDateFilter<
  Q extends { or: (s: string) => Q },
>(q: Q, dateFrom: string | null, dateTo: string | null, timeZone: string): Q {
  if (!dateFrom && !dateTo) return q
  const start = dateFrom
    ? quotePostgrestValue(dateTimeStart(dateFrom, timeZone))
    : null
  const end = dateTo
    ? quotePostgrestValue(dateTimeExclusiveEnd(dateTo, timeZone))
    : null

  const receivedParts: string[] = ["received_at.not.is.null"]
  if (start) receivedParts.push(`received_at.gte.${start}`)
  if (end) receivedParts.push(`received_at.lt.${end}`)

  const documentParts: string[] = [
    "received_at.is.null",
    "document_date.not.is.null",
  ]
  if (dateFrom) documentParts.push(`document_date.gte.${dateFrom}`)
  if (dateTo) documentParts.push(`document_date.lte.${dateTo}`)

  const createdParts: string[] = [
    "received_at.is.null",
    "document_date.is.null",
  ]
  if (start) createdParts.push(`created_at.gte.${start}`)
  if (end) createdParts.push(`created_at.lt.${end}`)

  return q.or(
    `and(${receivedParts.join(",")}),` +
      `and(${documentParts.join(",")}),` +
      `and(${createdParts.join(",")})`,
  )
}

function appendExpensesDateFilter<
  Q extends { gte: (col: string, val: string) => Q; lte: (col: string, val: string) => Q },
>(q: Q, dateFrom: string | null, dateTo: string | null): Q {
  let x = q
  if (dateFrom) x = x.gte("entry_date", dateFrom)
  if (dateTo) x = x.lte("entry_date", dateTo)
  return x
}

function appendServiceChargesDateFilter<
  Q extends {
    gte: (col: string, val: string) => Q
    lt: (col: string, val: string) => Q
  },
>(
  q: Q,
  dateFrom: string | null,
  dateTo: string | null,
  timeZone: string,
): Q {
  let x = q
  if (dateFrom) x = x.gte("created_at", dateTimeStart(dateFrom, timeZone))
  if (dateTo) x = x.lt("created_at", dateTimeExclusiveEnd(dateTo, timeZone))
  return x
}

const SERVICE_CHARGE_STATUS_SEARCH: Record<string, ServiceChargeEffectiveStatus> =
  {
    pendiente: "pending",
    pending: "pending",
    parcial: "partial",
    partial: "partial",
    pagado: "paid",
    paid: "paid",
    vencido: "overdue",
    vencidos: "overdue",
    overdue: "overdue",
    cancelado: "cancelled",
    cancelados: "cancelled",
    cancelled: "cancelled",
  }

const SERVICE_CHARGE_LIST_SELECT = `
  id,
  client_id,
  service_type_id,
  sequence_index,
  billing_scope,
  period_count,
  payment_mode,
  period_start,
  period_end,
  unit_price,
  discount_mode,
  discount_value,
  amount,
  due_date,
  status,
  cancelled_at,
  notes,
  created_at,
  clients ( name ),
  service_types ( name, billing_period, billing_period_label )
`

function parseServiceChargeMoney(v: unknown): number {
  return roundServiceChargeMoney(Number(v ?? 0) || 0)
}

async function resolveServiceChargeSearchIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  search: string,
): Promise<{
  chargeId?: string
  status?: ServiceChargeEffectiveStatus
  clientIds?: string[]
  serviceTypeIds?: string[]
  notesPattern?: string
}> {
  const term = search.trim()
  if (!term) return {}
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(term)
  ) {
    return { chargeId: term }
  }

  const status = SERVICE_CHARGE_STATUS_SEARCH[term.toLowerCase()]
  if (status) return { status }

  const pattern = `%${escapeIlikeToken(term)}%`
  const [{ data: clients }, { data: services }] = await Promise.all([
    supabase
      .from("clients")
      .select("id")
      .eq("pop_id", popId)
      .ilike("name", pattern)
      .limit(80),
    supabase
      .from("service_types")
      .select("id")
      .eq("pop_id", popId)
      .ilike("name", pattern)
      .limit(80),
  ])

  return {
    clientIds: (clients ?? []).map((row) => String(row.id)),
    serviceTypeIds: (services ?? []).map((row) => String(row.id)),
    notesPattern: pattern,
  }
}

function applyServiceChargeStatusFilter<
  Q extends {
    eq: (col: string, val: string) => Q
    in: (col: string, val: string[]) => Q
    or: (filters: string) => Q
    lt: (col: string, val: string) => Q
    is: (col: string, val: null) => Q
  },
>(query: Q, status: ServiceChargeEffectiveStatus, today: string): Q {
  if (status === "overdue") {
    return query
      .lt("due_date", today)
      .in("status", ["pending", "partial"])
      .is("cancelled_at", null)
  }
  if (status === "cancelled") {
    return query.or("status.eq.cancelled,cancelled_at.not.is.null")
  }
  if (status === "paid") return query.eq("status", "paid")
  if (status === "partial") return query.eq("status", "partial")
  if (status === "pending") {
    return query.eq("status", "pending").is("cancelled_at", null)
  }
  return query
}

function applyServiceChargeToolbarFilters<
  Q extends {
    eq: (col: string, val: string) => Q
    in: (col: string, val: string[]) => Q
    or: (filters: string) => Q
    lt: (col: string, val: string) => Q
    is: (col: string, val: null) => Q
  },
>(
  query: Q,
  filters: OperationsListFiltersInput | undefined,
  today: string,
): Q {
  if (!filters) return query
  if (filters.serviceStatus) {
    query = applyServiceChargeStatusFilter(query, filters.serviceStatus, today)
  }
  if (filters.serviceScope) {
    query = query.eq("billing_scope", filters.serviceScope)
  }
  return query
}

function applySalesListToolbarFilters<
  Q extends {
    eq: (col: string, val: string) => Q
    gt: (col: string, val: number) => Q
  },
>(query: Q, filters: OperationsListFiltersInput | undefined): Q {
  if (!filters) return query
  if (filters.saleStatus) query = query.eq("status", filters.saleStatus)
  if (filters.saleWithDiscount) query = query.gt("discount_total", 0)
  return query
}

function applyPurchasesListToolbarFilters<
  Q extends { eq: (col: string, val: string) => Q },
>(query: Q, filters: OperationsListFiltersInput | undefined): Q {
  if (filters?.purchaseKind) {
    return query.eq("purchase_kind", filters.purchaseKind)
  }
  return query
}

function applyServiceChargeSearchFilter<
  Q extends {
    eq: (col: string, val: string) => Q
    in: (col: string, val: string[]) => Q
    or: (filters: string) => Q
    lt: (col: string, val: string) => Q
    is: (col: string, val: null) => Q
  },
>(
  query: Q,
  search: Awaited<ReturnType<typeof resolveServiceChargeSearchIds>>,
  today: string,
): Q {
  const hasSearch =
    Boolean(search.chargeId) ||
    Boolean(search.status) ||
    Boolean(search.notesPattern) ||
    (search.clientIds != null && search.clientIds.length > 0) ||
    (search.serviceTypeIds != null && search.serviceTypeIds.length > 0)
  if (!hasSearch) return query
  if (search.chargeId) return query.eq("id", search.chargeId)
  if (search.status) {
    return applyServiceChargeStatusFilter(query, search.status, today)
  }

  const parts: string[] = []
  if (search.notesPattern) {
    parts.push(`notes.ilike.${search.notesPattern}`)
  }
  if (search.clientIds && search.clientIds.length > 0) {
    parts.push(`client_id.in.(${search.clientIds.join(",")})`)
  }
  if (search.serviceTypeIds && search.serviceTypeIds.length > 0) {
    parts.push(`service_type_id.in.(${search.serviceTypeIds.join(",")})`)
  }
  if (parts.length === 0) {
    return query.eq("id", "00000000-0000-0000-0000-000000000000")
  }
  return query.or(parts.join(","))
}

function mapOperationServiceChargeRow(
  row: Record<string, unknown>,
  paidByChargeId: Map<string, number>,
  paymentsByChargeId: Map<string, OperationServiceChargePaymentRow[]>,
  today: string,
): OperationServiceChargeRow {
  const client = row.clients as { name?: string } | null
  const service = row.service_types as {
    name?: string
    billing_period?: string
    billing_period_label?: string | null
  } | null
  const billingPeriodRaw = String(service?.billing_period ?? "monthly")
  const billingPeriod: ServiceBillingPeriod = isServiceBillingPeriod(
    billingPeriodRaw,
  )
    ? billingPeriodRaw
    : "monthly"
  const billingPeriodLabel =
    typeof service?.billing_period_label === "string" &&
    service.billing_period_label.trim()
      ? service.billing_period_label.trim()
      : null
  const amount = parseServiceChargeMoney(row.amount)
  const paidTotal = roundServiceChargeMoney(
    paidByChargeId.get(String(row.id)) ?? 0,
  )
  const unitPrice = parseServiceChargeMoney(row.unit_price)
  const discountMode = (
    isServiceDiscountMode(String(row.discount_mode ?? "none"))
      ? String(row.discount_mode)
      : "none"
  ) as ServiceDiscountMode
  const discountValue =
    row.discount_value == null || row.discount_value === ""
      ? null
      : parseServiceChargeMoney(row.discount_value)
  const cancelledAt =
    typeof row.cancelled_at === "string" ? row.cancelled_at : null
  const storedStatus = String(row.status ?? "pending") as ServiceChargeStoredStatus
  const dueDate = String(row.due_date ?? "")
  const sequenceIndex = Number(row.sequence_index ?? 0) || 0
  const periodCount = Number(row.period_count ?? 1) || 1
  const periodStart =
    typeof row.period_start === "string" ? row.period_start : null
  const periodEnd = typeof row.period_end === "string" ? row.period_end : null
  const billingScopeRaw = String(row.billing_scope ?? "one_period")
  const billingScope = isServiceChargeBillingScope(billingScopeRaw)
    ? billingScopeRaw
    : "one_period"

  return {
    id: String(row.id),
    createdAt: String(row.created_at ?? ""),
    dueDate,
    clientId: String(row.client_id),
    clientName: String(client?.name ?? "—"),
    serviceTypeId: String(row.service_type_id),
    serviceName: String(service?.name ?? "—"),
    billingPeriod,
    billingPeriodLabel,
    billingScope,
    paymentMode: (String(row.payment_mode ?? "one_time") === "subscription"
      ? "subscription"
      : "one_time") as ServiceChargePaymentMode,
    periodCount,
    sequenceIndex,
    periodStart,
    periodEnd,
    periodDisplay: billingPeriodDisplayForCharge(
      billingPeriod,
      billingPeriodLabel,
      periodStart,
      periodEnd,
      sequenceIndex,
      periodCount,
    ),
    unitPrice,
    discountMode,
    discountValue,
    discountAmount: roundServiceChargeMoney(Math.max(0, unitPrice - amount)),
    amount,
    paidTotal,
    balance: roundServiceChargeMoney(Math.max(0, amount - paidTotal)),
    storedStatus,
    effectiveStatus: resolveServiceChargeEffectiveStatus({
      storedStatus,
      cancelledAt,
      amount,
      paidTotal,
      dueDate,
      today,
    }),
    cancelledAt,
    notes: String(row.notes ?? ""),
    payments: paymentsByChargeId.get(String(row.id)) ?? [],
  }
}

const SALE_LIST_SELECT = `
        id,
        sold_at,
        status,
        total,
        subtotal,
        tax_total,
        discount_total,
        client_id,
        customer_name,
        customer_tax_id,
        metadata,
        line_items,
        currency,
        table_session_id,
        counter_order_id,
        sale_channel,
        created_by,
        sale_payments (
          amount,
          sort_order,
          payment_kind,
          treasury_account_id,
          treasury_accounts ( name )
        )
      `

const PURCHASE_LIST_SELECT = `
        id,
        purchase_kind,
        status,
        document_number,
        document_date,
        supplier_id,
        supplier_name,
        subtotal,
        total,
        tax_total,
        discount_total,
        currency,
        line_items,
        metadata,
        created_at,
        created_by,
        received_at,
        suppliers ( name, iva_condition ),
        purchase_payments (
          amount,
          paid_at,
          payment_kind,
          treasury_account_id,
          treasury_accounts ( name )
        )
      `

const FISCAL_RECEIVED_PURCHASE_DOC_KINDS = ["Factura A", "Factura B"] as const

async function loadFiscalPurchaseIdsForPop(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("purchase_documents")
    .select("purchase_id")
    .eq("pop_id", popId)
    .in("doc_kind", [...FISCAL_RECEIVED_PURCHASE_DOC_KINDS])

  if (error || !data?.length) return []

  return [
    ...new Set(
      data
        .map((row) =>
          row.purchase_id != null ? String(row.purchase_id).trim() : "",
        )
        .filter(Boolean),
    ),
  ]
}

async function loadArcaBySaleIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  fiscalSiteId: string,
  saleIds: string[],
): Promise<Map<string, OperationSaleArcaInvoice>> {
  const arcaBySaleId = new Map<string, OperationSaleArcaInvoice>()
  if (saleIds.length === 0) return arcaBySaleId

  const { data: invRows } = await supabase
    .from("invoices_arca")
    .select(
      `
          id,
          sale_id,
          arca_cbte_tipo,
          arca_regimen,
          pto_vta,
          cbte_nro,
          cbte_fch,
          doc_tipo,
          doc_nro,
          receptor_razon_social,
          imp_total,
          imp_neto,
          imp_iva,
          cae,
          cae_fch_vto,
          status
        `,
    )
    .eq("pop_id", popId)
    .in("sale_id", saleIds)
    .order("created_at", { ascending: false })

  for (const row of invRows || []) {
    const sid = row.sale_id != null ? String(row.sale_id) : ""
    if (!sid || arcaBySaleId.has(sid)) continue
    const cbteTipo = Number(row.arca_cbte_tipo ?? 0)
    const opt = findSaleInvoiceTypeByArcaCbteTipo(fiscalSiteId, cbteTipo)
    const nro = row.cbte_nro
    arcaBySaleId.set(sid, {
      id: String(row.id),
      tipoLabel: opt?.label ?? `CbteTipo ${cbteTipo}`,
      arcaCbteTipo: cbteTipo,
      arcaRegimen: String(row.arca_regimen ?? "fe_general"),
      ptoVta: Number(row.pto_vta ?? 0),
      cbteNro:
        typeof nro === "bigint" || typeof nro === "number"
          ? String(nro)
          : String(nro ?? ""),
      cbteFch: String(row.cbte_fch ?? ""),
      docTipo: row.doc_tipo != null ? Number(row.doc_tipo) : null,
      docNro: String(row.doc_nro ?? ""),
      receptorRazonSocial: String(row.receptor_razon_social ?? ""),
      impTotal: parseMoney(row.imp_total),
      impNeto: parseMoney(row.imp_neto),
      impIva: parseMoney(row.imp_iva),
      cae: row.cae != null ? String(row.cae) : null,
      caeFchVto: row.cae_fch_vto != null ? String(row.cae_fch_vto) : null,
      status: String(row.status ?? ""),
    })
  }
  return arcaBySaleId
}

function parseTableLabelFromSession(
  row: Record<string, unknown>,
  labelsBySessionId: Map<string, string>,
): string | null {
  const sessionId =
    row.table_session_id != null ? String(row.table_session_id).trim() : ""
  if (!sessionId) return null
  return labelsBySessionId.get(sessionId) ?? null
}

async function loadTableLabelsBySessionIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  sessionIds: string[],
): Promise<Map<string, string>> {
  const labelsBySessionId = new Map<string, string>()
  if (sessionIds.length === 0) return labelsBySessionId

  const { data: sessions, error } = await supabase
    .from("table_sessions")
    .select("id, dining_table_id, table_session_tables ( dining_table_id )")
    .eq("pop_id", popId)
    .in("id", sessionIds)

  if (error || !sessions?.length) return labelsBySessionId

  const tableIds = new Set<string>()
  for (const session of sessions) {
    if (session.dining_table_id) {
      tableIds.add(String(session.dining_table_id))
    }
    const extras = session.table_session_tables as
      | Array<{ dining_table_id?: string }>
      | null
    for (const row of extras ?? []) {
      if (row.dining_table_id) tableIds.add(String(row.dining_table_id))
    }
  }

  if (tableIds.size === 0) return labelsBySessionId

  const { data: tables } = await supabase
    .from("dining_tables")
    .select("id, label")
    .eq("pop_id", popId)
    .in("id", [...tableIds])

  const labelByTableId = new Map<string, string>()
  for (const table of tables ?? []) {
    const label = typeof table.label === "string" ? table.label.trim() : ""
    if (label) labelByTableId.set(String(table.id), label)
  }

  for (const session of sessions) {
    const orderedTableIds = [String(session.dining_table_id)]
    const extras = session.table_session_tables as
      | Array<{ dining_table_id?: string }>
      | null
    for (const row of extras ?? []) {
      const tableId = row.dining_table_id ? String(row.dining_table_id) : ""
      if (tableId && !orderedTableIds.includes(tableId)) {
        orderedTableIds.push(tableId)
      }
    }
    const labels = orderedTableIds
      .map((tableId) => labelByTableId.get(tableId))
      .filter((label): label is string => Boolean(label))
    if (labels.length > 0) {
      labelsBySessionId.set(String(session.id), labels.join(" + "))
    }
  }

  return labelsBySessionId
}

async function loadTableLabelsBySaleIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  saleRows: Array<Record<string, unknown>>,
): Promise<Map<string, string>> {
  const sessionIds = [
    ...new Set(
      saleRows
        .map((row) =>
          row.table_session_id != null ? String(row.table_session_id) : "",
        )
        .filter(Boolean),
    ),
  ]
  return loadTableLabelsBySessionIds(supabase, popId, sessionIds)
}

function parseCounterOrderLabel(
  row: Record<string, unknown>,
  labelByOrderId: Map<string, string>,
): string | null {
  const orderId =
    row.counter_order_id != null ? String(row.counter_order_id).trim() : ""
  if (!orderId) return null
  return labelByOrderId.get(orderId) ?? null
}

async function loadCounterOrderLabelsByOrderIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  orderIds: string[],
): Promise<Map<string, string>> {
  const labelByOrderId = new Map<string, string>()
  if (orderIds.length === 0) return labelByOrderId

  const { data, error } = await supabase
    .from("counter_orders")
    .select("id, order_number")
    .eq("pop_id", popId)
    .in("id", orderIds)

  if (error || !data?.length) return labelByOrderId

  for (const row of data) {
    const orderNumber = Number(row.order_number)
    if (!Number.isFinite(orderNumber)) continue
    labelByOrderId.set(String(row.id), `#${orderNumber}`)
  }

  return labelByOrderId
}

async function loadCounterOrderLabelsBySaleIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  saleRows: Array<Record<string, unknown>>,
): Promise<Map<string, string>> {
  const orderIds = [
    ...new Set(
      saleRows
        .map((row) =>
          row.counter_order_id != null ? String(row.counter_order_id) : "",
        )
        .filter(Boolean),
    ),
  ]
  return loadCounterOrderLabelsByOrderIds(supabase, popId, orderIds)
}

type TableSessionListSummary = {
  openedAt: string | null
  closedAt: string | null
  openedBy: string | null
  closedBy: string | null
  waiterUserId: string | null
}

type CounterOrderListSummary = {
  openedAt: string | null
  status: string | null
  fulfillmentType: "pickup" | "delivery" | null
  openedBy: string | null
  deliveredAt: string | null
  cancelledAt: string | null
  cancelledBy: string | null
}

async function loadTableSessionSummariesBySessionIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  sessionIds: string[],
): Promise<Map<string, TableSessionListSummary>> {
  const summaryBySessionId = new Map<string, TableSessionListSummary>()
  if (sessionIds.length === 0) return summaryBySessionId

  const { data, error } = await supabase
    .from("table_sessions")
    .select(
      "id, opened_at, closed_at, opened_by, closed_by, waiter_user_id",
    )
    .eq("pop_id", popId)
    .in("id", sessionIds)

  if (error || !data?.length) return summaryBySessionId

  for (const row of data) {
    summaryBySessionId.set(String(row.id), {
      openedAt: row.opened_at != null ? String(row.opened_at) : null,
      closedAt: row.closed_at != null ? String(row.closed_at) : null,
      openedBy:
        row.opened_by != null ? String(row.opened_by).trim() || null : null,
      closedBy:
        row.closed_by != null ? String(row.closed_by).trim() || null : null,
      waiterUserId:
        row.waiter_user_id != null
          ? String(row.waiter_user_id).trim() || null
          : null,
    })
  }

  return summaryBySessionId
}

async function loadTableSessionSummariesBySaleIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  saleRows: Array<Record<string, unknown>>,
): Promise<Map<string, TableSessionListSummary>> {
  const sessionIds = [
    ...new Set(
      saleRows
        .map((row) =>
          row.table_session_id != null ? String(row.table_session_id) : "",
        )
        .filter(Boolean),
    ),
  ]
  return loadTableSessionSummariesBySessionIds(supabase, popId, sessionIds)
}

async function loadCounterOrderSummariesByOrderIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  orderIds: string[],
): Promise<Map<string, CounterOrderListSummary>> {
  const summaryByOrderId = new Map<string, CounterOrderListSummary>()
  if (orderIds.length === 0) return summaryByOrderId

  const { data, error } = await supabase
    .from("counter_orders")
    .select(
      "id, status, fulfillment_type, opened_at, delivered_at, cancelled_at, opened_by, cancelled_by",
    )
    .eq("pop_id", popId)
    .in("id", orderIds)

  if (error || !data?.length) return summaryByOrderId

  for (const row of data) {
    const fulfillment = String(row.fulfillment_type ?? "").trim()
    summaryByOrderId.set(String(row.id), {
      openedAt: row.opened_at != null ? String(row.opened_at) : null,
      status: row.status != null ? String(row.status) : null,
      fulfillmentType:
        fulfillment === "delivery" || fulfillment === "pickup"
          ? fulfillment
          : null,
      openedBy:
        row.opened_by != null ? String(row.opened_by).trim() || null : null,
      deliveredAt:
        row.delivered_at != null ? String(row.delivered_at) : null,
      cancelledAt:
        row.cancelled_at != null ? String(row.cancelled_at) : null,
      cancelledBy:
        row.cancelled_by != null
          ? String(row.cancelled_by).trim() || null
          : null,
    })
  }

  return summaryByOrderId
}

async function loadCounterOrderSummariesBySaleIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  saleRows: Array<Record<string, unknown>>,
): Promise<Map<string, CounterOrderListSummary>> {
  const orderIds = [
    ...new Set(
      saleRows
        .map((row) =>
          row.counter_order_id != null ? String(row.counter_order_id) : "",
        )
        .filter(Boolean),
    ),
  ]
  return loadCounterOrderSummariesByOrderIds(supabase, popId, orderIds)
}

async function loadPurchaseDocumentKindsByPurchaseIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  purchaseIds: string[],
): Promise<Map<string, string>> {
  const kindByPurchaseId = new Map<string, string>()
  if (purchaseIds.length === 0) return kindByPurchaseId

  const { data, error } = await supabase
    .from("purchase_documents")
    .select("purchase_id, doc_kind")
    .eq("pop_id", popId)
    .in("purchase_id", purchaseIds)
    .order("created_at", { ascending: false })

  if (error || !data?.length) return kindByPurchaseId

  for (const row of data) {
    const purchaseId =
      row.purchase_id != null ? String(row.purchase_id).trim() : ""
    const docKind = row.doc_kind != null ? String(row.doc_kind).trim() : ""
    if (!purchaseId || !docKind || kindByPurchaseId.has(purchaseId)) continue
    kindByPurchaseId.set(purchaseId, docKind)
  }

  return kindByPurchaseId
}

function applyChannelListFieldsToSaleRows(
  sales: OperationSaleRow[],
  options: {
    view: "table" | "counter"
    tableSummaryBySessionId: Map<string, TableSessionListSummary>
    counterSummaryByOrderId: Map<string, CounterOrderListSummary>
    userNames: Map<string, string>
  },
): OperationSaleRow[] {
  const { view, tableSummaryBySessionId, counterSummaryByOrderId, userNames } =
    options

  return sales.map((sale) => {
    if (view === "table") {
      const sessionId = sale.tableSessionId?.trim() || ""
      if (!sessionId) return sale
      const summary = tableSummaryBySessionId.get(sessionId)
      if (!summary) return sale
      return {
        ...sale,
        channelOpenedAt: summary.openedAt,
        channelOpenedByName: summary.openedBy
          ? (userNames.get(summary.openedBy) ?? null)
          : null,
        channelClosedAt: summary.closedAt,
        channelClosedByName: summary.closedBy
          ? (userNames.get(summary.closedBy) ?? null)
          : null,
        channelWaiterName: summary.waiterUserId
          ? (userNames.get(summary.waiterUserId) ?? null)
          : null,
      }
    }

    const orderId = sale.counterOrderId?.trim() || ""
    if (!orderId) return sale
    const summary = counterSummaryByOrderId.get(orderId)
    if (!summary) return sale

    let channelClosedAt: string | null = null
    let channelClosedByName: string | null = null
    if (summary.status === "cancelled" && summary.cancelledAt) {
      channelClosedAt = summary.cancelledAt
      channelClosedByName = summary.cancelledBy
        ? (userNames.get(summary.cancelledBy) ?? null)
        : null
    } else if (summary.deliveredAt) {
      channelClosedAt = summary.deliveredAt
      channelClosedByName = sale.soldByName
    }

    return {
      ...sale,
      channelOpenedAt: summary.openedAt,
      channelOpenedByName: summary.openedBy
        ? (userNames.get(summary.openedBy) ?? null)
        : null,
      channelClosedAt,
      channelClosedByName,
      channelCounterStatus: summary.status,
      channelFulfillmentType: summary.fulfillmentType,
    }
  })
}

function formatTreasuryPaymentLabel(p: {
  payment_kind?: unknown
  treasury_accounts?:
    | { name?: string }
    | Array<{ name?: string }>
    | null
}): string {
  const kind =
    p.payment_kind != null ? String(p.payment_kind).trim() : ""
  const ta = relOne(p.treasury_accounts)
  const taName = ta?.name?.trim() || ""
  const kindLabel = kind ? operationPaymentKindLabel(kind) : ""
  if (kindLabel && taName) return `${kindLabel} — ${taName}`
  return kindLabel || taName || "—"
}

function resolveSaleChannelFromRow(
  row: Record<string, unknown>,
): OperationSaleChannel {
  const channel = String(row.sale_channel ?? "").trim()
  if (channel === "table" || channel === "counter" || channel === "pos") {
    return channel
  }
  if (row.table_session_id != null && String(row.table_session_id).trim()) {
    return "table"
  }
  if (row.counter_order_id != null && String(row.counter_order_id).trim()) {
    return "counter"
  }
  return "pos"
}

async function loadUserDisplayNames(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userIds: string[],
): Promise<Map<string, string>> {
  const unique = [...new Set(userIds.filter(Boolean))]
  const map = new Map<string, string>()
  if (unique.length === 0) return map

  const { data } = await supabase
    .from("users")
    .select("id, first_name, last_name")
    .in("id", unique)

  for (const row of data || []) {
    const name =
      `${String(row.first_name ?? "").trim()} ${String(row.last_name ?? "").trim()}`.trim()
    map.set(String(row.id), name || "Usuario")
  }

  return map
}

async function loadOperationSaleDetailContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  row: Record<string, unknown>,
  tableLabelBySessionId: Map<string, string>,
  counterOrderLabelByOrderId: Map<string, string>,
): Promise<OperationSaleDetailContext> {
  const channel = resolveSaleChannelFromRow(row)
  const soldAt = row.sold_at != null ? String(row.sold_at) : null
  const customerName =
    row.customer_name != null ? String(row.customer_name).trim() || null : null
  const createdBy =
    row.created_by != null ? String(row.created_by).trim() || null : null

  const base: OperationSaleDetailContext = {
    channel,
    soldAt,
    soldByName: null,
    customerName,
    tableLabel: parseTableLabelFromSession(row, tableLabelBySessionId),
    openedAt: null,
    closedAt: null,
    openedByName: null,
    closedByName: null,
    waiterName: null,
    guestCount: null,
    note: null,
    counterOrderLabel: parseCounterOrderLabel(row, counterOrderLabelByOrderId),
    fulfillmentType: null,
    deliveryAddress: null,
    phone: null,
    driverName: null,
    estimatedMinutes: null,
    deliveredAt: null,
  }

  const userIds = new Set<string>()
  if (createdBy) userIds.add(createdBy)

  const tableSessionId =
    row.table_session_id != null ? String(row.table_session_id).trim() : ""
  const counterOrderId =
    row.counter_order_id != null ? String(row.counter_order_id).trim() : ""

  let tableOpenedBy: string | null = null
  let tableClosedBy: string | null = null
  let tableWaiterId: string | null = null
  let counterOpenedBy: string | null = null
  let counterClosedBy: string | null = null
  let counterStatus: string | null = null
  let counterCancelledAt: string | null = null

  if (channel === "table" && tableSessionId) {
    const { data: session } = await supabase
      .from("table_sessions")
      .select(
        `
        waiter_user_id,
        guest_count,
        notes,
        opened_at,
        closed_at,
        opened_by,
        closed_by
      `,
      )
      .eq("id", tableSessionId)
      .eq("pop_id", popId)
      .maybeSingle()

    if (session) {
      base.openedAt =
        session.opened_at != null ? String(session.opened_at) : null
      base.closedAt =
        session.closed_at != null ? String(session.closed_at) : null
      base.guestCount =
        session.guest_count != null ? Number(session.guest_count) : null
      base.note =
        session.notes != null ? String(session.notes).trim() || null : null
      tableWaiterId =
        session.waiter_user_id != null
          ? String(session.waiter_user_id).trim() || null
          : null
      tableOpenedBy =
        session.opened_by != null
          ? String(session.opened_by).trim() || null
          : null
      tableClosedBy =
        session.closed_by != null
          ? String(session.closed_by).trim() || null
          : null
      if (tableWaiterId) userIds.add(tableWaiterId)
      if (tableOpenedBy) userIds.add(tableOpenedBy)
      if (tableClosedBy) userIds.add(tableClosedBy)
    }
  }

  if (channel === "counter" && counterOrderId) {
    const { data: order } = await supabase
      .from("counter_orders")
      .select(
        `
        order_number,
        status,
        fulfillment_type,
        delivery_address,
        phone,
        driver_name,
        estimated_minutes,
        notes,
        opened_at,
        delivered_at,
        cancelled_at,
        opened_by,
        cancelled_by
      `,
      )
      .eq("id", counterOrderId)
      .eq("pop_id", popId)
      .maybeSingle()

    if (order) {
      const orderNumber = Number(order.order_number)
      if (Number.isFinite(orderNumber) && !base.counterOrderLabel) {
        base.counterOrderLabel = `#${orderNumber}`
      }
      counterStatus = order.status != null ? String(order.status) : null
      base.openedAt = order.opened_at != null ? String(order.opened_at) : null
      base.deliveredAt =
        order.delivered_at != null ? String(order.delivered_at) : null
      counterCancelledAt =
        order.cancelled_at != null ? String(order.cancelled_at) : null
      const fulfillment = String(order.fulfillment_type ?? "").trim()
      base.fulfillmentType =
        fulfillment === "delivery" || fulfillment === "pickup"
          ? fulfillment
          : null
      base.deliveryAddress =
        order.delivery_address != null
          ? String(order.delivery_address).trim() || null
          : null
      base.phone =
        order.phone != null ? String(order.phone).trim() || null : null
      base.driverName =
        order.driver_name != null
          ? String(order.driver_name).trim() || null
          : null
      base.estimatedMinutes =
        order.estimated_minutes != null
          ? Number(order.estimated_minutes)
          : null
      base.note =
        order.notes != null ? String(order.notes).trim() || null : null
      counterOpenedBy =
        order.opened_by != null
          ? String(order.opened_by).trim() || null
          : null
      counterClosedBy =
        order.cancelled_by != null
          ? String(order.cancelled_by).trim() || null
          : null
      if (counterOpenedBy) userIds.add(counterOpenedBy)
      if (counterClosedBy) userIds.add(counterClosedBy)
      if (counterStatus === "cancelled" && counterCancelledAt) {
        base.closedAt = counterCancelledAt
      } else if (base.deliveredAt) {
        base.closedAt = base.deliveredAt
      } else if (soldAt) {
        base.closedAt = soldAt
      }
    }
  }

  const userNames = await loadUserDisplayNames(supabase, [...userIds])

  if (channel === "table") {
    base.openedByName = tableOpenedBy
      ? (userNames.get(tableOpenedBy) ?? null)
      : null
    base.closedByName = tableClosedBy
      ? (userNames.get(tableClosedBy) ?? null)
      : null
    base.waiterName = tableWaiterId
      ? (userNames.get(tableWaiterId) ?? null)
      : null
  }

  if (channel === "counter") {
    base.openedByName = counterOpenedBy
      ? (userNames.get(counterOpenedBy) ?? null)
      : null
    if (counterStatus === "cancelled" && counterClosedBy) {
      base.closedByName = userNames.get(counterClosedBy) ?? null
    } else if (createdBy) {
      base.closedByName = userNames.get(createdBy) ?? null
    }
  }

  if (createdBy) {
    base.soldByName = userNames.get(createdBy) ?? null
  }

  return base
}

function mapSaleRows(
  saleRows: Array<Record<string, unknown>>,
  arcaBySaleId: Map<string, OperationSaleArcaInvoice>,
  fiscalSiteId: string,
  tableLabelBySessionId: Map<string, string> = new Map(),
  counterOrderLabelByOrderId: Map<string, string> = new Map(),
  userNames: Map<string, string> = new Map(),
): OperationSaleRow[] {
  return saleRows.map((row) => {
    const saleId = String(row.id)
    const paymentsRaw = row.sale_payments as
      | Array<{
          amount?: unknown
          sort_order?: unknown
          payment_kind?: unknown
          treasury_accounts?:
            | { name?: string }
            | Array<{ name?: string }>
            | null
        }>
      | null
    const payments: OperationSalePayment[] = []
    const payList = Array.isArray(paymentsRaw) ? [...paymentsRaw] : []
    payList.sort(
      (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0),
    )
    for (const p of payList) {
      payments.push({
        amount: parseMoney(p.amount),
        methodName: formatTreasuryPaymentLabel(p),
      })
    }

    const saleMeta = parseSaleMetadata(row.metadata, fiscalSiteId)
    const channelMeta = parseChannelSaleMetadata(row.metadata)
    const rowTotal = parseMoney(row.total)
    const accruesOutputVat = saleMeta.accruesOutputVat
    const customerName =
      row.customer_name != null ? String(row.customer_name) : null
    const createdBy =
      row.created_by != null ? String(row.created_by).trim() || null : null

    return {
      id: saleId,
      soldAt: String(row.sold_at ?? ""),
      status: String(row.status ?? ""),
      saleAmount: rowTotal,
      total: rowTotal,
      subtotal: accruesOutputVat ? parseMoney(row.subtotal) : rowTotal,
      taxTotal: accruesOutputVat ? parseMoney(row.tax_total) : 0,
      discountTotal: parseMoney(row.discount_total),
      discountInfo: parseSaleDiscountInfo(row.metadata),
      snapshotInfo: parseSaleSnapshotInfo(row.metadata),
      clientId: row.client_id != null ? String(row.client_id) : null,
      customerName,
      customerTaxId:
        row.customer_tax_id != null ? String(row.customer_tax_id) : null,
      customerIvaConditionLabel: parseCustomerIvaConditionLabel(
        row.metadata,
        customerName,
      ),
      soldByName: createdBy ? userNames.get(createdBy) ?? null : null,
      invoiceTypeLabel: saleMeta.invoiceTypeLabel,
      accruesOutputVat,
      arcaInvoice: arcaBySaleId.get(saleId) ?? null,
      currency: String(row.currency ?? "ARS"),
      lineItems: parseLineItems(row.line_items),
      payments,
      paymentMethodLabel: resolveOperationPaymentMethodLabel({
        payments,
        onClientAccount:
          parseBooleanMetadataFlag(row.metadata, "pay_on_client_account") ||
          (payments.length === 0 &&
            row.client_id != null &&
            String(row.status ?? "") === "completed"),
      }),
      tableLabel: parseTableLabelFromSession(row, tableLabelBySessionId),
      counterOrderLabel: parseCounterOrderLabel(row, counterOrderLabelByOrderId),
      saleChannel: resolveSaleChannelFromRow(row),
      tableSessionId:
        row.table_session_id != null ? String(row.table_session_id) : null,
      counterOrderId:
        row.counter_order_id != null ? String(row.counter_order_id) : null,
      channelOrderTotal: channelMeta.channelOrderTotal,
      channelPaidTotal: channelMeta.channelPaidAccumulated,
    }
  })
}

function mapPurchaseRows(
  purchaseRows: Array<Record<string, unknown>>,
  userNames: Map<string, string> = new Map(),
  documentKindByPurchaseId: Map<string, string> = new Map(),
): OperationPurchaseRow[] {
  return purchaseRows.map((row) => {
    const sup = row.suppliers as { name?: string; iva_condition?: unknown } | null
    const supplierId =
      row.supplier_id != null ? String(row.supplier_id) : null
    const rawSupplierName =
      sup?.name?.trim() ||
      (row.supplier_name != null ? String(row.supplier_name).trim() : "")
    const supplierName = rawSupplierName || "—"
    const receivedAt = row.received_at != null ? String(row.received_at) : ""
    const documentDate =
      row.document_date != null ? String(row.document_date) : ""
    const createdAt = String(row.created_at ?? "")
    const createdBy =
      row.created_by != null ? String(row.created_by).trim() || null : null
    const operationDate =
      receivedAt.slice(0, 10) ||
      documentDate.slice(0, 10) ||
      createdAt.slice(0, 10)
    const operationAt =
      receivedAt ||
      createdAt ||
      (operationDate ? `${operationDate}T00:00:00` : "")

    const paymentsRaw = row.purchase_payments as
      | Array<{
          amount?: unknown
          paid_at?: unknown
          payment_kind?: unknown
          treasury_accounts?:
            | { name?: string }
            | Array<{ name?: string }>
            | null
        }>
      | null
    const payments: OperationPurchasePayment[] = []
    const payList = Array.isArray(paymentsRaw) ? [...paymentsRaw] : []
    payList.sort((a, b) =>
      String(a.paid_at ?? "").localeCompare(String(b.paid_at ?? "")),
    )
    let paidTotal = 0
    for (const p of payList) {
      const amt = parseMoney(p.amount)
      paidTotal = Math.round((paidTotal + amt) * 100) / 100
      payments.push({
        amount: amt,
        methodName: formatTreasuryPaymentLabel(p),
        paidAt: String(p.paid_at ?? "").slice(0, 10),
      })
    }

    const purchaseId = String(row.id)
    const comprobante = parsePurchaseComprobanteInfo(
      row.metadata,
      documentKindByPurchaseId.get(purchaseId) ?? null,
    )

    return {
      id: purchaseId,
      operationDate,
      operationAt,
      status: String(row.status ?? ""),
      purchaseKind: String(row.purchase_kind ?? "merchandise"),
      subtotal: parseMoney(row.subtotal),
      total: parseMoney(row.total),
      taxTotal: parseMoney(row.tax_total),
      paidTotal,
      supplierId,
      supplierName,
      documentNumber:
        row.document_number != null ? String(row.document_number) : null,
      currency: String(row.currency ?? "ARS"),
      discountTotal: parseMoney(row.discount_total),
      discountInfo: parsePurchaseDiscountInfo(row.metadata),
      lineItems: parsePurchaseLineItems(row.line_items),
      payments,
      paymentMethodLabel: resolveOperationPaymentMethodLabel({
        payments,
        onSupplierAccount:
          parseBooleanMetadataFlag(row.metadata, "pay_on_supplier_account") ||
          (payments.length === 0 &&
            supplierId != null &&
            !["paid", "cancelled", "voided", "draft"].includes(
              String(row.status ?? ""),
            )),
      }),
      purchasedByName: createdBy ? userNames.get(createdBy) ?? null : null,
      documentKindLabel: comprobante.documentKindLabel,
      accruesInputVat: comprobante.accruesInputVat,
      supplierIvaConditionLabel: parseSupplierIvaConditionLabel(sup?.iva_condition),
      vatIncludedEstimate: comprobante.vatIncludedEstimate,
    }
  })
}

async function mapExpenseLedgerRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  aeList: Array<Record<string, unknown>>,
  userNames: Map<string, string> = new Map(),
): Promise<OperationExpenseLedgerRow[]> {
  const payIds = aeList
    .map((r) => (r.source_id != null ? String(r.source_id) : ""))
    .filter((id) => id.length > 0)

  type PaymentJoin = {
    id: string
    amount: unknown
    paid_at: unknown
    expense_id: unknown
    payment_kind?: unknown
    treasury_accounts?: { name?: string } | null
    expenses: {
      id?: string
      amount?: unknown
      description?: string | null
      expense_categories: { name?: string } | null
    } | null
  }

  const paymentById = new Map<string, PaymentJoin>()
  if (payIds.length > 0) {
    const { data: epRows } = await supabase
      .from("expense_payments")
      .select(
        `
          id,
          amount,
          paid_at,
          expense_id,
          payment_kind,
          treasury_accounts ( name ),
          expenses (
            id,
            amount,
            description,
            expense_categories ( name )
          )
        `,
      )
      .eq("pop_id", popId)
      .in("id", payIds)
    for (const raw of epRows || []) {
      const row = raw as Record<string, unknown>
      const expenseRaw = relOne(
        row.expenses as
          | {
              id?: string
              amount?: unknown
              description?: string | null
              expense_categories?:
                | { name?: string }
                | Array<{ name?: string }>
                | null
            }
          | Array<{
              id?: string
              amount?: unknown
              description?: string | null
              expense_categories?:
                | { name?: string }
                | Array<{ name?: string }>
                | null
            }>
          | null
          | undefined,
      )
      const category = expenseRaw
        ? relOne(expenseRaw.expense_categories)
        : null
      paymentById.set(String(row.id), {
        id: String(row.id),
        amount: row.amount,
        paid_at: row.paid_at,
        expense_id: row.expense_id,
        payment_kind: row.payment_kind,
        treasury_accounts: relOne(
          row.treasury_accounts as
            | { name?: string }
            | Array<{ name?: string }>
            | null
            | undefined,
        ),
        expenses: expenseRaw
          ? {
              id: expenseRaw.id,
              amount: expenseRaw.amount,
              description: expenseRaw.description,
              expense_categories: category,
            }
          : null,
      })
    }
  }

  return aeList.map((row) => {
    const sid = row.source_id != null ? String(row.source_id) : ""
    const src = String(row.source_type ?? "")
    const isVoid = src === "expense_void"
    const entryDate = String(row.entry_date ?? "").slice(0, 10)
    const postedAt =
      row.posted_at != null ? String(row.posted_at) : ""
    const createdAt =
      row.created_at != null ? String(row.created_at) : ""
    const payment = paymentById.get(sid)
    const expense = payment?.expenses
    const categoryName =
      expense?.expense_categories?.name?.trim() ||
      String(row.description ?? "").replace(/^Gasto — /, "").split(" — ")[0]?.trim() ||
      "—"
    const expenseDesc = expense?.description?.trim() || ""
    const ledgerDesc = String(row.description ?? "").trim()
    const description =
      expenseDesc ||
      ledgerDesc.replace(/^Anulación — /, "").replace(/^Gasto — /, "") ||
      "—"
    const paidAt =
      payment?.paid_at != null ? String(payment.paid_at).slice(0, 10) : ""
    const operationAt =
      postedAt ||
      createdAt ||
      (paidAt ? `${paidAt}T12:00:00` : "") ||
      (entryDate ? `${entryDate}T00:00:00` : "")
    const operationDate =
      paidAt || entryDate || operationAt.slice(0, 10)
    const amount = parseMoney(payment?.amount)
    const expenseAmount =
      expense?.amount != null ? parseMoney(expense.amount) : null
    const paymentMethodLabel = isVoid
      ? "—"
      : formatTreasuryPaymentLabel({
          payment_kind: payment?.payment_kind,
          treasury_accounts: payment?.treasury_accounts,
        })

    const createdBy =
      row.created_by != null ? String(row.created_by).trim() || null : null

    return {
      entryId: String(row.id),
      expenseId:
        expense?.id != null
          ? String(expense.id)
          : payment?.expense_id != null
            ? String(payment.expense_id)
            : null,
      expensePaymentId: sid || null,
      sourceType: isVoid ? "expense_void" : "expense_payment",
      operationDate,
      operationAt,
      amount,
      expenseAmount,
      categoryName,
      description,
      paymentMethodLabel,
      recordedByName: createdBy ? userNames.get(createdBy) ?? null : null,
    }
  })
}

export async function getOperationsList(
  popId: string,
  input: GetOperationsListInput,
): Promise<
  | {
      success: true
      popName: string
      totalCount: number
      page: number
      sales: OperationSaleRow[]
      expenseLedger: OperationExpenseLedgerRow[]
      purchases: OperationPurchaseRow[]
      serviceCharges?: OperationServiceChargeRow[]
    }
  | {
      success: false
      error: string
      redirect?: string
      popName?: string
      totalCount: number
      page: number
      sales: OperationSaleRow[]
      expenseLedger: OperationExpenseLedgerRow[]
      purchases: OperationPurchaseRow[]
      serviceCharges?: OperationServiceChargeRow[]
    }
> {
  const emptySales: OperationSaleRow[] = []
  const emptyExpenseLedger: OperationExpenseLedgerRow[] = []
  const emptyPurchases: OperationPurchaseRow[] = []
  const { page: reqPage, pageSize } = normalizeOperationsListPaging(
    input.page,
    input.pageSize,
  )
  const emptyFailure = {
    sales: emptySales,
    expenseLedger: emptyExpenseLedger,
    purchases: emptyPurchases,
    totalCount: 0,
    page: reqPage,
  }

  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return {
        success: false,
        error: access.error || "Sin acceso",
        redirect: "/home",
        popName: "",
        ...emptyFailure,
      }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.OPERATIONS_READ.resource,
        POP_PERMS.OPERATIONS_READ.action,
      )
    ) {
      return {
        success: false,
        error: "No tenés permiso para ver operaciones en este punto.",
        redirect: popMenuHref(await getPopSiteId(popId), popId),
        popName: "",
        ...emptyFailure,
      }
    }

    const popRes = await getPopById(popId)
    const popName =
      popRes.success && popRes.pop ? String(popRes.pop.name ?? "") : ""
    const fiscalSiteId =
      popRes.success && popRes.pop
        ? siteIdFromPopRow(popRes.pop)
        : DEFAULT_SALE_SITE_ID
    const ledgerTimeZone =
      popRes.success && popRes.pop
        ? timezoneForPopLedger(popRes.pop.country, popRes.pop.siteId)
        : "America/Argentina/Buenos_Aires"

    const supabase = await createClient()

    const { dateFrom, dateTo, search, view, filters: listFilters } = input
    const searchTerm = search.trim()
    const uuidSearch =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        searchTerm,
      )

    if (
      view === "sales" ||
      view === "sales-report" ||
      view === "tables" ||
      view === "counter"
    ) {
      const isChannelGroupedView = view === "tables" || view === "counter"
      const isAllChannelsSalesView = view === "sales-report"
      const isSalesDateFilteredView =
        view === "sales" ||
        view === "sales-report" ||
        view === "tables" ||
        view === "counter"

      let operationalDayCloseTime = DEFAULT_OPERATIONAL_DAY_CLOSE_TIME
      let salesTimeZone = ledgerTimeZone
      if (isSalesDateFilteredView && (dateFrom || dateTo)) {
        const operationalContext = await loadPopOperationalContext(
          supabase,
          popId,
        )
        operationalDayCloseTime = operationalContext.operationalDayCloseTime
        salesTimeZone = operationalContext.timeZone
      }

      const useOperationalDayFilter =
        isSalesDateFilteredView &&
        usesOperationalDayFilter(operationalDayCloseTime, dateFrom, dateTo)

      const salesFetchBounds = useOperationalDayFilter
        ? expandCalendarBoundsForOperationalFetch(dateFrom, dateTo)
        : { from: dateFrom, to: dateTo }

      let totalCount = 0
      let safePage = Math.max(1, reqPage)
      let from = (safePage - 1) * pageSize
      let to = from + pageSize - 1

      if (!isChannelGroupedView && !useOperationalDayFilter) {
        let countQuery = supabase
          .from("sales")
          .select("id", { count: "exact", head: true })
          .eq("pop_id", popId)
        if (!isAllChannelsSalesView) {
          countQuery = countQuery
            .neq("sale_channel", "table")
            .neq("sale_channel", "counter")
        }
        countQuery = appendSalesDateFilter(
          countQuery,
          salesFetchBounds.from,
          salesFetchBounds.to,
          salesTimeZone,
        )
        if (uuidSearch) {
          countQuery = countQuery.eq("id", searchTerm)
        } else {
          const orClause = buildSalesSearchOrClause(search)
          if (orClause) countQuery = countQuery.or(orClause)
        }
        if (view === "sales" || view === "sales-report") {
          countQuery = applySalesListToolbarFilters(countQuery, listFilters)
        }

        const { count: countRaw, error: countErr } = await countQuery
        if (countErr) {
          return {
            success: false,
            error: countErr.message || "No se pudieron cargar las ventas.",
            popName,
            totalCount: 0,
            page: reqPage,
            sales: emptySales,
            expenseLedger: emptyExpenseLedger,
            purchases: emptyPurchases,
          }
        }

        totalCount = countRaw ?? 0
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
        safePage = Math.min(Math.max(1, reqPage), totalPages)
        from = (safePage - 1) * pageSize
        to = from + pageSize - 1
      }

      let dataQuery = supabase
        .from("sales")
        .select(SALE_LIST_SELECT)
        .eq("pop_id", popId)
      if (view === "tables") {
        dataQuery = dataQuery.eq("sale_channel", "table")
      } else if (view === "counter") {
        dataQuery = dataQuery.eq("sale_channel", "counter")
      } else if (!isAllChannelsSalesView) {
        dataQuery = dataQuery
          .neq("sale_channel", "table")
          .neq("sale_channel", "counter")
      }
      dataQuery = appendSalesDateFilter(
        dataQuery,
        salesFetchBounds.from,
        salesFetchBounds.to,
        salesTimeZone,
      )
      if (uuidSearch) {
        dataQuery = dataQuery.eq("id", searchTerm)
      } else {
        const orClause = buildSalesSearchOrClause(search)
        if (orClause) dataQuery = dataQuery.or(orClause)
      }
      if (view === "sales" || view === "sales-report") {
        dataQuery = applySalesListToolbarFilters(dataQuery, listFilters)
      }
      const salesListOrder = resolveOperationsSalesListOrder(input)
      dataQuery = dataQuery.order(salesListOrder.column, {
        ascending: salesListOrder.ascending,
      })
      if (!isChannelGroupedView && !useOperationalDayFilter) {
        dataQuery = dataQuery.range(from, to)
      }

      const { data: saleRows, error: saleErr } = await dataQuery
      if (saleErr) {
        return {
          success: false,
          error: saleErr.message || "No se pudieron cargar las ventas.",
          popName,
          totalCount,
          page: safePage,
          sales: emptySales,
          expenseLedger: emptyExpenseLedger,
          purchases: emptyPurchases,
        }
      }

      const saleIds = (saleRows || []).map((r) => String(r.id))
      const arcaBySaleId = await loadArcaBySaleIds(
        supabase,
        popId,
        fiscalSiteId,
        saleIds,
      )
      const tableLabelBySessionId =
        view === "tables" || isAllChannelsSalesView
          ? await loadTableLabelsBySaleIds(
              supabase,
              popId,
              (saleRows || []) as Array<Record<string, unknown>>,
            )
          : new Map<string, string>()
      const counterOrderLabelByOrderId =
        view === "counter" || isAllChannelsSalesView
          ? await loadCounterOrderLabelsBySaleIds(
              supabase,
              popId,
              (saleRows || []) as Array<Record<string, unknown>>,
            )
          : new Map<string, string>()
      const tableSummaryBySessionId =
        view === "tables"
          ? await loadTableSessionSummariesBySaleIds(
              supabase,
              popId,
              (saleRows || []) as Array<Record<string, unknown>>,
            )
          : new Map<string, TableSessionListSummary>()
      const counterSummaryByOrderId =
        view === "counter"
          ? await loadCounterOrderSummariesBySaleIds(
              supabase,
              popId,
              (saleRows || []) as Array<Record<string, unknown>>,
            )
          : new Map<string, CounterOrderListSummary>()
      const channelUserIds = new Set<string>()
      for (const summary of tableSummaryBySessionId.values()) {
        if (summary.openedBy) channelUserIds.add(summary.openedBy)
        if (summary.closedBy) channelUserIds.add(summary.closedBy)
        if (summary.waiterUserId) channelUserIds.add(summary.waiterUserId)
      }
      for (const summary of counterSummaryByOrderId.values()) {
        if (summary.openedBy) channelUserIds.add(summary.openedBy)
        if (summary.cancelledBy) channelUserIds.add(summary.cancelledBy)
      }
      for (const row of saleRows || []) {
        const createdBy =
          row.created_by != null ? String(row.created_by).trim() : ""
        if (createdBy) channelUserIds.add(createdBy)
      }
      const userNames = await loadUserDisplayNames(supabase, [...channelUserIds])
      let sales = mapSaleRows(
        (saleRows || []) as Array<Record<string, unknown>>,
        arcaBySaleId,
        fiscalSiteId,
        tableLabelBySessionId,
        counterOrderLabelByOrderId,
        userNames,
      )
      if (useOperationalDayFilter) {
        sales = filterSalesByOperationalPeriod(
          sales,
          dateFrom,
          dateTo,
          salesTimeZone,
          operationalDayCloseTime,
        )
      }
      if (useOperationalDayFilter && !isChannelGroupedView) {
        sales = sales.filter((sale) =>
          saleMatchesOperationsFilters(sale, listFilters),
        )
        totalCount = sales.length
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
        safePage = Math.min(Math.max(1, reqPage), totalPages)
        from = (safePage - 1) * pageSize
        to = from + pageSize - 1
        sales = sales.slice(from, to + 1)
      }
      if (isChannelGroupedView) {
        sales = applyChannelListFieldsToSaleRows(sales, {
          view: view === "tables" ? "table" : "counter",
          tableSummaryBySessionId,
          counterSummaryByOrderId,
          userNames,
        })
        sales = groupChannelOperationSales(
          sales,
          view === "tables" ? "table" : "counter",
        )
        sales =
          view === "tables"
            ? sales.filter((sale) =>
                tableSaleMatchesOperationsFilters(sale, listFilters),
              )
            : sales.filter((sale) =>
                counterSaleMatchesOperationsFilters(sale, listFilters),
              )
        totalCount = sales.length
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
        safePage = Math.min(Math.max(1, reqPage), totalPages)
        from = (safePage - 1) * pageSize
        to = from + pageSize - 1
        sales = sales.slice(from, to + 1)
      }

      return {
        success: true,
        popName,
        totalCount,
        page: safePage,
        sales,
        expenseLedger: emptyExpenseLedger,
        purchases: emptyPurchases,
      }
    }

    if (view === "purchases") {
      let fiscalPurchaseIds: string[] | null = null
      if (input.fiscalOnly) {
        fiscalPurchaseIds = await loadFiscalPurchaseIdsForPop(supabase, popId)
        if (fiscalPurchaseIds.length === 0) {
          return {
            success: true,
            popName,
            totalCount: 0,
            page: 1,
            sales: emptySales,
            expenseLedger: emptyExpenseLedger,
            purchases: emptyPurchases,
          }
        }
      }

      let countQuery = supabase
        .from("purchases")
        .select("id", { count: "exact", head: true })
        .eq("pop_id", popId)
        .neq("status", "draft")
      if (fiscalPurchaseIds) {
        countQuery = countQuery.in("id", fiscalPurchaseIds)
      }
      countQuery = appendPurchasesDateFilter(
        countQuery,
        dateFrom,
        dateTo,
        ledgerTimeZone,
      )
      const orClause = buildPurchasesSearchOrClause(search)
      if (orClause) countQuery = countQuery.or(orClause)
      countQuery = applyPurchasesListToolbarFilters(countQuery, listFilters)

      const { count: countRaw, error: countErr } = await countQuery
      if (countErr) {
        return {
          success: false,
          error: countErr.message || "No se pudieron cargar las compras.",
          popName,
          totalCount: 0,
          page: reqPage,
          sales: emptySales,
          expenseLedger: emptyExpenseLedger,
          purchases: emptyPurchases,
        }
      }

      const totalCount = countRaw ?? 0
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
      const safePage = Math.min(Math.max(1, reqPage), totalPages)
      const from = (safePage - 1) * pageSize
      const to = from + pageSize - 1

      let dataQuery = supabase
        .from("purchases")
        .select(PURCHASE_LIST_SELECT)
        .eq("pop_id", popId)
        .neq("status", "draft")
      if (fiscalPurchaseIds) {
        dataQuery = dataQuery.in("id", fiscalPurchaseIds)
      }
      dataQuery = appendPurchasesDateFilter(
        dataQuery,
        dateFrom,
        dateTo,
        ledgerTimeZone,
      )
      if (orClause) dataQuery = dataQuery.or(orClause)
      dataQuery = applyPurchasesListToolbarFilters(dataQuery, listFilters)
      const purchasesListOrder = resolveOperationsPurchasesListOrder(input)
      dataQuery = dataQuery
        .order(purchasesListOrder.column, {
          ascending: purchasesListOrder.ascending,
        })
        .range(from, to)

      const { data: purchaseRows, error: purchaseErr } = await dataQuery
      if (purchaseErr) {
        return {
          success: false,
          error: purchaseErr.message || "No se pudieron cargar las compras.",
          popName,
          totalCount,
          page: safePage,
          sales: emptySales,
          expenseLedger: emptyExpenseLedger,
          purchases: emptyPurchases,
        }
      }

      const purchaseUserNames = await loadUserDisplayNames(
        supabase,
        (purchaseRows || [])
          .map((row) =>
            row.created_by != null ? String(row.created_by).trim() : "",
          )
          .filter(Boolean),
      )
      const documentKindByPurchaseId = await loadPurchaseDocumentKindsByPurchaseIds(
        supabase,
        popId,
        (purchaseRows || []).map((row) => String(row.id)),
      )
      const purchases = mapPurchaseRows(
        (purchaseRows || []) as Array<Record<string, unknown>>,
        purchaseUserNames,
        documentKindByPurchaseId,
      ).filter((purchase) => !input.fiscalOnly || purchase.accruesInputVat)

      return {
        success: true,
        popName,
        totalCount,
        page: safePage,
        sales: emptySales,
        expenseLedger: emptyExpenseLedger,
        purchases,
      }
    }

    if (view === "services") {
      const today = todayIsoDateOnly()
      const searchResolved = await resolveServiceChargeSearchIds(
        supabase,
        popId,
        search,
      )

      let countQuery = supabase
        .from("service_charges")
        .select("id", { count: "exact", head: true })
        .eq("pop_id", popId)
      countQuery = appendServiceChargesDateFilter(
        countQuery,
        dateFrom,
        dateTo,
        ledgerTimeZone,
      )
      countQuery = applyServiceChargeSearchFilter(
        countQuery,
        searchResolved,
        today,
      )
      countQuery = applyServiceChargeToolbarFilters(
        countQuery,
        listFilters,
        today,
      )

      const { count: countRaw, error: countErr } = await countQuery
      if (countErr) {
        return {
          success: false,
          error: countErr.message || "No se pudieron cargar los servicios.",
          popName,
          totalCount: 0,
          page: reqPage,
          sales: emptySales,
          expenseLedger: emptyExpenseLedger,
          purchases: emptyPurchases,
          serviceCharges: [],
        }
      }

      const totalCount = countRaw ?? 0
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
      const safePage = Math.min(Math.max(1, reqPage), totalPages)
      const from = (safePage - 1) * pageSize
      const to = from + pageSize - 1

      let dataQuery = supabase
        .from("service_charges")
        .select(SERVICE_CHARGE_LIST_SELECT)
        .eq("pop_id", popId)
      dataQuery = appendServiceChargesDateFilter(
        dataQuery,
        dateFrom,
        dateTo,
        ledgerTimeZone,
      )
      dataQuery = applyServiceChargeSearchFilter(
        dataQuery,
        searchResolved,
        today,
      )
      dataQuery = applyServiceChargeToolbarFilters(
        dataQuery,
        listFilters,
        today,
      )
      const servicesListOrder = resolveOperationsServicesListOrder(input)
      dataQuery = dataQuery
        .order(servicesListOrder.column, {
          ascending: servicesListOrder.ascending,
        })
        .range(from, to)

      const { data: chargeRows, error: chargeErr } = await dataQuery
      if (chargeErr) {
        return {
          success: false,
          error: chargeErr.message || "No se pudieron cargar los servicios.",
          popName,
          totalCount,
          page: safePage,
          sales: emptySales,
          expenseLedger: emptyExpenseLedger,
          purchases: emptyPurchases,
          serviceCharges: [],
        }
      }

      const chargeIds = (chargeRows ?? []).map((row) => String(row.id))
      const paidByChargeId = new Map<string, number>()
      const paymentsByChargeId = new Map<
        string,
        OperationServiceChargePaymentRow[]
      >()

      if (chargeIds.length > 0) {
        const { data: paymentRows, error: paymentErr } = await supabase
          .from("service_charge_payments")
          .select("id, service_charge_id, amount, paid_at, payment_kind, notes")
          .eq("pop_id", popId)
          .in("service_charge_id", chargeIds)
          .order("paid_at", { ascending: false })
        if (paymentErr) {
          return {
            success: false,
            error: paymentErr.message || "No se pudieron cargar los cobros.",
            popName,
            totalCount,
            page: safePage,
            sales: emptySales,
            expenseLedger: emptyExpenseLedger,
            purchases: emptyPurchases,
            serviceCharges: [],
          }
        }
        for (const payment of paymentRows ?? []) {
          const chargeId = String(payment.service_charge_id)
          const amount = parseServiceChargeMoney(payment.amount)
          paidByChargeId.set(
            chargeId,
            roundServiceChargeMoney((paidByChargeId.get(chargeId) ?? 0) + amount),
          )
          const list = paymentsByChargeId.get(chargeId) ?? []
          list.push({
            id: String(payment.id),
            amount,
            paidAt: String(payment.paid_at ?? ""),
            paymentKind:
              payment.payment_kind != null
                ? String(payment.payment_kind)
                : null,
            notes: String(payment.notes ?? ""),
          })
          paymentsByChargeId.set(chargeId, list)
        }
      }

      const serviceCharges = (chargeRows ?? []).map((row) =>
        mapOperationServiceChargeRow(
          row as Record<string, unknown>,
          paidByChargeId,
          paymentsByChargeId,
          today,
        ),
      )

      return {
        success: true,
        popName,
        totalCount,
        page: safePage,
        sales: emptySales,
        expenseLedger: emptyExpenseLedger,
        purchases: emptyPurchases,
        serviceCharges,
      }
    }

    const expenseSourceTypes = listFilters?.expenseSource
      ? [listFilters.expenseSource]
      : (["expense_payment", "expense_void"] as const)

    let countQuery = supabase
      .from("accounting_entries")
      .select("id", { count: "exact", head: true })
      .eq("pop_id", popId)
      .in("source_type", [...expenseSourceTypes])
      .eq("status", "posted")
    countQuery = appendExpensesDateFilter(countQuery, dateFrom, dateTo)
    const expenseOrClause = buildExpensesSearchOrClause(search)
    if (expenseOrClause) countQuery = countQuery.or(expenseOrClause)

    const { count: countRaw, error: countErr } = await countQuery
    if (countErr) {
      return {
        success: false,
        error: countErr.message || "No se pudieron cargar los asientos de gastos.",
        popName,
        totalCount: 0,
        page: reqPage,
        sales: emptySales,
        expenseLedger: emptyExpenseLedger,
        purchases: emptyPurchases,
      }
    }

    const totalCount = countRaw ?? 0
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
    const safePage = Math.min(Math.max(1, reqPage), totalPages)
    const from = (safePage - 1) * pageSize
    const to = from + pageSize - 1

    let dataQuery = supabase
      .from("accounting_entries")
      .select(
        "id, entry_date, description, source_type, source_id, status, created_at, posted_at, created_by",
      )
      .eq("pop_id", popId)
      .in("source_type", [...expenseSourceTypes])
      .eq("status", "posted")
    dataQuery = appendExpensesDateFilter(dataQuery, dateFrom, dateTo)
    if (expenseOrClause) dataQuery = dataQuery.or(expenseOrClause)
    const expensesListOrder = resolveOperationsExpensesListOrder(input)
    dataQuery = dataQuery
      .order(expensesListOrder.column, {
        ascending: expensesListOrder.ascending,
      })
      .range(from, to)

    const { data: aeRows, error: aeErr } = await dataQuery
    if (aeErr) {
      return {
        success: false,
        error: aeErr.message || "No se pudieron cargar los asientos de gastos.",
        popName,
        totalCount,
        page: safePage,
        sales: emptySales,
        expenseLedger: emptyExpenseLedger,
        purchases: emptyPurchases,
      }
    }

    const expenseUserNames = await loadUserDisplayNames(
      supabase,
      (aeRows || [])
        .map((row) =>
          row.created_by != null ? String(row.created_by).trim() : "",
        )
        .filter(Boolean),
    )

    const expenseLedger = await mapExpenseLedgerRows(
      supabase,
      popId,
      (aeRows || []) as Array<Record<string, unknown>>,
      expenseUserNames,
    )

    return {
      success: true,
      popName,
      totalCount,
      page: safePage,
      sales: emptySales,
      expenseLedger,
      purchases: emptyPurchases,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return {
      success: false,
      error: message,
      popName: "",
      ...emptyFailure,
    }
  }
}

export type OperationAccountingLineRow = {
  id: string
  accountCode: string
  accountName: string
  debitAmount: number
  creditAmount: number
  lineDescription: string | null
}

export type OperationAccountingEntryDetail = {
  id: string
  entryNumber: number
  entryDate: string
  description: string
  sourceType: string
  status: string
  totalDebit: number
  totalCredit: number
  lines: OperationAccountingLineRow[]
}

function mapAccountingEntryLines(
  lines: Array<Record<string, unknown>>,
): OperationAccountingLineRow[] {
  return lines.map((r) => {
    const acc = r.accounting_chart_of_accounts as unknown as {
      code?: string
      name?: string
    } | null
    return {
      id: String(r.id),
      accountCode: acc?.code ? String(acc.code) : "—",
      accountName: acc?.name ? String(acc.name) : "—",
      debitAmount: parseMoney(r.debit_amount),
      creditAmount: parseMoney(r.credit_amount),
      lineDescription:
        r.description != null ? String(r.description) : null,
    }
  })
}

async function fetchAccountingEntryDetails(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  entryRows: Array<Record<string, unknown>>,
): Promise<OperationAccountingEntryDetail[]> {
  if (entryRows.length === 0) return []

  const entryIds = entryRows.map((e) => String(e.id))
  const { data: lineRows, error: lineErr } = await supabase
    .from("accounting_entry_lines")
    .select(
      `
        id,
        entry_id,
        debit_amount,
        credit_amount,
        description,
        line_order,
        accounting_chart_of_accounts ( code, name )
      `,
    )
    .in("entry_id", entryIds)
    .order("line_order", { ascending: true })

  if (lineErr) {
    throw new Error(lineErr.message || "No se pudieron cargar las líneas.")
  }

  const linesByEntry = new Map<string, OperationAccountingLineRow[]>()
  const debitByEntry = new Map<string, number>()
  const creditByEntry = new Map<string, number>()

  for (const raw of lineRows || []) {
    const row = raw as Record<string, unknown>
    const entryId = String(row.entry_id)
    const mapped = mapAccountingEntryLines([row])[0]
    const list = linesByEntry.get(entryId) ?? []
    list.push(mapped)
    linesByEntry.set(entryId, list)
    debitByEntry.set(
      entryId,
      parseMoney(debitByEntry.get(entryId) ?? 0) + mapped.debitAmount,
    )
    creditByEntry.set(
      entryId,
      parseMoney(creditByEntry.get(entryId) ?? 0) + mapped.creditAmount,
    )
  }

  return entryRows.map((e) => {
    const id = String(e.id)
    return {
      id,
      entryNumber: Number(e.entry_number ?? 0),
      entryDate: String(e.entry_date ?? "").slice(0, 10),
      description: String(e.description ?? ""),
      sourceType: String(e.source_type ?? ""),
      status: String(e.status ?? ""),
      totalDebit: parseMoney(debitByEntry.get(id) ?? 0),
      totalCredit: parseMoney(creditByEntry.get(id) ?? 0),
      lines: linesByEntry.get(id) ?? [],
    }
  })
}

export async function getOperationAccountingEntries(
  popId: string,
  input: {
    view: OperationsListView
    operationId: string
    groupedSaleIds?: string[]
  },
): Promise<
  | { success: true; entries: OperationAccountingEntryDetail[] }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.OPERATIONS_READ.resource,
        POP_PERMS.OPERATIONS_READ.action,
      )
    ) {
      return {
        success: false,
        error: "No tenés permiso para ver operaciones en este punto.",
      }
    }

    const supabase = await createClient()
    const { view, operationId } = input
    let entryRows: Array<Record<string, unknown>> = []

    if (view === "sales" || view === "tables" || view === "counter") {
      const saleIds =
        input.groupedSaleIds && input.groupedSaleIds.length > 0
          ? input.groupedSaleIds
          : [operationId]
      const { data, error } = await supabase
        .from("accounting_entries")
        .select(
          "id, entry_number, entry_date, description, source_type, status",
        )
        .eq("pop_id", popId)
        .eq("source_type", "sale")
        .in("source_id", saleIds)
        .neq("status", "cancelled")
        .order("entry_number", { ascending: true })
      if (error) {
        return {
          success: false,
          error: error.message || "No se pudieron cargar los asientos.",
        }
      }
      entryRows = (data || []) as Array<Record<string, unknown>>
    } else if (view === "purchases") {
      const { data: purchaseEntries, error: purchaseErr } = await supabase
        .from("accounting_entries")
        .select(
          "id, entry_number, entry_date, description, source_type, status",
        )
        .eq("pop_id", popId)
        .eq("source_type", "purchase")
        .eq("source_id", operationId)
        .neq("status", "cancelled")
      if (purchaseErr) {
        return {
          success: false,
          error: purchaseErr.message || "No se pudieron cargar los asientos.",
        }
      }

      const { data: paymentRows, error: payErr } = await supabase
        .from("purchase_payments")
        .select("id")
        .eq("pop_id", popId)
        .eq("purchase_id", operationId)
      if (payErr) {
        return {
          success: false,
          error: payErr.message || "No se pudieron cargar los pagos.",
        }
      }

      const paymentIds = (paymentRows || []).map((p) => String(p.id))
      let paymentEntries: Array<Record<string, unknown>> = []
      if (paymentIds.length > 0) {
        const { data, error } = await supabase
          .from("accounting_entries")
          .select(
            "id, entry_number, entry_date, description, source_type, status",
          )
          .eq("pop_id", popId)
          .eq("source_type", "purchase_payment")
          .in("source_id", paymentIds)
          .neq("status", "cancelled")
        if (error) {
          return {
            success: false,
            error: error.message || "No se pudieron cargar los asientos.",
          }
        }
        paymentEntries = (data || []) as Array<Record<string, unknown>>
      }

      entryRows = [
        ...((purchaseEntries || []) as Array<Record<string, unknown>>),
        ...paymentEntries,
      ].sort(
        (a, b) =>
          Number(a.entry_number ?? 0) - Number(b.entry_number ?? 0) ||
          String(a.entry_date ?? "").localeCompare(String(b.entry_date ?? "")),
      )
    } else {
      const { data, error } = await supabase
        .from("accounting_entries")
        .select(
          "id, entry_number, entry_date, description, source_type, status",
        )
        .eq("pop_id", popId)
        .eq("id", operationId)
        .neq("status", "cancelled")
        .maybeSingle()
      if (error) {
        return {
          success: false,
          error: error.message || "No se pudieron cargar los asientos.",
        }
      }
      entryRows = data ? [data as Record<string, unknown>] : []
    }

    const entries = await fetchAccountingEntryDetails(
      supabase,
      popId,
      entryRows,
    )
    return { success: true, entries }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function getOperationSaleById(
  popId: string,
  saleId: string,
): Promise<
  | { success: true; sale: OperationSaleRow; context: OperationSaleDetailContext }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }

    const snap = await loadPopPermissionsSnapshot(popId)
    const canRead =
      permissionKeysInclude(
        snap.keys,
        POP_PERMS.OPERATIONS_READ.resource,
        POP_PERMS.OPERATIONS_READ.action,
      ) ||
      permissionKeysInclude(
        snap.keys,
        POP_PERMS.SALE_READ.resource,
        POP_PERMS.SALE_READ.action,
      )
    if (!canRead) {
      return {
        success: false,
        error: "No tenés permiso para ver ventas.",
      }
    }

    const trimmedSaleId = saleId.trim()
    if (!trimmedSaleId) {
      return { success: false, error: "Venta inválida." }
    }

    const popRes = await getPopById(popId)
    const fiscalSiteId =
      popRes.success && popRes.pop
        ? siteIdFromPopRow(popRes.pop)
        : DEFAULT_SALE_SITE_ID

    const supabase = await createClient()
    const { data: row, error } = await supabase
      .from("sales")
      .select(SALE_LIST_SELECT)
      .eq("pop_id", popId)
      .eq("id", trimmedSaleId)
      .maybeSingle()

    if (error || !row) {
      return {
        success: false,
        error: error?.message || "No se encontró la venta.",
      }
    }

    const saleChannel = String(row.sale_channel ?? "")
    const arcaBySaleId = await loadArcaBySaleIds(
      supabase,
      popId,
      fiscalSiteId,
      [trimmedSaleId],
    )
    const tableLabelBySessionId =
      saleChannel === "table"
        ? await loadTableLabelsBySaleIds(supabase, popId, [
            row as Record<string, unknown>,
          ])
        : new Map<string, string>()
    const counterOrderLabelByOrderId =
      saleChannel === "counter"
        ? await loadCounterOrderLabelsBySaleIds(supabase, popId, [
            row as Record<string, unknown>,
          ])
        : new Map<string, string>()

    const userNames = await loadUserDisplayNames(
      supabase,
      row.created_by != null ? [String(row.created_by).trim()] : [],
    )

    const sales = mapSaleRows(
      [row as Record<string, unknown>],
      arcaBySaleId,
      fiscalSiteId,
      tableLabelBySessionId,
      counterOrderLabelByOrderId,
      userNames,
    )
    const sale = sales[0]
    if (!sale) {
      return { success: false, error: "No se encontró la venta." }
    }

    const context = await loadOperationSaleDetailContext(
      supabase,
      popId,
      row as Record<string, unknown>,
      tableLabelBySessionId,
      counterOrderLabelByOrderId,
    )

    return { success: true, sale, context }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

function mapSaleToChargeRow(sale: OperationSaleRow): OperationSaleChargeRow {
  const label = saleComprobanteLabel(sale)
  return {
    saleId: sale.id,
    soldAt: sale.soldAt,
    amount: sale.saleAmount,
    methodName: sale.paymentMethodLabel,
    comprobanteLabel: label !== "—" ? label : null,
    hasComprobante: saleHasComprobante(sale),
    sale,
  }
}

export async function getOperationSaleDetailCharges(
  popId: string,
  input: {
    saleId: string
    groupedSaleIds?: string[]
  },
): Promise<
  | { success: true; charges: OperationSaleChargeRow[] }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }

    const snap = await loadPopPermissionsSnapshot(popId)
    const canRead =
      permissionKeysInclude(
        snap.keys,
        POP_PERMS.OPERATIONS_READ.resource,
        POP_PERMS.OPERATIONS_READ.action,
      ) ||
      permissionKeysInclude(
        snap.keys,
        POP_PERMS.SALE_READ.resource,
        POP_PERMS.SALE_READ.action,
      )
    if (!canRead) {
      return {
        success: false,
        error: "No tenés permiso para ver ventas.",
      }
    }

    const primarySaleId = input.saleId.trim()
    if (!primarySaleId) {
      return { success: false, error: "Venta inválida." }
    }

    const saleIds = [
      ...new Set(
        (input.groupedSaleIds?.length
          ? input.groupedSaleIds
          : [primarySaleId]
        ).map((id) => id.trim()).filter(Boolean),
      ),
    ]

    const popRes = await getPopById(popId)
    const fiscalSiteId =
      popRes.success && popRes.pop
        ? siteIdFromPopRow(popRes.pop)
        : DEFAULT_SALE_SITE_ID

    const supabase = await createClient()
    const { data: rows, error } = await supabase
      .from("sales")
      .select(SALE_LIST_SELECT)
      .eq("pop_id", popId)
      .in("id", saleIds)

    if (error) {
      return { success: false, error: error.message }
    }
    if (!rows?.length) {
      return { success: false, error: "No se encontraron cobros." }
    }

    const arcaBySaleId = await loadArcaBySaleIds(
      supabase,
      popId,
      fiscalSiteId,
      saleIds,
    )
    const tableLabelBySessionId = await loadTableLabelsBySaleIds(
      supabase,
      popId,
      rows as Array<Record<string, unknown>>,
    )
    const counterOrderLabelByOrderId =
      await loadCounterOrderLabelsBySaleIds(
        supabase,
        popId,
        rows as Array<Record<string, unknown>>,
      )

    const userNames = await loadUserDisplayNames(
      supabase,
      (rows || [])
        .map((row) =>
          row.created_by != null ? String(row.created_by).trim() : "",
        )
        .filter(Boolean),
    )

    const sales = mapSaleRows(
      rows as Array<Record<string, unknown>>,
      arcaBySaleId,
      fiscalSiteId,
      tableLabelBySessionId,
      counterOrderLabelByOrderId,
      userNames,
    ).sort((a, b) => a.soldAt.localeCompare(b.soldAt))

    return {
      success: true,
      charges: sales.map(mapSaleToChargeRow),
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function getOperationSaleDetailContext(
  popId: string,
  saleId: string,
): Promise<
  | { success: true; context: OperationSaleDetailContext }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }

    const trimmedSaleId = saleId.trim()
    if (!trimmedSaleId) {
      return { success: false, error: "Venta inválida." }
    }

    const supabase = await createClient()
    const { data: row, error } = await supabase
      .from("sales")
      .select(
        `
        id,
        sold_at,
        customer_name,
        created_by,
        sale_channel,
        table_session_id,
        counter_order_id
      `,
      )
      .eq("pop_id", popId)
      .eq("id", trimmedSaleId)
      .maybeSingle()

    if (error || !row) {
      return {
        success: false,
        error: error?.message || "No se encontró la venta.",
      }
    }

    const saleChannel = String(row.sale_channel ?? "")
    const tableLabelBySessionId =
      saleChannel === "table"
        ? await loadTableLabelsBySaleIds(supabase, popId, [
            row as Record<string, unknown>,
          ])
        : new Map<string, string>()
    const counterOrderLabelByOrderId =
      saleChannel === "counter"
        ? await loadCounterOrderLabelsBySaleIds(supabase, popId, [
            row as Record<string, unknown>,
          ])
        : new Map<string, string>()

    const context = await loadOperationSaleDetailContext(
      supabase,
      popId,
      row as Record<string, unknown>,
      tableLabelBySessionId,
      counterOrderLabelByOrderId,
    )

    return { success: true, context }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function getChannelOperationTicketDisplay(
  popId: string,
  input: {
    siteId: string
    tableSessionId?: string | null
    counterOrderId?: string | null
  },
): Promise<
  | {
      success: true
      ticket: ReturnType<typeof buildChannelCheckoutTicketDisplay>
    }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }

    const tableSessionId = input.tableSessionId?.trim() || null
    const counterOrderId = input.counterOrderId?.trim() || null
    if (!tableSessionId && !counterOrderId) {
      return { success: false, error: "Operación de canal inválida." }
    }

    const supabase = await createClient()
    let metadata: unknown = null

    if (tableSessionId) {
      const { data, error } = await supabase
        .from("table_sessions")
        .select("metadata")
        .eq("id", tableSessionId)
        .eq("pop_id", popId)
        .maybeSingle()
      if (error || !data) {
        return {
          success: false,
          error: error?.message || "No se encontró la sesión de mesa.",
        }
      }
      metadata = data.metadata
    } else {
      const { data, error } = await supabase
        .from("counter_orders")
        .select("metadata")
        .eq("id", counterOrderId!)
        .eq("pop_id", popId)
        .maybeSingle()
      if (error || !data) {
        return {
          success: false,
          error: error?.message || "No se encontró el pedido de mostrador.",
        }
      }
      metadata = data.metadata
    }

    const checkout = readCheckoutFromSessionMetadata(metadata)
    if (!checkout?.carrito?.length) {
      return {
        success: false,
        error: "No hay ticket guardado para esta operación.",
      }
    }

    const catalog = await getMenuCatalog(popId)
    if (!catalog.success) {
      return { success: false, error: catalog.error || "No se pudo cargar el menú." }
    }

    const ticket = buildChannelCheckoutTicketDisplay({
      checkout,
      menuArticles: catalog.articles,
      menuRecipes: catalog.recipes,
      menuPromotions: catalog.promotions,
      menuQuantityDeals: catalog.quantityDeals,
    })

    return { success: true, ticket }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
