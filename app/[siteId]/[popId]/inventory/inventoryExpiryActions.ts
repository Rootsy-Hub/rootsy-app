"use server"

import { parseInventoryExpiresAt } from "@/lib/inventory/inventoryExpiry"
import { getPopById, validatePopAccess } from "@/lib/popHelpers"
import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import { createClient } from "@/utils/supabase/server"

function parseQty(v: unknown): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 1e6) / 1e6
}

function siteIdsMatch(routeSiteId: string, popSiteId: string) {
  return routeSiteId.trim().toLowerCase() === popSiteId.trim().toLowerCase()
}

export async function setInventoryLayerExpiry(
  popId: string,
  input: {
    layerId: string
    siteId: string
    expiresAt: string | null
    quantity?: number
  },
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    const canWrite =
      permissionKeysInclude(
        snap.keys,
        POP_PERMS.INVENTORY_UPDATE.resource,
        POP_PERMS.INVENTORY_UPDATE.action,
      ) ||
      permissionKeysInclude(
        snap.keys,
        POP_PERMS.INVENTORY_CREATE.resource,
        POP_PERMS.INVENTORY_CREATE.action,
      )
    if (!canWrite) {
      return { success: false, error: "Sin permiso para fechar stock." }
    }
    const popRes = await getPopById(popId)
    if (!popRes.success) {
      return { success: false, error: popRes.error || "No se pudo validar el punto." }
    }
    if (!siteIdsMatch(input.siteId, popRes.pop.siteId)) {
      return {
        success: false,
        error: "El sitio de la URL no coincide con el punto de venta.",
      }
    }

    const expiresAt = parseInventoryExpiresAt(input.expiresAt)
    const layerId = input.layerId.trim()
    if (!layerId) {
      return { success: false, error: "Falta la capa." }
    }

    const supabase = await createClient()
    const { data: layer, error: layerErr } = await supabase
      .from("inventory_cost_layers")
      .select(
        "id, pop_id, location_id, article_id, source_movement_id, quantity_received, quantity_remaining, unit_cost, received_at, expires_at",
      )
      .eq("id", layerId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (layerErr || !layer) {
      return { success: false, error: layerErr?.message || "No se encontró la capa." }
    }

    const remaining = parseQty(layer.quantity_remaining)
    if (remaining <= 1e-6) {
      return { success: false, error: "Esa capa ya no tiene stock." }
    }

    const received = parseQty(layer.quantity_received)
    const qtyRaw =
      input.quantity == null ? remaining : parseQty(input.quantity)
    if (qtyRaw <= 1e-6) {
      return { success: false, error: "Indicá una cantidad mayor que cero." }
    }
    if (qtyRaw > remaining + 1e-6) {
      return { success: false, error: "No hay tanta cantidad en esa capa." }
    }

    const dateUnchanged =
      parseInventoryExpiresAt(layer.expires_at) === expiresAt
    if (dateUnchanged && qtyRaw >= remaining - 1e-6) {
      return { success: true }
    }

    if (qtyRaw >= remaining - 1e-6) {
      const { error } = await supabase
        .from("inventory_cost_layers")
        .update({ expires_at: expiresAt })
        .eq("id", layerId)
        .eq("pop_id", popId)
      if (error) {
        return { success: false, error: error.message || "No se pudo guardar la fecha." }
      }
      return { success: true }
    }

    const leftover = parseQty(remaining - qtyRaw)
    const receivedAfter = parseQty(received - qtyRaw)
    if (receivedAfter + 1e-9 < leftover) {
      return { success: false, error: "No se puede partir esa capa." }
    }

    const { error: shrinkErr } = await supabase
      .from("inventory_cost_layers")
      .update({
        quantity_remaining: leftover,
        quantity_received: receivedAfter,
      })
      .eq("id", layerId)
      .eq("pop_id", popId)
    if (shrinkErr) {
      return {
        success: false,
        error: shrinkErr.message || "No se pudo partir la capa.",
      }
    }

    const { error: insertErr } = await supabase.from("inventory_cost_layers").insert({
      pop_id: popId,
      location_id: layer.location_id,
      article_id: layer.article_id,
      source_movement_id: layer.source_movement_id,
      quantity_received: qtyRaw,
      quantity_remaining: qtyRaw,
      unit_cost: layer.unit_cost,
      received_at: layer.received_at,
      expires_at: expiresAt,
    })
    if (insertErr) {
      await supabase
        .from("inventory_cost_layers")
        .update({
          quantity_remaining: remaining,
          quantity_received: received,
        })
        .eq("id", layerId)
        .eq("pop_id", popId)
      return {
        success: false,
        error: insertErr.message || "No se pudo crear el lote partido.",
      }
    }

    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" }
  }
}
