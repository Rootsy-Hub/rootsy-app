/** Cookie temporal para el destino post-login OAuth (evita query en redirectTo). */
export const AUTH_NEXT_COOKIE = "rootsy_auth_next"

export const RECOVERY_PASSWORD_PATH = "/recovery-password"
export const RECOVERY_NEW_PASSWORD_PATH = "/recovery-password?paso=nueva"

export function isSafeAppPath(raw: string | null | undefined): raw is string {
  return Boolean(raw && raw.startsWith("/") && !raw.startsWith("//"))
}

export function safeAppPath(
  raw: string | null | undefined,
  fallback = "/home",
): string {
  return isSafeAppPath(raw) ? raw : fallback
}

export function resolveAuthNextFromSearch(
  search: Pick<URLSearchParams, "get">,
  fallback: string,
): string {
  return safeAppPath(search.get("next"), fallback)
}

export function authPathWithNext(path: string, next: string, email?: string): string {
  const url = new URL(path, "https://rootsy.local")
  if (isSafeAppPath(next)) url.searchParams.set("next", next)
  if (email?.trim()) url.searchParams.set("email", email.trim())
  return `${url.pathname}${url.search}`
}

export function setAuthNextPath(path: string) {
  if (typeof document === "undefined") return
  document.cookie = `${AUTH_NEXT_COOKIE}=${encodeURIComponent(path)}; path=/; max-age=600; samesite=lax`
}

export function getAuthCallbackUrl(origin: string): string {
  return `${origin.replace(/\/$/, "")}/auth/callback`
}

export function getAuthCallbackUrlWithNext(origin: string, next?: string): string {
  const base = getAuthCallbackUrl(origin)
  if (!isSafeAppPath(next)) return base
  const url = new URL(base)
  url.searchParams.set("next", next)
  return url.toString()
}
