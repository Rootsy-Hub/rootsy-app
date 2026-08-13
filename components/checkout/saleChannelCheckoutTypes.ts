import type { PartialPaymentSelection, PartialPaymentUnit } from "@/lib/partialCheckoutSelection"

export type SaleChannelCheckoutConfirmOptions = {
  partialPayment: boolean
  partialSelection: PartialPaymentSelection
  closeOnComplete: boolean
  imprimirComprobante: boolean
}

/** @deprecated Usar SaleChannelCheckoutConfirmOptions */
export type SaleOperationCheckoutConfirmOptions = SaleChannelCheckoutConfirmOptions

export type SaleFinalizeChannelCheckoutConfig = {
  closeOnCompleteLabel: string
  partialPayment: boolean
  onPartialPaymentChange: (value: boolean) => void
  closeOnComplete: boolean
  onCloseOnCompleteChange: (value: boolean) => void
  imprimirComprobante: boolean
  onImprimirComprobanteChange: (value: boolean) => void
  hasComprobante: boolean
  partialUnits: PartialPaymentUnit[]
  partialSelection: PartialPaymentSelection
  onPartialSelectionChange: (next: PartialPaymentSelection) => void
}
