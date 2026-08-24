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

/** Solo sesión del navegador. No se guarda en Supabase ni otra base. */
export const ROOTSY_SESSION_HISTORY_MAX = 80
export const ROOTSY_AI_HISTORY_TURNS = 20
export const ROOTSY_AI_HISTORY_BODY = 800

const STORAGE_PREFIX = "rootsy-mascot-chat:"
const DEV_RELOAD_CLEARED = "__rootsyChatDevReloadCleared"

function storageKey(popId: string) {
  return `${STORAGE_PREFIX}${popId}`
}

function isChatRootsyDevReload(): boolean {
  return process.env.NODE_ENV === "development"
}

function takeChatRootsyDevReloadClear(): boolean {
  if (!isChatRootsyDevReload() || typeof globalThis === "undefined") return false
  const slot = globalThis as typeof globalThis & {
    [DEV_RELOAD_CLEARED]?: boolean
  }
  if (slot[DEV_RELOAD_CLEARED]) return false
  slot[DEV_RELOAD_CLEARED] = true
  return true
}

function clearRootsyChatStorage() {
  if (typeof sessionStorage === "undefined") return
  const keys: string[] = []
  for (let index = 0; index < sessionStorage.length; index += 1) {
    const key = sessionStorage.key(index)
    if (key?.startsWith(STORAGE_PREFIX)) keys.push(key)
  }
  for (const key of keys) sessionStorage.removeItem(key)
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
  if (takeChatRootsyDevReloadClear()) {
    clearRootsyChatStorage()
    return []
  }
  try {
    const raw = sessionStorage.getItem(storageKey(popId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isStoredMessage).slice(-ROOTSY_SESSION_HISTORY_MAX)
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
    .slice(-ROOTSY_SESSION_HISTORY_MAX)
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
    .filter(
      (row) =>
        !row.pending &&
        !row.toolResult &&
        row.body.trim().length > 0,
    )
    .map((row) => ({
      role: row.mine ? "user" : "assistant",
      body: row.body.trim().slice(0, ROOTSY_AI_HISTORY_BODY),
    }))
    .slice(-ROOTSY_AI_HISTORY_TURNS)
}

export { rootsyToolContextFromMessages } from "@/lib/chat/chatRootsyTools"
