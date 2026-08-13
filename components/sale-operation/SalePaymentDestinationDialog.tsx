"use client"

import type { OperationPaymentKind } from "@/lib/operationPaymentKinds"
import { PaymentMethodDialog } from "@/components/payment/PaymentMethodDialog"
import type { PaymentFlow, PaymentMethodSelection } from "@/lib/paymentMethodCheckout"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  kind: OperationPaymentKind
  treasuryContext: TreasuryPaymentContext | null
  selected: PaymentMethodSelection | null
  onSelect: (selection: PaymentMethodSelection) => void
  flow?: PaymentFlow
  cashTreasuryAccountId?: string | null
}

export function SalePaymentDestinationDialog({
  open,
  onOpenChange,
  kind,
  treasuryContext,
  selected,
  onSelect,
  flow = "sale",
  cashTreasuryAccountId = null,
}: Props) {
  return (
    <PaymentMethodDialog
      flow={flow}
      open={open}
      onOpenChange={onOpenChange}
      treasuryContext={treasuryContext}
      selected={selected}
      payOnAccount={false}
      onSelectImmediate={onSelect}
      onSelectAccount={() => {}}
      accountOptionLabel=""
      accountDescription=""
      hideAccountOption
      initialDestinationKind={kind}
      cashTreasuryAccountId={cashTreasuryAccountId}
    />
  )
}
