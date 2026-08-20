"use client"

import {
  dataWorkspaceBlocksSkeletonTone,
  dataWorkspaceDetailCardClass,
  dataWorkspaceDetailCardHeaderClass,
  dataWorkspaceDetailCardStatsClass,
  dataWorkspaceDetailKpiStripTwoColClass,
  dataWorkspaceDetailToolbarClass,
  dataWorkspaceFlushBottomPanelBodyClass,
  dataWorkspaceFlushBottomPanelChromeClass,
  dataWorkspaceFlushBottomPanelClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import type { TreasuryAccountKind } from "@/lib/treasuryAccountKinds"
import { cn } from "@/lib/utils"

const sk = dataWorkspaceBlocksSkeletonTone

const ROW_WIDTHS = ["w-[68%]", "w-[54%]", "w-[62%]", "w-[48%]", "w-[58%]"] as const

export type TreasuryDetailSkeletonProfile = {
  layout: "movements" | "tabs"
  stats: "cash" | "mother"
  showIntegrationChips?: boolean
}

export function resolveTreasuryDetailSkeletonProfile(
  kind?: TreasuryAccountKind | null,
): TreasuryDetailSkeletonProfile {
  if (kind === "cash") {
    return { layout: "movements", stats: "cash", showIntegrationChips: false }
  }
  if (kind === "bank" || kind === "wallet") {
    return { layout: "movements", stats: "mother", showIntegrationChips: true }
  }
  if (kind) {
    return { layout: "tabs", stats: "mother", showIntegrationChips: false }
  }
  return { layout: "movements", stats: "mother", showIntegrationChips: false }
}

function TreasuryDetailBannerSkeleton({
  profile,
}: {
  profile: TreasuryDetailSkeletonProfile
}) {
  const isCash = profile.stats === "cash"

  return (
    <article aria-hidden className={dataWorkspaceDetailCardClass}>
      <div className={dataWorkspaceDetailCardHeaderClass}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className={cn("size-9 shrink-0 rounded-lg", sk.box)} />
            <div className={cn("size-11 shrink-0 rounded-xl", sk.box)} />
            <div className="min-w-0 flex-1 space-y-2">
              <div className={cn("h-2.5 w-16", sk.pill)} />
              <div className={cn("h-7 w-44 max-w-full sm:w-56", sk.bar)} />
            </div>
          </div>
          {profile.showIntegrationChips ? (
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="flex h-10 w-36 max-w-full items-center gap-2 rounded-lg border border-[var(--rootsy-bruma-200)] bg-white px-4"
                >
                  <div className={cn("size-4 shrink-0 rounded-sm", sk.box)} />
                  <div className={cn("h-3 w-20", sk.barSm)} />
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

function TreasuryMovementsToolbarSkeleton() {
  return (
    <div className={dataWorkspaceDetailToolbarClass}>
      <div className={cn("h-10 min-w-0 flex-1 rounded-lg", sk.box)} />
      <div className={cn("h-9 w-40 shrink-0 rounded-md", sk.box)} />
    </div>
  )
}

function TreasuryDashboardKpiStripSkeleton() {
  return (
    <div className={dataWorkspaceDetailKpiStripTwoColClass}>
      {Array.from({ length: 2 }).map((_, index) => (
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
      <ul className="divide-y divide-[var(--rootsy-bruma-200)]">
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

function TreasuryTabsToolbarSkeleton() {
  return (
    <div className={dataWorkspaceDetailToolbarClass}>
      <div className={cn("h-10 w-full rounded-lg lg:w-88", sk.box)} />
      <div className={cn("h-10 min-w-0 flex-1 rounded-lg lg:max-w-xs", sk.box)} />
    </div>
  )
}

function TreasuryMovementsPanelSkeleton() {
  return (
    <div aria-hidden className={dataWorkspaceFlushBottomPanelClass}>
      <div className={dataWorkspaceFlushBottomPanelChromeClass}>
        <TreasuryMovementsToolbarSkeleton />
        <TreasuryDashboardKpiStripSkeleton />
      </div>
      <div className={dataWorkspaceFlushBottomPanelBodyClass}>
        <TreasuryGroupedMovementsSkeleton />
      </div>
    </div>
  )
}

function TreasuryTabsPanelSkeleton() {
  return (
    <div aria-hidden className={cn(dataWorkspaceDetailCardClass, "overflow-hidden")}>
      <TreasuryTabsToolbarSkeleton />
      <TreasuryDashboardKpiStripSkeleton />
      <TreasuryGroupedMovementsSkeleton rows={4} />
    </div>
  )
}

export function TreasuryAccountDetailSkeleton({
  profile = resolveTreasuryDetailSkeletonProfile(),
}: {
  profile?: TreasuryDetailSkeletonProfile
}) {
  const flushBottom = profile.layout === "movements"

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
      <TreasuryDetailBannerSkeleton profile={profile} />
      {profile.layout === "movements" ? (
        <TreasuryMovementsPanelSkeleton />
      ) : (
        <TreasuryTabsPanelSkeleton />
      )}
      <span className="sr-only">Cargando cuenta…</span>
    </div>
  )
}

export function TreasuryAccountDetailContentSkeleton({
  chromeOnly = false,
  bodyOnly = false,
}: {
  /** @deprecated Usar profile en TreasuryAccountDetailSkeleton. */
  variant?: "default" | "cash"
  chromeOnly?: boolean
  bodyOnly?: boolean
  showToolbar?: boolean
}) {
  if (chromeOnly) {
    return <TreasuryDashboardKpiStripSkeleton />
  }

  if (bodyOnly) {
    return <TreasuryGroupedMovementsSkeleton />
  }

  return <TreasuryGroupedMovementsSkeleton rows={6} />
}
