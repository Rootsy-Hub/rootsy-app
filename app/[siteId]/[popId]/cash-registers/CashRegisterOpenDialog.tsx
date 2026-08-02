"use client"

import {
  cashRegisterSessionDialogContentClass,
  CashRegisterDialogSingleColumnBody,
} from "@/app/[siteId]/[popId]/cash-registers/CashRegisterDialogLayout"
import { CheckoutDialogFooter } from "@/components/checkout/CheckoutDialogFooter"
import {
  CheckoutMoneyValueField,
  CheckoutSectionLabel,
  CheckoutSectionPanel,
} from "@/components/checkout/CheckoutFormFields"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { isMoneyInputComplete } from "@/lib/moneyInput"
import { cn } from "@/lib/utils"
import {
  saleOpChannelFormField,
  saleOpDialogHeader,
} from "@/components/sale-operation/saleOperationStyles"
import { useRef, type FormEvent } from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  registerName?: string | null
  saving: boolean
  banner: string | null
  openingCash: string
  onOpeningCashChange: (value: string) => void
  note: string
  onNoteChange: (value: string) => void
  onSubmit: (e: FormEvent) => void | Promise<void>
}

export function CashRegisterOpenDialog({
  open,
  onOpenChange,
  registerName,
  saving,
  banner,
  openingCash,
  onOpeningCashChange,
  note,
  onNoteChange,
  onSubmit,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const canSubmit = isMoneyInputComplete(openingCash)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cashRegisterSessionDialogContentClass}>
        <DialogHeader className={cn(saleOpDialogHeader, "shrink-0")}>
          <DialogTitle className="text-base font-semibold tracking-tight">
            {registerName ? `Abrir turno en ${registerName}` : "Abrir turno"}
          </DialogTitle>
        </DialogHeader>

        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <CashRegisterDialogSingleColumnBody banner={banner}>
            <CheckoutSectionPanel>
              <div className="space-y-2.5">
                <CheckoutSectionLabel>Efectivo contado al abrir</CheckoutSectionLabel>
                <CheckoutMoneyValueField
                  id="cr-open-cash"
                  value={openingCash}
                  onChange={onOpeningCashChange}
                  autoFocus
                  ariaLabel="Efectivo contado al abrir"
                />
              </div>

              <div className="space-y-2.5">
                <CheckoutSectionLabel>Nota (opcional)</CheckoutSectionLabel>
                <Textarea
                  id="cr-open-note"
                  value={note}
                  onChange={(e) => onNoteChange(e.target.value)}
                  placeholder="Ej. vales del turno anterior, diferencias al contar…"
                  rows={3}
                  className={cn(saleOpChannelFormField, "min-h-[88px] resize-y")}
                />
              </div>
            </CheckoutSectionPanel>
          </CashRegisterDialogSingleColumnBody>

          <CheckoutDialogFooter
            onCancel={() => onOpenChange(false)}
            cancelDisabled={saving}
            primary={{
              label: "Abrir turno",
              onClick: () => formRef.current?.requestSubmit(),
              disabled: !canSubmit,
              loading: saving,
              loadingLabel: "Abriendo…",
            }}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
