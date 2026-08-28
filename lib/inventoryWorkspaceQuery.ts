import { getBrowserQueryClient } from "@/lib/queryClient"
import { popInventorySummaryQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopInventorySummary } from "@/lib/rootsyApi/inventoryClient"
import type { QueryClient } from "@tanstack/react-query"

export function inventorySummaryQueryOptions(popId: string) {
  return {
    queryKey: popInventorySummaryQueryKey(popId),
    queryFn: () => fetchPopInventorySummary(popId),
    ...sessionListQueryOptions,
  }
}

export function prefetchInventoryWorkspaceQuery(
  popId: string,
  queryClient: QueryClient = getBrowserQueryClient(),
) {
  if (!popId) return Promise.resolve()
  return queryClient.prefetchQuery(inventorySummaryQueryOptions(popId))
}
