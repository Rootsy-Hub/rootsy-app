"use client"

import { CheckoutDialogFooter } from "@/components/checkout/CheckoutDialogFooter"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import {
  RootsFormDiscountField,
  type RootsFormDiscountMode,
} from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import { discountDialogTitle } from "@/lib/operationPartyPicker"
import { parseMoneyInput } from "@/lib/moneyInput"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  context?: "venta" | "mesa" | "pedido" | "compra"
  subtotal: number
  draftMode: RootsFormDiscountMode
  onDraftModeChange: (mode: RootsFormDiscountMode) => void
  draftText: string
  onDraftTextChange: (value: string) => void
  onApply: () => void
  onClear: () => void
  disabled?: boolean
  disabledReason?: string
}

export function GeneralDiscountDialog({
  open,
  onOpenChange,
  context = "venta",
  subtotal,
  draftMode,
  onDraftModeChange,
  draftText,
  onDraftTextChange,
  onApply,
  onClear,
  disabled = false,
  disabledReason,
}: Props) {
  const fixedAmountDisabled = disabled || subtotal === 0

  const handleValueChange = (raw: string) => {
    if (draftMode === "fijo" && subtotal > 0) {
      const parsed = parseMoneyInput(raw, Number.NaN)
      if (Number.isFinite(parsed) && parsed > subtotal) {
        onDraftModeChange("porcentaje")
        onDraftTextChange("100")
        return
      }
    }

    onDraftTextChange(raw)
  }

  const discountHint =
    draftMode === "fijo" && subtotal === 0
      ? "Agregá ítems al carrito para usar monto fijo."
      : draftMode === "fijo" && subtotal > 0
        ? `Máximo sobre el subtotal: ${saleOpFmt.format(subtotal)}`
        : undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent className="flex flex-col">
        <RootsDialogHeader title={discountDialogTitle(context)} />

        <RootsDialogBody className="space-y-4">
          {disabled && disabledReason ? (
            <p
              role="alert"
              className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3.5 py-2.5 text-sm text-amber-800"
            >
              {disabledReason}
            </p>
          ) : null}

          <RootsFormDiscountField
            label="Descuento"
            mode={draftMode}
            onModeChange={onDraftModeChange}
            value={draftText}
            onChange={handleValueChange}
            onClear={() => onDraftTextChange("")}
            disabled={disabled}
            fixedAmountDisabled={fixedAmountDisabled}
            hint={discountHint}
          />
        </RootsDialogBody>

        <CheckoutDialogFooter
          secondaryAction={{
            label: "Quitar descuento",
            onClick: onClear,
            disabled,
          }}
          primary={{ label: "Aplicar", onClick: onApply, disabled }}
        />
      </RootsDialogContent>
    </Dialog>
  )
}
