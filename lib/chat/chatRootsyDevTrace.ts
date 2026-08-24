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

/** Siempre 3 pasos: Rootsy apertura, Planificador, Rootsy cierre/aclaración. Sin dato, vacío. */
export function fillChatRootsyDevStations(
  trace: ChatRootsyDevTrace | null | undefined,
): ChatRootsyDevTrace {
  const calls = trace?.calls ?? []
  const apertura =
    callById(calls, CHAT_ROOTSY_DEV_STATION_IDS.apertura) ??
    calls.find((call) => call.actor === "rootsy" && call.phase === "Apertura")
  const planner =
    callById(calls, CHAT_ROOTSY_DEV_STATION_IDS.planner) ??
    calls.find((call) => call.actor === "planner")
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
      stationCall({
        id: CHAT_ROOTSY_DEV_STATION_IDS.planner,
        actor: "planner",
        phase: "Plan",
        found: planner,
      }),
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
