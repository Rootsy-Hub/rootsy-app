"use client"

import {
  dataWorkspaceDetailCardClass,
  dataWorkspaceDetailCardHeaderClass,
  dataWorkspaceDetailCardStatsClass,
  dataWorkspaceDetailToolbarClass,
  workspaceTableNatureSkeletonTone,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"

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
          <div className={cn("size-9 shrink-0 rounded-md", sk.box)} />
          <div className={cn("size-11 shrink-0 rounded-xl", sk.box)} />
          <div className="min-w-0 flex-1 space-y-2">
            <div className={cn("h-2.5 w-32", sk.pill)} />
            <div className={cn("h-7 w-36 max-w-full sm:w-44", sk.bar)} />
          </div>
        </div>
      </div>

      {showTotals ? (
        <div className={cn(dataWorkspaceDetailCardStatsClass, "sm:grid-cols-2 lg:grid-cols-4")}>
          {Array.from({ length: 4 }).map((_, index) => (
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
    <article aria-hidden className={dataWorkspaceDetailCardClass}>
      <div className={dataWorkspaceDetailToolbarClass}>
        <div className={cn("h-8 w-44 rounded-md", sk.box)} />
        <div className={cn("h-3 w-28", sk.barSm)} />
      </div>

      <div className="overflow-hidden">
        <div className="border-b border-[color:var(--wt-border)] bg-white px-4 py-2.5 lg:px-5">
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className={cn("h-2.5 w-full max-w-16", sk.pill)} />
            ))}
          </div>
        </div>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-5 gap-3 border-b border-[color:var(--wt-border)] px-4 py-3 last:border-b-0 lg:px-5"
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
      className="flex w-full flex-col gap-6"
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
