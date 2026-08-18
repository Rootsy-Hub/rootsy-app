import type { PopAccessModule } from "@/app/home/homeUserDataTypes"
import {
  DEFAULT_MENU_DOCK_IDS,
  isMenuDockItemId,
  resolveMenuDockCatalogItems,
  resolveMenuDockCatalogItemsDisplay,
  canUseMenuDockItemFromPopAccess,
  type MenuDockItemId,
} from "@/lib/menuCatalog"
import { ONE_DAY_MS } from "@/lib/queryStaleTimes"

export const MAX_MENU_DOCK_ITEMS = 8
export const MIN_MENU_DOCK_ITEMS = 1

const CACHE_PREFIX = "rootsy:menu-dock-cache:"
/** @deprecated Formato previo sin TTL — solo migración. */
const LEGACY_STORAGE_PREFIX = "rootsy:menu-dock:"

type MenuDockCacheEntry = {
  ids: MenuDockItemId[]
  savedAt: number
}

export function sanitizeMenuDockIds(
  raw: unknown,
  enabledModules: readonly PopAccessModule[],
): MenuDockItemId[] {
  if (!Array.isArray(raw)) return []
  const out: MenuDockItemId[] = []
  const seen = new Set<MenuDockItemId>()
  for (const entry of raw) {
    if (!isMenuDockItemId(entry) || seen.has(entry)) continue
    if (!canUseMenuDockItemFromPopAccess(entry, enabledModules)) continue
    seen.add(entry)
    out.push(entry)
    if (out.length >= MAX_MENU_DOCK_ITEMS) break
  }
  return out
}

function readLegacyMenuDockIds(popId: string): MenuDockItemId[] | undefined {
  if (typeof window === "undefined") return undefined
  try {
    const raw = window.localStorage.getItem(`${LEGACY_STORAGE_PREFIX}${popId}`)
    if (!raw) return undefined
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return undefined
    return parsed.filter(isMenuDockItemId)
  } catch {
    return undefined
  }
}

function clearLegacyMenuDockIds(popId: string): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(`${LEGACY_STORAGE_PREFIX}${popId}`)
  } catch {
    /* quota / private mode */
  }
}

/** Lee preferencia cacheada (24 h). Migración automática desde formato legacy. */
export function readCachedMenuDockIds(
  popId: string,
): MenuDockItemId[] | undefined {
  if (typeof window === "undefined") return undefined

  try {
    const raw = window.localStorage.getItem(`${CACHE_PREFIX}${popId}`)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (
        parsed &&
        typeof parsed === "object" &&
        "ids" in parsed &&
        "savedAt" in parsed
      ) {
        const entry = parsed as MenuDockCacheEntry
        if (
          Array.isArray(entry.ids) &&
          typeof entry.savedAt === "number" &&
          Date.now() - entry.savedAt < ONE_DAY_MS
        ) {
          const ids = entry.ids.filter(isMenuDockItemId)
          if (ids.length > 0) return ids
        }
      }
    }
  } catch {
    /* parse / quota */
  }

  const legacy = readLegacyMenuDockIds(popId)
  if (legacy?.length) {
    writeCachedMenuDockIds(popId, legacy)
    clearLegacyMenuDockIds(popId)
    return legacy
  }

  return undefined
}

export function writeCachedMenuDockIds(
  popId: string,
  ids: readonly MenuDockItemId[],
): void {
  if (typeof window === "undefined") return
  const sanitized = ids.filter(isMenuDockItemId)
  if (sanitized.length === 0) return

  try {
    const entry: MenuDockCacheEntry = {
      ids: sanitized,
      savedAt: Date.now(),
    }
    window.localStorage.setItem(
      `${CACHE_PREFIX}${popId}`,
      JSON.stringify(entry),
    )
  } catch {
    /* quota / private mode */
  }
}

export function resolveMenuDockIds(
  popId: string,
  enabledModules: readonly PopAccessModule[],
  saved?: readonly MenuDockItemId[] | null,
): MenuDockItemId[] {
  const candidate = sanitizeMenuDockIds(
    saved ?? readCachedMenuDockIds(popId) ?? DEFAULT_MENU_DOCK_IDS,
    enabledModules,
  )
  if (candidate.length >= MIN_MENU_DOCK_ITEMS) return candidate
  return sanitizeMenuDockIds(DEFAULT_MENU_DOCK_IDS, enabledModules)
}

export function persistMenuDockIds(
  popId: string,
  ids: readonly MenuDockItemId[],
  enabledModules: readonly PopAccessModule[],
): MenuDockItemId[] {
  const sanitized = sanitizeMenuDockIds(ids, enabledModules)
  const next =
    sanitized.length >= MIN_MENU_DOCK_ITEMS
      ? sanitized
      : resolveMenuDockIds(popId, enabledModules)
  writeCachedMenuDockIds(popId, next)
  return next
}

export function listResolvedMenuDockItems(
  popId: string,
  enabledModules: readonly PopAccessModule[],
  dockIds?: readonly MenuDockItemId[],
) {
  const ids = dockIds ?? resolveMenuDockIds(popId, enabledModules)
  if (enabledModules.length === 0) {
    return resolveMenuDockCatalogItemsDisplay(ids)
  }
  return resolveMenuDockCatalogItems(ids, enabledModules)
}

export function hasCachedMenuDockIds(popId: string): boolean {
  return (readCachedMenuDockIds(popId)?.length ?? 0) > 0
}

export function readInitialMenuDockIds(popId: string): MenuDockItemId[] {
  const cached = readCachedMenuDockIds(popId)
  if (cached?.length) {
    return cached.filter(isMenuDockItemId)
  }
  return [...DEFAULT_MENU_DOCK_IDS]
}
