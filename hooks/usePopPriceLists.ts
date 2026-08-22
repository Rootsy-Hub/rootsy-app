"use client"

import { popPriceListsQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopPriceLists } from "@/lib/rootsyApi/priceListsClient"
import { useQuery } from "@tanstack/react-query"

type UsePopPriceListsOptions = {
  enabled?: boolean
}

export function usePopPriceLists(
  popId: string | undefined,
  options?: UsePopPriceListsOptions,
) {
  return useQuery({
    queryKey: popPriceListsQueryKey(popId ?? ""),
    queryFn: () => fetchPopPriceLists(popId!),
    enabled: Boolean(popId) && (options?.enabled ?? true),
    ...sessionListQueryOptions,
  })
}
