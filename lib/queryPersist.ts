import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { ONE_DAY_MS } from "@/lib/queryStaleTimes"

const STORAGE_KEY = "rootsy-query-cache-v2"

const SESSION_ONLY_ROOTS = new Set(["_user-profile", "_user-pops"])

export function isPersistedHomeQueryKey(queryKey: readonly unknown[]): boolean {
  const root = queryKey[0]
  if (typeof root !== "string" || !root.startsWith("_")) return false
  return !SESSION_ONLY_ROOTS.has(root)
}

export function createRootsQueryPersister() {
  if (typeof window === "undefined") return null
  return createSyncStoragePersister({
    storage: window.localStorage,
    key: STORAGE_KEY,
  })
}

export const rootsQueryPersistMaxAge = ONE_DAY_MS
