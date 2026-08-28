import { getBrowserQueryClient } from "@/lib/queryClient"
import { popChatWorkspaceQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { queryChatWorkspace } from "@/lib/rootsyApi/chatClient"
import type { QueryClient } from "@tanstack/react-query"

export function chatWorkspaceQueryOptions(popId: string) {
  return {
    queryKey: popChatWorkspaceQueryKey(popId),
    queryFn: () => queryChatWorkspace(popId),
    ...sessionListQueryOptions,
  }
}

export function prefetchChatWorkspaceQuery(
  popId: string,
  queryClient: QueryClient = getBrowserQueryClient(),
) {
  if (!popId) return Promise.resolve()
  return queryClient.prefetchQuery(chatWorkspaceQueryOptions(popId))
}
