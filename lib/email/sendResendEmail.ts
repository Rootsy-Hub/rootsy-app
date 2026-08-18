type SendResendEmailInput = {
  to: string
  subject: string
  html: string
  text?: string
  replyTo?: string
}

type SendResendEmailResult = {
  sent: boolean
  error?: string
}

function formatResendApiError(raw: string): string {
  const trimmed = raw.trim()
  try {
    const parsed = JSON.parse(trimmed) as { message?: string }
    const message = parsed.message
    if (typeof message === "string") {
      if (
        message.includes("only send testing emails to your own email") ||
        message.includes("verify a domain")
      ) {
        return (
          "Resend en modo prueba: solo permite enviar a tu propio correo de cuenta. " +
          "Para enviar a otros destinatarios, verificá un dominio en resend.com/domains y configurá RESEND_FROM con un correo de ese dominio (por ejemplo notificaciones@tudominio.com)."
        )
      }
      return message
    }
  } catch {
    /* no es JSON */
  }
  return trimmed.length > 400 ? `${trimmed.slice(0, 397)}…` : trimmed
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim())
}

export function getResendFromAddress(): string {
  return process.env.RESEND_FROM?.trim() || "Rootsy <onboarding@resend.dev>"
}

export function getResendReplyToAddress(): string | undefined {
  const value = process.env.RESEND_REPLY_TO?.trim()
  return value || undefined
}

export async function sendResendEmail(
  input: SendResendEmailInput,
): Promise<SendResendEmailResult> {
  const key = process.env.RESEND_API_KEY?.trim()
  const from = getResendFromAddress()
  const replyTo = input.replyTo ?? getResendReplyToAddress()

  if (!key) {
    return { sent: false, error: "RESEND_API_KEY no configurada" }
  }

  const payload: Record<string, unknown> = {
    from,
    to: [input.to],
    subject: input.subject,
    html: input.html,
  }

  if (input.text?.trim()) {
    payload.text = input.text.trim()
  }

  if (replyTo) {
    payload.reply_to = replyTo
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const body = await response.text()
      return {
        sent: false,
        error: formatResendApiError(body || response.statusText),
      }
    }

    return { sent: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al enviar correo"
    return { sent: false, error: message }
  }
}
