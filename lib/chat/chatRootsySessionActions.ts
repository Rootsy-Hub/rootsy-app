import type { ChatMessageRow } from "@/app/[siteId]/[popId]/chat/chatTypes"
import {
  isChatRootsyWriteMethod,
  mergeChatRootsyHechos,
  type ChatRootsyCloseHecho,
} from "@/lib/chat/chatRootsyCloseBrief"
import { readPlannerTargetId } from "@/lib/chat/chatRootsyOfferPreview"

const SESSION_ACTIONS_MAX = 12

export function collectChatRootsyAppliedActions(
  messages: ChatMessageRow[],
): ChatRootsyCloseHecho[] {
  const fromBriefs: ChatRootsyCloseHecho[] = []
  const fromResults: ChatRootsyCloseHecho[] = []
  const fromOffers: ChatRootsyCloseHecho[] = []

  for (const row of messages) {
    if (row.closeBrief?.estado === "aplicado") {
      fromBriefs.push(...row.closeBrief.hechos)
    }
    if (row.toolResult?.applied) {
      fromResults.push(row.toolResult.applied)
    }
    const offers = row.toolOffers?.length
      ? row.toolOffers
      : row.toolOffer
        ? [row.toolOffer]
        : []
    if (row.toolError?.trim()) continue
    if (row.closeBrief?.estado === "no_aplicado") continue
    for (const offer of offers) {
      if (offer.status !== "used") continue
      if (!isChatRootsyWriteMethod(offer.method)) continue
      if (!offer.preview && !offer.body) continue
      fromOffers.push({
        accion: offer.action?.trim() || offer.label,
        sujeto: offer.preview?.subject,
        id: readPlannerTargetId({
          filters: offer.filters,
          path: offer.path,
        }) ?? undefined,
        cambios: offer.preview?.changes.map((change) => ({
          campo: change.field,
          antes: change.before,
          despues: change.after,
          clave: change.key,
          valorAntes: change.beforeValue,
          valorDespues: change.afterValue,
        })),
        aplicado: offer.body,
        anterior: offer.preview?.previous,
      })
    }
  }

  return mergeChatRootsyHechos(fromBriefs, fromResults, fromOffers).slice(
    -SESSION_ACTIONS_MAX,
  )
}

export function compactChatRootsySessionActions(
  acciones: ChatRootsyCloseHecho[],
): Array<Record<string, unknown>> {
  return acciones.slice(-SESSION_ACTIONS_MAX).map((hecho) => ({
    sujeto: hecho.sujeto,
    id: hecho.id,
    cambios: hecho.cambios?.map((change) => ({
      campo: change.campo,
      antes: change.antes,
      despues: change.despues,
      clave: change.clave,
      valorAntes: change.valorAntes,
      valorDespues: change.valorDespues,
    })),
  }))
}

export function formatChatRootsySessionActionsMessage(
  acciones: ChatRootsyCloseHecho[],
): string | null {
  if (!acciones.length) return null
  return [
    "Acciones ya aplicadas en esta sesión (hechos reales, no un plan):",
    JSON.stringify(compactChatRootsySessionActions(acciones)),
    "Si el pedido las continúa o las deshace, nombrá TODAS en reply y data_request. No reduzcas a un solo ítem. No inventes otras.",
  ].join("\n")
}
