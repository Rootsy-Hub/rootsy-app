export const CHAT_ROOTSY_RELEVANCE_MIN_SCORE = 8

export const CHAT_ROOTSY_OUT_OF_SCOPE_REPLY =
  "Eso se me va un poco del sendero que recorro. Yo me muevo mejor entre las cosas de tu negocio: entenderlas, ordenarlas y hacerlas crecer. Si querés, vemos algo de eso."

const CLASSIFIER_TIMEOUT_MS = 6_000
const CLASSIFIER_MAX_OUTPUT_TOKENS = 48
const GEMINI_RELEVANCE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
] as const
const OPENAI_RELEVANCE_MODEL = "gpt-4.1-nano"

const RELEVANCE_CATEGORIES = [
  "business",
  "system",
  "sales",
  "marketing",
  "operations",
  "finance",
  "purchasing",
  "inventory",
  "customers",
  "suppliers",
  "organization",
  "growth",
  "entertainment",
  "recipes",
  "sports",
  "personal",
  "other",
] as const

export type ChatRootsyRelevanceCategory =
  (typeof RELEVANCE_CATEGORIES)[number]

export type ChatRootsyRelevanceResult = {
  score: number
  category: ChatRootsyRelevanceCategory
}

export type ChatRootsyRelevanceGate =
  | { kind: "in_scope"; score: number; category: ChatRootsyRelevanceCategory }
  | {
      kind: "out_of_scope"
      score: number
      category: ChatRootsyRelevanceCategory
      reply: string
    }
  | { kind: "unclassified" }

export const CHAT_ROOTSY_RELEVANCE_SYSTEM = [
  "Clasificá si el mensaje es una consulta sobre gestión, orden o crecimiento de un negocio.",
  "Vale aunque no exista una pantalla o función para eso: ventas, marketing, operación, finanzas, compras, inventario, clientes, proveedores, organización, uso del sistema o decisiones para crecer.",
  "Bajo: recetas de cocina casera, cena personal, entretenimiento, deportes, ayuda personal no vinculada al negocio u otros temas ajenos.",
  "Cena o cocina para comer en casa: category recipes. Recetas o costos de producción del negocio: alto.",
  `Devolvé solo JSON: {"score":<1-10>,"category":"<${RELEVANCE_CATEGORIES.join("|")}>"}.`,
  "Nada más.",
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

export function parseChatRootsyRelevance(
  raw: string,
): ChatRootsyRelevanceResult | null {
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null

  try {
    const parsed = JSON.parse(jsonMatch[0]) as {
      score?: unknown
      category?: unknown
    }
    const score = Number(parsed.score)
    if (!Number.isInteger(score) || score < 1 || score > 10) return null

    const categoryRaw =
      typeof parsed.category === "string"
        ? parsed.category.trim().toLowerCase()
        : ""
    const category = RELEVANCE_CATEGORIES.includes(
      categoryRaw as ChatRootsyRelevanceCategory,
    )
      ? (categoryRaw as ChatRootsyRelevanceCategory)
      : "other"

    return { score, category }
  } catch {
    return null
  }
}

export function isChatRootsyRelevanceInScope(score: number): boolean {
  return score >= CHAT_ROOTSY_RELEVANCE_MIN_SCORE
}

export function logChatRootsyRelevance(entry: {
  body: string
  gate: ChatRootsyRelevanceGate
}): void {
  const preview = entry.body.trim().slice(0, 80)
  if (entry.gate.kind === "unclassified") {
    console.info("[rootsy-relevance]", {
      score: null,
      category: "unclassified",
      inScope: null,
      preview,
    })
    return
  }

  console.info("[rootsy-relevance]", {
    score: entry.gate.score,
    category: entry.gate.category,
    inScope: entry.gate.kind === "in_scope",
    preview,
  })
}

function readGeminiText(data: GeminiResponse): string {
  return (data.candidates?.[0]?.content?.parts ?? [])
    .map((part) => part.text?.trim() ?? "")
    .filter(Boolean)
    .join("\n")
    .trim()
}

async function classifyWithGemini(
  body: string,
): Promise<ChatRootsyRelevanceResult | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) return null

  const payload = JSON.stringify({
    systemInstruction: { parts: [{ text: CHAT_ROOTSY_RELEVANCE_SYSTEM }] },
    contents: [{ role: "user", parts: [{ text: body }] }],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: CLASSIFIER_MAX_OUTPUT_TOKENS,
      responseMimeType: "application/json",
    },
  })

  for (const model of GEMINI_RELEVANCE_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), CLASSIFIER_TIMEOUT_MS)
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        signal: controller.signal,
      })
      if (!response.ok) continue
      const parsed = parseChatRootsyRelevance(
        readGeminiText((await response.json()) as GeminiResponse),
      )
      if (parsed) return parsed
    } catch {
      continue
    } finally {
      clearTimeout(timer)
    }
  }

  return null
}

async function classifyWithOpenAi(
  body: string,
): Promise<ChatRootsyRelevanceResult | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) return null

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), CLASSIFIER_TIMEOUT_MS)
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_RELEVANCE_MODEL,
        temperature: 0,
        max_completion_tokens: CLASSIFIER_MAX_OUTPUT_TOKENS,
        reasoning_effort: "none",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: CHAT_ROOTSY_RELEVANCE_SYSTEM },
          { role: "user", content: body },
        ],
      }),
      signal: controller.signal,
    })
    if (!response.ok) return null
    const data = (await response.json()) as OpenAiResponse
    const text = data.choices?.[0]?.message?.content
    return text ? parseChatRootsyRelevance(text) : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export async function classifyChatRootsyRelevance(
  body: string,
): Promise<ChatRootsyRelevanceResult | null> {
  const text = body.trim()
  if (!text) return null

  if (process.env.GEMINI_API_KEY?.trim()) {
    const gemini = await classifyWithGemini(text)
    if (gemini) return gemini
  }

  return classifyWithOpenAi(text)
}

export async function gateChatRootsyRelevance(input: {
  body: string
}): Promise<ChatRootsyRelevanceGate> {
  const classified = await classifyChatRootsyRelevance(input.body)
  if (!classified) return { kind: "unclassified" }

  if (isChatRootsyRelevanceInScope(classified.score)) {
    return {
      kind: "in_scope",
      score: classified.score,
      category: classified.category,
    }
  }

  return {
    kind: "out_of_scope",
    score: classified.score,
    category: classified.category,
    reply: CHAT_ROOTSY_OUT_OF_SCOPE_REPLY,
  }
}
