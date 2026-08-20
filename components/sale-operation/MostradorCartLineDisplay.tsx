"use client"

import {
  layoutsOperarTicketProposalLineAmountClass,
  layoutsOperarTicketProposalLineMetaClass,
  layoutsOperarTicketProposalLineNameClass,
  layoutsOperarTicketProposalQtyClass,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import { LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import {
  CartLineQuantityLabel,
  cartLineRowGridClass,
  cartLineRowGridCompactClass,
  formatCartLineQuantity,
  formatOperarTicketQuantity,
} from "@/components/sale-operation/CartLineQuantityLabel"
import {
  saleOpCartLineDividerTopClass,
  saleOpFmt,
  saleOpImporteCartClass,
} from "@/components/sale-operation/saleOperationStyles"
import {
  productDescriptionForMostradorRow,
  type MostradorCartDisplayRow,
} from "@/lib/mostradorCartDisplay"
import { cn } from "@/lib/utils"
import { MessageSquare } from "lucide-react"
import type { ReactNode } from "react"

const TICKET_PROPOSAL = LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL

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
  importeClassName?: string
  variant?: "legacy" | "operar"
}

function unitOfMeasureForRow(row: MostradorCartDisplayRow): string {
  if (row.kind === "article") {
    return row.producto?.unitOfMeasure?.trim() || "unidad"
  }
  return "unidad"
}

export function MostradorCartLineDisplay({
  row,
  pricing,
  paymentBadge,
  rowClassName,
  inlineQuantity = false,
  omitHiddenPricePlaceholder = false,
  importeClassName = saleOpImporteCartClass,
  variant = "legacy",
}: Props) {
  const productoDescripcion = productDescriptionForMostradorRow(row)
  const comentario = row.comment?.trim() ?? ""
  const tieneComentario = comentario.length > 0
  const showPrice = !row.hidePrice
  const quantityLabel = formatCartLineQuantity(row.cantidad)
  const isOperar = variant === "operar"
  const unitOfMeasure = unitOfMeasureForRow(row)
  const hasLineDiscount = showPrice && pricing.precioBase > pricing.precioFinal + 0.004

  if (isOperar) {
    return (
      <div className={cn("w-full", rowClassName)}>
        <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-x-2.5 px-3 py-2.5 text-left">
          <span className="min-w-0">
            <span className="flex min-w-0 items-center gap-1.5">
              <span className={layoutsOperarTicketProposalLineNameClass(TICKET_PROPOSAL)}>
                {row.nombre}
              </span>
              {paymentBadge}
            </span>
            {productoDescripcion ? (
              <span
                className={layoutsOperarTicketProposalLineMetaClass(TICKET_PROPOSAL)}
              >
                {productoDescripcion}
              </span>
            ) : null}
            {showPrice ? (
              <span className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5">
                <span
                  className={cn(
                    layoutsOperarTicketProposalLineAmountClass(TICKET_PROPOSAL),
                    "text-xs font-bold",
                  )}
                >
                  {saleOpFmt.format(pricing.precioFinal)}
                </span>
                {hasLineDiscount ? (
                  <span className="text-xs font-normal tabular-nums text-[var(--rootsy-bruma-600)] line-through">
                    {saleOpFmt.format(pricing.precioBase)}
                  </span>
                ) : null}
              </span>
            ) : omitHiddenPricePlaceholder ? null : (
              <span className="mt-0.5 block text-xs font-medium text-[var(--rootsy-bruma-500)]">
                —
              </span>
            )}
            {tieneComentario ? (
              <span className="mt-1 block text-[11px] font-medium leading-snug text-[var(--rootsy-bruma-700)]">
                <MessageSquare
                  className="mr-1 inline size-3 -translate-y-px text-[var(--rootsy-bruma-600)]"
                  aria-hidden
                />
                {comentario}
              </span>
            ) : null}
          </span>
          <span
            className={layoutsOperarTicketProposalQtyClass(TICKET_PROPOSAL)}
            title={formatOperarTicketQuantity(row.cantidad, unitOfMeasure)}
          >
            {formatOperarTicketQuantity(row.cantidad, unitOfMeasure)}
          </span>
        </div>
      </div>
    )
  }

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
            <span className={importeClassName}>
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
        <div className={cn(saleOpCartLineDividerTopClass, "bg-slate-50/80 px-3 py-2")}>
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
