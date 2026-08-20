"use client"

import {
  saleFinalizeDialogAmountClass,
  saleFinalizeDialogAmountLabelClass,
  saleFinalizeDialogDiscountWhisperClass,
  saleFinalizeDialogFactLabelClass,
  saleFinalizeDialogFactRowClass,
  saleFinalizeDialogFactsListClass,
  saleFinalizeDialogFactsZoneClass,
  saleFinalizeDialogFactValueClass,
  saleFinalizeDialogFactValueMutedClass,
} from "@/components/checkout/saleFinalizeDialogStyles"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"
import {
  menuRealmLightMutedClass,
  menuRealmLightStaticClass,
} from "@/lib/menu/menuHoloStyles"
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
  /** Whisper bajo el monto — p. ej. A cobrar, A pagar, Total. */
  amountLabel?: string
  className?: string
}

function isUnsetFact(value: string) {
  const normalized = value.trim().toLowerCase()
  return (
    normalized === "sin cliente" ||
    normalized === "sin comprobante" ||
    normalized === "sin proveedor" ||
    normalized === "sin forma de pago"
  )
}

export function SaleFinalizeTotals({
  total,
  descuentoMonto = 0,
  hayDescuento = false,
  amountLabel = "A cobrar",
  className,
}: SaleFinalizeTotalsProps) {
  const showDiscountWhisper = hayDescuento && descuentoMonto > 0

  return (
    <div className={cn("text-center", className)}>
      <p
        className={cn(saleFinalizeDialogAmountClass, menuRealmLightStaticClass)}
        aria-live="polite"
        aria-atomic="true"
      >
        {saleOpFmt.format(total)}
      </p>
      <p className={cn(saleFinalizeDialogAmountLabelClass, menuRealmLightMutedClass)}>
        {amountLabel}
      </p>
      {showDiscountWhisper ? (
        <p className={cn(saleFinalizeDialogDiscountWhisperClass, menuRealmLightMutedClass)}>
          Incluye {saleOpFmt.format(descuentoMonto)} de descuento
        </p>
      ) : null}
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
      aria-label={embedded ? undefined : "Datos a confirmar"}
      className={cn(!embedded && saleFinalizeDialogFactsZoneClass, className)}
    >
      <div className={saleFinalizeDialogFactsListClass}>
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
      </div>
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
