export const BACKOFFICE_ALLOWED_EMAILS = [
  "arianfernandez@gmail.com",
] as const

const ALLOWED_SET = new Set(
  BACKOFFICE_ALLOWED_EMAILS.map((email) => email.trim().toLowerCase()),
)

export function normalizeEmail(email: string | null | undefined): string {
  return email?.trim().toLowerCase() ?? ""
}

export function isBackofficeAllowedEmail(
  email: string | null | undefined,
): boolean {
  const normalized = normalizeEmail(email)
  if (!normalized) return false
  return ALLOWED_SET.has(normalized)
}
