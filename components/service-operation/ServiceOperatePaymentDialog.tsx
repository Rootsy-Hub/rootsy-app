"use client"

import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogHeader,
  rootsDialogHeaderClass,
  rootsDialogHeaderCompactClass,
  rootsDialogTitleClass,
} from "@/components/rootsy-dialog"
import {
  ServiceOperatePaymentFields,
  type ServiceOperatePaymentInlineNavigation,
} from "@/components/service-operation/ServiceOperatePaymentFields"
import { RootsIconButton } from "@/components/rootsy-button/RootsIconButton"
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { CheckoutCheckDetails } from "@/lib/checkoutCheck"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"
import { cn } from "@/lib/utils"
import { ChevronLeft } from "lucide-react"
import { useCallback, useState } from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  treasuryContext: TreasuryPaymentContext | null
  value: string
  onChange: (
    paymentMethodKey: string,
    checkDetails?: CheckoutCheckDetails | null,
  ) => void
  popId?: string
  defaultPartyName?: string
  defaultPartyId?: string
  checkDetails?: CheckoutCheckDetails | null
}

export function ServiceOperatePaymentDialog({
  open,
  onOpenChange,
  treasuryContext,
  value,
  onChange,
  popId,
  defaultPartyName,
  defaultPartyId,
  checkDetails,
}: Props) {
  const [inlineNavigation, setInlineNavigation] =
    useState<ServiceOperatePaymentInlineNavigation | null>(null)

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setInlineNavigation(null)
      }
      onOpenChange(nextOpen)
    },
    [onOpenChange],
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <RootsDialogContent size="default" className="flex flex-col">
        {inlineNavigation ? (
          <DialogHeader
            className={cn(
              rootsDialogHeaderClass,
              rootsDialogHeaderCompactClass,
              "shrink-0",
            )}
          >
            <div className="flex items-center gap-2">
              <RootsIconButton
                type="button"
                label="Volver"
                theme="workspace"
                emphasis="ghost"
                size="default"
                className="-ml-2 shrink-0"
                onClick={inlineNavigation.onBack}
              >
                <ChevronLeft aria-hidden />
              </RootsIconButton>
              <DialogTitle className={cn(rootsDialogTitleClass, "min-w-0 flex-1")}>
                {inlineNavigation.title}
              </DialogTitle>
            </div>
          </DialogHeader>
        ) : (
          <RootsDialogHeader
            title="Medio de pago"
            description="Opcional — cómo esperás cobrar este cargo."
          />
        )}

        <RootsDialogBody>
          <ServiceOperatePaymentFields
            paymentMethodKey={value}
            onChange={onChange}
            treasuryContext={treasuryContext}
            popId={popId}
            defaultPartyName={defaultPartyName}
            defaultPartyId={defaultPartyId}
            checkDetails={checkDetails}
            tone="light"
            showTitle={false}
            inlineNavigation
            navigationSessionActive={open}
            onInlineNavigationChange={setInlineNavigation}
            onSelectionComplete={() => handleOpenChange(false)}
          />
        </RootsDialogBody>
      </RootsDialogContent>
    </Dialog>
  )
}
