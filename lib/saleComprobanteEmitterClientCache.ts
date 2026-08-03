import type { SaleComprobanteEmitterContext } from "@/lib/saleComprobantePreview"

const STORAGE_PREFIX = "rootsy:sale-comprobante-emitter:v1:"

export type SaleComprobanteEmitterCacheEntry = {
  emitter: SaleComprobanteEmitterContext
  popSettingsRev: number
  cachedAt: number
}

const memoryCache = new Map<string, SaleComprobanteEmitterCacheEntry>()

function cacheKey(popId: string, cashRegisterId?: string | null): string {
  const register = cashRegisterId?.trim() || ""
  return `${popId}:${register}`
}

function canUseSessionStorage(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.sessionStorage !== "undefined"
  )
}

function readSessionEntry(
  key: string,
): SaleComprobanteEmitterCacheEntry | null {
  if (!canUseSessionStorage()) return null
  try {
    const raw = window.sessionStorage.getItem(`${STORAGE_PREFIX}${key}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SaleComprobanteEmitterCacheEntry
    if (!parsed?.emitter) return null
    return parsed
  } catch {
    return null
  }
}

function writeSessionEntry(
  key: string,
  entry: SaleComprobanteEmitterCacheEntry,
): void {
  if (!canUseSessionStorage()) return
  try {
    window.sessionStorage.setItem(
      `${STORAGE_PREFIX}${key}`,
      JSON.stringify(entry),
    )
  } catch {
    /* quota / private mode */
  }
}

export function readSaleComprobanteEmitterCache(
  popId: string,
  cashRegisterId: string | null | undefined,
  popSettingsRev: number | null | undefined,
): SaleComprobanteEmitterContext | null {
  if (!popId) return null
  const key = cacheKey(popId, cashRegisterId)
  const rev = popSettingsRev ?? null

  const fromMemory = memoryCache.get(key)
  if (fromMemory && (rev == null || fromMemory.popSettingsRev === rev)) {
    return fromMemory.emitter
  }

  const fromSession = readSessionEntry(key)
  if (fromSession && (rev == null || fromSession.popSettingsRev === rev)) {
    memoryCache.set(key, fromSession)
    return fromSession.emitter
  }

  return null
}

export function writeSaleComprobanteEmitterCache(
  popId: string,
  cashRegisterId: string | null | undefined,
  popSettingsRev: number,
  emitter: SaleComprobanteEmitterContext,
): void {
  if (!popId) return
  const key = cacheKey(popId, cashRegisterId)
  const entry: SaleComprobanteEmitterCacheEntry = {
    emitter,
    popSettingsRev,
    cachedAt: Date.now(),
  }
  memoryCache.set(key, entry)
  writeSessionEntry(key, entry)
}

export function clearSaleComprobanteEmitterCache(popId?: string): void {
  if (popId) {
    const prefix = `${popId}:`
    for (const key of memoryCache.keys()) {
      if (key.startsWith(prefix)) memoryCache.delete(key)
    }
    if (canUseSessionStorage()) {
      try {
        const keysToRemove: string[] = []
        for (let i = 0; i < window.sessionStorage.length; i++) {
          const storageKey = window.sessionStorage.key(i)
          if (
            storageKey?.startsWith(STORAGE_PREFIX) &&
            storageKey.slice(STORAGE_PREFIX.length).startsWith(prefix)
          ) {
            keysToRemove.push(storageKey)
          }
        }
        for (const storageKey of keysToRemove) {
          window.sessionStorage.removeItem(storageKey)
        }
      } catch {
        /* ignore */
      }
    }
    return
  }

  memoryCache.clear()
  if (!canUseSessionStorage()) return
  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const storageKey = window.sessionStorage.key(i)
      if (storageKey?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(storageKey)
      }
    }
    for (const storageKey of keysToRemove) {
      window.sessionStorage.removeItem(storageKey)
    }
  } catch {
    /* ignore */
  }
}
