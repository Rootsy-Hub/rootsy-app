import "server-only"

import {
  formatChatRootsyDevModelOutput,
  formatChatRootsyDevSentMessages,
  formatChatRootsyDevWireJson,
} from "@/lib/chat/chatRootsyDevTrace"
import {
  OPENAI_RESPONSES_URL,
  buildOpenAiStoredPromptRequestBody,
} from "@/lib/chat/openaiStoredPromptBody"

export const OPENAI_PROMPT_ROOTSY_ENV = "OPENAI_PROMPT_ROOTSY"
export const OPENAI_PROMPT_PLANIFICADOR_ENV = "OPENAI_PROMPT_PLANIFICADOR"
export { OPENAI_RESPONSES_URL, buildOpenAiStoredPromptRequestBody }

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
  sent: string
  received: string
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

function emptyStoredResult(
  error: string,
  sent = "",
  received = "",
): OpenAiStoredPromptResult {
  return { text: null, error, sent, received }
}

export async function requestOpenAiStoredPrompt(input: {
  promptId: string
  messages: Array<{ role: "user" | "assistant"; content: string }>
  timeoutMs: number
}): Promise<OpenAiStoredPromptResult> {
  const requestBody = buildOpenAiStoredPromptRequestBody({
    promptId: input.promptId,
    messages: input.messages,
  })
  const sent = formatChatRootsyDevSentMessages(requestBody.input)
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) return emptyStoredResult("Falta OPENAI_API_KEY", sent)
  if (input.messages.length === 0) {
    return emptyStoredResult("Sin mensajes para el prompt guardado", sent)
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), input.timeoutMs)
  try {
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    })
    const receivedText = await response.text()
    const data = (() => {
      try {
        return JSON.parse(receivedText) as ResponsesOutput
      } catch {
        return null
      }
    })()
    const text = data ? readResponsesText(data) : null
    const received = text
      ? formatChatRootsyDevWireJson(text)
      : formatChatRootsyDevModelOutput(receivedText)
    if (!response.ok) {
      const message =
        data?.error?.message?.trim() || `openai-prompt ${response.status}`
      console.info("[openai-prompt]", {
        promptId: input.promptId.slice(0, 12),
        status: response.status,
        error: message.slice(0, 180),
      })
      return {
        text: null,
        error: `${response.status}: ${message}`,
        sent,
        received,
      }
    }
    if (!text) {
      return {
        text: null,
        error: "El prompt guardado no devolvió texto",
        sent,
        received,
      }
    }
    return { text, sent, received }
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
    return emptyStoredResult(message, sent)
  } finally {
    clearTimeout(timer)
  }
}
