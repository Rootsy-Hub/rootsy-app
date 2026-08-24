import { isChatRootsyIsoDate } from "@/lib/chat/tools/chatRootsyToolPlanner"

const PERIODS = [
  "this_month",
  "last_month",
  "this_week",
  "today",
  "yesterday",
  "this_year",
] as const

const FILTER_KEYS = ["limit", "direction", "sort", "q"] as const

export type ChatRootsyDataRequestPeriod = (typeof PERIODS)[number]

export type ChatRootsyDataRequestTime = {
  from?: string
  to?: string
  period?: ChatRootsyDataRequestPeriod
  note?: string
}

export type ChatRootsyDataRequestFilters = {
  limit?: number
  direction?: string
  sort?: string
  q?: string
}

export type ChatRootsyDataRequest = {
  objective: string
  time?: ChatRootsyDataRequestTime
  filters?: ChatRootsyDataRequestFilters
}

export type ChatRootsyFirstTurn = {
  reply: string
  data_request: ChatRootsyDataRequest | null
  task_title?: string
}

const FORBIDDEN = /https?:\/\/|sk-[a-zA-Z0-9_-]+|\/v1\/|endpoint|token/i

function cleanText(value: string, max: number): string {
  return value.replace(FORBIDDEN, "").replace(/\s+/g, " ").trim().slice(0, max)
}

function readObject(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {}
  return raw as Record<string, unknown>
}

function readIsoDate(value: unknown): string | null | undefined {
  if (value === undefined) return undefined
  if (typeof value !== "string" || !isChatRootsyIsoDate(value)) return null
  return value
}

function readPeriod(value: unknown): ChatRootsyDataRequestPeriod | null | undefined {
  if (value === undefined) return undefined
  if (typeof value !== "string") return null
  if (!(PERIODS as readonly string[]).includes(value)) return null
  return value as ChatRootsyDataRequestPeriod
}

export function validateChatRootsyDataRequest(
  raw: unknown,
): ChatRootsyDataRequest | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null
  const row = raw as {
    objective?: unknown
    time?: unknown
    filters?: unknown
  }
  if (typeof row.objective !== "string") return null
  const objective = cleanText(row.objective, 200)
  if (!objective || FORBIDDEN.test(row.objective)) return null

  const timeRaw = readObject(row.time)
  const filtersRaw = readObject(row.filters)
  const time: ChatRootsyDataRequestTime = {}
  const filters: ChatRootsyDataRequestFilters = {}

  const from = readIsoDate(timeRaw.from ?? filtersRaw.from)
  const to = readIsoDate(timeRaw.to ?? filtersRaw.to)
  const period = readPeriod(timeRaw.period ?? filtersRaw.period)
  if (from === null || to === null || period === null) return null
  if (from) time.from = from
  if (to) time.to = to
  if (period) time.period = period
  if (time.from && time.to && time.from > time.to) return null

  const noteRaw = timeRaw.note
  if (noteRaw !== undefined) {
    if (typeof noteRaw !== "string" || FORBIDDEN.test(noteRaw)) return null
    const note = cleanText(noteRaw, 80)
    if (note) time.note = note
  }

  for (const key of FILTER_KEYS) {
    const value = filtersRaw[key]
    if (value === undefined) continue
    if (key === "limit") {
      const numberValue = typeof value === "number" ? value : Number(value)
      if (!Number.isFinite(numberValue)) return null
      filters.limit = Math.min(Math.max(1, Math.floor(numberValue)), 5)
      continue
    }
    if (typeof value !== "string") return null
    const text = cleanText(value, 40)
    if (!text) continue
    if (key === "direction") filters.direction = text
    if (key === "sort") filters.sort = text
    if (key === "q") filters.q = text
  }

  return {
    objective,
    ...(Object.keys(time).length ? { time } : {}),
    ...(Object.keys(filters).length ? { filters } : {}),
  }
}

export function validateChatRootsyTaskTitle(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined
  if (FORBIDDEN.test(raw)) return undefined
  const text = cleanText(raw, 56).replace(/[.。]+$/g, "")
  return text || undefined
}

export function peekChatRootsyFirstTurnJson(raw: string): unknown {
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null
  try {
    return JSON.parse(jsonMatch[0]) as unknown
  } catch {
    return null
  }
}

export function parseChatRootsyFirstTurn(raw: string): ChatRootsyFirstTurn | null {
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null
  try {
    const parsed = JSON.parse(jsonMatch[0]) as {
      reply?: unknown
      data_request?: unknown
      task_title?: unknown
    }
    if (typeof parsed.reply !== "string") return null
    const reply = parsed.reply.replace(FORBIDDEN, "").trim()
    if (!reply) return null
    const data_request =
      parsed.data_request == null
        ? null
        : validateChatRootsyDataRequest(parsed.data_request)
    if (parsed.data_request != null && data_request == null) {
      return { reply, data_request: null }
    }
    const task_title =
      data_request != null
        ? validateChatRootsyTaskTitle(parsed.task_title)
        : undefined
    return {
      reply,
      data_request,
      ...(task_title ? { task_title } : {}),
    }
  } catch {
    return null
  }
}

export function fallbackChatRootsyFirstTurn(reply: string): ChatRootsyFirstTurn {
  return { reply, data_request: null }
}

export function shouldCallChatRootsyPlanner(
  turn: ChatRootsyFirstTurn,
): turn is ChatRootsyFirstTurn & { data_request: ChatRootsyDataRequest } {
  return turn.data_request != null
}

export function logChatRootsyDataRequest(
  request: ChatRootsyDataRequest | null,
): void {
  if (!request) {
    console.info("[rootsy-data-request]", { requested: false })
    return
  }
  console.info("[rootsy-data-request]", {
    requested: true,
    timeKeys: request.time ? Object.keys(request.time) : [],
    filterKeys: request.filters ? Object.keys(request.filters) : [],
    objective: request.objective.slice(0, 80),
  })
}
