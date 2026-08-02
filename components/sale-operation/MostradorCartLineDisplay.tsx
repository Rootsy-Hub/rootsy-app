"use client"

import {
  CartLineQuantityLabel,
  cartLineRowGridClass,
  cartLineRowGridCompactClass,
  formatCartLineQuantity,
} from "@/components/sale-operation/CartLineQuantityLabel"
import {
  saleOpFmt,
  saleOpImporteCartClass,
} from "@/components/sale-operation/saleOperationStyles"
import {
  productDescriptionForMostradorRow,
  type MostradorCartDisplayRow,
} from "@/lib/mostradorCartDisplay"
import { cn } from "@/lib/utils"
import { CheckCircle2, MessageSquare } from "lucide-react"
import type { ReactNode } from "react"

type Pricing = {
  precioBase: number
  precioFinal: number
}

type Props = {
  row: MostradorCartDisplayRow
  pricing: Pricing
  paymentBadge?: ReactNode
  rowClassName?: string
  /** Cantidad en la misma columna que el nombre (sin columna dedicada) */
  inlineQuantity?: boolean
  /** En readonly: no mostrar "—" cuando el precio va en el banner del grupo */
  omitHiddenPricePlaceholder?: boolean
}

export function MostradorCartLineDisplay({
  row,
  pricing,
  paymentBadge,
  rowClassName,
  inlineQuantity = false,
  omitHiddenPricePlaceholder = false,
}: Props) {
  const productoDescripcion = productDescriptionForMostradorRow(row)
  const comentario = row.comment?.trim() ?? ""
  const tieneComentario = comentario.length > 0
  const showPrice = !row.hidePrice
  const quantityLabel = formatCartLineQuantity(row.cantidad)

  return (
    <div className={cn("w-full", rowClassName)}>
      <div
        className={cn(
          inlineQuantity ? cartLineRowGridCompactClass : cartLineRowGridClass,
        )}
      >
        {!inlineQuantity ? (
          <CartLineQuantityLabel cantidad={row.cantidad} />
        ) : null}

        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="block text-sm font-semibold leading-snug text-slate-900">
              {inlineQuantity ? (
                <>
                  <span className="font-bold tabular-nums">{quantityLabel}</span>
                  {" "}
                  {row.nombre}
                </>
              ) : (
                row.nombre
              )}
            </span>
            {paymentBadge}
          </span>
          {productoDescripcion ? (
            <span className="mt-0.5 block truncate text-xs leading-snug text-slate-500">
              {productoDescripcion}
            </span>
          ) : null}
        </span>

        <span className="pt-0.5 text-right">
          {showPrice ? (
            <span className={saleOpImporteCartClass}>
              {saleOpFmt.format(pricing.precioFinal)}
            </span>
          ) : omitHiddenPricePlaceholder ? (
            <span aria-hidden className="block" />
          ) : (
            <span className="text-sm font-medium text-slate-400">—</span>
          )}
        </span>
      </div>

      {tieneComentario ? (
        <div className="border-t border-dashed border-slate-200/80 bg-slate-50/80 px-3 py-2">
          <p className="text-[11px] leading-snug text-slate-600">
            <MessageSquare
              className="mr-1 inline size-3 -translate-y-px text-slate-400"
              aria-hidden
            />
            {comentario}
          </p>
        </div>
      ) : null}
    </div>
  )
}
