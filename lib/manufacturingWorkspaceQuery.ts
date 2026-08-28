import { computeDataWorkspaceDateBounds } from "@/lib/dataWorkspaceDateFilter"
import { getBrowserQueryClient } from "@/lib/queryClient"
import { popManufacturingQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchManufacturingWorkspace } from "@/lib/rootsyApi/manufacturingClient"
import { keepPreviousData, type QueryClient } from "@tanstack/react-query"

export function manufacturingWorkspaceQueryOptions(
  popId: string,
  from: string | null,
  to: string | null,
) {
  return {
    queryKey: popManufacturingQueryKey(popId, from, to),
    queryFn: async () => {
      const res = await fetchManufacturingWorkspace(popId, { from, to })
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    placeholderData: keepPreviousData,
    ...sessionListQueryOptions,
  }
}

export function prefetchManufacturingWorkspaceQuery(
  popId: string,
  queryClient: QueryClient = getBrowserQueryClient(),
) {
  if (!popId) return Promise.resolve()
  const bounds = computeDataWorkspaceDateBounds("this_month", undefined)
  return queryClient.prefetchQuery(
    manufacturingWorkspaceQueryOptions(popId, bounds.from, bounds.to),
  )
}
