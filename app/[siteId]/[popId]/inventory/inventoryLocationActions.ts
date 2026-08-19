"use server"

import {
  articleReferenceCostError,
  resolveArticleReferenceUnitCost,
} from "@/lib/articleReferenceUnitCost"
import {
  applyInventoryFefoOrder,
  parseInventoryExpiresAt,
} from "@/lib/inventory/inventoryExpiry"
import {
  resolvePopInventoryLocationId,
} from "@/lib/inventory/inventoryLocations"
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

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

function siteIdsMatch(routeSiteId: string, popSiteId: string) {
  return routeSiteId.trim().toLowerCase() === popSiteId.trim().toLowerCase()
}

async function requireInventoryAccess(
  popId: string,
  siteId: string,
  action: "create" | "update",
) {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { ok: false as const, error: access.error || "Sin acceso" }
  }
  const snap = await loadPopPermissionsSnapshot(popId)
  const perm =
    action === "create" ? POP_PERMS.INVENTORY_CREATE : POP_PERMS.INVENTORY_UPDATE
  if (!permissionKeysInclude(snap.keys, perm.resource, perm.action)) {
    return {
      ok: false as const,
      error:
        action === "create"
          ? "Sin permiso para operar inventario."
          : "Sin permiso para actualizar depósitos.",
    }
  }
  const popRes = await getPopById(popId)
  if (!popRes.success || !popRes.pop) {
    return { ok: false as const, error: popRes.error || "No se pudo validar el punto." }
  }
  if (!siteIdsMatch(siteId, popRes.pop.siteId)) {
    return {
      ok: false as const,
      error: "El sitio de la URL no coincide con el punto de venta.",
    }
  }
  return { ok: true as const }
}

async function sumOnHand(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  articleId: string,
  locationId: string,
) {
  const { data: rows, error } = await supabase
    .from("inventory_movements")
    .select("quantity_delta")
    .eq("pop_id", popId)
    .eq("article_id", articleId)
    .eq("location_id", locationId)
  if (error) {
    return { success: false as const, error: error.message || "No se pudo leer el stock." }
  }
  let t = 0
  for (const row of rows || []) t += parseQty(row.quantity_delta)
  return { success: true as const, onHand: Math.round(t * 1e6) / 1e6 }
}

export async function createInventoryLocation(
  popId: string,
  input: { name: string; siteId: string },
): Promise<{ success: true; locationId: string } | { success: false; error: string }> {
  try {
    const gate = await requireInventoryAccess(popId, input.siteId, "create")
    if (!gate.ok) return { success: false, error: gate.error }
    const name = input.name.trim()
    if (name.length < 1) {
      return { success: false, error: "Ponéle un nombre al depósito." }
    }
    if (name.length > 60) {
      return { success: false, error: "El nombre es demasiado largo." }
    }
    const supabase = await createClient()
    const { count } = await supabase
      .from("inventory_locations")
      .select("id", { count: "exact", head: true })
      .eq("pop_id", popId)
      .is("archived_at", null)
    const { data, error } = await supabase
      .from("inventory_locations")
      .insert({
        pop_id: popId,
        name,
        is_default: false,
        is_sellable: false,
        sort_order: (count ?? 0) + 1,
      })
      .select("id")
      .single()
    if (error || !data?.id) {
      if (error?.code === "23505") {
        return { success: false, error: "Ya hay un depósito con ese nombre." }
      }
      return { success: false, error: error?.message || "No se pudo crear el depósito." }
    }
    return { success: true, locationId: String(data.id) }
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" }
  }
}

export async function renameInventoryLocation(
  popId: string,
  input: { locationId: string; name: string; siteId: string },
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const gate = await requireInventoryAccess(popId, input.siteId, "update")
    if (!gate.ok) return { success: false, error: gate.error }
    const name = input.name.trim()
    if (name.length < 1) {
      return { success: false, error: "Ponéle un nombre al depósito." }
    }
    if (name.length > 60) {
      return { success: false, error: "El nombre es demasiado largo." }
    }
    const supabase = await createClient()
    const location = await resolvePopInventoryLocationId(
      supabase,
      popId,
      input.locationId,
    )
    if (!location.success) return { success: false, error: location.error }
    const { error } = await supabase
      .from("inventory_locations")
      .update({ name })
      .eq("id", location.locationId)
      .eq("pop_id", popId)
    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Ya hay un depósito con ese nombre." }
      }
      return { success: false, error: error.message || "No se pudo renombrar." }
    }
    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" }
  }
}

export async function archiveInventoryLocation(
  popId: string,
  input: { locationId: string; siteId: string },
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const gate = await requireInventoryAccess(popId, input.siteId, "update")
    if (!gate.ok) return { success: false, error: gate.error }
    const supabase = await createClient()
    const { data: loc, error: locErr } = await supabase
      .from("inventory_locations")
      .select("id, is_default")
      .eq("pop_id", popId)
      .eq("id", input.locationId.trim())
      .is("archived_at", null)
      .maybeSingle()
    if (locErr || !loc?.id) {
      return { success: false, error: "Ese depósito no está disponible." }
    }
    if (loc.is_default) {
      return { success: false, error: "El depósito principal no se puede archivar." }
    }
    const { data: movs, error: movErr } = await supabase
      .from("inventory_movements")
      .select("quantity_delta")
      .eq("pop_id", popId)
      .eq("location_id", loc.id)
    if (movErr) {
      return { success: false, error: movErr.message || "No se pudo revisar el stock." }
    }
    let onHand = 0
    for (const row of movs || []) onHand += parseQty(row.quantity_delta)
    if (Math.abs(onHand) > 1e-6) {
      return {
        success: false,
        error: "Trasladá o ajustá el stock antes de archivar este depósito.",
      }
    }
    const { data: openLayers, error: layerErr } = await supabase
      .from("inventory_cost_layers")
      .select("id")
      .eq("pop_id", popId)
      .eq("location_id", loc.id)
      .gt("quantity_remaining", 0)
      .limit(1)
    if (layerErr) {
      return { success: false, error: layerErr.message || "No se pudieron leer las capas." }
    }
    if ((openLayers ?? []).length > 0) {
      return {
        success: false,
        error: "Todavía hay capas FIFO en este depósito.",
      }
    }
    const { error } = await supabase
      .from("inventory_locations")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", loc.id)
      .eq("pop_id", popId)
    if (error) {
      return { success: false, error: error.message || "No se pudo archivar." }
    }
    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" }
  }
}

export async function transferInventoryStock(
  popId: string,
  input: {
    articleId: string
    fromLocationId: string
    toLocationId: string
    quantity: number
    siteId: string
  },
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const gate = await requireInventoryAccess(popId, input.siteId, "create")
    if (!gate.ok) return { success: false, error: gate.error }
    if (input.fromLocationId.trim() === input.toLocationId.trim()) {
      return { success: false, error: "Elegí dos depósitos distintos." }
    }
    const qtyAbs = Number(input.quantity)
    if (!Number.isFinite(qtyAbs) || !Number.isInteger(qtyAbs) || qtyAbs < 1 || qtyAbs > 10000) {
      return { success: false, error: "La cantidad debe ser un entero entre 1 y 10000." }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user?.id) return { success: false, error: "Sesión requerida." }

    const from = await resolvePopInventoryLocationId(
      supabase,
      popId,
      input.fromLocationId,
    )
    const to = await resolvePopInventoryLocationId(supabase, popId, input.toLocationId)
    if (!from.success) return { success: false, error: from.error }
    if (!to.success) return { success: false, error: to.error }

    const { data: artRow, error: artErr } = await supabase
      .from("articles")
      .select("id, name")
      .eq("id", input.articleId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (artErr || !artRow) {
      return { success: false, error: "Artículo no encontrado en este punto." }
    }
    const articleName = String(artRow.name ?? "")

    const originOnHand = await sumOnHand(
      supabase,
      popId,
      input.articleId,
      from.locationId,
    )
    if (!originOnHand.success) return { success: false, error: originOnHand.error }
    if (qtyAbs > originOnHand.onHand + 1e-6) {
      return { success: false, error: "El origen no tiene esa cantidad." }
    }

    const destOnHand = await sumOnHand(supabase, popId, input.articleId, to.locationId)
    if (!destOnHand.success) return { success: false, error: destOnHand.error }
    const holeQty =
      destOnHand.onHand < -1e-6
        ? Math.min(qtyAbs, parseQty(-destOnHand.onHand))
        : 0

    const articleCostRef = roundMoney(
      await resolveArticleReferenceUnitCost(supabase, popId, input.articleId),
    )
    const { data: layerRows, error: lrErr } = await applyInventoryFefoOrder(
      supabase
        .from("inventory_cost_layers")
        .select("id, quantity_remaining, unit_cost, received_at, expires_at")
        .eq("pop_id", popId)
        .eq("article_id", input.articleId)
        .eq("location_id", from.locationId)
        .gt("quantity_remaining", 0),
    )
    if (lrErr) {
      return { success: false, error: lrErr.message || "No se pudieron leer capas de costo." }
    }

    type Take = {
      layerId: string
      qty: number
      unitCost: number
      remainingBefore: number
      receivedAt: string
      expiresAt: string | null
    }
    const takes: Take[] = []
    let need = qtyAbs
    for (const row of layerRows || []) {
      if (need <= 0) break
      const rem = parseQty(row.quantity_remaining)
      if (rem <= 0) continue
      const take = Math.min(need, rem)
      takes.push({
        layerId: String(row.id),
        qty: take,
        unitCost: parseQty(row.unit_cost),
        remainingBefore: rem,
        receivedAt: String(row.received_at ?? new Date().toISOString()),
        expiresAt: parseInventoryExpiresAt(row.expires_at),
      })
      need = parseQty(need - take)
    }

    type Incoming = {
      qty: number
      unitCost: number
      receivedAt: string
      expiresAt: string | null
    }
    const incoming: Incoming[] = takes.map((take) => ({
      qty: take.qty,
      unitCost: take.unitCost,
      receivedAt: take.receivedAt,
      expiresAt: take.expiresAt,
    }))
    if (need > 1e-6) {
      if (articleCostRef <= 0) {
        return { success: false, error: articleReferenceCostError(articleName) }
      }
      incoming.push({
        qty: need,
        unitCost: articleCostRef,
        receivedAt: new Date().toISOString(),
        expiresAt: null,
      })
    }

    const { data: fromNameRow } = await supabase
      .from("inventory_locations")
      .select("name")
      .eq("id", from.locationId)
      .maybeSingle()
    const { data: toNameRow } = await supabase
      .from("inventory_locations")
      .select("name")
      .eq("id", to.locationId)
      .maybeSingle()
    const fromName = String(fromNameRow?.name ?? "origen")
    const toName = String(toNameRow?.name ?? "destino")
    const transferGroupId = crypto.randomUUID()
    const note = `Traslado — ${articleName} · ${fromName} → ${toName}`

    const { data: outMov, error: outErr } = await supabase
      .from("inventory_movements")
      .insert({
        pop_id: popId,
        location_id: from.locationId,
        counterpart_location_id: to.locationId,
        transfer_group_id: transferGroupId,
        article_id: input.articleId,
        quantity_delta: -qtyAbs,
        movement_type: "transfer_out",
        note,
        created_by: user.id,
      })
      .select("id")
      .single()
    if (outErr || !outMov?.id) {
      return { success: false, error: outErr?.message || "No se pudo registrar la salida." }
    }
    const outId = String(outMov.id)

    const undoOut = async () => {
      for (const take of takes) {
        await supabase
          .from("inventory_cost_layers")
          .update({ quantity_remaining: take.remainingBefore })
          .eq("id", take.layerId)
      }
      await supabase.from("inventory_layer_allocations").delete().eq("inventory_movement_id", outId)
      await supabase.from("inventory_movements").delete().eq("id", outId)
    }

    for (const take of takes) {
      const { error: allocErr } = await supabase.from("inventory_layer_allocations").insert({
        pop_id: popId,
        layer_id: take.layerId,
        article_id: input.articleId,
        inventory_movement_id: outId,
        quantity: take.qty,
        unit_cost: take.unitCost,
      })
      if (allocErr) {
        await undoOut()
        return { success: false, error: allocErr.message || "No se pudo imputar el FIFO." }
      }
      const { error: layErr } = await supabase
        .from("inventory_cost_layers")
        .update({ quantity_remaining: parseQty(take.remainingBefore - take.qty) })
        .eq("id", take.layerId)
      if (layErr) {
        await undoOut()
        return { success: false, error: layErr.message || "No se pudo actualizar la capa." }
      }
    }

    const { data: inMov, error: inErr } = await supabase
      .from("inventory_movements")
      .insert({
        pop_id: popId,
        location_id: to.locationId,
        counterpart_location_id: from.locationId,
        transfer_group_id: transferGroupId,
        article_id: input.articleId,
        quantity_delta: qtyAbs,
        movement_type: "transfer_in",
        note,
        created_by: user.id,
      })
      .select("id")
      .single()
    if (inErr || !inMov?.id) {
      await undoOut()
      return { success: false, error: inErr?.message || "No se pudo registrar la entrada." }
    }
    const inId = String(inMov.id)

    let holeLeft = holeQty
    for (const slice of incoming) {
      let fromSlice = slice.qty
      if (holeLeft > 1e-6) {
        const cover = Math.min(fromSlice, holeLeft)
        const { error: coverErr } = await supabase.from("inventory_cost_layers").insert({
          pop_id: popId,
          location_id: to.locationId,
          article_id: input.articleId,
          source_movement_id: inId,
          quantity_received: cover,
          quantity_remaining: 0,
          unit_cost: slice.unitCost,
          received_at: slice.receivedAt,
          expires_at: slice.expiresAt,
        })
        if (coverErr) {
          await supabase.from("inventory_cost_layers").delete().eq("source_movement_id", inId)
          await supabase.from("inventory_movements").delete().eq("id", inId)
          await undoOut()
          return { success: false, error: coverErr.message || "No se pudo tapar el agujero." }
        }
        holeLeft = parseQty(holeLeft - cover)
        fromSlice = parseQty(fromSlice - cover)
      }
      if (fromSlice > 1e-6) {
        const { error: layerErr } = await supabase.from("inventory_cost_layers").insert({
          pop_id: popId,
          location_id: to.locationId,
          article_id: input.articleId,
          source_movement_id: inId,
          quantity_received: fromSlice,
          quantity_remaining: fromSlice,
          unit_cost: slice.unitCost,
          received_at: slice.receivedAt,
          expires_at: slice.expiresAt,
        })
        if (layerErr) {
          await supabase.from("inventory_cost_layers").delete().eq("source_movement_id", inId)
          await supabase.from("inventory_movements").delete().eq("id", inId)
          await undoOut()
          return { success: false, error: layerErr.message || "No se pudo crear la capa de destino." }
        }
      }
    }

    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" }
  }
}
