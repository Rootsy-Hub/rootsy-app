import type {
  ChatChannelListItem,
  ChatMessageRow,
} from "@/app/[siteId]/[popId]/chat/chatTypes"
import type { DomainEvent } from "@/lib/realtime/protocol"

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
  const body = typeof row.body === "string" ? row.body : ""
  const createdAt = typeof row.createdAt === "string" ? row.createdAt : ""
  if (!id || !authorUserId || !body || !createdAt) return null
  return {
    id,
    authorUserId,
    authorName,
    body,
    createdAt,
    mine: sameChatUserId(authorUserId, currentUserId),
  }
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
