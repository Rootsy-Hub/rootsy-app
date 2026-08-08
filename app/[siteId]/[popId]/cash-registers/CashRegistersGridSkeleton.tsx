"use client"

import { cn } from "@/lib/utils"
import {
  dataWorkspaceBlocksSkeletonTone,
  dataWorkspaceEntityCardActionFooterClass,
  dataWorkspaceEntityCardHeaderClass,
  dataWorkspaceEntityCardLosetaSurfaceClass,
  dataWorkspaceEntityCardSaldoSectionClass,
  dataWorkspaceEntityCardsGridClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"

const NAME_WIDTHS = ["w-24", "w-32", "w-28", "w-20"] as const
const BALANCE_WIDTHS = ["w-36", "w-32", "w-40", "w-28"] as const

const sk = dataWorkspaceBlocksSkeletonTone

function CashRegisterCardSkeleton({ index }: { index: number }) {
  const nameWidth = NAME_WIDTHS[index % NAME_WIDTHS.length]
  const balanceWidth = BALANCE_WIDTHS[index % BALANCE_WIDTHS.length]

  return (
    <article aria-hidden className={cn("relative", dataWorkspaceEntityCardLosetaSurfaceClass)}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className={cn(dataWorkspaceEntityCardHeaderClass, "pr-4")}>
          <div className="flex min-w-0 items-start gap-3">
            <div className={cn("size-11 shrink-0 rounded-xl", sk.box)} />
            <div className="relative min-w-0 flex-1 space-y-2">
              <div className={cn("h-2.5 w-[5.5rem]", sk.pill)} />
              <div className={cn("h-6", sk.bar, nameWidth)} />
              <div className={cn("h-3 w-28", sk.barSm)} />
            </div>
            <div className={cn("-mr-1 size-8 shrink-0 rounded-lg", sk.box)} />
          </div>
        </div>

        <div className={dataWorkspaceEntityCardSaldoSectionClass}>
          <div className={cn("h-2.5 w-24", sk.pill)} />
          <div className={cn("mt-1.5 h-8", sk.bar, balanceWidth)} />
        </div>

        <div className={dataWorkspaceEntityCardActionFooterClass}>
          <div>
            <div className={cn("h-2.5 w-20", sk.pill)} />
            <div className={cn("mt-1 h-6 w-24", sk.bar)} />
          </div>
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
