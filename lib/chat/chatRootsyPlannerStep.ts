import type { ChatRootsyToolItem } from "@/app/[siteId]/[popId]/chat/chatTypes"
import type { ChatRootsyCloseHecho } from "@/lib/chat/chatRootsyCloseBrief"
import type { ChatRootsyDataRequest } from "@/lib/chat/chatRootsyDataRequest"
import { compactChatRootsyApiPayload } from "@/lib/chat/chatRootsyApiQuery"

export const CHAT_ROOTSY_PLANNER_MAX_STEPS = 4

export type ChatRootsyPlannerConfirm = "confirm" | "confirm_one"

export type ChatRootsyPlannerResultado = {
  method: string
  path: string
  action: string
  confirm: ChatRootsyPlannerConfirm
  response: unknown
}

export type ChatRootsyPlannerRun = {
  message: string
  dataRequest: ChatRootsyDataRequest
  paso: number
  resultados: ChatRootsyPlannerResultado[]
  aplicados?: ChatRootsyCloseHecho[]
  accionesSesion?: ChatRootsyCloseHecho[]
}

export type ChatRootsyPlannerChoice = {
  tool: string
  method: string
  path: string
  action: string
  items: ChatRootsyToolItem[]
  payload?: unknown
}

const ACTION_FORBIDDEN = /https?:\/\/|sk-[a-zA-Z0-9_-]+|\/v1\/|endpoint|token/i

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

export function readChatRootsyPlannerConfirm(
  raw: unknown,
): ChatRootsyPlannerConfirm {
  const value = typeof raw === "string" ? raw.trim().toLowerCase() : ""
  if (value === "confirm_one" || value === "choose_one") return "confirm_one"
  return "confirm"
}

function looksLikeEndpoint(value: string): boolean {
  return (
    ACTION_FORBIDDEN.test(value) ||
    /^(GET|POST|PATCH|PUT|DELETE)\s/i.test(value) ||
    /\/v1\/|\/pops\//i.test(value)
  )
}

export function sanitizeChatRootsyPlannerAction(
  raw: unknown,
  fallback: string,
): string {
  const text =
    typeof raw === "string" ? raw.replace(/\s+/g, " ").trim().slice(0, 140) : ""
  if (text && !looksLikeEndpoint(text)) return text
  const safeFallback = fallback.replace(/\s+/g, " ").trim().slice(0, 140)
  if (safeFallback && !looksLikeEndpoint(safeFallback)) return safeFallback
  return "Continuar con esta acción"
}

export function canContinueChatRootsyPlanner(paso: number): boolean {
  return Number.isFinite(paso) && paso >= 1 && paso < CHAT_ROOTSY_PLANNER_MAX_STEPS
}

export function fallbackChatRootsyPlannerAction(
  method?: string,
): string {
  const verb = (method ?? "GET").toUpperCase()
  if (verb === "POST") return "Crear ese registro"
  if (verb === "PATCH" || verb === "PUT") return "Aplicar ese cambio"
  if (verb === "DELETE") return "Eliminar ese registro"
  return "Consultar esos datos"
}

export function buildChatRootsyPlannerStoredPayload(input: {
  today: string
  message: string
  dataRequest: ChatRootsyDataRequest
  paso?: number
  resultados?: ChatRootsyPlannerResultado[]
  accionesSesion?: ChatRootsyCloseHecho[]
}): string {
  const paso = input.paso && input.paso > 0 ? input.paso : 1
  const acciones = compactPlannerSessionActions(input.accionesSesion)
  return JSON.stringify({
    today: input.today,
    message: input.message,
    data_request: { objective: input.dataRequest.objective },
    paso,
    pasos_max: CHAT_ROOTSY_PLANNER_MAX_STEPS,
    resultados: input.resultados ?? [],
    ...(acciones
      ? {
          acciones_sesion: acciones,
          nota_acciones_sesion:
            "Si el pedido deshace o sigue estos cambios, usá todos los ítems. No te quedes con uno. Para varios ya identificados: GET con confirm (no confirm_one) y PATCH de cada uno.",
        }
      : {}),
  })
}

function compactPlannerSessionActions(
  acciones?: ChatRootsyCloseHecho[],
): Array<Record<string, unknown>> | undefined {
  if (!acciones?.length) return undefined
  return acciones.slice(-12).map((hecho) => ({
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

function rowId(row: Record<string, unknown>): string | null {
  const value =
    row.id ?? row.articleId ?? row.accountId ?? row.partyId ?? row.userId
  if (value == null) return null
  const id = String(value).trim()
  return id || null
}

function findRowById(value: unknown, id: string): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    for (const row of value) {
      const record = asRecord(row)
      if (record && rowId(record) === id) return record
    }
    return null
  }
  const record = asRecord(value)
  if (!record) return null
  if (rowId(record) === id) return record
  for (const key of [
    "data",
    "items",
    "articles",
    "rows",
    "results",
    "parties",
    "accounts",
    "members",
    "employees",
    "roles",
    "clients",
    "suppliers",
  ]) {
    const found = findRowById(record[key], id)
    if (found) return found
  }
  return null
}

export function pickChatRootsyPlannerSelectedResponse(
  payload: unknown,
  item: Pick<ChatRootsyToolItem, "id" | "name" | "sales" | "balance">,
): unknown {
  const id = item.id?.trim()
  if (id && payload != null) {
    const found = findRowById(payload, id)
    if (found) return compactChatRootsyApiPayload(found)
  }
  const fallback: Record<string, unknown> = {
    name: item.name,
  }
  if (id) fallback.id = id
  if (item.sales != null) fallback.salePrice = item.sales
  if (item.balance != null) fallback.balance = item.balance
  return fallback
}

export function chatRootsyOfferKey(offer: {
  tool: string
  method?: string
  path?: string
  filters?: Record<string, string | number | boolean>
  body?: Record<string, unknown>
  offerKey?: string
}): string {
  if (offer.offerKey?.trim()) return offer.offerKey.trim()
  return [
    offer.method ?? "",
    offer.path ?? offer.tool,
    JSON.stringify(offer.filters ?? {}),
    JSON.stringify(offer.body ?? {}),
  ].join("|")
}

export function compactChatRootsyPlannerResponse(raw: unknown): unknown {
  if (raw == null) return null
  return compactChatRootsyApiPayload(raw)
}
