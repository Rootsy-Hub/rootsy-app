import {
  buildMenuRootsyAiUserPayload,
  MENU_ROOTSY_AI_SYSTEM_PROMPT,
  parseMenuRootsyAiPayload,
} from "@/lib/menu/menuRootsyPrompt"
import type { MenuRootsyContext } from "@/lib/menu/menuRootsyTypes"

const GEMINI_MODEL_ENV = "GEMINI_MODEL"
const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash"
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

export async function requestMenuRootsyGeminiAdvice(
  context: MenuRootsyContext,
): Promise<{ lead: string; suggestionModuleKeys: string[] } | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey || context.allModules.length === 0) {
    return null
  }

  const model = process.env[GEMINI_MODEL_ENV]?.trim() || DEFAULT_GEMINI_MODEL
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
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
    }),
    signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
  })

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as GeminiResponse
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) return null

  try {
    return parseMenuRootsyAiPayload(JSON.parse(text))
  } catch {
    return null
  }
}
