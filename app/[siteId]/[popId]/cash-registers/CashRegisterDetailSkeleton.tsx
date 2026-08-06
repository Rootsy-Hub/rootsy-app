"use client"

import {
  dataWorkspaceDetailCardClass,
  dataWorkspaceDetailCardHeaderClass,
  dataWorkspaceDetailCardStatsClass,
  dataWorkspaceDetailFlushBottomCardClass,
  dataWorkspaceDetailToolbarClass,
  workspaceTableLayoutClassName,
  workspaceTableNatureSkeletonTone,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  workspaceTableLayoutHeaderHeadClass,
  workspaceTableLayoutListBodyScopeClass,
  workspaceTableLayoutListSurfaceClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { workspaceLayoutsTablesScopeClass } from "@/components/layouts-tables/rootsLayoutsTablesProductStyles"
import { cn } from "@/lib/utils"
import "@/components/layouts-tables/rootsLayoutsTablesScope.css"

const sk = workspaceTableNatureSkeletonTone

function CashRegisterDetailHeaderSkeleton({
  showTotals = true,
}: {
  showTotals?: boolean
}) {
  return (
    <article aria-hidden className={dataWorkspaceDetailCardClass}>
      <div className={dataWorkspaceDetailCardHeaderClass}>
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className={cn("size-10 shrink-0 rounded-xl", sk.box)} />
          <div className={cn("size-11 shrink-0 rounded-xl", sk.box)} />
          <div className="min-w-0 flex-1 space-y-2">
            <div className={cn("h-2.5 w-32", sk.pill)} />
            <div className={cn("h-7 w-36 max-w-full sm:w-44", sk.bar)} />
          </div>
        </div>
      </div>

      {showTotals ? (
        <div className={cn(dataWorkspaceDetailCardStatsClass, "sm:grid-cols-3")}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className={cn("h-2.5 w-24", sk.pill)} />
              <div className={cn("h-8 w-28", sk.bar)} />
            </div>
          ))}
        </div>
      ) : null}
    </article>
  )
}

function CashRegisterDetailClosedPanelSkeleton() {
  return (
    <article aria-hidden className={dataWorkspaceDetailFlushBottomCardClass}>
      <div className={dataWorkspaceDetailToolbarClass}>
        <div className={cn("h-8 w-44 rounded-md", sk.box)} />
        <div className={cn("h-3 w-28", sk.barSm)} />
      </div>

      <div
        className={cn(
          "overflow-hidden",
          "min-h-0 flex-1",
          workspaceLayoutsTablesScopeClass,
          workspaceTableLayoutListSurfaceClass,
          workspaceTableLayoutListBodyScopeClass,
        )}
      >
            <div
              className={cn(
                workspaceTableLayoutClassName,
                workspaceTableLayoutHeaderHeadClass,
                "grid grid-cols-5 gap-3 px-3",
              )}
            >
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className={cn("h-2.5 w-full max-w-16", sk.pill)} />
              ))}
            </div>
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="grid h-14 grid-cols-5 gap-3 border-b border-[var(--wt-border)] px-3 last:border-b-0"
              >
                <div className={cn("h-4 w-8", sk.barSm)} />
                <div className="space-y-1.5">
                  <div className={cn("h-4 w-full max-w-32", sk.barSm)} />
                  <div className={cn("h-3 w-full max-w-24", sk.barSm)} />
                </div>
                <div className="space-y-1.5">
                  <div className={cn("h-4 w-full max-w-28", sk.barSm)} />
                  <div className={cn("h-3 w-full max-w-20", sk.barSm)} />
                </div>
                <div className={cn("h-4 w-full max-w-20 justify-self-end", sk.barSm)} />
                <div className={cn("h-4 w-full max-w-16 justify-self-end", sk.barSm)} />
              </div>
            ))}
      </div>
    </article>
  )
}

export function CashRegisterDetailSkeleton({
  variant = "open",
}: {
  variant?: "open" | "closed"
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando arqueo de caja"
      className="flex min-h-full w-full flex-1 flex-col gap-6"
    >
      <CashRegisterDetailHeaderSkeleton showTotals={variant === "open"} />
      <CashRegisterDetailClosedPanelSkeleton />
      <span className="sr-only">Cargando arqueo…</span>
    </div>
  )
}

export function CashRegisterDetailContentSkeleton() {
  return <CashRegisterDetailClosedPanelSkeleton />
}
