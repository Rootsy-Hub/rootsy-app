import { getBrowserQueryClient } from "@/lib/queryClient"
import { popPrintersQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopPrinters } from "@/lib/rootsyApi/printersClient"
import type { QueryClient } from "@tanstack/react-query"

export function printersListQueryOptions(popId: string) {
  return {
    queryKey: popPrintersQueryKey(popId),
    queryFn: () => fetchPopPrinters(popId),
    ...sessionListQueryOptions,
  }
}

export function prefetchPrintersWorkspaceQuery(
  popId: string,
  queryClient: QueryClient = getBrowserQueryClient(),
) {
  if (!popId) return Promise.resolve()
  return queryClient.prefetchQuery(printersListQueryOptions(popId))
}
