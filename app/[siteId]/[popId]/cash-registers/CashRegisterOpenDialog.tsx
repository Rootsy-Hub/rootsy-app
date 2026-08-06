"use client"

import {
  CheckoutMoneyValueField,
  CheckoutSectionLabel,
  CheckoutSectionPanel,
} from "@/components/checkout/CheckoutFormFields"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { Dialog } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { rootsFormTextareaFieldClass } from "@/components/rootsy-form/rootsFormStyles"
import { isMoneyInputComplete } from "@/lib/moneyInput"
import { cn } from "@/lib/utils"
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="default">
        <RootsDialogHeader
          title={registerName ? `Abrir turno en ${registerName}` : "Abrir turno"}
          description="Efectivo inicial y nota opcional al abrir el turno."
          descriptionHidden
        />
        <RootsDialogForm onSubmit={onSubmit}>
          <RootsDialogBody className="space-y-4">
            {banner ? <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner> : null}
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
                  className={cn(rootsFormTextareaFieldClass, "min-h-[88px] resize-y")}
                />
              </div>
            </CheckoutSectionPanel>
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
