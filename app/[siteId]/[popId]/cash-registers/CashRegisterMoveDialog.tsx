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
  RootsFormMoneyField,
  RootsFormTextareaField,
} from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import { isMoneyInputComplete } from "@/lib/moneyInput"
import type { FormEvent } from "react"

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
  const labels = copy[kind]
  const canSubmit = isMoneyInputComplete(amount)
  const dialogTitle = registerName
    ? `${labels.title} en ${registerName}`
    : labels.title

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="default">
        <RootsDialogHeader title={dialogTitle} />
        <RootsDialogForm onSubmit={onSubmit}>
          <RootsDialogBody className="space-y-4">
            {banner ? <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner> : null}

            <RootsFormMoneyField
              label={labels.amountLabel}
              id="cr-move-amount"
              value={amount}
              onChange={onAmountChange}
              hint={labels.hint}
              autoFocus
            />

            <RootsFormTextareaField
              label="Nota (opcional)"
              id="cr-move-note"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Ej. cambio para vuelto, retiro a caja fuerte…"
              rows={3}
              textareaClassName="min-h-[88px] resize-y"
            />
          </RootsDialogBody>

          <RootsDialogDualActionFooter
            onCancel={() => onOpenChange(false)}
            confirmLabel={labels.primary}
            confirmLoadingLabel={labels.loading}
            confirmType="submit"
            confirmDisabled={!canSubmit}
            confirmLoading={saving}
          />
        </RootsDialogForm>
      </RootsDialogContent>
    </Dialog>
  )
}
