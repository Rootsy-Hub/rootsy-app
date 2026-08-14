"use client"

import { menuNatureShellClass } from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import "@/app/library/color/rootsyNaturePalette.css"
import "@/app/[siteId]/[popId]/menu/menuNaturePalette.css"
import { PopWorkspaceBackdrop } from "@/components/layouts/PopWorkspaceBackdrop"
import { DataWorkspaceHeaderTitle } from "@/components/layouts/DataWorkspaceHeaderTitle"
import { DataWorkspaceHeaderUserMenu } from "@/components/layouts/DataWorkspaceHeaderUserMenu"
import {
  dataWorkspaceHeaderChromeButtonClass,
  dataWorkspaceHeaderDividerClass,
  dataWorkspaceHeaderEdgeToggleClass,
  dataWorkspaceHeaderPopRingClass,
  dataWorkspaceHeaderRoleLabelClass,
  dataWorkspaceHeaderSurfaceClass,
  dataWorkspaceHeaderToolbarClass,
  isDataWorkspaceTintedHeader,
  type DataWorkspaceHeaderVariant,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import { ModuleWorkspaceHeader } from "@/components/layouts-module/ModuleWorkspaceHeader"
import { layoutsModuleContentShellClass } from "@/components/layouts-module/rootsLayoutsModuleProductStyles"
import { usePopWorkspaceOptional } from "@/context/PopWorkspaceContext"
import { LAYOUTS_OPERAR_CATALOG_SIDEBAR_WIDTH_PX } from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"
import { popMenuHref } from "@/lib/popRoutes"
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
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
  /** Segunda línea bajo el nombre del usuario. Por defecto usa el rol del POP (`usePopWorkspace`); si no hay rol, `pillLabel`. */
  pillLabel?: string
  /** Respaldo opcional si el bootstrap del POP aún no tiene rol. */
  userRoleLabel?: string
  loading?: boolean
  /** Cabecera clara o bosque nocturno (`dark` / `night`, equivalentes). */
  headerVariant?: DataWorkspaceHeaderVariant
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
  /** Fondo fotográfico del POP detrás del header oscuro (p. ej. librería lo desactiva). */
  usePopBackdrop?: boolean
  /** Sesión actual (opcional: si no se pasa, se oculta el bloque usuario a la derecha). */
  userName?: string
  userAvatarSrc?: string | null
  /** Destino del botón volver. Por defecto menú del POP. */
  backHref?: string
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
  usePopBackdrop = true,
  userName,
  userAvatarSrc,
  backHref: backHrefProp,
}: DataWorkspaceLayoutProps) {
  const popWorkspace = usePopWorkspaceOptional()
  const backgroundImageUrl =
    popWorkspace?.bootstrap?.backgroundImageUrl ??
    popWorkspace?.popAccess?.pop.backgroundImageUrl ??
    null
  const [isOnline, setIsOnline] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const isTintedHeader = isDataWorkspaceTintedHeader(headerVariant)
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

  const popImageUrl = popWorkspace?.popAccess?.pop.imageUrl?.trim() || null
  const popStreetAddress =
    popWorkspace?.popAccess?.pop.streetAddress?.trim() || null

  const popLogoSrc = useMemo(
    () =>
      popImageUrl ||
      `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(popId || "pop")}&backgroundColor=e8f5ef`,
    [popId, popImageUrl],
  )

  const backHref = backHrefProp ?? popMenuHref(siteId, popId)

  const resolvedUserRoleLabel =
    popWorkspace?.bootstrap?.roleLabel?.trim() || userRoleLabel?.trim() || ""
  const subline = resolvedUserRoleLabel || pillLabel

  const chromeButtonClass = dataWorkspaceHeaderChromeButtonClass(headerVariant)
  const popBackdropUrl = backgroundImageUrl?.trim() || null
  const hasModuleShell = usePopBackdrop && isTintedHeader

  return (
    <div
      className={cn(
        "text-foreground",
        hasModuleShell
          ? cn(
              menuNatureShellClass,
              "fixed inset-0 flex flex-col overflow-hidden bg-background",
            )
          : cn(
              "rootsy-app-light relative min-h-screen overflow-hidden bg-background",
            ),
      )}
    >
      {hasModuleShell ? (
        <PopWorkspaceBackdrop backgroundImageUrl={popBackdropUrl} />
      ) : (
        <div
          className="pointer-events-none absolute inset-0 motion-reduce:opacity-50"
          aria-hidden
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.75_0.12_155/0.35),transparent),radial-gradient(ellipse_60%_40%_at_100%_50%,oklch(0.85_0.08_140/0.2),transparent)]" />
          <div className="absolute inset-0 bg-[linear-gradient(oklch(0.92_0.02_130/0.35)_1px,transparent_1px),linear-gradient(90deg,oklch(0.92_0.02_130/0.35)_1px,transparent_1px)] bg-size-[48px_48px] opacity-40" />
        </div>
      )}

      <div
        className={cn(
          "relative z-10 flex min-h-0 flex-col overflow-hidden",
          hasModuleShell ? "min-h-0 flex-1" : "h-svh",
        )}
      >
        {hasModuleShell ? (
          <ModuleWorkspaceHeader
            backHref={backHref}
            popLogoSrc={popLogoSrc}
            popName={popName}
            popStreetAddress={popStreetAddress}
            title={title}
            loading={loading}
            headerVariant={headerVariant}
            titleAdornment={titleAdornment}
            headerActions={headerActions}
            sectionMenu={sectionMenu}
            toolbar={toolbar}
            mainMaxWidthClass={mainMaxWidthClass}
            userName={userName}
            userAvatarSrc={userAvatarSrc}
            isOnline={isOnline}
            subline={subline}
            hasResolvedRole={Boolean(resolvedUserRoleLabel)}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => void toggleFullscreen()}
            canCollapseSidebar={canCollapseSidebar}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={toggleSidebar}
          />
        ) : (
        <header
          className={cn(
            "relative z-20 shrink-0 border-b",
              isTintedHeader
                ? cn("text-zinc-100", dataWorkspaceHeaderSurfaceClass(headerVariant))
                : cn(
                    "shadow-sm backdrop-blur-xl",
                    dataWorkspaceHeaderSurfaceClass(headerVariant),
                  ),
          )}
        >
          <div className="relative z-10 grid h-17 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 px-4">
            <div className="flex min-w-0 items-center gap-2">
              <Link
                href={backHref}
                className={cn(
                  chromeButtonClass,
                  isTintedHeader
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
                  dataWorkspaceHeaderDividerClass(headerVariant),
                )}
              />
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className={cn(
                    "size-10 overflow-hidden rounded-lg ring-1",
                    dataWorkspaceHeaderPopRingClass(headerVariant),
                  )}
                >
                  <img
                    src={popLogoSrc}
                    alt=""
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-col leading-tight">
                  <span
                    className={cn(
                      "truncate text-sm font-semibold",
                      isTintedHeader ? "text-zinc-100" : "text-foreground/90",
                    )}
                  >
                    {popName || (loading ? "…" : "—")}
                  </span>
                  {popStreetAddress ? (
                    <span
                      className={cn(
                        "truncate text-[11px] leading-tight",
                        isTintedHeader
                          ? "text-zinc-400"
                          : "text-muted-foreground",
                      )}
                    >
                      {popStreetAddress}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <DataWorkspaceHeaderTitle
                title={title}
                headerVariant={headerVariant}
              />
              {titleAdornment}
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
                        dataWorkspaceHeaderDividerClass(headerVariant),
                      )}
                    />
                  ) : null}
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="hidden min-w-0 flex-col items-end text-right leading-tight sm:flex">
                      <span
                        className={cn(
                          "truncate text-sm font-semibold",
                          isTintedHeader ? "text-zinc-100" : "text-foreground/90",
                        )}
                      >
                        {userName}
                      </span>
                      {subline ? (
                        <span
                          className={cn(
                            "truncate text-[10px] font-semibold uppercase tracking-wider",
                            dataWorkspaceHeaderRoleLabelClass(
                              headerVariant,
                              Boolean(resolvedUserRoleLabel),
                            ),
                          )}
                        >
                          {subline}
                        </span>
                      ) : null}
                    </div>
                    <DataWorkspaceHeaderUserMenu
                      userName={userName}
                      userAvatarSrc={userAvatarSrc}
                      isOnline={isOnline}
                      headerVariant={headerVariant}
                    />
                  </div>
                </>
              ) : null}
            </div>
          </div>
          {toolbar ? (
            <div
              className={cn(
                "relative z-10 border-t px-4 py-2 sm:px-6",
                dataWorkspaceHeaderToolbarClass(headerVariant),
              )}
            >
              <div className={cn("mx-auto w-full", mainMaxWidthClass)}>
                {toolbar}
              </div>
            </div>
          ) : null}
        </header>
        )}

        {renderLayoutSidebar ? (
          <div className="relative z-10 flex min-h-0 flex-1 flex-row items-stretch">
            <aside
              id="data-workspace-sidebar"
              className={cn(
                "relative shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out motion-reduce:transition-none",
                sidebarOpen ? `w-[min(100%,${LAYOUTS_OPERAR_CATALOG_SIDEBAR_WIDTH_PX}px)]` : "w-0",
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
                  dataWorkspaceHeaderEdgeToggleClass(headerVariant),
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
                hasModuleShell && contentFlush && layoutsModuleContentShellClass,
                mainClassName,
                contentFlush
                  ? cn(
                      "min-h-0 p-0",
                      hasModuleShell ? "overflow-y-auto" : "overflow-hidden",
                    )
                  : cn(
                      "overflow-y-auto px-4 py-8 sm:pl-5 sm:pr-8",
                      mainMaxWidthClass,
                      "mx-auto w-full max-w-none",
                    ),
              )}
            >
              {children}
            </main>
          </div>
        ) : (
          <main
            className={cn(
              "relative z-10 flex min-h-0 w-full flex-1 flex-col",
              hasModuleShell && contentFlush && layoutsModuleContentShellClass,
              mainClassName,
              contentFlush
                ? cn(
                    "min-h-0 p-0",
                    hasModuleShell ? "overflow-y-auto" : "overflow-hidden",
                  )
                : cn(
                    "mx-auto overflow-y-auto px-4 py-8 sm:px-6",
                    mainMaxWidthClass,
                  ),
            )}
          >
            {children}
          </main>
        )}
      </div>
    </div>
  )
}
