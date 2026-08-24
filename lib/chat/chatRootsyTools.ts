import type {
  ChatMessageRow,
  ChatRootsyToolOffer,
  ChatRootsyToolResult,
} from "@/app/[siteId]/[popId]/chat/chatTypes"
import { buildChatRootsyDeletePreview } from "@/lib/chat/chatRootsyDeleteConfirm"
import { buildChatRootsyOfferPreview } from "@/lib/chat/chatRootsyOfferPreview"
import type { ChatRootsyPlannerResultado } from "@/lib/chat/chatRootsyPlannerStep"
import { chatRootsyApiQueryTitle } from "@/lib/chat/chatRootsyApiQuery"
import { getChatRootsyApiEndpoint } from "@/lib/chat/apiDocumentacion"
import { enabledChatRootsyTools } from "@/lib/chat/tools/chatRootsyToolRegistry"
import { buildChatRootsyToolOfferFromProposal } from "@/lib/chat/tools/chatRootsyToolSelect"
import type { ChatRootsyToolProposal } from "@/lib/chat/tools/chatRootsyToolTypes"
import {
  findRecentToolUse,
  type ChatRootsyRecentToolUse,
  type ChatRootsyToolMatchContext,
  type ChatRootsyToolName,
} from "@/lib/chat/tools/chatRootsyToolTypes"

export {
  CHAT_ROOTSY_TOOL_PRODUCT_MARGINS,
  CHAT_ROOTSY_TOOL_SUPPLIER_PAYMENTS,
  CHAT_ROOTSY_TOOL_TOP_SOLD,
  findRecentToolUse,
  isChatRootsyToolName,
  type ChatRootsyRecentToolUse,
  type ChatRootsyToolMatchContext,
  type ChatRootsyToolName,
} from "@/lib/chat/tools/chatRootsyToolTypes"

export type ChatRootsyToolPeriod = "this_month"

type ChatRootsyToolDefinition = {
  name: ChatRootsyToolName
  description: string
  buttonLabel: string
  resultTitle: string
  offerPrompt: string
  readOnly: true
  periodLabel: string
  defaultParams: Record<string, string | number | boolean>
  requiresRecent?: ChatRootsyToolName[]
  permissions: readonly string[]
}

function catalogFromRegistry(): Record<ChatRootsyToolName, ChatRootsyToolDefinition> {
  const catalog = {} as Record<ChatRootsyToolName, ChatRootsyToolDefinition>
  for (const entry of enabledChatRootsyTools()) {
    const defaultParams: Record<string, string | number | boolean> = {}
    for (const param of entry.params) {
      if (param.default !== undefined) defaultParams[param.name] = param.default
    }
    catalog[entry.name as ChatRootsyToolName] = {
      name: entry.name as ChatRootsyToolName,
      description: entry.solves,
      buttonLabel: entry.buttonLabel ?? entry.solves,
      resultTitle: entry.resultTitle ?? entry.solves,
      offerPrompt: entry.offerPrompt ?? "",
      readOnly: true,
      periodLabel:
        entry.name === "supplier_upcoming_payments" ? "A pagar" : "Este mes",
      defaultParams,
      requiresRecent: entry.requiresRecent as ChatRootsyToolName[] | undefined,
      permissions: entry.permissions,
    }
  }
  return catalog
}

export const CHAT_ROOTSY_TOOL_CATALOG = catalogFromRegistry()

export const CHAT_ROOTSY_TOOL_RESULT_PROMPT = [
  "La corrida del planificador ya cerró. Abajo hay datos reales de las consultas o cambios.",
  "Narrá el cierre con tu voz: qué se vio o qué quedó. No pidas otro permiso ni replanifiques.",
  "Leé el JSON completo (data). Si viene products, esa es la lista de TODOS los productos vendidos en el período (no el ranking de 10). Buscá por nombre ahí: sales, cost, profit, marginPercent.",
  "No inventes ítems que no estén. Si alguna lista está vacía, decilo.",
  "No nombres APIs, permisos, endpoints ni herramientas internas.",
].join(" ")

export const CHAT_ROOTSY_MULTI_TOOL_OFFER_PROMPT = [
  "La persona pidió más de una consulta. No inventes cifras.",
  "Invitá breve a mirarlas con los botones. No nombres APIs, permisos ni endpoints.",
].join(" ")

export function matchChatRootsyToolOffer(
  proposals: ChatRootsyToolProposal[],
): string | null {
  return proposals[0]?.tool ?? null
}

export function getChatRootsyToolDefinition(name: string) {
  return CHAT_ROOTSY_TOOL_CATALOG[name as ChatRootsyToolName] ?? null
}

export function chatRootsyQueryTitle(name: string): string {
  return (
    getChatRootsyToolDefinition(name)?.resultTitle ??
    (getChatRootsyApiEndpoint(name) ? chatRootsyApiQueryTitle(name) : "Consulta")
  )
}

export function buildChatRootsyToolOffer(
  name: ChatRootsyToolName,
): ChatRootsyToolOffer {
  const tool = CHAT_ROOTSY_TOOL_CATALOG[name]
  return {
    tool: tool.name,
    label: tool.buttonLabel,
    status: "offered",
    hint: tool.periodLabel,
    filters: tool.defaultParams,
  }
}

export function buildChatRootsyToolOffers(
  proposals: ChatRootsyToolProposal[],
  resultados?: ChatRootsyPlannerResultado[],
): ChatRootsyToolOffer[] {
  return proposals
    .map((proposal) => {
      const offer = buildChatRootsyToolOfferFromProposal(proposal)
      if (!offer) return null
      const preview =
        buildChatRootsyOfferPreview(proposal, resultados) ??
        buildChatRootsyDeletePreview(proposal, resultados)
      return preview ? { ...offer, preview } : offer
    })
    .filter((row): row is ChatRootsyToolOffer => row != null)
}

export function rootsyToolContextFromMessages(
  messages: ChatMessageRow[],
): ChatRootsyToolMatchContext {
  return {
    recent: messages
      .filter((row) => row.toolResult?.items.length)
      .slice(-4)
      .map((row) => ({
        tool: row.toolResult!.tool,
        items: row.toolResult!.items.map((item) => ({
          id: item.id,
          name: item.name,
        })),
      })),
  }
}

export function sourceItemsForTool(
  name: string,
  context?: ChatRootsyToolMatchContext,
): ChatRootsyRecentToolUse["items"] {
  const tool = CHAT_ROOTSY_TOOL_CATALOG[name as ChatRootsyToolName]
  if (!tool?.requiresRecent) return []
  return findRecentToolUse(context, tool.requiresRecent)?.items ?? []
}

function toolResultPayload(result: ChatRootsyToolResult) {
  if (result.payload !== undefined) {
    return {
      query: result.tool,
      period: result.periodLabel,
      data: result.payload,
    }
  }
  return {
    query: result.tool,
    period: result.periodLabel,
    items: result.items.map((item) => {
      const row: Record<string, string | number> = {
        rank: item.rank,
        name: item.name,
      }
      if (item.sharePercent != null) row.salesSharePercent = item.sharePercent
      if (item.sales != null) row.salesAmount = item.sales
      if (item.cost != null) row.costAmount = item.cost
      if (item.profit != null) row.profitAmount = item.profit
      if (item.marginPercent != null) row.marginPercent = item.marginPercent
      if (item.balance != null) row.balanceAmount = item.balance
      if (item.overdueAmount != null) row.overdueAmount = item.overdueAmount
      if (item.openCount != null) row.openCount = item.openCount
      return row
    }),
  }
}

export function buildChatRootsyToolModelPayload(
  result: ChatRootsyToolResult,
): string {
  return JSON.stringify(toolResultPayload(result))
}

export function buildChatRootsyToolModelPayloads(
  results: ChatRootsyToolResult[],
): string {
  if (results.length === 1 && results[0]) {
    return buildChatRootsyToolModelPayload(results[0])
  }
  return JSON.stringify({ queries: results.map(toolResultPayload) })
}
