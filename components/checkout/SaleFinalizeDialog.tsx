"use client"

import { MenuHeaderEntity } from "@/app/[siteId]/[popId]/menu/MenuHeaderEntity"
import { SaleFinalizeDialogAtmosphere } from "@/components/checkout/SaleFinalizeDialogAtmosphere"
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
  saleFinalizeDialogConfirmActionClass,
  saleFinalizeDialogConfirmPayActionClass,
  saleFinalizeDialogConfirmShortcutClass,
  saleFinalizeDialogErrorClass,
  saleFinalizeDialogFactLabelClass,
  saleFinalizeDialogFactsZoneClass,
  saleFinalizeDialogHeaderRowClass,
  saleFinalizeDialogOptionLabelClass,
  saleFinalizeDialogOptionRowClass,
  saleFinalizeDialogOptionsBlockClass,
  saleFinalizeDialogOverlayClass,
  saleFinalizeDialogPartialColumnClass,
  saleFinalizeDialogPartialListClass,
  saleFinalizeDialogPartialListMobileClass,
  saleFinalizeDialogShellClass,
  saleFinalizeDialogShellInnerClass,
  saleFinalizeDialogShellWideClass,
  saleFinalizeDialogSkyInnerClass,
  saleFinalizeDialogSplitBodyClass,
  saleFinalizeDialogSplitMainColumnClass,
  saleFinalizeDialogTitleClass,
  saleFinalizeDialogTotalsZoneClass,
} from "@/components/checkout/saleFinalizeDialogStyles"
import { RootsIconButton } from "@/components/rootsy-button/RootsIconButton"
import { RootsFormSwitch } from "@/components/rootsy-form/RootsFormSwitch"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { CornerDownLeft, Loader2, X } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { menuRealmTitleClass } from "@/lib/menu/menuHoloStyles"
import { cn } from "@/lib/utils"
import { useEffect } from "react"

export type { SaleFinalizeChannelCheckoutConfig } from "@/components/checkout/saleChannelCheckoutTypes"

export type SaleFinalizeTone = "charge" | "pay"

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
  /** charge = A cobrar · savia. pay = A pagar · otoño. */
  tone?: SaleFinalizeTone
  /** Sobreescribe el whisper del cielo — p. ej. "Total" en presupuesto. */
  amountLabel?: string
  channelCheckout?: SaleFinalizeChannelCheckoutConfig
  onConfirm: () => void | Promise<void>
}

function FinalizeOptionRow({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string
  checked: boolean
  disabled?: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <label
      className={cn(
        saleFinalizeDialogOptionRowClass,
        disabled && "cursor-not-allowed opacity-45",
      )}
    >
      <span className={saleFinalizeDialogOptionLabelClass}>{label}</span>
      <RootsFormSwitch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
        aria-label={label}
      />
    </label>
  )
}

/**
 * Terminal de cierre — cielo del universo arriba, pantallazo de hechos abajo.
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
  tone = "charge",
  amountLabel,
  channelCheckout,
  onConfirm,
}: SaleFinalizeDialogProps) {
  void _partyIcon

  const isPay = tone === "pay"
  const resolvedAmountLabel = amountLabel ?? (isPay ? "A pagar" : "A cobrar")
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
        overlayChildren={<SaleFinalizeDialogAtmosphere />}
        className={cn(
          saleFinalizeDialogShellClass,
          partialPayment && saleFinalizeDialogShellWideClass,
        )}
        aria-describedby={undefined}
        onEscapeKeyDown={(event) => {
          if (submitting) event.preventDefault()
        }}
      >
        <div className={saleFinalizeDialogShellInnerClass}>
        <MenuHeaderEntity
          size="dialog"
          className={saleFinalizeDialogTotalsZoneClass}
        >
          <div className={saleFinalizeDialogSkyInnerClass}>
            <div className={saleFinalizeDialogHeaderRowClass}>
              <DialogTitle
                className={cn(saleFinalizeDialogTitleClass, menuRealmTitleClass)}
              >
                {title}
              </DialogTitle>
              <DialogPrimitive.Close asChild>
                <RootsIconButton
                  tone="ghost"
                  surface="dark"
                  size="default"
                  label="Cerrar"
                >
                  <X />
                </RootsIconButton>
              </DialogPrimitive.Close>
            </div>

            <SaleFinalizeTotals
              className="mt-5"
              total={total}
              subtotal={subtotal}
              descuentoMonto={descuentoMonto}
              hayDescuento={hayDescuento}
              amountLabel={resolvedAmountLabel}
            />
          </div>
        </MenuHeaderEntity>

        <div
          className={cn(partialPayment && saleFinalizeDialogSplitBodyClass)}
        >
          <section
            className={cn(
              saleFinalizeDialogFactsZoneClass,
              saleFinalizeDialogSplitMainColumnClass,
            )}
            aria-label="Datos a confirmar"
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
                <FinalizeOptionRow
                  label="Cobro parcial"
                  checked={channelCheckout.partialPayment}
                  onChange={channelCheckout.onPartialPaymentChange}
                />
                {channelCheckout.hasComprobante ? (
                  <FinalizeOptionRow
                    label="Imprimir comprobante"
                    checked={channelCheckout.imprimirComprobante}
                    onChange={channelCheckout.onImprimirComprobanteChange}
                  />
                ) : null}
                <FinalizeOptionRow
                  label={channelCheckout.closeOnCompleteLabel}
                  checked={
                    channelCheckout.closeOnComplete && !channelCheckout.partialPayment
                  }
                  disabled={channelCheckout.partialPayment}
                  onChange={channelCheckout.onCloseOnCompleteChange}
                />

                {partialPayment ? (
                  <div className="space-y-2 pt-2 md:hidden">
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
            className={
              isPay
                ? saleFinalizeDialogConfirmPayActionClass
                : saleFinalizeDialogConfirmActionClass
            }
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
