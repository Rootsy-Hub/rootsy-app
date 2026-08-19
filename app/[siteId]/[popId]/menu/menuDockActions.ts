"use server"

import { requireAuthenticatedUser } from "@/lib/authHelpers"
import {
  isMenuDockItemId,
  type MenuDockItemId,
} from "@/lib/menuCatalog"
import {
  MAX_MENU_DOCK_ITEMS,
  MIN_MENU_DOCK_ITEMS,
} from "@/lib/menuDockPreference"
import { validatePopAccess } from "@/lib/popHelpers"
import { createClient } from "@/utils/supabase/server"

function parseDockItemIds(raw: unknown): MenuDockItemId[] {
  if (!Array.isArray(raw)) return []
  const out: MenuDockItemId[] = []
  const seen = new Set<MenuDockItemId>()
  for (const entry of raw) {
    const id = entry === "active-services" ? "operations" : entry
    if (!isMenuDockItemId(id) || seen.has(id)) continue
    seen.add(id)
    out.push(id)
    if (out.length >= MAX_MENU_DOCK_ITEMS) break
  }
  return out
}

export async function getPopMenuDockPreference(
  popId: string,
): Promise<MenuDockItemId[] | null> {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess) return null

  const user = await requireAuthenticatedUser()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pop_user_menu_dock_preferences")
    .select("dock_item_ids")
    .eq("pop_id", popId)
    .eq("user_id", user.uid)
    .maybeSingle()

  if (error || !data) return null

  const ids = parseDockItemIds(data.dock_item_ids)
  return ids.length >= MIN_MENU_DOCK_ITEMS ? ids : null
}

export async function savePopMenuDockPreference(
  popId: string,
  dockItemIds: readonly MenuDockItemId[],
): Promise<{ success: boolean }> {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess) return { success: false }

  const ids = parseDockItemIds(dockItemIds)
  if (ids.length < MIN_MENU_DOCK_ITEMS) return { success: false }

  const user = await requireAuthenticatedUser()
  const supabase = await createClient()

  const { error } = await supabase.from("pop_user_menu_dock_preferences").upsert(
    {
      pop_id: popId,
      user_id: user.uid,
      dock_item_ids: ids,
    },
    { onConflict: "pop_id,user_id" },
  )

  return { success: !error }
}
