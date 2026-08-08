"use client"

import {
  SaleFinalizeFacts,
  SaleFinalizeTotals,
} from "@/components/checkout/SaleFinalizeSummary"
import {
  saleFinalizeDialogActionsClass,
  saleFinalizeDialogCancelActionClass,
  saleFinalizeDialogCancelShortcutClass,
  saleFinalizeDialogCloseClass,
  saleFinalizeDialogConfirmActionClass,
  saleFinalizeDialogConfirmShortcutClass,
  saleFinalizeDialogErrorClass,
  saleFinalizeDialogOverlayClass,
  saleFinalizeDialogHeaderRowClass,
  saleFinalizeDialogShellClass,
  saleFinalizeDialogTitleClass,
  saleFinalizeDialogTotalsGlowClass,
  saleFinalizeDialogTotalsGradientStyle,
  saleFinalizeDialogTotalsZoneClass,
} from "@/components/checkout/saleFinalizeDialogStyles"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { CornerDownLeft, Loader2, X } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { useEffect } from "react"

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

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        if (submitting) return
        event.preventDefault()
        void onConfirm()
        return
      }

      if (event.key === "Escape") {
        if (submitting) {
          event.preventDefault()
          return
        }
        onOpenChange(false)
      }
    }

    window.addEventListener("keydown", onKeyDown, true)
    return () => window.removeEventListener("keydown", onKeyDown, true)
  }, [open, submitting, onConfirm, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName={saleFinalizeDialogOverlayClass}
        className={saleFinalizeDialogShellClass}
        aria-describedby={undefined}
        onEscapeKeyDown={(event) => {
          if (submitting) event.preventDefault()
        }}
      >
        <section
          aria-label={title}
          className={saleFinalizeDialogTotalsZoneClass}
          style={saleFinalizeDialogTotalsGradientStyle}
        >
          <div className={saleFinalizeDialogTotalsGlowClass} aria-hidden />

          <div className="relative z-10">
            <div className={saleFinalizeDialogHeaderRowClass}>
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
            aria-keyshortcuts="Escape"
          >
            <span>Cancelar</span>
            <span className={saleFinalizeDialogCancelShortcutClass}>Esc</span>
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void onConfirm()}
            className={saleFinalizeDialogConfirmActionClass}
            aria-keyshortcuts="Enter"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Procesando…
              </>
            ) : (
              <>
                <span>{confirmLabel}</span>
                <span className={saleFinalizeDialogConfirmShortcutClass} aria-hidden>
                  <CornerDownLeft className="size-3.5" strokeWidth={2.25} />
                </span>
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
