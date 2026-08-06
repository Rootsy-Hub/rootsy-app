"use client"

import { CheckoutConfirmSummary } from "@/components/checkout/CheckoutConfirmSummary"
import { CheckoutSectionPanel } from "@/components/checkout/CheckoutFormFields"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { Dialog } from "@/components/ui/dialog"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"
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
      <RootsDialogContent className="flex flex-col">
        <RootsDialogHeader title={title} />

        <RootsDialogBody className="space-y-4">
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
            <RootsDialogErrorBanner>{submitError}</RootsDialogErrorBanner>
          ) : null}
        </RootsDialogBody>

        <RootsDialogDualActionFooter
          onCancel={() => onOpenChange(false)}
          cancelLabel="Cancelar"
          onConfirm={() => void onConfirm()}
          confirmLabel={confirmLabel}
          confirmDisabled={submitting}
          confirmLoading={submitting}
          confirmLoadingLabel="Procesando…"
        />
      </RootsDialogContent>
    </Dialog>
  )
}
