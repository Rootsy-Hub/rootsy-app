import "server-only"

import type { ChatRootsyCloseHecho } from "@/lib/chat/chatRootsyCloseBrief"
import type { ChatRootsyDataRequest } from "@/lib/chat/chatRootsyDataRequest"
import {
  buildChatRootsyPlannerStoredPayload,
  type ChatRootsyPlannerResultado,
} from "@/lib/chat/chatRootsyPlannerStep"
import {
  buildChatRootsyPlannerIndex,
  buildChatRootsyPlannerUserPayload,
  eligibleChatRootsyPlannerTools,
  parseChatRootsyPlannerPlan,
  validateChatRootsyPlannerPlan,
  type ChatRootsyValidatedPlan,
} from "@/lib/chat/tools/chatRootsyToolPlanner"
import type { ChatRootsyToolMatchContext } from "@/lib/chat/tools/chatRootsyToolTypes"
import {
  OPENAI_PROMPT_PLANIFICADOR_ENV,
  readOpenAiPromptId,
  requestOpenAiStoredPrompt,
} from "@/lib/chat/openaiStoredPrompt"

const PLANNER_TIMEOUT_MS = 6_000
const PLANNER_MAX_OUTPUT_TOKENS = 1024
const GEMINI_PLANNER_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
] as const
const OPENAI_PLANNER_MODEL = "gpt-4.1-nano"

const PLANNER_PROVIDER_ENV = "ROOTSY_CHAT_PLANNER_PROVIDER"
const PLANNER_MODEL_ENV = "ROOTSY_CHAT_PLANNER_MODEL"

export type ChatRootsyPlannerProvider = "gemini" | "openai"

export const CHAT_ROOTSY_PLANNER_SYSTEM = [
  "Elegí consultas del catálogo. No tenés personalidad ni voz de Rootsy.",
  "Recibís el mensaje original, un data_request y, si hay, resultados de pasos anteriores.",
  "Si viene acciones_sesion y el pedido las deshace o las continúa, usá todos esos ítems. No te quedes con uno.",
  "Un paso por respuesta. Máximo 4 pasos.",
  'Devolvé solo JSON: {"status":"ok","queries":[{"id":"<id>","filters":{},"action":"...","confirm":"confirm"}]}.',
  'confirm_one si el siguiente paso necesita un ítem. done si ya alcanzó.',
  "Sin prosa, sin markdown, sin razonamiento.",
  "Solo ids del catálogo. Fechas ISO YYYY-MM-DD.",
  "No inventes ids, URLs, endpoints ni cálculos.",
].join(" ")

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
}

type OpenAiResponse = {
  choices?: Array<{ message?: { content?: string } }>
}

export function resolveChatRootsyPlannerProvider(): ChatRootsyPlannerProvider {
  const raw = process.env[PLANNER_PROVIDER_ENV]?.trim().toLowerCase()
  if (raw === "openai" || raw === "gemini") return raw
  return process.env.GEMINI_API_KEY?.trim() ? "gemini" : "openai"
}

export function resolveChatRootsyPlannerModels(
  provider: ChatRootsyPlannerProvider,
): string[] {
  const override = process.env[PLANNER_MODEL_ENV]?.trim()
  if (provider === "openai") {
    return [override || OPENAI_PLANNER_MODEL]
  }
  if (override) return [override, ...GEMINI_PLANNER_MODELS.filter((row) => row !== override)]
  return [...GEMINI_PLANNER_MODELS]
}

function readGeminiText(data: GeminiResponse): string {
  return (data.candidates?.[0]?.content?.parts ?? [])
    .map((part) => part.text?.trim() ?? "")
    .filter(Boolean)
    .join("\n")
    .trim()
}

async function planWithGemini(
  payload: string,
  models: string[],
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) return null
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: CHAT_ROOTSY_PLANNER_SYSTEM }] },
    contents: [{ role: "user", parts: [{ text: payload }] }],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: PLANNER_MAX_OUTPUT_TOKENS,
      responseMimeType: "application/json",
    },
  })

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), PLANNER_TIMEOUT_MS)
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: controller.signal,
      })
      if (!response.ok) continue
      const text = readGeminiText((await response.json()) as GeminiResponse)
      if (text) return text
    } catch {
      continue
    } finally {
      clearTimeout(timer)
    }
  }
  return null
}

async function planWithOpenAi(
  payload: string,
  model: string,
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) return null
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PLANNER_TIMEOUT_MS)
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        max_completion_tokens: PLANNER_MAX_OUTPUT_TOKENS,
        reasoning_effort: "none",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: CHAT_ROOTSY_PLANNER_SYSTEM },
          { role: "user", content: payload },
        ],
      }),
      signal: controller.signal,
    })
    if (!response.ok) return null
    const data = (await response.json()) as OpenAiResponse
    return data.choices?.[0]?.message?.content?.trim() || null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export function logChatRootsyPlanner(entry: {
  provider: ChatRootsyPlannerProvider
  model?: string
  preview: string
  plan: ChatRootsyValidatedPlan
}): void {
  console.info("[rootsy-planner]", {
    provider: entry.provider,
    model: entry.model ?? null,
    tools: entry.plan.proposals.map((row) => row.tool),
    filterKeys: entry.plan.proposals.map((row) => Object.keys(row.filters)),
    clarifying: Boolean(entry.plan.clarifyingQuestion),
    discarded: entry.plan.discarded,
    preview: entry.preview.trim().slice(0, 80),
  })
}

export type ChatRootsyPlannerFetch = ChatRootsyValidatedPlan & {
  raw: string | null
  sent: string | null
  source: "prompt-guardado" | "fallback-local" | "sin-respuesta"
  storedError?: string
}

export async function planChatRootsyTools(input: {
  body: string
  dataRequest: ChatRootsyDataRequest
  context?: ChatRootsyToolMatchContext
  permissionKeys?: readonly string[]
  today?: string
  paso?: number
  resultados?: ChatRootsyPlannerResultado[]
  accionesSesion?: ChatRootsyCloseHecho[]
}): Promise<ChatRootsyPlannerFetch> {
  const empty: ChatRootsyValidatedPlan = { proposals: [], discarded: 0 }
  const text = input.body.trim()
  if (!text || !input.dataRequest) {
    return { ...empty, raw: null, sent: null, source: "sin-respuesta" }
  }

  const storedPromptId = readOpenAiPromptId(OPENAI_PROMPT_PLANIFICADOR_ENV)
  const entries = eligibleChatRootsyPlannerTools(
    input.context,
    input.permissionKeys,
  )
  const index = buildChatRootsyPlannerIndex(entries)
  if (!storedPromptId && index.length === 0) {
    return { ...empty, raw: null, sent: null, source: "sin-respuesta" }
  }

  const today = input.today ?? new Date().toISOString().slice(0, 10)
  const paso = input.paso && input.paso > 0 ? input.paso : 1
  const resultados = input.resultados ?? []
  const storedPayload = buildChatRootsyPlannerStoredPayload({
    today,
    message: text,
    dataRequest: input.dataRequest,
    paso,
    resultados,
    accionesSesion: input.accionesSesion,
  })
  const payload = buildChatRootsyPlannerUserPayload({
    body: text,
    today,
    dataRequest: input.dataRequest,
    index,
    context: input.context,
    paso,
    resultados,
    accionesSesion: input.accionesSesion,
  })
  const provider = storedPromptId
    ? "openai"
    : resolveChatRootsyPlannerProvider()
  const models = resolveChatRootsyPlannerModels(
    storedPromptId ? "openai" : provider,
  )
  const stored = storedPromptId
    ? await requestOpenAiStoredPrompt({
        promptId: storedPromptId,
        messages: [{ role: "user", content: storedPayload }],
        timeoutMs: 15_000,
      })
    : null
  const storedRaw = stored?.text ?? null
  const raw = storedPromptId
    ? storedRaw
    : storedRaw ??
      (provider === "gemini"
        ? (await planWithGemini(payload, models)) ??
          (await planWithOpenAi(payload, resolveChatRootsyPlannerModels("openai")[0]!))
        : (await planWithOpenAi(payload, models[0]!)) ??
          (await planWithGemini(payload, resolveChatRootsyPlannerModels("gemini"))))

  const parsed = raw ? parseChatRootsyPlannerPlan(raw) : null
  const plan = parsed
    ? validateChatRootsyPlannerPlan(parsed, input.context)
    : empty

  logChatRootsyPlanner({
    provider,
    model: models[0],
    preview: text,
    plan,
  })
  return {
    ...plan,
    raw,
    sent: storedPromptId ? storedPayload : payload,
    source: storedRaw
      ? "prompt-guardado"
      : raw
        ? "fallback-local"
        : "sin-respuesta",
    storedError: stored?.error,
  }
}
