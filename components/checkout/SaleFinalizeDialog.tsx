"use client"

import {
  SaleFinalizeFacts,
  SaleFinalizeTotals,
} from "@/components/checkout/SaleFinalizeSummary"
import {
  canConfirmPartialPayment,
  SaleFinalizePartialPaymentList,
} from "@/components/checkout/SaleFinalizePartialPaymentList"
import type { SaleFinalizeChannelCheckoutConfig } from "@/components/checkout/saleChannelCheckoutTypes"
import {
  saleFinalizeDialogActionsClass,
  saleFinalizeDialogCancelActionClass,
  saleFinalizeDialogCancelShortcutClass,
  saleFinalizeDialogCloseClass,
  saleFinalizeDialogConfirmActionClass,
  saleFinalizeDialogConfirmShortcutClass,
  saleFinalizeDialogErrorClass,
  saleFinalizeDialogFactLabelClass,
  saleFinalizeDialogFactsZoneClass,
  saleFinalizeDialogOptionsBlockClass,
  saleFinalizeDialogOverlayClass,
  saleFinalizeDialogHeaderRowClass,
  saleFinalizeDialogPartialColumnClass,
  saleFinalizeDialogPartialListClass,
  saleFinalizeDialogPartialListMobileClass,
  saleFinalizeDialogShellClass,
  saleFinalizeDialogShellWideClass,
  saleFinalizeDialogSplitBodyClass,
  saleFinalizeDialogSplitMainColumnClass,
  saleFinalizeDialogTitleClass,
  saleFinalizeDialogTotalsGlowClass,
  saleFinalizeDialogTotalsGradientStyle,
  saleFinalizeDialogTotalsZoneClass,
} from "@/components/checkout/saleFinalizeDialogStyles"
import { CheckoutToggleCard } from "@/components/checkout/CheckoutFormFields"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { CornerDownLeft, DoorOpen, Loader2, Printer, Split, X } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import { useEffect } from "react"

export type { SaleFinalizeChannelCheckoutConfig } from "@/components/checkout/saleChannelCheckoutTypes"

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
  channelCheckout?: SaleFinalizeChannelCheckoutConfig
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
  channelCheckout,
  onConfirm,
}: SaleFinalizeDialogProps) {
  void _partyIcon

  const partialPayment = channelCheckout?.partialPayment === true
  const canConfirm =
    !channelCheckout ||
    canConfirmPartialPayment(
      channelCheckout.partialPayment,
      channelCheckout.partialUnits,
      channelCheckout.partialSelection,
    )

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        if (submitting || !canConfirm) return
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
  }, [open, submitting, canConfirm, onConfirm, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName={saleFinalizeDialogOverlayClass}
        className={cn(
          saleFinalizeDialogShellClass,
          partialPayment && saleFinalizeDialogShellWideClass,
        )}
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

        <div
          className={cn(partialPayment && saleFinalizeDialogSplitBodyClass)}
        >
          <section
            className={cn(
              saleFinalizeDialogFactsZoneClass,
              saleFinalizeDialogSplitMainColumnClass,
            )}
            aria-label="Datos del cobro"
          >
            <SaleFinalizeFacts
              embedded
              partyLabel={partyLabel}
              partyValue={partyValue}
              comprobanteLabel={comprobanteLabel}
              paymentLabel={paymentLabel}
            />

            {channelCheckout ? (
              <div className={saleFinalizeDialogOptionsBlockClass}>
                <p className={saleFinalizeDialogFactLabelClass}>Opciones</p>
                <div className="space-y-2">
                  <CheckoutToggleCard
                    title="Cobro parcial"
                    selected={channelCheckout.partialPayment}
                    onClick={() =>
                      channelCheckout.onPartialPaymentChange(!channelCheckout.partialPayment)
                    }
                    icon={Split}
                  />
                  {channelCheckout.hasComprobante ? (
                    <CheckoutToggleCard
                      title="Imprimir comprobante"
                      selected={channelCheckout.imprimirComprobante}
                      onClick={() =>
                        channelCheckout.onImprimirComprobanteChange(
                          !channelCheckout.imprimirComprobante,
                        )
                      }
                      icon={Printer}
                    />
                  ) : null}
                  <CheckoutToggleCard
                    title={channelCheckout.closeOnCompleteLabel}
                    selected={channelCheckout.closeOnComplete && !channelCheckout.partialPayment}
                    disabled={channelCheckout.partialPayment}
                    onClick={() =>
                      channelCheckout.onCloseOnCompleteChange(!channelCheckout.closeOnComplete)
                    }
                    icon={DoorOpen}
                  />
                </div>

                {partialPayment ? (
                  <div className="space-y-2 pt-1 md:hidden">
                    <p className={saleFinalizeDialogFactLabelClass}>Ítems a cobrar</p>
                    <div className={saleFinalizeDialogPartialListMobileClass}>
                      <SaleFinalizePartialPaymentList
                        units={channelCheckout.partialUnits}
                        selection={channelCheckout.partialSelection}
                        onSelectionChange={channelCheckout.onPartialSelectionChange}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>

          {partialPayment && channelCheckout ? (
            <aside
              className={saleFinalizeDialogPartialColumnClass}
              aria-label="Ítems a cobrar"
            >
              <p className={saleFinalizeDialogFactLabelClass}>Ítems a cobrar</p>
              <div className={cn(saleFinalizeDialogPartialListClass, "mt-2")}>
                <SaleFinalizePartialPaymentList
                  units={channelCheckout.partialUnits}
                  selection={channelCheckout.partialSelection}
                  onSelectionChange={channelCheckout.onPartialSelectionChange}
                />
              </div>
            </aside>
          ) : null}
        </div>

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
            disabled={submitting || !canConfirm}
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
