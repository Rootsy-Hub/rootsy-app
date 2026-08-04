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

const NAME_WIDTHS = ["w-28", "w-36", "w-32", "w-24"] as const
const BALANCE_WIDTHS = ["w-36", "w-32", "w-40", "w-28"] as const

const sk = workspaceTableNatureSkeletonTone

function TreasuryAccountCardSkeleton({ index }: { index: number }) {
  const nameWidth = NAME_WIDTHS[index % NAME_WIDTHS.length]
  const balanceWidth = BALANCE_WIDTHS[index % BALANCE_WIDTHS.length]

  return (
    <article aria-hidden className={dataWorkspaceEntityCardSkeletonShellClass}>
      <div className={cn("absolute right-3 top-3 z-10 size-8 rounded-lg", sk.box)} />

      <div className="flex h-full min-h-0 flex-1 flex-col">
        <div className={dataWorkspaceEntityCardHeaderClass}>
          <div className="flex flex-col gap-2.5">
            <div className="flex min-w-0 items-center gap-3">
              <div className={cn("size-11 shrink-0 rounded-xl", sk.box)} />
              <div className="min-w-0 flex-1 space-y-2">
                <div className={cn("h-2.5 w-[4.5rem]", sk.pill)} />
                <div className={cn("h-6", sk.bar, nameWidth)} />
              </div>
            </div>
            <div className="min-h-7" aria-hidden />
          </div>
        </div>

        <div className={dataWorkspaceEntityCardBodyClass}>
          <div>
            <div className={cn("h-2.5 w-16", sk.pill)} />
            <div className={cn("mt-1.5 h-8", sk.bar, balanceWidth)} />
          </div>
        </div>

        <div className={cn("min-h-[4.75rem] px-4 py-4", dataWorkspaceEntityCardFooterClass)}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={cn("h-2.5 w-14", sk.pill)} />
              <div className={cn("mt-1 h-6 w-24", sk.bar)} />
            </div>
            <div>
              <div className={cn("h-2.5 w-12", sk.pill)} />
              <div className={cn("mt-1 h-6 w-20", sk.bar)} />
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
