"use client"

import {
  saleFinalizeDialogAmountClass,
  saleFinalizeDialogAmountLabelClass,
  saleFinalizeDialogBreakdownAmountClass,
  saleFinalizeDialogBreakdownClass,
  saleFinalizeDialogBreakdownDiscountClass,
  saleFinalizeDialogBreakdownLabelClass,
  saleFinalizeDialogBreakdownRowClass,
  saleFinalizeDialogFactLabelClass,
  saleFinalizeDialogFactRowClass,
  saleFinalizeDialogFactsZoneClass,
  saleFinalizeDialogFactValueClass,
  saleFinalizeDialogFactValueMutedClass,
} from "@/components/checkout/saleFinalizeDialogStyles"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"

export type SaleFinalizeFactsProps = {
  partyLabel?: string
  partyValue: string
  comprobanteLabel: string
  paymentLabel: string
  className?: string
  /** Sin shell propio — para integrar opciones en la misma zona bruma. */
  embedded?: boolean
}

export type SaleFinalizeTotalsProps = {
  total: number
  subtotal?: number
  descuentoMonto?: number
  hayDescuento?: boolean
  className?: string
}

function isUnsetFact(value: string) {
  const normalized = value.trim().toLowerCase()
  return (
    normalized === "sin cliente" ||
    normalized === "sin comprobante" ||
    normalized === "sin proveedor"
  )
}

export function SaleFinalizeTotals({
  total,
  subtotal,
  descuentoMonto = 0,
  hayDescuento = false,
  className,
}: SaleFinalizeTotalsProps) {
  const showGeneralDiscount = hayDescuento && descuentoMonto > 0
  const showSubtotalBreakdown =
    subtotal != null && showGeneralDiscount && subtotal > total

  return (
    <div className={cn("text-center", className)}>
      {showSubtotalBreakdown ? (
        <div className={saleFinalizeDialogBreakdownClass}>
          <div className={saleFinalizeDialogBreakdownRowClass}>
            <span className={saleFinalizeDialogBreakdownLabelClass}>Subtotal</span>
            <span className={saleFinalizeDialogBreakdownAmountClass}>
              {saleOpFmt.format(subtotal)}
            </span>
          </div>
          <div className={saleFinalizeDialogBreakdownRowClass}>
            <span className={saleFinalizeDialogBreakdownLabelClass}>
              Descuento general
            </span>
            <span className={saleFinalizeDialogBreakdownDiscountClass}>
              −{saleOpFmt.format(descuentoMonto)}
            </span>
          </div>
        </div>
      ) : null}

      <p
        className={saleFinalizeDialogAmountClass}
        aria-live="polite"
        aria-atomic="true"
      >
        {saleOpFmt.format(total)}
      </p>
      <p className={saleFinalizeDialogAmountLabelClass}>Total a cobrar ahora</p>
    </div>
  )
}

export function SaleFinalizeFacts({
  partyLabel = "Cliente",
  partyValue,
  comprobanteLabel,
  paymentLabel,
  className,
  embedded = false,
}: SaleFinalizeFactsProps) {
  const facts = [
    { key: "party", label: partyLabel, value: partyValue },
    { key: "comprobante", label: "Comprobante", value: comprobanteLabel },
    { key: "payment", label: "Pago", value: paymentLabel },
  ] as const

  const Tag = embedded ? "div" : "section"

  return (
    <Tag
      aria-label={embedded ? undefined : "Datos del cobro"}
      className={cn(!embedded && saleFinalizeDialogFactsZoneClass, className)}
    >
      {facts.map((fact) => (
        <div key={fact.key} className={saleFinalizeDialogFactRowClass}>
          <span className={saleFinalizeDialogFactLabelClass}>{fact.label}</span>
          <span
            className={cn(
              isUnsetFact(fact.value)
                ? saleFinalizeDialogFactValueMutedClass
                : saleFinalizeDialogFactValueClass,
            )}
            title={fact.value}
          >
            {fact.value}
          </span>
        </div>
      ))}
    </Tag>
  )
}

export type SaleFinalizeSummaryProps = SaleFinalizeTotalsProps &
  SaleFinalizeFactsProps & {
    showTotals?: boolean
  }

/** Bloque reutilizable — p. ej. modal de mesas con opciones extra. */
export function SaleFinalizeSummary({
  showTotals = true,
  className,
  ...props
}: SaleFinalizeSummaryProps) {
  return (
    <div className={className}>
      {showTotals ? <SaleFinalizeTotals {...props} className="px-1 pb-1" /> : null}
      <SaleFinalizeFacts {...props} />
    </div>
  )
}
