"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useCartListScrollContainerRef } from "@/hooks/useCartListScrollHighlight"
import { cartListHeaderRowClass } from "@/components/sale-operation/saleOperationStyles"
import { Receipt } from "lucide-react"

type Props = {
  title: string
  subtitle?: ReactNode
  lineCount: number
  emptyTitle?: string
  children: ReactNode
  flush?: boolean
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
        "flex flex-1 flex-col items-center justify-center text-center",
        flush
          ? "min-h-[min(420px,50vh)] border-b border-slate-200/90 bg-white px-6 py-12"
          : "mt-6 px-4 py-12",
      )}
    >
      <div className="flex max-w-[260px] flex-col items-center gap-3">
        <div
          className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 ring-1 ring-slate-200/90"
          aria-hidden
        >
          <Receipt className="size-7 stroke-[1.75]" />
        </div>

        <p className="text-sm font-semibold text-slate-700">{emptyTitle}</p>
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
}: Props) {
  const scrollContainerRef = useCartListScrollContainerRef()

  return (
    <div
      ref={scrollContainerRef ?? undefined}
      className={cn(
        "game-scroll flex min-h-0 flex-1 flex-col overflow-y-auto",
        flush ? "space-y-0" : "space-y-2 p-3 sm:p-3.5",
      )}
      role="region"
      aria-label="Ítems agregados"
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-between gap-2",
          flush
            ? cn(cartListHeaderRowClass, "border-b border-slate-200/90 bg-white")
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
