import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister"
import { defaultShouldDehydrateQuery } from "@tanstack/react-query"
import type { Persister } from "@tanstack/query-persist-client-core"
import type { Query } from "@tanstack/react-query"

const LEGACY_STORAGE_KEYS = [
  "rootsy-query-cache-v1",
  "rootsy-query-cache-v2",
] as const

export const SALE_BOARD_PERSIST_KEY = "rootsy-query-cache-sale-board-v1"
export const SALE_BOARD_PERSIST_BUSTER = "sale-board-idb-v1"

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

const noopPersister: Persister = {
  persistClient: async () => {},
  restoreClient: async () => undefined,
  removeClient: async () => {},
}

/** Solo categorías del tablero y artículos por categoría (sin búsqueda). */
export function isSaleBoardPersistedQueryKey(
  queryKey: readonly unknown[],
): boolean {
  const [domain, , board, , search] = queryKey
  if (domain === "categories" && board === "sale-board") return true
  if (domain === "articles" && board === "sale-board") {
    return search === "" || search == null
  }
  return false
}

export function shouldDehydrateSaleBoardQuery(query: Query): boolean {
  return (
    defaultShouldDehydrateQuery(query) &&
    isSaleBoardPersistedQueryKey(query.queryKey)
  )
}

export function createSaleBoardPersister(): Persister {
  if (typeof window === "undefined") return noopPersister
  return createAsyncStoragePersister({
    key: SALE_BOARD_PERSIST_KEY,
    storage: {
      getItem: async (key) => {
        const { get } = await import("idb-keyval")
        const value = await get(key)
        return typeof value === "string" ? value : null
      },
      setItem: async (key, value) => {
        const { set } = await import("idb-keyval")
        await set(key, value)
      },
      removeItem: async (key) => {
        const { del } = await import("idb-keyval")
        await del(key)
      },
    },
  })
}
