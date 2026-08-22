"use client"

import type { PurchaseCatalogPaymentOption } from "@/app/[siteId]/[popId]/purchases/actions"
import { PaymentMethodDialog } from "@/components/payment/PaymentMethodDialog"
import { SUPPLIER_ACCOUNT_PAYMENT_LABEL } from "@/lib/operationPaymentLabels"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"

type DialogStyles = {
  content: string
  header: string
  body: string
  footer: string
  optionClass: (selected: boolean) => string
  primaryBtn: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  treasuryContext: TreasuryPaymentContext | null
  selected: PurchaseCatalogPaymentOption | null
  payOnSupplierAccount: boolean
  cardInstallments: string
  onCardInstallmentsChange: (value: string) => void
  onSelectImmediate: (selection: PurchaseCatalogPaymentOption | null) => void
  onSelectSupplierAccount: () => void
  /** @deprecated El diálogo usa estilos compartidos internamente. */
  styles?: DialogStyles
  supplierAccountDescription?: string
  popId?: string
  defaultPartyName?: string
  defaultPartyId?: string
  hideAccountOption?: boolean
}

export function PurchasePaymentMethodDialog({
  open,
  onOpenChange,
  treasuryContext,
  selected,
  payOnSupplierAccount,
  cardInstallments,
  onCardInstallmentsChange,
  onSelectImmediate,
  onSelectSupplierAccount,
  supplierAccountDescription =
    "Recibís la mercadería ahora y registrás la deuda en Proveedores. Podés pagar después.",
  popId,
  defaultPartyName,
  defaultPartyId,
  hideAccountOption,
}: Props) {
  return (
    <PaymentMethodDialog
      flow="purchase"
      open={open}
      onOpenChange={onOpenChange}
      treasuryContext={treasuryContext}
      selected={selected}
      payOnAccount={payOnSupplierAccount}
      onSelectImmediate={onSelectImmediate}
      onSelectAccount={onSelectSupplierAccount}
      accountOptionLabel={SUPPLIER_ACCOUNT_PAYMENT_LABEL}
      accountDescription={supplierAccountDescription}
      immediateSectionTitle="Pago inmediato"
      cardInstallments={cardInstallments}
      onCardInstallmentsChange={onCardInstallmentsChange}
      popId={popId}
      defaultPartyName={defaultPartyName}
      defaultPartyId={defaultPartyId}
      hideAccountOption={hideAccountOption}
    />
  )
}
