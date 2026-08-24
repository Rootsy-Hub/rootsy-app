import "server-only"

export const OPENAI_PROMPT_ROOTSY_ENV = "OPENAI_PROMPT_ROOTSY"
export const OPENAI_PROMPT_PLANIFICADOR_ENV = "OPENAI_PROMPT_PLANIFICADOR"

type ResponsesOutput = {
  output_text?: string
  output?: Array<{
    type?: string
    content?: Array<{ type?: string; text?: string }>
  }>
  error?: { message?: string; code?: string }
}

export type OpenAiStoredPromptResult = {
  text: string | null
  error?: string
}

export function readOpenAiPromptId(
  envName: typeof OPENAI_PROMPT_ROOTSY_ENV | typeof OPENAI_PROMPT_PLANIFICADOR_ENV,
): string | null {
  const raw = process.env[envName]?.trim()
  return raw?.startsWith("pmpt_") ? raw : null
}

function readResponsesText(data: ResponsesOutput): string | null {
  const direct = data.output_text?.trim()
  if (direct) return direct
  const parts: string[] = []
  for (const item of data.output ?? []) {
    if (item.type && item.type !== "message") continue
    for (const content of item.content ?? []) {
      if (content.text?.trim()) parts.push(content.text.trim())
    }
  }
  return parts.join("\n").trim() || null
}

function withJsonKeyword(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
): Array<{ role: "user" | "assistant"; content: string }> {
  const joined = messages.map((row) => row.content).join("\n")
  if (/\bjson\b/i.test(joined)) return messages
  const next = messages.map((row) => ({ ...row }))
  for (let index = next.length - 1; index >= 0; index -= 1) {
    const row = next[index]
    if (row?.role !== "user") continue
    row.content = `${row.content}\n\nRespondé solo JSON.`
    return next
  }
  return next
}

export async function requestOpenAiStoredPrompt(input: {
  promptId: string
  messages: Array<{ role: "user" | "assistant"; content: string }>
  timeoutMs: number
}): Promise<OpenAiStoredPromptResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) return { text: null, error: "Falta OPENAI_API_KEY" }
  if (input.messages.length === 0) {
    return { text: null, error: "Sin mensajes para el prompt guardado" }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), input.timeoutMs)
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: { id: input.promptId },
        input: withJsonKeyword(input.messages),
      }),
      signal: controller.signal,
    })
    const data = (await response.json().catch(() => null)) as ResponsesOutput | null
    if (!response.ok) {
      const message =
        data?.error?.message?.trim() || `openai-prompt ${response.status}`
      console.info("[openai-prompt]", {
        promptId: input.promptId.slice(0, 12),
        status: response.status,
        error: message.slice(0, 180),
      })
      return { text: null, error: `${response.status}: ${message}` }
    }
    const text = data ? readResponsesText(data) : null
    if (!text) return { text: null, error: "El prompt guardado no devolvió texto" }
    return { text }
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "timeout"
        : error instanceof Error
          ? error.message.slice(0, 180)
          : "red"
    console.info("[openai-prompt]", {
      promptId: input.promptId.slice(0, 12),
      error: message,
    })
    return { text: null, error: message }
  } finally {
    clearTimeout(timer)
  }
}
