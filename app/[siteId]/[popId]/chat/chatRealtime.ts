import type {
  ChatChannelListItem,
  ChatMessageRow,
  ChatMessagesPage,
  ChatWorkspaceData,
} from "@/app/[siteId]/[popId]/chat/chatTypes"
import {
  popChatChannelQueryKey,
  popChatMessagesQueryKey,
  popChatQueryRoot,
  popChatWorkspaceQueryKey,
} from "@/lib/queryKeys"
import type { DomainEvent } from "@/lib/realtime/protocol"
import type { InfiniteData, QueryClient } from "@tanstack/react-query"

export function flattenChatMessagePages(
  pages: ChatMessagesPage[] | undefined,
): ChatMessageRow[] {
  if (!pages?.length) return []
  return pages.slice().reverse().flatMap((page) => page.messages)
}

export function chatChannelIdFromEvent(event: DomainEvent): string | null {
  const fromPayload = event.payload.channelId
  if (typeof fromPayload === "string" && fromPayload.trim()) {
    return fromPayload.trim()
  }
  if (event.resource?.type === "chat" && event.resource.id) {
    return event.resource.id
  }
  return null
}

export function chatMessageFromEvent(
  event: DomainEvent,
  currentUserId: string,
): ChatMessageRow | null {
  const raw = event.payload.message
  if (!raw || typeof raw !== "object") return null
  const row = raw as Record<string, unknown>
  const id = typeof row.id === "string" ? row.id : ""
  const authorUserId = typeof row.authorUserId === "string" ? row.authorUserId : ""
  const authorName = typeof row.authorName === "string" ? row.authorName : ""
  const authorImageUrl =
    typeof row.authorImageUrl === "string" && row.authorImageUrl.trim()
      ? row.authorImageUrl.trim()
      : null
  const body = typeof row.body === "string" ? row.body : ""
  const createdAt = typeof row.createdAt === "string" ? row.createdAt : ""
  if (!id || !authorUserId || !body || !createdAt) return null
  return {
    id,
    authorUserId,
    authorName,
    authorImageUrl,
    body,
    createdAt,
    mine: sameChatUserId(authorUserId, currentUserId),
  }
}

const OPTIMISTIC_PREFIX = "optimistic:"

export function isOptimisticChatId(id: string): boolean {
  return id.startsWith(OPTIMISTIC_PREFIX)
}

export function mergeChatMessage(
  messages: ChatMessageRow[],
  message: ChatMessageRow,
): ChatMessageRow[] {
  if (messages.some((row) => row.id === message.id)) return messages
  if (message.mine) {
    const optimistic = messages.findIndex(
      (row) =>
        isOptimisticChatId(row.id) && row.mine && row.body === message.body,
    )
    if (optimistic >= 0) {
      const next = [...messages]
      next[optimistic] = { ...message, pending: false }
      return next
    }
  }
  return [...messages, message]
}

export function replaceOptimisticChatMessage(
  messages: ChatMessageRow[],
  optimisticId: string,
  message: ChatMessageRow,
): ChatMessageRow[] {
  if (messages.some((row) => row.id === message.id)) {
    return messages.filter((row) => row.id !== optimisticId)
  }
  return messages.map((row) =>
    row.id === optimisticId ? { ...message, pending: false } : row,
  )
}

export function applyChatMessageToList(
  channels: ChatChannelListItem[],
  channelId: string,
  message: ChatMessageRow,
  selectedId: string | null,
): ChatChannelListItem[] {
  const exists = channels.some((item) => item.id === channelId)
  if (!exists) return channels
  return channels.map((item) => {
    if (item.id !== channelId) return item
    const viewing = selectedId === channelId
    return {
      ...item,
      lastMessageAt: message.createdAt,
      lastMessageBody: message.body,
      unread: viewing || message.mine ? 0 : item.unread + 1,
    }
  })
}

function sameChatUserId(a: string, b: string): boolean {
  return a.replace(/-/g, "").toLowerCase() === b.replace(/-/g, "").toLowerCase()
}

export function patchChatWorkspaceChannels(
  queryClient: QueryClient,
  popId: string,
  updater: (channels: ChatChannelListItem[]) => ChatChannelListItem[],
) {
  queryClient.setQueryData<ChatWorkspaceData>(
    popChatWorkspaceQueryKey(popId),
    (current) => {
      if (!current) return current
      const channels = updater(current.channels)
      if (channels === current.channels) return current
      return { ...current, channels }
    },
  )
}

export function patchChatChannelMessages(
  queryClient: QueryClient,
  popId: string,
  channelId: string,
  updater: (messages: ChatMessageRow[]) => ChatMessageRow[],
) {
  queryClient.setQueryData<InfiniteData<ChatMessagesPage>>(
    popChatMessagesQueryKey(popId, channelId),
    (current) => {
      if (!current?.pages.length) return current
      const [newest, ...older] = current.pages
      const messages = updater(newest.messages)
      if (messages === newest.messages) return current
      return {
        ...current,
        pages: [{ ...newest, messages }, ...older],
      }
    },
  )
}

export function applyChatMessageToCache(
  queryClient: QueryClient,
  popId: string,
  channelId: string,
  message: ChatMessageRow,
  selectedId: string | null,
): boolean {
  patchChatChannelMessages(queryClient, popId, channelId, (messages) =>
    mergeChatMessage(messages, message),
  )
  const workspace = queryClient.getQueryData<ChatWorkspaceData>(
    popChatWorkspaceQueryKey(popId),
  )
  if (!workspace?.channels.some((item) => item.id === channelId)) {
    return false
  }
  patchChatWorkspaceChannels(queryClient, popId, (channels) =>
    applyChatMessageToList(channels, channelId, message, selectedId),
  )
  return true
}

export function applyOptimisticChatMessage(
  queryClient: QueryClient,
  popId: string,
  channelId: string,
  message: ChatMessageRow,
) {
  patchChatChannelMessages(queryClient, popId, channelId, (messages) => [
    ...messages,
    message,
  ])
  patchChatWorkspaceChannels(queryClient, popId, (channels) =>
    channels.map((item) =>
      item.id === channelId
        ? {
            ...item,
            unread: 0,
            lastMessageAt: message.createdAt,
            lastMessageBody: message.body,
          }
        : item,
    ),
  )
}

export function confirmOptimisticChatMessage(
  queryClient: QueryClient,
  popId: string,
  channelId: string,
  optimisticId: string,
  message: ChatMessageRow,
) {
  patchChatChannelMessages(queryClient, popId, channelId, (messages) =>
    replaceOptimisticChatMessage(messages, optimisticId, message),
  )
  patchChatWorkspaceChannels(queryClient, popId, (channels) =>
    channels.map((item) =>
      item.id === channelId
        ? {
            ...item,
            unread: 0,
            lastMessageAt: message.createdAt,
            lastMessageBody: message.body,
          }
        : item,
    ),
  )
}

export function removeChatMessageFromCache(
  queryClient: QueryClient,
  popId: string,
  channelId: string,
  messageId: string,
) {
  patchChatChannelMessages(queryClient, popId, channelId, (messages) =>
    messages.filter((row) => row.id !== messageId),
  )
}

export function markChatChannelReadInCache(
  queryClient: QueryClient,
  popId: string,
  channelId: string,
) {
  patchChatWorkspaceChannels(queryClient, popId, (channels) =>
    channels.map((item) =>
      item.id === channelId ? { ...item, unread: 0 } : item,
    ),
  )
}

export function invalidatePopChat(
  queryClient: QueryClient,
  popId: string,
  channelId?: string,
) {
  void queryClient.invalidateQueries({ queryKey: popChatQueryRoot(popId) })
  if (channelId) {
    void queryClient.invalidateQueries({
      queryKey: popChatChannelQueryKey(popId, channelId),
    })
  }
}
