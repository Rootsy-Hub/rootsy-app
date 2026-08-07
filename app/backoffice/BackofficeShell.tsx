"use client"

import { BackofficeSidebar } from "@/app/backoffice/BackofficeSidebar"
import "@/app/[siteId]/[popId]/library/color/rootsyNaturePalette.css"
import "@/app/[siteId]/[popId]/library/libraryColorTheme.css"
import {
  libraryContentAreaClass,
  libraryScrollLightClass,
  libraryShellMainClass,
  libraryThemeClass,
} from "@/app/[siteId]/[popId]/library/libraryColorTheme"
import { DataWorkspaceHeaderUserMenu } from "@/components/layouts/DataWorkspaceHeaderUserMenu"
import {
  dataWorkspaceHeaderChromeButtonClass,
  dataWorkspaceHeaderSurfaceClass,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/context/AuthContextSupabase"
import withAuth from "@/hoc/withAuth"
import { isBackofficeAllowedEmail } from "@/lib/backofficeAccess"
import { cn } from "@/lib/utils"
import { ArrowLeft, Shield } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"

type BackofficeShellProps = {
  children: ReactNode
}

function BackofficeShell({ children }: BackofficeShellProps) {
  const { user } = useAuth()
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const sync = () => setIsOnline(navigator.onLine)
    sync()
    window.addEventListener("online", sync)
    window.addEventListener("offline", sync)
    return () => {
      window.removeEventListener("online", sync)
      window.removeEventListener("offline", sync)
    }
  }, [])

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.user_metadata?.first_name ||
    user?.email?.split("@")[0] ||
    "Usuario"

  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) || null

  const chromeButtonClass = dataWorkspaceHeaderChromeButtonClass("dark")

  return (
    <div className="rootsy-app-light rootsy-nature-palette relative flex h-svh min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <header
        className={cn(
          "relative z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b px-4 sm:px-6",
          "text-zinc-100",
          dataWorkspaceHeaderSurfaceClass("dark"),
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/home"
            aria-label="Volver al inicio"
            className={chromeButtonClass}
          >
            <ArrowLeft className="size-5" aria-hidden />
          </Link>
          <div className="hidden min-w-0 sm:block">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-200/90">
              <Shield className="size-3.5" aria-hidden />
              Backoffice
            </p>
            <p className="truncate text-sm font-medium text-zinc-100">
              Administración Rootsy
            </p>
          </div>
        </div>

        <DataWorkspaceHeaderUserMenu
          userName={displayName}
          userAvatarSrc={avatarUrl}
          isOnline={isOnline}
          headerVariant="dark"
        />
      </header>

      <div
        className={cn(
          "flex min-h-0 flex-1 overflow-hidden",
          libraryShellMainClass,
          libraryThemeClass,
        )}
      >
        <BackofficeSidebar />

        <main
          className={cn(
            "min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 lg:px-10",
            libraryContentAreaClass,
            libraryScrollLightClass,
          )}
        >
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}

function BackofficeShellWithAuth({ children }: BackofficeShellProps) {
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
          El backoffice solo está disponible para cuentas autorizadas de la
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

  return <BackofficeShell>{children}</BackofficeShell>
}

export default withAuth(BackofficeShellWithAuth)
