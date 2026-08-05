"use client"

import { DataWorkspaceLayout, type DataWorkspaceLayoutProps } from "@/components/layouts/DataWorkspaceLayout"
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
  workspaceTableNatureEarthOrganicScopeClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

/** Clases del scope tierra orgánica — filtros + tabla (patrón Clientes). */
export const dataWorkspaceTableListNatureShellClass = cn(
  "rootsy-app-light rootsy-nature-palette flex min-h-0 flex-1 flex-col",
  workspaceTableNatureEarthOrganicScopeClass,
)

/** Clases del cuerpo de página listado tabla — error + nature shell. */
export const dataWorkspaceTableListPageBodyClass =
  "relative flex min-h-0 w-full flex-1 flex-col"

export const dataWorkspaceTableListErrorBannerClass = "relative shrink-0"

export type DataWorkspaceTableListPageProps = {
  /** Props passthrough al shell operativo. */
  layout: Pick<
    DataWorkspaceLayoutProps,
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
    <DataWorkspaceLayout
      {...layout}
      headerVariant="dark"
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
    </DataWorkspaceLayout>
  )
}

export type DataWorkspaceTableListNatureShellProps = {
  children: ReactNode
  className?: string
}

/** Contenedor tierra orgánica — envuelve filtros + tabla. */
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
  /** Por defecto `earth` (pie tierra oscuro + selects). */
  footerVariant?: DataWorkspaceListPaginationFooterProps["variant"]
}

/** Shell flush con scope layout h-11/h-14 — defaults del listado Nature. */
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

/** Pie de paginación — `variant="earth"` por defecto. */
export function DataWorkspaceTableListPaginationFooter({
  variant = "earth",
  ...props
}: DataWorkspaceTableListPaginationFooterProps) {
  return <DataWorkspaceListPaginationFooter variant={variant} {...props} />
}
