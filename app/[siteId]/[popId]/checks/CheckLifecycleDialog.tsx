"use client"

import type { CheckTableRow } from "@/app/[siteId]/[popId]/checks/actions"
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
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormTextareaField,
  rootsFormColumnClass,
} from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import {
  checkLifecycleActionLabel,
  type CheckLifecycleAction,
} from "@/lib/checkDocuments"
import { toISODateLocal } from "@/lib/dataWorkspaceDateFilter"
import { cn } from "@/lib/utils"
import { useEffect, useState, type FormEvent } from "react"

export type CheckLifecycleBankOption = {
  id: string
  name: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: CheckLifecycleAction | null
  check: CheckTableRow | null
  banks: CheckLifecycleBankOption[]
  saving?: boolean
  banner?: string | null
  onSubmit: (input: {
    treasuryAccountId: string
    actionDate: string
    reason: string
  }) => void
}

function dialogCopy(
  action: CheckLifecycleAction,
  direction: CheckTableRow["direction"],
): { title: string; description: string; confirmLabel: string } {
  const label = checkLifecycleActionLabel(action, direction)
  if (action === "deposit") {
    return {
      title: label,
      description:
        direction === "issued"
          ? "Sale de documentos a pagar y se debita del banco o billetera."
          : "Sale de documentos por cobrar y entra al banco o billetera.",
      confirmLabel: label,
    }
  }
  if (action === "clear") {
    return {
      title: "Acreditar cheque",
      description:
        "Confirmá que el banco acreditó el cheque. El movimiento a tesorería ya se registró al depositarlo.",
      confirmLabel: "Acreditar",
    }
  }
  if (action === "reject") {
    return {
      title: "Rechazar cheque",
      description:
        "El documento se cancela y la deuda vuelve a la cuenta corriente. El motivo es opcional.",
      confirmLabel: "Rechazar",
    }
  }
  return {
    title: "Anular cheque",
    description:
      "Solo si todavía está en cartera. Se anula el documento y la deuda vuelve a la cuenta corriente.",
    confirmLabel: "Anular",
  }
}

export function CheckLifecycleDialog({
  open,
  onOpenChange,
  action,
  check,
  banks,
  saving = false,
  banner,
  onSubmit,
}: Props) {
  const [actionDate, setActionDate] = useState(toISODateLocal(new Date()))
  const [treasuryAccountId, setTreasuryAccountId] = useState("")
  const [reason, setReason] = useState("")

  useEffect(() => {
    if (!open) return
    setActionDate(toISODateLocal(new Date()))
    setTreasuryAccountId(banks.length === 1 ? banks[0]!.id : "")
    setReason("")
  }, [open, banks])

  if (!action || !check) return null

  const copy = dialogCopy(action, check.direction)
  const needsBank = action === "deposit"
  const needsDate = action !== "void"
  const needsReason = action === "reject"

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit({ treasuryAccountId, actionDate, reason })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="default" className="sm:max-w-md">
        <RootsDialogHeader
          title={copy.title}
          description={`${check.checkNumber} · ${check.bankName}`}
        />
        <RootsDialogForm onSubmit={handleSubmit}>
          <RootsDialogBody>
            {banner ? (
              <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner>
            ) : null}
            <div className={cn(rootsFormColumnClass, "gap-4")}>
              <p className="text-sm leading-relaxed text-rootsy-bruma-500">
                {copy.description}
              </p>
              {needsBank ? (
                banks.length === 0 ? (
                  <RootsDialogErrorBanner>
                    Configurá una cuenta banco o billetera en Cuentas.
                  </RootsDialogErrorBanner>
                ) : (
                  <RootsFormSelectField
                    id="check-lifecycle-bank"
                    label={
                      check.direction === "issued"
                        ? "Banco origen"
                        : "Banco destino"
                    }
                    value={treasuryAccountId}
                    onValueChange={setTreasuryAccountId}
                  >
                    {banks.map((bank) => (
                      <RootsFormSelectItem key={bank.id} value={bank.id}>
                        {bank.name}
                      </RootsFormSelectItem>
                    ))}
                  </RootsFormSelectField>
                )
              ) : null}
              {needsDate ? (
                <RootsFormDateField
                  id="check-lifecycle-date"
                  label={
                    action === "deposit"
                      ? "Fecha de depósito"
                      : action === "clear"
                        ? "Fecha de acreditación"
                        : "Fecha de rechazo"
                  }
                  value={actionDate}
                  onChange={setActionDate}
                  disabled={saving}
                />
              ) : null}
              {needsReason ? (
                <RootsFormTextareaField
                  id="check-lifecycle-reason"
                  label="Motivo"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Opcional"
                  disabled={saving}
                  rows={2}
                />
              ) : null}
            </div>
          </RootsDialogBody>
          <RootsDialogDualActionFooter
            onCancel={() => onOpenChange(false)}
            confirmLabel={copy.confirmLabel}
            confirmLoadingLabel="Guardando…"
            confirmType="submit"
            confirmDisabled={saving || (needsBank && !treasuryAccountId)}
            confirmLoading={saving}
            destructive={action === "reject" || action === "void"}
          />
        </RootsDialogForm>
      </RootsDialogContent>
    </Dialog>
  )
}
