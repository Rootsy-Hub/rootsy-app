type SendResendEmailInput = {
  to: string
  subject: string
  html: string
}

type SendResendEmailResult = {
  sent: boolean
  error?: string
}

function formatResendApiError(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as { message?: string }
    if (parsed.message) return parsed.message
  } catch {
    /* no es JSON */
  }
  return raw.length > 400 ? `${raw.slice(0, 397)}…` : raw
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim())
}

export async function sendResendEmail(
  input: SendResendEmailInput,
): Promise<SendResendEmailResult> {
  const key = process.env.RESEND_API_KEY?.trim()
  const from = process.env.RESEND_FROM?.trim() || "Rootsy <onboarding@resend.dev>"

  if (!key) {
    return { sent: false, error: "RESEND_API_KEY no configurada" }
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
      }),
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
