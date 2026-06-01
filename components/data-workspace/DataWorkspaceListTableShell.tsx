"use client"

import { cn } from "@/lib/utils"
import { dataWorkspaceShellCard } from "./dataWorkspaceListStyles"
import type { ReactNode } from "react"

export type DataWorkspaceListTableShellProps = {
  children: ReactNode
  /** Barra opcional sobre la tabla (selección múltiple, acciones en lote). */
  bulkToolbar?: ReactNode
  /** Pie fijo (paginación, totales), fuera del scroll. */
  footer?: ReactNode
  className?: string
}

export function DataWorkspaceListTableShell({
  children,
  bulkToolbar,
  footer,
  className,
}: DataWorkspaceListTableShellProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-hidden",
        dataWorkspaceShellCard,
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {bulkToolbar ? bulkToolbar : null}
        <div className="rootsy-scroll-minimal min-h-0 flex-1 overflow-auto">
          {children}
        </div>
        {footer ? footer : null}
      </div>
    </div>
  )
}
