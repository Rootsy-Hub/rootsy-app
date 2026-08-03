import {
  DEFAULT_MENU_DOCK_IDS,
  isMenuDockItemId,
  resolveMenuDockCatalogItems,
  canUseMenuDockItem,
  type MenuDockItemId,
} from "@/lib/menuCatalog"

export const MAX_MENU_DOCK_ITEMS = 8
export const MIN_MENU_DOCK_ITEMS = 1

const STORAGE_PREFIX = "rootsy:menu-dock:"

function sanitizeIds(
  raw: unknown,
  permissionKeys: readonly string[],
): MenuDockItemId[] {
  if (!Array.isArray(raw)) return []
  const out: MenuDockItemId[] = []
  const seen = new Set<MenuDockItemId>()
  for (const entry of raw) {
    if (!isMenuDockItemId(entry) || seen.has(entry)) continue
    if (!canUseMenuDockItem(entry, permissionKeys)) continue
    seen.add(entry)
    out.push(entry)
    if (out.length >= MAX_MENU_DOCK_ITEMS) break
  }
  return out
}

export function readSavedMenuDockIds(
  popId: string,
): MenuDockItemId[] | undefined {
  if (typeof window === "undefined") return undefined
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${popId}`)
    if (!raw) return undefined
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return undefined
    return parsed.filter(isMenuDockItemId)
  } catch {
    return undefined
  }
}

export function writeSavedMenuDockIds(
  popId: string,
  ids: readonly MenuDockItemId[],
): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(
      `${STORAGE_PREFIX}${popId}`,
      JSON.stringify(ids.slice(0, MAX_MENU_DOCK_ITEMS)),
    )
  } catch {
    /* quota / private mode */
  }
}

export function resolveMenuDockIds(
  popId: string,
  permissionKeys: readonly string[],
): MenuDockItemId[] {
  const saved = readSavedMenuDockIds(popId)
  const candidate = sanitizeIds(saved ?? DEFAULT_MENU_DOCK_IDS, permissionKeys)
  if (candidate.length >= MIN_MENU_DOCK_ITEMS) return candidate
  return sanitizeIds(DEFAULT_MENU_DOCK_IDS, permissionKeys)
}

export function persistMenuDockIds(
  popId: string,
  ids: readonly MenuDockItemId[],
  permissionKeys: readonly string[],
): MenuDockItemId[] {
  const sanitized = sanitizeIds(ids, permissionKeys)
  const next =
    sanitized.length >= MIN_MENU_DOCK_ITEMS
      ? sanitized
      : resolveMenuDockIds(popId, permissionKeys)
  writeSavedMenuDockIds(popId, next)
  return next
}

export function listResolvedMenuDockItems(
  popId: string,
  permissionKeys: readonly string[],
  dockIds?: readonly MenuDockItemId[],
) {
  const ids = dockIds ?? resolveMenuDockIds(popId, permissionKeys)
  return resolveMenuDockCatalogItems(ids, permissionKeys)
}
