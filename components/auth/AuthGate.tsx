"use client"

import { useAuth } from "@/context/AuthContextSupabase"
import { Spinner } from "@/components/ui/spinner"
import { parseSignupIntent, persistSignupIntent } from "@/lib/signupIntent"
import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"

const LOGIN_PATH = "/login"
const POP_CREATE_PATH = "/pops/create"

type AuthGateProps = {
  children: ReactNode
  tone?: "light" | "dark"
  /** Home: el cielo y el skeleton. Resto: spinner de sesión. */
  pending?: "spinner" | "children"
}

export function AuthGate({
  children,
  tone = "light",
  pending = "spinner",
}: AuthGateProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (typeof window === "undefined" || loading || user) return
    const { pathname, search } = window.location
    if (pathname.startsWith(POP_CREATE_PATH)) {
      persistSignupIntent(parseSignupIntent(new URLSearchParams(search)))
      router.replace(search ? `${LOGIN_PATH}${search}` : LOGIN_PATH)
      return
    }
    router.replace(LOGIN_PATH)
  }, [user, loading, router])

  if (loading && pending === "children") {
    return <>{children}</>
  }

  if (loading || !user) {
    const isDark = tone === "dark"
    return (
      <div
        className={
          isDark
            ? "rootsy-theme-landing flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--rootsy-sombra-900)] text-white"
            : "flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-foreground"
        }
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Spinner
          className={
            isDark
              ? "size-8 text-[var(--rootsy-savia-400)]"
              : "size-8 text-muted-foreground"
          }
        />
        <span
          className={
            isDark
              ? "text-sm text-[var(--rootsy-sombra-300)]"
              : "text-sm text-muted-foreground"
          }
        >
          Cargando sesión…
        </span>
      </div>
    )
  }

  return <>{children}</>
}
