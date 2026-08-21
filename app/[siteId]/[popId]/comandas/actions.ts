"use server"

import {
  canMoveComandaTo,
  timestampsForStatusChange,
} from "@/app/[siteId]/[popId]/comandas/comandasLogic"
import type {
  ComandaStation,
  ComandaStatus,
  ComandaTicket,
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
  delivered_at
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
}): ComandaTicket {
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
