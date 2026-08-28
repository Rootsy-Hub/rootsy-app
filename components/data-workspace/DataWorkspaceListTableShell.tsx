"use client"

import { RootsyThinkingHalo, useRootsyThinkingPresence } from "@/components/rootsy-thinking/RootsyThinkingHalo"
import { dataWorkspaceTableInfiniteCopy } from "@/components/data-workspace/dataWorkspaceTableInfiniteCopy"
import { cn } from "@/lib/utils"
import { useEffect, useState, type ReactNode } from "react"
import {
  dataWorkspaceShellCard,
  dataWorkspaceTableBodyScrollClass,
  dataWorkspaceTableBodyScrollHiddenClass,
  listTableChromeStackClass,
  listTableChromeStackFollowRowClass,
  workspaceTableListBodyScopeClass,
  workspaceTableSurfaceClass,
} from "./dataWorkspaceListStyles"
import { workspaceTableLayoutListBodyScopeClass } from "./dataWorkspaceTablesLayout"
import {
  DataWorkspaceTableInfiniteSentinel,
  type DataWorkspaceTableListInfinite,
} from "./DataWorkspaceTableInfiniteSentinel"

export type DataWorkspaceListTableShellProps = {
  children: ReactNode
  activeFiltersBar?: ReactNode
  bulkToolbar?: ReactNode
  footer?: ReactNode
  overlay?: ReactNode
  variant?: "default" | "flush"
  /** Pie con cristal POP — cuerpo opaco; solo el footer deja ver el fondo de página. */
  glassFooter?: boolean
  /** Pie suelo flotante sobre el listado, sin comer altura. */
  footerFloating?: boolean
  /** Dock compacto centrado (no estira a todo el ancho). */
  footerFloatingCentered?: boolean
  /** Al cambiar, el scroll del listado vuelve arriba. */
  scrollResetKey?: string | number
  /** Sin barras — p. ej. esqueleto de carga. */
  lockScroll?: boolean
  className?: string
  infinite?: DataWorkspaceTableListInfinite
}

export function DataWorkspaceListTableShell({
  children,
  activeFiltersBar,
  bulkToolbar,
  footer,
  overlay,
  variant = "default",
  glassFooter = false,
  footerFloating = false,
  footerFloatingCentered = false,
  scrollResetKey,
  lockScroll = false,
  className,
  infinite,
}: DataWorkspaceListTableShellProps) {
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null)
  const isFlush = variant === "flush"
  const useChromeStack = activeFiltersBar != null
  const bodySurfaceClass = isFlush ? workspaceTableSurfaceClass : dataWorkspaceShellCard
  const resolvedBodySurface = className ? undefined : bodySurfaceClass
  const fetchingMore = Boolean(infinite?.isFetchingMore)
  const floorHalo = useRootsyThinkingPresence(fetchingMore)

  useEffect(() => {
    if (!scrollRoot) return
    scrollRoot.scrollTop = 0
  }, [scrollRoot, scrollResetKey])

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
            ref={setScrollRoot}
            className={cn(
              lockScroll
                ? dataWorkspaceTableBodyScrollHiddenClass
                : dataWorkspaceTableBodyScrollClass,
              workspaceTableListBodyScopeClass,
              workspaceTableLayoutListBodyScopeClass,
            )}
          >
            <div className="min-h-full min-w-0">
              {children}
              {infinite ? (
                <DataWorkspaceTableInfiniteSentinel
                  {...infinite}
                  root={scrollRoot}
                />
              ) : null}
              {footer &&
              footerFloating &&
              infinite &&
              !infinite.hasMore &&
              infinite.hasItems ? (
                <div className="h-16 w-full shrink-0" aria-hidden />
              ) : null}
            </div>
          </div>
          {floorHalo.visible && infinite ? (
            <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
              <RootsyThinkingHalo
                className="rootsy-thinking--floor"
                label={dataWorkspaceTableInfiniteCopy(infinite.world)}
                showDots={false}
                exiting={floorHalo.exiting}
              />
            </div>
          ) : null}
          {overlay ? (
            <div className="pointer-events-none absolute inset-0 z-10 overflow-visible">
              {overlay}
            </div>
          ) : null}
          {footer && footerFloating ? (
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-end pb-[max(0.75rem,env(safe-area-inset-bottom))]",
                footerFloatingCentered ? "pl-3 pr-6" : "px-3",
              )}
            >
              <div
                className={cn(
                  "pointer-events-auto",
                  footerFloatingCentered ? "w-auto" : "w-full",
                )}
                data-fetching-more={fetchingMore ? "" : undefined}
              >
                {footer}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {footer && !footerFloating ? (
        <div
          className={cn("relative z-20 shrink-0", glassFooter && "bg-transparent")}
          data-fetching-more={fetchingMore ? "" : undefined}
        >
          {footer}
        </div>
      ) : null}
    </div>
  )
}
