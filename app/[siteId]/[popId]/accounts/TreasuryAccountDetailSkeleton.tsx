"use client"

import { dataWorkspaceShellCard } from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"

const sk = {
  bar: "animate-pulse rounded-[3px] bg-muted-foreground/12",
  barSm: "animate-pulse rounded-[3px] bg-muted-foreground/8",
  pill: "animate-pulse rounded-full bg-muted-foreground/12",
  box: "animate-pulse rounded-md bg-muted-foreground/10",
  isotype: "animate-pulse rounded-xl bg-muted-foreground/12",
} as const

const shellCard = dataWorkspaceShellCard

type SkeletonVariant = "default" | "cash"

function TreasuryAccountDetailBannerSkeleton({
  variant = "default",
}: {
  variant?: SkeletonVariant
}) {
  const isCash = variant === "cash"

  return (
    <article
      aria-hidden
      className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
    >
      <div className="bg-linear-to-r from-muted/70 via-muted/50 to-muted/30 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className={cn("size-9 shrink-0 rounded-md", sk.box)} />
            <div className={cn("size-11 shrink-0", sk.isotype)} />
            <div className="min-w-0 flex-1 space-y-2.5">
              <div className={cn("h-2.5 w-20", sk.pill)} />
              <div className={cn("h-7 w-40 max-w-full sm:w-52", sk.bar)} />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-x-6 gap-y-4 border-t border-border/40 pt-4 sm:gap-x-8 lg:border-t-0 lg:pt-0">
            <div className="space-y-2">
              <div className={cn("h-2.5 w-16", sk.pill)} />
              <div className={cn("h-8 w-32", sk.bar)} />
            </div>
            {!isCash ? (
              <>
                <div className="space-y-2">
                  <div className={cn("h-2.5 w-14", sk.pill)} />
                  <div className={cn("h-6 w-24", sk.bar)} />
                </div>
                <div className="space-y-2">
                  <div className={cn("h-2.5 w-12", sk.pill)} />
                  <div className={cn("h-6 w-20", sk.bar)} />
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {!isCash ? (
        <div className="border-t border-border/60 bg-background px-4 py-4 sm:px-6 lg:px-8">
          <div className={cn("mb-3 h-2.5 w-36", sk.pill)} />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/15 px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("size-8 shrink-0 rounded-lg", sk.box)} />
                  <div className="space-y-1.5">
                    <div className={cn("h-2 w-16", sk.pill)} />
                    <div className={cn("h-4 w-24", sk.barSm)} />
                  </div>
                </div>
                <div className={cn("h-5 w-20", sk.bar)} />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  )
}

function TreasuryAccountDetailDashboardSkeleton({
  variant = "default",
  showToolbar = true,
}: {
  variant?: SkeletonVariant
  showToolbar?: boolean
}) {
  const isCash = variant === "cash"

  return (
    <div aria-hidden className={cn(shellCard, "overflow-hidden")}>
      {showToolbar ? (
        <div className="flex flex-col gap-3 border-b border-border/60 bg-muted/15 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-5">
          {isCash ? (
            <>
              <div className={cn("h-8 w-full max-w-xs rounded-md", sk.box)} />
              <div className={cn("h-9 w-36 shrink-0 rounded-md", sk.box)} />
            </>
          ) : (
            <>
              <div className={cn("h-10 w-full rounded-lg lg:w-88", sk.box)} />
              <div className={cn("h-8 w-full max-w-xs rounded-md", sk.box)} />
            </>
          )}
        </div>
      ) : null}

      <div className="grid divide-y divide-border/60 border-b border-border/60 bg-muted/5 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2 px-4 py-4 lg:px-5">
            <div className={cn("h-2.5 w-24", sk.pill)} />
            <div className={cn("h-8 w-28", sk.bar)} />
            {i === 2 ? <div className={cn("h-3 w-32", sk.barSm)} /> : null}
          </div>
        ))}
      </div>

      {isCash ? (
        <div className="divide-y divide-border/50">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,1.2fr)_5.5rem] items-center gap-3 px-4 py-3 lg:px-5"
            >
              <div className={cn("h-3 w-14", sk.pill)} />
              <div className={cn("h-4 w-24", sk.barSm)} />
              <div
                className={cn(
                  "h-4",
                  sk.barSm,
                  i % 2 === 0 ? "w-[72%]" : "w-[58%]",
                )}
              />
              <div className={cn("h-4 w-16 justify-self-end", sk.bar)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3 px-4 py-4 lg:px-5">
          <div className="space-y-1.5">
            <div className={cn("h-4 w-36", sk.barSm)} />
            <div className={cn("h-3 w-52", sk.pill)} />
          </div>
          <div className="overflow-hidden rounded-lg border border-border/60">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 border-b border-border/50 px-3 py-3 last:border-0"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div
                    className={cn(
                      "h-4",
                      sk.barSm,
                      i % 2 === 0 ? "w-[68%]" : "w-[54%]",
                    )}
                  />
                  <div className={cn("h-3 w-40", sk.pill)} />
                </div>
                <div className={cn("h-4 w-20 shrink-0", sk.bar)} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function TreasuryAccountDetailSkeleton({
  variant = "default",
}: {
  variant?: SkeletonVariant
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando cuenta"
      className="flex w-full flex-col gap-6"
    >
      <TreasuryAccountDetailBannerSkeleton variant={variant} />
      <TreasuryAccountDetailDashboardSkeleton variant={variant} />
      <span className="sr-only">Cargando cuenta…</span>
    </div>
  )
}

export function TreasuryAccountDetailContentSkeleton({
  variant = "default",
  showToolbar = false,
}: {
  variant?: SkeletonVariant
  showToolbar?: boolean
}) {
  return (
    <div role="status" aria-busy="true" aria-label="Cargando actividad">
      <TreasuryAccountDetailDashboardSkeleton
        variant={variant}
        showToolbar={showToolbar}
      />
      <span className="sr-only">Cargando actividad…</span>
    </div>
  )
}
