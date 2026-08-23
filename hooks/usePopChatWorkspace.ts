"use client"

import type { ChatWorkspaceData } from "@/app/[siteId]/[popId]/chat/chatTypes"
import { popChatWorkspaceQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { queryChatWorkspace } from "@/lib/rootsyApi/chatClient"
import { useQuery } from "@tanstack/react-query"

export function usePopChatWorkspace(
  popId: string | undefined,
  options?: { enabled?: boolean },
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)

  return useQuery<ChatWorkspaceData>({
    queryKey: popChatWorkspaceQueryKey(popId ?? ""),
    queryFn: () => queryChatWorkspace(popId!),
    enabled,
    ...sessionListQueryOptions,
  })
}
