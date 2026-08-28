/** 24 horas — cache de lectura para datos que cambian poco. */
export const ONE_DAY_MS = 24 * 60 * 60 * 1000

export const DEFAULT_QUERY_STALE_MS = 30 * 1000
export const DEFAULT_QUERY_GC_MS = 10 * 60 * 1000

/** Default de Query: cache corto, sin refetch al foco ni al remount. */
export const defaultQueryOptions = {
  staleTime: DEFAULT_QUERY_STALE_MS,
  gcTime: DEFAULT_QUERY_GC_MS,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
} as const

/** Listados de workspace: cache en sesión; refetch solo en F5 o invalidación explícita. */
export const sessionListQueryOptions = {
  staleTime: Number.POSITIVE_INFINITY,
  gcTime: ONE_DAY_MS,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const

/**
 * Catálogos de operar (Vender / Mostrador / Mesas / Compras).
 * Cache de sesión; al volver a la pantalla refetch si se invalidaron
 * (p. ej. al ocultar o reordenar categorías en Artículos).
 */
export const operateCatalogQueryOptions = {
  ...sessionListQueryOptions,
  refetchOnMount: true,
} as const

/**
 * Turno de caja del usuario en operar (Vender / Mostrador / Mesas).
 * 24 h; refetch solo al invalidar (p. ej. cobro rechazado), no al reentrar.
 */
export const operateOpenSessionQueryOptions = {
  staleTime: ONE_DAY_MS,
  gcTime: ONE_DAY_MS,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const
