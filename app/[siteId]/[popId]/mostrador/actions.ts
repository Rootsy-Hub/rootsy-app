"use server"

import type {
  CounterFulfillmentType,
  CounterOrderStatus,
  CreateCounterOrderInput,
  UpdateCounterOrderInput,
} from "@/app/[siteId]/[popId]/mostrador/mostradorTypes"
import type { TableSessionCheckoutSnapshot } from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"
import { readCheckoutFromSessionMetadata } from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"
import { requireAuthenticatedUser } from "@/lib/authHelpers"
import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { getPopSiteId, validatePopAccess } from "@/lib/popHelpers"
import { popMenuHref } from "@/lib/popRoutes"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import { createClient } from "@/utils/supabase/server"

export type CounterOrderRow = {
  id: string
  orderDay: string
  orderNumber: number
  status: CounterOrderStatus
  fulfillmentType: CounterFulfillmentType
  deliveryAddress: string
  phone: string
  driverName: string
  estimatedMinutes: number
  notes: string
  immediateFulfillment: boolean
  saleId: string | null
  openedAt: string
  updatedAt: string
  deliveredAt: string | null
  checkout: TableSessionCheckoutSnapshot | null
}

export type MostradorAccessSnapshot = {
  canRead: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const COUNTER_ORDER_SELECT = `
  id,
  order_day,
  order_number,
  status,
  fulfillment_type,
  delivery_address,
  phone,
  driver_name,
  estimated_minutes,
  notes,
  immediate_fulfillment,
  sale_id,
  opened_at,
  updated_at,
  delivered_at,
  metadata
`

function isUuid(value: string): boolean {
  return UUID_RE.test(value.trim())
}

function mapCounterOrderRow(row: {
  id: string
  order_day: string
  order_number: number
  status: string
  fulfillment_type: string
  delivery_address: string | null
  phone: string | null
  driver_name: string | null
  estimated_minutes: number
  notes: string | null
  immediate_fulfillment: boolean | null
  sale_id: string | null
  opened_at: string
  updated_at: string
  delivered_at: string | null
  metadata: unknown
}): CounterOrderRow {
  return {
    id: row.id,
    orderDay: row.order_day,
    orderNumber: row.order_number,
    status: row.status as CounterOrderStatus,
    fulfillmentType: row.fulfillment_type as CounterFulfillmentType,
    deliveryAddress: row.delivery_address?.trim() ?? "",
    phone: row.phone?.trim() ?? "",
    driverName: row.driver_name?.trim() ?? "",
    estimatedMinutes: row.estimated_minutes,
    notes: row.notes?.trim() ?? "",
    immediateFulfillment: Boolean(row.immediate_fulfillment),
    saleId: row.sale_id,
    openedAt: row.opened_at,
    updatedAt: row.updated_at,
    deliveredAt: row.delivered_at,
    checkout: readCheckoutFromSessionMetadata(row.metadata),
  }
}

function siteIdsMatchClientRoute(
  routeSiteId: string,
  popSiteId: string,
): boolean {
  return routeSiteId.trim().toLowerCase() === popSiteId.trim().toLowerCase()
}

async function requireMostradorAccess(
  popId: string,
  routeSiteId: string,
  mode: "read" | "create" | "update" | "delete",
): Promise<
  | {
      ok: true
      supabase: Awaited<ReturnType<typeof createClient>>
      userId: string
    }
  | { ok: false; error: string; redirect?: string }
> {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return {
      ok: false,
      error: access.error || "Sin acceso al punto de venta",
      redirect: "/home",
    }
  }

  const popSiteId = await getPopSiteId(popId)
  if (!popSiteId) {
    return { ok: false, error: "POP no encontrado" }
  }
  if (!siteIdsMatchClientRoute(routeSiteId, popSiteId)) {
    return {
      ok: false,
      error: "Ruta inválida para este punto de venta",
      redirect: popMenuHref(popSiteId, popId),
    }
  }

  const user = await requireAuthenticatedUser()
  const perms = await loadPopPermissionsSnapshot(popId)
  const perm =
    mode === "read"
      ? POP_PERMS.MOSTRADOR_READ
      : mode === "create"
        ? POP_PERMS.MOSTRADOR_CREATE
        : mode === "update"
          ? POP_PERMS.MOSTRADOR_UPDATE
          : POP_PERMS.MOSTRADOR_DELETE

  if (!permissionKeysInclude(perms.keys, perm.resource, perm.action)) {
    return {
      ok: false,
      error: "No tenés permiso para mostrador en este punto.",
      redirect: popMenuHref(popSiteId, popId),
    }
  }

  const supabase = await createClient()
  return { ok: true, supabase, userId: user.uid }
}

export async function getMostradorAccessSnapshot(
  popId: string,
): Promise<MostradorAccessSnapshot> {
  const perms = await loadPopPermissionsSnapshot(popId)
  return {
    canRead: permissionKeysInclude(
      perms.keys,
      POP_PERMS.MOSTRADOR_READ.resource,
      POP_PERMS.MOSTRADOR_READ.action,
    ),
    canCreate: permissionKeysInclude(
      perms.keys,
      POP_PERMS.MOSTRADOR_CREATE.resource,
      POP_PERMS.MOSTRADOR_CREATE.action,
    ),
    canUpdate: permissionKeysInclude(
      perms.keys,
      POP_PERMS.MOSTRADOR_UPDATE.resource,
      POP_PERMS.MOSTRADOR_UPDATE.action,
    ),
    canDelete: permissionKeysInclude(
      perms.keys,
      POP_PERMS.MOSTRADOR_DELETE.resource,
      POP_PERMS.MOSTRADOR_DELETE.action,
    ),
  }
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function validateCreateInput(input: CreateCounterOrderInput): string | null {
  const fulfillmentType = input.fulfillmentType
  if (fulfillmentType !== "pickup" && fulfillmentType !== "delivery") {
    return "Elegí mostrador o delivery."
  }
  const estimated = input.estimatedMinutes
  if (!Number.isFinite(estimated) || estimated < 15 || estimated > 60) {
    return "Tiempo estimado inválido."
  }
  if (fulfillmentType === "delivery") {
    if (!input.deliveryAddress?.trim()) {
      return "La dirección es obligatoria para delivery."
    }
    if (!input.phone?.trim()) {
      return "El celular es obligatorio para delivery."
    }
  }
  return null
}

async function nextOrderNumber(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  orderDay: string,
): Promise<number> {
  const { data } = await supabase
    .from("counter_orders")
    .select("order_number")
    .eq("pop_id", popId)
    .eq("order_day", orderDay)
    .order("order_number", { ascending: false })
    .limit(1)
    .maybeSingle()

  return (data?.order_number ?? 0) + 1
}

export async function getCounterOrders(
  popId: string,
  routeSiteId: string,
): Promise<
  | { success: true; orders: CounterOrderRow[] }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireMostradorAccess(popId, routeSiteId, "read")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }

  const { supabase } = gate
  const today = todayIsoDate()

  const { data, error } = await supabase
    .from("counter_orders")
    .select(COUNTER_ORDER_SELECT)
    .eq("pop_id", popId)
    .neq("status", "cancelled")
    .in("status", ["preparing", "dispatched", "delivered"])
    .order("opened_at", { ascending: false })

  if (error) {
    return { success: false, error: error.message }
  }

  const rows = (data ?? [])
    .map((row) =>
      mapCounterOrderRow(row as Parameters<typeof mapCounterOrderRow>[0]),
    )
    .filter((o) => {
      if (o.status !== "delivered") return true
      if (!o.saleId) return true
      const deliveredDay = o.deliveredAt?.slice(0, 10)
      return deliveredDay === today
    })

  return { success: true, orders: rows }
}

export async function createCounterOrder(
  popId: string,
  routeSiteId: string,
  input: CreateCounterOrderInput,
): Promise<
  | { success: true; order: CounterOrderRow }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireMostradorAccess(popId, routeSiteId, "create")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }

  const validationError = validateCreateInput(input)
  if (validationError) {
    return { success: false, error: validationError }
  }

  const { supabase, userId } = gate
  const orderDay = todayIsoDate()
  const orderNumber = await nextOrderNumber(supabase, popId, orderDay)
  const immediate = Boolean(input.immediateFulfillment)
  const status: CounterOrderStatus = immediate ? "delivered" : "preparing"
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("counter_orders")
    .insert({
      pop_id: popId,
      order_day: orderDay,
      order_number: orderNumber,
      status,
      fulfillment_type: input.fulfillmentType,
      delivery_address:
        input.fulfillmentType === "delivery"
          ? input.deliveryAddress?.trim() ?? ""
          : null,
      phone:
        input.fulfillmentType === "delivery"
          ? input.phone?.trim() ?? ""
          : null,
      driver_name: input.driverName?.trim() || null,
      estimated_minutes: input.estimatedMinutes,
      notes: input.notes?.trim() ?? "",
      immediate_fulfillment: immediate,
      delivered_at: immediate ? now : null,
      opened_by: userId,
    })
    .select(COUNTER_ORDER_SELECT)
    .single()

  if (error || !data) {
    return {
      success: false,
      error: error?.message || "No se pudo crear el pedido.",
    }
  }

  return {
    success: true,
    order: mapCounterOrderRow(
      data as Parameters<typeof mapCounterOrderRow>[0],
    ),
  }
}

export async function updateCounterOrder(
  popId: string,
  routeSiteId: string,
  orderId: string,
  input: UpdateCounterOrderInput,
): Promise<
  | { success: true; order: CounterOrderRow }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireMostradorAccess(popId, routeSiteId, "update")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }
  if (!isUuid(orderId)) {
    return { success: false, error: "Pedido inválido." }
  }

  const { supabase } = gate
  const { data: existing, error: existingErr } = await supabase
    .from("counter_orders")
    .select(COUNTER_ORDER_SELECT)
    .eq("id", orderId)
    .eq("pop_id", popId)
    .neq("status", "cancelled")
    .maybeSingle()

  if (existingErr) {
    return { success: false, error: existingErr.message }
  }
  if (!existing) {
    return { success: false, error: "El pedido no existe o fue cancelado." }
  }

  const current = mapCounterOrderRow(
    existing as Parameters<typeof mapCounterOrderRow>[0],
  )
  if (current.saleId) {
    return {
      success: false,
      error: "No se puede editar un pedido ya cobrado.",
    }
  }

  const fulfillmentType = input.fulfillmentType ?? current.fulfillmentType
  const merged: CreateCounterOrderInput = {
    fulfillmentType,
    deliveryAddress: input.deliveryAddress ?? current.deliveryAddress,
    phone: input.phone ?? current.phone,
    driverName: input.driverName ?? current.driverName,
    estimatedMinutes: input.estimatedMinutes ?? current.estimatedMinutes,
    notes: input.notes ?? current.notes,
    immediateFulfillment: input.immediateFulfillment,
  }

  const validationError = validateCreateInput(merged)
  if (validationError) {
    return { success: false, error: validationError }
  }

  const patch: Record<string, unknown> = {
    fulfillment_type: fulfillmentType,
    delivery_address:
      fulfillmentType === "delivery" ? merged.deliveryAddress?.trim() ?? "" : null,
    phone: fulfillmentType === "delivery" ? merged.phone?.trim() ?? "" : null,
    driver_name: merged.driverName?.trim() || null,
    estimated_minutes: merged.estimatedMinutes,
    notes: merged.notes?.trim() ?? "",
  }

  const { data, error } = await supabase
    .from("counter_orders")
    .update(patch)
    .eq("id", orderId)
    .eq("pop_id", popId)
    .select(COUNTER_ORDER_SELECT)
    .single()

  if (error || !data) {
    return {
      success: false,
      error: error?.message || "No se pudo actualizar el pedido.",
    }
  }

  return {
    success: true,
    order: mapCounterOrderRow(data as Parameters<typeof mapCounterOrderRow>[0]),
  }
}

export async function updateCounterOrderStatus(
  popId: string,
  routeSiteId: string,
  orderId: string,
  status: CounterOrderStatus,
): Promise<
  | { success: true; order: CounterOrderRow }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireMostradorAccess(popId, routeSiteId, "update")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }
  if (!isUuid(orderId)) {
    return { success: false, error: "Pedido inválido." }
  }

  const { supabase } = gate
  const { data: existing, error: existingErr } = await supabase
    .from("counter_orders")
    .select("id, status, fulfillment_type")
    .eq("id", orderId)
    .eq("pop_id", popId)
    .neq("status", "cancelled")
    .maybeSingle()

  if (existingErr) {
    return { success: false, error: existingErr.message }
  }
  if (!existing) {
    return { success: false, error: "El pedido no existe." }
  }

  const currentStatus = String(existing.status)
  const fulfillmentType = String(existing.fulfillment_type)

  if (status === "dispatched" && fulfillmentType !== "delivery") {
    return {
      success: false,
      error: "Solo los pedidos delivery pueden marcarse como enviados.",
    }
  }

  const validStatuses: CounterOrderStatus[] =
    fulfillmentType === "delivery"
      ? ["preparing", "dispatched", "delivered"]
      : ["preparing", "delivered"]

  if (!validStatuses.includes(status)) {
    return { success: false, error: "Estado no permitido para este pedido." }
  }

  if (currentStatus === status) {
    const { data: current, error: currentErr } = await supabase
      .from("counter_orders")
      .select(COUNTER_ORDER_SELECT)
      .eq("id", orderId)
      .eq("pop_id", popId)
      .single()
    if (currentErr || !current) {
      return {
        success: false,
        error: currentErr?.message || "No se pudo leer el pedido.",
      }
    }
    return {
      success: true,
      order: mapCounterOrderRow(
        current as Parameters<typeof mapCounterOrderRow>[0],
      ),
    }
  }

  const patch: Record<string, unknown> = { status }
  if (status === "delivered") {
    patch.delivered_at = new Date().toISOString()
  } else {
    patch.delivered_at = null
  }

  const { data, error } = await supabase
    .from("counter_orders")
    .update(patch)
    .eq("id", orderId)
    .eq("pop_id", popId)
    .select(COUNTER_ORDER_SELECT)
    .single()

  if (error || !data) {
    return {
      success: false,
      error: error?.message || "No se pudo actualizar el estado.",
    }
  }

  return {
    success: true,
    order: mapCounterOrderRow(data as Parameters<typeof mapCounterOrderRow>[0]),
  }
}

export async function cancelCounterOrder(
  popId: string,
  routeSiteId: string,
  orderId: string,
): Promise<
  | { success: true }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireMostradorAccess(popId, routeSiteId, "update")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }
  if (!isUuid(orderId)) {
    return { success: false, error: "Pedido inválido." }
  }

  const { supabase, userId } = gate
  const { data, error } = await supabase
    .from("counter_orders")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancelled_by: userId,
    })
    .eq("id", orderId)
    .eq("pop_id", popId)
    .in("status", ["preparing", "dispatched", "delivered"])
    .is("sale_id", null)
    .select("id")
    .maybeSingle()

  if (error) {
    return { success: false, error: error.message }
  }
  if (!data) {
    return {
      success: false,
      error: "No se puede cancelar este pedido (cobrado o inexistente).",
    }
  }

  return { success: true }
}

export async function saveCounterOrderCheckout(
  popId: string,
  routeSiteId: string,
  orderId: string,
  checkout: TableSessionCheckoutSnapshot,
): Promise<
  | { success: true; updatedAt: string }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireMostradorAccess(popId, routeSiteId, "update")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }
  if (!isUuid(orderId)) {
    return { success: false, error: "Pedido inválido." }
  }

  const { supabase } = gate

  const { data: existing, error: existingErr } = await supabase
    .from("counter_orders")
    .select("id, metadata, status, sale_id")
    .eq("id", orderId)
    .eq("pop_id", popId)
    .neq("status", "cancelled")
    .maybeSingle()

  if (existingErr) {
    return { success: false, error: existingErr.message }
  }
  if (!existing) {
    return { success: false, error: "El pedido no existe." }
  }

  if (existing.sale_id) {
    return {
      success: false,
      error: "No se puede modificar un pedido ya cobrado.",
    }
  }

  const metadata =
    existing.metadata &&
    typeof existing.metadata === "object" &&
    !Array.isArray(existing.metadata)
      ? { ...(existing.metadata as Record<string, unknown>) }
      : {}

  metadata.checkout = checkout

  const { data, error } = await supabase
    .from("counter_orders")
    .update({ metadata })
    .eq("id", orderId)
    .eq("pop_id", popId)
    .select("updated_at")
    .single()

  if (error || !data?.updated_at) {
    return {
      success: false,
      error: error?.message || "No se pudo guardar el pedido.",
    }
  }

  return { success: true, updatedAt: data.updated_at as string }
}

export async function linkCounterOrderSale(
  popId: string,
  orderId: string,
  saleId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  if (!isUuid(orderId) || !isUuid(saleId)) {
    return { success: false, error: "Identificadores inválidos." }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("counter_orders")
    .update({ sale_id: saleId })
    .eq("id", orderId)
    .eq("pop_id", popId)

  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true }
}
