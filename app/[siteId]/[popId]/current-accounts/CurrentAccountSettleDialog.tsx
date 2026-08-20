"use client"

import {
  settlePopCurrentAccount,
  type CurrentAccountOpenDocument,
} from "@/app/[siteId]/[popId]/current-accounts/actions"
import {
  currentAccountSettleTotals,
  emptyCurrentAccountSettleDraft,
  initCurrentAccountSettleDraft,
  normalizeCurrentAccountSettleDraft,
  type CurrentAccountSettleDraft,
} from "@/app/[siteId]/[popId]/current-accounts/currentAccountSettleFormState"
import { PaymentMethodDialog } from "@/components/payment/PaymentMethodDialog"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { RootsDefaultButton } from "@/components/rootsy-button"
import {
  RootsFormCheckboxChoiceRow,
  RootsFormDateField,
  RootsFormMoneyField,
  RootsFormTextareaField,
  rootsFormCheckboxChoiceListClass,
  rootsFormColumnClass,
  rootsFormFieldLabelTypographyClass,
} from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import {
  currentAccountOpenDocumentAgingLabel,
  type CurrentAccountDirection,
} from "@/lib/currentAccounts"
import { formatMoneyInputForField, parseMoneyInput } from "@/lib/moneyInput"
import type { PaymentMethodSelection } from "@/lib/paymentMethodCheckout"
import {
  getTreasuryPaymentContext,
  type TreasuryPaymentContext,
} from "@/lib/treasuryPaymentContext"
import { cn } from "@/lib/utils"
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"

const moneyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

function formatIsoDate(iso: string) {
  if (!iso) return "—"
  const date = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  popId: string
  direction: CurrentAccountDirection
  partyId: string
  partyName: string
  documents: CurrentAccountOpenDocument[]
  onSettled: () => void
}

export function CurrentAccountSettleDialog({
  open,
  onOpenChange,
  popId,
  direction,
  partyId,
  partyName,
  documents,
  onSettled,
}: Props) {
  const isPayable = direction === "payable"
  const [step, setStep] = useState<"allocate" | "payment">("allocate")
  const [draft, setDraft] = useState<CurrentAccountSettleDraft>(
    emptyCurrentAccountSettleDraft,
  )
  const [treasury, setTreasury] = useState<TreasuryPaymentContext | null>(null)
  const [banner, setBanner] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [paymentSelection, setPaymentSelection] =
    useState<PaymentMethodSelection | null>(null)
  const settlingRef = useRef(false)
  const wasOpenRef = useRef(false)

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false
      settlingRef.current = false
      return
    }
    const openedNow = !wasOpenRef.current
    wasOpenRef.current = true
    if (!openedNow) return
    setDraft(initCurrentAccountSettleDraft(documents))
    setStep("allocate")
    setBanner(null)
    setSaving(false)
    setPaymentSelection(null)
    settlingRef.current = false
    void getTreasuryPaymentContext(popId).then((res) => {
      if (!res.success) {
        setTreasury(null)
        setBanner(res.error)
        return
      }
      setTreasury(res.context)
    })
  }, [documents, open, popId])

  const totals = useMemo(
    () => currentAccountSettleTotals(draft, documents),
    [documents, draft],
  )
  const openDocuments = useMemo(
    () => documents.filter((document) => document.remaining > 0.009),
    [documents],
  )

  const toggleDocument = (document: CurrentAccountOpenDocument, checked: boolean) => {
    setDraft((current) => {
      const selectedIds = checked
        ? current.selectedIds.includes(document.id)
          ? current.selectedIds
          : [...current.selectedIds, document.id]
        : current.selectedIds.filter((id) => id !== document.id)
      const amounts = { ...current.amounts }
      if (checked && !String(amounts[document.id] ?? "").trim()) {
        amounts[document.id] = formatMoneyInputForField(document.remaining)
      }
      return { ...current, selectedIds, amounts }
    })
  }

  const handleAllocateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (saving || settlingRef.current) return
    const normalized = normalizeCurrentAccountSettleDraft(draft, documents)
    const nextTotals = currentAccountSettleTotals(normalized, documents)
    if (nextTotals.total <= 0.009) {
      setBanner("El cobro o pago tiene que ser mayor a cero.")
      return
    }
    if (!treasury) {
      setBanner("No se pudieron cargar los medios de cobro o pago.")
      return
    }
    setDraft(normalized)
    setBanner(null)
    if (paymentSelection) {
      void handlePayment(paymentSelection)
      return
    }
    setStep("payment")
  }

  const handlePayment = async (selection: PaymentMethodSelection) => {
    if (settlingRef.current) return
    settlingRef.current = true
    setSaving(true)
    setBanner(null)
    const normalized = normalizeCurrentAccountSettleDraft(draft, documents)
    const nextTotals = currentAccountSettleTotals(normalized, documents)
    const selected = new Set(normalized.selectedIds)
    const applications = openDocuments
      .filter((document) => selected.has(document.id))
      .map((document) => ({
        documentId: document.id,
        amount: Math.min(
          parseMoneyInput(normalized.amounts[document.id] ?? "", 0),
          document.remaining,
        ),
      }))
      .filter((row) => row.amount > 0.009)

    try {
      const res = await settlePopCurrentAccount(popId, {
        direction,
        partyId,
        paidAt: normalized.paidAt,
        paymentKind: selection.kind,
        treasuryAccountId: selection.treasuryAccountId,
        checkDetails: selection.checkDetails,
        applications,
        extraAmount: nextTotals.onAccount,
        notes: normalized.notes,
      })
      if (!res.success) {
        settlingRef.current = false
        setBanner(res.error)
        setStep("allocate")
        return
      }
      onOpenChange(false)
      onSettled()
    } catch (error: unknown) {
      settlingRef.current = false
      setBanner(
        error instanceof Error ? error.message : "No se pudo registrar el cobro.",
      )
      setStep("allocate")
    } finally {
      setSaving(false)
    }
  }

  const title = isPayable ? "Pagar" : "Cobrar"
  const description = isPayable
    ? `Marcá a qué compras de ${partyName} aplica. Si sobra, queda a cuenta.`
    : `Marcá a qué ventas de ${partyName} aplica. Si sobra, queda a cuenta.`

  return (
    <>
      <Dialog
        open={open && step === "allocate"}
        onOpenChange={(next) => {
          if (!next) onOpenChange(false)
        }}
      >
        <RootsDialogContent size="default" className="sm:max-w-lg">
          <RootsDialogHeader title={title} description={description} open={open} />
          <RootsDialogForm onSubmit={handleAllocateSubmit}>
            <RootsDialogBody>
              {banner ? (
                <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner>
              ) : null}
              <div className={cn(rootsFormColumnClass, "gap-4")}>
                <RootsFormDateField
                  id="ca-settle-date"
                  label={isPayable ? "Fecha de pago" : "Fecha de cobro"}
                  value={draft.paidAt}
                  onChange={(paidAt) =>
                    setDraft((current) => ({ ...current, paidAt }))
                  }
                  disabled={saving}
                />

                {openDocuments.length > 0 ? (
                  <div className={rootsFormCheckboxChoiceListClass}>
                    <p className="text-sm font-medium text-rootsy-bruma-800">
                      Comprobantes abiertos
                    </p>
                    {openDocuments.map((document) => {
                      const checked = draft.selectedIds.includes(document.id)
                      return (
                        <div
                          key={document.id}
                          className="rounded-xl border border-rootsy-bruma-200 bg-white px-2 py-1"
                        >
                          <RootsFormCheckboxChoiceRow
                            label={document.documentLabel}
                            description={`${formatIsoDate(document.date)} · pendiente ${moneyFormatter.format(document.remaining)} · ${currentAccountOpenDocumentAgingLabel(document.daysOverdue)}`}
                            checked={checked}
                            disabled={saving}
                            onCheckedChange={(value) =>
                              toggleDocument(document, value)
                            }
                          />
                          {checked ? (
                            <div className="px-2 pb-3">
                              <RootsFormMoneyField
                                id={`ca-settle-amount-${document.id}`}
                                label="Imputar"
                                hint={`Hasta ${moneyFormatter.format(document.remaining)}`}
                                max={document.remaining}
                                value={draft.amounts[document.id] ?? ""}
                                onChange={(value) =>
                                  setDraft((current) => ({
                                    ...current,
                                    amounts: {
                                      ...current.amounts,
                                      [document.id]: value,
                                    },
                                  }))
                                }
                                disabled={saving}
                              />
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-rootsy-bruma-500">
                    No hay comprobantes abiertos. El importe queda a cuenta.
                  </p>
                )}

                <RootsFormMoneyField
                  id="ca-settle-extra"
                  label="A cuenta"
                  hint="Sobra que no imputás a un comprobante."
                  value={draft.extraAmount}
                  onChange={(extraAmount) =>
                    setDraft((current) => ({ ...current, extraAmount }))
                  }
                  disabled={saving}
                />
                <RootsFormTextareaField
                  id="ca-settle-notes"
                  label="Nota"
                  value={draft.notes}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  disabled={saving}
                />
                <div className="space-y-1 text-sm tabular-nums text-rootsy-bruma-800">
                  <p>Imputado {moneyFormatter.format(totals.applied)}</p>
                  {totals.onAccount > 0.009 ? (
                    <p>
                      A cuenta {moneyFormatter.format(totals.onAccount)}
                      {totals.surplus > 0.009
                        ? ` · incluye excedente ${moneyFormatter.format(totals.surplus)}`
                        : ""}
                    </p>
                  ) : null}
                  <p className="font-medium">
                    Total {moneyFormatter.format(totals.total)}
                  </p>
                </div>

                {paymentSelection ? (
                  <div className="space-y-1.5">
                    <p className={rootsFormFieldLabelTypographyClass}>
                      {isPayable ? "Medio de pago" : "Medio de cobro"}
                    </p>
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-rootsy-bruma-200 bg-white px-3 py-2.5">
                      <p className="min-w-0 truncate text-sm font-medium text-rootsy-bruma-900">
                        {paymentSelection.label}
                      </p>
                      <RootsDefaultButton
                        type="button"
                        disabled={saving}
                        onClick={() => setStep("payment")}
                      >
                        Cambiar
                      </RootsDefaultButton>
                    </div>
                  </div>
                ) : null}
              </div>
            </RootsDialogBody>
            <RootsDialogDualActionFooter
              cancelLabel="Cancelar"
              confirmLabel={
                paymentSelection
                  ? isPayable
                    ? `Pagar ${moneyFormatter.format(totals.total)}`
                    : `Cobrar ${moneyFormatter.format(totals.total)}`
                  : isPayable
                    ? "Elegir medio de pago"
                    : "Elegir medio de cobro"
              }
              confirmType="submit"
              confirmDisabled={saving || totals.total <= 0.009}
              confirmLoading={saving}
              onCancel={() => onOpenChange(false)}
            />
          </RootsDialogForm>
        </RootsDialogContent>
      </Dialog>

      <PaymentMethodDialog
        flow={isPayable ? "purchase" : "sale"}
        open={open && step === "payment"}
        onOpenChange={(next) => {
          if (next) return
          if (settlingRef.current) return
          setStep("allocate")
        }}
        treasuryContext={treasury}
        selected={paymentSelection}
        payOnAccount={false}
        onSelectImmediate={(selection) => {
          if (!selection) return
          setPaymentSelection(selection)
          setStep("allocate")
        }}
        onSelectAccount={() => undefined}
        hideAccountOption
        accountOptionLabel=""
        accountDescription=""
        immediateSectionTitle={isPayable ? "Pago" : "Cobro"}
        cashTreasuryAccountId={treasury?.defaultCashTreasuryAccountId}
        popId={popId}
        defaultPartyName={partyName}
        defaultPartyId={partyId}
        showMenuBack
      />
    </>
  )
}
