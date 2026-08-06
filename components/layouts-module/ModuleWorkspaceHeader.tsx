"use client"

import { DataWorkspaceHeaderTitle } from "@/components/layouts/DataWorkspaceHeaderTitle"
import { DataWorkspaceHeaderUserMenu } from "@/components/layouts/DataWorkspaceHeaderUserMenu"
import {
  dataWorkspaceHeaderDividerClass,
  dataWorkspaceHeaderPopRingClass,
  dataWorkspaceHeaderRoleLabelClass,
  dataWorkspaceHeaderToolbarClass,
  isLayoutsTablesHeader,
  type DataWorkspaceHeaderVariant,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import {
  layoutsModuleHeaderGlassClass,
  layoutsModuleHeaderPopNameClass,
  layoutsModuleHeaderUserNameClass,
} from "@/components/layouts-module/rootsLayoutsModuleProductStyles"
import { RootsIconButton } from "@/components/rootsy-button/RootsIconButton"
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
  backHref: string
  popLogoSrc: string
  popName: string
  title: string
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
  isFullscreen: boolean
  onToggleFullscreen: () => void
  canCollapseSidebar: boolean
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function ModuleWorkspaceHeader({
  backHref,
  popLogoSrc,
  popName,
  title,
  loading = false,
  headerVariant = "tables",
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
  isFullscreen,
  onToggleFullscreen,
  canCollapseSidebar,
  sidebarOpen,
  onToggleSidebar,
}: ModuleWorkspaceHeaderProps) {
  const useModuleTypography = isLayoutsTablesHeader(headerVariant)
  const posChrome = { theme: "pos" as const, emphasis: "ghost" as const }

  return (
    <header className={cn("relative z-20 shrink-0", layoutsModuleHeaderGlassClass)}>
      <div className="relative z-10 grid h-17 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 px-4">
        <div className="flex min-w-0 items-center gap-2">
          <RootsIconButton
            {...posChrome}
            href={backHref}
            label="Volver al menú"
            className="transition-transform hover:[&_svg]:-translate-x-0.5"
          >
            <ArrowLeft aria-hidden />
          </RootsIconButton>
          <RootsIconButton
            {...posChrome}
            label={
              isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"
            }
            title={
              isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"
            }
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 aria-hidden />
            ) : (
              <Maximize2 aria-hidden />
            )}
          </RootsIconButton>
          {canCollapseSidebar ? (
            <RootsIconButton
              {...posChrome}
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
              title={sidebarOpen ? "Ocultar panel ([)" : "Mostrar panel ([)"}
            >
              {sidebarOpen ? (
                <PanelLeftClose aria-hidden />
              ) : (
                <PanelLeftOpen aria-hidden />
              )}
            </RootsIconButton>
          ) : null}
          <div
            className={cn("h-6 w-px", dataWorkspaceHeaderDividerClass(headerVariant))}
            aria-hidden
          />
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className={cn(
                "size-8 overflow-hidden rounded-lg ring-1",
                dataWorkspaceHeaderPopRingClass(headerVariant),
              )}
            >
              <img src={popLogoSrc} alt="" className="size-full object-cover" />
            </div>
            <span
              className={
                useModuleTypography
                  ? layoutsModuleHeaderPopNameClass
                  : "truncate text-sm font-semibold text-zinc-100"
              }
            >
              {popName || (loading ? "…" : "—")}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <DataWorkspaceHeaderTitle title={title} headerVariant={headerVariant} />
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
                <div className="hidden min-w-0 flex-col leading-tight sm:flex">
                  <span
                    className={
                      useModuleTypography
                        ? layoutsModuleHeaderUserNameClass
                        : "truncate text-sm font-semibold text-zinc-100"
                    }
                  >
                    {userName}
                  </span>
                  {subline ? (
                    <span
                      className={cn(
                        "truncate text-[10px] font-semibold uppercase tracking-wider",
                        dataWorkspaceHeaderRoleLabelClass(
                          headerVariant,
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
          <div className={cn("mx-auto w-full", mainMaxWidthClass)}>{toolbar}</div>
        </div>
      ) : null}
    </header>
  )
}
