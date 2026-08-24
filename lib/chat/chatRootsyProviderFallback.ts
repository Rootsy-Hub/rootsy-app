export const CHAT_PROVIDER_TOTAL_BUDGET_MS = 20_000
export const OPENAI_PRIMARY_TIMEOUT_MS = 10_000

export type ChatRootsyProviderFailReason =
  | "missing_key"
  | "invalid_key"
  | "invalid_request"
  | "quota_exhausted"
  | "rate_limited"
  | "server_error"
  | "timeout"
  | "network"
  | "empty_reply"

export type ChatRootsyOpenAiAttempt =
  | { ok: true; reply: string }
  | {
      ok: false
      reason: ChatRootsyProviderFailReason
      fallback: boolean
      detail?: string
    }

export function classifyOpenAiHttpFailure(
  status: number,
  bodyText: string,
): Extract<ChatRootsyOpenAiAttempt, { ok: false }> {
  const lowered = bodyText.toLowerCase()
  const quotaExhausted =
    lowered.includes("insufficient_quota") ||
    lowered.includes("credit_balance_exhausted")

  if (status === 401 || status === 403) {
    return { ok: false, reason: "invalid_key", fallback: false }
  }
  if (status === 429) {
    return quotaExhausted
      ? { ok: false, reason: "quota_exhausted", fallback: true }
      : { ok: false, reason: "rate_limited", fallback: true }
  }
  if (status >= 500) {
    return { ok: false, reason: "server_error", fallback: true }
  }
  if (status >= 400) {
    return { ok: false, reason: "invalid_request", fallback: false }
  }
  return { ok: false, reason: "empty_reply", fallback: false }
}

export function classifyOpenAiThrownError(
  error: unknown,
): Extract<ChatRootsyOpenAiAttempt, { ok: false }> {
  const name =
    error instanceof Error
      ? error.name
      : error instanceof DOMException
        ? error.name
        : ""
  if (name === "AbortError" || name === "TimeoutError") {
    return { ok: false, reason: "timeout", fallback: true }
  }
  return { ok: false, reason: "network", fallback: true }
}

export function logChatRootsyProvider(entry: {
  provider: "openai" | "gemini"
  outcome: "ok" | "fail"
  reason?: ChatRootsyProviderFailReason | null
  fallback?: boolean
  activatedBecause?: ChatRootsyProviderFailReason | null
}): void {
  console.info("[rootsy-chat-provider]", {
    provider: entry.provider,
    outcome: entry.outcome,
    reason: entry.reason ?? null,
    fallback: entry.fallback ?? false,
    activatedBecause: entry.activatedBecause ?? null,
  })
}

export async function resolveChatRootsyProviderReply(input: {
  primary: "openai" | "gemini"
  openaiConfigured: boolean
  geminiConfigured: boolean
  requestOpenAi: () => Promise<ChatRootsyOpenAiAttempt>
  requestGemini: () => Promise<string | null>
}): Promise<string | null> {
  if (input.primary === "gemini") {
    const reply = await input.requestGemini()
    logChatRootsyProvider({
      provider: "gemini",
      outcome: reply ? "ok" : "fail",
      reason: reply ? null : "empty_reply",
    })
    return reply
  }

  if (!input.openaiConfigured) {
    logChatRootsyProvider({
      provider: "openai",
      outcome: "fail",
      reason: "missing_key",
      fallback: false,
    })
    return null
  }

  const openai = await input.requestOpenAi()
  if (openai.ok) {
    logChatRootsyProvider({
      provider: "openai",
      outcome: "ok",
    })
    return openai.reply
  }

  const canFallback = openai.fallback && input.geminiConfigured
  logChatRootsyProvider({
    provider: "openai",
    outcome: "fail",
    reason: openai.reason,
    fallback: canFallback,
  })

  if (!openai.fallback) return null

  if (!input.geminiConfigured) {
    logChatRootsyProvider({
      provider: "gemini",
      outcome: "fail",
      reason: "missing_key",
      activatedBecause: openai.reason,
    })
    return null
  }

  const reply = await input.requestGemini()
  logChatRootsyProvider({
    provider: "gemini",
    outcome: reply ? "ok" : "fail",
    reason: reply ? null : "empty_reply",
    activatedBecause: openai.reason,
  })
  return reply
}
