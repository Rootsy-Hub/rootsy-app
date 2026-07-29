"use client"

import {
  CartLineQuantityLabel,
  cartLineRowGridClass,
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
import { MessageSquare } from "lucide-react"

type Pricing = {
  precioBase: number
  precioFinal: number
}

type Props = {
  row: MostradorCartDisplayRow
  pricing: Pricing
}

export function MostradorCartLineDisplay({ row, pricing }: Props) {
  const productoDescripcion = productDescriptionForMostradorRow(row)
  const comentario = row.comment?.trim() ?? ""
  const tieneComentario = comentario.length > 0
  const showPrice = !row.hidePrice

  return (
    <div className="w-full">
      <div className={cn(cartLineRowGridClass)}>
        <CartLineQuantityLabel cantidad={row.cantidad} />

        <span className="min-w-0">
          <span className="block text-sm font-semibold leading-snug text-slate-900">
            {row.nombre}
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
