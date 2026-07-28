import type { PopWorkspaceBootstrapData } from "@/lib/popWorkspaceBootstrap"

const STORAGE_PREFIX = "rootsy:pop-workspace:v1:"

export type PopWorkspaceCacheEntry = {
  userProfileRev: number
  bootstrap: PopWorkspaceBootstrapData
  cachedAt: number
}

function storageKey(userId: string, siteId: string, popId: string) {
  return `${STORAGE_PREFIX}${userId}:${siteId}:${popId}`
}

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined"
}

export function readPopWorkspaceCache(
  userId: string,
  siteId: string,
  popId: string,
): PopWorkspaceCacheEntry | null {
  if (!canUseSessionStorage()) return null
  try {
    const raw = window.sessionStorage.getItem(storageKey(userId, siteId, popId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as PopWorkspaceCacheEntry
    if (!parsed?.bootstrap?.popId || parsed.bootstrap.popId !== popId) {
      return null
    }
    if (parsed.bootstrap.siteId !== siteId) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function writePopWorkspaceCache(
  userId: string,
  siteId: string,
  popId: string,
  entry: PopWorkspaceCacheEntry,
): void {
  if (!canUseSessionStorage()) return
  try {
    window.sessionStorage.setItem(
      storageKey(userId, siteId, popId),
      JSON.stringify(entry),
    )
  } catch {
    /* quota / private mode */
  }
}

export function clearPopWorkspaceCache(
  userId: string,
  siteId: string,
  popId: string,
): void {
  if (!canUseSessionStorage()) return
  try {
    window.sessionStorage.removeItem(storageKey(userId, siteId, popId))
  } catch {
    /* ignore */
  }
}
