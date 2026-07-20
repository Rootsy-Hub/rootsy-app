"use client"

import { SaleOperationCartItem } from "@/components/sale-operation/SaleOperationCartItem"
import {
  type OperationCartLineOverrideActions,
  type OperationCartLineOverrideState,
} from "@/components/sale-operation/OperationCartLineRow"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"
import { Input } from "@/components/ui/input"
import { Banknote, Percent, Tag } from "lucide-react"

type Props = {
  lineKey: string
  promotionName: string
  discountAmount: number
  buyQuantity: number
  overrides: OperationCartLineOverrideState
  overrideActions: OperationCartLineOverrideActions
  onRemove: () => void
}

export function QuantityDealCartLineRow({
  lineKey,
  promotionName,
  discountAmount,
  buyQuantity,
  overrides,
  overrideActions,
  onRemove,
}: Props) {
  const { itemDetalleAbiertoId } = overrides
  const { toggleItemDetalle } = overrideActions
  const abierto = itemDetalleAbiertoId === lineKey

  return (
    <SaleOperationCartItem
      itemId={lineKey}
      nombre={promotionName}
      descripcion={`Promo · ${buyQuantity} u.`}
      cantidad={1}
      precioUnitario={discountAmount}
      precioBase={discountAmount}
      precioFinal={-discountAmount}
      hideQuantityStepper
      quantityStepperFallback={
        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-violet-200/80 bg-violet-50 text-violet-700">
          <Tag className="size-5" aria-hidden />
        </div>
      }
      expandable
      expanded={abierto}
      onToggleExpand={() => toggleItemDetalle(lineKey)}
      onQuantityDecrease={() => {}}
      onQuantityIncrease={() => {}}
      onRemove={onRemove}
      tieneDescuento
      descuentoLabel={promotionName}
      expandedContent={
        <div className="flex items-center gap-2 opacity-60">
          <button
            type="button"
            disabled
            aria-disabled
            className="inline-flex h-8 w-8 shrink-0 cursor-not-allowed items-center justify-center rounded-md border border-slate-300/70 bg-slate-100 text-slate-400"
          >
            <Percent className="size-3.5" aria-hidden />
          </button>
          <Input
            disabled
            value=""
            readOnly
            placeholder="descuento"
            className="h-8 w-26 cursor-not-allowed border border-slate-200 bg-slate-50! text-xs shadow-none"
          />
          <div className="relative min-w-0 flex-1">
            <Banknote className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              disabled
              value=""
              readOnly
              placeholder="sin comentario"
              className="h-8 cursor-not-allowed border border-slate-200 bg-slate-50! pl-8 text-xs shadow-none"
            />
          </div>
        </div>
      }
      priceFormatter={(n) => `−${saleOpFmt.format(Math.abs(n))}`}
    />
  )
}
