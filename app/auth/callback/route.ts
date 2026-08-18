import {
  AUTH_NEXT_COOKIE,
  RECOVERY_NEW_PASSWORD_PATH,
  RECOVERY_PASSWORD_PATH,
} from "@/lib/authCallbackRedirect"
import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

function safeNextPath(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/home"
  return raw
}

function resolveNextPath(
  searchParams: URLSearchParams,
  cookieHeader: string | null,
): string {
  const fromQuery = searchParams.get("next")
  if (fromQuery) return safeNextPath(fromQuery)

  if (cookieHeader) {
    const match = cookieHeader.match(
      new RegExp(`(?:^|;\\s*)${AUTH_NEXT_COOKIE}=([^;]*)`),
    )
    if (match?.[1]) {
      try {
        return safeNextPath(decodeURIComponent(match[1]))
      } catch {
        return safeNextPath(match[1])
      }
    }
  }

  return "/home"
}

function redirectAfterAuth(request: Request, origin: string, next: string) {
  const forwardedHost = request.headers.get("x-forwarded-host")
  const isLocalEnv = process.env.NODE_ENV === "development"
  const target = isLocalEnv
    ? `${origin}${next}`
    : forwardedHost
      ? `https://${forwardedHost}${next}`
      : `${origin}${next}`

  const response = NextResponse.redirect(target)
  response.cookies.set(AUTH_NEXT_COOKIE, "", { path: "/", maxAge: 0 })
  return response
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const otpType = searchParams.get("type")
  const next =
    otpType === "recovery"
      ? RECOVERY_NEW_PASSWORD_PATH
      : resolveNextPath(
          searchParams,
          request.headers.get("cookie"),
        )

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return redirectAfterAuth(request, origin, next)
    }
  }

  if (tokenHash && otpType) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      type: otpType as
        | "signup"
        | "invite"
        | "magiclink"
        | "recovery"
        | "email_change"
        | "email",
      token_hash: tokenHash,
    })
    if (!error) {
      return redirectAfterAuth(request, origin, next)
    }
  }

  const failedRecovery =
    otpType === "recovery" ||
    (searchParams.get("next") ?? "").includes(RECOVERY_NEW_PASSWORD_PATH.split("?")[0])

  const response = NextResponse.redirect(
    failedRecovery
      ? `${origin}${RECOVERY_PASSWORD_PATH}?error=enlace`
      : `${origin}/login?error=callback`,
  )
  response.cookies.set(AUTH_NEXT_COOKIE, "", { path: "/", maxAge: 0 })
  return response
}
