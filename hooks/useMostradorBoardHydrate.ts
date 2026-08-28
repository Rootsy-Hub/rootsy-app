"use client"

import { usePopLocalDb } from "@/hooks/usePopLocalDb"
import { hydratePopMostradorBoardFromNetwork } from "@/lib/popLocalDb/hydrateMostradorBoard"
import {
  popLocalMostradorBoardHydrateQueryKey,
  popMostradorOrdersQueryKey,
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

export function useMostradorBoardHydrate(popId: string | undefined) {
  const queryClient = useQueryClient()
  const localStatus = usePopLocalDb(popId)
  const sqliteReady = localStatus === "ready"
  const fallback = localStatus === "fallback"

  const hydrate = useQuery({
    queryKey: popLocalMostradorBoardHydrateQueryKey(popId ?? ""),
    queryFn: async () => {
      const result = await hydratePopMostradorBoardFromNetwork(popId!)
      if (result.fetched) {
        await queryClient.invalidateQueries({
          queryKey: popMostradorOrdersQueryKey(popId!),
          refetchType: "all",
        })
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
    canReadBoard:
      Boolean(popId) &&
      (fallback || (sqliteReady && (hydrate.isSuccess || hydrate.isError))),
  }
}
