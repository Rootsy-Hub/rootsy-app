"use client"

import { popComandaStationsQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopComandaStations } from "@/lib/rootsyApi/comandaStationsClient"
import { useQuery } from "@tanstack/react-query"

type UsePopComandaStationsOptions = {
  enabled?: boolean
}

export function usePopComandaStations(
  popId: string | undefined,
  options?: UsePopComandaStationsOptions,
) {
  return useQuery({
    queryKey: popComandaStationsQueryKey(popId ?? ""),
    queryFn: () => fetchPopComandaStations(popId!),
    enabled: Boolean(popId) && (options?.enabled ?? true),
    ...sessionListQueryOptions,
  })
}
