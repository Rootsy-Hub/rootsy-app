"use client"

import { MenuHeaderEntity } from "@/app/[siteId]/[popId]/menu/MenuHeaderEntity"
import { menuModuleHeaderRowClass } from "@/app/[siteId]/[popId]/menu/menuFloatingPillStyles"
import { DataWorkspaceHeaderUserMenu } from "@/components/layouts/DataWorkspaceHeaderUserMenu"
import {
  dataWorkspaceHeaderRoleLabelClass,
  dataWorkspaceHeaderToolbarClass,
  type DataWorkspaceHeaderVariant,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import { RootsIconButton } from "@/components/rootsy-button/RootsIconButton"
import {
  menuRealmBodyClass,
  menuRealmDividerClass,
  menuRealmLightMutedClass,
  menuRealmTitleClass,
} from "@/lib/menu/menuHoloStyles"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import type { ReactNode } from "react"

export type ModuleWorkspaceHeaderProps = {
  backHref?: string
  showFullscreen?: boolean
  popLogoSrc?: string
  popName?: string
  popStreetAddress?: string | null
  title?: string
  loading?: boolean
  headerVariant?: DataWorkspaceHeaderVariant
  titleAdornment?: ReactNode
  headerActions?: ReactNode
  sectionMenu?: ReactNode
  toolbar?: ReactNode
  mainMaxWidthClass?: string
  userName?: string
  userAvatarSrc?: string | null
  isOnline?: boolean
  subline?: string
  hasResolvedRole?: boolean
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
  canCollapseSidebar?: boolean
  sidebarOpen?: boolean
  onToggleSidebar?: () => void
}

const universeChrome = {
  tone: "ghost" as const,
  surface: "dark" as const,
}

export function ModuleWorkspaceHeader({
  backHref,
  showFullscreen = true,
  popLogoSrc,
  popName,
  popStreetAddress,
  title,
  loading = false,
  headerVariant = "dark",
  titleAdornment,
  headerActions,
  sectionMenu,
  toolbar,
  mainMaxWidthClass = "max-w-6xl",
  userName,
  userAvatarSrc,
  isOnline = true,
  subline,
  hasResolvedRole = false,
  isFullscreen = false,
  onToggleFullscreen,
  canCollapseSidebar = false,
  sidebarOpen = true,
  onToggleSidebar,
}: ModuleWorkspaceHeaderProps) {
  const resolvedPopStreetAddress = popStreetAddress?.trim() || null
  const resolvedTitle = title?.trim() || null
  const showBack = Boolean(backHref)
  const showFullscreenButton = showFullscreen && Boolean(onToggleFullscreen)
  const showSidebarToggle = canCollapseSidebar && Boolean(onToggleSidebar)
  const showBrand = Boolean(popLogoSrc || popName || loading)
  const showActions = Boolean(headerActions || sectionMenu)

  return (
    <>
      <MenuHeaderEntity size="module">
        <div className={menuModuleHeaderRowClass}>
          <div className="flex min-w-0 items-center gap-3">
            {showBack || showFullscreenButton || showSidebarToggle ? (
              <div className="flex items-center gap-0.5">
                {showBack ? (
                  <RootsIconButton
                    {...universeChrome}
                    size="default"
                    href={backHref}
                    label="Volver al menú"
                  >
                    <ArrowLeft aria-hidden />
                  </RootsIconButton>
                ) : null}
                {showFullscreenButton ? (
                  <RootsIconButton
                    {...universeChrome}
                    size="default"
                    label={
                      isFullscreen
                        ? "Salir de pantalla completa"
                        : "Pantalla completa"
                    }
                    title={
                      isFullscreen
                        ? "Salir de pantalla completa"
                        : "Pantalla completa"
                    }
                    onClick={onToggleFullscreen}
                  >
                    {isFullscreen ? (
                      <Minimize2 aria-hidden />
                    ) : (
                      <Maximize2 aria-hidden />
                    )}
                  </RootsIconButton>
                ) : null}
                {showSidebarToggle ? (
                  <RootsIconButton
                    {...universeChrome}
                    size="default"
                    onClick={onToggleSidebar}
                    className={cn(
                      !sidebarOpen &&
                        "!border-red-500/45 !bg-red-500/15 !text-red-300 hover:!border-red-400/55 hover:!bg-red-500/25 hover:!text-red-200",
                    )}
                    aria-expanded={sidebarOpen}
                    aria-controls="data-workspace-sidebar"
                    label={
                      sidebarOpen
                        ? "Ocultar panel de navegación"
                        : "Mostrar panel de navegación"
                    }
                    title={
                      sidebarOpen ? "Ocultar panel ([)" : "Mostrar panel ([)"
                    }
                  >
                    {sidebarOpen ? (
                      <PanelLeftClose aria-hidden />
                    ) : (
                      <PanelLeftOpen aria-hidden />
                    )}
                  </RootsIconButton>
                ) : null}
              </div>
            ) : null}

            {showBrand ? (
              <div className="flex min-w-0 items-center gap-2.5">
                {popLogoSrc ? (
                  <div className="size-9 shrink-0 overflow-hidden rounded-xl ring-1 ring-[rgba(228,242,248,0.16)] shadow-[0_2px_10px_rgba(0,0,0,0.16)]">
                    <img
                      src={popLogoSrc}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}
                {popName || loading ? (
                  <div className="flex min-w-0 flex-col gap-px">
                    <span
                      className={cn(
                        "truncate text-sm tracking-tight",
                        menuRealmTitleClass,
                      )}
                    >
                      {popName || (loading ? "…" : "—")}
                    </span>
                    {resolvedPopStreetAddress ? (
                      <span
                        className={cn(
                          "truncate text-xs leading-tight",
                          menuRealmLightMutedClass,
                        )}
                      >
                        {resolvedPopStreetAddress}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex min-w-0 items-center justify-center gap-2">
            {resolvedTitle ? (
              <h1
                className={cn(
                  "truncate text-xl tracking-tight",
                  menuRealmTitleClass,
                )}
              >
                {resolvedTitle}
              </h1>
            ) : null}
            {titleAdornment}
          </div>

          <div className="flex min-w-0 items-center justify-end gap-3">
            {showActions ? (
              <div className="flex items-center gap-1">
                {headerActions}
                {sectionMenu}
              </div>
            ) : null}
            {showActions && userName ? (
              <div className={cn("h-6 w-px", menuRealmDividerClass)} aria-hidden />
            ) : null}
            {userName ? (
              <div className="flex min-w-0 items-center gap-3">
                <div className="hidden min-w-0 flex-col items-end text-right leading-tight sm:flex">
                  <span
                    className={cn(
                      "truncate text-sm font-normal",
                      menuRealmBodyClass,
                    )}
                  >
                    {userName}
                  </span>
                  {subline ? (
                    <span
                      className={cn(
                        "truncate text-[10px] font-semibold uppercase tracking-wider",
                        dataWorkspaceHeaderRoleLabelClass(
                          "dark",
                          hasResolvedRole,
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
                  headerVariant="dark"
                />
              </div>
            ) : null}
          </div>
        </div>
      </MenuHeaderEntity>

      {toolbar ? (
        <div
          className={cn(
            "relative z-10 border-t px-4 py-2 sm:px-6",
            dataWorkspaceHeaderToolbarClass(headerVariant),
          )}
        >
          <div className={cn("mx-auto w-full", mainMaxWidthClass)}>{toolbar}</div>
        </div>
      ) : null}
    </>
  )
}
