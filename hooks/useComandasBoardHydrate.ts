"use client"

import { usePopLocalDb } from "@/hooks/usePopLocalDb"
import { hydratePopComandasBoardFromNetwork } from "@/lib/popLocalDb/hydrateComandasBoard"
import {
  popComandasTicketsQueryRoot,
  popLocalComandasBoardHydrateQueryKey,
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

export function useComandasBoardHydrate(popId: string | undefined) {
  const queryClient = useQueryClient()
  const localStatus = usePopLocalDb(popId)
  const sqliteReady = localStatus === "ready"
  const fallback = localStatus === "fallback"

  const hydrate = useQuery({
    queryKey: popLocalComandasBoardHydrateQueryKey(popId ?? ""),
    queryFn: async () => {
      const result = await hydratePopComandasBoardFromNetwork(popId!)
      if (result.fetched) {
        await queryClient.invalidateQueries({
          queryKey: popComandasTicketsQueryRoot(popId!),
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
