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
  messages: ChatMessageRow[]
  memberUserIds: string[]
}

export type UpsertChatChannelInput = {
  title: string
  subtitle: string
  userIds: string[]
}

export function chatPersonName(first: string, last: string): string {
  return `${first} ${last}`.replace(/\s+/g, " ").trim() || "Sin nombre"
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
