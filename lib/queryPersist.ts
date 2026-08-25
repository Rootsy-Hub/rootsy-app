const LEGACY_STORAGE_KEYS = [
  "rootsy-query-cache-v1",
  "rootsy-query-cache-v2",
] as const

const LEGACY_IDB_NAMES = ["keyval-store"] as const

/** Limpia el persist de TanStack/IndexedDB. El catálogo de operar vive en SQLite. */
export function clearLegacyQueryPersist() {
  if (typeof window === "undefined") return
  for (const key of LEGACY_STORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key)
    } catch {
      /* quota / private mode */
    }
  }
  if (typeof indexedDB === "undefined") return
  for (const name of LEGACY_IDB_NAMES) {
    try {
      indexedDB.deleteDatabase(name)
    } catch {
      /* private mode */
    }
  }
}
