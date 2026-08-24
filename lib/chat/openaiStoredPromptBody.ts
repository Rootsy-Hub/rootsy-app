export const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"

export function withJsonKeyword(
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

export function buildOpenAiStoredPromptRequestBody(input: {
  promptId: string
  messages: Array<{ role: "user" | "assistant"; content: string }>
}): {
  prompt: { id: string }
  input: Array<{ role: "user" | "assistant"; content: string }>
} {
  return {
    prompt: { id: input.promptId },
    input: withJsonKeyword(input.messages),
  }
}
