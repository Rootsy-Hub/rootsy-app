import type { ChatRootsyPlanStep, ChatRootsyPlannerSlot } from "@/lib/chat/chatRootsyPlannerPlan"
import type { ChatRootsyToolItem } from "@/app/[siteId]/[popId]/chat/chatTypes"
import type { ChatRootsyCloseHecho } from "@/lib/chat/chatRootsyCloseBrief"
import type { ChatRootsyDataRequest } from "@/lib/chat/chatRootsyDataRequest"
import { compactChatRootsyApiPayload } from "@/lib/chat/chatRootsyApiQuery"

export const CHAT_ROOTSY_PLANNER_MAX_STEPS = 8

export type ChatRootsyPlannerConfirm = "confirm" | "confirm_one" | "confirm_many"

export type ChatRootsyPlannerResultado = {
  method: string
  path: string
  action: string
  confirm: ChatRootsyPlannerConfirm
  response: unknown
}

export type ChatRootsyPlannerInforme = {
  respuesta: string
  acciones: string[]
}

export type ChatRootsyPlannerRun = {
  message: string
  dataRequest: ChatRootsyDataRequest
  taskTitle?: string
  paso: number
  plan?: ChatRootsyPlanStep[]
  slots?: ChatRootsyPlannerSlot[]
  resultados: ChatRootsyPlannerResultado[]
  aplicados?: ChatRootsyCloseHecho[]
  accionesSesion?: ChatRootsyCloseHecho[]
  informe?: ChatRootsyPlannerInforme
}

export type ChatRootsyPlannerChoice = {
  tool: string
  method: string
  path: string
  action: string
  items: ChatRootsyToolItem[]
  payload?: unknown
  confirm?: ChatRootsyPlannerConfirm
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
  if (
    value === "confirm_many" ||
    value === "choose_many" ||
    value === "confirm_some"
  ) {
    return "confirm_many"
  }
  return "confirm"
}

export function isChatRootsyPlannerPickConfirm(
  confirm: ChatRootsyPlannerConfirm,
): confirm is "confirm_one" | "confirm_many" {
  return confirm === "confirm_one" || confirm === "confirm_many"
}

export function looksLikeChatRootsyPluralPedido(message: string): boolean {
  return /\b(todas?|todos|ambos|ambas|varios|varias|las|los)\b/i.test(message)
}

export function looksLikeChatRootsyWritePedido(text: string): boolean {
  return /(?:^|[\s¿¡])(aument(?:ar|á|ale|arle)?|sub(?:ir|í|ile|irle)|baj(?:ar|á|ale|arle)|elimin(?:ar|á)|borr(?:ar|á)|cre(?:ar|á)|actualiz(?:ar|á)|cambi(?:ar|á|ale|arle))(?=$|[\s,.;:!?])/i.test(
    text,
  )
}

export function resolveChatRootsyPlannerPickConfirm(input: {
  confirm: ChatRootsyPlannerConfirm
  message: string
  objective?: string
  itemCount: number
}): ChatRootsyPlannerConfirm {
  if (!isChatRootsyPlannerPickConfirm(input.confirm)) return input.confirm
  if (input.itemCount <= 1) return "confirm_one"
  const text = `${input.message} ${input.objective ?? ""}`
  if (!looksLikeChatRootsyWritePedido(text)) return "confirm"
  if (input.confirm === "confirm_many") return "confirm_many"
  if (looksLikeChatRootsyPluralPedido(text)) return "confirm_many"
  return "confirm_one"
}

export function chatRootsyChoiceItemKey(
  item: Pick<ChatRootsyToolItem, "id" | "name">,
): string {
  return item.id?.trim() || item.name
}

function looksLikeEndpoint(value: string): boolean {
  return (
    ACTION_FORBIDDEN.test(value) ||
    /^(GET|POST|PATCH|PUT|DELETE)\s/i.test(value) ||
    /\/v1\/|\/pops\//i.test(value)
  )
}

export function sanitizeChatRootsyPlannerActionLine(raw: unknown): string {
  const text =
    typeof raw === "string" ? raw.replace(/\s+/g, " ").trim().slice(0, 140) : ""
  if (text && !looksLikeEndpoint(text)) return text
  return ""
}

export function sanitizeChatRootsyPlannerAction(
  raw: unknown,
  fallback: string,
): string {
  return (
    sanitizeChatRootsyPlannerActionLine(raw) ||
    sanitizeChatRootsyPlannerActionLine(fallback) ||
    "Continuar con esta acción"
  )
}

function sanitizePlannerRespuesta(raw: unknown): string {
  if (typeof raw !== "string") return ""
  return raw
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\bsk-[a-zA-Z0-9_-]+\b/g, "")
    .replace(/\b(GET|POST|PATCH|PUT|DELETE)\s+\/v1\/\S+/gi, "")
    .replace(/\/v1\/pops\/\S+/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1200)
}

function readPlannerAcciones(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const acciones: string[] = []
  for (const row of raw.slice(0, 8)) {
    const text = sanitizeChatRootsyPlannerActionLine(row)
    if (text) acciones.push(text)
  }
  return acciones
}

export function readChatRootsyPlannerInforme(
  raw: unknown,
): ChatRootsyPlannerInforme | undefined {
  const record = asRecord(raw)
  if (!record) return undefined
  const nested = asRecord(record.informe)
  const respuesta = sanitizePlannerRespuesta(
    record.respuesta ?? record.reply ?? nested?.respuesta,
  )
  const acciones = readPlannerAcciones(
    Array.isArray(record.acciones) ? record.acciones : nested?.acciones,
  )
  if (!respuesta && !acciones.length) return undefined
  return { respuesta, acciones }
}

export function completeChatRootsyPlannerInforme(
  informe: ChatRootsyPlannerInforme | undefined,
  resultados: ChatRootsyPlannerResultado[],
): ChatRootsyPlannerInforme | undefined {
  if (informe?.acciones.length) return informe
  const acciones = resultados
    .map((row) => sanitizeChatRootsyPlannerActionLine(row.action))
    .filter((text): text is string => Boolean(text))
    .slice(0, 8)
  if (!informe?.respuesta && !acciones.length) return undefined
  return {
    respuesta: informe?.respuesta ?? "",
    acciones,
  }
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

export function preferChatRootsyPlannerAction(
  ofertaAction: unknown,
  stepAction: unknown,
  method?: string,
): string {
  const generic = fallbackChatRootsyPlannerAction(method)
  const fromOferta = sanitizeChatRootsyPlannerActionLine(ofertaAction)
  if (fromOferta && fromOferta !== generic) return fromOferta
  const fromStep = sanitizeChatRootsyPlannerActionLine(stepAction)
  if (fromStep) return fromStep
  return fromOferta || generic
}

export function buildChatRootsyPlannerStoredPayload(input: {
  today: string
  dataRequest: ChatRootsyDataRequest
}): string {
  return JSON.stringify({
    today: input.today,
    data_request: { objective: input.dataRequest.objective },
  })
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

export function pickChatRootsyPlannerSelectedResponses(
  payload: unknown,
  items: Array<Pick<ChatRootsyToolItem, "id" | "name" | "sales" | "balance">>,
): unknown[] {
  return items.map((item) => pickChatRootsyPlannerSelectedResponse(payload, item))
}

export function compactChatRootsyPlannerChoiceResponse(
  choice: Pick<ChatRootsyPlannerChoice, "confirm" | "payload">,
  items: Array<Pick<ChatRootsyToolItem, "id" | "name" | "sales" | "balance">>,
): unknown {
  const rows = pickChatRootsyPlannerSelectedResponses(choice.payload, items)
  if (choice.confirm === "confirm_many") return rows
  return rows[0] ?? null
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
