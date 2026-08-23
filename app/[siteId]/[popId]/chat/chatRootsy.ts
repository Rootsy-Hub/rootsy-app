import type { ChatMessageRow } from "@/app/[siteId]/[popId]/chat/chatTypes"

export const ROOTSY_CHAT_ID = "rootsy"
export const ROOTSY_CHAT_AUTHOR_ID = "rootsy"

export const ROOTSY_CHAT_WELCOME: ChatMessageRow = {
  id: "rootsy-welcome",
  authorUserId: ROOTSY_CHAT_AUTHOR_ID,
  authorName: "Rootsy",
  body: "Hola, soy Rootsy. Preguntame por el local, los números o cómo moverte en Rootsy — te acompaño.",
  createdAt: new Date(0).toISOString(),
  mine: false,
}

export type ChatRootsyHistoryTurn = {
  role: "user" | "assistant"
  body: string
}

const STORAGE_PREFIX = "rootsy-mascot-chat:"
const MAX_STORED = 80

function storageKey(popId: string) {
  return `${STORAGE_PREFIX}${popId}`
}

function isStoredMessage(value: unknown): value is ChatMessageRow {
  if (!value || typeof value !== "object") return false
  const row = value as ChatMessageRow
  return (
    typeof row.id === "string" &&
    typeof row.authorUserId === "string" &&
    typeof row.authorName === "string" &&
    typeof row.body === "string" &&
    typeof row.createdAt === "string" &&
    typeof row.mine === "boolean"
  )
}

export function loadRootsyChatMessages(popId: string): ChatMessageRow[] {
  if (typeof sessionStorage === "undefined" || !popId) return []
  try {
    const raw = sessionStorage.getItem(storageKey(popId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isStoredMessage).slice(-MAX_STORED)
  } catch {
    return []
  }
}

export function saveRootsyChatMessages(
  popId: string,
  messages: ChatMessageRow[],
) {
  if (typeof sessionStorage === "undefined" || !popId) return
  const stored = messages
    .filter((row) => !row.pending && row.id !== ROOTSY_CHAT_WELCOME.id)
    .slice(-MAX_STORED)
  try {
    sessionStorage.setItem(storageKey(popId), JSON.stringify(stored))
  } catch {
    /* quota */
  }
}

export function rootsyHistoryFromMessages(
  messages: ChatMessageRow[],
): ChatRootsyHistoryTurn[] {
  return messages
    .filter((row) => !row.pending && row.body.trim().length > 0)
    .map((row) => ({
      role: row.mine ? "user" : "assistant",
      body: row.body.trim(),
    }))
}
