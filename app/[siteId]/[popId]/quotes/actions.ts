"use server"

import { parseTableSessionCheckout } from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"
import { getMenuCatalog } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import { POP_PERMS, permissionKeysInclude } from "@/lib/popPermissionConstants"
import { validatePopAccess } from "@/lib/popHelpers"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import type {
  SaleQuoteDetail,
  SaleQuoteMetadata,
  SaleQuoteTableRow,
} from "@/lib/saleQuoteTypes"
import { requireAuthenticatedUser } from "@/lib/authHelpers"
import {
  localDateExclusiveEndTimestamp,
  localDateStartTimestamp,
} from "@/lib/entryDateTimezone"
import { loadPopLedgerTimeZone } from "@/lib/popTimezoneServer"
import { createClient } from "@/utils/supabase/server"
import {
  DEFAULT_QUOTE_TABLE_PAGE_SIZE,
  QUOTE_TABLE_PAGE_SIZES,
} from "@/app/[siteId]/[popId]/quotes/quoteConstants"
import {
  buildQuoteLineGroupsFromCheckoutSnapshot,
  buildQuoteLineSummariesFromCheckoutSnapshot,
} from "@/lib/saleQuoteCheckout"
import { quoteLineGroupsItemCount } from "@/lib/saleQuoteDocumentLines"
import type {
  SaleQuoteLineDiscount,
  SaleQuoteLineGroup,
  SaleQuoteLineGroupLine,
} from "@/lib/saleQuoteTypes"

type QuotePermissionFlags = {
  canRead: boolean
  canCreate: boolean
  canDelete: boolean
}

async function quotePermissionFlags(popId: string): Promise<QuotePermissionFlags> {
  const snap = await loadPopPermissionsSnapshot(popId)
  const keys = snap.keys
  return {
    canRead: permissionKeysInclude(
      keys,
      POP_PERMS.SALE_READ.resource,
      POP_PERMS.SALE_READ.action,
    ),
    canCreate: permissionKeysInclude(
      keys,
      POP_PERMS.SALE_CREATE.resource,
      POP_PERMS.SALE_CREATE.action,
    ),
    canDelete:
      permissionKeysInclude(keys, "sale", "delete") ||
      permissionKeysInclude(
        keys,
        POP_PERMS.SALE_CREATE.resource,
        POP_PERMS.SALE_CREATE.action,
      ),
  }
}

function parseQuoteLineDiscount(raw: unknown): SaleQuoteLineDiscount | null {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return null
  const item = raw as Record<string, unknown>
  const label = typeof item.label === "string" ? item.label : ""
  const amount = Number(item.amount)
  if (!label.trim() || !Number.isFinite(amount) || amount <= 0) return null
  return { label, amount }
}

function parseQuoteLineGroupLine(raw: unknown): SaleQuoteLineGroupLine | null {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return null
  const item = raw as Record<string, unknown>
  const name = typeof item.name === "string" ? item.name : ""
  const quantity = Number(item.quantity)
  const unitListPrice = Number(item.unitListPrice ?? item.unitPrice)
  const listLineTotal = Number(item.listLineTotal ?? item.lineTotal)
  const lineTotal = Number(item.lineTotal)
  if (!name.trim()) return null
  const discounts = Array.isArray(item.discounts)
    ? item.discounts
        .map(parseQuoteLineDiscount)
        .filter((discount): discount is SaleQuoteLineDiscount => discount != null)
    : []

  return {
    name,
    quantity: Number.isFinite(quantity) ? quantity : 0,
    unitListPrice: Number.isFinite(unitListPrice) ? unitListPrice : 0,
    listLineTotal: Number.isFinite(listLineTotal) ? listLineTotal : 0,
    lineTotal: Number.isFinite(lineTotal) ? lineTotal : 0,
    discounts,
  }
}

function parseQuoteLineGroups(raw: unknown): SaleQuoteLineGroup[] | undefined {
  if (!Array.isArray(raw)) return undefined
  const groups = raw
    .map((group) => {
      if (group == null || typeof group !== "object" || Array.isArray(group)) {
        return null
      }
      const row = group as Record<string, unknown>
      const id = typeof row.id === "string" ? row.id : ""
      const category = typeof row.category === "string" ? row.category : "General"
      const lines = Array.isArray(row.lines)
        ? row.lines
            .map(parseQuoteLineGroupLine)
            .filter((line): line is SaleQuoteLineGroupLine => line != null)
        : []
      if (lines.length === 0) return null
      return {
        id: id || `group:${category}`,
        category,
        lines,
        promotionDiscount: parseQuoteLineDiscount(row.promotionDiscount) ?? null,
      } satisfies SaleQuoteLineGroup
    })
    .filter((group): group is SaleQuoteLineGroup => group != null)

  return groups.length > 0 ? groups : undefined
}

function parseQuoteMetadata(raw: unknown): SaleQuoteMetadata {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return {}
  }
  const row = raw as Record<string, unknown>
  const lineSummaries = Array.isArray(row.lineSummaries)
    ? row.lineSummaries
        .map((line) => {
          if (line == null || typeof line !== "object" || Array.isArray(line)) {
            return null
          }
          const item = line as Record<string, unknown>
          const name = typeof item.name === "string" ? item.name : ""
          const quantity = Number(item.quantity)
          const unitPrice = Number(item.unitPrice)
          const lineTotal = Number(item.lineTotal)
          if (!name.trim()) return null
          return {
            name,
            quantity: Number.isFinite(quantity) ? quantity : 0,
            unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
            lineTotal: Number.isFinite(lineTotal) ? lineTotal : 0,
          }
        })
        .filter((line): line is NonNullable<typeof line> => line != null)
    : undefined
  const lineGroups = parseQuoteLineGroups(row.lineGroups)

  return {
    comprobanteLabel:
      typeof row.comprobanteLabel === "string" ? row.comprobanteLabel : null,
    paymentLabel: typeof row.paymentLabel === "string" ? row.paymentLabel : null,
    discountLabel:
      typeof row.discountLabel === "string" ? row.discountLabel : null,
    lineSummaries,
    lineGroups,
  }
}

function mapQuoteRow(row: Record<string, unknown>): SaleQuoteTableRow {
  const metadata = parseQuoteMetadata(row.metadata)
  const itemCount =
    metadata.lineGroups != null
      ? quoteLineGroupsItemCount(metadata.lineGroups)
      : metadata.lineSummaries?.reduce(
          (sum, line) => sum + line.quantity,
          0,
        )

  return {
    id: String(row.id),
    quoteNumber: Number(row.quote_number) || 0,
    customerName: String(row.customer_name ?? ""),
    customerTaxId:
      typeof row.customer_tax_id === "string" ? row.customer_tax_id : null,
    subtotal: Number(row.subtotal) || 0,
    discountTotal: Number(row.discount_total) || 0,
    total: Number(row.total) || 0,
    status:
      row.status === "converted" || row.status === "cancelled"
        ? row.status
        : "active",
    createdAt: String(row.created_at ?? ""),
    itemCount: itemCount ?? 0,
  }
}

function mapQuoteDetail(row: Record<string, unknown>): SaleQuoteDetail | null {
  const checkoutSnapshot = parseTableSessionCheckout(row.checkout_snapshot)
  if (!checkoutSnapshot) return null
  const base = mapQuoteRow(row)
  return {
    ...base,
    clientId: typeof row.client_id === "string" ? row.client_id : null,
    checkoutSnapshot,
    metadata: parseQuoteMetadata(row.metadata),
  }
}

async function nextQuoteNumber(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("sale_quotes")
    .select("quote_number")
    .eq("pop_id", popId)
    .order("quote_number", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return (Number(data?.quote_number) || 0) + 1
}

export type CreateSaleQuoteInput = {
  checkoutSnapshot: unknown
  subtotal: number
  discountTotal: number
  total: number
  clientId: string | null
  customerName: string
  customerTaxId: string | null
  metadata: SaleQuoteMetadata
}

export async function createSaleQuote(
  popId: string,
  input: CreateSaleQuoteInput,
): Promise<
  { success: true; quoteId: string; quoteNumber: number } | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }

    const perms = await quotePermissionFlags(popId)
    if (!perms.canCreate) {
      return { success: false, error: "Sin permiso para crear presupuestos." }
    }

    const checkoutSnapshot = parseTableSessionCheckout(input.checkoutSnapshot)
    if (!checkoutSnapshot || checkoutSnapshot.carrito.length === 0) {
      return { success: false, error: "El presupuesto debe tener al menos un ítem." }
    }

    const user = await requireAuthenticatedUser()
    const supabase = await createClient()
    const quoteNumber = await nextQuoteNumber(supabase, popId)

    const { data, error } = await supabase
      .from("sale_quotes")
      .insert({
        pop_id: popId,
        quote_number: quoteNumber,
        client_id: input.clientId,
        customer_name: input.customerName.trim(),
        customer_tax_id: input.customerTaxId,
        subtotal: input.subtotal,
        discount_total: input.discountTotal,
        total: input.total,
        checkout_snapshot: checkoutSnapshot,
        metadata: input.metadata,
        created_by: user.uid,
      })
      .select("id, quote_number")
      .single()

    if (error || !data) {
      return {
        success: false,
        error: error?.message || "No se pudo guardar el presupuesto.",
      }
    }

    return {
      success: true,
      quoteId: String(data.id),
      quoteNumber: Number(data.quote_number) || quoteNumber,
    }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "No se pudo guardar el presupuesto.",
    }
  }
}

export type GetSaleQuotesTableInput = {
  page?: number
  pageSize?: number
  q?: string
  dateFrom?: string | null
  dateTo?: string | null
}

function escapeIlikeToken(raw: string): string {
  return raw.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_")
}

function appendQuotesDateFilter<
  Q extends { gte: (col: string, val: string) => Q; lt: (col: string, val: string) => Q },
>(q: Q, dateFrom: string | null, dateTo: string | null, timeZone: string): Q {
  let x = q
  if (dateFrom) {
    x = x.gte("created_at", localDateStartTimestamp(timeZone, dateFrom))
  }
  if (dateTo) {
    x = x.lt("created_at", localDateExclusiveEndTimestamp(timeZone, dateTo))
  }
  return x
}

export async function getSaleQuotesTable(
  popId: string,
  input: GetSaleQuotesTableInput = {},
): Promise<
  | { success: true; rows: SaleQuoteTableRow[]; totalCount: number; page: number }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }

    const perms = await quotePermissionFlags(popId)
    if (!perms.canRead) {
      return { success: false, error: "Sin permiso para ver presupuestos." }
    }

    const pageSizeRaw = Number(input.pageSize)
    const pageSize = QUOTE_TABLE_PAGE_SIZES.includes(
      pageSizeRaw as (typeof QUOTE_TABLE_PAGE_SIZES)[number],
    )
      ? pageSizeRaw
      : DEFAULT_QUOTE_TABLE_PAGE_SIZE
    const pageRaw = Number(input.page)
    const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1
    const q = input.q?.trim() ?? ""
    const dateFrom = input.dateFrom ?? null
    const dateTo = input.dateTo ?? null

    const supabase = await createClient()
    const timeZone = await loadPopLedgerTimeZone(supabase, popId)

    let query = supabase
      .from("sale_quotes")
      .select(
        "id, quote_number, customer_name, customer_tax_id, subtotal, discount_total, total, status, created_at, metadata",
        { count: "exact" },
      )
      .eq("pop_id", popId)
      .neq("status", "cancelled")

    query = appendQuotesDateFilter(query, dateFrom, dateTo, timeZone)

    if (q) {
      const pattern = `%${escapeIlikeToken(q)}%`
      query = query.ilike("customer_name", pattern)
    }

    const from = (page - 1) * pageSize
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1)

    if (error) {
      return { success: false, error: error.message }
    }

    const totalCount = count ?? 0
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
    const resolvedPage = Math.min(page, totalPages)

    return {
      success: true,
      rows: (data ?? []).map((row) =>
        mapQuoteRow(row as Record<string, unknown>),
      ),
      totalCount,
      page: resolvedPage,
    }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "No se pudieron cargar los presupuestos.",
    }
  }
}

export async function getSaleQuoteDetail(
  popId: string,
  quoteId: string,
): Promise<
  { success: true; quote: SaleQuoteDetail } | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }

    const perms = await quotePermissionFlags(popId)
    if (!perms.canRead) {
      return { success: false, error: "Sin permiso para ver presupuestos." }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("sale_quotes")
      .select("*")
      .eq("pop_id", popId)
      .eq("id", quoteId)
      .maybeSingle()

    if (error) {
      return { success: false, error: error.message }
    }
    if (!data) {
      return { success: false, error: "Presupuesto no encontrado." }
    }

    const quote = mapQuoteDetail(data as Record<string, unknown>)
    if (!quote) {
      return { success: false, error: "Presupuesto inválido." }
    }

    const catalog = await getMenuCatalog(popId)
    if (catalog.success) {
      const catalogInput = {
        articles: catalog.articles,
        promotions: catalog.promotions,
        quantityDeals: catalog.quantityDeals,
      }
      const rebuiltGroups = buildQuoteLineGroupsFromCheckoutSnapshot(
        quote.checkoutSnapshot,
        catalogInput,
      )
      if (rebuiltGroups.length > 0) {
        quote.metadata = {
          ...quote.metadata,
          lineGroups: rebuiltGroups,
          lineSummaries: buildQuoteLineSummariesFromCheckoutSnapshot(
            quote.checkoutSnapshot,
            catalogInput,
          ),
        }
      }
    }

    return { success: true, quote }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "No se pudo cargar el presupuesto.",
    }
  }
}

export async function deleteSaleQuote(
  popId: string,
  quoteId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }

    const perms = await quotePermissionFlags(popId)
    if (!perms.canDelete) {
      return { success: false, error: "Sin permiso para eliminar presupuestos." }
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from("sale_quotes")
      .delete()
      .eq("pop_id", popId)
      .eq("id", quoteId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "No se pudo eliminar el presupuesto.",
    }
  }
}
