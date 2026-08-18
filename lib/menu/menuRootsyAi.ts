import {
  buildMenuRootsyAiUserPayload,
  MENU_ROOTSY_AI_SYSTEM_PROMPT,
  parseMenuRootsyAiPayload,
} from "@/lib/menu/menuRootsyPrompt"
import { requestMenuRootsyGeminiAdvice, isGeminiConfigured } from "@/lib/menu/menuRootsyGemini"
import type { MenuRootsyAdvice, MenuRootsyContext } from "@/lib/menu/menuRootsyTypes"
import {
  buildMenuRootsyRuleAdvice,
  sanitizeMenuRootsyAdvice,
} from "@/lib/menu/menuRootsySuggestions"

const OPENAI_MODEL_ENV = "OPENAI_MODEL"
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini"
const OPENAI_TIMEOUT_MS = 10_000

export function isMenuRootsyAiConfigured(): boolean {
  return isGeminiConfigured() || Boolean(process.env.OPENAI_API_KEY?.trim())
}

export function buildMenuRootsyAdvice(context: MenuRootsyContext): MenuRootsyAdvice {
  return buildMenuRootsyRuleAdvice(context)
}

async function requestMenuRootsyOpenAiAdvice(
  context: MenuRootsyContext,
): Promise<{ lead: string; suggestionModuleKeys: string[] } | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey || context.allModules.length === 0) {
    return null
  }

  const model = process.env[OPENAI_MODEL_ENV]?.trim() || DEFAULT_OPENAI_MODEL

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      max_tokens: 256,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: MENU_ROOTSY_AI_SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify(buildMenuRootsyAiUserPayload(context)),
        },
      ],
    }),
    signal: AbortSignal.timeout(OPENAI_TIMEOUT_MS),
  })

  if (!response.ok) return null

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = data.choices?.[0]?.message?.content
  if (!content) return null

  try {
    return parseMenuRootsyAiPayload(JSON.parse(content))
  } catch {
    return null
  }
}

/** Gemini primero; OpenAI como respaldo opcional. */
export async function callMenuRootsyAiProvider(
  context: MenuRootsyContext,
  fallback: MenuRootsyAdvice,
): Promise<MenuRootsyAdvice> {
  if (context.allModules.length === 0) {
    return fallback
  }

  try {
    const parsed = isGeminiConfigured()
      ? await requestMenuRootsyGeminiAdvice(context)
      : await requestMenuRootsyOpenAiAdvice(context)

    const resolved =
      parsed ??
      (isGeminiConfigured()
        ? await requestMenuRootsyOpenAiAdvice(context)
        : null)

    if (!resolved) {
      return fallback
    }

    const suggestions = resolved.suggestionModuleKeys
      .slice(0, 1)
      .map((moduleKey) => ({ moduleKey, label: "", href: "" }))

    return sanitizeMenuRootsyAdvice(
      { lead: resolved.lead, suggestions },
      context,
      fallback,
    )
  } catch {
    return fallback
  }
}

/** @deprecated Usar getMenuRootsyAiAdviceCached */
export async function enhanceMenuRootsyAdviceWithAi(
  context: MenuRootsyContext,
  fallback: MenuRootsyAdvice,
): Promise<MenuRootsyAdvice> {
  return callMenuRootsyAiProvider(context, fallback)
}
