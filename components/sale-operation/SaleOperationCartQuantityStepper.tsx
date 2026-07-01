"use client"

import { cn } from "@/lib/utils"
import { Minus, Plus } from "lucide-react"

type Props = {
  nombre: string
  cantidad: number
  onDecrease: () => void
  onIncrease: () => void
  className?: string
}

export function SaleOperationCartQuantityStepper({
  nombre,
  cantidad,
  onDecrease,
  onIncrease,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-lg bg-slate-50 px-1 py-1 ring-1 ring-slate-200/90",
        className,
      )}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      role="group"
      aria-label={`Cantidad de ${nombre}`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onDecrease()
        }}
        aria-label={`Quitar una unidad de ${nombre}`}
        className="inline-flex size-6 items-center justify-center rounded-md bg-white text-slate-600 shadow-sm ring-1 ring-slate-200/80 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60"
      >
        <Minus className="size-3" aria-hidden />
      </button>
      <span className="min-w-5 text-center text-sm font-bold tabular-nums text-slate-900">
        {cantidad}
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onIncrease()
        }}
        aria-label={`Agregar una unidad de ${nombre}`}
        className="inline-flex size-6 items-center justify-center rounded-md bg-white text-slate-600 shadow-sm ring-1 ring-slate-200/80 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60"
      >
        <Plus className="size-3" aria-hidden />
      </button>
    </div>
  )
}
