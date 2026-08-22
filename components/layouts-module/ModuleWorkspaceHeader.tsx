"use client"

import { MenuHeaderEntity } from "@/app/[siteId]/[popId]/menu/MenuHeaderEntity"
import { menuModuleHeaderRowClass } from "@/app/[siteId]/[popId]/menu/menuFloatingPillStyles"
import {
  DataWorkspaceHeaderMoreMenu,
  type DataWorkspaceHeaderMoreAction,
} from "@/components/layouts/DataWorkspaceHeaderMoreMenu"
import { DataWorkspaceHeaderUserMenu } from "@/components/layouts/DataWorkspaceHeaderUserMenu"
import { WorkspaceMobileAccountCluster } from "@/components/layouts/WorkspaceMobileAccountCluster"
import {
  dataWorkspaceHeaderToolbarClass,
  type DataWorkspaceHeaderVariant,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import { EterIconButton } from "@/components/eter/EterIconButton"
import { PopIdentityHeaderCompact } from "@/components/pop-identity/PopIdentityHeaderCompact"
import {
  menuGhostBarClass,
} from "@/app/[siteId]/[popId]/menu/menuDormantStyles"
import {
  eterHeaderDividerClass,
  eterHeaderMutedClass,
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
  headerMoreActions?: readonly DataWorkspaceHeaderMoreAction[]
  /** Solo el ⋯ mobile (p. ej. listas de precios en operar). */
  headerMobileMoreActions?: readonly DataWorkspaceHeaderMoreAction[]
  /** En operar mobile las categorías van en el canvas, no en el header. */
  hideSidebarToggleOnMobile?: boolean
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
  headerMoreActions,
  headerMobileMoreActions,
  hideSidebarToggleOnMobile = false,
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
  const desktopMoreActions = headerMoreActions ?? []
  const mobileMoreActions = [
    ...(headerMobileMoreActions ?? []),
    ...desktopMoreActions,
  ]
  const hasMoreActions = desktopMoreActions.length > 0
  const hasMobileMoreActions = mobileMoreActions.length > 0
  const showActions = Boolean(
    headerActions || hasMoreActions || hasMobileMoreActions || sectionMenu,
  )
  const renderMoreMenu = (presentation: "icons" | "menu") => {
    const actions =
      presentation === "menu" ? mobileMoreActions : desktopMoreActions
    if (actions.length === 0) return null
    return (
      <DataWorkspaceHeaderMoreMenu
        actions={actions}
        headerVariant={headerVariant}
        presentation={presentation}
      />
    )
  }

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

          {showSidebarToggle && !hideSidebarToggleOnMobile ? (
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

          <ModuleWorkspaceMobileTitle
            popName={popName}
            title={resolvedTitle}
            pending={brandPending}
          />

          <div className="ml-auto flex shrink-0 items-center gap-0.5">
            {headerActions}
            {renderMoreMenu("menu")}
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

          <div className="flex min-w-0 items-center justify-end gap-2 lg:gap-3">
            {showActions ? (
              <div className="flex shrink-0 items-center gap-1">
                {headerActions}
                <div className="lg:hidden">{renderMoreMenu("menu")}</div>
                <div className="hidden lg:contents">{renderMoreMenu("icons")}</div>
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

function ModuleWorkspaceMobileTitle({
  popName,
  title,
  pending,
}: {
  popName?: string
  title: string | null
  pending: boolean
}) {
  const resolvedPopName = popName?.trim() || null

  if (pending && !title && !resolvedPopName) {
    return (
      <div className="min-w-0 flex-1" aria-hidden>
        <span className={cn(menuGhostBarClass, "mb-1 block h-2.5 w-20")} />
        <span className={cn(menuGhostBarClass, "block h-3.5 w-16")} />
      </div>
    )
  }

  if (!title && !resolvedPopName && !pending) {
    return <span className="min-w-0 flex-1" />
  }

  return (
    <div className="min-w-0 flex-1 leading-tight">
      {pending && !resolvedPopName ? (
        <span className={cn(menuGhostBarClass, "mb-0.5 block h-2.5 w-20")} aria-hidden />
      ) : resolvedPopName ? (
        <p className={cn("truncate text-[11px] font-medium", eterHeaderMutedClass)}>
          {resolvedPopName}
        </p>
      ) : null}
      {title ? (
        <h1
          className={cn(
            "truncate text-base tracking-tight",
            eterHeaderTitleClass,
          )}
        >
          {title}
        </h1>
      ) : null}
    </div>
  )
}
