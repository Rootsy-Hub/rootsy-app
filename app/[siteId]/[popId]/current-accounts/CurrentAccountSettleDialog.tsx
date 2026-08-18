"use client"

import {
  settlePopCurrentAccount,
  type CurrentAccountOpenDocument,
} from "@/app/[siteId]/[popId]/current-accounts/actions"
import {
  currentAccountSettleTotals,
  emptyCurrentAccountSettleDraft,
  initCurrentAccountSettleDraft,
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
import {
  RootsFormCheckboxChoiceRow,
  RootsFormDateField,
  RootsFormMoneyField,
  RootsFormTextareaField,
  rootsFormCheckboxChoiceListClass,
  rootsFormColumnClass,
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
  const settlingRef = useRef(false)

  useEffect(() => {
    if (!open) return
    setDraft(initCurrentAccountSettleDraft(documents))
    setStep("allocate")
    setBanner(null)
    setSaving(false)
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
    if (totals.total <= 0.009) {
      setBanner("El cobro o pago tiene que ser mayor a cero.")
      return
    }
    if (!treasury) {
      setBanner("No se pudieron cargar los medios de cobro o pago.")
      return
    }
    setBanner(null)
    setStep("payment")
  }

  const handlePayment = async (selection: PaymentMethodSelection) => {
    settlingRef.current = true
    setSaving(true)
    setBanner(null)
    const selected = new Set(draft.selectedIds)
    const applications = openDocuments
      .filter((document) => selected.has(document.id))
      .map((document) => ({
        documentId: document.id,
        amount: Math.min(
          parseMoneyInput(draft.amounts[document.id] ?? "", 0),
          document.remaining,
        ),
      }))
      .filter((row) => row.amount > 0.009)

    const res = await settlePopCurrentAccount(popId, {
      direction,
      partyId,
      paidAt: draft.paidAt,
      paymentKind: selection.kind,
      treasuryAccountId: selection.treasuryAccountId,
      checkDetails: selection.checkDetails,
      applications,
      extraAmount: totals.extra,
      notes: draft.notes,
    })
    setSaving(false)
    if (!res.success) {
      settlingRef.current = false
      setBanner(res.error)
      setStep("allocate")
      return
    }
    onOpenChange(false)
    onSettled()
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
                <p className="text-sm font-medium tabular-nums text-rootsy-bruma-800">
                  Total {moneyFormatter.format(totals.total)}
                </p>
              </div>
            </RootsDialogBody>
            <RootsDialogDualActionFooter
              cancelLabel="Cancelar"
              confirmLabel="Continuar"
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
        selected={null}
        payOnAccount={false}
        onSelectImmediate={(selection) => {
          if (!selection) return
          void handlePayment(selection)
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
      />
    </>
  )
}
