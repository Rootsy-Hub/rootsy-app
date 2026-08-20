"use client"

import type { SaleCatalogPaymentOption } from "@/app/[siteId]/[popId]/sale/actions"
import { PaymentMethodDialog } from "@/components/payment/PaymentMethodDialog"
import { CLIENT_ACCOUNT_PAYMENT_LABEL } from "@/lib/operationPaymentLabels"
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
  cashTreasuryAccountId: string | null
  cashRegisterName?: string | null
  selected: SaleCatalogPaymentOption | null
  payOnClientAccount: boolean
  onSelectImmediate: (selection: SaleCatalogPaymentOption | null) => void
  onSelectClientAccount: () => void
  /** @deprecated El diálogo usa estilos compartidos internamente. */
  styles?: DialogStyles
  clientAccountDescription?: string
  popId?: string
  defaultPartyName?: string
  defaultPartyId?: string
  hideAccountOption?: boolean
}

export function SalePaymentMethodDialog({
  open,
  onOpenChange,
  treasuryContext,
  cashTreasuryAccountId,
  cashRegisterName = null,
  selected,
  payOnClientAccount,
  onSelectImmediate,
  onSelectClientAccount,
  clientAccountDescription =
    "Entregás la mercadería ahora y registrás la deuda en Cuentas por cobrar.",
  popId,
  defaultPartyName,
  defaultPartyId,
  hideAccountOption,
}: Props) {
  return (
    <PaymentMethodDialog
      flow="sale"
      open={open}
      onOpenChange={onOpenChange}
      treasuryContext={treasuryContext}
      selected={selected}
      payOnAccount={payOnClientAccount}
      onSelectImmediate={onSelectImmediate}
      onSelectAccount={onSelectClientAccount}
      accountOptionLabel={CLIENT_ACCOUNT_PAYMENT_LABEL}
      accountDescription={clientAccountDescription}
      immediateSectionTitle="Cobro inmediato"
      cashTreasuryAccountId={cashTreasuryAccountId}
      cashRegisterName={cashRegisterName}
      popId={popId}
      defaultPartyName={defaultPartyName}
      defaultPartyId={defaultPartyId}
      hideAccountOption={hideAccountOption}
    />
  )
}
