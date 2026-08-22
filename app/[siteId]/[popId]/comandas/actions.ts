"use server"

import {
  canMoveComandaTo,
  timestampsForStatusChange,
} from "@/app/[siteId]/[popId]/comandas/comandasLogic"
import type {
  ComandaSendPeel,
  ComandaStation,
  ComandaStatus,
  ComandaTicket,
  PendingComandaItem,
} from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import { requireAuthenticatedUser } from "@/lib/authHelpers"
import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { getPopSiteId, validatePopAccess } from "@/lib/popHelpers"
import { popMenuHref, siteIdsMatchClientRoute } from "@/lib/popRoutes"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import { createClient } from "@/utils/supabase/server"

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const COMANDA_SELECT = `
  id,
  station_id,
  status,
  source_kind,
  source_id,
  cart_line_id,
  recipe_id,
  recipe_name,
  quantity,
  comment,
  origin_label,
  customer_name,
  created_at,
  updated_at,
  status_changed_at,
  sent_at,
  preparing_at,
  ready_at,
  delivered_at,
  send_id,
  comanda_sends ( comment )
`

const DELIVERED_RETENTION_HOURS = 12

function isUuid(value: string): boolean {
  return UUID_RE.test(value.trim())
}

function isComandaStatus(value: string): value is ComandaStatus {
  return (
    value === "pending" ||
    value === "sent" ||
    value === "preparing" ||
    value === "ready" ||
    value === "delivered"
  )
}

function mapComandaRow(row: {
  id: string
  station_id: string
  status: string
  source_kind: string
  source_id: string
  cart_line_id: string
  recipe_id: string | null
  recipe_name: string
  quantity: number
  comment: string
  origin_label: string
  customer_name: string
  created_at: string
  updated_at: string
  status_changed_at: string
  sent_at: string | null
  preparing_at: string | null
  ready_at: string | null
  delivered_at: string | null
  send_id?: string | null
  comanda_sends?: { comment?: string | null } | { comment?: string | null }[] | null
}): ComandaTicket {
  const sendRel = row.comanda_sends
  const send = Array.isArray(sendRel) ? sendRel[0] : sendRel
  return {
    id: String(row.id),
    stationId: String(row.station_id),
    status: isComandaStatus(row.status) ? row.status : "sent",
    sourceKind: row.source_kind === "counter" ? "counter" : "table",
    sourceId: String(row.source_id),
    cartLineId: String(row.cart_line_id),
    recipeId: row.recipe_id ? String(row.recipe_id) : null,
    recipeName: String(row.recipe_name ?? ""),
    quantity: Math.max(1, Number(row.quantity) || 1),
    comment: String(row.comment ?? ""),
    originLabel: String(row.origin_label ?? ""),
    customerName: String(row.customer_name ?? ""),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    statusChangedAt: String(row.status_changed_at),
    sentAt: row.sent_at ? String(row.sent_at) : null,
    preparingAt: row.preparing_at ? String(row.preparing_at) : null,
    readyAt: row.ready_at ? String(row.ready_at) : null,
    deliveredAt: row.delivered_at ? String(row.delivered_at) : null,
    sendId: row.send_id ? String(row.send_id) : null,
    sendComment: send?.comment ? String(send.comment) : "",
  }
}

async function requireComandasAccess(
  popId: string,
  routeSiteId: string,
  mode: "read" | "update",
): Promise<
  | {
      ok: true
      supabase: Awaited<ReturnType<typeof createClient>>
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

  await requireAuthenticatedUser()
  const perms = await loadPopPermissionsSnapshot(popId)
  const canMesas = permissionKeysInclude(
    perms.keys,
    mode === "read" ? POP_PERMS.MESAS_READ.resource : POP_PERMS.MESAS_UPDATE.resource,
    mode === "read" ? POP_PERMS.MESAS_READ.action : POP_PERMS.MESAS_UPDATE.action,
  )
  const canMostrador = permissionKeysInclude(
    perms.keys,
    mode === "read"
      ? POP_PERMS.MOSTRADOR_READ.resource
      : POP_PERMS.MOSTRADOR_UPDATE.resource,
    mode === "read"
      ? POP_PERMS.MOSTRADOR_READ.action
      : POP_PERMS.MOSTRADOR_UPDATE.action,
  )

  if (!canMesas && !canMostrador) {
    return { ok: false, error: "Sin permiso para ver o mover comandas." }
  }

  const supabase = await createClient()
  return { ok: true, supabase }
}

export async function getComandaStations(
  popId: string,
  routeSiteId: string,
): Promise<
  | { success: true; stations: ComandaStation[] }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireComandasAccess(popId, routeSiteId, "read")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }

  const { data, error } = await gate.supabase
    .from("comanda_stations")
    .select("id, name, sort_order, is_active")
    .eq("pop_id", popId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  if (error) return { success: false, error: error.message }

  let rows = data ?? []
  if (rows.length === 0) {
    const { error: seedErr } = await gate.supabase.rpc(
      "seed_pop_comanda_stations",
      { p_pop_id: popId },
    )
    if (!seedErr) {
      const seeded = await gate.supabase
        .from("comanda_stations")
        .select("id, name, sort_order, is_active")
        .eq("pop_id", popId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true })
      if (!seeded.error) rows = seeded.data ?? []
    }
  }

  return {
    success: true,
    stations: rows.map((row) => ({
      id: String(row.id),
      name: String(row.name ?? ""),
      sortOrder: Number(row.sort_order ?? 0) || 0,
      isActive: Boolean(row.is_active),
    })),
  }
}

export async function getComandas(
  popId: string,
  routeSiteId: string,
  stationId: string,
): Promise<
  | { success: true; tickets: ComandaTicket[] }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireComandasAccess(popId, routeSiteId, "read")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }
  if (!isUuid(stationId)) {
    return { success: false, error: "Estación inválida." }
  }

  const since = new Date(
    Date.now() - DELIVERED_RETENTION_HOURS * 60 * 60 * 1000,
  ).toISOString()

  const [openRes, deliveredRes] = await Promise.all([
    gate.supabase
      .from("comandas")
      .select(COMANDA_SELECT)
      .eq("pop_id", popId)
      .eq("station_id", stationId)
      .in("status", ["sent", "preparing", "ready"])
      .order("created_at", { ascending: true }),
    gate.supabase
      .from("comandas")
      .select(COMANDA_SELECT)
      .eq("pop_id", popId)
      .eq("station_id", stationId)
      .eq("status", "delivered")
      .gte("delivered_at", since)
      .order("created_at", { ascending: true }),
  ])

  if (openRes.error) return { success: false, error: openRes.error.message }
  if (deliveredRes.error) {
    return { success: false, error: deliveredRes.error.message }
  }

  return {
    success: true,
    tickets: [...(openRes.data ?? []), ...(deliveredRes.data ?? [])].map((row) =>
      mapComandaRow(row as Parameters<typeof mapComandaRow>[0]),
    ),
  }
}

export async function getComandaById(
  popId: string,
  routeSiteId: string,
  ticketId: string,
): Promise<
  | { success: true; ticket: ComandaTicket | null }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireComandasAccess(popId, routeSiteId, "read")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }
  if (!isUuid(ticketId)) {
    return { success: false, error: "Comanda inválida." }
  }

  const { data, error } = await gate.supabase
    .from("comandas")
    .select(COMANDA_SELECT)
    .eq("id", ticketId)
    .eq("pop_id", popId)
    .maybeSingle()

  if (error) return { success: false, error: error.message }
  if (!data) return { success: true, ticket: null }

  return {
    success: true,
    ticket: mapComandaRow(data as Parameters<typeof mapComandaRow>[0]),
  }
}

async function applyComandaStatus(
  popId: string,
  routeSiteId: string,
  ticketId: string,
  nextStatus: ComandaStatus,
): Promise<
  | { success: true; ticket: ComandaTicket }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireComandasAccess(popId, routeSiteId, "update")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }
  if (!isUuid(ticketId)) {
    return { success: false, error: "Comanda inválida." }
  }

  const { data: existing, error: existingErr } = await gate.supabase
    .from("comandas")
    .select(COMANDA_SELECT)
    .eq("id", ticketId)
    .eq("pop_id", popId)
    .maybeSingle()

  if (existingErr) return { success: false, error: existingErr.message }
  if (!existing) return { success: false, error: "Esa comanda no existe." }

  const current = mapComandaRow(existing as Parameters<typeof mapComandaRow>[0])
  if (current.status === nextStatus) {
    return { success: true, ticket: current }
  }

  const isSend = current.status === "pending" && nextStatus === "sent"
  if (!isSend && !canMoveComandaTo(current.status, nextStatus)) {
    return {
      success: false,
      error: "Ese cambio de estado no está permitido.",
    }
  }

  const now = new Date().toISOString()
  const patch = timestampsForStatusChange(
    {
      sentAt: current.sentAt,
      preparingAt: current.preparingAt,
      readyAt: current.readyAt,
      deliveredAt: current.deliveredAt,
    },
    nextStatus,
    now,
  )

  const sendId = current.sendId
  if (sendId) {
    const { error: sendErr } = await gate.supabase
      .from("comanda_sends")
      .update(patch)
      .eq("id", sendId)
      .eq("pop_id", popId)
    if (sendErr) return { success: false, error: sendErr.message }

    const { data: sendItems, error: itemsErr } = await gate.supabase
      .from("comandas")
      .update(patch)
      .eq("send_id", sendId)
      .eq("pop_id", popId)
      .select(COMANDA_SELECT)
    if (itemsErr) return { success: false, error: itemsErr.message }
    const mapped = (sendItems ?? []).map((row) =>
      mapComandaRow(row as Parameters<typeof mapComandaRow>[0]),
    )
    const ticket = mapped.find((row) => row.id === ticketId) ?? mapped[0]
    if (!ticket) return { success: false, error: "No se pudo actualizar la comanda." }
    return { success: true, ticket }
  }

  const { data, error } = await gate.supabase
    .from("comandas")
    .update(patch)
    .eq("id", ticketId)
    .eq("pop_id", popId)
    .select(COMANDA_SELECT)
    .single()

  if (error || !data) {
    return {
      success: false,
      error: error?.message || "No se pudo actualizar la comanda.",
    }
  }

  return {
    success: true,
    ticket: mapComandaRow(data as Parameters<typeof mapComandaRow>[0]),
  }
}

export async function sendComanda(
  popId: string,
  routeSiteId: string,
  ticketId: string,
) {
  return applyComandaStatus(popId, routeSiteId, ticketId, "sent")
}

export async function sendComandas(
  popId: string,
  routeSiteId: string,
  ticketIds: string[],
): Promise<
  | { success: true; tickets: ComandaTicket[] }
  | { success: false; error: string; redirect?: string }
> {
  const tickets: ComandaTicket[] = []
  for (const ticketId of ticketIds) {
    const res = await sendComanda(popId, routeSiteId, ticketId)
    if (!res.success) return res
    tickets.push(res.ticket)
  }
  return { success: true, tickets }
}

export async function moveComandaStatus(
  popId: string,
  routeSiteId: string,
  ticketId: string,
  status: ComandaStatus,
) {
  return applyComandaStatus(popId, routeSiteId, ticketId, status)
}

export async function getPendingComandasForSource(
  popId: string,
  routeSiteId: string,
  sourceKind: "table" | "counter",
  sourceId: string,
): Promise<
  | { success: true; items: PendingComandaItem[] }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireComandasAccess(popId, routeSiteId, "update")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }
  if (!isUuid(sourceId)) {
    return { success: false, error: "Pedido inválido." }
  }

  const { data, error } = await gate.supabase
    .from("comandas")
    .select(
      `
      id,
      cart_line_id,
      recipe_name,
      quantity,
      comment,
      station_id,
      comanda_stations ( name )
    `,
    )
    .eq("pop_id", popId)
    .eq("source_kind", sourceKind)
    .eq("source_id", sourceId)
    .eq("status", "pending")
    .order("created_at", { ascending: true })

  if (error) return { success: false, error: error.message }

  return {
    success: true,
    items: (data ?? []).map((row) => {
      const rel = row.comanda_stations as
        | { name?: string | null }
        | { name?: string | null }[]
        | null
      const station = Array.isArray(rel) ? rel[0] : rel
      return {
        id: String(row.id),
        cartLineId: String(row.cart_line_id),
        recipeName: String(row.recipe_name ?? ""),
        quantity: Math.max(1, Number(row.quantity) || 1),
        comment: String(row.comment ?? ""),
        stationId: String(row.station_id),
        stationName: station?.name?.trim() || "Estación",
      }
    }),
  }
}

function resolveSendQuantity(requested: unknown, pendingQty: number): number {
  const n = Math.round(Number(requested))
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.min(pendingQty, n)
}

export async function sendComandaBatch(
  popId: string,
  routeSiteId: string,
  input: {
    sourceKind: "table" | "counter"
    sourceId: string
    quantities: Record<string, number>
    stationComments: Record<string, string>
  },
): Promise<
  | { success: true; sentCartLineIds: string[]; peels: ComandaSendPeel[] }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireComandasAccess(popId, routeSiteId, "update")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }
  if (!isUuid(input.sourceId)) {
    return { success: false, error: "Pedido inválido." }
  }

  const cartLineIds = [
    ...new Set(
      Object.entries(input.quantities)
        .filter(([, qty]) => resolveSendQuantity(qty, Number.MAX_SAFE_INTEGER) > 0)
        .map(([id]) => id.trim())
        .filter(Boolean),
    ),
  ]
  if (cartLineIds.length === 0) {
    return { success: false, error: "Elegí al menos un ítem para comandar." }
  }

  const { data: rows, error: loadErr } = await gate.supabase
    .from("comandas")
    .select(
      `
      id,
      cart_line_id,
      station_id,
      quantity,
      recipe_id,
      recipe_name,
      comment,
      origin_label,
      customer_name,
      table_session_id,
      counter_order_id,
      source_kind,
      source_id
    `,
    )
    .eq("pop_id", popId)
    .eq("source_kind", input.sourceKind)
    .eq("source_id", input.sourceId)
    .eq("status", "pending")
    .in("cart_line_id", cartLineIds)

  if (loadErr) return { success: false, error: loadErr.message }

  const selected = (rows ?? []).filter((row) => {
    const pendingQty = Math.max(1, Number(row.quantity) || 1)
    return resolveSendQuantity(input.quantities[String(row.cart_line_id)], pendingQty) > 0
  })
  if (selected.length === 0) {
    return { success: false, error: "No hay ítems pendientes para comandar." }
  }

  const byStation = new Map<string, typeof selected>()
  for (const row of selected) {
    const stationId = String(row.station_id)
    const list = byStation.get(stationId) ?? []
    list.push(row)
    byStation.set(stationId, list)
  }

  const now = new Date().toISOString()
  const sentCartLineIds: string[] = []
  const peels: ComandaSendPeel[] = []

  for (const [stationId, items] of byStation) {
    const comment = (input.stationComments[stationId] ?? "").trim()
    const { data: send, error: sendErr } = await gate.supabase
      .from("comanda_sends")
      .insert({
        pop_id: popId,
        station_id: stationId,
        status: "sent",
        source_kind: input.sourceKind,
        source_id: input.sourceId,
        table_session_id:
          input.sourceKind === "table" ? input.sourceId : null,
        counter_order_id:
          input.sourceKind === "counter" ? input.sourceId : null,
        comment,
        sent_at: now,
        status_changed_at: now,
      })
      .select("id")
      .single()

    if (sendErr || !send) {
      return {
        success: false,
        error: sendErr?.message || "No se pudo crear la comanda.",
      }
    }

    const fullSendIds: string[] = []

    for (const item of items) {
      const fromCartLineId = String(item.cart_line_id)
      const pendingQty = Math.max(1, Number(item.quantity) || 1)
      const sendQty = resolveSendQuantity(input.quantities[fromCartLineId], pendingQty)
      if (sendQty <= 0) continue

      if (sendQty < pendingQty) {
        const sentCartLineId = crypto.randomUUID()
        const remainderQty = pendingQty - sendQty
        const { error: insertErr } = await gate.supabase.from("comandas").insert({
          pop_id: popId,
          station_id: item.station_id,
          status: "sent",
          send_id: send.id,
          source_kind: item.source_kind,
          source_id: item.source_id,
          table_session_id: item.table_session_id,
          counter_order_id: item.counter_order_id,
          cart_line_id: sentCartLineId,
          recipe_id: item.recipe_id,
          recipe_name: item.recipe_name,
          quantity: sendQty,
          comment: item.comment,
          origin_label: item.origin_label,
          customer_name: item.customer_name,
          sent_at: now,
          status_changed_at: now,
        })
        if (insertErr) return { success: false, error: insertErr.message }

        const { error: remainErr } = await gate.supabase
          .from("comandas")
          .update({ quantity: remainderQty })
          .eq("pop_id", popId)
          .eq("id", item.id)
        if (remainErr) return { success: false, error: remainErr.message }

        sentCartLineIds.push(sentCartLineId)
        peels.push({
          fromCartLineId,
          sentCartLineId,
          sentQuantity: sendQty,
          remainderQuantity: remainderQty,
        })
        continue
      }

      fullSendIds.push(String(item.id))
      sentCartLineIds.push(fromCartLineId)
    }

    if (fullSendIds.length > 0) {
      const { error: updErr } = await gate.supabase
        .from("comandas")
        .update({
          status: "sent",
          send_id: send.id,
          sent_at: now,
          status_changed_at: now,
        })
        .eq("pop_id", popId)
        .in("id", fullSendIds)

      if (updErr) return { success: false, error: updErr.message }
    }
  }

  return { success: true, sentCartLineIds, peels }
}
