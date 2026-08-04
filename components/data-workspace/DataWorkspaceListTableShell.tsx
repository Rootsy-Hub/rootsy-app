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
  /** Pie con cristal POP — el shell no tapa el fondo de página detrás del footer. */
  glassFooter?: boolean
  /** Fondo del área de scroll cuando `glassFooter` separa el pie del cuerpo. */
  contentSurfaceClass?: string
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
  contentSurfaceClass,
  className,
}: DataWorkspaceListTableShellProps) {
  const isFlush = variant === "flush"
  const useChromeStack = activeFiltersBar != null
  const splitFooterFromSurface = isFlush && glassFooter && footer != null
  const scrollSurfaceClass =
    contentSurfaceClass ??
    (splitFooterFromSurface ? workspaceTableSurfaceClass : undefined)

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col [--dw-table-footer-height:4rem]",
        !splitFooterFromSurface && "overflow-hidden",
        splitFooterFromSurface
          ? "bg-transparent"
          : isFlush
            ? workspaceTableSurfaceClass
            : dataWorkspaceShellCard,
        className,
        splitFooterFromSurface && "!bg-transparent",
      )}
    >
      {!isFlush ? (
        <div
          className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
      ) : null}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
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
        <div
          className={cn(
            "relative min-h-0 flex-1",
            splitFooterFromSurface && scrollSurfaceClass,
          )}
        >
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
        <div
          className={cn(
            "relative z-20 shrink-0",
            glassFooter && "bg-transparent",
          )}
        >
          {footer}
        </div>
      ) : null}
    </div>
  )
}
