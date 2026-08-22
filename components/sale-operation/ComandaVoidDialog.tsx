"use client"

import {
  CheckoutSectionLabel,
  CheckoutSectionPanel,
} from "@/components/checkout/CheckoutFormFields"
import {
  saleFinalizeDialogPartialStepperButtonClass,
  saleFinalizeDialogPartialStepperClass,
} from "@/components/checkout/saleFinalizeDialogStyles"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { RootsFormControlTextarea } from "@/components/rootsy-form/RootsFormControlTextarea"
import { Dialog } from "@/components/ui/dialog"
import { Minus, Plus } from "lucide-react"
import { useEffect, useState } from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemName: string
  maxQuantity: number
  submitting?: boolean
  submitError?: string | null
  onConfirm: (input: { quantity: number; comment: string }) => void | Promise<void>
}

export function ComandaVoidDialog({
  open,
  onOpenChange,
  itemName,
  maxQuantity,
  submitting = false,
  submitError = null,
  onConfirm,
}: Props) {
  const maxQty = Math.max(1, Math.round(maxQuantity))
  const [quantity, setQuantity] = useState(maxQty)
  const [comment, setComment] = useState("")

  useEffect(() => {
    if (!open) return
    setQuantity(maxQty)
    setComment("")
  }, [open, maxQty])

  const qty = Math.min(maxQty, Math.max(1, quantity))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent className="flex flex-col">
        <RootsDialogHeader title="Anular ítem" />

        <RootsDialogBody className="space-y-4">
          {submitError ? (
            <RootsDialogErrorBanner>{submitError}</RootsDialogErrorBanner>
          ) : null}

          <CheckoutSectionPanel className="space-y-3">
            <p className="font-canopy text-sm font-semibold text-[var(--rootsy-bruma-900)]">
              {itemName}
            </p>
            <p className="font-canopy text-sm text-[var(--rootsy-bruma-600)]">
              Cocina va a recibir una comanda de anulación. El ítem queda en el
              ticket tachado y no se cobra.
            </p>
            {maxQty > 1 ? (
              <div className="space-y-2">
                <CheckoutSectionLabel>Unidades a anular</CheckoutSectionLabel>
                <div className={saleFinalizeDialogPartialStepperClass}>
                  <button
                    type="button"
                    aria-label={`Quitar una unidad de ${itemName}`}
                    disabled={qty <= 1 || submitting}
                    onClick={() => setQuantity(qty - 1)}
                    className={saleFinalizeDialogPartialStepperButtonClass}
                  >
                    <Minus className="size-3.5" aria-hidden />
                  </button>
                  <span className="min-w-5 text-center font-numeric text-xs tabular-nums text-[var(--rootsy-bruma-700)]">
                    {qty}
                  </span>
                  <button
                    type="button"
                    aria-label={`Agregar una unidad de ${itemName}`}
                    disabled={qty >= maxQty || submitting}
                    onClick={() => setQuantity(qty + 1)}
                    className={saleFinalizeDialogPartialStepperButtonClass}
                  >
                    <Plus className="size-3.5" aria-hidden />
                  </button>
                </div>
              </div>
            ) : null}
            <RootsFormControlTextarea
              rows={2}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Nota para cocina (opcional)"
            />
          </CheckoutSectionPanel>
        </RootsDialogBody>

        <RootsDialogDualActionFooter
          destructive
          onCancel={() => onOpenChange(false)}
          cancelLabel="Volver"
          confirmLabel="Anular y avisar"
          confirmLoadingLabel="Anulando…"
          onConfirm={() => void onConfirm({ quantity: qty, comment })}
          confirmDisabled={submitting}
          confirmLoading={submitting}
        />
      </RootsDialogContent>
    </Dialog>
  )
}
