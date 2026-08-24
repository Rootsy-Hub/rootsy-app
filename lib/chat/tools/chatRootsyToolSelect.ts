import type { ChatRootsyToolOffer } from "@/app/[siteId]/[popId]/chat/chatTypes"
import { getChatRootsyApiEndpoint } from "@/lib/chat/apiDocumentacion"
import {
  chatRootsyApiPeriodHint,
  chatRootsyApiQueryTitle,
} from "@/lib/chat/chatRootsyApiQuery"
import {
  chatRootsyOfferKey,
  fallbackChatRootsyPlannerAction,
  sanitizeChatRootsyPlannerAction,
} from "@/lib/chat/chatRootsyPlannerStep"
import { validateChatRootsyPlannerCall } from "@/lib/chat/tools/chatRootsyToolPlanner"
import {
  enabledChatRootsyTools,
  getChatRootsyRegistryEntry,
  type ChatRootsyRegistryEntry,
} from "@/lib/chat/tools/chatRootsyToolRegistry"
import type {
  ChatRootsyToolFilters,
  ChatRootsyToolProposal,
} from "@/lib/chat/tools/chatRootsyToolTypes"

export const CHAT_ROOTSY_MAX_RELEVANT_TOOLS = 3

export type { ChatRootsyToolFilters, ChatRootsyToolProposal }

export function defaultFiltersForTool(
  entry: ChatRootsyRegistryEntry,
): ChatRootsyToolFilters {
  if (entry.strategy?.defaultFilters) {
    return { ...entry.strategy.defaultFilters }
  }
  const filters: ChatRootsyToolFilters = {}
  for (const param of entry.params) {
    if (param.default !== undefined) filters[param.name] = param.default
  }
  return filters
}

export function validateChatRootsyProposal(
  raw: {
    tool?: unknown
    filters?: unknown
    path?: unknown
    method?: unknown
    body?: unknown
  },
): ChatRootsyToolProposal | null {
  return validateChatRootsyPlannerCall(raw, undefined, { enforceRecent: false })
}

export function publicChatRootsyToolSpecs(entries: ChatRootsyRegistryEntry[]) {
  return entries.map((entry) => ({
    name: entry.name,
    solves: entry.solves,
    filters: entry.params.map((param) => ({
      name: param.name,
      type: param.type,
      values: param.values,
      default: param.default,
      max: param.max,
    })),
  }))
}

export function periodHintForTool(
  name: string,
  filters?: ChatRootsyToolFilters,
): string {
  const fromDates = chatRootsyApiPeriodHint(filters)
  if (fromDates) return fromDates
  if (name === "supplier_upcoming_payments") return "A pagar"
  if (getChatRootsyApiEndpoint(name)) return "Consulta"
  if (name === "merchandise_book_value" || name === "treasury_balances") {
    return "Saldo"
  }
  return "Este mes"
}

export function buildChatRootsyToolOfferFromProposal(
  proposal: ChatRootsyToolProposal,
): ChatRootsyToolOffer | null {
  const endpoint = getChatRootsyApiEndpoint(proposal.tool)
  if (endpoint || proposal.path) {
    const method = proposal.method ?? endpoint?.method ?? "GET"
    const path = proposal.path ?? endpoint?.path ?? ""
    const label = sanitizeChatRootsyPlannerAction(
      proposal.action,
      fallbackChatRootsyPlannerAction(method) ||
        (endpoint ? chatRootsyApiQueryTitle(endpoint.id) : "Continuar con esta acción"),
    )
    return {
      tool: proposal.tool,
      label,
      status: "offered",
      filters: proposal.filters,
      method,
      path: path || undefined,
      body: proposal.body,
      action: label,
      confirm: proposal.confirm ?? "confirm",
      offerKey: chatRootsyOfferKey({ ...proposal, method, path }),
      next: proposal.next,
    }
  }
  const entry = enabledChatRootsyTools().find((row) => row.name === proposal.tool)
  if (!entry?.buttonLabel) return null
  const label = sanitizeChatRootsyPlannerAction(
    proposal.action,
    entry.buttonLabel,
  )
  return {
    tool: entry.name,
    label,
    status: "offered",
    hint: periodHintForTool(entry.name, proposal.filters),
    filters: proposal.filters,
    action: label,
    confirm: proposal.confirm ?? "confirm",
    offerKey: chatRootsyOfferKey(proposal),
  }
}

export function permissionRefFromTool(name: string) {
  const entry = getChatRootsyRegistryEntry(name)
  const key = entry?.permissions[0]
  if (!key) return null
  const [resource, action] = key.split(":")
  if (!resource || !action) return null
  return { resource, action }
}
