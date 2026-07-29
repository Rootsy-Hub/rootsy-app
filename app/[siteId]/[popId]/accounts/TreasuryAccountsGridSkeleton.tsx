"use client"

import { cn } from "@/lib/utils"

const NAME_WIDTHS = ["w-28", "w-36", "w-32", "w-24"] as const
const BALANCE_WIDTHS = ["w-36", "w-32", "w-40", "w-28"] as const

const treasurySk = {
  bar: "animate-pulse rounded-[3px] bg-muted-foreground/12",
  barSm: "animate-pulse rounded-[3px] bg-muted-foreground/8",
  pill: "animate-pulse rounded-full bg-muted-foreground/12",
  box: "animate-pulse rounded-md bg-muted-foreground/10",
  isotype: "animate-pulse rounded-xl bg-muted-foreground/12",
} as const

function TreasuryAccountCardSkeleton({ index }: { index: number }) {
  const nameWidth = NAME_WIDTHS[index % NAME_WIDTHS.length]
  const balanceWidth = BALANCE_WIDTHS[index % BALANCE_WIDTHS.length]

  return (
    <article
      aria-hidden
      className="relative overflow-hidden rounded-2xl border border-border/60 bg-card"
    >
      <div className={cn("absolute right-2 top-2 z-10 size-8", treasurySk.box)} />

      <div className="bg-linear-to-br from-muted/70 via-muted/50 to-muted/30 px-4 pb-6 pt-4">
        <div className="pr-8">
          <div className={cn("h-2.5 w-[4.5rem]", treasurySk.pill)} />
          <div className="mt-2.5 flex items-center gap-3">
            <div className={cn("size-11 shrink-0", treasurySk.isotype)} />
            <div className={cn("h-6", treasurySk.bar, nameWidth)} />
          </div>
        </div>
      </div>

      <div className="-mt-4 px-4 pb-4">
        <div className="rounded-xl border border-border/60 bg-background px-4 py-3 shadow-sm">
          <div>
            <div className={cn("h-2.5 w-16", treasurySk.pill)} />
            <div className={cn("mt-2 h-9", treasurySk.bar, balanceWidth)} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border/60 pt-4">
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
      className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: count }, (_, index) => (
        <TreasuryAccountCardSkeleton key={index} index={index} />
      ))}
      <span className="sr-only">Cargando cuentas…</span>
    </div>
  )
}
