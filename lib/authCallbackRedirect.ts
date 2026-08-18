/** Cookie temporal para el destino post-login OAuth (evita query en redirectTo). */
export const AUTH_NEXT_COOKIE = "rootsy_auth_next"

export const RECOVERY_PASSWORD_PATH = "/recovery-password"
export const RECOVERY_NEW_PASSWORD_PATH = "/recovery-password?paso=nueva"

export function setAuthNextPath(path: string) {
  if (typeof document === "undefined") return
  document.cookie = `${AUTH_NEXT_COOKIE}=${encodeURIComponent(path)}; path=/; max-age=600; samesite=lax`
}

export function getAuthCallbackUrl(origin: string): string {
  return `${origin.replace(/\/$/, "")}/auth/callback`
}
