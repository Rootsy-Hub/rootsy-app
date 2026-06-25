"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { dataWorkspaceHeaderChromeButtonClass } from "@/components/layouts/dataWorkspaceHeaderStyles"
import { cn } from "@/lib/utils"
import { popMenuHref } from "@/lib/popRoutes"
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  Wifi,
  WifiOff,
} from "lucide-react"
import Link from "next/link"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useDataWorkspaceSidebar } from "@/components/layouts/useDataWorkspaceSidebar"

export type DataWorkspaceLayoutProps = {
  siteId: string
  popId: string
  popName: string
  title: string
  /** Segunda línea bajo el nombre (sin ícono). Si no hay `userRoleLabel`, se usa `pillLabel`. */
  pillLabel?: string
  userRoleLabel?: string
  loading?: boolean
  /** Cabecera oscura (solo la franja superior; el main sigue claro). */
  headerVariant?: "default" | "dark"
  /** Contenido a la derecha del título central (ej. badge online). */
  titleAdornment?: ReactNode
  /** Acciones con ícono (Nuevo, categorías, etc.) — a la derecha, antes del selector de vista. */
  headerActions?: ReactNode
  /** Fila opcional bajo el header (filtros, período, búsqueda). */
  toolbar?: ReactNode
  /** Barra lateral opcional (p. ej. `DataWorkspaceSidebar`) para varias vistas en la misma sección. */
  sidebar?: ReactNode
  /** Permite colapsar la barra lateral (persiste por POP en `localStorage`). */
  sidebarCollapsible?: boolean
  /** Botón flotante en el borde cuando el panel está cerrado (por defecto sí). */
  sidebarEdgeToggle?: boolean
  /** Control externo del panel (p. ej. sidebar embebido en el contenido). */
  sidebarOpen?: boolean
  onSidebarOpenChange?: (open: boolean) => void
  /** Selector de vista de la sección (cambio de pestaña sin salir del path). */
  sectionMenu?: ReactNode
  children: ReactNode
  /** Ancho máximo del área principal. */
  mainMaxWidthClass?: string
  /** Contenido a borde del área principal (sin padding ni ancho máximo). */
  contentFlush?: boolean
  /** Clases extra en el `<main>`. */
  mainClassName?: string
  /** Sesión actual (opcional: si no se pasa, se oculta el bloque usuario a la derecha). */
  userName?: string
  userAvatarSrc?: string | null
}

export function DataWorkspaceLayout({
  siteId,
  popId,
  popName,
  title,
  pillLabel = "Listados",
  userRoleLabel,
  loading = false,
  headerVariant = "default",
  titleAdornment,
  headerActions,
  toolbar,
  sidebar,
  sidebarCollapsible = true,
  sidebarEdgeToggle = true,
  sidebarOpen: sidebarOpenProp,
  onSidebarOpenChange,
  sectionMenu,
  children,
  mainMaxWidthClass = "max-w-6xl",
  contentFlush = false,
  mainClassName,
  userName,
  userAvatarSrc,
}: DataWorkspaceLayoutProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const isDarkHeader = headerVariant === "dark"
  const isSidebarControlled = onSidebarOpenChange !== undefined
  const internalSidebar = useDataWorkspaceSidebar(
    siteId,
    popId,
    Boolean(sidebar && sidebarCollapsible && !isSidebarControlled),
  )
  const sidebarOpen = isSidebarControlled
    ? (sidebarOpenProp ?? true)
    : internalSidebar.open
  const setSidebarOpen = isSidebarControlled
    ? onSidebarOpenChange
    : internalSidebar.setOpen
  const canCollapseSidebar =
    sidebarCollapsible && (Boolean(sidebar) || isSidebarControlled)
  const renderLayoutSidebar = Boolean(sidebar) && !isSidebarControlled

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen)
  }, [setSidebarOpen, sidebarOpen])

  useEffect(() => {
    if (!canCollapseSidebar) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "[" || e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target
      if (!(target instanceof HTMLElement)) return
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return
      }
      e.preventDefault()
      toggleSidebar()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [canCollapseSidebar, toggleSidebar])

  useEffect(() => {
    const on = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    setIsOnline(navigator.onLine)
    window.addEventListener("online", on)
    window.addEventListener("offline", off)
    return () => {
      window.removeEventListener("online", on)
      window.removeEventListener("offline", off)
    }
  }, [])

  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement))
    sync()
    document.addEventListener("fullscreenchange", sync)
    return () => document.removeEventListener("fullscreenchange", sync)
  }, [])

  const toggleFullscreen = useCallback(async () => {
    if (typeof document === "undefined") return
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
      }
    } catch {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
  }, [])

  const popLogoSrc = useMemo(
    () =>
      `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(popId || "pop")}&backgroundColor=e8f5ef`,
    [popId],
  )

  const backHref = popMenuHref(siteId, popId)

  const subline = userRoleLabel?.trim() || pillLabel

  const defaultAdornment =
    titleAdornment === undefined ? (
      <span
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-full border",
          isDarkHeader
            ? isOnline
              ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/35 bg-red-500/10 text-red-300"
            : isOnline
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-destructive/30 bg-destructive/10 text-destructive",
        )}
        role="status"
        aria-label={isOnline ? "En línea" : "Sin conexión"}
        title={isOnline ? "En línea" : "Sin conexión"}
      >
        {isOnline ? (
          <Wifi className="size-3.5" aria-hidden />
        ) : (
          <WifiOff className="size-3.5" aria-hidden />
        )}
      </span>
    ) : (
      titleAdornment
    )

  const chromeButtonClass = dataWorkspaceHeaderChromeButtonClass(
    isDarkHeader ? "dark" : "default",
  )

  return (
    <div className="rootsy-app-light relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        className="pointer-events-none absolute inset-0 motion-reduce:opacity-50"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.75_0.12_155/0.35),transparent),radial-gradient(ellipse_60%_40%_at_100%_50%,oklch(0.85_0.08_140/0.2),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(oklch(0.92_0.02_130/0.35)_1px,transparent_1px),linear-gradient(90deg,oklch(0.92_0.02_130/0.35)_1px,transparent_1px)] bg-size-[48px_48px] opacity-40" />
      </div>

      <div className="relative z-10 flex h-svh min-h-0 flex-col overflow-hidden">
        <header
          className={cn(
            "shrink-0 border-b shadow-sm backdrop-blur-xl",
            isDarkHeader
              ? "border-zinc-800/90 bg-zinc-950/95 text-zinc-100"
              : "border-rootsy-hairline bg-card/90",
          )}
        >
          <div className="grid h-18 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 px-4">
            <div className="flex min-w-0 items-center gap-2">
              <Link
                href={backHref}
                className={cn(
                  chromeButtonClass,
                  isDarkHeader
                    ? "text-zinc-300"
                    : "text-foreground/70 hover:text-foreground",
                )}
                aria-label="Volver al menú"
              >
                <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-0.5" />
              </Link>
              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                className={chromeButtonClass}
                aria-label={
                  isFullscreen
                    ? "Salir de pantalla completa"
                    : "Pantalla completa"
                }
                title={
                  isFullscreen
                    ? "Salir de pantalla completa"
                    : "Pantalla completa"
                }
              >
                {isFullscreen ? (
                  <Minimize2 className="size-5" aria-hidden />
                ) : (
                  <Maximize2 className="size-5" aria-hidden />
                )}
              </button>
              {canCollapseSidebar ? (
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className={cn(
                    chromeButtonClass,
                    !sidebarOpen &&
                      "border-red-500/45 bg-red-500/15 text-red-300 hover:border-red-400/55 hover:bg-red-500/25 hover:text-red-200",
                  )}
                  aria-expanded={sidebarOpen}
                  aria-controls="data-workspace-sidebar"
                  aria-label={
                    sidebarOpen
                      ? "Ocultar panel de navegación"
                      : "Mostrar panel de navegación"
                  }
                  title={
                    sidebarOpen
                      ? "Ocultar panel ([)"
                      : "Mostrar panel ([)"
                  }
                >
                  {sidebarOpen ? (
                    <PanelLeftClose className="size-5" aria-hidden />
                  ) : (
                    <PanelLeftOpen className="size-5" aria-hidden />
                  )}
                </button>
              ) : null}
              <div
                className={cn(
                  "h-6 w-px",
                  isDarkHeader ? "bg-zinc-700" : "bg-border",
                )}
              />
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className={cn(
                    "size-8 overflow-hidden rounded-lg ring-1",
                    isDarkHeader ? "ring-zinc-600" : "ring-border",
                  )}
                >
                  <img
                    src={popLogoSrc}
                    alt=""
                    className="size-full object-cover"
                  />
                </div>
                <span
                  className={cn(
                    "truncate text-sm font-semibold",
                    isDarkHeader ? "text-zinc-100" : "text-foreground/90",
                  )}
                >
                  {popName || (loading ? "…" : "—")}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <h1
                className={cn(
                  "text-[1.65rem] font-black tracking-tight",
                  isDarkHeader ? "text-white" : "text-foreground",
                )}
              >
                {title}
              </h1>
              {defaultAdornment}
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2">
              {headerActions || sectionMenu ? (
                <div className="flex items-center gap-1.5">
                  {headerActions}
                  {sectionMenu}
                </div>
              ) : null}
              {userName ? (
                <>
                  {headerActions || sectionMenu ? (
                    <div
                      className={cn(
                        "h-6 w-px",
                        isDarkHeader ? "bg-zinc-700" : "bg-border",
                      )}
                    />
                  ) : null}
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      className={cn(
                        "size-10 ring-1",
                        isDarkHeader ? "ring-zinc-600" : "ring-border",
                      )}
                    >
                      <AvatarImage
                        src={
                          userAvatarSrc ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName || "u")}`
                        }
                        alt=""
                      />
                      <AvatarFallback
                        className={cn(
                          "text-xs",
                          isDarkHeader
                            ? "bg-zinc-800 text-emerald-300"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        {userName.trim().slice(0, 2).toUpperCase() || "·"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden min-w-0 flex-col leading-tight sm:flex">
                      <span
                        className={cn(
                          "truncate text-sm font-semibold",
                          isDarkHeader ? "text-zinc-100" : "text-foreground/90",
                        )}
                      >
                        {userName}
                      </span>
                      {subline ? (
                        <span
                          className={cn(
                            "truncate text-[10px] font-semibold uppercase tracking-wider",
                            userRoleLabel?.trim()
                              ? isDarkHeader
                                ? "text-emerald-400"
                                : "text-emerald-700"
                              : isDarkHeader
                                ? "text-zinc-400"
                                : "text-muted-foreground",
                          )}
                        >
                          {subline}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
          {toolbar ? (
            <div
              className={cn(
                "border-t px-4 py-2 sm:px-6",
                isDarkHeader
                  ? "border-zinc-800 bg-zinc-950/80"
                  : "border-border/60 bg-muted/20",
              )}
            >
              <div className={cn("mx-auto w-full", mainMaxWidthClass)}>
                {toolbar}
              </div>
            </div>
          ) : null}
        </header>

        {renderLayoutSidebar ? (
          <div className="relative z-10 flex min-h-0 flex-1 flex-row items-stretch">
            <aside
              id="data-workspace-sidebar"
              className={cn(
                "relative shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out motion-reduce:transition-none",
                sidebarOpen ? "w-[min(100%,280px)]" : "w-0",
              )}
              aria-hidden={canCollapseSidebar ? !sidebarOpen : undefined}
              {...(!sidebarOpen && canCollapseSidebar ? { inert: true } : {})}
            >
              {sidebar}
            </aside>
            {!sidebarOpen && canCollapseSidebar && sidebarEdgeToggle ? (
              <button
                type="button"
                onClick={toggleSidebar}
                className={cn(
                  "absolute left-0 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-r-xl border border-l-0 shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/45",
                  isDarkHeader
                    ? "border-white/10 bg-[#1a2027] text-slate-300 hover:bg-[#242d38] hover:text-white"
                    : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                aria-expanded={false}
                aria-controls="data-workspace-sidebar"
                aria-label="Mostrar panel de navegación"
                title="Mostrar panel ([)"
              >
                <PanelLeftOpen className="size-5" aria-hidden />
              </button>
            ) : null}
            <main
              className={cn(
                "relative z-10 flex min-h-0 min-w-0 flex-1 flex-col",
                contentFlush
                  ? "overflow-hidden p-0"
                  : cn(
                      "overflow-y-auto px-4 py-8 sm:pl-5 sm:pr-8",
                      mainMaxWidthClass,
                      "mx-auto w-full max-w-none",
                    ),
                mainClassName,
              )}
            >
              {children}
            </main>
          </div>
        ) : (
          <main
            className={cn(
              "relative z-10 flex min-h-0 w-full flex-1 flex-col",
              contentFlush
                ? "overflow-hidden p-0"
                : cn(
                    "mx-auto overflow-y-auto px-4 py-8 sm:px-6",
                    mainMaxWidthClass,
                  ),
              mainClassName,
            )}
          >
            {children}
          </main>
        )}
      </div>
    </div>
  )
}
