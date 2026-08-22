const LEGACY_STORAGE_KEYS = [
  "rootsy-query-cache-v1",
  "rootsy-query-cache-v2",
] as const

/** Limpia el persist de 24 h. Home, menú y access viven solo en memoria de sesión. */
export function clearLegacyQueryPersist() {
  if (typeof window === "undefined") return
  for (const key of LEGACY_STORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key)
    } catch {
      /* quota / private mode */
    }
  }
}
