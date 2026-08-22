"use client"

import { MenuHeaderEntity } from "@/app/[siteId]/[popId]/menu/MenuHeaderEntity"
import { menuModuleHeaderRowClass } from "@/app/[siteId]/[popId]/menu/menuFloatingPillStyles"
import { DataWorkspaceHeaderUserMenu } from "@/components/layouts/DataWorkspaceHeaderUserMenu"
import { WorkspaceMobileAccountCluster } from "@/components/layouts/WorkspaceMobileAccountCluster"
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
  brandPending?: boolean
  userPending?: boolean
  headerVariant?: DataWorkspaceHeaderVariant
  titleAdornment?: ReactNode
  headerActions?: ReactNode
  sectionMenu?: ReactNode
  toolbar?: ReactNode
  mainMaxWidthClass?: string
  userName?: string
  userAvatarSrc?: string | null
  isOnline?: boolean
  subscriptionsHref?: string | null
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
  brandPending: brandPendingProp = false,
  userPending: userPendingProp = false,
  headerVariant = "dark",
  titleAdornment,
  headerActions,
  sectionMenu,
  toolbar,
  mainMaxWidthClass = "max-w-6xl",
  userName,
  userAvatarSrc,
  isOnline = true,
  subscriptionsHref = null,
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
  const brandPending = brandPendingProp || (loading && !popName)
  const userPending = userPendingProp || (loading && !userName)
  const showBrand = brandPending || Boolean(popLogoSrc || popName)
  const showUser = userPending || Boolean(userName)
  const showActions = Boolean(headerActions || sectionMenu)

  return (
    <>
      <MenuHeaderEntity size="module">
        <div className="flex h-full min-w-0 items-center gap-1.5 px-2 md:hidden">
          {showBack ? (
            <EterIconButton
              size="default"
              href={backHref}
              label="Volver al menú"
            >
              <ArrowLeft aria-hidden />
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

          {resolvedTitle ? (
            <h1
              className={cn(
                "min-w-0 flex-1 truncate text-base tracking-tight",
                eterHeaderTitleClass,
              )}
            >
              {resolvedTitle}
            </h1>
          ) : showBrand ? (
            <PopIdentityHeaderCompact
              name={popName || "—"}
              imageUrl={popLogoSrc}
              fallbackSeed={popName || "pop"}
              tone="dark"
              pending={brandPending}
              className="min-w-0 flex-1"
            />
          ) : (
            <span className="min-w-0 flex-1" />
          )}

          <div className="ml-auto flex shrink-0 items-center gap-1">
            {headerActions}
            {sectionMenu}
            {showUser ? (
              <WorkspaceMobileAccountCluster
                userName={userName ?? ""}
                userAvatarSrc={userAvatarSrc ?? null}
                isOnline={isOnline}
                subscriptionsHref={subscriptionsHref}
                pending={userPending}
              />
            ) : null}
          </div>
        </div>

        <div className={cn(menuModuleHeaderRowClass, "hidden md:grid")}>
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
                name={popName || "—"}
                imageUrl={popLogoSrc}
                fallbackSeed={popName || "pop"}
                tone="dark"
                pending={brandPending}
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
            {showActions && showUser ? (
              <div className={cn("h-6 w-px", eterHeaderDividerClass)} aria-hidden />
            ) : null}
            {showUser ? (
              <DataWorkspaceHeaderUserMenu
                userName={userName ?? ""}
                userAvatarSrc={userAvatarSrc}
                isOnline={isOnline}
                headerVariant="dark"
                size="compact"
                roleLabel={subline}
                hasResolvedRole={hasResolvedRole}
                pending={userPending}
              />
            ) : null}
          </div>
        </div>
      </MenuHeaderEntity>

      {toolbar ? (
        <div
          className={cn(
            "relative z-10 border-t px-3 py-2 md:px-6",
            dataWorkspaceHeaderToolbarClass(headerVariant),
          )}
        >
          <div className={cn("mx-auto w-full", mainMaxWidthClass)}>{toolbar}</div>
        </div>
      ) : null}
    </>
  )
}
