import {
  checkoutCustomerName,
  formatCounterOriginLabel,
  formatTableOriginLabel,
} from "@/app/[siteId]/[popId]/comandas/comandasLogic"
import type { TableSessionCheckoutSnapshot } from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"
import { resolveCartLineId } from "@/lib/menuCart"
import { createClient } from "@/utils/supabase/server"

type Supabase = Awaited<ReturnType<typeof createClient>>

type ExistingComanda = {
  id: string
  cart_line_id: string
  status: string
  station_id: string
}

type DesiredLine = {
  cartLineId: string
  recipeId: string
  recipeName: string
  stationId: string
  quantity: number
  comment: string
}

function recipeIdsFromCheckout(checkout: TableSessionCheckoutSnapshot): string[] {
  const ids = new Set<string>()
  for (const item of checkout.carrito) {
    if (!item.kind || item.kind === "recipe") {
      ids.add(item.productoId)
      continue
    }
    if (item.kind !== "promotion") continue
    for (const selection of item.promotionSelections ?? []) {
      if (selection.kind === "recipe") ids.add(selection.refId)
    }
  }
  return [...ids]
}

function desiredLinesFromCheckout(
  checkout: TableSessionCheckoutSnapshot,
  recipesById: Map<
    string,
    { name: string; stationId: string }
  >,
): DesiredLine[] {
  const out: DesiredLine[] = []
  for (const item of checkout.carrito) {
    const lineId = resolveCartLineId(item)
    const comment = checkout.itemComentarios?.[lineId]?.trim() ?? ""
    const quantity = Math.max(1, Math.round(item.cantidad))

    if (!item.kind || item.kind === "recipe") {
      const recipe = recipesById.get(item.productoId)
      if (!recipe) continue
      out.push({
        cartLineId: lineId,
        recipeId: item.productoId,
        recipeName: recipe.name,
        stationId: recipe.stationId,
        quantity,
        comment,
      })
      continue
    }

    if (item.kind !== "promotion") continue
    for (const selection of item.promotionSelections ?? []) {
      if (selection.kind !== "recipe") continue
      const recipe = recipesById.get(selection.refId)
      if (!recipe) continue
      out.push({
        cartLineId: `${lineId}:${selection.slotId}`,
        recipeId: selection.refId,
        recipeName: recipe.name,
        stationId: recipe.stationId,
        quantity: Math.max(1, quantity * Math.max(1, selection.slotQuantity)),
        comment,
      })
    }
  }
  return out
}

async function loadRecipeStations(
  supabase: Supabase,
  popId: string,
  recipeIds: string[],
): Promise<Map<string, { name: string; stationId: string }>> {
  const out = new Map<string, { name: string; stationId: string }>()
  if (recipeIds.length === 0) return out

  const { data, error } = await supabase
    .from("recipes")
    .select("id, name, recipe_categories ( station_id )")
    .eq("pop_id", popId)
    .in("id", recipeIds)

  if (error || !data) return out

  for (const row of data) {
    const rel = row.recipe_categories as
      | { station_id?: string | null }
      | { station_id?: string | null }[]
      | null
    const category = Array.isArray(rel) ? rel[0] : rel
    const stationId = category?.station_id ? String(category.station_id) : ""
    const name = String(row.name ?? "").trim()
    if (!stationId || !name) continue
    out.set(String(row.id), { name, stationId })
  }
  return out
}

async function applyComandaSync(
  supabase: Supabase,
  input: {
    popId: string
    sourceKind: "table" | "counter"
    sourceId: string
    tableSessionId: string | null
    counterOrderId: string | null
    originLabel: string
    customerName: string
    checkout: TableSessionCheckoutSnapshot
  },
): Promise<void> {
  const recipesById = await loadRecipeStations(
    supabase,
    input.popId,
    recipeIdsFromCheckout(input.checkout),
  )
  const desired = desiredLinesFromCheckout(input.checkout, recipesById)

  const { data: existingRows, error: existingErr } = await supabase
    .from("comandas")
    .select("id, cart_line_id, status, station_id")
    .eq("pop_id", input.popId)
    .eq("source_kind", input.sourceKind)
    .eq("source_id", input.sourceId)

  if (existingErr) {
    console.error("comandas: no se pudieron leer tickets", existingErr.message)
    return
  }

  const existing = (existingRows ?? []) as ExistingComanda[]
  const existingByLine = new Map(existing.map((row) => [row.cart_line_id, row]))
  const desiredIds = new Set(desired.map((line) => line.cartLineId))
  const leftoverPending = existing.filter(
    (row) => row.status === "pending" && !desiredIds.has(row.cart_line_id),
  )

  if (leftoverPending.length > 0) {
    const { error } = await supabase
      .from("comandas")
      .delete()
      .eq("pop_id", input.popId)
      .in(
        "id",
        leftoverPending.map((row) => row.id),
      )
    if (error) {
      console.error("comandas: no se pudieron borrar tickets pendientes", error.message)
    }
  }

  const toInsert = desired.filter((line) => !existingByLine.has(line.cartLineId))
  if (toInsert.length > 0) {
    const { error } = await supabase.from("comandas").insert(
      toInsert.map((line) => ({
        pop_id: input.popId,
        station_id: line.stationId,
        status: "pending",
        source_kind: input.sourceKind,
        source_id: input.sourceId,
        table_session_id: input.tableSessionId,
        counter_order_id: input.counterOrderId,
        cart_line_id: line.cartLineId,
        recipe_id: line.recipeId,
        recipe_name: line.recipeName,
        quantity: line.quantity,
        comment: line.comment,
        origin_label: input.originLabel,
        customer_name: input.customerName,
      })),
    )
    if (error) {
      console.error("comandas: no se pudieron crear tickets", error.message)
    }
  }

  for (const line of desired) {
    const row = existingByLine.get(line.cartLineId)
    if (!row || row.status !== "pending") continue
    const { error } = await supabase
      .from("comandas")
      .update({
        recipe_name: line.recipeName,
        quantity: line.quantity,
        comment: line.comment,
        origin_label: input.originLabel,
        customer_name: input.customerName,
        recipe_id: line.recipeId,
      })
      .eq("id", row.id)
      .eq("pop_id", input.popId)
    if (error) {
      console.error("comandas: no se pudo actualizar ticket", error.message)
    }
  }
}

export async function syncComandasFromTableCheckout(
  supabase: Supabase,
  popId: string,
  sessionId: string,
  checkout: TableSessionCheckoutSnapshot,
): Promise<void> {
  try {
    const { data: session, error: sessionErr } = await supabase
      .from("table_sessions")
      .select("id, dining_table_id, table_session_tables ( dining_table_id )")
      .eq("id", sessionId)
      .eq("pop_id", popId)
      .maybeSingle()

    if (sessionErr || !session) return

    const tableIds = [
      session.dining_table_id,
      ...((session.table_session_tables ?? []) as { dining_table_id: string }[]).map(
        (row) => row.dining_table_id,
      ),
    ].filter((id, index, all): id is string => Boolean(id) && all.indexOf(id) === index)

    let labels: string[] = []
    if (tableIds.length > 0) {
      const { data: tables } = await supabase
        .from("dining_tables")
        .select("id, label, name")
        .eq("pop_id", popId)
        .in("id", tableIds)
      labels = (tables ?? []).map((table) =>
        String(table.label || table.name || "").trim(),
      )
    }

    await applyComandaSync(supabase, {
      popId,
      sourceKind: "table",
      sourceId: sessionId,
      tableSessionId: sessionId,
      counterOrderId: null,
      originLabel: formatTableOriginLabel(labels),
      customerName: checkoutCustomerName({
        selectedName: checkout.clienteSeleccionado?.name,
        manualName: checkout.manualNombreCliente,
      }),
      checkout,
    })
  } catch (error) {
    console.error("comandas: sync de mesa falló", error)
  }
}

export async function syncComandasFromCounterCheckout(
  supabase: Supabase,
  popId: string,
  orderId: string,
  checkout: TableSessionCheckoutSnapshot,
): Promise<void> {
  try {
    const { data: order, error: orderErr } = await supabase
      .from("counter_orders")
      .select("id, order_number")
      .eq("id", orderId)
      .eq("pop_id", popId)
      .maybeSingle()

    if (orderErr || !order) return

    await applyComandaSync(supabase, {
      popId,
      sourceKind: "counter",
      sourceId: orderId,
      tableSessionId: null,
      counterOrderId: orderId,
      originLabel: formatCounterOriginLabel(Number(order.order_number) || 0),
      customerName: checkoutCustomerName({
        selectedName: checkout.clienteSeleccionado?.name,
        manualName: checkout.manualNombreCliente,
      }),
      checkout,
    })
  } catch (error) {
    console.error("comandas: sync de mostrador falló", error)
  }
}
