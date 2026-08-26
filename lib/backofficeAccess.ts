import "server-only"

export function normalizeEmail(email: string | null | undefined): string {
  return email?.trim().toLowerCase() ?? ""
}

function allowedEmailsFromEnv(): Set<string> {
  const raw = process.env.BACKOFFICE_ALLOWED_EMAILS ?? ""
  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  )
}

export function isBackofficeAllowedEmail(
  email: string | null | undefined,
): boolean {
  const normalized = normalizeEmail(email)
  if (!normalized) return false
  return allowedEmailsFromEnv().has(normalized)
}
