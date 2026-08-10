"use client"

import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/context/AuthContextSupabase"
import withAuth from "@/hoc/withAuth"
import { isBackofficeAllowedEmail } from "@/lib/backofficeAccess"
import Link from "next/link"
import type { ReactNode } from "react"

type LibraryAccessGateProps = {
  children: ReactNode
}

function LibraryAccessGateInner({ children }: LibraryAccessGateProps) {
  const { loading, user } = useAuth()

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

  if (!isBackofficeAllowedEmail(user.email)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-lg font-medium text-foreground">No autorizado</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          La librería solo está disponible para cuentas autorizadas de la
          plataforma.
        </p>
        <Link
          href="/home"
          className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
        >
          Volver al inicio
        </Link>
      </div>
    )
  }

  return children
}

export const LibraryAccessGate = withAuth(LibraryAccessGateInner)
