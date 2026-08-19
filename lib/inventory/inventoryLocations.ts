import type { SupabaseClient } from "@supabase/supabase-js"

export const DEFAULT_INVENTORY_LOCATION_NAME = "Despensa"

export type InventoryLocationRow = {
  id: string
  name: string
  isDefault: boolean
  isSellable: boolean
  articleCount: number
  inventoryValue: number
  canArchive: boolean
}

export function buildInventoryLocationRows(input: {
  locations: Array<{
    id: string
    name: string
    is_default: boolean
    is_sellable: boolean
  }>
  onHandByKey: Map<string, number>
  remainingValueByLocation: Map<string, number>
}): InventoryLocationRow[] {
  return input.locations.map((loc) => {
    let articleCount = 0
    let absOnHand = 0
    for (const [key, qty] of input.onHandByKey) {
      if (!key.startsWith(`${loc.id}:`)) continue
      if (Math.abs(qty) > 1e-6) {
        articleCount += 1
        absOnHand += Math.abs(qty)
      }
    }
    const inventoryValue = Math.round((input.remainingValueByLocation.get(loc.id) ?? 0) * 100) / 100
    return {
      id: loc.id,
      name: loc.name,
      isDefault: Boolean(loc.is_default),
      isSellable: Boolean(loc.is_sellable),
      articleCount,
      inventoryValue,
      canArchive: !loc.is_default && absOnHand < 1e-6 && inventoryValue < 1e-6,
    }
  })
}

type LocationIdResult =
  | { success: true; locationId: string }
  | { success: false; error: string }

export async function ensurePopDefaultInventoryLocationId(
  supabase: SupabaseClient,
  popId: string,
): Promise<LocationIdResult> {
  const { data, error } = await supabase.rpc(
    "ensure_pop_inventory_default_location",
    { p_pop_id: popId },
  )
  if (error || data == null || String(data).trim() === "") {
    return {
      success: false,
      error: error?.message || "No se pudo resolver el depósito Despensa.",
    }
  }
  return { success: true, locationId: String(data) }
}

export async function resolvePopInventoryLocationId(
  supabase: SupabaseClient,
  popId: string,
  locationId: string,
): Promise<LocationIdResult> {
  const trimmed = locationId.trim()
  if (!trimmed) {
    return { success: false, error: "Elegí un depósito." }
  }
  const { data, error } = await supabase
    .from("inventory_locations")
    .select("id")
    .eq("pop_id", popId)
    .eq("id", trimmed)
    .is("archived_at", null)
    .maybeSingle()
  if (error) {
    return {
      success: false,
      error: error.message || "No se pudo leer el depósito.",
    }
  }
  if (!data?.id) {
    return { success: false, error: "Ese depósito no está disponible." }
  }
  return { success: true, locationId: String(data.id) }
}

export async function getPopSellableInventoryLocationId(
  supabase: SupabaseClient,
  popId: string,
): Promise<LocationIdResult> {
  const { data, error } = await supabase
    .from("inventory_locations")
    .select("id")
    .eq("pop_id", popId)
    .eq("is_sellable", true)
    .is("archived_at", null)
    .order("is_default", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) {
    return {
      success: false,
      error: error.message || "No se pudo leer el depósito de venta.",
    }
  }
  if (data?.id) {
    return { success: true, locationId: String(data.id) }
  }
  return ensurePopDefaultInventoryLocationId(supabase, popId)
}
