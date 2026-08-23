import {
  buildMenuRootsyAiUserPayload,
  MENU_ROOTSY_AI_SYSTEM_PROMPT,
  parseMenuRootsyAiPayload,
} from "@/lib/menu/menuRootsyPrompt"
import type { MenuRootsyContext } from "@/lib/menu/menuRootsyTypes"

const GEMINI_MODEL_ENV = "GEMINI_MODEL"
const DEFAULT_GEMINI_MODEL = "gemini-3.6-flash"
const GEMINI_MODEL_FALLBACKS = ["gemini-3.5-flash", "gemini-3.5-flash-lite"] as const
const GEMINI_TIMEOUT_MS = 10_000

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim())
}

export function geminiModelCandidates(): string[] {
  const preferred = process.env[GEMINI_MODEL_ENV]?.trim() || DEFAULT_GEMINI_MODEL
  return [...new Set([preferred, DEFAULT_GEMINI_MODEL, ...GEMINI_MODEL_FALLBACKS])]
}

export async function requestMenuRootsyGeminiAdvice(
  context: MenuRootsyContext,
): Promise<{ lead: string; suggestionModuleKeys: string[] } | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey || context.allModules.length === 0) {
    return null
  }

  const body = JSON.stringify({
    systemInstruction: {
      parts: [{ text: MENU_ROOTSY_AI_SYSTEM_PROMPT }],
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: JSON.stringify(buildMenuRootsyAiUserPayload(context)),
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.35,
      responseMimeType: "application/json",
      maxOutputTokens: 256,
    },
  })

  let text: string | null = null
  for (const model of geminiModelCandidates()) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
    })
    if (!response.ok) continue
    const data = (await response.json()) as GeminiResponse
    const parts = data.candidates?.[0]?.content?.parts ?? []
    const joined = parts
      .map((part) => part.text?.trim() ?? "")
      .filter(Boolean)
      .join("\n")
      .trim()
    if (joined) {
      text = joined
      break
    }
  }
  if (!text) return null

  try {
    return parseMenuRootsyAiPayload(JSON.parse(text))
  } catch {
    return null
  }
}
