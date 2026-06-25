"use client"

import { cn } from "@/lib/utils"
import {
  dataWorkspaceShellCard,
  workspaceTableSurfaceClass,
  workspaceTableSurfaceGlowClass,
} from "./dataWorkspaceListStyles"
import type { ReactNode } from "react"

export type DataWorkspaceListTableShellProps = {
  children: ReactNode
  /** Barra opcional sobre la tabla (selección múltiple, acciones en lote). */
  bulkToolbar?: ReactNode
  /** Pie fijo (paginación, totales), fuera del scroll. */
  footer?: ReactNode
  /** Capa sobre el área de scroll (p. ej. mascota en estado vacío). */
  overlay?: ReactNode
  /** `flush`: sin tarjeta ni decoración; ocupa todo el ancho del main. */
  variant?: "default" | "flush"
  className?: string
}

export function DataWorkspaceListTableShell({
  children,
  bulkToolbar,
  footer,
  overlay,
  variant = "default",
  className,
}: DataWorkspaceListTableShellProps) {
  const isFlush = variant === "flush"

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-hidden [--dw-table-footer-height:4rem]",
        isFlush ? workspaceTableSurfaceClass : dataWorkspaceShellCard,
        className,
      )}
    >
      {isFlush ? (
        <div className={workspaceTableSurfaceGlowClass} aria-hidden />
      ) : (
        <div
          className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
      )}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {bulkToolbar ? bulkToolbar : null}
        <div className="relative min-h-0 flex-1">
          <div
            className={cn(
              "rootsy-scroll-minimal absolute inset-0 overflow-auto",
              isFlush && "pr-3",
            )}
          >
            <div className="flex min-h-full min-w-0 flex-1 flex-col">
              {children}
            </div>
          </div>
          {overlay ? (
            <div className="pointer-events-none absolute inset-0 z-10 overflow-visible">
              {overlay}
            </div>
          ) : null}
        </div>
        {footer ? footer : null}
      </div>
    </div>
  )
}
