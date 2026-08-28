export type QuerySpecCall = {
  endpoint: string
  detail: string
  cache: string
}

export type QuerySpecMoment = {
  title: string
  calls: QuerySpecCall[]
}

export type QuerySpecDomain = {
  domain: string
  moments: QuerySpecMoment[]
}

export type QuerySpecPlace = {
  place: string
  domains: QuerySpecDomain[]
}

export const CACHE_TANSTACK_24H = "TanStack · 24 h"
export const CACHE_TANSTACK_24H_REFETCH_MOUNT =
  "TanStack · 24 h · refetch al montar"
export const CACHE_TANSTACK_SESSION = "TanStack · sesión · staleTime ∞"
export const CACHE_SQLITE_OPFS = "SQLite · OPFS · por pop"
export const CACHE_WS_DO = "WebSocket · Durable Object"
export const CACHE_NONE = "No"

export function querySpecIsComplete(spec: readonly QuerySpecPlace[]): boolean {
  return (
    spec.length > 0 &&
    spec.every(
      (place) =>
        place.domains.length > 0 &&
        place.domains.every((domain) =>
          domain.moments.every(
            (moment) =>
              moment.calls.length > 0 &&
              moment.calls.every((call) => Boolean(call.cache)),
          ),
        ),
    )
  )
}
