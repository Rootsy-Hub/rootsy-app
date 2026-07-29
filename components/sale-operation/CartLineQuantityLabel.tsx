"use client"

export function formatCartLineQuantity(n: number): string {
  const rounded = Math.round(n * 1e6) / 1e6
  if (Number.isInteger(rounded)) return String(rounded)
  return rounded.toLocaleString("es-AR", { maximumFractionDigits: 6 })
}

export const cartLineRowGridClass =
  "grid w-full grid-cols-[minmax(0,2.25rem)_minmax(0,1fr)_auto] items-start gap-x-2 px-3 py-2.5 text-left"

export const cartLineRowGridNoPriceClass =
  "grid w-full grid-cols-[minmax(0,2.25rem)_minmax(0,1fr)] items-start gap-x-2 px-3 py-2.5 text-left"

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
