"use client"

import type { ChatChannelDetailData } from "@/app/[siteId]/[popId]/chat/chatTypes"
import { popChatChannelQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { queryChatChannel } from "@/lib/rootsyApi/chatClient"
import { useQuery } from "@tanstack/react-query"

export function usePopChatChannel(
  popId: string | undefined,
  channelId: string | null,
  options?: { enabled?: boolean },
) {
  const enabled =
    (options?.enabled ?? true) && Boolean(popId) && Boolean(channelId)

  return useQuery<ChatChannelDetailData>({
    queryKey: popChatChannelQueryKey(popId ?? "", channelId ?? ""),
    queryFn: () => queryChatChannel(popId!, channelId!),
    enabled,
    ...sessionListQueryOptions,
  })
}
