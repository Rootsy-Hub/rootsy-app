"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useCartListScrollContainerRef } from "@/hooks/useCartListScrollHighlight"
import {
  cartListHeaderRowClass,
  saleOpCartLineDividerBottomClass,
  saleOpCartListSurfaceClass,
  saleOpEmptyStateContainerClass,
  saleOpEmptyStateContentClass,
  saleOpEmptyStateIconWrapClass,
  saleOpEmptyStateTitleClass,
} from "@/components/sale-operation/saleOperationStyles"
import { Receipt } from "lucide-react"

type Props = {
  title: string
  subtitle?: ReactNode
  lineCount: number
  emptyTitle?: string
  children: ReactNode
  flush?: boolean
  /** false = altura natural (p. ej. ticket readonly en modal) */
  fillHeight?: boolean
}

function CartListEmptyState({
  emptyTitle,
  flush,
}: {
  emptyTitle: string
  flush: boolean
}) {
  return (
    <div
      className={cn(
        saleOpEmptyStateContainerClass,
        flush
          ? cn("min-h-[min(420px,50vh)]", saleOpCartListSurfaceClass)
          : "mt-6 px-4",
      )}
    >
      <div className={saleOpEmptyStateContentClass}>
        <div className={saleOpEmptyStateIconWrapClass} aria-hidden>
          <Receipt className="size-7 stroke-[1.75]" />
        </div>

        <p className={saleOpEmptyStateTitleClass}>{emptyTitle}</p>
      </div>
    </div>
  )
}

export function SaleOperationCartList({
  title,
  subtitle,
  lineCount,
  emptyTitle = "Pedido vacío",
  children,
  flush = false,
  fillHeight = true,
}: Props) {
  const scrollContainerRef = useCartListScrollContainerRef()

  return (
    <div
      ref={scrollContainerRef ?? undefined}
      className={cn(
        "game-scroll flex flex-col",
        fillHeight && "min-h-0 flex-1 overflow-y-auto",
        flush ? cn("space-y-0", saleOpCartListSurfaceClass) : "space-y-2 p-3 sm:p-3.5",
      )}
      role="region"
      aria-label="Ítems agregados"
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-between gap-2",
          flush
            ? cn(
                cartListHeaderRowClass,
                saleOpCartLineDividerBottomClass,
                saleOpCartListSurfaceClass,
              )
            : "mb-1 px-0.5",
        )}
      >
        <div className="min-w-0">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 truncate text-xs font-medium text-slate-600">
              {subtitle}
            </p>
          ) : null}
        </div>
        <span className="shrink-0 text-[11px] font-medium tabular-nums text-slate-400">
          {lineCount} {lineCount === 1 ? "línea" : "líneas"}
        </span>
      </div>

      {lineCount === 0 ? (
        <CartListEmptyState emptyTitle={emptyTitle} flush={flush} />
      ) : (
        children
      )}
    </div>
  )
}
