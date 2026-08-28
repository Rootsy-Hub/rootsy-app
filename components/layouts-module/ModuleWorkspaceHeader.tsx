"use client"

import { MenuHeaderEntity } from "@/app/[siteId]/[popId]/menu/MenuHeaderEntity"
import { menuModuleHeaderRowClass } from "@/app/[siteId]/[popId]/menu/menuFloatingPillStyles"
import { DataWorkspaceHeaderUserMenu } from "@/components/layouts/DataWorkspaceHeaderUserMenu"
import { WorkspaceMobileAccountCluster } from "@/components/layouts/WorkspaceMobileAccountCluster"
import {
  dataWorkspaceHeaderToolbarClass,
  isDarkChromeHeader,
  type DataWorkspaceHeaderVariant,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import {
  moduleWorkspaceHeaderDividerClass,
  moduleWorkspaceHeaderIdentityTone,
  moduleWorkspaceHeaderIconProps,
  moduleWorkspaceHeaderMutedClass,
  moduleWorkspaceHeaderTitleClass,
  moduleWorkspaceHeaderVariant,
} from "@/components/layouts-module/moduleWorkspaceHeaderChrome"
import type { RootsButtonAtmosphere } from "@/components/rootsy-button/rootsButtonAtmosphere"
import { RootsIconButton } from "@/components/rootsy-button"
import {
  RootsDropdownContent,
  RootsDropdownItem,
  RootsDropdownMenu,
  RootsDropdownTrigger,
} from "@/components/rootsy-dropdown"
import { PopIdentityHeaderCompact } from "@/components/pop-identity/PopIdentityHeaderCompact"
import {
  menuGhostBarClass,
} from "@/app/[siteId]/[popId]/menu/menuDormantStyles"
import {
  getMenuCatalogItemByName,
  getMenuCatalogItemForModule,
} from "@/lib/menuCatalog"
import { popModuleKeyFromPath } from "@/lib/popRoutes"
import { cn } from "@/lib/utils"
import { PopLink as Link } from "@/lib/pop-spa/PopLink"
import { usePathname } from "next/navigation"
import {
  ArrowLeft,
  EllipsisVertical,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react"
import type { ReactNode } from "react"

export type DataWorkspaceHeaderMoreAction = {
  label: string
  onClick: () => void
  icon: LucideIcon
}

export type ModuleWorkspaceHeaderProps = {
  backHref?: string
  showFullscreen?: boolean
  popLogoSrc?: string
  popName?: string
  popStreetAddress?: string | null
  title?: string
  /** Ícono del módulo. Si no se pasa, se resuelve por ruta o por el título. */
  titleIcon?: LucideIcon
  /** Muestra el ícono junto al título. Apagado por defecto. */
  showTitleIcon?: boolean
  loading?: boolean
  brandPending?: boolean
  userPending?: boolean
  rolePending?: boolean
  headerVariant?: DataWorkspaceHeaderVariant
  /** Superficie del chrome. Si no se pasa, el header queda en éter. */
  atmosphere?: RootsButtonAtmosphere
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
  titleIcon,
  showTitleIcon = false,
  loading = false,
  brandPending: brandPendingProp = false,
  userPending: userPendingProp = false,
  rolePending = false,
  headerVariant = "dark",
  atmosphere,
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
  const pathname = usePathname()
  const resolvedTitle = title?.trim() || null
  const TitleIcon = showTitleIcon
    ? titleIcon ??
      getMenuCatalogItemForModule(popModuleKeyFromPath(pathname ?? ""))?.icon ??
      getMenuCatalogItemByName(resolvedTitle ?? "")?.icon ??
      null
    : null
  const showBack = Boolean(backHref)
  const showFullscreenButton = showFullscreen && Boolean(onToggleFullscreen)
  const showSidebarToggle = canCollapseSidebar && Boolean(onToggleSidebar)
  const brandPending = brandPendingProp || (loading && !popName)
  const userPending = userPendingProp || (loading && !userName)
  const roleLinePending =
    rolePending || (loading && !hasResolvedRole && !subline?.trim())
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
  const resolvedAtmosphere = atmosphere ?? "eter"
  const resolvedHeaderVariant = atmosphere
    ? moduleWorkspaceHeaderVariant(atmosphere)
    : headerVariant
  const iconProps = moduleWorkspaceHeaderIconProps(resolvedAtmosphere)
  const titleClass = moduleWorkspaceHeaderTitleClass(resolvedAtmosphere)
  const dividerClass = moduleWorkspaceHeaderDividerClass(resolvedAtmosphere)
  const identityTone = moduleWorkspaceHeaderIdentityTone(resolvedAtmosphere)
  const renderMoreMenu = (presentation: "icons" | "menu") => {
    const actions =
      presentation === "menu" ? mobileMoreActions : desktopMoreActions
    if (actions.length === 0) return null
    const dark = isDarkChromeHeader(resolvedHeaderVariant)
    const moreIconProps = dark
      ? iconProps
      : ({ theme: "workspace", emphasis: "ghost", size: "default" } as const)
    const dropdownAtmosphere = resolvedAtmosphere

    if (presentation === "menu") {
      return (
        <RootsDropdownMenu>
          <RootsDropdownTrigger asChild>
            <RootsIconButton label="Más acciones" {...moreIconProps}>
              <EllipsisVertical aria-hidden />
            </RootsIconButton>
          </RootsDropdownTrigger>
          <RootsDropdownContent
            atmosphere={dropdownAtmosphere}
            align="end"
            side="bottom"
            sideOffset={8}
          >
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <RootsDropdownItem
                  key={action.label}
                  atmosphere={dropdownAtmosphere}
                  className="gap-2"
                  onSelect={action.onClick}
                >
                  <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{action.label}</span>
                </RootsDropdownItem>
              )
            })}
          </RootsDropdownContent>
        </RootsDropdownMenu>
      )
    }

    return (
      <div className="flex items-center gap-1">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <RootsIconButton
              key={action.label}
              label={action.label}
              onClick={action.onClick}
              {...moreIconProps}
            >
              <Icon aria-hidden />
            </RootsIconButton>
          )
        })}
      </div>
    )
  }

  return (
    <>
      <MenuHeaderEntity size="module" atmosphere={resolvedAtmosphere}>
        <div className="flex h-full min-w-0 items-center gap-1.5 px-2 md:hidden">
          {showBack ? (
            <RootsIconButton
              size="default"
              href={backHref}
              label="Volver al menú"
              {...iconProps}
            >
              <ArrowLeft aria-hidden />
            </RootsIconButton>
          ) : null}

          {showSidebarToggle && !hideSidebarToggleOnMobile ? (
            <RootsIconButton
              size="default"
              semantic={sidebarOpen ? "tertiary" : "destructive"}
              atmosphere={resolvedAtmosphere}
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
            </RootsIconButton>
          ) : null}

          <ModuleWorkspaceMobileTitle
            popName={popName}
            title={resolvedTitle}
            titleIcon={TitleIcon}
            pending={brandPending}
            atmosphere={resolvedAtmosphere}
            homeHref={backHref}
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
                  <RootsIconButton
                    size="default"
                    href={backHref}
                    label="Volver al menú"
                    {...iconProps}
                  >
                    <ArrowLeft aria-hidden />
                  </RootsIconButton>
                ) : null}
                {showFullscreenButton ? (
                  <RootsIconButton
                    size="default"
                    {...iconProps}
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
                  </RootsIconButton>
                ) : null}
                {showSidebarToggle ? (
                  <RootsIconButton
                    size="default"
                    semantic={sidebarOpen ? "tertiary" : "destructive"}
                    atmosphere={resolvedAtmosphere}
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
                  </RootsIconButton>
                ) : null}
              </div>
            ) : null}

            {showBrand ? (
              <PopIdentityHeaderCompact
                name={popName || "—"}
                imageUrl={popLogoSrc}
                fallbackSeed={popName || "pop"}
                tone={identityTone}
                pending={brandPending}
                href={backHref}
              />
            ) : null}
          </div>

          <div className="flex min-w-0 items-center justify-center gap-2">
            {resolvedTitle ? (
              <>
                {TitleIcon ? (
                  <TitleIcon
                    aria-hidden
                    className={cn("size-5 shrink-0", titleClass)}
                    strokeWidth={1.75}
                  />
                ) : null}
                <h1
                  className={cn(
                    "rootsy-text-section-title truncate",
                    titleClass,
                  )}
                >
                  {resolvedTitle}
                </h1>
              </>
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
              <div className={cn("h-6 w-px", dividerClass)} aria-hidden />
            ) : null}
            {showUser ? (
              <DataWorkspaceHeaderUserMenu
                userName={userName ?? ""}
                userAvatarSrc={userAvatarSrc}
                isOnline={isOnline}
                headerVariant={resolvedHeaderVariant}
                size="compact"
                roleLabel={subline}
                hasResolvedRole={hasResolvedRole}
                rolePending={roleLinePending}
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
            dataWorkspaceHeaderToolbarClass(resolvedHeaderVariant),
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
  titleIcon: TitleIcon,
  pending,
  atmosphere,
  homeHref,
}: {
  popName?: string
  title: string | null
  titleIcon: LucideIcon | null
  pending: boolean
  atmosphere: RootsButtonAtmosphere
  homeHref?: string
}) {
  const resolvedPopName = popName?.trim() || null
  const titleClass = moduleWorkspaceHeaderTitleClass(atmosphere)
  const mutedClass = moduleWorkspaceHeaderMutedClass(atmosphere)

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
      ) : resolvedPopName && homeHref ? (
        <Link
          href={homeHref}
          className={cn("rootsy-text-meta truncate font-medium", mutedClass)}
        >
          {resolvedPopName}
        </Link>
      ) : resolvedPopName ? (
        <p className={cn("rootsy-text-meta truncate font-medium", mutedClass)}>
          {resolvedPopName}
        </p>
      ) : null}
      {title ? (
        <div className="flex min-w-0 items-center gap-1.5">
          {TitleIcon ? (
            <TitleIcon
              aria-hidden
              className={cn("size-4 shrink-0", titleClass)}
              strokeWidth={1.75}
            />
          ) : null}
          <h1
            className={cn(
              "rootsy-text-heading-small truncate",
              titleClass,
            )}
          >
            {title}
          </h1>
        </div>
      ) : null}
    </div>
  )
}
