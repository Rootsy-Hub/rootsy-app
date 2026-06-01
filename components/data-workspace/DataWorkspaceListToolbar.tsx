"use client"

import { cn } from "@/lib/utils"
import { dataWorkspaceShellCard, toolbarBlockLabelClass } from "./dataWorkspaceListStyles"
import type { ReactNode } from "react"

export type DataWorkspaceListToolbarProps = {
  /** Columna opcional a la izquierda (ej. filtro por fecha). */
  leading?: ReactNode
  /** Tarjeta “Filtros” (botón que abre modal, etc.). */
  filters: ReactNode
  /** Tarjeta “Buscar” (input controlado). */
  search: ReactNode
  /** Fila opcional bajo el grid (chips de filtros activos). */
  chips?: ReactNode
  className?: string
}

export function DataWorkspaceListToolbar({
  leading,
  filters,
  search,
  chips,
  className,
}: DataWorkspaceListToolbarProps) {
  return (
    <div className={cn("flex shrink-0 flex-col gap-3", className)}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-12">
        {leading ? (
          <div className="w-full md:col-span-1 xl:col-span-3">{leading}</div>
        ) : null}
        <div
          className={cn(
            "flex w-full flex-col md:col-span-1",
            leading ? "xl:col-span-3" : "xl:col-span-3",
          )}
        >
          {filters}
        </div>
        <div
          className={cn(
            "min-w-0 md:col-span-2",
            leading ? "xl:col-span-6" : "xl:col-span-9",
          )}
        >
          {search}
        </div>
      </div>
      {chips ? chips : null}
    </div>
  )
}

export function DataWorkspaceToolbarFilterCard({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        dataWorkspaceShellCard,
        "flex flex-col px-4 py-3",
        className,
      )}
    >
      <p className={toolbarBlockLabelClass}>{label}</p>
      {children}
    </div>
  )
}

export function DataWorkspaceToolbarSearchCard({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        dataWorkspaceShellCard,
        "min-w-0 px-4 py-3",
        className,
      )}
    >
      <p className={toolbarBlockLabelClass}>{label}</p>
      {children}
    </div>
  )
}
