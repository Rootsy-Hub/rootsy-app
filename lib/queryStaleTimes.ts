/** 24 horas — cache de lectura para datos que cambian poco. */
export const ONE_DAY_MS = 24 * 60 * 60 * 1000

export const oneDayQueryOptions = {
  staleTime: ONE_DAY_MS,
  gcTime: ONE_DAY_MS,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const
