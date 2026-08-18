"use client"

import { CheckUpsertFormFields } from "@/app/[siteId]/[popId]/checks/CheckUpsertFormFields"
import {
  defaultCheckCreateFormState,
  type CheckCreateFormState,
} from "@/app/[siteId]/[popId]/checks/checkFormState"
import type {
  ServiceChargeListRow,
  ServiceChargePaymentMethodOption,
} from "@/app/[siteId]/[popId]/active-services/actions"
import type { CheckoutCheckDetails } from "@/lib/checkoutCheck"
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
  RootsFormTextareaField,
  rootsFormColumnClass,
} from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import { formatMoneyInputForField, parseMoneyInput } from "@/lib/moneyInput"
import { treasuryPaymentOptionKey } from "@/lib/treasuryPaymentOptions"
import { cn } from "@/lib/utils"
import { useEffect, useState, type FormEvent } from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  popId: string
  charge: ServiceChargeListRow | null
  paymentMethods: ServiceChargePaymentMethodOption[]
  saving?: boolean
  banner?: string | null
  onSubmit: (input: {
    amount: number
    paidAt: string
    paymentMethodKey: string
    notes: string
    checkDetails: CheckoutCheckDetails | null
  }) => void
}

function todayIso(): string {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`
}

export function ServiceChargePaymentDialog({
  open,
  onOpenChange,
  popId,
  charge,
  paymentMethods,
  saving = false,
  banner,
  onSubmit,
}: Props) {
  const [amount, setAmount] = useState("")
  const [paidAt, setPaidAt] = useState(todayIso())
  const [paymentMethodKey, setPaymentMethodKey] = useState("")
  const [notes, setNotes] = useState("")
  const [checkForm, setCheckForm] = useState<CheckCreateFormState>(() =>
    defaultCheckCreateFormState("received"),
  )

  useEffect(() => {
    if (!open || !charge) return
    setAmount(formatMoneyInputForField(charge.balance))
    setPaidAt(todayIso())
    setPaymentMethodKey(
      paymentMethods[0] ? treasuryPaymentOptionKey(paymentMethods[0]) : "",
    )
    setNotes("")
    setCheckForm({
      ...defaultCheckCreateFormState("received"),
      partyName: charge.clientName,
      partyId: charge.clientId,
    })
  }, [open, charge, paymentMethods])

  const selectedMethod = paymentMethods.find(
    (pm) => treasuryPaymentOptionKey(pm) === paymentMethodKey.trim(),
  )

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit({
      amount: parseMoneyInput(amount, 0),
      paidAt,
      paymentMethodKey,
      notes,
      checkDetails:
        selectedMethod?.kind === "check"
          ? {
              checkNumber: checkForm.checkNumber,
              bankName: checkForm.bankName,
              issueDate: checkForm.issueDate,
              dueDate: checkForm.dueDate,
              partyName: checkForm.partyName,
              partyId: checkForm.partyId,
              notes: checkForm.notes,
            }
          : null,
    })
  }

  if (!charge) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="default">
        <RootsDialogHeader
          title="Registrar cobro"
          description={`${charge.clientName} · ${charge.serviceName}`}
        />
        <RootsDialogForm onSubmit={handleSubmit}>
          <RootsDialogBody>
            {banner ? (
              <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner>
            ) : null}
            <div className={cn(rootsFormColumnClass, "gap-4")}>
              <p className="text-sm text-muted-foreground">
                Saldo pendiente:{" "}
                <span className="font-numeric font-semibold tabular-nums text-foreground">
                  {charge.balance.toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  })}
                </span>
              </p>
              <RootsFormMoneyField
                label="Importe"
                id="payment-amount"
                value={amount}
                onChange={setAmount}
                disabled={saving}
              />
              <RootsFormDateField
                label="Fecha de cobro"
                id="payment-date"
                value={paidAt}
                onChange={setPaidAt}
                disabled={saving}
              />
              <div className="space-y-1">
                <label
                  htmlFor="payment-method"
                  className="text-sm font-medium leading-none text-foreground"
                >
                  Medio de pago (opcional)
                </label>
                <select
                  id="payment-method"
                  className="flex h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                  value={paymentMethodKey}
                  onChange={(e) => setPaymentMethodKey(e.target.value)}
                  disabled={saving}
                >
                  <option value="">—</option>
                  {paymentMethods.map((pm) => (
                    <option
                      key={treasuryPaymentOptionKey(pm)}
                      value={treasuryPaymentOptionKey(pm)}
                    >
                      {pm.label}
                    </option>
                  ))}
                </select>
              </div>
              {selectedMethod?.kind === "check" ? (
                <CheckUpsertFormFields
                  popId={popId}
                  idPrefix="service-charge-check"
                  form={checkForm}
                  setForm={setCheckForm}
                  hideAmount
                />
              ) : null}
              <RootsFormTextareaField
                label="Notas"
                id="payment-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={saving}
                rows={2}
              />
            </div>
          </RootsDialogBody>
          <RootsDialogDualActionFooter
            onCancel={() => onOpenChange(false)}
            confirmLabel="Registrar cobro"
            confirmLoadingLabel="Guardando…"
            confirmType="submit"
            confirmDisabled={saving}
            confirmLoading={saving}
          />
        </RootsDialogForm>
      </RootsDialogContent>
    </Dialog>
  )
}
