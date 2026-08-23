"use server"

import { getPopAccessCache } from "@/app/home/homeUserDataActions"
import type { ChatRootsyHistoryTurn } from "@/app/[siteId]/[popId]/chat/chatRootsy"
import {
  CHAT_ROOTSY_SYSTEM_PROMPT,
  requestChatRootsyReply,
} from "@/lib/chat/chatRootsyAi"
import { buildMenuRootsyContext } from "@/lib/menu/menuRootsyContext"
import { loadMenuRootsyBusinessInsights } from "@/lib/menu/menuRootsyInsights"
import { buildMenuRootsyAiUserPayload } from "@/lib/menu/menuRootsyPrompt"
import { validatePopAccess } from "@/lib/popHelpers"
import { siteIdsMatchClientRoute } from "@/lib/popRoutes"

const MAX_TURNS = 16
const MAX_BODY = 2000

export async function sendRootsyChatMessage(input: {
  popId: string
  siteId: string
  history: ChatRootsyHistoryTurn[]
}): Promise<{ success: true; reply: string } | { success: false; error: string }> {
  const popId = input.popId.trim()
  const siteId = input.siteId.trim()
  if (!popId || !siteId) {
    return { success: false, error: "Parámetros inválidos" }
  }

  const history = input.history
    .filter(
      (turn) =>
        (turn.role === "user" || turn.role === "assistant") &&
        typeof turn.body === "string" &&
        turn.body.trim().length > 0,
    )
    .map((turn) => ({
      role: turn.role,
      body: turn.body.trim().slice(0, MAX_BODY),
    }))
    .slice(-MAX_TURNS)

  if (history.length === 0 || history[history.length - 1]?.role !== "user") {
    return { success: false, error: "Escribí un mensaje para Rootsy." }
  }

  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { success: false, error: access.error || "Sin acceso" }
  }

  const popAccess = await getPopAccessCache(popId)
  if (!popAccess?.canEnter) {
    return { success: false, error: "No se pudo cargar el acceso al negocio" }
  }

  if (!siteIdsMatchClientRoute(siteId, popAccess.pop.siteId)) {
    return { success: false, error: "Sitio inválido para este negocio" }
  }

  let insights = null
  try {
    insights = await loadMenuRootsyBusinessInsights(
      popId,
      popAccess.enabledModules,
      popAccess.pop.name,
    )
  } catch {
    insights = null
  }

  const context = buildMenuRootsyContext({
    popAccess,
    siteId,
    sectionKey: "operar",
    sectionTitle: "Operar",
    insights,
  })

  const system = [
    CHAT_ROOTSY_SYSTEM_PROMPT,
    "Contexto del negocio (JSON):",
    JSON.stringify(buildMenuRootsyAiUserPayload(context)),
  ].join("\n")

  const reply = await requestChatRootsyReply(system, history)
  if (!reply) {
    return {
      success: false,
      error: "Rootsy no pudo responder ahora. Probá de nuevo en un momento.",
    }
  }

  return { success: true, reply }
}
