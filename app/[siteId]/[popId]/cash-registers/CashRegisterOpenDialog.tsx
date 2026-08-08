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
  const canSubmit = isMoneyInputComplete(openingCash)
  const dialogTitle = registerName
    ? `Abrir turno en ${registerName}`
    : "Abrir turno"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="default">
        <RootsDialogHeader title={dialogTitle} />
        <RootsDialogForm onSubmit={onSubmit}>
          <RootsDialogBody className="space-y-4">
            {banner ? <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner> : null}

            <RootsFormMoneyField
              label="Efectivo contado al abrir"
              id="cr-open-cash"
              value={openingCash}
              onChange={onOpeningCashChange}
              autoFocus
            />

            <RootsFormTextareaField
              label="Nota (opcional)"
              id="cr-open-note"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Ej. vales del turno anterior, diferencias al contar…"
              rows={3}
              textareaClassName="min-h-[88px] resize-y"
            />
          </RootsDialogBody>

          <RootsDialogDualActionFooter
            onCancel={() => onOpenChange(false)}
            confirmLabel="Abrir turno"
            confirmLoadingLabel="Abriendo…"
            confirmType="submit"
            confirmDisabled={!canSubmit}
            confirmLoading={saving}
          />
        </RootsDialogForm>
      </RootsDialogContent>
    </Dialog>
  )
}
