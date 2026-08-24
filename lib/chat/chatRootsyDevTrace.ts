export function isChatRootsyDevTraceEnabled(): boolean {
  const flag =
    process.env.NEXT_PUBLIC_ROOTSY_CHAT_SHOW_DEV_TRACE ??
    process.env.ROOTSY_CHAT_SHOW_DEV_TRACE
  return flag === "1" || flag === "true"
}

export const ROOTSY_CHAT_SHOW_DEV_TRACE = isChatRootsyDevTraceEnabled()

export type ChatRootsyDevActor = "rootsy" | "planner"

export type ChatRootsyDevCall = {
  id?: string
  actor: ChatRootsyDevActor
  phase?: string
  userMessage?: string
  sent: string
  received: string
  note?: string
}

export type ChatRootsyDevTrace = {
  error?: string
  calls: ChatRootsyDevCall[]
}

export function chatRootsyDevJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export function redactChatRootsyDevUrl(url: string): string {
  try {
    const parsed = new URL(url)
    parsed.searchParams.delete("key")
    parsed.searchParams.delete("api_key")
    parsed.searchParams.delete("access_token")
    return parsed.toString()
  } catch {
    return url.replace(/([?&](?:key|api_key|access_token)=)[^&]*/gi, "$1")
  }
}

/** Pretty-print del JSON de red. Si no es JSON, deja el texto tal cual. */
export function formatChatRootsyDevWireJson(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return ""
    try {
      return JSON.stringify(JSON.parse(trimmed), null, 2)
    } catch {
      return value
    }
  }
  return chatRootsyDevJson(value)
}

function parseDevJson(value: unknown): unknown {
  if (typeof value !== "string") return value
  const trimmed = value.trim()
  if (!trimmed) return ""
  try {
    return JSON.parse(trimmed) as unknown
  } catch {
    return value
  }
}

function prettyDevContent(content: string): unknown {
  const trimmed = content.trim()
  if (!trimmed) return ""
  try {
    return JSON.parse(trimmed) as unknown
  } catch {
    return content
  }
}

function formatDevMessageList(
  rows: Array<{ role?: string; content?: unknown; body?: string; parts?: Array<{ text?: string }> }>,
): string {
  const messages = rows
    .map((row) => {
      const role = row.role?.trim() || "user"
      if (role === "system" || role === "developer") return null
      const fromParts = (row.parts ?? [])
        .map((part) => part.text?.trim() ?? "")
        .filter(Boolean)
        .join("\n")
      const content =
        typeof row.content === "string"
          ? row.content
          : typeof row.body === "string"
            ? row.body
            : fromParts
      if (!content.trim()) return null
      return { role, content: prettyDevContent(content) }
    })
    .filter((row): row is { role: string; content: unknown } => Boolean(row))
  if (messages.length === 1 && messages[0] && typeof messages[0].content !== "string") {
    return chatRootsyDevJson(messages[0].content)
  }
  if (messages.length === 1 && messages[0] && typeof messages[0].content === "string") {
    return messages[0].content
  }
  return chatRootsyDevJson(messages)
}

/** Mensajes de ida al modelo. Sin URL, prompt id, model ni system. */
export function formatChatRootsyDevSentMessages(value: unknown): string {
  const data = parseDevJson(value)
  if (Array.isArray(data)) return formatDevMessageList(data)
  if (!data || typeof data !== "object") {
    return typeof data === "string" ? data : ""
  }
  const row = data as {
    input?: unknown
    messages?: unknown
    contents?: unknown
    body?: { input?: unknown; messages?: unknown; contents?: unknown }
  }
  const inner =
    row.body && typeof row.body === "object" && !Array.isArray(row.body)
      ? row.body
      : row
  const payload = inner as typeof row
  if (Array.isArray(payload.input)) return formatDevMessageList(payload.input)
  if (Array.isArray(payload.messages)) return formatDevMessageList(payload.messages)
  if (Array.isArray(payload.contents)) return formatDevMessageList(payload.contents)
  return ""
}

function readDevModelOutputFromUnknown(data: unknown): string {
  if (data == null) return ""
  if (typeof data === "string") return data.trim()
  if (typeof data !== "object") return String(data)
  const row = data as {
    object?: string
    output_text?: unknown
    output?: Array<{
      type?: string
      content?: Array<{ type?: string; text?: string }> | string
    }>
    choices?: Array<{ message?: { content?: string } }>
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> }
    }>
    error?: { message?: string }
  }

  const direct =
    typeof row.output_text === "string" ? row.output_text.trim() : ""
  if (direct) return direct

  const fromOutput: string[] = []
  for (const item of row.output ?? []) {
    if (item.type && item.type !== "message") continue
    if (typeof item.content === "string" && item.content.trim()) {
      fromOutput.push(item.content.trim())
      continue
    }
    if (!Array.isArray(item.content)) continue
    for (const content of item.content) {
      if (content.text?.trim()) fromOutput.push(content.text.trim())
    }
  }
  if (fromOutput.length) return fromOutput.join("\n")

  const fromChoice = row.choices?.[0]?.message?.content?.trim()
  if (fromChoice) return fromChoice

  const fromGemini = (row.candidates?.[0]?.content?.parts ?? [])
    .map((part) => part.text?.trim() ?? "")
    .filter(Boolean)
    .join("\n")
    .trim()
  if (fromGemini) return fromGemini

  if (
    row.object === "response" ||
    Array.isArray((row as { instructions?: unknown }).instructions) ||
    Array.isArray(row.output) ||
    Array.isArray(row.choices) ||
    Array.isArray(row.candidates)
  ) {
    return row.error?.message?.trim() ?? ""
  }

  try {
    return JSON.stringify(data)
  } catch {
    return ""
  }
}

/** Texto que contestó el modelo. Nunca el envelope HTTP. */
export function formatChatRootsyDevModelOutput(raw: unknown): string {
  if (raw == null) return ""
  const extracted = readDevModelOutputFromUnknown(parseDevJson(raw))
  if (!extracted) return typeof raw === "string" && !raw.trim().startsWith("{") ? raw : ""
  return formatChatRootsyDevWireJson(extracted)
}

/** Pedido HTTP exacto (URL + body), sin API keys. */
export function formatChatRootsyDevHttpWire(input: {
  url: string
  body: unknown
}): string {
  let body = input.body
  if (typeof body === "string") {
    try {
      body = JSON.parse(body) as unknown
    } catch {
      // el body no era JSON: se muestra el string
    }
  }
  return chatRootsyDevJson({
    url: redactChatRootsyDevUrl(input.url),
    body,
  })
}

export function chatRootsyDevActorLabel(actor: ChatRootsyDevActor): string {
  return actor === "planner" ? "Planificador" : "Rootsy"
}

export function formatChatRootsyDevModelInput(input: {
  fuente?: string
  system?: string
  messages: Array<{ role: string; body?: string; content?: string }>
}): string {
  return chatRootsyDevJson({
    ...(input.fuente ? { fuente: input.fuente } : {}),
    ...(input.system ? { system: input.system } : {}),
    messages: input.messages.map((row) => ({
      role: row.role,
      content: (row.body ?? row.content ?? "").trim(),
    })),
  })
}

export const CHAT_ROOTSY_DEV_STATION_IDS = {
  apertura: "call:rootsy:apertura",
  planner: "call:planner",
  cierre: "call:rootsy:cierre",
  aclaracion: "call:rootsy:aclaracion",
} as const

const EMPTY_IO = new Set(["(no se envió)", "(no hubo respuesta)"])

function stationIo(value?: string | null): string {
  const text = value?.trim() ?? ""
  if (!text || EMPTY_IO.has(text)) return ""
  return value?.trim() ?? ""
}

function callById(
  calls: ChatRootsyDevCall[],
  id: string,
): ChatRootsyDevCall | undefined {
  return calls.find((call) => call.id === id)
}

function stationCall(input: {
  id: string
  actor: ChatRootsyDevActor
  phase: string
  found?: ChatRootsyDevCall
}): ChatRootsyDevCall {
  return {
    id: input.id,
    actor: input.actor,
    phase: input.found?.phase?.trim() || input.phase,
    sent: stationIo(input.found?.sent),
    received: stationIo(input.found?.received),
    ...(input.found?.userMessage?.trim()
      ? { userMessage: input.found.userMessage.trim() }
      : {}),
    ...(input.found?.note?.trim() ? { note: input.found.note.trim() } : {}),
  }
}

function plannerPasoFromCall(call: ChatRootsyDevCall, fallback: number): number {
  const fromId = /call:planner:(\d+)/.exec(call.id ?? "")
  if (fromId?.[1]) return Number(fromId[1])
  const fromPhase = /viaje\s+(\d+)/i.exec(call.phase ?? "")
  if (fromPhase?.[1]) return Number(fromPhase[1])
  return fallback
}

function plannerStations(calls: ChatRootsyDevCall[]): ChatRootsyDevCall[] {
  const rows = calls.filter((call) => call.actor === "planner")
  if (!rows.length) {
    return [
      stationCall({
        id: `${CHAT_ROOTSY_DEV_STATION_IDS.planner}:1`,
        actor: "planner",
        phase: "Viaje 1",
      }),
    ]
  }
  return [...rows]
    .sort((left, right) => plannerPasoFromCall(left, 0) - plannerPasoFromCall(right, 0))
    .map((row, index) => {
      const paso = plannerPasoFromCall(row, index + 1)
      return stationCall({
        id: row.id ?? `${CHAT_ROOTSY_DEV_STATION_IDS.planner}:${paso}`,
        actor: "planner",
        phase: `Viaje ${paso}`,
        found: row,
      })
    })
}

/** Rootsy apertura, un bloque por viaje del Planificador, Rootsy cierre/aclaración. */
export function fillChatRootsyDevStations(
  trace: ChatRootsyDevTrace | null | undefined,
): ChatRootsyDevTrace {
  const calls = trace?.calls ?? []
  const apertura =
    callById(calls, CHAT_ROOTSY_DEV_STATION_IDS.apertura) ??
    calls.find((call) => call.actor === "rootsy" && call.phase === "Apertura")
  const cierre = callById(calls, CHAT_ROOTSY_DEV_STATION_IDS.cierre)
  const aclaracion = callById(calls, CHAT_ROOTSY_DEV_STATION_IDS.aclaracion)
  const final =
    stationIo(cierre?.sent) || stationIo(cierre?.received)
      ? cierre
      : stationIo(aclaracion?.sent) || stationIo(aclaracion?.received)
        ? aclaracion
        : (cierre ??
          aclaracion ??
          calls.find(
            (call) =>
              call.actor === "rootsy" &&
              (call.phase === "Cierre" || call.phase === "Aclaración"),
          ))

  return {
    ...(trace?.error?.trim() ? { error: trace.error.trim() } : {}),
    calls: [
      stationCall({
        id: CHAT_ROOTSY_DEV_STATION_IDS.apertura,
        actor: "rootsy",
        phase: "Apertura",
        found: apertura,
      }),
      ...plannerStations(calls),
      stationCall({
        id: CHAT_ROOTSY_DEV_STATION_IDS.cierre,
        actor: "rootsy",
        phase: final?.phase === "Aclaración" ? "Aclaración" : "Cierre",
        found: final,
      }),
    ],
  }
}

export function chatRootsyDevCall(input: {
  id?: string
  actor: ChatRootsyDevActor
  phase?: string
  userMessage?: string
  sent?: string | null
  received?: string | null
  note?: string
}): ChatRootsyDevCall {
  return {
    actor: input.actor,
    sent: stationIo(input.sent),
    received: stationIo(input.received),
    ...(input.id ? { id: input.id } : {}),
    ...(input.phase?.trim() ? { phase: input.phase.trim() } : {}),
    ...(input.userMessage?.trim()
      ? { userMessage: input.userMessage.trim() }
      : {}),
    ...(input.note?.trim() ? { note: input.note.trim() } : {}),
  }
}

export function buildChatRootsyDevTrace(
  calls: ChatRootsyDevCall[],
  extras?: { error?: string | null },
): ChatRootsyDevTrace | undefined {
  if (!isChatRootsyDevTraceEnabled()) return undefined
  const stamped = calls.map((call, index) => ({
    ...call,
    id: call.id ?? `${call.actor}-${index}-${call.phase ?? "io"}`,
  }))
  const error = extras?.error?.trim()
  return error ? { error, calls: stamped } : { calls: stamped }
}

export function mergeChatRootsyDevTraces(
  traces: Array<ChatRootsyDevTrace | undefined | null>,
): ChatRootsyDevTrace | null {
  const calls: ChatRootsyDevCall[] = []
  const seen = new Set<string>()
  let error: string | undefined
  traces.forEach((trace, traceIndex) => {
    if (!trace) return
    if (trace.error?.trim()) error = trace.error.trim()
    for (const [callIndex, call] of (trace.calls ?? []).entries()) {
      const id = call.id ?? `${traceIndex}-${callIndex}-${call.actor}`
      const next = { ...call, id }
      const existing = seen.has(id)
        ? calls.findIndex((row) => row.id === id)
        : -1
      if (existing >= 0) {
        calls[existing] = next
        continue
      }
      seen.add(id)
      calls.push(next)
    }
  })
  if (!calls.length && !error) return null
  return error ? { error, calls } : { calls }
}
