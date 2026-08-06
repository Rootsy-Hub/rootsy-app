"use client"

import {
  dataWorkspaceDetailCardClass,
  dataWorkspaceDetailCardHeaderClass,
  dataWorkspaceDetailCardStatsClass,
  dataWorkspaceDetailKpiStripClass,
  dataWorkspaceDetailKpiStripTwoColClass,
  dataWorkspaceDetailPanelClass,
  dataWorkspaceDetailToolbarClass,
  dataWorkspaceFlushBottomPanelBodyClass,
  dataWorkspaceFlushBottomPanelChromeClass,
  dataWorkspaceFlushBottomPanelClass,
  workspaceTableNatureSkeletonTone,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
import { RootsSpinner } from "@/components/rootsy-spinner"

const sk = workspaceTableNatureSkeletonTone

const shellCard = dataWorkspaceDetailPanelClass

type SkeletonVariant = "default" | "cash"
type DashboardToolbarMode = "none" | "movements" | "tabs"

const ROW_WIDTHS = ["w-[68%]", "w-[54%]", "w-[62%]", "w-[48%]", "w-[58%]"] as const

function TreasuryDashboardKpiStripSkeleton({ columns = 2 }: { columns?: 2 | 3 }) {
  return (
    <div
      className={cn(
        columns === 2 && dataWorkspaceDetailKpiStripTwoColClass,
        columns === 3 && dataWorkspaceDetailKpiStripClass,
      )}
    >
      {Array.from({ length: columns }).map((_, index) => (
        <div key={index} className="px-4 py-4 lg:px-5">
          <div className={cn("h-2.5 w-28", sk.pill)} />
          <div className={cn("mt-1.5 h-8 w-32", sk.bar)} />
        </div>
      ))}
    </div>
  )
}

function TreasuryGroupedMovementsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div>
      <div className="px-4 pt-4 pb-1 lg:px-5">
        <div className={cn("h-4 w-10", sk.bar)} />
      </div>

      <div className="px-4 py-2 lg:px-5">
        <div className={cn("h-3.5 w-24", sk.barSm)} />
      </div>

      <ul className="divide-y divide-border/60">
        {Array.from({ length: rows }).map((_, index) => (
          <li
            key={index}
            className="flex items-start justify-between gap-4 px-4 py-3 lg:px-5"
          >
            <div
              className={cn(
                "h-4",
                sk.barSm,
                ROW_WIDTHS[index % ROW_WIDTHS.length],
              )}
            />
            <div className={cn("h-4 w-16 shrink-0", sk.barSm)} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function TreasuryResumenBodySkeleton({ variant = "default" }: { variant?: SkeletonVariant }) {
  const isCash = variant === "cash"

  if (isCash) {
    return <TreasuryGroupedMovementsSkeleton />
  }

  return (
    <>
      <div className="space-y-1.5 px-4 py-4 lg:px-5">
        <div className={cn("h-4 w-36", sk.barSm)} />
        <div className={cn("h-3 w-52", sk.pill)} />
      </div>
      <TreasuryGroupedMovementsSkeleton rows={4} />
    </>
  )
}

function TreasuryAccountDetailBannerSkeleton({
  variant = "default",
}: {
  variant?: SkeletonVariant
}) {
  const isCash = variant === "cash"

  return (
    <article aria-hidden className={dataWorkspaceDetailCardClass}>
      <div className={dataWorkspaceDetailCardHeaderClass}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className={cn("size-9 shrink-0 rounded-md", sk.box)} />
            <div className={cn("size-11 shrink-0 rounded-xl", sk.box)} />
            <div className="min-w-0 flex-1 space-y-2">
              <div className={cn("h-2.5 w-20", sk.pill)} />
              <div className={cn("h-7 w-40 max-w-full sm:w-52", sk.bar)} />
            </div>
          </div>
          {!isCash ? (
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="flex h-14 w-44 max-w-full items-center gap-3 rounded-xl border border-border/60 bg-white px-4 py-2.5 shadow-xs"
                >
                  <div
                    className={cn(
                      "size-9 shrink-0 rounded-lg ring-1 ring-border/60",
                      sk.box,
                    )}
                  />
                  <div className="min-w-0 flex-1 space-y-1.5 pr-0.5">
                    <div className={cn("h-2 w-16", sk.pill)} />
                    <div className={cn("h-3.5 w-24", sk.barSm)} />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className={dataWorkspaceDetailCardStatsClass}>
        <div className="space-y-2 lg:min-w-36">
          <div className={cn("h-2.5 w-16", sk.pill)} />
          <div className={cn("h-8 w-32", sk.bar)} />
        </div>
        {!isCash ? (
          <>
            <div className="space-y-2 lg:min-w-28">
              <div className={cn("h-2.5 w-14", sk.pill)} />
              <div className={cn("h-6 w-24", sk.bar)} />
            </div>
            <div className="space-y-2 lg:min-w-28">
              <div className={cn("h-2.5 w-12", sk.pill)} />
              <div className={cn("h-6 w-20", sk.bar)} />
            </div>
          </>
        ) : null}
      </div>
    </article>
  )
}

function TreasuryAccountDetailDashboardSkeleton({
  variant = "default",
  toolbarMode = "none",
  flushBottom = false,
}: {
  variant?: SkeletonVariant
  toolbarMode?: DashboardToolbarMode
  flushBottom?: boolean
}) {
  const toolbarSkeleton =
    toolbarMode === "movements" ? (
      <div className={dataWorkspaceDetailToolbarClass}>
        <div className={cn("h-9 w-36 shrink-0 rounded-md", sk.box)} />
        <div className={cn("h-9 w-40 shrink-0 rounded-md", sk.box)} />
      </div>
    ) : toolbarMode === "tabs" ? (
      <div className={dataWorkspaceDetailToolbarClass}>
        <div className={cn("h-10 w-full rounded-lg lg:w-88", sk.box)} />
        <div className={cn("h-9 w-36 shrink-0 rounded-md", sk.box)} />
      </div>
    ) : null

  if (flushBottom) {
    return (
      <div aria-hidden className={dataWorkspaceFlushBottomPanelClass}>
        <div className={dataWorkspaceFlushBottomPanelChromeClass}>
          {toolbarSkeleton}
          <TreasuryDashboardKpiStripSkeleton columns={2} />
        </div>
        <div className={dataWorkspaceFlushBottomPanelBodyClass}>
          <TreasuryResumenBodySkeleton variant={variant} />
        </div>
      </div>
    )
  }

  return (
    <div aria-hidden className={shellCard}>
      {toolbarSkeleton}
      <TreasuryDashboardKpiStripSkeleton columns={2} />
      <TreasuryResumenBodySkeleton variant={variant} />
    </div>
  )
}

export function TreasuryAccountDetailSkeleton({
  variant = "default",
}: {
  variant?: SkeletonVariant
}) {
  const toolbarMode: DashboardToolbarMode =
    variant === "cash" ? "movements" : "tabs"
  const flushBottom = variant === "cash"

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando cuenta"
      className={cn(
        "flex w-full flex-col",
        flushBottom ? "min-h-full flex-1 gap-6" : "gap-6",
      )}
    >
      <TreasuryAccountDetailBannerSkeleton variant={variant} />
      <TreasuryAccountDetailDashboardSkeleton
        variant={variant}
        toolbarMode={toolbarMode}
        flushBottom={flushBottom}
      />
      <span className="sr-only">Cargando cuenta…</span>
    </div>
  )
}

export function TreasuryAccountDetailContentSkeleton({
  variant = "default",
  chromeOnly = false,
  bodyOnly = false,
}: {
  variant?: SkeletonVariant
  chromeOnly?: boolean
  bodyOnly?: boolean
  /** @deprecated El toolbar real lo renderiza el padre. */
  showToolbar?: boolean
}) {
  if (chromeOnly) {
    return <TreasuryDashboardKpiStripSkeleton columns={2} />
  }

  if (bodyOnly) {
    return <TreasuryResumenBodySkeleton variant={variant} />
  }

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando actividad"
      className="flex min-h-48 items-center justify-center px-4 py-10"
    >
      <RootsSpinner size="default" />
      <span className="sr-only">Cargando…</span>
    </div>
  )
}
