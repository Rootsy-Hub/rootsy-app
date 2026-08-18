import { isGeminiConfigured } from "@/lib/menu/menuRootsyGemini"
import type { MenuRootsyCatalogSuggestion } from "@/lib/menu/menuRootsySuggestionCatalogTypes"
import type { MenuRootsyContext } from "@/lib/menu/menuRootsyTypes"

const OPENAI_TIMEOUT_MS = 12_000

export function isMenuRootsyDetailAiConfigured(): boolean {
  return isGeminiConfigured() || Boolean(process.env.OPENAI_API_KEY?.trim())
}

/** Enriquece ejemplos con IA — solo si hay datos e IA configurada. */
export async function enhanceMenuRootsyDetailExamplesWithAi(input: {
  context: MenuRootsyContext
  suggestion: MenuRootsyCatalogSuggestion
  ruleExamples: string
}): Promise<string | null> {
  const { context, suggestion, ruleExamples } = input
  const insights = context.insights
  if (!insights) return null

  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) return null

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini"

  const payload = {
    popName: context.popName,
    businessType: context.businessType,
    suggestionTitle: suggestion.title,
    suggestionExplanation: suggestion.explanation,
    ruleExamples,
    metrics: {
      totalSales: insights.totalSales,
      salesDeltaPercent: insights.salesDeltaPercent,
      avgTicket: insights.avgTicket,
      grossMarginPercent: insights.grossMarginPercent,
      peakHourLabel: insights.peakHourLabel,
      slowHourLabel: insights.slowHourLabel,
      topVolumeProduct: insights.topVolumeProduct?.label,
      topProfitProduct: insights.topProfitProduct?.label,
    },
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.35,
        max_tokens: 220,
        messages: [
          {
            role: "system",
            content: [
              "Sos Rootsy, mascota consejera del negocio.",
              "Escribí UN párrafo en español rioplatense claro, para alguien que recién arranca.",
              "Usá SOLO números del payload; no inventes cifras.",
              "Decí qué hacer con esos datos concretos en el negocio (usá popName, no POP).",
              "Sin listas, sin títulos, sin emojis, máximo 320 caracteres.",
            ].join(" "),
          },
          {
            role: "user",
            content: JSON.stringify(payload),
          },
        ],
      }),
      signal: AbortSignal.timeout(OPENAI_TIMEOUT_MS),
    })

    if (!response.ok) return null

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const text = data.choices?.[0]?.message?.content?.trim()
    return text && text.length > 40 ? text.slice(0, 420) : null
  } catch {
    return null
  }
}
