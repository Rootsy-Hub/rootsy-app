"use client"

import { menuNatureShellClass } from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import "@/app/library/color/rootsyNaturePalette.css"
import "@/app/[siteId]/[popId]/menu/menuNaturePalette.css"
import {
  HomeWorkspaceBackdrop,
  homeWorkspaceSurfaceClass,
} from "@/components/layouts/HomeWorkspaceBackdrop"
import { PopWorkspaceBackdrop } from "@/components/layouts/PopWorkspaceBackdrop"
import { dataWorkspaceHeaderEdgeToggleClass } from "@/components/layouts/dataWorkspaceHeaderStyles"
import { ModuleWorkspaceHeader } from "@/components/layouts-module/ModuleWorkspaceHeader"
import type { DataWorkspaceHeaderMoreAction } from "@/components/layouts/DataWorkspaceHeaderMoreMenu"
import {
  ModuleWorkspaceBackdropFallback,
  moduleWorkspaceFallbackSurfaceClass,
} from "@/components/layouts-module/ModuleWorkspaceBackdropFallback"
import { layoutsModuleContentShellClass } from "@/components/layouts-module/rootsLayoutsModuleProductStyles"
import { usePopWorkspaceOptional } from "@/context/PopWorkspaceContext"
import { useAfterHydration } from "@/hooks/useIsHydrated"
import { usePopMenuCache } from "@/hooks/usePopMenuCache"
import { LAYOUTS_OPERAR_CATALOG_SIDEBAR_WIDTH_PX } from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"
import { RootsIconButton } from "@/components/rootsy-button"
import { popMenuHref } from "@/lib/popRoutes"
import { Minimize2, PanelLeftOpen } from "lucide-react"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useDataWorkspaceSidebar } from "@/components/layouts/useDataWorkspaceSidebar"
import type { DataWorkspaceHeaderVariant } from "@/components/layouts/dataWorkspaceHeaderStyles"

export type DataWorkspaceLayoutProps = {
  siteId?: string
  popId?: string
  popName?: string
  /** Isotipo a la izquierda del nombre. Si no se pasa, usa la foto del POP. */
  popLogoSrc?: string
  title?: string
  /** Segunda línea bajo el nombre del usuario. Por defecto usa el rol del POP (`usePopWorkspace`); si no hay rol, `pillLabel`. */
  pillLabel?: string
  /** Respaldo opcional si el bootstrap del POP aún no tiene rol. */
  userRoleLabel?: string
  loading?: boolean
  /** Cabecera clara o bosque nocturno (`dark` / `night`, equivalentes). */
  headerVariant?: DataWorkspaceHeaderVariant
  /** Cabecera cristal — siempre `ModuleWorkspaceHeader`. */
  showFullscreen?: boolean
  /** En pantalla completa oculta el chrome (estación de fichaje). */
  hideHeaderInFullscreen?: boolean
  /** Estación trabada: el header no vuelve hasta destrabar. */
  stationLocked?: boolean
  onEnterStation?: () => void
  onRequestUnlockStation?: () => void
  /** Contenido a la derecha del título central (ej. badge online). */
  titleAdornment?: ReactNode
  /** Acciones con ícono (Nuevo, categorías, etc.) — a la derecha, antes del selector de vista. */
  headerActions?: ReactNode
  /** Acciones secundarias — íconos en desktop, menú “más” en mobile. */
  headerMoreActions?: readonly DataWorkspaceHeaderMoreAction[]
  headerMobileMoreActions?: readonly DataWorkspaceHeaderMoreAction[]
  hideSidebarToggleOnMobile?: boolean
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
  /** Clases extra en el contenedor raíz del layout. */
  rootClassName?: string
  children: ReactNode
  /** Ancho máximo del área principal. */
  mainMaxWidthClass?: string
  /** Contenido a borde del área principal (sin padding ni ancho máximo). */
  contentFlush?: boolean
  /** Clases extra en el `<main>`. */
  mainClassName?: string
  /** Fondo fotográfico del POP. No elige el header. */
  usePopBackdrop?: boolean
  /** Fondo de /home cuando no hay foto de POP (Librería, Backoffice). */
  useHomeBackdrop?: boolean
  /**
   * Capas de fondo (foto POP, home o fallback).
   * `false` = superficie plana. El layout de tablas no admite foto de POP.
   */
  useBackdrop?: boolean
  /** Sesión actual (opcional: si no se pasa, se oculta el bloque usuario a la derecha). */
  userName?: string
  userAvatarSrc?: string | null
  /** Destino del botón volver. Por defecto menú del POP si hay site/pop. */
  backHref?: string
}

export function DataWorkspaceLayout({
  siteId = "",
  popId = "",
  popName,
  popLogoSrc: popLogoSrcProp,
  title,
  pillLabel = "Listados",
  userRoleLabel,
  loading = false,
  headerVariant = "default",
  showFullscreen = true,
  hideHeaderInFullscreen = false,
  stationLocked = false,
  onEnterStation,
  onRequestUnlockStation,
  titleAdornment,
  headerActions,
  headerMoreActions,
  headerMobileMoreActions,
  hideSidebarToggleOnMobile = false,
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
  rootClassName,
  usePopBackdrop = true,
  useHomeBackdrop = false,
  useBackdrop = true,
  userName,
  userAvatarSrc,
  backHref: backHrefProp,
}: DataWorkspaceLayoutProps) {
  const afterHydration = useAfterHydration()
  const popWorkspace = usePopWorkspaceOptional()
  const menuCache = usePopMenuCache(popId)
  const cachePop = afterHydration && popId ? menuCache.popAccess : null
  const workspacePop = afterHydration ? popWorkspace?.popAccess ?? null : null
  const popAccess = cachePop ?? workspacePop
  const backgroundImageUrl =
    popAccess?.pop.backgroundImageUrl ??
    popWorkspace?.bootstrap?.backgroundImageUrl ??
    null
  const [isOnline, setIsOnline] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
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

  const popImageUrl = popAccess?.pop.imageUrl?.trim() || null
  const popStreetAddress =
    popAccess?.pop.streetAddress?.trim() || null
  const resolvedPopName = afterHydration
    ? popAccess?.pop.name?.trim() ||
      popName?.trim() ||
      popWorkspace?.bootstrap?.popName?.trim() ||
      ""
    : popName?.trim() || ""

  const resolvedUserName = afterHydration
    ? menuCache.profileFullName.trim() ||
      popWorkspace?.bootstrap?.userFullName?.trim() ||
      userName?.trim() ||
      ""
    : userName?.trim() || ""
  const resolvedUserAvatarSrc = afterHydration
    ? menuCache.profile?.imageUrl?.trim() ||
      popWorkspace?.bootstrap?.userImageUrl?.trim() ||
      userAvatarSrc?.trim() ||
      null
    : userAvatarSrc?.trim() || null

  const brandPending =
    Boolean(popId) &&
    (!afterHydration || (menuCache.isLoading && !resolvedPopName))
  const userPending =
    Boolean(popId) &&
    (!afterHydration || (menuCache.isLoading && !resolvedUserName))

  const popLogoSrc = useMemo(() => {
    if (brandPending) return undefined
    if (popLogoSrcProp) return popLogoSrcProp
    if (popImageUrl) return popImageUrl
    if (!popId) return undefined
    return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(popId)}&backgroundColor=e8f5ef`
  }, [brandPending, popId, popImageUrl, popLogoSrcProp])

  const backHref =
    backHrefProp ?? (siteId && popId ? popMenuHref(siteId, popId) : undefined)

  const resolvedUserRoleLabel = afterHydration
    ? menuCache.roleLabel.trim() ||
      popWorkspace?.bootstrap?.roleLabel?.trim() ||
      userRoleLabel?.trim() ||
      ""
    : userRoleLabel?.trim() || ""
  const subline = resolvedUserRoleLabel || pillLabel
  const fillViewport = !useBackdrop || usePopBackdrop
  const showPopBackdrop = useBackdrop && usePopBackdrop
  const showHomeBackdrop = useBackdrop && !usePopBackdrop && useHomeBackdrop
  const showFallbackBackdrop =
    useBackdrop && !usePopBackdrop && !useHomeBackdrop
  const popBackdropUrl = showPopBackdrop
    ? backgroundImageUrl?.trim() || null
    : null
  const subscriptionsHref =
    popAccess?.isOwner && siteId && popId
      ? `/${siteId}/${popId}/subscribe`
      : null

  return (
    <div
      className={cn(
        "text-foreground",
        rootClassName,
        !useBackdrop
          ? "fixed inset-0 flex flex-col overflow-hidden bg-[var(--rootsy-bruma-50)]"
          : usePopBackdrop
            ? cn(
                menuNatureShellClass,
                "fixed inset-0 flex flex-col overflow-hidden bg-background",
              )
            : cn(
                "relative min-h-screen overflow-hidden",
                useHomeBackdrop
                  ? homeWorkspaceSurfaceClass
                  : moduleWorkspaceFallbackSurfaceClass,
              ),
      )}
    >
      {showPopBackdrop ? (
        <PopWorkspaceBackdrop backgroundImageUrl={popBackdropUrl} />
      ) : showHomeBackdrop ? (
        <HomeWorkspaceBackdrop />
      ) : showFallbackBackdrop ? (
        <ModuleWorkspaceBackdropFallback className="motion-reduce:opacity-50" />
      ) : null}

      <div
        className={cn(
          "relative z-10 flex min-h-0 flex-col overflow-hidden",
          fillViewport ? "min-h-0 flex-1" : "h-svh",
        )}
      >
        {hideHeaderInFullscreen && stationLocked ? (
          <div className="absolute right-3 top-3 z-30">
            <RootsIconButton
              theme="workspace"
              emphasis="ghost"
              size="default"
              label="Salir de la estación"
              onClick={() =>
                onRequestUnlockStation
                  ? onRequestUnlockStation()
                  : void toggleFullscreen()
              }
            >
              <Minimize2 aria-hidden />
            </RootsIconButton>
          </div>
        ) : (
          <ModuleWorkspaceHeader
            backHref={backHref}
            showFullscreen={showFullscreen}
            popLogoSrc={popLogoSrc}
            popName={resolvedPopName}
            popStreetAddress={popStreetAddress}
            title={title}
            loading={loading}
            brandPending={brandPending}
            userPending={userPending}
            headerVariant={headerVariant}
            titleAdornment={titleAdornment}
            headerActions={headerActions}
            headerMoreActions={headerMoreActions}
            headerMobileMoreActions={headerMobileMoreActions}
            hideSidebarToggleOnMobile={hideSidebarToggleOnMobile}
            sectionMenu={sectionMenu}
            toolbar={toolbar}
            mainMaxWidthClass={mainMaxWidthClass}
            userName={resolvedUserName}
            userAvatarSrc={resolvedUserAvatarSrc}
            isOnline={isOnline}
            subscriptionsHref={subscriptionsHref}
            subline={subline}
            hasResolvedRole={Boolean(resolvedUserRoleLabel)}
            isFullscreen={stationLocked || isFullscreen}
            onToggleFullscreen={
              hideHeaderInFullscreen && onEnterStation
                ? onEnterStation
                : () => void toggleFullscreen()
            }
            canCollapseSidebar={canCollapseSidebar}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={toggleSidebar}
          />
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
                fillViewport && contentFlush && layoutsModuleContentShellClass,
                contentFlush
                  ? cn(
                      "min-h-0 p-0",
                      fillViewport ? "overflow-y-auto" : "overflow-hidden",
                    )
                  : cn(
                      "overflow-y-auto px-3 py-4 sm:px-6 sm:py-8 sm:pl-5 sm:pr-8",
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
              "relative z-10 flex min-h-0 min-w-0 w-full flex-1 flex-col",
              fillViewport && contentFlush && layoutsModuleContentShellClass,
              contentFlush
                ? cn(
                    "min-h-0 p-0",
                    fillViewport ? "overflow-y-auto" : "overflow-hidden",
                  )
                : cn(
                    "mx-auto overflow-y-auto px-3 py-4 sm:px-6 sm:py-8",
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
