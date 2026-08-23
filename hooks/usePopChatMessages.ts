"use client"

import type {
  ChatMessageCursor,
  ChatMessagesPage,
} from "@/app/[siteId]/[popId]/chat/chatTypes"
import { flattenChatMessagePages } from "@/app/[siteId]/[popId]/chat/chatRealtime"
import { popChatMessagesQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { queryChatMessages } from "@/lib/rootsyApi/chatClient"
import { useInfiniteQuery } from "@tanstack/react-query"

export const CHAT_MESSAGE_PAGE_SIZE = 40

export function usePopChatMessages(
  popId: string | undefined,
  channelId: string | null,
  options?: { enabled?: boolean },
) {
  const enabled =
    (options?.enabled ?? true) && Boolean(popId) && Boolean(channelId)

  const query = useInfiniteQuery({
    queryKey: popChatMessagesQueryKey(popId ?? "", channelId ?? ""),
    queryFn: ({ pageParam }: { pageParam: ChatMessageCursor | null }) =>
      queryChatMessages(popId!, channelId!, pageParam, CHAT_MESSAGE_PAGE_SIZE),
    initialPageParam: null as ChatMessageCursor | null,
    getNextPageParam: (lastPage: ChatMessagesPage) => lastPage.nextCursor,
    enabled,
    ...sessionListQueryOptions,
  })

  return {
    ...query,
    messages: flattenChatMessagePages(query.data?.pages),
  }
}
