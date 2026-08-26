"use client"

import { BackofficeSidebar } from "@/app/backoffice/BackofficeSidebar"
import { backofficeNavItem } from "@/app/backoffice/backofficeNav"
import "@/app/library/color/rootsyNaturePalette.css"
import "@/app/library/libraryColorTheme.css"
import {
  libraryContentAreaClass,
  libraryScrollLightClass,
  libraryShellMainClass,
  libraryThemeClass,
} from "@/app/library/libraryColorTheme"
import { getBackofficeAccessForSession } from "@/app/backoffice/backofficeAuth"
import { DataWorkspaceModuleLayout } from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/context/AuthContextSupabase"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"

type BackofficeShellProps = {
  children: ReactNode
}

function BackofficeShell({ children }: BackofficeShellProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  const navItem = backofficeNavItem(pathname)

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.user_metadata?.first_name ||
    user?.email?.split("@")[0] ||
    "Usuario"

  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) || null

  return (
    <DataWorkspaceModuleLayout
      popName="UROBOROS"
      popLogoSrc="/logos/uroboros.png"
      title={navItem?.label ?? "Uroboros"}
      contentFlush
      usePopBackdrop={false}
      useHomeBackdrop
      rootClassName={cn(
        libraryThemeClass,
        "rootsy-app-light rootsy-nature-palette",
      )}
      backHref="/home"
      userName={displayName}
      userAvatarSrc={avatarUrl}
      pillLabel="Backoffice"
      mainClassName={cn(
        libraryShellMainClass,
        libraryThemeClass,
        "rootsy-app-light min-h-0 flex-1 flex-col overflow-hidden",
      )}
    >
      <div className="relative flex min-h-0 w-full flex-1 overflow-hidden">
        <BackofficeSidebar />

        <div
          className={cn(
            "min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 lg:px-10",
            libraryContentAreaClass,
            libraryScrollLightClass,
          )}
        >
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </div>
    </DataWorkspaceModuleLayout>
  )
}

function BackofficeShellWithAuth({ children }: BackofficeShellProps) {
  const { user } = useAuth()
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    if (!user) {
      setAllowed(null)
      return
    }

    let cancelled = false
    void getBackofficeAccessForSession().then((access) => {
      if (!cancelled) setAllowed(access.allowed)
    })

    return () => {
      cancelled = true
    }
  }, [user])

  if (!user) return null

  if (allowed === null) {
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

  if (!allowed) {
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

export default BackofficeShellWithAuth
