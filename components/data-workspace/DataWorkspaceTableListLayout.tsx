"use client"

import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
  type DataWorkspaceModuleLayoutProps,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { RootsBanner } from "@/components/rootsy-banner"
import {
  DataWorkspaceListPaginationFooter,
  type DataWorkspaceListPaginationFooterProps,
} from "@/components/data-workspace/DataWorkspaceListPaginationFooter"
import {
  DataWorkspaceListTableShell,
  type DataWorkspaceListTableShellProps,
} from "@/components/data-workspace/DataWorkspaceListTableShell"
import {
  dataWorkspaceListFiltersBarClass,
  dataWorkspaceListFiltersBarInnerClass,
  dataWorkspaceListFiltersBarRowClass,
  workspaceTableLayoutListBodyScopeClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { workspaceLayoutsTablesShellClass } from "@/components/layouts-tables/rootsLayoutsTablesProductStyles"
import "@/components/layouts-tables/rootsLayoutsTablesScope.css"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"
import type { DataWorkspaceHeaderVariant } from "@/components/layouts/dataWorkspaceHeaderStyles"

/** Variante de header para listados tabla — chrome módulo sombra · savia. */
export const dataWorkspaceTableListHeaderVariant =
  dataWorkspaceModuleHeaderVariant satisfies DataWorkspaceHeaderVariant

/** Clases del scope layout tablas — filtros + tabla. */
export const dataWorkspaceTableListNatureShellClass = workspaceLayoutsTablesShellClass

/** Clases del cuerpo de página listado tabla — error + nature shell. */
export const dataWorkspaceTableListPageBodyClass =
  "relative flex min-h-0 w-full flex-1 flex-col"

export const dataWorkspaceTableListErrorBannerClass = "relative shrink-0"

export type DataWorkspaceTableListPageProps = {
  /** Props passthrough al shell operativo. */
  layout: Pick<
    DataWorkspaceModuleLayoutProps,
    | "siteId"
    | "popId"
    | "popName"
    | "title"
    | "loading"
    | "userName"
    | "userAvatarSrc"
    | "userRoleLabel"
    | "pillLabel"
    | "headerActions"
    | "titleAdornment"
    | "sectionMenu"
    | "toolbar"
    | "backHref"
  >
  error?: string | null
  errorPrefix?: string
  children: ReactNode
}

/** Shell de página — header oscuro POP + área flush con scroll. */
export function DataWorkspaceTableListPage({
  layout,
  error,
  errorPrefix = "Cabecera",
  children,
}: DataWorkspaceTableListPageProps) {
  return (
    <DataWorkspaceModuleLayout
      {...layout}
      contentFlush
      sidebarCollapsible={false}
      mainClassName="min-h-0"
    >
      <div className={dataWorkspaceTableListPageBodyClass}>
        {error ? (
          <RootsBanner
            intent="danger"
            layout="message"
            variant="strip"
            fullWidth
            className={dataWorkspaceTableListErrorBannerClass}
            message={`${errorPrefix}: ${error}`}
          />
        ) : null}
        {children}
      </div>
    </DataWorkspaceModuleLayout>
  )
}

export type DataWorkspaceTableListNatureShellProps = {
  children: ReactNode
  className?: string
}

/** Contenedor layout tablas — envuelve filtros + tabla. */
export function DataWorkspaceTableListNatureShell({
  children,
  className,
}: DataWorkspaceTableListNatureShellProps) {
  return (
    <div className={cn(dataWorkspaceTableListNatureShellClass, className)}>
      {children}
    </div>
  )
}

/** @deprecated Alias de DataWorkspaceTableListNatureShell */
export const DataWorkspaceTableListLayoutsShell = DataWorkspaceTableListNatureShell

export type DataWorkspaceTableListFiltersBarProps = {
  children: ReactNode
  /** Por defecto: "Filtros del listado". */
  ariaLabel?: string
  className?: string
  innerClassName?: string
}

/** Barra h-23 — PERÍODO / FILTROS / BUSCAR. */
export function DataWorkspaceTableListFiltersBar({
  children,
  ariaLabel = "Filtros del listado",
  className,
  innerClassName,
}: DataWorkspaceTableListFiltersBarProps) {
  return (
    <div
      className={cn(dataWorkspaceListFiltersBarClass, className)}
      role="toolbar"
      aria-label={ariaLabel}
    >
      <div
        className={cn(
          dataWorkspaceListFiltersBarInnerClass,
          dataWorkspaceListFiltersBarRowClass,
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  )
}

export type DataWorkspaceTableListShellProps = Omit<
  DataWorkspaceListTableShellProps,
  "variant"
> & {
  /** Por defecto `tables` (pie sombra · layout librería). */
  footerVariant?: DataWorkspaceListPaginationFooterProps["variant"]
}

/** Shell flush con scope layout h-10/h-14 — listado tablas DS. */
export function DataWorkspaceTableListShell({
  className,
  footerVariant: _footerVariant,
  ...props
}: DataWorkspaceTableListShellProps) {
  return (
    <DataWorkspaceListTableShell
      variant="flush"
      className={cn(workspaceTableLayoutListBodyScopeClass, className)}
      {...props}
    />
  )
}

export type DataWorkspaceTableListPaginationFooterProps = Omit<
  DataWorkspaceListPaginationFooterProps,
  "variant"
> & {
  variant?: DataWorkspaceListPaginationFooterProps["variant"]
}

/** Pie de paginación — `variant="tables"` por defecto (layout librería). */
export function DataWorkspaceTableListPaginationFooter({
  variant = "tables",
  ...props
}: DataWorkspaceTableListPaginationFooterProps) {
  return <DataWorkspaceListPaginationFooter variant={variant} {...props} />
}
