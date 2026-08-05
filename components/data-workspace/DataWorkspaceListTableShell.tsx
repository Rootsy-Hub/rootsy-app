"use client"

import { cn } from "@/lib/utils"
import {
  dataWorkspaceShellCard,
  listTableChromeStackClass,
  listTableChromeStackFollowRowClass,
  workspaceTableListBodyScopeClass,
  workspaceTableSurfaceClass,
} from "./dataWorkspaceListStyles"
import type { ReactNode } from "react"

export type DataWorkspaceListTableShellProps = {
  children: ReactNode
  activeFiltersBar?: ReactNode
  bulkToolbar?: ReactNode
  footer?: ReactNode
  overlay?: ReactNode
  variant?: "default" | "flush"
  /** Pie con cristal POP — cuerpo opaco; solo el footer deja ver el fondo de página. */
  glassFooter?: boolean
  className?: string
}

export function DataWorkspaceListTableShell({
  children,
  activeFiltersBar,
  bulkToolbar,
  footer,
  overlay,
  variant = "default",
  glassFooter = false,
  className,
}: DataWorkspaceListTableShellProps) {
  const isFlush = variant === "flush"
  const useChromeStack = activeFiltersBar != null
  const bodySurfaceClass = isFlush ? workspaceTableSurfaceClass : dataWorkspaceShellCard
  const resolvedBodySurface = className ? undefined : bodySurfaceClass

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-hidden [--dw-table-footer-height:4rem]",
        !glassFooter && resolvedBodySurface,
        !glassFooter && className,
      )}
    >
      {!isFlush && !glassFooter ? (
        <div
          className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
      ) : null}
      <div
        className={cn(
          "relative flex min-h-0 flex-1 flex-col overflow-hidden",
          glassFooter && (className ?? resolvedBodySurface),
        )}
      >
        {useChromeStack ? (
          <div className={listTableChromeStackClass}>
            {activeFiltersBar}
            {bulkToolbar ? (
              <div className={listTableChromeStackFollowRowClass}>
                {bulkToolbar}
              </div>
            ) : null}
          </div>
        ) : (
          bulkToolbar ?? null
        )}
        <div className="relative min-h-0 flex-1">
          <div
            className={cn(
              "rootsy-scroll-minimal absolute inset-0 overflow-auto",
              workspaceTableListBodyScopeClass,
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
      </div>
      {footer ? (
        <div className={cn("relative z-20 shrink-0", glassFooter && "bg-transparent")}>
          {footer}
        </div>
      ) : null}
    </div>
  )
}
