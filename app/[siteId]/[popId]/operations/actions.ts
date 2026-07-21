"use server"

import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { getPopById, getPopSiteId, validatePopAccess } from "@/lib/popHelpers"
import { popMenuHref, siteIdFromPopRow } from "@/lib/popRoutes"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import {
  DEFAULT_SALE_SITE_ID,
  findSaleInvoiceTypeByArcaCbteTipo,
} from "@/lib/saleInvoiceTypes"
import { saleComprobanteAccruesOutputVat } from "@/lib/saleComprobantePicker"
import { resolveOperationPaymentMethodLabel } from "@/lib/operationPaymentLabels"
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

export type OperationSaleRow = {
  id: string
  soldAt: string
  status: string
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

export type OperationsListView = "sales" | "tables" | "counter" | "purchases" | "expenses"

export type GetOperationsListInput = {
  view: OperationsListView
  dateFrom: string | null
  dateTo: string | null
  search: string
  page: number
  pageSize: number
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
        sale_payments (
          amount,
          sort_order,
          payment_method_id
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
        total,
        tax_total,
        discount_total,
        currency,
        line_items,
        metadata,
        created_at,
        received_at,
        suppliers ( name ),
        purchase_payments (
          amount,
          paid_at,
          payment_method_id
        )
      `

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

function parseTableLabelFromSaleRow(
  row: Record<string, unknown>,
  tableLabelBySaleId: Map<string, string>,
): string | null {
  const saleId = String(row.id ?? "")
  if (!saleId) return null
  return tableLabelBySaleId.get(saleId) ?? null
}

async function loadTableLabelsBySessionIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  sessionIds: string[],
): Promise<Map<string, string>> {
  const labelsBySessionId = new Map<string, string>()
  if (sessionIds.length === 0) return labelsBySessionId

  const { data } = await supabase
    .from("table_sessions")
    .select("id, dining_tables ( label )")
    .eq("pop_id", popId)
    .in("id", sessionIds)

  for (const row of data || []) {
    const sessionId = String(row.id)
    const table = relOne(
      row.dining_tables as
        | { label?: string }
        | Array<{ label?: string }>
        | null,
    )
    const label = table?.label?.trim()
    if (label) labelsBySessionId.set(sessionId, label)
  }

  return labelsBySessionId
}

async function loadTableLabelsBySaleIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  saleIds: string[],
): Promise<Map<string, string>> {
  const labelsBySaleId = new Map<string, string>()
  if (saleIds.length === 0) return labelsBySaleId

  const { data: saleLinks } = await supabase
    .from("sales")
    .select("id, table_session_id")
    .eq("pop_id", popId)
    .in("id", saleIds)

  const sessionIds = (saleLinks || [])
    .map((row) =>
      row.table_session_id != null ? String(row.table_session_id) : "",
    )
    .filter(Boolean)
  const labelsBySessionId = await loadTableLabelsBySessionIds(
    supabase,
    popId,
    sessionIds,
  )

  for (const row of saleLinks || []) {
    const saleId = String(row.id)
    const sessionId =
      row.table_session_id != null ? String(row.table_session_id) : ""
    const label = sessionId ? labelsBySessionId.get(sessionId) : undefined
    if (label) labelsBySaleId.set(saleId, label)
  }

  return labelsBySaleId
}

function mapSaleRows(
  saleRows: Array<Record<string, unknown>>,
  methodNameById: Map<string, string>,
  arcaBySaleId: Map<string, OperationSaleArcaInvoice>,
  fiscalSiteId: string,
  tableLabelBySaleId: Map<string, string> = new Map(),
): OperationSaleRow[] {
  return saleRows.map((row) => {
    const saleId = String(row.id)
    const paymentsRaw = row.sale_payments as
      | Array<{
          amount?: unknown
          sort_order?: unknown
          payment_method_id?: unknown
        }>
      | null
    const payments: OperationSalePayment[] = []
    const payList = Array.isArray(paymentsRaw) ? [...paymentsRaw] : []
    payList.sort(
      (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0),
    )
    for (const p of payList) {
      const mid =
        p.payment_method_id != null ? String(p.payment_method_id) : ""
      payments.push({
        amount: parseMoney(p.amount),
        methodName: methodNameById.get(mid) || "—",
      })
    }

    const saleMeta = parseSaleMetadata(row.metadata, fiscalSiteId)
    const rowTotal = parseMoney(row.total)
    const accruesOutputVat = saleMeta.accruesOutputVat

    return {
      id: saleId,
      soldAt: String(row.sold_at ?? ""),
      status: String(row.status ?? ""),
      total: rowTotal,
      subtotal: accruesOutputVat ? parseMoney(row.subtotal) : rowTotal,
      taxTotal: accruesOutputVat ? parseMoney(row.tax_total) : 0,
      discountTotal: parseMoney(row.discount_total),
      discountInfo: parseSaleDiscountInfo(row.metadata),
      snapshotInfo: parseSaleSnapshotInfo(row.metadata),
      clientId: row.client_id != null ? String(row.client_id) : null,
      customerName:
        row.customer_name != null ? String(row.customer_name) : null,
      customerTaxId:
        row.customer_tax_id != null ? String(row.customer_tax_id) : null,
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
      tableLabel: parseTableLabelFromSaleRow(row, tableLabelBySaleId),
    }
  })
}

function mapPurchaseRows(
  purchaseRows: Array<Record<string, unknown>>,
  methodNameById: Map<string, string>,
): OperationPurchaseRow[] {
  return purchaseRows.map((row) => {
    const sup = row.suppliers as { name?: string } | null
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
          payment_method_id?: unknown
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
      const mid =
        p.payment_method_id != null ? String(p.payment_method_id) : ""
      payments.push({
        amount: amt,
        methodName: methodNameById.get(mid) || "—",
        paidAt: String(p.paid_at ?? "").slice(0, 10),
      })
    }

    return {
      id: String(row.id),
      operationDate,
      operationAt,
      status: String(row.status ?? ""),
      purchaseKind: String(row.purchase_kind ?? "merchandise"),
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
    }
  })
}

async function mapExpenseLedgerRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  aeList: Array<Record<string, unknown>>,
): Promise<OperationExpenseLedgerRow[]> {
  const payIds = aeList
    .map((r) => (r.source_id != null ? String(r.source_id) : ""))
    .filter((id) => id.length > 0)

  type PaymentJoin = {
    id: string
    amount: unknown
    paid_at: unknown
    expense_id: unknown
    payment_methods: { name?: string } | null
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
          payment_methods ( name ),
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
      const method = relOne(
        row.payment_methods as
          | { name?: string }
          | Array<{ name?: string }>
          | null
          | undefined,
      )
      paymentById.set(String(row.id), {
        id: String(row.id),
        amount: row.amount,
        paid_at: row.paid_at,
        expense_id: row.expense_id,
        payment_methods: method,
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
    const methodName = payment?.payment_methods?.name?.trim() || ""
    const paymentMethodLabel = isVoid
      ? "—"
      : methodName || "—"

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

    const { data: pmRows } = await supabase
      .from("payment_methods")
      .select("id, name")
      .eq("pop_id", popId)
    const methodNameById = new Map<string, string>()
    for (const p of pmRows || []) {
      methodNameById.set(String(p.id), String(p.name ?? ""))
    }

    const { dateFrom, dateTo, search, view } = input
    const searchTerm = search.trim()
    const uuidSearch =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        searchTerm,
      )

    if (view === "sales" || view === "tables" || view === "counter") {
      let countQuery = supabase
        .from("sales")
        .select("id", { count: "exact", head: true })
        .eq("pop_id", popId)
      if (view === "tables") {
        countQuery = countQuery.eq("sale_channel", "table")
      } else if (view === "counter") {
        countQuery = countQuery.eq("sale_channel", "counter")
      } else {
        countQuery = countQuery
          .neq("sale_channel", "table")
          .neq("sale_channel", "counter")
      }
      countQuery = appendSalesDateFilter(
        countQuery,
        dateFrom,
        dateTo,
        ledgerTimeZone,
      )
      if (uuidSearch) {
        countQuery = countQuery.eq("id", searchTerm)
      } else {
        const orClause = buildSalesSearchOrClause(search)
        if (orClause) countQuery = countQuery.or(orClause)
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

      const totalCount = countRaw ?? 0
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
      const safePage = Math.min(Math.max(1, reqPage), totalPages)
      const from = (safePage - 1) * pageSize
      const to = from + pageSize - 1

      let dataQuery = supabase
        .from("sales")
        .select(SALE_LIST_SELECT)
        .eq("pop_id", popId)
      if (view === "tables") {
        dataQuery = dataQuery.eq("sale_channel", "table")
      } else if (view === "counter") {
        dataQuery = dataQuery.eq("sale_channel", "counter")
      } else {
        dataQuery = dataQuery
          .neq("sale_channel", "table")
          .neq("sale_channel", "counter")
      }
      dataQuery = appendSalesDateFilter(
        dataQuery,
        dateFrom,
        dateTo,
        ledgerTimeZone,
      )
      if (uuidSearch) {
        dataQuery = dataQuery.eq("id", searchTerm)
      } else {
        const orClause = buildSalesSearchOrClause(search)
        if (orClause) dataQuery = dataQuery.or(orClause)
      }
      dataQuery = dataQuery.order("sold_at", { ascending: false }).range(from, to)

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
      const tableLabelBySaleId =
        view === "tables"
          ? await loadTableLabelsBySaleIds(supabase, popId, saleIds)
          : new Map<string, string>()
      const sales = mapSaleRows(
        (saleRows || []) as Array<Record<string, unknown>>,
        methodNameById,
        arcaBySaleId,
        fiscalSiteId,
        tableLabelBySaleId,
      )

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
      let countQuery = supabase
        .from("purchases")
        .select("id", { count: "exact", head: true })
        .eq("pop_id", popId)
        .neq("status", "draft")
      countQuery = appendPurchasesDateFilter(
        countQuery,
        dateFrom,
        dateTo,
        ledgerTimeZone,
      )
      const orClause = buildPurchasesSearchOrClause(search)
      if (orClause) countQuery = countQuery.or(orClause)

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
      dataQuery = appendPurchasesDateFilter(
        dataQuery,
        dateFrom,
        dateTo,
        ledgerTimeZone,
      )
      if (orClause) dataQuery = dataQuery.or(orClause)
      dataQuery = dataQuery
        .order("created_at", { ascending: false })
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

      const purchases = mapPurchaseRows(
        (purchaseRows || []) as Array<Record<string, unknown>>,
        methodNameById,
      )

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

    let countQuery = supabase
      .from("accounting_entries")
      .select("id", { count: "exact", head: true })
      .eq("pop_id", popId)
      .in("source_type", ["expense_payment", "expense_void"])
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
        "id, entry_date, description, source_type, source_id, status, created_at, posted_at",
      )
      .eq("pop_id", popId)
      .in("source_type", ["expense_payment", "expense_void"])
      .eq("status", "posted")
    dataQuery = appendExpensesDateFilter(dataQuery, dateFrom, dateTo)
    if (expenseOrClause) dataQuery = dataQuery.or(expenseOrClause)
    dataQuery = dataQuery
      .order("entry_date", { ascending: false })
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

    const expenseLedger = await mapExpenseLedgerRows(
      supabase,
      popId,
      (aeRows || []) as Array<Record<string, unknown>>,
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
  input: { view: OperationsListView; operationId: string },
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
      const { data, error } = await supabase
        .from("accounting_entries")
        .select(
          "id, entry_number, entry_date, description, source_type, status",
        )
        .eq("pop_id", popId)
        .eq("source_type", "sale")
        .eq("source_id", operationId)
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
