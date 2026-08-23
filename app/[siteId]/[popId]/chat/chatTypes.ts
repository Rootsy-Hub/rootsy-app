export type ChatEligibleUser = {
  userId: string
  firstName: string
  lastName: string
  roleId: string
  roleDisplayName: string
}

export type ChatRoleOption = {
  id: string
  displayName: string
}

export type ChatChannelListItem = {
  id: string
  slug: string
  title: string
  subtitle: string | null
  imageUrl?: string | null
  initials: string
  isEquipo: boolean
  lastMessageAt: string | null
  lastMessageBody: string | null
  unread: number
  memberCount: number
}

export type ChatMessageRow = {
  id: string
  authorUserId: string
  authorName: string
  body: string
  createdAt: string
  mine: boolean
  pending?: boolean
}

export type ChatWorkspaceData = {
  currentUserId: string
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  channelCount: number
  channelLimit: number
  channels: ChatChannelListItem[]
  members: ChatEligibleUser[]
  roles: ChatRoleOption[]
}

export type ChatChannelDetailData = {
  channel: ChatChannelListItem
  memberUserIds: string[]
}

export type ChatMessageCursor = {
  createdAt: string
  id: string
}

export type ChatMessagesPage = {
  messages: ChatMessageRow[]
  hasMore: boolean
  nextCursor: ChatMessageCursor | null
}

export type UpsertChatChannelInput = {
  title: string
  subtitle: string
  imageUrl: string
  userIds: string[]
}

export function chatPersonName(first: string, last: string): string {
  return `${first} ${last}`.replace(/\s+/g, " ").trim() || "Sin nombre"
}

const CHAT_AUTHOR_NAME_TONES = [
  "text-[var(--rootsy-cielo-700)]",
  "text-[var(--rootsy-suelo-700)]",
  "text-[var(--rootsy-sol-800)]",
  "text-[var(--rootsy-savia-800)]",
  "text-[var(--rootsy-cielo-800)]",
  "text-[var(--rootsy-savia-teal)]",
] as const

export function chatStandaloneEmojiCount(body: string): 1 | 2 | 3 | null {
  const trimmed = body.trim()
  if (!trimmed) return null
  const graphemes = [
    ...new Intl.Segmenter("es", { granularity: "grapheme" }).segment(trimmed),
  ]
    .map((part) => part.segment)
    .filter((part) => part.trim() !== "")
  if (graphemes.length < 1 || graphemes.length > 3) return null
  const emojiOnly = graphemes.every((part) =>
    /\p{Extended_Pictographic}/u.test(part),
  )
  if (!emojiOnly) return null
  return graphemes.length as 1 | 2 | 3
}

export function chatAuthorNameTone(userId: string) {
  const key = userId.replace(/-/g, "").toLowerCase()
  let hash = 0
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  }
  return CHAT_AUTHOR_NAME_TONES[hash % CHAT_AUTHOR_NAME_TONES.length] ?? CHAT_AUTHOR_NAME_TONES[0]
}

export function formatChatTime(iso: string | null | undefined): string {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  const now = new Date()
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  if (sameDay) {
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  ) {
    return "Ayer"
  }
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
  })
}
