/** Cookie temporal para el destino post-login OAuth (evita query en redirectTo). */
export const AUTH_NEXT_COOKIE = "rootsy_auth_next"

export function setAuthNextPath(path: string) {
  if (typeof document === "undefined") return
  document.cookie = `${AUTH_NEXT_COOKIE}=${encodeURIComponent(path)}; path=/; max-age=600; samesite=lax`
}

export function getAuthCallbackUrl(origin: string): string {
  return `${origin.replace(/\/$/, "")}/auth/callback`
}
