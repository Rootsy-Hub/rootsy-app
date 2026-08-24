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
    sent: input.sent?.trim() || "(no se envió)",
    received: input.received?.trim() || "(no hubo respuesta)",
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
      if (seen.has(id)) continue
      seen.add(id)
      calls.push({ ...call, id })
    }
  })
  if (!calls.length && !error) return null
  return error ? { error, calls } : { calls }
}
