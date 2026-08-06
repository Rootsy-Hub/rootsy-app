"use client"

import {
  SaleFinalizeFacts,
  SaleFinalizeTotals,
} from "@/components/checkout/SaleFinalizeSummary"
import {
  saleFinalizeDialogActionsClass,
  saleFinalizeDialogCancelActionClass,
  saleFinalizeDialogCloseClass,
  saleFinalizeDialogConfirmActionClass,
  saleFinalizeDialogErrorClass,
  saleFinalizeDialogOverlayClass,
  saleFinalizeDialogShellClass,
  saleFinalizeDialogTitleClass,
  saleFinalizeDialogTotalsGlowClass,
  saleFinalizeDialogTotalsGradientStyle,
  saleFinalizeDialogTotalsZoneClass,
} from "@/components/checkout/saleFinalizeDialogStyles"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Loader2, X } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

export type SaleFinalizeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  confirmLabel: string
  submitting: boolean
  submitError: string | null
  total: number
  subtotal?: number
  descuentoMonto?: number
  hayDescuento?: boolean
  partyLabel?: string
  partyValue: string
  partyIcon?: LucideIcon
  comprobanteLabel: string
  paymentLabel: string
  onConfirm: () => void | Promise<void>
}

/**
 * Terminal de cierre — modal POS dedicado para finalizar venta/compra.
 * Gramática: pos-totals · hechos en bruma-50 · acciones espejo del ticket.
 */
export function SaleFinalizeDialog({
  open,
  onOpenChange,
  title,
  confirmLabel,
  submitting,
  submitError,
  total,
  subtotal,
  descuentoMonto = 0,
  hayDescuento = false,
  partyLabel = "Cliente",
  partyValue,
  partyIcon: _partyIcon,
  comprobanteLabel,
  paymentLabel,
  onConfirm,
}: SaleFinalizeDialogProps) {
  void _partyIcon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName={saleFinalizeDialogOverlayClass}
        className={saleFinalizeDialogShellClass}
        aria-describedby={undefined}
      >
        <section
          aria-label={title}
          className={saleFinalizeDialogTotalsZoneClass}
          style={saleFinalizeDialogTotalsGradientStyle}
        >
          <div className={saleFinalizeDialogTotalsGlowClass} aria-hidden />

          <div className="relative z-10">
            <div className="mb-[var(--rootsy-space-200)] flex items-start justify-between gap-3">
              <DialogTitle className={saleFinalizeDialogTitleClass}>
                {title}
              </DialogTitle>
              <DialogPrimitive.Close className={saleFinalizeDialogCloseClass}>
                <X className="size-4" aria-hidden />
                <span className="sr-only">Cerrar</span>
              </DialogPrimitive.Close>
            </div>

            <SaleFinalizeTotals
              total={total}
              subtotal={subtotal}
              descuentoMonto={descuentoMonto}
              hayDescuento={hayDescuento}
            />
          </div>
        </section>

        <SaleFinalizeFacts
          partyLabel={partyLabel}
          partyValue={partyValue}
          comprobanteLabel={comprobanteLabel}
          paymentLabel={paymentLabel}
        />

        {submitError ? (
          <p role="alert" className={saleFinalizeDialogErrorClass}>
            {submitError}
          </p>
        ) : null}

        <div className={saleFinalizeDialogActionsClass}>
          <button
            type="button"
            disabled={submitting}
            onClick={() => onOpenChange(false)}
            className={saleFinalizeDialogCancelActionClass}
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void onConfirm()}
            className={saleFinalizeDialogConfirmActionClass}
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Procesando…
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
