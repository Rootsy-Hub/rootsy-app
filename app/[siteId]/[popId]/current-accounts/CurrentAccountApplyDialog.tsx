"use client"

import {
  applyPopCurrentAccountCredit,
  type CurrentAccountOpenDocument,
} from "@/app/[siteId]/[popId]/current-accounts/actions"
import {
  currentAccountSettleTotals,
  emptyCurrentAccountSettleDraft,
  initCurrentAccountSettleDraft,
  type CurrentAccountSettleDraft,
} from "@/app/[siteId]/[popId]/current-accounts/currentAccountSettleFormState"
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
  RootsFormMoneyField,
  rootsFormCheckboxChoiceListClass,
  rootsFormColumnClass,
} from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import {
  currentAccountOpenDocumentAgingLabel,
  type CurrentAccountDirection,
} from "@/lib/currentAccounts"
import { formatMoneyInputForField, parseMoneyInput } from "@/lib/moneyInput"
import { cn } from "@/lib/utils"
import { useEffect, useMemo, useState, type FormEvent } from "react"

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
  unappliedCredit: number
  documents: CurrentAccountOpenDocument[]
  onApplied: () => void
}

export function CurrentAccountApplyDialog({
  open,
  onOpenChange,
  popId,
  direction,
  partyId,
  partyName,
  unappliedCredit,
  documents,
  onApplied,
}: Props) {
  const [draft, setDraft] = useState<CurrentAccountSettleDraft>(
    emptyCurrentAccountSettleDraft,
  )
  const [banner, setBanner] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setDraft(initCurrentAccountSettleDraft(documents))
    setBanner(null)
    setSaving(false)
  }, [documents, open])

  const totals = useMemo(
    () => currentAccountSettleTotals(draft, documents),
    [documents, draft],
  )
  const openDocuments = useMemo(
    () => documents.filter((document) => document.remaining > 0.009),
    [documents],
  )
  const applied = Math.min(totals.applied, unappliedCredit)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (applied <= 0.009) {
      setBanner("Elegí a qué comprobantes imputar.")
      return
    }
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

    const res = await applyPopCurrentAccountCredit(popId, {
      direction,
      partyId,
      applications,
    })
    setSaving(false)
    if (!res.success) {
      setBanner(res.error)
      return
    }
    onOpenChange(false)
    onApplied()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="default" className="sm:max-w-lg">
        <RootsDialogHeader
          title="Imputar a cuenta"
          description={`Hay ${moneyFormatter.format(unappliedCredit)} a cuenta de ${partyName}. Marcá a qué comprobantes aplica.`}
          open={open}
        />
        <RootsDialogForm onSubmit={handleSubmit}>
          <RootsDialogBody>
            {banner ? (
              <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner>
            ) : null}
            <div className={cn(rootsFormColumnClass, "gap-4")}>
              {openDocuments.length > 0 ? (
                <div className={rootsFormCheckboxChoiceListClass}>
                  {openDocuments.map((document) => {
                    const checked = draft.selectedIds.includes(document.id)
                    return (
                      <div
                        key={document.id}
                        className="rounded-xl border border-rootsy-bruma-200 bg-white px-2 py-1"
                      >
                        <RootsFormCheckboxChoiceRow
                          label={document.documentLabel}
                          description={`${formatIsoDate(document.date)} · ${currentAccountOpenDocumentAgingLabel(document.daysOverdue)} · ${moneyFormatter.format(document.remaining)}`}
                          checked={checked}
                          disabled={saving}
                          onCheckedChange={(value) => {
                            setDraft((current) => {
                              const selectedIds = value
                                ? current.selectedIds.includes(document.id)
                                  ? current.selectedIds
                                  : [...current.selectedIds, document.id]
                                : current.selectedIds.filter(
                                    (id) => id !== document.id,
                                  )
                              const amounts = { ...current.amounts }
                              if (
                                value &&
                                !String(amounts[document.id] ?? "").trim()
                              ) {
                                amounts[document.id] = formatMoneyInputForField(
                                  document.remaining,
                                )
                              }
                              return { ...current, selectedIds, amounts }
                            })
                          }}
                        />
                        {checked ? (
                          <div className="px-2 pb-3">
                            <RootsFormMoneyField
                              id={`ca-apply-amount-${document.id}`}
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
                  No hay comprobantes abiertos para imputar.
                </p>
              )}
              <p className="text-sm font-medium tabular-nums text-rootsy-bruma-800">
                Se imputan {moneyFormatter.format(applied)}
              </p>
            </div>
          </RootsDialogBody>
          <RootsDialogDualActionFooter
            cancelLabel="Cancelar"
            confirmLabel="Imputar"
            confirmType="submit"
            confirmDisabled={saving || applied <= 0.009}
            confirmLoading={saving}
            onCancel={() => onOpenChange(false)}
          />
        </RootsDialogForm>
      </RootsDialogContent>
    </Dialog>
  )
}
