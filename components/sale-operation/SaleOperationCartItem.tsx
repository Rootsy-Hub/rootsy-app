"use client"

import { CartItemTitleMarquee } from "@/components/sale-operation/CartItemTitleMarquee"
import { SaleOperationCartQuantityStepper } from "@/components/sale-operation/SaleOperationCartQuantityStepper"
import {
  saleOpFmt,
  saleOpImporteBaseClass,
  saleOpImporteCartClass,
  saleOpImporteCartMutedClass,
} from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"
import { MessageSquare, Trash2 } from "lucide-react"
import type { ReactNode } from "react"

type Props = {
  itemId: string
  nombre: string
  descripcion?: string | null
  cantidad: number
  precioUnitario: number
  precioBase: number
  precioFinal: number
  expanded?: boolean
  expandable?: boolean
  onToggleExpand?: () => void
  onQuantityDecrease: () => void
  onQuantityIncrease: () => void
  onRemove?: () => void
  tieneComentario?: boolean
  tieneDescuento?: boolean
  descuentoLabel?: string
  expandedContent?: ReactNode
  hideQuantityStepper?: boolean
  quantityStepperFallback?: ReactNode
  priceFormatter?: (amount: number) => string
}

export function SaleOperationCartItem({
  itemId,
  nombre,
  descripcion,
  cantidad,
  precioUnitario,
  precioBase,
  precioFinal,
  expanded = false,
  expandable = false,
  onToggleExpand,
  onQuantityDecrease,
  onQuantityIncrease,
  onRemove,
  tieneComentario = false,
  tieneDescuento = false,
  descuentoLabel,
  expandedContent,
  hideQuantityStepper = false,
  quantityStepperFallback,
  priceFormatter,
}: Props) {
  const formatPrice = priceFormatter ?? saleOpFmt.format.bind(saleOpFmt)
  const showRemove = Boolean(onRemove)
  const interactive = expandable && onToggleExpand

  const cardClassName = cn(
    "rounded-xl border bg-white px-3 py-2.5 text-left shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_4px_14px_rgba(15,23,42,0.05)] transition-[border-color,box-shadow] duration-150",
    interactive &&
      "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#eef1f5]",
    expanded
      ? "border-slate-300 ring-1 ring-slate-300/60 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_6px_20px_rgba(15,23,42,0.07)]"
      : cn(
          "border-slate-200/90",
          interactive &&
            "hover:border-slate-300 hover:shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_6px_18px_rgba(15,23,42,0.06)]",
        ),
  )

  const gridClassName = cn(
    "grid items-center gap-2",
    showRemove
      ? "grid-cols-[56px_minmax(0,1fr)_minmax(4.5rem,auto)_2rem] sm:grid-cols-[56px_minmax(0,1fr)_5.5rem_2rem]"
      : "grid-cols-[56px_minmax(0,1fr)_minmax(4.5rem,auto)] sm:grid-cols-[56px_minmax(0,1fr)_5.5rem]",
  )

  const body = (
    <div className={gridClassName}>
      {hideQuantityStepper && quantityStepperFallback ? (
        quantityStepperFallback
      ) : (
        <SaleOperationCartQuantityStepper
          nombre={nombre}
          cantidad={cantidad}
          onDecrease={onQuantityDecrease}
          onIncrease={onQuantityIncrease}
        />
      )}
      <div className="min-w-0">
        <CartItemTitleMarquee
          text={nombre}
          active={expanded}
          className="text-sm font-semibold text-slate-900"
        />
        <div className="mt-0.5 flex min-w-0 items-center gap-1">
          <div className="min-w-0 flex-1">
            {descripcion ? (
              <p className="line-clamp-1 text-xs text-slate-500">{descripcion}</p>
            ) : (
              <p className="line-clamp-1 text-xs text-slate-500">
                {saleOpFmt.format(precioUnitario)} c/u
              </p>
            )}
          </div>
          {tieneComentario ? (
            <span
              className="inline-flex shrink-0 items-center rounded-full border border-sky-200 bg-sky-50 px-1.5 py-0 text-[10px] font-semibold text-sky-800"
              title="Tiene comentario para cocina"
            >
              <span className="sr-only">Comentario</span>
              <MessageSquare className="size-3 sm:hidden" aria-hidden />
              <span aria-hidden className="hidden sm:inline">
                Nota
              </span>
            </span>
          ) : null}
          {tieneDescuento && descuentoLabel ? (
            <span
              className={cn(
                "inline-flex max-w-22 shrink-0 items-center justify-center truncate rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0 text-[10px] font-semibold text-emerald-800",
                saleOpImporteBaseClass,
              )}
            >
              {descuentoLabel}
            </span>
          ) : null}
        </div>
      </div>
      <div className="text-right">
        {tieneDescuento && precioBase > precioFinal && precioFinal >= 0 ? (
          <p className={cn(saleOpImporteCartMutedClass, "line-through")}>
            {formatPrice(precioBase)}
          </p>
        ) : null}
        <p className={saleOpImporteCartClass}>{formatPrice(precioFinal)}</p>
      </div>
      {showRemove ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove?.()
          }}
          aria-label={`Quitar ${nombre} del carrito`}
          className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  )

  return (
    <div className="space-y-2">
      {interactive ? (
        <div
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
          aria-controls={expanded ? `cart-item-${itemId}-opciones` : undefined}
          aria-label={
            expanded
              ? `${nombre}, ${cantidad} unidades. Opciones visibles. Clic para cerrar.`
              : `${nombre}, ${cantidad} unidades. Clic para descuento y comentario.`
          }
          onClick={onToggleExpand}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              onToggleExpand?.()
            }
          }}
          className={cardClassName}
        >
          {body}
        </div>
      ) : (
        <div className={cardClassName}>{body}</div>
      )}

      {expanded && expandedContent ? (
        <div
          id={`cart-item-${itemId}-opciones`}
          role="region"
          aria-label={`Opciones de ${nombre}`}
          onClick={(e) => e.stopPropagation()}
          className="rounded-xl border border-slate-200/95 bg-white px-2.5 py-2 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_4px_16px_rgba(15,23,42,0.06)]"
        >
          {expandedContent}
        </div>
      ) : null}
    </div>
  )
}
