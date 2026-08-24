import "server-only"

import type { ChatRootsyDataRequest } from "@/lib/chat/chatRootsyDataRequest"
import { buildChatRootsyPlannerStoredPayload } from "@/lib/chat/chatRootsyPlannerStep"
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
  formatChatRootsyDevHttpWire,
  formatChatRootsyDevWireJson,
} from "@/lib/chat/chatRootsyDevTrace"
import {
  OPENAI_PROMPT_PLANIFICADOR_ENV,
  readOpenAiPromptId,
  requestOpenAiStoredPrompt,
} from "@/lib/chat/openaiStoredPrompt"

const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions"

type PlannerHttpFetch = {
  text: string | null
  sent: string
  received: string
}

function geminiGenerateUrl(model: string, apiKey?: string): string {
  const base = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
  return apiKey ? `${base}?key=${encodeURIComponent(apiKey)}` : base
}

const PLANNER_TIMEOUT_MS = 6_000
const PLANNER_STORED_TIMEOUT_MS = 60_000
const PLANNER_MAX_OUTPUT_TOKENS = 5000
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
  "Recibís today y un data_request. Armá el plan completo de esa tarea. Sin historial ni mensaje de la persona.",
  "Hasta 8 pasos. Un paso puede tener varias ofertas. Si el mismo endpoint se aplica a N filas, mandalo una vez con variables $paso[oferta].items[].campo.",
  'Devolvé solo JSON: {"status":"ok","plan":[{"paso":1,"action":"...","confirm":"confirm","ofertas":[],"demandas":["id"]}]}',
  "action es una línea para el tablero (verbo + qué), sin endpoints. Cada paso trae su confirm. GET consulta: confirm. GET cambio singular: confirm_one. GET conjunto: confirm_many. Write: confirm (modal).",
  "Sin prosa, sin markdown, sin razonamiento.",
  "Fechas ISO YYYY-MM-DD. No inventes ids reales: usá variables de pasos anteriores.",
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
): Promise<PlannerHttpFetch> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  const requestBody = {
    systemInstruction: { parts: [{ text: CHAT_ROOTSY_PLANNER_SYSTEM }] },
    contents: [{ role: "user", parts: [{ text: payload }] }],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: PLANNER_MAX_OUTPUT_TOKENS,
      responseMimeType: "application/json",
    },
  }
  const body = JSON.stringify(requestBody)
  let lastSent = formatChatRootsyDevHttpWire({
    url: geminiGenerateUrl(models[0] ?? "unknown"),
    body: requestBody,
  })
  let lastReceived = ""
  if (!apiKey) {
    return { text: null, sent: lastSent, received: lastReceived }
  }

  for (const model of models) {
    const url = geminiGenerateUrl(model, apiKey)
    lastSent = formatChatRootsyDevHttpWire({ url, body: requestBody })
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), PLANNER_TIMEOUT_MS)
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: controller.signal,
      })
      const receivedText = await response.text()
      lastReceived = formatChatRootsyDevWireJson(receivedText)
      if (!response.ok) continue
      const text = readGeminiText(JSON.parse(receivedText) as GeminiResponse)
      if (text) return { text, sent: lastSent, received: lastReceived }
    } catch {
      continue
    } finally {
      clearTimeout(timer)
    }
  }
  return { text: null, sent: lastSent, received: lastReceived }
}

async function planWithOpenAi(
  payload: string,
  model: string,
): Promise<PlannerHttpFetch> {
  const requestBody = {
    model,
    temperature: 0,
    max_completion_tokens: PLANNER_MAX_OUTPUT_TOKENS,
    reasoning_effort: "none",
    response_format: { type: "json_object" as const },
    messages: [
      { role: "system", content: CHAT_ROOTSY_PLANNER_SYSTEM },
      { role: "user", content: payload },
    ],
  }
  const sent = formatChatRootsyDevHttpWire({
    url: OPENAI_CHAT_COMPLETIONS_URL,
    body: requestBody,
  })
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) return { text: null, sent, received: "" }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PLANNER_TIMEOUT_MS)
  try {
    const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    })
    const receivedText = await response.text()
    const received = formatChatRootsyDevWireJson(receivedText)
    if (!response.ok) return { text: null, sent, received }
    const data = JSON.parse(receivedText) as OpenAiResponse
    return {
      text: data.choices?.[0]?.message?.content?.trim() || null,
      sent,
      received,
    }
  } catch {
    return { text: null, sent, received: "" }
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
  received: string | null
  source: "prompt-guardado" | "fallback-local" | "sin-respuesta"
  storedError?: string
}

export async function planChatRootsyTools(input: {
  dataRequest: ChatRootsyDataRequest
  context?: ChatRootsyToolMatchContext
  permissionKeys?: readonly string[]
  today?: string
}): Promise<ChatRootsyPlannerFetch> {
  const empty: ChatRootsyValidatedPlan = { proposals: [], discarded: 0 }
  if (!input.dataRequest?.objective?.trim()) {
    return {
      ...empty,
      raw: null,
      sent: null,
      received: null,
      source: "sin-respuesta",
    }
  }

  const storedPromptId = readOpenAiPromptId(OPENAI_PROMPT_PLANIFICADOR_ENV)
  const entries = eligibleChatRootsyPlannerTools(
    input.context,
    input.permissionKeys,
  )
  const index = buildChatRootsyPlannerIndex(entries)
  if (!storedPromptId && index.length === 0) {
    return {
      ...empty,
      raw: null,
      sent: null,
      received: null,
      source: "sin-respuesta",
    }
  }

  const today = input.today ?? new Date().toISOString().slice(0, 10)
  const storedPayload = buildChatRootsyPlannerStoredPayload({
    today,
    dataRequest: input.dataRequest,
  })
  const payload = buildChatRootsyPlannerUserPayload({
    today,
    dataRequest: input.dataRequest,
    index,
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
        timeoutMs: PLANNER_STORED_TIMEOUT_MS,
      })
    : null

  let raw: string | null = stored?.text ?? null
  let sent: string | null = stored?.sent ?? null
  let received: string | null = stored?.received ?? null

  if (!storedPromptId) {
    const primary =
      provider === "gemini"
        ? await planWithGemini(payload, models)
        : await planWithOpenAi(payload, models[0]!)
    const secondary = primary.text
      ? null
      : provider === "gemini"
        ? await planWithOpenAi(
            payload,
            resolveChatRootsyPlannerModels("openai")[0]!,
          )
        : await planWithGemini(
            payload,
            resolveChatRootsyPlannerModels("gemini"),
          )
    const used = primary.text || !secondary ? primary : secondary
    raw = used.text
    sent = used.sent
    received = used.received
  }

  const parsed = raw ? parseChatRootsyPlannerPlan(raw) : null
  const plan = parsed
    ? validateChatRootsyPlannerPlan(parsed, input.context)
    : empty

  logChatRootsyPlanner({
    provider,
    model: models[0],
    preview: input.dataRequest.objective,
    plan,
  })
  return {
    ...plan,
    raw,
    sent,
    received,
    source: stored?.text
      ? "prompt-guardado"
      : raw
        ? "fallback-local"
        : "sin-respuesta",
    storedError: stored?.error,
  }
}
