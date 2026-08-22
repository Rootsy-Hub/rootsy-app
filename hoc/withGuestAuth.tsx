"use client"

import { useEffect, type ComponentType } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContextSupabase"
import { resolveAuthNextFromSearch } from "@/lib/authCallbackRedirect"
import { signupContinueHref } from "@/lib/signupIntent"
import { Spinner } from "@/components/ui/spinner"

export function withGuestAuth<P extends object>(Component: ComponentType<P>) {
  function WithGuestGuard(props: P) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
      if (loading || !user) return
      router.replace(
        resolveAuthNextFromSearch(searchParams, signupContinueHref(searchParams)),
      )
    }, [user, loading, router, searchParams])

    if (loading) {
      return (
        <div
          className="flex min-h-[50vh] flex-col items-center justify-center gap-3 bg-background text-foreground"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <Spinner className="size-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Cargando sesión…</span>
        </div>
      )
    }

    if (user) {
      return null
    }

    return <Component {...props} />
  }

  WithGuestGuard.displayName = `withGuestAuth(${Component.displayName ?? Component.name ?? "Page"})`
  return WithGuestGuard
}
