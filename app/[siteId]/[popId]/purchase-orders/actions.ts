"use server"

import { getPurchaseCatalog } from "@/app/[siteId]/[popId]/purchases/actions"
import {
  DEFAULT_PURCHASE_ORDER_TABLE_PAGE_SIZE,
  PURCHASE_ORDER_TABLE_PAGE_SIZES,
} from "@/app/[siteId]/[popId]/purchase-orders/orderConstants"
import { POP_PERMS, permissionKeysInclude } from "@/lib/popPermissionConstants"
import { validatePopAccess } from "@/lib/popHelpers"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import { buildPurchaseOrderLineSummariesFromSnapshot } from "@/lib/purchaseOrderCheckout"
import { purchaseOrderLineSummariesItemCount } from "@/lib/purchaseOrderDocumentLines"
import { parsePurchaseCheckoutSnapshot } from "@/lib/purchaseOrderCheckoutState"
import type {
  PurchaseOrderDetail,
  PurchaseOrderMetadata,
  PurchaseOrderTableRow,
} from "@/lib/purchaseOrderTypes"
import { requireAuthenticatedUser } from "@/lib/authHelpers"
import {
  localDateExclusiveEndTimestamp,
  localDateStartTimestamp,
} from "@/lib/entryDateTimezone"
import { loadPopLedgerTimeZone } from "@/lib/popTimezoneServer"
import { createClient } from "@/utils/supabase/server"

type OrderPermissionFlags = {
  canRead: boolean
  canCreate: boolean
  canDelete: boolean
}

async function orderPermissionFlags(popId: string): Promise<OrderPermissionFlags> {
  const snap = await loadPopPermissionsSnapshot(popId)
  const keys = snap.keys
  return {
    canRead: permissionKeysInclude(
      keys,
      POP_PERMS.OPERATIONS_READ.resource,
      POP_PERMS.OPERATIONS_READ.action,
    ),
    canCreate: permissionKeysInclude(
      keys,
      POP_PERMS.OPERATIONS_CREATE.resource,
      POP_PERMS.OPERATIONS_CREATE.action,
    ),
    canDelete:
      permissionKeysInclude(keys, "operations", "delete") ||
      permissionKeysInclude(
        keys,
        POP_PERMS.OPERATIONS_CREATE.resource,
        POP_PERMS.OPERATIONS_CREATE.action,
      ),
  }
}

function parseOrderMetadata(raw: unknown): PurchaseOrderMetadata {
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

  return {
    comprobanteLabel:
      typeof row.comprobanteLabel === "string" ? row.comprobanteLabel : null,
    paymentLabel: typeof row.paymentLabel === "string" ? row.paymentLabel : null,
    discountLabel:
      typeof row.discountLabel === "string" ? row.discountLabel : null,
    lineSummaries,
  }
}

function mapOrderRow(row: Record<string, unknown>): PurchaseOrderTableRow {
  const metadata = parseOrderMetadata(row.metadata)
  const itemCount =
    metadata.lineSummaries?.reduce((sum, line) => sum + line.quantity, 0) ?? 0

  return {
    id: String(row.id),
    orderNumber: Number(row.order_number) || 0,
    supplierName: String(row.supplier_name ?? ""),
    supplierTaxId:
      typeof row.supplier_tax_id === "string" ? row.supplier_tax_id : null,
    subtotal: Number(row.subtotal) || 0,
    discountTotal: Number(row.discount_total) || 0,
    total: Number(row.total) || 0,
    status:
      row.status === "converted" || row.status === "cancelled"
        ? row.status
        : "active",
    createdAt: String(row.created_at ?? ""),
    itemCount,
  }
}

function mapOrderDetail(row: Record<string, unknown>): PurchaseOrderDetail | null {
  const checkoutSnapshot = parsePurchaseCheckoutSnapshot(row.checkout_snapshot)
  if (!checkoutSnapshot) return null
  const base = mapOrderRow(row)
  return {
    ...base,
    supplierId: typeof row.supplier_id === "string" ? row.supplier_id : null,
    checkoutSnapshot,
    metadata: parseOrderMetadata(row.metadata),
  }
}

async function nextOrderNumber(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("purchase_orders")
    .select("order_number")
    .eq("pop_id", popId)
    .order("order_number", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return (Number(data?.order_number) || 0) + 1
}

export type CreatePurchaseOrderInput = {
  checkoutSnapshot: unknown
  subtotal: number
  discountTotal: number
  total: number
  supplierId: string | null
  supplierName: string
  supplierTaxId: string | null
  metadata: PurchaseOrderMetadata
}

export async function createPurchaseOrder(
  popId: string,
  input: CreatePurchaseOrderInput,
): Promise<
  | { success: true; orderId: string; orderNumber: number }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }

    const perms = await orderPermissionFlags(popId)
    if (!perms.canCreate) {
      return { success: false, error: "Sin permiso para crear órdenes de compra." }
    }

    const checkoutSnapshot = parsePurchaseCheckoutSnapshot(input.checkoutSnapshot)
    if (!checkoutSnapshot || checkoutSnapshot.carrito.length === 0) {
      return {
        success: false,
        error: "La orden de compra debe tener al menos un ítem.",
      }
    }

    const user = await requireAuthenticatedUser()
    const supabase = await createClient()
    const orderNumber = await nextOrderNumber(supabase, popId)

    const { data, error } = await supabase
      .from("purchase_orders")
      .insert({
        pop_id: popId,
        order_number: orderNumber,
        supplier_id: input.supplierId,
        supplier_name: input.supplierName.trim(),
        supplier_tax_id: input.supplierTaxId,
        subtotal: input.subtotal,
        discount_total: input.discountTotal,
        total: input.total,
        checkout_snapshot: checkoutSnapshot,
        metadata: input.metadata,
        created_by: user.uid,
      })
      .select("id, order_number")
      .single()

    if (error || !data) {
      return {
        success: false,
        error: error?.message || "No se pudo guardar la orden de compra.",
      }
    }

    return {
      success: true,
      orderId: String(data.id),
      orderNumber: Number(data.order_number) || orderNumber,
    }
  } catch (e: unknown) {
    return {
      success: false,
      error:
        e instanceof Error ? e.message : "No se pudo guardar la orden de compra.",
    }
  }
}

export type GetPurchaseOrdersTableInput = {
  page?: number
  pageSize?: number
  q?: string
  dateFrom?: string | null
  dateTo?: string | null
}

function escapeIlikeToken(raw: string): string {
  return raw.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_")
}

function appendOrdersDateFilter<
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

export async function getPurchaseOrdersTable(
  popId: string,
  input: GetPurchaseOrdersTableInput = {},
): Promise<
  | { success: true; rows: PurchaseOrderTableRow[]; totalCount: number; page: number }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }

    const perms = await orderPermissionFlags(popId)
    if (!perms.canRead) {
      return { success: false, error: "Sin permiso para ver órdenes de compra." }
    }

    const pageSizeRaw = Number(input.pageSize)
    const pageSize = PURCHASE_ORDER_TABLE_PAGE_SIZES.includes(
      pageSizeRaw as (typeof PURCHASE_ORDER_TABLE_PAGE_SIZES)[number],
    )
      ? pageSizeRaw
      : DEFAULT_PURCHASE_ORDER_TABLE_PAGE_SIZE
    const pageRaw = Number(input.page)
    const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1
    const q = input.q?.trim() ?? ""
    const dateFrom = input.dateFrom ?? null
    const dateTo = input.dateTo ?? null

    const supabase = await createClient()
    const timeZone = await loadPopLedgerTimeZone(supabase, popId)

    let query = supabase
      .from("purchase_orders")
      .select(
        "id, order_number, supplier_name, supplier_tax_id, subtotal, discount_total, total, status, created_at, metadata",
        { count: "exact" },
      )
      .eq("pop_id", popId)
      .neq("status", "cancelled")

    query = appendOrdersDateFilter(query, dateFrom, dateTo, timeZone)

    if (q) {
      const pattern = `%${escapeIlikeToken(q)}%`
      query = query.ilike("supplier_name", pattern)
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
        mapOrderRow(row as Record<string, unknown>),
      ),
      totalCount,
      page: resolvedPage,
    }
  } catch (e: unknown) {
    return {
      success: false,
      error:
        e instanceof Error ? e.message : "No se pudieron cargar las órdenes de compra.",
    }
  }
}

export async function getPurchaseOrderDetail(
  popId: string,
  orderId: string,
): Promise<
  { success: true; order: PurchaseOrderDetail } | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }

    const perms = await orderPermissionFlags(popId)
    if (!perms.canRead) {
      return { success: false, error: "Sin permiso para ver órdenes de compra." }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("purchase_orders")
      .select("*")
      .eq("pop_id", popId)
      .eq("id", orderId)
      .maybeSingle()

    if (error) {
      return { success: false, error: error.message }
    }
    if (!data) {
      return { success: false, error: "Orden de compra no encontrada." }
    }

    const order = mapOrderDetail(data as Record<string, unknown>)
    if (!order) {
      return { success: false, error: "Orden de compra inválida." }
    }

    const catalog = await getPurchaseCatalog(popId)
    if (catalog.success) {
      const rebuiltSummaries = buildPurchaseOrderLineSummariesFromSnapshot(
        order.checkoutSnapshot,
        catalog.articles,
      )
      if (rebuiltSummaries.length > 0) {
        order.metadata = {
          ...order.metadata,
          lineSummaries: rebuiltSummaries,
        }
        order.itemCount = purchaseOrderLineSummariesItemCount(rebuiltSummaries)
      }
    }

    return { success: true, order }
  } catch (e: unknown) {
    return {
      success: false,
      error:
        e instanceof Error ? e.message : "No se pudo cargar la orden de compra.",
    }
  }
}

export async function deletePurchaseOrder(
  popId: string,
  orderId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }

    const perms = await orderPermissionFlags(popId)
    if (!perms.canDelete) {
      return { success: false, error: "Sin permiso para eliminar órdenes de compra." }
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from("purchase_orders")
      .delete()
      .eq("pop_id", popId)
      .eq("id", orderId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (e: unknown) {
    return {
      success: false,
      error:
        e instanceof Error ? e.message : "No se pudo eliminar la orden de compra.",
    }
  }
}
