"use client"

import { cn } from "@/lib/utils"
import { dataWorkspaceEntityCardsGridClass } from "@/components/data-workspace/dataWorkspaceListStyles"

const NAME_WIDTHS = ["w-28", "w-36", "w-32", "w-24"] as const
const BALANCE_WIDTHS = ["w-36", "w-32", "w-40", "w-28"] as const

const treasurySk = {
  bar: "animate-pulse rounded-[3px] bg-muted-foreground/12",
  barSm: "animate-pulse rounded-[3px] bg-muted-foreground/8",
  pill: "animate-pulse rounded-full bg-muted-foreground/12",
  box: "animate-pulse rounded-md bg-muted-foreground/10",
  isotype: "animate-pulse rounded-xl bg-muted-foreground/12",
} as const

function TreasuryIntegrationBadgesSkeleton({ index }: { index: number }) {
  const badgeCount = index % 3

  if (badgeCount === 0) {
    return <div className="min-h-7" aria-hidden />
  }

  return (
    <div className="flex min-h-7 flex-wrap items-center gap-1.5" aria-hidden>
      {badgeCount >= 1 ? (
        <div className={cn("h-[26px] w-[3.25rem] rounded-lg", treasurySk.box)} />
      ) : null}
      {badgeCount >= 2 ? (
        <div className={cn("h-[26px] w-[4rem] rounded-lg", treasurySk.box)} />
      ) : null}
    </div>
  )
}

function TreasuryAccountCardSkeleton({ index }: { index: number }) {
  const nameWidth = NAME_WIDTHS[index % NAME_WIDTHS.length]
  const balanceWidth = BALANCE_WIDTHS[index % BALANCE_WIDTHS.length]

  return (
    <article
      aria-hidden
      className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
    >
      <div
        className={cn(
          "absolute right-3 top-3 z-10 size-8 rounded-lg",
          treasurySk.box,
        )}
      />

      <div className="border-b border-border/60 px-4 py-4 pr-11">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3">
            <div className={cn("size-11 shrink-0", treasurySk.isotype)} />
            <div className="min-w-0 flex-1 space-y-2">
              <div className={cn("h-2.5 w-[4.5rem]", treasurySk.pill)} />
              <div className={cn("h-6", treasurySk.bar, nameWidth)} />
            </div>
          </div>
          <TreasuryIntegrationBadgesSkeleton index={index} />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col bg-muted/20 px-4 py-4">
        <div>
          <div className={cn("h-2.5 w-16", treasurySk.pill)} />
          <div className={cn("mt-1.5 h-8", treasurySk.bar, balanceWidth)} />
        </div>
        <div className="mt-auto min-h-[4.75rem] border-t border-border/40 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={cn("h-2.5 w-14", treasurySk.pill)} />
              <div className={cn("mt-1 h-6 w-24", treasurySk.bar)} />
            </div>
            <div>
              <div className={cn("h-2.5 w-12", treasurySk.pill)} />
              <div className={cn("mt-1 h-6 w-20", treasurySk.bar)} />
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export function TreasuryAccountsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando cuentas"
      className={dataWorkspaceEntityCardsGridClass}
    >
      {Array.from({ length: count }, (_, index) => (
        <TreasuryAccountCardSkeleton key={index} index={index} />
      ))}
      <span className="sr-only">Cargando cuentas…</span>
    </div>
  )
}
