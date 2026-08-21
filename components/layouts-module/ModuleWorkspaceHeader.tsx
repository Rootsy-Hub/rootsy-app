"use client"

import { MenuHeaderEntity } from "@/app/[siteId]/[popId]/menu/MenuHeaderEntity"
import { menuModuleHeaderRowClass } from "@/app/[siteId]/[popId]/menu/menuFloatingPillStyles"
import { DataWorkspaceHeaderUserMenu } from "@/components/layouts/DataWorkspaceHeaderUserMenu"
import {
  dataWorkspaceHeaderToolbarClass,
  type DataWorkspaceHeaderVariant,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import { EterIconButton } from "@/components/eter/EterIconButton"
import { PopIdentityHeaderCompact } from "@/components/pop-identity/PopIdentityHeaderCompact"
import {
  eterHeaderDividerClass,
  eterHeaderTitleClass,
} from "@/lib/eter/eterChrome"
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

export function ModuleWorkspaceHeader({
  backHref,
  showFullscreen = true,
  popLogoSrc,
  popName,
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
                  <EterIconButton
                    size="default"
                    href={backHref}
                    label="Volver al menú"
                  >
                    <ArrowLeft aria-hidden />
                  </EterIconButton>
                ) : null}
                {showFullscreenButton ? (
                  <EterIconButton
                    size="default"
                    label={
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
                  </EterIconButton>
                ) : null}
                {showSidebarToggle ? (
                  <EterIconButton
                    size="default"
                    intent={sidebarOpen ? "subtle" : "danger"}
                    onClick={onToggleSidebar}
                    aria-expanded={sidebarOpen}
                    aria-controls="data-workspace-sidebar"
                    label={
                      sidebarOpen
                        ? "Ocultar panel de navegación"
                        : "Mostrar panel de navegación"
                    }
                  >
                    {sidebarOpen ? (
                      <PanelLeftClose aria-hidden />
                    ) : (
                      <PanelLeftOpen aria-hidden />
                    )}
                  </EterIconButton>
                ) : null}
              </div>
            ) : null}

            {showBrand ? (
              <PopIdentityHeaderCompact
                name={popName || (loading ? "…" : "—")}
                imageUrl={popLogoSrc}
                fallbackSeed={popName || "pop"}
                tone="dark"
              />
            ) : null}
          </div>

          <div className="flex min-w-0 items-center justify-center gap-2">
            {resolvedTitle ? (
              <h1
                className={cn(
                  "truncate text-xl tracking-tight",
                  eterHeaderTitleClass,
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
              <div className={cn("h-6 w-px", eterHeaderDividerClass)} aria-hidden />
            ) : null}
            {userName ? (
              <DataWorkspaceHeaderUserMenu
                userName={userName}
                userAvatarSrc={userAvatarSrc}
                isOnline={isOnline}
                headerVariant="dark"
                size="compact"
                roleLabel={subline}
                hasResolvedRole={hasResolvedRole}
              />
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
