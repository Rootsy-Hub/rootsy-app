"use client"

import { usePopLocalDb } from "@/hooks/usePopLocalDb"
import { hydratePopMesasFloorFromNetwork } from "@/lib/popLocalDb/hydrateMesasFloor"
import {
  popLocalMesasFloorHydrateQueryKey,
  popMesasLayoutQueryKey,
  popMesasReservationSettingsQueryKey,
  popMesasReservationsQueryKey,
  popMesasSessionsQueryKey,
} from "@/lib/queryKeys"
import { useQuery, useQueryClient } from "@tanstack/react-query"

const hydrateQueryOptions = {
  staleTime: Number.POSITIVE_INFINITY,
  gcTime: Number.POSITIVE_INFINITY,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: 1,
} as const

export function useMesasFloorHydrate(popId: string | undefined) {
  const queryClient = useQueryClient()
  const localStatus = usePopLocalDb(popId)
  const sqliteReady = localStatus === "ready"
  const fallback = localStatus === "fallback"

  const hydrate = useQuery({
    queryKey: popLocalMesasFloorHydrateQueryKey(popId ?? ""),
    queryFn: async () => {
      const result = await hydratePopMesasFloorFromNetwork(popId!)
      if (result.fetched) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: popMesasLayoutQueryKey(popId!),
            refetchType: "all",
          }),
          queryClient.invalidateQueries({
            queryKey: popMesasSessionsQueryKey(popId!),
            refetchType: "all",
          }),
          queryClient.invalidateQueries({
            queryKey: popMesasReservationsQueryKey(popId!),
            refetchType: "all",
          }),
          queryClient.invalidateQueries({
            queryKey: popMesasReservationSettingsQueryKey(popId!),
            refetchType: "all",
          }),
        ])
      }
      return true
    },
    enabled: Boolean(popId) && sqliteReady,
    ...hydrateQueryOptions,
  })

  return {
    localStatus,
    sqliteReady,
    fallback,
    hydrate,
    canReadFloor:
      Boolean(popId) &&
      (fallback || (sqliteReady && (hydrate.isSuccess || hydrate.isError))),
  }
}
