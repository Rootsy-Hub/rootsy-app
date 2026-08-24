import { parseChatRootsyFirstTurn } from "@/lib/chat/chatRootsyDataRequest"
import {
  buildChatRootsyOfferPreview,
  readPlannerTargetId,
} from "@/lib/chat/chatRootsyOfferPreview"
import type {
  ChatRootsyPlannerInforme,
  ChatRootsyPlannerResultado,
} from "@/lib/chat/chatRootsyPlannerStep"
import type { ChatRootsyToolProposal } from "@/lib/chat/tools/chatRootsyToolTypes"
import type { ChatRootsyToolResult } from "@/app/[siteId]/[popId]/chat/chatTypes"
import { formatReportMoneyAr } from "@/lib/reportFormatters"

export type ChatRootsyCloseCambio = {
  campo: string
  antes: string
  despues: string
  clave?: string
  valorAntes?: number | string | boolean
  valorDespues?: number | string | boolean
}

export type ChatRootsyCloseHecho = {
  accion: string
  sujeto?: string
  id?: string
  cambios?: ChatRootsyCloseCambio[]
  aplicado?: Record<string, unknown>
  anterior?: Record<string, unknown>
}

export type ChatRootsyCloseBrief = {
  pedido: string
  estado: "aplicado" | "consultado"
  hechos: ChatRootsyCloseHecho[]
  informe?: ChatRootsyPlannerInforme
}

const WRITE_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"])

export function isChatRootsyWriteMethod(method?: string): boolean {
  return WRITE_METHODS.has((method ?? "GET").toUpperCase())
}

function itemValue(item: {
  sales?: number
  balance?: number
}): string | undefined {
  if (item.sales != null) return formatReportMoneyAr(item.sales)
  if (item.balance != null) return formatReportMoneyAr(item.balance)
  return undefined
}

export function hechoKey(hecho: ChatRootsyCloseHecho): string {
  if (hecho.id?.trim()) return `id:${hecho.id.trim()}`
  const sujeto = hecho.sujeto?.trim().toLowerCase() ?? ""
  const after =
    hecho.cambios?.map((change) => `${change.campo}:${change.despues}`).join(",") ??
    ""
  return `sujeto:${sujeto}|${after}|${hecho.accion}`
}

export function mergeChatRootsyHechos(
  ...lists: Array<ChatRootsyCloseHecho[] | undefined>
): ChatRootsyCloseHecho[] {
  const out: ChatRootsyCloseHecho[] = []
  const seen = new Set<string>()
  for (const list of lists) {
    for (const hecho of list ?? []) {
      const key = hechoKey(hecho)
      if (seen.has(key)) continue
      seen.add(key)
      out.push(hecho)
    }
  }
  return out
}

export function hechoFromWriteProposal(
  proposal: ChatRootsyToolProposal,
  resultados?: ChatRootsyPlannerResultado[],
): ChatRootsyCloseHecho {
  const preview = buildChatRootsyOfferPreview(proposal, resultados)
  return {
    accion: proposal.action?.trim() || "Cambio aplicado",
    sujeto: preview?.subject,
    id: readPlannerTargetId(proposal) ?? undefined,
    cambios: preview?.changes.map((change) => ({
      campo: change.field,
      antes: change.before,
      despues: change.after,
      clave: change.key,
      valorAntes: change.beforeValue,
      valorDespues: change.afterValue,
    })),
    aplicado: proposal.body,
    anterior: preview?.previous,
  }
}

export function buildChatRootsyCloseBrief(input: {
  pedido: string
  proposals: ChatRootsyToolProposal[]
  resultados?: ChatRootsyPlannerResultado[]
  toolResults?: ChatRootsyToolResult[]
  previos?: ChatRootsyCloseHecho[]
  informe?: ChatRootsyPlannerInforme
}): ChatRootsyCloseBrief {
  const pedido = input.pedido.trim() || "este pedido"
  const writes = input.proposals
    .filter((row) => isChatRootsyWriteMethod(row.method))
    .map((proposal) => hechoFromWriteProposal(proposal, input.resultados))
  const fromResults = (input.toolResults ?? [])
    .map((result) => result.applied)
    .filter((hecho): hecho is ChatRootsyCloseHecho => Boolean(hecho))
  const hechos = mergeChatRootsyHechos(input.previos, writes, fromResults)
  if (hechos.length) {
    return {
      pedido,
      estado: "aplicado",
      hechos,
      informe: input.informe,
    }
  }

  if (input.informe?.respuesta) {
    return {
      pedido,
      estado: "consultado",
      hechos: [],
      informe: input.informe,
    }
  }

  const consultados: ChatRootsyCloseHecho[] = []
  for (const result of input.toolResults ?? []) {
    if (!result.items.length) {
      if (result.title?.trim()) {
        consultados.push({ accion: result.title.trim() })
      }
      continue
    }
    for (const item of result.items.slice(0, 8)) {
      const valor = itemValue(item)
      consultados.push({
        accion: result.title?.trim() || "Consulta",
        sujeto: item.name,
        id: item.id,
        cambios: valor
          ? [{ campo: "Valor", antes: "—", despues: valor }]
          : undefined,
      })
    }
  }
  return {
    pedido,
    estado: "consultado",
    hechos: consultados,
    informe: input.informe,
  }
}

export function buildChatRootsyCloseModelPayload(
  brief: ChatRootsyCloseBrief,
): Record<string, unknown> {
  const hasInforme = Boolean(brief.informe?.respuesta)
  return {
    pedido: brief.pedido,
    estado: brief.estado,
    ...(brief.informe
      ? {
          informe: {
            respuesta: brief.informe.respuesta,
            acciones: brief.informe.acciones,
          },
        }
      : {}),
    hechos:
      brief.estado === "aplicado"
        ? brief.hechos
        : hasInforme
          ? []
          : brief.hechos,
  }
}

export function fallbackChatRootsyCloseReply(
  brief: ChatRootsyCloseBrief,
): string {
  const informe = brief.informe?.respuesta?.trim()
  if (informe) return informe.slice(0, 800)

  if (brief.estado === "aplicado") {
    const parts = brief.hechos.map((hecho) => {
      if (hecho.sujeto && hecho.cambios?.length) {
        const detail = hecho.cambios
          .map((change) =>
            change.campo === "Precio"
              ? `pasó de ${change.antes} a ${change.despues}`
              : `${change.campo} de ${change.antes} a ${change.despues}`,
          )
          .join(" y ")
        return `${hecho.sujeto} ${detail}`
      }
      return hecho.accion
    })
    if (parts.length === 1 && parts[0]) {
      return `Listo, ya quedó. ${parts[0]}.`
    }
    if (parts.length > 1) {
      return `Listo, ya quedaron actualizados. ${parts.join("; ")}.`
    }
    return "Listo, el cambio ya quedó aplicado."
  }

  const seen = brief.hechos
    .map((hecho) => hecho.sujeto)
    .filter((name): name is string => Boolean(name))
  if (seen.length === 1) {
    return `Ya lo miré. Encontré ${seen[0]}.`
  }
  if (seen.length > 1) {
    return `Ya lo miré. Vi ${seen.slice(0, 4).join(", ")}${
      seen.length > 4 ? " y más" : ""
    }.`
  }
  return "Ya están los números. Si alguno te llama la atención, lo miramos juntos."
}

export function readChatRootsyCloseReply(raw: string | null): string | null {
  if (!raw?.trim()) return null
  const parsed = parseChatRootsyFirstTurn(raw)
  if (parsed?.reply) return parsed.reply
  const text = raw.replace(/^```(?:json|text)?\s*|\s*```$/g, "").trim()
  return text.slice(0, 800) || null
}

export const CHAT_ROOTSY_CLOSE_PROMPT = [
  "El planificador ya resolvió el data_request.",
  "Si hay informe.respuesta, narrá ESO con tu voz: es la respuesta al pedido. No la reemplaces con un listado de filas.",
  "informe.acciones es el rastro de la tarea; no hace falta recitarlo entero.",
  "Si estado es aplicado, usá hechos (antes → después) para no inventar cifras de cambios. Si hay varios, nombrá todos.",
  "Si no hay informe, narrá solo con hechos.",
  "No inventes cifras ni ítems que no estén en el JSON.",
  "No pidas data_request, no replanifiques y no nombres APIs.",
  "Respondé solo el texto visible, no JSON.",
].join(" ")
