import { ensurePopLocalDbStatus } from "@/hooks/usePopLocalDb"
import {
  hydratePopComandasBoardFromNetwork,
  readComandasTicketsLocalOrFetch,
} from "@/lib/popLocalDb/hydrateComandasBoard"
import { getBrowserQueryClient } from "@/lib/queryClient"
import {
  popComandasStationsQueryKey,
  popComandasTicketsQueryKey,
  popComandasTicketsQueryRoot,
  popLocalComandasBoardHydrateQueryKey,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchComandaStations } from "@/lib/rootsyApi/comandasClient"
import type { QueryClient } from "@tanstack/react-query"
import type { ComandaTicket } from "@/app/[siteId]/[popId]/comandas/comandasTypes"

const localHydrateQueryOptions = {
  staleTime: Number.POSITIVE_INFINITY,
  gcTime: Number.POSITIVE_INFINITY,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: 1,
} as const

export function comandasStationsQueryOptions(popId: string) {
  return {
    queryKey: popComandasStationsQueryKey(popId),
    queryFn: async () => {
      const res = await fetchComandaStations(popId)
      if (!res.success) throw new Error(res.error)
      return res.stations
    },
    ...sessionListQueryOptions,
  }
}

export function comandasTicketsQueryOptions(popId: string, stationId: string) {
  return {
    queryKey: popComandasTicketsQueryKey(popId, stationId),
    queryFn: async (): Promise<ComandaTicket[]> => {
      if (!stationId) return []
      return readComandasTicketsLocalOrFetch(popId, stationId)
    },
    ...sessionListQueryOptions,
  }
}

async function prefetchComandasBoard(popId: string, queryClient: QueryClient) {
  const status = await ensurePopLocalDbStatus(popId)
  if (status === "ready") {
    await queryClient.prefetchQuery({
      queryKey: popLocalComandasBoardHydrateQueryKey(popId),
      queryFn: async () => {
        const result = await hydratePopComandasBoardFromNetwork(popId)
        if (result.fetched) {
          await queryClient.invalidateQueries({
            queryKey: popComandasTicketsQueryRoot(popId),
            refetchType: "all",
          })
        }
        return true
      },
      ...localHydrateQueryOptions,
    })
  }
  const stations = await queryClient.ensureQueryData(
    comandasStationsQueryOptions(popId),
  )
  const firstStationId = stations[0]?.id
  if (!firstStationId) return
  await queryClient.prefetchQuery(
    comandasTicketsQueryOptions(popId, firstStationId),
  )
}

export function prefetchComandasWorkspaceQuery(
  popId: string,
  queryClient: QueryClient = getBrowserQueryClient(),
) {
  if (!popId) return Promise.resolve()
  return prefetchComandasBoard(popId, queryClient).catch(() => undefined)
}
