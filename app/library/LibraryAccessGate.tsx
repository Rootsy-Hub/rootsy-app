"use client"

import { getLibraryAccessForSession } from "@/app/library/libraryAuth"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/context/AuthContextSupabase"
import withAuth from "@/hoc/withAuth"
import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"

type LibraryAccessGateProps = {
  children: ReactNode
}

let libraryAccessCache: { userId: string; allowed: boolean } | null = null

function LibraryAccessGateInner({ children }: LibraryAccessGateProps) {
  const { loading, user } = useAuth()
  const userId = user?.id ?? null
  const [allowed, setAllowed] = useState<boolean | null>(() =>
    userId && libraryAccessCache?.userId === userId ? libraryAccessCache.allowed : null,
  )

  useEffect(() => {
    if (!userId) {
      setAllowed(null)
      return
    }

    if (libraryAccessCache?.userId === userId) {
      setAllowed(libraryAccessCache.allowed)
      return
    }

    let cancelled = false
    void getLibraryAccessForSession().then((access) => {
      libraryAccessCache = { userId, allowed: access.allowed }
      if (!cancelled) setAllowed(access.allowed)
    })

    return () => {
      cancelled = true
    }
  }, [userId])

  if (loading || (user && allowed === null)) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-[var(--rootsy-bruma-900)]"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Spinner className="size-8 text-[var(--rootsy-bruma-500)]" />
        <span className="text-sm text-[var(--rootsy-bruma-500)]">Cargando sesión…</span>
      </div>
    )
  }

  if (!user) return null

  if (!allowed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-lg font-medium text-[var(--rootsy-bruma-900)]">No autorizado</h1>
        <p className="max-w-md text-sm text-[var(--rootsy-bruma-500)]">
          La librería solo está disponible para cuentas autorizadas de la
          plataforma.
        </p>
        <Link
          href="/home"
          className="text-sm font-semibold text-[var(--rootsy-savia-600)] underline-offset-2 hover:underline"
        >
          Volver al inicio
        </Link>
      </div>
    )
  }

  return children
}

export const LibraryAccessGate = withAuth(LibraryAccessGateInner)
