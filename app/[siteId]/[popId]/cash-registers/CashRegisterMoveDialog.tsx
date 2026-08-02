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
  saleOpChannelHint,
  saleOpDialogHeader,
} from "@/components/sale-operation/saleOperationStyles"
import { useRef, type FormEvent } from "react"

export type CashRegisterMoveKind = "deposit" | "withdrawal"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  kind: CashRegisterMoveKind
  registerName?: string | null
  saving: boolean
  banner: string | null
  amount: string
  onAmountChange: (value: string) => void
  note: string
  onNoteChange: (value: string) => void
  onSubmit: (e: FormEvent) => void | Promise<void>
}

const copy: Record<
  CashRegisterMoveKind,
  {
    title: string
    amountLabel: string
    hint: string
    primary: string
    loading: string
  }
> = {
  deposit: {
    title: "Ingresar efectivo",
    amountLabel: "Monto",
    hint: "El movimiento suma al saldo de efectivo de la sesión abierta.",
    primary: "Confirmar ingreso",
    loading: "Registrando…",
  },
  withdrawal: {
    title: "Retirar efectivo",
    amountLabel: "Monto",
    hint: "El movimiento resta del saldo de efectivo de la sesión abierta.",
    primary: "Confirmar retiro",
    loading: "Registrando…",
  },
}

export function CashRegisterMoveDialog({
  open,
  onOpenChange,
  kind,
  registerName,
  saving,
  banner,
  amount,
  onAmountChange,
  note,
  onNoteChange,
  onSubmit,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const labels = copy[kind]
  const canSubmit = isMoneyInputComplete(amount)
  const dialogTitle = registerName
    ? `${labels.title} en ${registerName}`
    : labels.title

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cashRegisterSessionDialogContentClass}>
        <DialogHeader className={cn(saleOpDialogHeader, "shrink-0")}>
          <DialogTitle className="text-base font-semibold tracking-tight">
            {dialogTitle}
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
                <CheckoutSectionLabel>{labels.amountLabel}</CheckoutSectionLabel>
                <CheckoutMoneyValueField
                  id="cr-move-amount"
                  value={amount}
                  onChange={onAmountChange}
                  autoFocus
                  ariaLabel={labels.amountLabel}
                />
                <p className={saleOpChannelHint}>{labels.hint}</p>
              </div>

              <div className="space-y-2.5">
                <CheckoutSectionLabel>Nota (opcional)</CheckoutSectionLabel>
                <Textarea
                  id="cr-move-note"
                  value={note}
                  onChange={(e) => onNoteChange(e.target.value)}
                  placeholder="Ej. cambio para vuelto, retiro a caja fuerte…"
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
              label: labels.primary,
              onClick: () => formRef.current?.requestSubmit(),
              disabled: !canSubmit,
              loading: saving,
              loadingLabel: labels.loading,
            }}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
