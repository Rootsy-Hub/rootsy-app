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
  /** `flush`: sin tarjeta ni decoración; ocupa todo el ancho del main. */
  variant?: "default" | "flush"
  className?: string
}

export function DataWorkspaceListTableShell({
  children,
  bulkToolbar,
  footer,
  variant = "default",
  className,
}: DataWorkspaceListTableShellProps) {
  const isFlush = variant === "flush"

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-hidden",
        isFlush ? "bg-card" : dataWorkspaceShellCard,
        className,
      )}
    >
      {!isFlush ? (
        <div
          className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
      ) : null}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {bulkToolbar ? bulkToolbar : null}
        <div
          className={cn(
            "rootsy-scroll-minimal min-h-0 flex-1 overflow-auto",
            isFlush && "pr-3",
          )}
        >
          {children}
        </div>
        {footer ? footer : null}
      </div>
    </div>
  )
}
