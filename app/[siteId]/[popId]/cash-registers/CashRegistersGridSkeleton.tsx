"use client"

import { cn } from "@/lib/utils"
import { dataWorkspaceEntityCardsGridClass } from "@/components/data-workspace/dataWorkspaceListStyles"

const NAME_WIDTHS = ["w-24", "w-32", "w-28", "w-20"] as const
const BALANCE_WIDTHS = ["w-36", "w-32", "w-40", "w-28"] as const

const sk = {
  bar: "animate-pulse rounded-[3px] bg-muted-foreground/12",
  barSm: "animate-pulse rounded-[3px] bg-muted-foreground/8",
  pill: "animate-pulse rounded-full bg-muted-foreground/12",
  box: "animate-pulse rounded-md bg-muted-foreground/10",
  isotype: "animate-pulse rounded-xl bg-muted-foreground/12",
} as const

function CashRegisterCardSkeleton({ index }: { index: number }) {
  const nameWidth = NAME_WIDTHS[index % NAME_WIDTHS.length]
  const balanceWidth = BALANCE_WIDTHS[index % BALANCE_WIDTHS.length]
  const showOpenAction = index % 4 === 1

  return (
    <article
      aria-hidden
      className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
    >
      <div
        className={cn("absolute right-3 top-3 z-10 size-8 rounded-lg", sk.box)}
      />

      <div className="border-b border-border/60 px-4 py-4 pr-11">
        <div className="flex items-start gap-3">
          <div className={cn("size-11 shrink-0", sk.isotype)} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className={cn("h-2.5 w-[5.5rem]", sk.pill)} />
              <div className={cn("h-6 w-14 rounded-full", sk.pill)} />
            </div>
            <div className={cn("mt-1 h-5", sk.bar, nameWidth)} />
            <div
              className={cn(
                "mt-0.5 h-3",
                sk.barSm,
                showOpenAction ? "w-28" : "w-0 opacity-0",
              )}
            />
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col bg-muted/20 px-4 py-4">
        <div>
          <div className={cn("h-2.5 w-24", sk.pill)} />
          <div className={cn("mt-1.5 h-8", sk.bar, balanceWidth)} />
        </div>
        <div className="mt-auto min-h-[4.75rem] border-t border-border/40 pt-4">
          {showOpenAction ? (
            <div>
              <div className={cn("h-2.5 w-28", sk.pill)} />
              <div className={cn("mt-1 h-6 w-24", sk.bar)} />
            </div>
          ) : (
            <div className="flex min-h-[3.25rem] items-center justify-between gap-3">
              <div className={cn("h-3 w-28", sk.barSm)} />
              <div className={cn("h-8 w-24 rounded-md", sk.box)} />
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

export function CashRegistersGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando cajas"
      className={dataWorkspaceEntityCardsGridClass}
    >
      {Array.from({ length: count }, (_, index) => (
        <CashRegisterCardSkeleton key={index} index={index} />
      ))}
      <span className="sr-only">Cargando cajas…</span>
    </div>
  )
}
