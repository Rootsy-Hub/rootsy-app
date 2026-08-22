import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { ONE_DAY_MS } from "@/lib/queryStaleTimes"

const STORAGE_KEY = "rootsy-query-cache-v2"

export function isPersistedHomeQueryKey(queryKey: readonly unknown[]): boolean {
  const root = queryKey[0]
  return typeof root === "string" && root.startsWith("_")
}

export function createRootsQueryPersister() {
  if (typeof window === "undefined") return null
  return createSyncStoragePersister({
    storage: window.localStorage,
    key: STORAGE_KEY,
  })
}

export const rootsQueryPersistMaxAge = ONE_DAY_MS
