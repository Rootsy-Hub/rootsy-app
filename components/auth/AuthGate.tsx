"use client"

import { useAuth } from "@/context/AuthContextSupabase"
import { Spinner } from "@/components/ui/spinner"
import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"

const LOGIN_PATH = "/login"

type AuthGateProps = {
  children: ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (typeof window === "undefined" || loading || user) return
    router.replace(LOGIN_PATH)
  }, [user, loading, router])

  if (loading) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-foreground"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Spinner className="size-8 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Cargando sesión…</span>
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}
