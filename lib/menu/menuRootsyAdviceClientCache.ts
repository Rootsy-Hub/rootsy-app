import type { PopAccessCache } from "@/app/home/homeUserDataTypes"
import type { MenuRootsyAdvice } from "@/lib/menu/menuRootsyTypes"
import { isMetaGenericVoice } from "@/lib/menu/menuRootsyVoice"
import { ONE_DAY_MS } from "@/lib/queryStaleTimes"

const CACHE_PREFIX = "rootsy:menu-rootsy-advice:"

type MenuRootsyAdviceCacheEntry = {
  advice: MenuRootsyAdvice
  savedAt: number
}

function roleCacheKey(popAccess: PopAccessCache): string {
  if (popAccess.isOwner) return "owner"
  const name =
    popAccess.role?.displayName?.trim() ||
    popAccess.role?.name?.trim() ||
    "member"
  return name.toLowerCase().replace(/\s+/g, "-")
}

function storageKey(popId: string, popAccess: PopAccessCache): string {
  const dateBucket = new Date().toISOString().slice(0, 10)
  return `${CACHE_PREFIX}${popId}:${roleCacheKey(popAccess)}:${dateBucket}`
}

function isValidAdvice(advice: MenuRootsyAdvice | null | undefined): advice is MenuRootsyAdvice {
  return Boolean(advice?.lead?.trim()) && !isMetaGenericVoice(advice.lead)
}

/** Consejo cacheado del día — localStorage, TTL 24 h. */
export function readCachedMenuRootsyAdvice(
  popId: string,
  popAccess: PopAccessCache,
): MenuRootsyAdvice | null {
  if (typeof window === "undefined") return null

  try {
    const raw = window.localStorage.getItem(storageKey(popId, popAccess))
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("advice" in parsed) ||
      !("savedAt" in parsed)
    ) {
      return null
    }

    const entry = parsed as MenuRootsyAdviceCacheEntry
    if (typeof entry.savedAt !== "number") return null
    if (Date.now() - entry.savedAt > ONE_DAY_MS) return null
    if (!isValidAdvice(entry.advice)) return null

    return entry.advice
  } catch {
    return null
  }
}

export function writeCachedMenuRootsyAdvice(
  popId: string,
  popAccess: PopAccessCache,
  advice: MenuRootsyAdvice,
): void {
  if (typeof window === "undefined") return
  if (!isValidAdvice(advice)) return

  try {
    const entry: MenuRootsyAdviceCacheEntry = {
      advice,
      savedAt: Date.now(),
    }
    window.localStorage.setItem(
      storageKey(popId, popAccess),
      JSON.stringify(entry),
    )
  } catch {
    /* quota / private mode */
  }
}
