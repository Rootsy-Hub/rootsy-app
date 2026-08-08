import type { PopCacheRevisions } from "@/lib/popCacheRevisions"

export type PopBootstrapRefreshKind = "none" | "catalog_only" | "full"

export function popCacheRevisionsEqual(
  a: PopCacheRevisions,
  b: PopCacheRevisions,
): boolean {
  return (
    a.permissionsRev === b.permissionsRev &&
    a.catalogRev === b.catalogRev &&
    a.popSettingsRev === b.popSettingsRev
  )
}

/** Qué tan agresivo debe ser el refetch del bootstrap según revisiones + perfil. */
export function resolvePopBootstrapRefreshKind(
  cachedRevisions: PopCacheRevisions,
  liveRevisions: PopCacheRevisions,
  cachedUserProfileRev: number,
  liveUserProfileRev: number,
): PopBootstrapRefreshKind {
  if (cachedUserProfileRev !== liveUserProfileRev) {
    return "full"
  }
  if (cachedRevisions.permissionsRev !== liveRevisions.permissionsRev) {
    return "full"
  }
  if (cachedRevisions.popSettingsRev !== liveRevisions.popSettingsRev) {
    return "full"
  }
  if (cachedRevisions.catalogRev !== liveRevisions.catalogRev) {
    return "catalog_only"
  }
  return "none"
}
