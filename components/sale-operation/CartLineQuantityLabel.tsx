"use client"

import { cn } from "@/lib/utils"

export function formatCartLineQuantity(n: number): string {
  const rounded = Math.round(n * 1e6) / 1e6
  if (Number.isInteger(rounded)) return String(rounded)
  return rounded.toLocaleString("es-AR", { maximumFractionDigits: 6 })
}

export const cartLineRowGridColumnsClass =
  "grid w-full grid-cols-[minmax(0,2.25rem)_minmax(0,1fr)_auto] items-start gap-x-2 text-left"

export const cartLineRowGridClass = cn(
  cartLineRowGridColumnsClass,
  "px-3 py-2.5",
)

/** Cantidad inline con el nombre (ticket readonly en modal) */
export const cartLineRowGridCompactClass = cn(
  "grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-x-2 text-left",
  "px-3 py-2.5",
)

export const cartLineRowGridNoPriceClass = cn(
  "grid w-full grid-cols-[minmax(0,2.25rem)_minmax(0,1fr)] items-start gap-x-2 text-left",
  "px-3 py-2.5",
)

type Props = {
  cantidad: number
  className?: string
}

export function CartLineQuantityLabel({ cantidad, className }: Props) {
  const label = formatCartLineQuantity(cantidad)

  return (
    <span
      className={className ?? "block min-w-0 truncate pt-0.5 text-sm font-bold tabular-nums text-slate-900"}
      title={label}
    >
      {label}
    </span>
  )
}
