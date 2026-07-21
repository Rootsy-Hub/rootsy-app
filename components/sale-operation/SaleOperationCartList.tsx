"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  subtitle?: ReactNode
  lineCount: number
  emptyTitle?: string
  emptyDescription?: string
  children: ReactNode
  flush?: boolean
}

export function SaleOperationCartList({
  title,
  subtitle,
  lineCount,
  emptyTitle = "Pedido vacío",
  emptyDescription = "Agregá productos desde el catálogo.",
  children,
  flush = false,
}: Props) {
  return (
    <div
      className={cn(
        "game-scroll min-h-0 flex-1 overflow-y-auto",
        flush ? "space-y-0" : "space-y-2 p-3 sm:p-3.5",
      )}
      role="region"
      aria-label="Ítems agregados"
    >
      <div
        className={cn(
          "flex items-baseline justify-between gap-2",
          flush
            ? "border-b border-slate-200/90 bg-white px-3 py-2"
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
        <div
          className={cn(
            "text-center",
            flush ? "px-4 py-12" : "mt-8 rounded-xl border border-dashed border-slate-200 bg-white/60 px-4 py-10",
          )}
        >
          <p className="text-sm font-medium text-slate-600">{emptyTitle}</p>
          <p className="mt-1 text-xs text-slate-400">{emptyDescription}</p>
        </div>
      ) : (
        children
      )}
    </div>
  )
}
