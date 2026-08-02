"use client"

import { CheckoutConfirmSummary } from "@/components/checkout/CheckoutConfirmSummary"
import { CheckoutDialogFooter } from "@/components/checkout/CheckoutDialogFooter"
import { CheckoutSectionPanel } from "@/components/checkout/CheckoutFormFields"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  saleOpDialogBody,
  saleOpDialogContentMd,
  saleOpDialogHeader,
  saleOpFmt,
} from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

type Props = {
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

export function SimpleOperationCheckoutConfirmDialog({
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
  partyIcon,
  comprobanteLabel,
  paymentLabel,
  onConfirm,
}: Props) {
  const totalHint =
    hayDescuento && subtotal != null
      ? `Subtotal ${saleOpFmt.format(subtotal)}${
          descuentoMonto > 0
            ? ` · Descuento general −${saleOpFmt.format(descuentoMonto)}`
            : ""
        }`
      : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={saleOpDialogContentMd}>
        <DialogHeader className={cn(saleOpDialogHeader, "shrink-0")}>
          <DialogTitle className="text-base font-semibold tracking-tight">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div
          className={cn(
            saleOpDialogBody,
            "min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain",
          )}
        >
          <CheckoutSectionPanel>
            <CheckoutConfirmSummary
              total={total}
              hint={totalHint}
              partyLabel={partyLabel}
              partyValue={partyValue}
              partyIcon={partyIcon}
              comprobanteLabel={comprobanteLabel}
              paymentLabel={paymentLabel}
            />
          </CheckoutSectionPanel>

          {submitError ? (
            <p
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-sm text-destructive"
            >
              {submitError}
            </p>
          ) : null}
        </div>

        <CheckoutDialogFooter
          className="shrink-0"
          onCancel={() => onOpenChange(false)}
          cancelDisabled={submitting}
          primary={{
            label: confirmLabel,
            onClick: () => void onConfirm(),
            disabled: submitting,
            loading: submitting,
            loadingLabel: "Procesando…",
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
