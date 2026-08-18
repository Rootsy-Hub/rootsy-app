"use client"

import { getPopCacheRevisions } from "@/lib/popCacheRevisions"
import { popCatalogRevQueryKey } from "@/lib/queryKeys"
import { catalogRevQueryOptions } from "@/lib/queryStaleTimes"
import { useQuery } from "@tanstack/react-query"

export function usePopCatalogRev(
  popId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: popCatalogRevQueryKey(popId ?? ""),
    queryFn: async () => {
      const res = await getPopCacheRevisions(popId!)
      if (!res.success) {
        throw new Error(res.error)
      }
      return res.revisions.catalogRev
    },
    enabled: enabled && Boolean(popId),
    ...catalogRevQueryOptions,
  })
}
