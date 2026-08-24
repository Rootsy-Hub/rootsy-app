import type { ChatRootsyCloseHecho } from "@/lib/chat/chatRootsyCloseBrief"
import type { ChatRootsyDataRequest } from "@/lib/chat/chatRootsyDataRequest"
import { compactChatRootsySessionActions } from "@/lib/chat/chatRootsySessionActions"
import { normalizeChatRootsyApiMethod } from "@/lib/chat/apiDocumentacion"
import {
  chatRootsyOfferKey,
  fallbackChatRootsyPlannerAction,
  readChatRootsyPlannerConfirm,
  readChatRootsyPlannerInforme,
  sanitizeChatRootsyPlannerAction,
  type ChatRootsyPlannerConfirm,
  type ChatRootsyPlannerInforme,
  type ChatRootsyPlannerResultado,
} from "@/lib/chat/chatRootsyPlannerStep"
import {
  formatChatRootsyPlannerRequest,
  readChatRootsyPathQuery,
  readChatRootsyPlannerBody,
  readChatRootsyPlannerFilters,
  resolveChatRootsyPlannerRequest,
} from "@/lib/chat/chatRootsyApiQuery"
import {
  enabledChatRootsyTools,
  getChatRootsyRegistryEntry,
  type ChatRootsyRegistryEntry,
  type ChatRootsyToolParamSpec,
} from "@/lib/chat/tools/chatRootsyToolRegistry"
import {
  findRecentToolUse,
  isChatRootsyToolName,
  type ChatRootsyToolFilters,
  type ChatRootsyToolMatchContext,
  type ChatRootsyToolName,
  type ChatRootsyToolProposal,
} from "@/lib/chat/tools/chatRootsyToolTypes"

export const CHAT_ROOTSY_PLANNER_MAX_CALLS = 8

export const CHAT_ROOTSY_PLANNER_AUGUST_MARGIN_QUERY =
  "¿Cuáles fueron los artículos con menos margen que más se vendieron entre el 5 y el 8 de agosto?"

export const CHAT_ROOTSY_MISSING_SALES_MARGINS_RANGE = {
  name: "products_sales_margins_range",
  endpoint: "GET /v1/pops/:popId/statistics/products/details",
  reason: [
    "Las herramientas habilitadas solo aceptan period=this_month.",
    "Falta habilitar products_sales_margins_range con from/to ISO y los campos oficiales de ventas + margen.",
    "No hay que inventar un ranking ni recorrer artículos.",
  ].join(" "),
} as const

export type ChatRootsyPlannerIndexParam = {
  name: string
  type: ChatRootsyToolParamSpec["type"]
  values?: readonly string[]
  default?: string | number | boolean
  max?: number
  required?: boolean
}

export type ChatRootsyPlannerIndexEntry = {
  id: string
  purpose: string
  params: ChatRootsyPlannerIndexParam[]
  defaults: ChatRootsyToolFilters
  requiresRecent?: readonly string[]
}

export type ChatRootsyPlannerQuery = {
  id: string
  filters: ChatRootsyToolFilters
  path?: string
  method?: string
  body?: Record<string, unknown>
  action?: string
  confirm?: ChatRootsyPlannerConfirm
}

export type ChatRootsyPlannerPlan = {
  queries: ChatRootsyPlannerQuery[]
  clarifyingQuestion?: string
  done?: boolean
  informe?: ChatRootsyPlannerInforme
}

export type ChatRootsyValidatedPlan = {
  proposals: ChatRootsyToolProposal[]
  clarifyingQuestion?: string
  discarded: number
  done?: boolean
  informe?: ChatRootsyPlannerInforme
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

export function isChatRootsyIsoDate(value: string): boolean {
  const match = ISO_DATE.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (year < 2000 || year > 2100) return false
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

function sanitizeClarifyingQuestion(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined
  const cleaned = raw
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\bsk-[a-zA-Z0-9_-]+\b/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200)
  return cleaned || undefined
}

function defaultFiltersForEntry(
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

export function eligibleChatRootsyPlannerTools(
  _context?: ChatRootsyToolMatchContext,
  permissionKeys?: readonly string[],
): ChatRootsyRegistryEntry[] {
  return enabledChatRootsyTools().filter((entry) => {
    if (entry.kind !== "read" || entry.requiresConfirmation) return false
    if (entry.strategy?.cost === "avoid") return false
    if (permissionKeys) {
      const needed = entry.permissions[0]
      if (needed && !permissionKeys.includes(needed)) return false
    }
    return true
  })
}

export function buildChatRootsyPlannerIndex(
  entries: readonly ChatRootsyRegistryEntry[],
): ChatRootsyPlannerIndexEntry[] {
  return entries
    .filter((entry) => entry.status === "enabled" && entry.kind === "read")
    .map((entry) => ({
      id: entry.name,
      purpose: entry.solves,
      params: entry.params.map((param) => ({
        name: param.name,
        type: param.type,
        values: param.values,
        default: param.default,
        max: param.max,
        required: param.required,
      })),
      defaults: defaultFiltersForEntry(entry),
      requiresRecent: entry.requiresRecent,
    }))
}

function readPlannerFilters(raw: unknown): ChatRootsyToolFilters {
  return readChatRootsyPlannerFilters(raw)
}

export function parseChatRootsyPlannerPlan(
  raw: string,
): ChatRootsyPlannerPlan | null {
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null
  try {
    const parsed = JSON.parse(jsonMatch[0]) as {
      status?: unknown
      queries?: unknown
      toolCalls?: unknown
      clarifyingQuestion?: unknown
      question?: unknown
      reason?: unknown
    }
    if (parsed.status === "needs_clarification") {
      return {
        queries: [],
        clarifyingQuestion: sanitizeClarifyingQuestion(
          parsed.question ?? parsed.clarifyingQuestion,
        ),
      }
    }
    if (parsed.status === "impossible") {
      return {
        queries: [],
        clarifyingQuestion: sanitizeClarifyingQuestion(parsed.reason),
      }
    }
    if (parsed.status === "done") {
      return {
        queries: [],
        done: true,
        informe: readChatRootsyPlannerInforme(parsed),
      }
    }
    const rows = Array.isArray(parsed.queries)
      ? parsed.queries
      : Array.isArray(parsed.toolCalls)
        ? parsed.toolCalls
        : null
    if (!rows) return null
    const queries: ChatRootsyPlannerQuery[] = []
    for (const row of rows.slice(0, CHAT_ROOTSY_PLANNER_MAX_CALLS)) {
      if (!row || typeof row !== "object") continue
      const call = row as {
        id?: unknown
        tool?: unknown
        path?: unknown
        endpoint?: unknown
        method?: unknown
        filters?: unknown
        params?: unknown
        body?: unknown
        action?: unknown
        confirm?: unknown
      }
      const id =
        typeof call.id === "string"
          ? call.id.trim()
          : typeof call.tool === "string"
            ? call.tool.trim()
            : ""
      const endpointText =
        typeof call.endpoint === "string" ? call.endpoint.trim() : ""
      const endpointMatch = /^(GET|POST|PATCH|PUT|DELETE)\s+/i.exec(endpointText)
      const pathFromEndpoint = endpointText
        .replace(/^(GET|POST|PATCH|PUT|DELETE)\s+/i, "")
        .trim()
      const path =
        typeof call.path === "string" && call.path.trim()
          ? call.path.trim()
          : pathFromEndpoint || undefined
      if (!id && !path) continue
      const fromPath = path ? readChatRootsyPathQuery(path) : {}
      const method =
        normalizeChatRootsyApiMethod(call.method) ??
        (endpointMatch
          ? normalizeChatRootsyApiMethod(endpointMatch[1]) ?? undefined
          : undefined)
      queries.push({
        id,
        path,
        method,
        body: readChatRootsyPlannerBody(call.body),
        filters: {
          ...fromPath,
          ...readPlannerFilters(call.params ?? call.filters),
        },
        action: sanitizeChatRootsyPlannerAction(
          call.action,
          fallbackChatRootsyPlannerAction(method),
        ),
        confirm: readChatRootsyPlannerConfirm(call.confirm),
      })
    }
    return {
      queries,
      clarifyingQuestion: sanitizeClarifyingQuestion(
        parsed.clarifyingQuestion ?? parsed.question,
      ),
    }
  } catch {
    return null
  }
}

function coerceFilterValue(
  param: ChatRootsyToolParamSpec,
  incoming: unknown,
): string | number | boolean | null | undefined {
  const value = incoming ?? param.default
  if (value === undefined) return param.required ? null : undefined

  if (param.type === "number") {
    const numberValue = typeof value === "number" ? value : Number(value)
    if (!Number.isFinite(numberValue)) {
      return param.default !== undefined && typeof param.default === "number"
        ? param.default
        : null
    }
    const max =
      param.name === "pageSize" || param.name === "limit"
        ? Math.min(param.max ?? 20, 20)
        : param.max
    return max != null ? Math.min(numberValue, max) : numberValue
  }
  if (param.type === "boolean") {
    return typeof value === "boolean" ? value : null
  }
  const text = String(value)
  if (param.type === "date") {
    return isChatRootsyIsoDate(text) ? text : null
  }
  if (param.type === "enum" && param.values && !param.values.includes(text)) {
    return param.default !== undefined ? param.default : null
  }
  return text
}

export function validateChatRootsyPlannerCall(
  raw: {
    tool?: unknown
    filters?: unknown
    path?: unknown
    method?: unknown
    body?: unknown
  },
  context?: ChatRootsyToolMatchContext,
  options?: { enforceRecent?: boolean },
): ChatRootsyToolProposal | null {
  const tool = typeof raw.tool === "string" ? raw.tool.trim() : ""
  const path = typeof raw.path === "string" ? raw.path.trim() : ""
  const resolved = resolveChatRootsyPlannerRequest({
    id: tool,
    path,
    method: raw.method,
  })
  if (resolved.ok) {
    const filters = readChatRootsyPlannerFilters({
      ...resolved.pathParams,
      ...(raw.filters && typeof raw.filters === "object" && !Array.isArray(raw.filters)
        ? (raw.filters as Record<string, unknown>)
        : {}),
    })
    const body =
      resolved.endpoint.method === "GET"
        ? undefined
        : readChatRootsyPlannerBody(raw.body)
    return {
      tool: resolved.endpoint.id,
      filters,
      method: resolved.endpoint.method,
      path: resolved.endpoint.path,
      body,
      request: formatChatRootsyPlannerRequest(resolved.endpoint, filters, body),
    }
  }
  if (!tool) return null
  const entry = getChatRootsyRegistryEntry(tool)
  if (
    !entry ||
    entry.status !== "enabled" ||
    entry.kind !== "read" ||
    entry.requiresConfirmation ||
    !isChatRootsyToolName(entry.name)
  ) {
    return null
  }
  if (
    options?.enforceRecent !== false &&
    entry.requiresRecent?.length &&
    !findRecentToolUse(context, [...entry.requiresRecent])
  ) {
    return null
  }

  const incoming =
    raw.filters && typeof raw.filters === "object" && !Array.isArray(raw.filters)
      ? (raw.filters as Record<string, unknown>)
      : {}

  const allowed = new Set(entry.params.map((param) => param.name))
  for (const key of Object.keys(incoming)) {
    if (!allowed.has(key)) return null
  }

  const filters: ChatRootsyToolFilters = {}
  for (const param of entry.params) {
    const coerced = coerceFilterValue(param, incoming[param.name])
    if (coerced === null) {
      if (param.required || incoming[param.name] !== undefined) return null
      continue
    }
    if (coerced === undefined) continue
    filters[param.name] = coerced
  }

  if (
    typeof filters.from === "string" &&
    typeof filters.to === "string" &&
    filters.from > filters.to
  ) {
    return null
  }

  return { tool: entry.name as ChatRootsyToolName, filters }
}

export function validateChatRootsyPlannerPlan(
  plan: ChatRootsyPlannerPlan,
  context?: ChatRootsyToolMatchContext,
): ChatRootsyValidatedPlan {
  const seen = new Set<string>()
  const plannedIds = new Set(plan.queries.map((query) => query.id))
  const proposals: ChatRootsyToolProposal[] = []
  let discarded = 0

  for (const query of plan.queries.slice(0, CHAT_ROOTSY_PLANNER_MAX_CALLS)) {
    const entry = getChatRootsyRegistryEntry(query.id)
    const depsCovered =
      !entry?.requiresRecent?.length ||
      entry.requiresRecent.every(
        (dep) =>
          plannedIds.has(dep) || Boolean(findRecentToolUse(context, [dep])),
      )
    const proposal = validateChatRootsyPlannerCall(
      {
        tool: query.id,
        path: query.path,
        method: query.method,
        filters: query.filters,
        body: query.body,
      },
      context,
      { enforceRecent: !depsCovered },
    )
    if (!proposal) {
      discarded += 1
      continue
    }
    const key = [
      proposal.method ?? "GET",
      proposal.path ?? proposal.tool,
      JSON.stringify(proposal.filters),
      JSON.stringify(proposal.body ?? {}),
    ].join("\n")
    if (seen.has(key)) {
      discarded += 1
      continue
    }
    seen.add(key)
    const next = {
      ...proposal,
      action: query.action,
      confirm: query.confirm,
    }
    proposals.push({
      ...next,
      offerKey: chatRootsyOfferKey(next),
    })
  }

  const clarifyingQuestion =
    proposals.length === 0
      ? plan.clarifyingQuestion ??
        (discarded > 0
          ? "Esa consulta pide filtros que todavía no puedo usar. ¿La vemos de este mes o esperamos?"
          : undefined)
      : undefined

  return {
    proposals,
    clarifyingQuestion,
    discarded,
    done: plan.done,
    informe: plan.informe,
  }
}

export function plannerIndexSupportsDateRange(
  index: readonly ChatRootsyPlannerIndexEntry[],
): boolean {
  return index.some((entry) =>
    entry.params.some((param) => param.name === "from" || param.type === "date"),
  )
}

export function buildChatRootsyPlannerUserPayload(input: {
  body: string
  today: string
  dataRequest: ChatRootsyDataRequest
  index: readonly ChatRootsyPlannerIndexEntry[]
  context?: ChatRootsyToolMatchContext
  paso?: number
  resultados?: ChatRootsyPlannerResultado[]
  accionesSesion?: ChatRootsyCloseHecho[]
}): string {
  const acciones = input.accionesSesion?.length
    ? compactChatRootsySessionActions(input.accionesSesion)
    : undefined
  return JSON.stringify({
    today: input.today,
    message: input.body,
    data_request: input.dataRequest,
    paso: input.paso && input.paso > 0 ? input.paso : 1,
    resultados: input.resultados ?? [],
    ...(acciones
      ? {
          acciones_sesion: acciones,
          nota_acciones_sesion:
            "Si el pedido deshace o sigue estos cambios, usá todos los ítems. No te quedes con uno. Pedido en plural/conjunto: GET confirm_many. Ítems ya identificados: GET confirm y PATCH de cada uno.",
        }
      : {}),
    recent: (input.context?.recent ?? []).map((row) => ({
      id: row.tool,
      names: row.items.map((item) => item.name).slice(0, 5),
    })),
    catalog: input.index,
  })
}

export function orderChatRootsyProposals(
  proposals: ChatRootsyToolProposal[],
): ChatRootsyToolProposal[] {
  const named = proposals.filter((row) => isChatRootsyToolName(row.tool))
  const rest = proposals.filter((row) => !isChatRootsyToolName(row.tool))
  const byTool = new Map(named.map((row) => [row.tool, row]))
  const ordered: ChatRootsyToolProposal[] = []
  const seen = new Set<string>()

  const visit = (name: string) => {
    const proposal = byTool.get(name)
    if (!proposal || seen.has(proposal.tool)) return
    const entry = getChatRootsyRegistryEntry(proposal.tool)
    for (const dep of entry?.requiresRecent ?? []) visit(dep)
    seen.add(proposal.tool)
    ordered.push(proposal)
  }

  for (const proposal of named) visit(proposal.tool)
  return [...ordered, ...rest]
}
