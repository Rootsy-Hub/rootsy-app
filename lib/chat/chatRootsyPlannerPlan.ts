import type { ChatRootsyToolItem } from "@/app/[siteId]/[popId]/chat/chatTypes"
import {
  chatRootsyChoiceItemKey,
  preferChatRootsyPlannerAction,
  isChatRootsyPlannerPickConfirm,
  looksLikeChatRootsyPluralPedido,
  pickChatRootsyPlannerSelectedResponse,
  readChatRootsyPlannerConfirm,
  resolveChatRootsyPlannerPickConfirm,
  sanitizeChatRootsyPlannerActionLine,
  CHAT_ROOTSY_PLANNER_MAX_STEPS,
  type ChatRootsyPlannerChoice,
  type ChatRootsyPlannerConfirm,
  type ChatRootsyPlannerRun,
} from "@/lib/chat/chatRootsyPlannerStep"
import { readChatRootsyPlannerBody } from "@/lib/chat/chatRootsyApiQuery"
import { normalizeChatRootsyApiMethod } from "@/lib/chat/apiDocumentacion"

export const CHAT_ROOTSY_PLAN_BINDING =
  /^\$(\d+)\[(\d+)\](?:\.items\[\])?\.([A-Za-z_][A-Za-z0-9_]*)$/

const FIELD_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/
const MAX_OFERTAS = 8
const MAX_DEMANDAS = 12
const MAX_EXPAND = 50

export type ChatRootsyPlanBinding = {
  paso: number
  oferta: number
  field: string
  items: boolean
}

export type ChatRootsyPlanOferta = {
  method: string
  path: string
  params: Record<string, unknown>
  body?: Record<string, unknown>
  action: string
}

export type ChatRootsyPlanStep = {
  paso: number
  action: string
  confirm: ChatRootsyPlannerConfirm
  ofertas: ChatRootsyPlanOferta[]
  demandas: string[]
}

export type ChatRootsyPlannerSlot = {
  paso: number
  oferta: number
  tool: string
  method: string
  path: string
  action: string
  rows: Record<string, unknown>[]
  items: ChatRootsyToolItem[]
  payload?: unknown
}

export type ChatRootsyPlanAdvance =
  | { kind: "pick"; choice: ChatRootsyPlannerChoice; run: ChatRootsyPlannerRun }
  | { kind: "offers"; queries: ChatRootsyPlanOferta[]; run: ChatRootsyPlannerRun }
  | { kind: "done"; run: ChatRootsyPlannerRun }

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

export function parseChatRootsyPlanBinding(
  raw: string,
): ChatRootsyPlanBinding | null {
  const match = CHAT_ROOTSY_PLAN_BINDING.exec(raw.trim())
  if (!match) return null
  const paso = Number(match[1])
  const oferta = Number(match[2])
  const field = match[3]
  if (!paso || paso < 1 || oferta < 0 || !field) return null
  return {
    paso,
    oferta,
    field,
    items: raw.includes(".items[]"),
  }
}

export function chatRootsyPlanHasBinding(value: unknown): boolean {
  if (typeof value === "string") return Boolean(parseChatRootsyPlanBinding(value))
  if (value && typeof value === "object") {
    const row = asRecord(value)
    if (row && typeof row.from === "string") {
      return Boolean(parseChatRootsyPlanBinding(row.from))
    }
    if (Array.isArray(value)) return value.some(chatRootsyPlanHasBinding)
    return Object.values(value as Record<string, unknown>).some(
      chatRootsyPlanHasBinding,
    )
  }
  return false
}

function readDemandas(raw: unknown): string[] {
  if (!Array.isArray(raw)) return ["id", "name"]
  const fields: string[] = []
  for (const row of raw.slice(0, MAX_DEMANDAS)) {
    if (typeof row !== "string") continue
    const field = row.trim()
    if (!FIELD_NAME.test(field)) continue
    if (!fields.includes(field)) fields.push(field)
  }
  return fields.length ? fields : ["id", "name"]
}

function readOferta(
  raw: unknown,
  stepAction?: string,
  fallbackConfirmMethod?: string,
): ChatRootsyPlanOferta | null {
  const row = asRecord(raw)
  if (!row) return null
  const method =
    normalizeChatRootsyApiMethod(row.method) ??
    (fallbackConfirmMethod
      ? normalizeChatRootsyApiMethod(fallbackConfirmMethod)
      : undefined)
  const path = typeof row.path === "string" ? row.path.trim() : ""
  if (!method || !path) return null
  const paramsRaw = row.params ?? row.filters
  const params = asRecord(paramsRaw) ?? {}
  const body = method === "GET" ? undefined : readChatRootsyPlannerBody(row.body)
  return {
    method,
    path,
    params: { ...params },
    ...(body ? { body } : {}),
    action: preferChatRootsyPlannerAction(row.action, stepAction, method),
  }
}

function readStep(raw: unknown, index: number): ChatRootsyPlanStep | null {
  const row = asRecord(raw)
  if (!row) return null
  const stepAction = sanitizeChatRootsyPlannerActionLine(row.action)
  const ofertasRaw = Array.isArray(row.ofertas)
    ? row.ofertas
    : Array.isArray(row.queries)
      ? row.queries
      : []
  const ofertas: ChatRootsyPlanOferta[] = []
  for (const oferta of ofertasRaw.slice(0, MAX_OFERTAS)) {
    const parsed = readOferta(oferta, stepAction)
    if (parsed) ofertas.push(parsed)
  }
  if (!ofertas.length) return null
  const pasoRaw = typeof row.paso === "number" ? row.paso : index + 1
  const paso = Number.isFinite(pasoRaw) && pasoRaw > 0 ? Math.floor(pasoRaw) : index + 1
  return {
    paso,
    action: stepAction || ofertas[0]?.action || "Continuar",
    confirm: readChatRootsyPlannerConfirm(row.confirm),
    ofertas,
    demandas: readDemandas(row.demandas),
  }
}

export function readChatRootsyExecutionPlan(raw: unknown): ChatRootsyPlanStep[] {
  const root = asRecord(raw)
  if (!root) return []
  const planRaw = Array.isArray(root.plan) ? root.plan : null
  if (planRaw) {
    const steps: ChatRootsyPlanStep[] = []
    for (const [index, row] of planRaw.slice(0, CHAT_ROOTSY_PLANNER_MAX_STEPS).entries()) {
      const step = readStep(row, index)
      if (step) steps.push(step)
    }
    return steps
  }
  const queries = Array.isArray(root.queries)
    ? root.queries
    : Array.isArray(root.toolCalls)
      ? root.toolCalls
      : null
  if (!queries?.length) return []
  const ofertas: ChatRootsyPlanOferta[] = []
  let confirm: ChatRootsyPlannerConfirm = "confirm"
  let action = ""
  for (const query of queries.slice(0, MAX_OFERTAS)) {
    const parsed = readOferta(query)
    if (!parsed) continue
    ofertas.push(parsed)
    const row = asRecord(query)
    if (row) {
      confirm = readChatRootsyPlannerConfirm(row.confirm)
      if (!action) action = parsed.action
    }
  }
  if (!ofertas.length) return []
  return [
    {
      paso: 1,
      action: action || ofertas[0]!.action,
      confirm,
      ofertas,
      demandas: ["id", "name", "salePrice"],
    },
  ]
}

function rowField(row: Record<string, unknown>, field: string): unknown {
  if (row[field] !== undefined) return row[field]
  if (field === "salePrice" && row.sales !== undefined) return row.sales
  if (field === "id") {
    return row.articleId ?? row.accountId ?? row.partyId ?? row.userId
  }
  return undefined
}

function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return value
  return Math.round(value * 100) / 100
}

function lookupBinding(
  binding: ChatRootsyPlanBinding,
  slots: ChatRootsyPlannerSlot[],
  currentRow?: Record<string, unknown>,
): unknown {
  if (currentRow && binding.items) return rowField(currentRow, binding.field)
  const slot = slots.find(
    (row) => row.paso === binding.paso && row.oferta === binding.oferta,
  )
  if (!slot) return undefined
  const row = currentRow && binding.items ? currentRow : slot.rows[0]
  if (!row) return undefined
  return rowField(row, binding.field)
}

export function resolveChatRootsyPlanValue(
  value: unknown,
  slots: ChatRootsyPlannerSlot[],
  currentRow?: Record<string, unknown>,
): unknown {
  if (typeof value === "string") {
    const binding = parseChatRootsyPlanBinding(value)
    if (!binding) return value
    return lookupBinding(binding, slots, currentRow)
  }
  const row = asRecord(value)
  if (row && typeof row.from === "string") {
    const base = resolveChatRootsyPlanValue(row.from, slots, currentRow)
    const numberValue = typeof base === "number" ? base : Number(base)
    if (!Number.isFinite(numberValue)) return base
    if (row.factor != null) {
      const factor = typeof row.factor === "number" ? row.factor : Number(row.factor)
      if (Number.isFinite(factor)) return roundMoney(numberValue * factor)
    }
    if (row.add != null) {
      const add = typeof row.add === "number" ? row.add : Number(row.add)
      if (Number.isFinite(add)) return roundMoney(numberValue + add)
    }
    return numberValue
  }
  if (Array.isArray(value)) {
    return value.map((item) => resolveChatRootsyPlanValue(item, slots, currentRow))
  }
  if (row) {
    const next: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(row)) {
      const resolved = resolveChatRootsyPlanValue(item, slots, currentRow)
      if (resolved !== undefined) next[key] = resolved
    }
    return next
  }
  return value
}

function collectionBindingOf(oferta: ChatRootsyPlanOferta): ChatRootsyPlanBinding | null {
  const values: unknown[] = [
    ...Object.values(oferta.params),
    ...Object.values(oferta.body ?? {}),
  ]
  for (const value of values) {
    if (typeof value === "string") {
      const binding = parseChatRootsyPlanBinding(value)
      if (binding?.items) return binding
    }
    const row = asRecord(value)
    if (row && typeof row.from === "string") {
      const binding = parseChatRootsyPlanBinding(row.from)
      if (binding?.items) return binding
    }
  }
  return null
}

function resolvedParams(
  params: Record<string, unknown>,
  slots: ChatRootsyPlannerSlot[],
  currentRow?: Record<string, unknown>,
): Record<string, string | number | boolean> {
  const next: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(params)) {
    const resolved = resolveChatRootsyPlanValue(value, slots, currentRow)
    if (
      typeof resolved === "string" ||
      typeof resolved === "number" ||
      typeof resolved === "boolean"
    ) {
      next[key] = resolved
    }
  }
  return next
}

export function instantiateChatRootsyPlanOferta(
  oferta: ChatRootsyPlanOferta,
  slots: ChatRootsyPlannerSlot[],
): ChatRootsyPlanOferta[] {
  const collection = collectionBindingOf(oferta)
  const rows = collection
    ? slots.find(
        (slot) => slot.paso === collection.paso && slot.oferta === collection.oferta,
      )?.rows ?? []
    : [undefined]
  const expanded: ChatRootsyPlanOferta[] = []
  for (const row of rows.slice(0, MAX_EXPAND)) {
    const params = resolvedParams(oferta.params, slots, row)
    const body = oferta.body
      ? (resolveChatRootsyPlanValue(oferta.body, slots, row) as Record<
          string,
          unknown
        >)
      : undefined
    expanded.push({
      method: oferta.method,
      path: oferta.path,
      params,
      ...(body && typeof body === "object" && !Array.isArray(body) ? { body } : {}),
      action: oferta.action,
    })
  }
  return expanded
}

export function instantiateChatRootsyPlanStep(
  step: ChatRootsyPlanStep,
  slots: ChatRootsyPlannerSlot[],
): ChatRootsyPlanOferta[] {
  return step.ofertas.flatMap((oferta) =>
    instantiateChatRootsyPlanOferta(
      {
        ...oferta,
        action: preferChatRootsyPlannerAction(
          oferta.action,
          step.action,
          oferta.method,
        ),
      },
      slots,
    ),
  )
}

export function extractChatRootsyPlannerSlot(input: {
  paso: number
  oferta: number
  tool: string
  method: string
  path: string
  action: string
  demandas: string[]
  items: ChatRootsyToolItem[]
  payload?: unknown
}): ChatRootsyPlannerSlot {
    const rows = input.items.length
    ? input.items.map((item) => {
        const compact = asRecord(
          pickChatRootsyPlannerSelectedResponse(input.payload, item),
        )
        const row: Record<string, unknown> = compact ? { ...compact } : {}
        if (item.id && row.id == null) row.id = item.id
        if (item.name) row.name = item.name
        if (item.sales != null && row.salePrice == null) row.salePrice = item.sales
        return row
      })
    : (() => {
        const compact = asRecord(input.payload)
        return compact ? [compact] : []
      })()
  return {
    paso: input.paso,
    oferta: input.oferta,
    tool: input.tool,
    method: input.method,
    path: input.path,
    action: input.action,
    rows,
    items: input.items,
    payload: input.payload,
  }
}

export function selectChatRootsyPlannerSlotRows(
  slot: ChatRootsyPlannerSlot,
  items: Array<Pick<ChatRootsyToolItem, "id" | "name">>,
): ChatRootsyPlannerSlot {
  const keys = new Set(items.map((item) => chatRootsyChoiceItemKey(item)))
  const nextItems = slot.items.filter((item) =>
    keys.has(chatRootsyChoiceItemKey(item)),
  )
  const nextRows = slot.rows.filter((row) => {
    const id = typeof row.id === "string" ? row.id : ""
    const name = typeof row.name === "string" ? row.name : ""
    return keys.has(id || name)
  })
  return {
    ...slot,
    items: nextItems,
    rows: nextRows.length ? nextRows : nextItems.map((item) => ({
      id: item.id,
      name: item.name,
      salePrice: item.sales,
    })),
  }
}

function slotsForPaso(
  slots: ChatRootsyPlannerSlot[],
  paso: number,
): ChatRootsyPlannerSlot | undefined {
  for (let index = slots.length - 1; index >= 0; index -= 1) {
    const slot = slots[index]
    if (slot && slot.paso === paso && slot.items.length) return slot
  }
  return undefined
}

function stepLooksLikeGet(step: ChatRootsyPlanStep): boolean {
  return (
    step.ofertas.length > 0 &&
    step.ofertas.every((oferta) => {
      const method = normalizeChatRootsyApiMethod(oferta.method)
      return method === "GET" || !method
    })
  )
}

function stepLooksLikeWrite(step: ChatRootsyPlanStep): boolean {
  return step.ofertas.some((oferta) => {
    const method = normalizeChatRootsyApiMethod(oferta.method)
    return (
      method === "POST" ||
      method === "PATCH" ||
      method === "PUT" ||
      method === "DELETE"
    )
  })
}

function pickConfirmForCurrentStep(input: {
  current: ChatRootsyPlanStep
  next?: ChatRootsyPlanStep
  run: ChatRootsyPlannerRun
  objective?: string
  itemCount: number
}): ChatRootsyPlannerConfirm {
  const objective = input.objective ?? input.run.dataRequest.objective
  const fromCurrent = resolveChatRootsyPlannerPickConfirm({
    confirm: input.current.confirm,
    message: input.run.message,
    objective,
    itemCount: input.itemCount,
  })
  if (isChatRootsyPlannerPickConfirm(fromCurrent)) return fromCurrent
  if (
    !input.next ||
    !stepLooksLikeGet(input.current) ||
    !stepLooksLikeWrite(input.next)
  ) {
    return fromCurrent
  }
  const inferred: ChatRootsyPlannerConfirm = looksLikeChatRootsyPluralPedido(
    `${input.run.message} ${objective ?? ""}`,
  )
    ? "confirm_many"
    : "confirm_one"
  return resolveChatRootsyPlannerPickConfirm({
    confirm: inferred,
    message: input.run.message,
    objective,
    itemCount: input.itemCount,
  })
}

export function advanceChatRootsyPlannerRun(input: {
  run: ChatRootsyPlannerRun
  objective?: string
  afterPick?: boolean
}): ChatRootsyPlanAdvance {
  const plan = input.run.plan ?? []
  const currentIndex = Math.max(0, input.run.paso - 1)
  const current = plan[currentIndex]
  const next = plan[currentIndex + 1]
  if (!input.afterPick && current) {
    const slot = slotsForPaso(input.run.slots ?? [], current.paso)
    const pick = pickConfirmForCurrentStep({
      current,
      next,
      run: input.run,
      objective: input.objective,
      itemCount: slot?.items.length ?? 0,
    })
    if (isChatRootsyPlannerPickConfirm(pick) && slot?.items.length) {
      return {
        kind: "pick",
        run: input.run,
        choice: {
          tool: slot.tool,
          method: slot.method,
          path: slot.path,
          action: current.action,
          items: slot.items,
          payload: slot.payload,
          confirm: pick,
        },
      }
    }
  }
  if (!next) {
    return { kind: "done", run: input.run }
  }
  const run: ChatRootsyPlannerRun = {
    ...input.run,
    paso: next.paso,
  }
  const queries = instantiateChatRootsyPlanStep(next, input.run.slots ?? [])
  if (!queries.length) return { kind: "done", run }
  return { kind: "offers", queries, run }
}

export function instantiateCurrentChatRootsyPlanStep(
  run: ChatRootsyPlannerRun,
): ChatRootsyPlanOferta[] {
  const step =
    run.plan?.find((row) => row.paso === run.paso) ??
    run.plan?.[Math.max(0, run.paso - 1)]
  if (!step) return []
  return instantiateChatRootsyPlanStep(step, run.slots ?? [])
}

export function queriesToPlannerProposalsShape(
  queries: ChatRootsyPlanOferta[],
  confirm?: ChatRootsyPlannerConfirm,
): Array<{
  path: string
  method: string
  filters: Record<string, string | number | boolean>
  body?: Record<string, unknown>
  action: string
  confirm?: ChatRootsyPlannerConfirm
}> {
  return queries.map((query) => {
    const filters: Record<string, string | number | boolean> = {}
    for (const [key, value] of Object.entries(query.params)) {
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        filters[key] = value
      }
    }
    return {
      path: query.path,
      method: query.method,
      filters,
      body: query.body,
      action: query.action,
      confirm,
    }
  })
}
