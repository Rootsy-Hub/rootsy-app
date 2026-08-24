import type { ChatRootsyHistoryTurn } from "@/app/[siteId]/[popId]/chat/chatRootsy"
import type { ChatRootsyCloseHecho } from "@/lib/chat/chatRootsyCloseBrief"
import { formatChatRootsySessionActionsMessage } from "@/lib/chat/chatRootsySessionActions"
import {
  formatChatRootsyPersonPopMessage,
  insertChatRootsyContextNotes,
  type ChatRootsyBusinessCard,
} from "@/lib/chat/chatRootsyPersonPop"
import {
  fallbackChatRootsyFirstTurn,
  parseChatRootsyFirstTurn,
  type ChatRootsyFirstTurn,
} from "@/lib/chat/chatRootsyDataRequest"
import {
  CHAT_PROVIDER_TOTAL_BUDGET_MS,
  classifyOpenAiHttpFailure,
  classifyOpenAiThrownError,
  OPENAI_PRIMARY_TIMEOUT_MS,
  resolveChatRootsyProviderReply,
  type ChatRootsyOpenAiAttempt,
  type ChatRootsyProviderFailReason,
} from "@/lib/chat/chatRootsyProviderFallback"
import {
  geminiModelCandidates,
  isGeminiConfigured,
} from "@/lib/menu/menuRootsyGemini"
import { ROOTSY_PERSONA_PROMPT } from "@/lib/rootsyPersona"
import {
  OPENAI_PROMPT_ROOTSY_ENV,
  readOpenAiPromptId,
  requestOpenAiStoredPrompt,
} from "@/lib/chat/openaiStoredPrompt"
import { formatChatRootsyDevModelInput } from "@/lib/chat/chatRootsyDevTrace"

const CHAT_AI_PROVIDER_ENV = "ROOTSY_CHAT_AI_PROVIDER"
const OPENAI_MODEL_ENV = "OPENAI_MODEL"
const DEFAULT_OPENAI_MODEL = "gpt-5.4-mini"
const GEMINI_PRIMARY_TIMEOUT_MS = 10_000
const GEMINI_FALLBACK_TIMEOUT_MS = 8_000
const GEMINI_TOTAL_BUDGET_MS = CHAT_PROVIDER_TOTAL_BUDGET_MS
const MAX_OUTPUT_TOKENS = 1024
const MAX_REPLY_CHARS = 800

export type ChatRootsyAiProvider = "gemini" | "openai"

export function resolveChatRootsyAiProvider(): ChatRootsyAiProvider {
  const raw = process.env[CHAT_AI_PROVIDER_ENV]?.trim().toLowerCase()
  return raw === "openai" ? "openai" : "gemini"
}

export const CHAT_ROOTSY_SYSTEM_PROMPT = [
  ROOTSY_PERSONA_PROMPT,
  "Por defecto, 2 a 4 oraciones y máximo 700 caracteres. Una sola voz continua.",
  "Si piden más detalle, extendete un poco sin enrollarte.",
  "En temas de negocio, soná criatura viva y observadora, no persona mayor escribiendo recomendaciones. La tarjeta (nombre, rol, pop, tipo de negocio) es referencia: usala si aporta; no la recites.",
].join(" ")

export const CHAT_ROOTSY_FIRST_TURN_PROTOCOL = [
  "Respondé solo este JSON, nada más:",
  '{"reply":"texto visible","data_request":null}',
  "o",
  '{"reply":"texto visible","task_title":"Eliminar Huevo","data_request":{"objective":"..."}}',
  "data_request si necesitás cifras o listados, o si hay que crear, cambiar o borrar algo del negocio.",
  "Si hay data_request, mandá también task_title: título corto de la tarea para la persona (verbo + sujeto, 3 a 7 palabras). No es el objective.",
  "No digas que no podés aplicar un cambio. Mandá data_request y en el reply anunciá que lo vas a hacer ahora.",
  "objective: qué hay que consultar o cambiar, en lenguaje de negocio. Sin tools, URLs, endpoints, q, filtros ni paginación. Es para quien arma las llamadas, no se muestra como título.",
  "En el objective sé explícito: uno o varios (el agua mineral vs todas las aguas), consultar o cambiar, y el valor si lo dijeron (10%, $3750).",
  "El reply es tu voz. Prohibido URLs, tokens, herramientas, endpoints, Planificador, la palabra tarea o la palabra JSON en el reply.",
  "Si hay data_request, no pidas permiso. Anunciá lo que vas a consultar o preparar, en presente o futuro inmediato (voy a mirar, ahora busco). Nada de condicional (miraría). No inventes cifras ni digas que ya escribiste. El cambio se confirma después.",
  "Si data_request va null, el globo es solo conversación: no anuncies una búsqueda.",
  "El mensaje nuevo pesa 80%. El hilo y las acciones de sesión pesan 20%: usalos solo si la intención no está clara (eso, lo mismo, deshacé, seguí) o si el pedido las continúa o las deshace. Si el pedido nuevo está claro, no retomes lo anterior.",
  "Si el pedido continúa o deshace acciones ya aplicadas, nombrá todas las que toca en reply y data_request. No reduzcas a un solo ítem.",
  "Si te llega contexto de quien habla (nombre, apellido, rol, pop, tipo de negocio), usalo para saber quién es y en qué local están. No lo recites. No es el pedido.",
].join(" ")

export const CHAT_ROOTSY_SOCIAL_PROMPT = [
  "Sos Rootsy. Vivís en un parque natural digital que se nutre cuando los negocios se ordenan, aprenden y crecen: el parque se vuelve más rico y equilibrado.",
  "Sos curioso, ágil, cálido y observador. Hablás en español argentino moderado, simple y natural. Primera persona. Sin emojis.",
  "Este mensaje es charla casual. Respondé UNA o DOS frases cortas, cálidas, y devolvé la pregunta.",
  "Podés decir que estás observando cómo se mueve, se ordena o crece el parque. Que se sienta vivido, no explicado.",
  "Prohibido: nombre del negocio, Rootsy Market, ventas, inventario, números, módulos, capacidades, listados, ofrecer ayuda o decir que necesitás datos.",
  "Intención: 'Hola, bien por acá, mirando cómo se mueve el parque. ¿Vos cómo estás?'",
].join(" ")

const SOCIAL_BUSINESS_HINT =
  /\b(venta|ventas|stock|inventario|n[uú]meros?|gasto|gastos|margen|ticket|m[oó]dulos?|estad[ií]sticas?|producto|cliente|precio|caja|factura|proveedor|receta|promoci[oó]n|servicio|organiz|trabajo|capacidad|negocio|market)\b/i

function foldChatText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[¿?¡!,.;:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/** Saludo o charla corta. Las consultas de negocio no entran acá. */
export function isChatRootsySocialTurn(body: string): boolean {
  const text = body.trim()
  if (!text || text.length > 80) return false
  if (SOCIAL_BUSINESS_HINT.test(text)) return false
  return /^(hola|holis|buenas?|buen dia|buenos dias|buenas tardes|buenas noches|que tal|todo bien|como estas|como andas|como te va|hey|hi|hello)(?: (hola|que tal|todo bien|como estas|como andas|como te va))*$/.test(
    foldChatText(text),
  )
}

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
  error?: { message?: string; status?: string; code?: number }
}

type OpenAiResponse = {
  choices?: Array<{ message?: { content?: string } }>
  error?: { message?: string }
}

export type ChatRootsyReplyFetch = {
  text: string | null
  error?: string
}

function joinChatRootsyErrors(parts: Array<string | null | undefined>): string | undefined {
  const text = parts.filter(Boolean).join(" · ")
  return text || undefined
}

function readHttpErrorMessage(bodyText: string): string | null {
  try {
    const parsed = JSON.parse(bodyText) as {
      error?: { message?: string; status?: string }
    }
    return parsed.error?.message?.trim() || null
  } catch {
    const clipped = bodyText.trim().slice(0, 240)
    return clipped || null
  }
}

function describeOpenAiFail(
  reason: ChatRootsyProviderFailReason,
  detail?: string,
): string {
  const labels: Record<ChatRootsyProviderFailReason, string> = {
    missing_key: "Falta OPENAI_API_KEY",
    invalid_key: "API key inválida o sin permiso",
    invalid_request: "Pedido inválido a OpenAI",
    quota_exhausted: "Cuota de OpenAI agotada",
    rate_limited: "Rate limit de OpenAI",
    server_error: "Error de servidor de OpenAI",
    timeout: "timeout de OpenAI",
    network: "Error de red con OpenAI",
    empty_reply: "OpenAI no devolvió texto",
  }
  return detail ? `${labels[reason]}: ${detail}` : labels[reason]
}

export function isChatRootsyAiConfigured(): boolean {
  if (resolveChatRootsyAiProvider() === "openai") {
    return Boolean(process.env.OPENAI_API_KEY?.trim())
  }
  return isGeminiConfigured()
}

export function sanitizeChatRootsyReply(raw: string): string | null {
  const cleaned = raw
    .replace(/^```(?:json|text)?\s*|\s*```$/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*•]\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
  if (!cleaned) return null
  const clipped = cleaned.slice(0, MAX_REPLY_CHARS)
  if (clipped.length < cleaned.length) {
    const sentence = clipped.match(/^[\s\S]*[.!?…](?=\s|$)/)
    return (sentence?.[0] ?? clipped).trim() || null
  }
  if (/[.!?…]$/.test(clipped)) return clipped
  const sentence = clipped.match(/^[\s\S]*[.!?…](?=\s|$)/)
  return (sentence?.[0] ?? clipped).trim() || null
}

export function geminiFallbackTimeoutMs(
  index: number,
  remainingMs: number,
  primaryMs = GEMINI_PRIMARY_TIMEOUT_MS,
  fallbackMs = GEMINI_FALLBACK_TIMEOUT_MS,
): number {
  const slot = index === 0 ? primaryMs : fallbackMs
  return Math.max(0, Math.min(slot, remainingMs))
}

function readGeminiRawText(data: GeminiResponse): string {
  return (data.candidates?.[0]?.content?.parts ?? [])
    .map((part) => part.text?.trim() ?? "")
    .filter(Boolean)
    .join("\n")
    .trim()
}

function readGeminiReplyText(
  data: GeminiResponse,
  sanitize = true,
): string | null {
  const text = readGeminiRawText(data)
  if (!text) return null
  return sanitize ? sanitizeChatRootsyReply(text) : text
}

/** Un intento por modelo. Si el principal se pasa de tiempo, sigue el respaldo. */
export async function requestGeminiTextWithFallback(input: {
  apiKey: string
  body: string
  models: string[]
  fetchImpl?: typeof fetch
  now?: () => number
  primaryTimeoutMs?: number
  fallbackTimeoutMs?: number
  totalBudgetMs?: number
  sanitizeReply?: boolean
}): Promise<string | null> {
  const result = await requestGeminiTextWithFallbackDetailed(input)
  return result.text
}

async function requestGeminiTextWithFallbackDetailed(input: {
  apiKey: string
  body: string
  models: string[]
  fetchImpl?: typeof fetch
  now?: () => number
  primaryTimeoutMs?: number
  fallbackTimeoutMs?: number
  totalBudgetMs?: number
  sanitizeReply?: boolean
}): Promise<ChatRootsyReplyFetch> {
  const fetchImpl = input.fetchImpl ?? fetch
  const now = input.now ?? Date.now
  const started = now()
  const totalBudgetMs = input.totalBudgetMs ?? GEMINI_TOTAL_BUDGET_MS
  const primaryTimeoutMs = input.primaryTimeoutMs ?? GEMINI_PRIMARY_TIMEOUT_MS
  const fallbackTimeoutMs = input.fallbackTimeoutMs ?? GEMINI_FALLBACK_TIMEOUT_MS
  const errors: string[] = []

  for (const [index, model] of input.models.entries()) {
    const remainingMs = totalBudgetMs - (now() - started)
    const timeoutMs = geminiFallbackTimeoutMs(
      index,
      remainingMs,
      primaryTimeoutMs,
      fallbackTimeoutMs,
    )
    if (timeoutMs < 50) {
      errors.push("Gemini: se acabó el tiempo")
      break
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(input.apiKey)}`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetchImpl(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: input.body,
        signal: controller.signal,
      })
      const bodyText = await response.text()
      if (!response.ok) {
        const message = readHttpErrorMessage(bodyText) || `gemini ${response.status}`
        errors.push(`${model}: ${message}`)
        continue
      }
      const data = JSON.parse(bodyText) as GeminiResponse
      const reply = readGeminiReplyText(data, input.sanitizeReply !== false)
      if (reply) return { text: reply }
      errors.push(
        `${model}: ${data.error?.message?.trim() || "respuesta vacía"}`,
      )
    } catch (error) {
      const message =
        error instanceof Error && error.name === "AbortError"
          ? "timeout"
          : error instanceof Error
            ? error.message.slice(0, 180)
            : "red"
      errors.push(`${model}: ${message}`)
    } finally {
      clearTimeout(timer)
    }
  }

  return {
    text: null,
    error: joinChatRootsyErrors(errors) ?? "Gemini no devolvió texto",
  }
}

async function requestChatRootsyGeminiReply(
  system: string,
  history: ChatRootsyHistoryTurn[],
  options?: {
    fetchImpl?: typeof fetch
    now?: () => number
    totalBudgetMs?: number
    jsonMode?: boolean
    sanitizeReply?: boolean
  },
): Promise<ChatRootsyReplyFetch> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) return { text: null, error: "Falta GEMINI_API_KEY" }

  const contents = history.map((turn) => ({
    role: turn.role === "assistant" ? "model" : "user",
    parts: [{ text: turn.body }],
  }))

  if (contents[0]?.role === "model") {
    contents.unshift({
      role: "user",
      parts: [{ text: "Hola." }],
    })
  }

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    contents,
    generationConfig: {
      temperature: 0.55,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      thinkingConfig: { thinkingLevel: "minimal" },
      ...(options?.jsonMode ? { responseMimeType: "application/json" } : {}),
    },
  })

  return requestGeminiTextWithFallbackDetailed({
    apiKey,
    body,
    models: geminiModelCandidates(),
    fetchImpl: options?.fetchImpl,
    now: options?.now,
    totalBudgetMs: options?.totalBudgetMs,
    sanitizeReply: options?.sanitizeReply,
  })
}

async function requestChatRootsyOpenAiReply(
  system: string,
  history: ChatRootsyHistoryTurn[],
  options?: {
    fetchImpl?: typeof fetch
    timeoutMs?: number
    jsonMode?: boolean
    sanitizeReply?: boolean
  },
): Promise<ChatRootsyOpenAiAttempt> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    return { ok: false, reason: "missing_key", fallback: false }
  }

  const model = process.env[OPENAI_MODEL_ENV]?.trim() || DEFAULT_OPENAI_MODEL
  const fetchImpl = options?.fetchImpl ?? fetch
  const timeoutMs = options?.timeoutMs ?? OPENAI_PRIMARY_TIMEOUT_MS
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchImpl("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.55,
        max_completion_tokens: MAX_OUTPUT_TOKENS,
        reasoning_effort: "none",
        ...(options?.jsonMode ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: system },
          ...history.map((turn) => ({
            role: turn.role === "assistant" ? "assistant" : "user",
            content: turn.body,
          })),
        ],
      }),
      signal: controller.signal,
    })

    const bodyText = await response.text()
    if (!response.ok) {
      return {
        ...classifyOpenAiHttpFailure(response.status, bodyText),
        detail: readHttpErrorMessage(bodyText) ?? undefined,
      }
    }

    const data = JSON.parse(bodyText) as OpenAiResponse
    const text = data.choices?.[0]?.message?.content
    const reply =
      options?.sanitizeReply === false
        ? text?.trim() || null
        : text
          ? sanitizeChatRootsyReply(text)
          : null
    if (!reply) {
      return {
        ok: false,
        reason: "empty_reply",
        fallback: false,
        detail: data.error?.message?.trim() || undefined,
      }
    }
    return { ok: true, reply }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { ok: false, reason: "empty_reply", fallback: false }
    }
    return classifyOpenAiThrownError(error)
  } finally {
    clearTimeout(timer)
  }
}

export async function requestChatRootsyReply(
  system: string,
  history: ChatRootsyHistoryTurn[],
  options?: {
    fetchImpl?: typeof fetch
    now?: () => number
    jsonMode?: boolean
    sanitizeReply?: boolean
  },
): Promise<string | null> {
  const result = await requestChatRootsyReplyDetailed(system, history, options)
  return result.text
}

export async function requestChatRootsyReplyDetailed(
  system: string,
  history: ChatRootsyHistoryTurn[],
  options?: {
    fetchImpl?: typeof fetch
    now?: () => number
    jsonMode?: boolean
    sanitizeReply?: boolean
  },
): Promise<ChatRootsyReplyFetch> {
  if (history.length === 0) {
    return { text: null, error: "Sin mensajes para la IA" }
  }

  const primary = resolveChatRootsyAiProvider()
  const openaiConfigured = Boolean(process.env.OPENAI_API_KEY?.trim())
  const geminiConfigured = isGeminiConfigured()
  const now = options?.now ?? Date.now
  let lastError: string | undefined

  if (primary === "gemini" && !geminiConfigured) {
    return { text: null, error: "Falta GEMINI_API_KEY" }
  }
  if (primary === "openai" && !openaiConfigured) {
    return { text: null, error: describeOpenAiFail("missing_key") }
  }

  const started = now()
  const openaiTimeoutMs = geminiConfigured
    ? OPENAI_PRIMARY_TIMEOUT_MS
    : CHAT_PROVIDER_TOTAL_BUDGET_MS

  try {
    const text = await resolveChatRootsyProviderReply({
      primary,
      openaiConfigured,
      geminiConfigured,
      requestOpenAi: async () => {
        const attempt = await requestChatRootsyOpenAiReply(system, history, {
          fetchImpl: options?.fetchImpl,
          timeoutMs: openaiTimeoutMs,
          jsonMode: options?.jsonMode,
          sanitizeReply: options?.sanitizeReply,
        })
        if (!attempt.ok) {
          lastError = describeOpenAiFail(attempt.reason, attempt.detail)
        }
        return attempt
      },
      requestGemini: async () => {
        const remainingMs = CHAT_PROVIDER_TOTAL_BUDGET_MS - (now() - started)
        if (remainingMs < 50) {
          lastError = lastError ?? "Se acabó el tiempo para Gemini"
          return null
        }
        const gemini = await requestChatRootsyGeminiReply(system, history, {
          fetchImpl: options?.fetchImpl,
          now,
          totalBudgetMs: remainingMs,
          jsonMode: options?.jsonMode,
          sanitizeReply: options?.sanitizeReply,
        })
        if (!gemini.text) lastError = gemini.error ?? lastError
        return gemini.text
      },
    })
    return { text, error: text ? undefined : lastError }
  } catch (error) {
    return {
      text: null,
      error:
        error instanceof Error
          ? error.message.slice(0, 180)
          : "Error inesperado de la IA",
    }
  }
}

export type ChatRootsyFirstTurnFetch = {
  turn: ChatRootsyFirstTurn | null
  raw: string | null
  sent: string
  source: "prompt-guardado" | "fallback-local" | "sin-respuesta"
  error?: string
}

export async function requestChatRootsyFirstTurn(
  system: string,
  history: ChatRootsyHistoryTurn[],
  options?: {
    fetchImpl?: typeof fetch
    now?: () => number
    sessionActions?: ChatRootsyCloseHecho[]
    personPop?: ChatRootsyBusinessCard
  },
): Promise<ChatRootsyFirstTurnFetch> {
  const sessionNote = formatChatRootsySessionActionsMessage(
    options?.sessionActions ?? [],
  )
  const personNote = options?.personPop
    ? formatChatRootsyPersonPopMessage(options.personPop)
    : null
  const modelHistory = insertChatRootsyContextNotes(history, [
    personNote,
    sessionNote,
  ])
  const storedPromptId = readOpenAiPromptId(OPENAI_PROMPT_ROOTSY_ENV)
  const stored = storedPromptId
    ? await requestOpenAiStoredPrompt({
        promptId: storedPromptId,
        messages: modelHistory.map((turn) => ({
          role: turn.role === "assistant" ? "assistant" : "user",
          content: turn.body,
        })),
        timeoutMs: OPENAI_PRIMARY_TIMEOUT_MS,
      })
    : null
  const storedRaw = stored?.text ?? null
  const storedError = stored
    ? stored.error
    : storedPromptId
      ? undefined
      : "Falta OPENAI_PROMPT_ROOTSY"
  const fallback = storedRaw
    ? null
    : await requestChatRootsyReplyDetailed(system, modelHistory, {
        fetchImpl: options?.fetchImpl,
        now: options?.now,
        jsonMode: true,
        sanitizeReply: false,
      })
  const raw = storedRaw ?? fallback?.text ?? null
  const source = storedRaw
    ? ("prompt-guardado" as const)
    : raw
      ? ("fallback-local" as const)
      : ("sin-respuesta" as const)
  const sent = formatChatRootsyDevModelInput({
    fuente: source,
    ...(source === "prompt-guardado" ? {} : { system }),
    messages: modelHistory,
  })
  if (!raw) {
    return {
      turn: null,
      raw: null,
      sent,
      source,
      error:
        joinChatRootsyErrors([
          storedError && `prompt-guardado: ${storedError}`,
          fallback?.error && `fallback-local: ${fallback.error}`,
        ]) ?? "La IA no devolvió texto",
    }
  }

  const parsed = parseChatRootsyFirstTurn(raw)
  if (parsed) {
    const reply = sanitizeChatRootsyReply(parsed.reply) ?? parsed.reply
    return {
      turn: reply
        ? {
            reply,
            data_request: parsed.data_request,
            ...(parsed.task_title ? { task_title: parsed.task_title } : {}),
          }
        : null,
      raw,
      sent,
      source,
      error: reply
        ? undefined
        : "La IA devolvió JSON sin un reply usable",
    }
  }

  const fallbackText = sanitizeChatRootsyReply(raw)
  if (fallbackText && !/^\s*\{/.test(fallbackText)) {
    return {
      turn: fallbackChatRootsyFirstTurn(fallbackText),
      raw,
      sent,
      source,
    }
  }
  return {
    turn: null,
    raw,
    sent,
    source,
    error: "La IA respondió, pero el JSON no se pudo parsear",
  }
}
