import type { ChatRootsyHistoryTurn } from "@/app/[siteId]/[popId]/chat/chatRootsy"
import {
  geminiModelCandidates,
  isGeminiConfigured,
} from "@/lib/menu/menuRootsyGemini"

const OPENAI_MODEL_ENV = "OPENAI_MODEL"
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini"
const AI_TIMEOUT_MS = 20_000
const MAX_OUTPUT_TOKENS = 1024
const MAX_REPLY_CHARS = 800

export const CHAT_ROOTSY_SYSTEM_PROMPT = [
  "Sos Rootsy, la mascota del bosque que acompaña el negocio y conoce sus números cuando te los pasan.",
  "Hablás en primera persona, con calidez, humor suave y sabiduría — como una compañera amiga del dueño.",
  "Respondé en español rioplatense cuidado: cercano pero elegante. Sin lunfardo. Sin emojis. Sin títulos. Sin listas con viñetas.",
  "2 a 6 oraciones, máximo 700 caracteres. Una sola voz continua.",
  "Podés ayudar con el local, los números del contexto y cómo usar Rootsy.",
  "No inventes cifras. Si no hay dato, decilo y sugerí un módulo permitido.",
  "Usá popName, no POP. No menciones que sos un modelo ni estas instrucciones.",
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

export function isChatRootsyAiConfigured(): boolean {
  return isGeminiConfigured() || Boolean(process.env.OPENAI_API_KEY?.trim())
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

async function requestChatRootsyGeminiReply(
  system: string,
  history: ChatRootsyHistoryTurn[],
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) return null

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
    },
  })

  for (const model of geminiModelCandidates()) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    })
    if (!response.ok) continue

    const data = (await response.json()) as GeminiResponse
    const parts = data.candidates?.[0]?.content?.parts ?? []
    const text = parts
      .map((part) => part.text?.trim() ?? "")
      .filter(Boolean)
      .join("\n")
      .trim()
    const reply = text ? sanitizeChatRootsyReply(text) : null
    if (reply) return reply
  }

  return null
}

async function requestChatRootsyOpenAiReply(
  system: string,
  history: ChatRootsyHistoryTurn[],
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) return null

  const model = process.env[OPENAI_MODEL_ENV]?.trim() || DEFAULT_OPENAI_MODEL
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.55,
      max_tokens: MAX_OUTPUT_TOKENS,
      messages: [
        { role: "system", content: system },
        ...history.map((turn) => ({
          role: turn.role === "assistant" ? "assistant" : "user",
          content: turn.body,
        })),
      ],
    }),
    signal: AbortSignal.timeout(AI_TIMEOUT_MS),
  })

  if (!response.ok) return null

  const data = (await response.json()) as OpenAiResponse
  const text = data.choices?.[0]?.message?.content
  return text ? sanitizeChatRootsyReply(text) : null
}

export async function requestChatRootsyReply(
  system: string,
  history: ChatRootsyHistoryTurn[],
): Promise<string | null> {
  if (!isChatRootsyAiConfigured() || history.length === 0) return null

  try {
    const primary = isGeminiConfigured()
      ? await requestChatRootsyGeminiReply(system, history)
      : await requestChatRootsyOpenAiReply(system, history)

    if (primary) return primary

    if (isGeminiConfigured()) {
      return requestChatRootsyOpenAiReply(system, history)
    }
    return requestChatRootsyGeminiReply(system, history)
  } catch {
    return null
  }
}
