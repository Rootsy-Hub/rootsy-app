"use client"

import { CheckoutDialogFooter } from "@/components/checkout/CheckoutDialogFooter"
import {
  CheckoutDiscountModeSegment,
  CheckoutNumericValueField,
  CheckoutSectionLabel,
  CheckoutSectionPanel,
  type CheckoutDiscountMode,
} from "@/components/checkout/CheckoutFormFields"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { discountDialogTitle } from "@/lib/operationPartyPicker"
import { cn } from "@/lib/utils"
import {
  saleOpDialogBody,
  saleOpDialogContentMd,
  saleOpDialogHeader,
  saleOpFmt,
  saleOpImporteBaseClass,
} from "@/components/sale-operation/saleOperationStyles"
import { Banknote, Percent } from "lucide-react"
import { useId } from "react"

type DiscountMode = CheckoutDiscountMode

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  context?: "venta" | "mesa" | "pedido" | "compra"
  subtotal: number
  draftMode: DiscountMode
  onDraftModeChange: (mode: DiscountMode) => void
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
  const valueFieldId = useId()
  const fixedAmountDisabled = disabled || subtotal === 0
  const valueDisabled =
    disabled || (draftMode === "fijo" && subtotal === 0)

  const handleDraftChange = (raw: string) => {
    if (!/^\d*$/.test(raw)) return
    if (raw === "") {
      onDraftTextChange("")
      return
    }
    if (draftMode === "fijo" && subtotal > 0 && Number(raw) > subtotal) {
      onDraftModeChange("porcentaje")
      onDraftTextChange("100")
      return
    }
    const nextValue =
      draftMode === "porcentaje" ? String(Math.min(100, Number(raw))) : raw
    onDraftTextChange(nextValue)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={saleOpDialogContentMd}>
        <DialogHeader className={cn(saleOpDialogHeader, "shrink-0")}>
          <DialogTitle className="text-base font-semibold tracking-tight">
            {discountDialogTitle(context)}
          </DialogTitle>
        </DialogHeader>

        <div
          className={cn(
            saleOpDialogBody,
            "min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain",
          )}
        >
          {disabled && disabledReason ? (
            <p
              role="alert"
              className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3.5 py-2.5 text-sm text-amber-800 dark:text-amber-200"
            >
              {disabledReason}
            </p>
          ) : null}

          <CheckoutSectionPanel>
            <div className="space-y-2.5">
              <CheckoutSectionLabel>Tipo</CheckoutSectionLabel>
              <CheckoutDiscountModeSegment
                mode={draftMode}
                disabled={disabled}
                fixedAmountDisabled={fixedAmountDisabled}
                onChange={onDraftModeChange}
              />
            </div>

            <div className="space-y-2.5">
              <CheckoutSectionLabel>Valor</CheckoutSectionLabel>
              <CheckoutNumericValueField
                id={valueFieldId}
                icon={draftMode === "porcentaje" ? Percent : Banknote}
                value={draftText}
                disabled={valueDisabled}
                onChange={handleDraftChange}
                suffix={draftMode === "porcentaje" ? "%" : "$"}
                ariaLabel={
                  draftMode === "porcentaje"
                    ? "Porcentaje de descuento"
                    : "Monto fijo de descuento"
                }
              />
              {draftMode === "fijo" && subtotal > 0 ? (
                <p className="px-0.5 text-xs text-muted-foreground">
                  Máximo sobre el subtotal:{" "}
                  <span className={saleOpImporteBaseClass}>
                    {saleOpFmt.format(subtotal)}
                  </span>
                </p>
              ) : null}
              {draftMode === "fijo" && subtotal === 0 ? (
                <p className="px-0.5 text-xs text-muted-foreground">
                  Agregá ítems al carrito para usar monto fijo.
                </p>
              ) : null}
            </div>
          </CheckoutSectionPanel>
        </div>

        <CheckoutDialogFooter
          secondaryAction={{
            label: "Quitar descuento",
            onClick: onClear,
            disabled,
          }}
          primary={{ label: "Aplicar", onClick: onApply, disabled }}
        />
      </DialogContent>
    </Dialog>
  )
}
