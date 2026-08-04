"use client"

import { cn } from "@/lib/utils"
import {
  dataWorkspaceEntityCardBodyClass,
  dataWorkspaceEntityCardFooterClass,
  dataWorkspaceEntityCardHeaderClass,
  dataWorkspaceEntityCardSkeletonShellClass,
  dataWorkspaceEntityCardsGridClass,
  workspaceTableNatureSkeletonTone,
} from "@/components/data-workspace/dataWorkspaceListStyles"

const NAME_WIDTHS = ["w-24", "w-32", "w-28", "w-20"] as const
const BALANCE_WIDTHS = ["w-36", "w-32", "w-40", "w-28"] as const

const sk = workspaceTableNatureSkeletonTone

function CashRegisterCardSkeleton({ index }: { index: number }) {
  const nameWidth = NAME_WIDTHS[index % NAME_WIDTHS.length]
  const balanceWidth = BALANCE_WIDTHS[index % BALANCE_WIDTHS.length]

  return (
    <article aria-hidden className={dataWorkspaceEntityCardSkeletonShellClass}>
      <div
        className={cn("absolute right-3 top-3 z-10 size-8 rounded-lg", sk.box)}
      />

      <div className="flex h-full min-h-0 flex-1 flex-col">
        <div className={dataWorkspaceEntityCardHeaderClass}>
          <div className="flex items-start gap-3">
            <div className={cn("size-11 shrink-0 rounded-xl", sk.box)} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className={cn("h-2.5 w-[5.5rem]", sk.pill)} />
                <div className={cn("h-6 w-14 rounded-full", sk.pill)} />
              </div>
              <div className={cn("mt-1 h-5", sk.bar, nameWidth)} />
              <div className={cn("mt-0.5 h-3 w-28", sk.barSm)} />
            </div>
          </div>
        </div>

        <div className={dataWorkspaceEntityCardBodyClass}>
          <div>
            <div className={cn("h-2.5 w-24", sk.pill)} />
            <div className={cn("mt-1.5 h-8", sk.bar, balanceWidth)} />
          </div>
        </div>

        <div className={cn("flex min-h-[4.75rem] items-center justify-between gap-3 px-4 py-4", dataWorkspaceEntityCardFooterClass)}>
          <div className={cn("h-3 w-28", sk.barSm)} />
          <div className={cn("h-8 w-24 rounded-md", sk.box)} />
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
