import type { ChatRootsyOfferPreview } from "@/lib/chat/chatRootsyOfferPreview"
import {
  readPlannerTargetId,
  rowsFromPlannerResultados,
} from "@/lib/chat/chatRootsyOfferPreview"
import type { ChatRootsyPlannerResultado } from "@/lib/chat/chatRootsyPlannerStep"
import type {
  ChatRootsyRecentToolUse,
  ChatRootsyToolProposal,
} from "@/lib/chat/tools/chatRootsyToolTypes"

/** DELETE que la API confirma con `Eliminar {nombre}` en el body. */
const DELETE_PHRASE_PATH =
  /\/(articles|clients|suppliers|recipes|promotions|services)\/[^/?]+/i

export function chatRootsyDeleteNeedsTypedConfirm(
  method?: string,
  path?: string,
): boolean {
  return (
    (method ?? "").toUpperCase() === "DELETE" &&
    DELETE_PHRASE_PATH.test(path ?? "")
  )
}

export function chatRootsyResourceDeletePhrase(name: string): string {
  return `Eliminar ${name.trim() || "este registro"}`
}

function recordId(row: Record<string, unknown>): string | null {
  for (const key of [
    "id",
    "articleId",
    "recipeId",
    "serviceId",
    "clientId",
    "supplierId",
    "promotionId",
  ]) {
    const value = row[key]
    if (value == null) continue
    const id = String(value).trim()
    if (id) return id
  }
  return null
}

function recordName(row: Record<string, unknown>): string | null {
  if (typeof row.name === "string" && row.name.trim()) return row.name.trim()
  const first = typeof row.firstName === "string" ? row.firstName.trim() : ""
  const last = typeof row.lastName === "string" ? row.lastName.trim() : ""
  const person = [first, last].filter(Boolean).join(" ").trim()
  if (person) return person
  if (typeof row.displayName === "string" && row.displayName.trim()) {
    return row.displayName.trim()
  }
  return null
}

export function resolveChatRootsyDeleteName(
  proposal: Pick<ChatRootsyToolProposal, "filters" | "path" | "action">,
  input?: {
    resultados?: ChatRootsyPlannerResultado[]
    subject?: string
    recent?: ChatRootsyRecentToolUse[]
  },
): string | null {
  const subject = input?.subject?.trim()
  if (subject) return subject

  const id = readPlannerTargetId(proposal)
  if (id) {
    const row = rowsFromPlannerResultados(input?.resultados).find(
      (item) => recordId(item) === id,
    )
    const fromRow = row ? recordName(row) : null
    if (fromRow) return fromRow
    for (const group of input?.recent ?? []) {
      const item = group.items.find((entry) => entry.id === id)
      const fromRecent = item?.name.trim()
      if (fromRecent) return fromRecent
    }
  }

  const rows = rowsFromPlannerResultados(input?.resultados)
    .map(recordName)
    .filter((name): name is string => Boolean(name))
  if (rows.length === 1) return rows[0] ?? null

  const recentNames = (input?.recent ?? [])
    .flatMap((group) => group.items)
    .map((item) => item.name.trim())
    .filter(Boolean)
  if (recentNames.length === 1) return recentNames[0] ?? null

  return null
}

export function withChatRootsyDeleteConfirmBody(
  body: Record<string, unknown> | undefined,
  name: string,
): Record<string, unknown> {
  const typed =
    typeof body?.confirmationTyped === "string"
      ? body.confirmationTyped.trim()
      : ""
  if (typed) return body ?? { confirmationTyped: typed }
  return { ...body, confirmationTyped: chatRootsyResourceDeletePhrase(name) }
}

export function buildChatRootsyDeletePreview(
  proposal: Pick<ChatRootsyToolProposal, "filters" | "path" | "action" | "method">,
  resultados?: ChatRootsyPlannerResultado[],
): ChatRootsyOfferPreview | undefined {
  if (!chatRootsyDeleteNeedsTypedConfirm(proposal.method, proposal.path)) {
    return undefined
  }
  const name = resolveChatRootsyDeleteName(proposal, { resultados })
  if (!name) return undefined
  return { subject: name, changes: [] }
}
