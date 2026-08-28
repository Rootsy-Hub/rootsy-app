import { getBrowserQueryClient } from "@/lib/queryClient"
import { popSettingsQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopSettings } from "@/lib/rootsyApi/settingsClient"
import type { QueryClient } from "@tanstack/react-query"

export function settingsQueryOptions(popId: string) {
  return {
    queryKey: popSettingsQueryKey(popId),
    queryFn: () => fetchPopSettings(popId),
    ...sessionListQueryOptions,
  }
}

export function prefetchSettingsWorkspaceQuery(
  popId: string,
  queryClient: QueryClient = getBrowserQueryClient(),
) {
  if (!popId) return Promise.resolve()
  return queryClient.prefetchQuery(settingsQueryOptions(popId))
}
