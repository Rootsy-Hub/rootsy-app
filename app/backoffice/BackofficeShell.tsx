"use client"

import { BACKOFFICE_NAV } from "@/app/backoffice/backofficeNav"
import "@/app/[siteId]/[popId]/library/color/rootsyNaturePalette.css"
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
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"

type BackofficeShellProps = {
  children: ReactNode
}

function BackofficeShell({ children }: BackofficeShellProps) {
  const pathname = usePathname()
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
    <div className="rootsy-app-light relative flex h-svh min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <header
        className={cn(
          "relative z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b px-4 sm:px-6",
          "text-zinc-100",
          dataWorkspaceHeaderSurfaceClass("dark"),
        )}
      >
        <Link
          href="/home"
          aria-label="Volver al inicio"
          className={chromeButtonClass}
        >
          <ArrowLeft className="size-5" aria-hidden />
        </Link>

        <DataWorkspaceHeaderUserMenu
          userName={displayName}
          userAvatarSrc={avatarUrl}
          isOnline={isOnline}
          headerVariant="dark"
        />
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-muted/20 lg:block">
          <nav
            className="sticky top-0 max-h-[calc(100dvh-4rem)] overflow-y-auto px-3 py-6"
            aria-label="Backoffice"
          >
            <p className="px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Backoffice
            </p>
            <ul className="mt-4 space-y-0.5" role="list">
              {BACKOFFICE_NAV.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`)
                const Icon = item.icon
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-10 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary/12 font-semibold text-foreground before:absolute before:hidden"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          active ? "text-primary" : "opacity-70",
                        )}
                        aria-hidden
                      />
                      <span className="min-w-0 truncate">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10">
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
