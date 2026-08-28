import { openCashSessionQueryOptions } from "@/hooks/useOpenCashSession"
import { ensurePopLocalDbStatus } from "@/hooks/usePopLocalDb"
import {
  menuCatalogQueryOptions,
  prefetchOperateCatalogLocal,
} from "@/lib/mostradorWorkspaceQuery"
import {
  hydratePopMesasFloorFromNetwork,
  readMesasLayoutLocalOrFetch,
  readMesasReservationsLocalOrFetch,
  readMesasReservationSettingsLocalOrFetch,
  readMesasSessionsLocalOrFetch,
} from "@/lib/popLocalDb/hydrateMesasFloor"
import { getBrowserQueryClient } from "@/lib/queryClient"
import {
  popLocalMesasFloorHydrateQueryKey,
  popMesasLayoutQueryKey,
  popMesasReservationSettingsQueryKey,
  popMesasReservationsQueryKey,
  popMesasSessionsQueryKey,
  popMesasWaitersQueryKey,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchMesasWaiters } from "@/lib/rootsyApi/mesasClient"
import {
  saleComprobantesQueryOptions,
  salePaymentContextQueryOptions,
} from "@/lib/saleWorkspaceQuery"
import type { QueryClient } from "@tanstack/react-query"

const localHydrateQueryOptions = {
  staleTime: Number.POSITIVE_INFINITY,
  gcTime: Number.POSITIVE_INFINITY,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: 1,
} as const

export function mesasLayoutQueryOptions(popId: string) {
  return {
    queryKey: popMesasLayoutQueryKey(popId),
    queryFn: () => readMesasLayoutLocalOrFetch(popId),
    ...sessionListQueryOptions,
  }
}

export function mesasSessionsQueryOptions(popId: string) {
  return {
    queryKey: popMesasSessionsQueryKey(popId),
    queryFn: () => readMesasSessionsLocalOrFetch(popId),
    ...sessionListQueryOptions,
  }
}

export function mesasReservationsQueryOptions(popId: string) {
  return {
    queryKey: popMesasReservationsQueryKey(popId),
    queryFn: () => readMesasReservationsLocalOrFetch(popId),
    ...sessionListQueryOptions,
  }
}

export function mesasReservationSettingsQueryOptions(popId: string) {
  return {
    queryKey: popMesasReservationSettingsQueryKey(popId),
    queryFn: () => readMesasReservationSettingsLocalOrFetch(popId),
    ...sessionListQueryOptions,
  }
}

export function mesasWaitersQueryOptions(popId: string) {
  return {
    queryKey: popMesasWaitersQueryKey(popId),
    queryFn: async () => {
      const res = await fetchMesasWaiters(popId)
      if (!res.success) throw new Error(res.error)
      return res.waiters
    },
    ...sessionListQueryOptions,
  }
}

async function prefetchMesasFloor(popId: string, queryClient: QueryClient) {
  const status = await ensurePopLocalDbStatus(popId)
  if (status === "ready") {
    await queryClient.prefetchQuery({
      queryKey: popLocalMesasFloorHydrateQueryKey(popId),
      queryFn: async () => {
        const result = await hydratePopMesasFloorFromNetwork(popId)
        if (result.fetched) {
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: popMesasLayoutQueryKey(popId),
              refetchType: "all",
            }),
            queryClient.invalidateQueries({
              queryKey: popMesasSessionsQueryKey(popId),
              refetchType: "all",
            }),
            queryClient.invalidateQueries({
              queryKey: popMesasReservationsQueryKey(popId),
              refetchType: "all",
            }),
            queryClient.invalidateQueries({
              queryKey: popMesasReservationSettingsQueryKey(popId),
              refetchType: "all",
            }),
          ])
        }
        return true
      },
      ...localHydrateQueryOptions,
    })
  }
  await Promise.all([
    queryClient.prefetchQuery(mesasLayoutQueryOptions(popId)),
    queryClient.prefetchQuery(mesasSessionsQueryOptions(popId)),
    queryClient.prefetchQuery(mesasReservationsQueryOptions(popId)),
    queryClient.prefetchQuery(mesasReservationSettingsQueryOptions(popId)),
    queryClient.prefetchQuery(mesasWaitersQueryOptions(popId)),
  ])
}

export function prefetchMesasWorkspaceQuery(
  popId: string,
  queryClient: QueryClient = getBrowserQueryClient(),
) {
  if (!popId) return Promise.resolve()
  return Promise.all([
    prefetchMesasFloor(popId, queryClient),
    queryClient.prefetchQuery(openCashSessionQueryOptions(popId)),
    queryClient.prefetchQuery(menuCatalogQueryOptions(popId)),
    queryClient.prefetchQuery(salePaymentContextQueryOptions(popId)),
    queryClient.prefetchQuery(saleComprobantesQueryOptions(popId)),
  ]).then(() => {
    void prefetchOperateCatalogLocal(popId, queryClient).catch(() => undefined)
  })
}
