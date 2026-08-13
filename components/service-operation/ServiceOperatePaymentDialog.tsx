"use client"

import type { ServiceChargePaymentMethodOption } from "@/app/[siteId]/[popId]/active-services/actions"
import { CheckoutOptionCard } from "@/components/checkout/CheckoutOptionCard"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { Dialog } from "@/components/ui/dialog"
import { paymentKindLabel } from "@/lib/paymentMethodLabels"
import { treasuryPaymentOptionKey } from "@/lib/treasuryPaymentOptions"
import { Banknote } from "lucide-react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  paymentMethods: ServiceChargePaymentMethodOption[]
  value: string
  onChange: (paymentMethodKey: string) => void
}

export function ServiceOperatePaymentDialog({
  open,
  onOpenChange,
  paymentMethods,
  value,
  onChange,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="default">
        <RootsDialogHeader
          title="Medio de pago"
          description="Opcional — cómo esperás cobrar este cargo."
        />
        <RootsDialogBody>
          <ul className="flex max-h-80 flex-col gap-2" role="listbox" aria-label="Medios de pago">
            <li>
              <CheckoutOptionCard
                title="Sin definir"
                subtitle="Podés cobrarlo más adelante"
                selected={!value}
                onClick={() => {
                  onChange("")
                  onOpenChange(false)
                }}
                icon={Banknote}
                trailing="none"
              />
            </li>
            {paymentMethods.map((method) => {
              const key = treasuryPaymentOptionKey(method)
              return (
                <li key={key}>
                  <CheckoutOptionCard
                    title={method.label}
                    subtitle={paymentKindLabel(method.kind)}
                    selected={value === key}
                    onClick={() => {
                      onChange(key)
                      onOpenChange(false)
                    }}
                    icon={Banknote}
                    trailing="none"
                  />
                </li>
              )
            })}
          </ul>
        </RootsDialogBody>
      </RootsDialogContent>
    </Dialog>
  )
}
