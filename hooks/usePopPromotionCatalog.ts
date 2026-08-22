"use client"

import { popPromotionCatalogQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPromotionCatalogOptions } from "@/lib/rootsyApi/promotionsClient"
import { useQuery } from "@tanstack/react-query"

type UsePopPromotionCatalogOptions = {
  enabled?: boolean
}

export function usePopPromotionCatalog(
  popId: string | undefined,
  options?: UsePopPromotionCatalogOptions,
) {
  return useQuery({
    queryKey: popPromotionCatalogQueryKey(popId ?? ""),
    queryFn: () => fetchPromotionCatalogOptions(popId!),
    enabled: Boolean(popId) && (options?.enabled ?? true),
    ...sessionListQueryOptions,
  })
}
