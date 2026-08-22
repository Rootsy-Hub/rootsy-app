"use client"

import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import {
  RootsFormDateField,
  RootsFormMoneyField,
  RootsFormSelectField,
  RootsFormSelectItem,
} from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import { parseMoneyInput } from "@/lib/moneyInput"
import {
  treasuryPaymentOptionKey,
  type TreasuryPaymentOption,
} from "@/lib/treasuryPaymentOptions"
import { useEffect, useState, type FormEvent } from "react"

export type HrPaySubmit = {
  amount: number
  paidAt: string
  paymentKind: string
  treasuryAccountId: string
}

type Props = {
  open: boolean
  defaultDay: string
  defaultAmount: string
  options: TreasuryPaymentOption[]
  loadingOptions: boolean
  saving: boolean
  error: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (input: HrPaySubmit) => void | Promise<void>
}

export function HrPayDialog({
  open,
  defaultDay,
  defaultAmount,
  options,
  loadingOptions,
  saving,
  error,
  onOpenChange,
  onSubmit,
}: Props) {
  const [amount, setAmount] = useState(defaultAmount)
  const [paidAt, setPaidAt] = useState(defaultDay)
  const [methodKey, setMethodKey] = useState("")

  useEffect(() => {
    if (!open) return
    setAmount(defaultAmount)
    setPaidAt(defaultDay)
    setMethodKey(options[0] ? treasuryPaymentOptionKey(options[0]) : "")
  }, [open, defaultAmount, defaultDay, options])

  const selected = options.find(
    (option) => treasuryPaymentOptionKey(option) === methodKey,
  )
  const parsedAmount = parseMoneyInput(amount)
  const canSubmit =
    parsedAmount > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(paidAt.trim()) &&
    Boolean(selected)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit || !selected) return
    void onSubmit({
      amount: parsedAmount,
      paidAt: paidAt.trim(),
      paymentKind: selected.kind,
      treasuryAccountId: selected.treasuryAccountId,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent showCloseButton={!saving}>
        <RootsDialogForm onSubmit={handleSubmit}>
          <RootsDialogHeader
            open={open}
            title="Le pagué"
            description="Sale de tesorería. No es una liquidación: es el registro de que le diste esa plata."
          />
          <RootsDialogBody className="space-y-4">
            <RootsFormMoneyField
              label="Importe"
              id="hr-pay-amount"
              value={amount}
              onChange={setAmount}
            />
            <RootsFormDateField
              label="Día"
              id="hr-pay-day"
              value={paidAt}
              onChange={setPaidAt}
            />
            <RootsFormSelectField
              label="De"
              id="hr-pay-account"
              value={methodKey}
              onValueChange={setMethodKey}
              placeholder={loadingOptions ? "Cargando cuentas…" : "Elegí una cuenta"}
              disabled={loadingOptions || options.length === 0}
            >
              {options.map((option) => (
                <RootsFormSelectItem
                  key={treasuryPaymentOptionKey(option)}
                  value={treasuryPaymentOptionKey(option)}
                >
                  {option.label}
                </RootsFormSelectItem>
              ))}
            </RootsFormSelectField>
            {error ? <RootsDialogErrorBanner>{error}</RootsDialogErrorBanner> : null}
          </RootsDialogBody>
          <RootsDialogDualActionFooter
            onCancel={() => onOpenChange(false)}
            confirmLabel="Registrar pago"
            confirmLoadingLabel="Guardando…"
            confirmType="submit"
            confirmDisabled={!canSubmit}
            confirmLoading={saving}
          />
        </RootsDialogForm>
      </RootsDialogContent>
    </Dialog>
  )
}
