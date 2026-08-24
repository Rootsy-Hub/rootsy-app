export function isChatRootsyDevTraceEnabled(): boolean {
  const flag =
    process.env.NEXT_PUBLIC_ROOTSY_CHAT_SHOW_DEV_TRACE ??
    process.env.ROOTSY_CHAT_SHOW_DEV_TRACE
  return flag === "1" || flag === "true"
}

export const ROOTSY_CHAT_SHOW_DEV_TRACE = isChatRootsyDevTraceEnabled()

export type ChatRootsyDevLane =
  | "rootsy"
  | "planner"
  | "api"
  | "close"
  | "choice"

export type ChatRootsyDevStep = {
  id?: string
  title: string
  lane?: ChatRootsyDevLane
  note?: string
  body?: string
}

export type ChatRootsyDevTrace = {
  error?: string
  steps: ChatRootsyDevStep[]
}

export function chatRootsyDevJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export function chatRootsyDevLaneLabel(lane?: ChatRootsyDevLane): string {
  if (lane === "rootsy") return "Rootsy"
  if (lane === "planner") return "Planificador"
  if (lane === "api") return "API"
  if (lane === "close") return "Cierre"
  if (lane === "choice") return "Elección"
  return "Paso"
}

export function chatRootsyDevStep(input: {
  lane: ChatRootsyDevLane
  title: string
  note?: string
  body?: unknown
}): ChatRootsyDevStep {
  const body =
    input.body == null
      ? undefined
      : typeof input.body === "string"
        ? input.body
        : chatRootsyDevJson(input.body)
  return {
    lane: input.lane,
    title: input.title,
    ...(input.note ? { note: input.note } : {}),
    ...(body ? { body } : {}),
  }
}

export function buildChatRootsyDevTrace(
  steps: ChatRootsyDevStep[],
  extras?: { error?: string | null },
): ChatRootsyDevTrace | undefined {
  if (!isChatRootsyDevTraceEnabled()) return undefined
  const error = extras?.error?.trim()
  const stamped = steps.map((step, index) => ({
    ...step,
    id: step.id ?? `${step.lane ?? "step"}-${index}-${step.title}`,
    lane: step.lane ?? "api",
  }))
  return error ? { error, steps: stamped } : { steps: stamped }
}

export function mergeChatRootsyDevTraces(
  traces: Array<ChatRootsyDevTrace | undefined | null>,
): ChatRootsyDevTrace | null {
  const steps: ChatRootsyDevStep[] = []
  const seen = new Set<string>()
  let error: string | undefined
  traces.forEach((trace, traceIndex) => {
    if (!trace) return
    if (trace.error?.trim()) error = trace.error.trim()
    for (const [stepIndex, step] of trace.steps.entries()) {
      const id = step.id ?? `${traceIndex}-${stepIndex}-${step.title}`
      if (seen.has(id)) continue
      seen.add(id)
      steps.push({ ...step, id, lane: step.lane ?? "api" })
    }
  })
  if (!steps.length && !error) return null
  return error ? { error, steps } : { steps }
}
