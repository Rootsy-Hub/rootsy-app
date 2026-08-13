"use client"

import { CheckoutDialogFooter } from "@/components/checkout/CheckoutDialogFooter"
import {
  CheckoutMoneyValueField,
  CheckoutNumericValueField,
  CheckoutSectionLabel,
  CheckoutSectionPanel,
  type CheckoutDiscountMode,
} from "@/components/checkout/CheckoutFormFields"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { RootsFormSegmentField } from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import { discountDialogTitle } from "@/lib/operationPartyPicker"
import { formatMoneyInputForField, parseMoneyInput } from "@/lib/moneyInput"
import { saleOpFmt, saleOpImporteBaseClass } from "@/components/sale-operation/saleOperationStyles"
import { Percent } from "lucide-react"
import { useId } from "react"

type DiscountMode = CheckoutDiscountMode

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  context?: "venta" | "mesa" | "pedido" | "compra" | "cargo"
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

  const handlePercentChange = (raw: string) => {
    if (!/^\d*$/.test(raw)) return
    if (raw === "") {
      onDraftTextChange("")
      return
    }
    onDraftTextChange(String(Math.min(100, Number(raw))))
  }

  const handleFixedAmountChange = (raw: string) => {
    if (subtotal > 0) {
      const parsed = parseMoneyInput(raw, Number.NaN)
      if (Number.isFinite(parsed) && parsed > subtotal) {
        onDraftModeChange("porcentaje")
        onDraftTextChange("100")
        return
      }
    }
    onDraftTextChange(raw)
  }

  const handleModeChange = (value: string) => {
    const mode = value as DiscountMode
    if (mode === "fijo" && draftText.trim()) {
      const parsed = parseMoneyInput(draftText, Number.NaN)
      if (Number.isFinite(parsed)) {
        onDraftTextChange(formatMoneyInputForField(parsed))
      }
    } else if (mode === "porcentaje" && draftText.trim()) {
      const parsed = parseMoneyInput(draftText, Number.NaN)
      if (Number.isFinite(parsed)) {
        onDraftTextChange(String(Math.min(100, Math.round(parsed))))
      }
    }
    onDraftModeChange(mode)
  }

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

          <CheckoutSectionPanel>
            <RootsFormSegmentField
              label="Tipo"
              value={draftMode}
              onValueChange={handleModeChange}
              disabled={disabled}
              options={[
                {
                  value: "porcentaje",
                  label: (
                    <>
                      <Percent className="size-4" aria-hidden />
                      Porcentaje
                    </>
                  ),
                },
                {
                  value: "fijo",
                  label: (
                    <>
                      <span
                        className="text-sm font-semibold tabular-nums"
                        aria-hidden
                      >
                        $
                      </span>
                      Monto fijo
                    </>
                  ),
                  disabled: fixedAmountDisabled,
                },
              ]}
            />

            <div className="space-y-2.5">
              <CheckoutSectionLabel htmlFor={valueFieldId}>Valor</CheckoutSectionLabel>
              {draftMode === "porcentaje" ? (
                <CheckoutNumericValueField
                  id={valueFieldId}
                  icon={Percent}
                  value={draftText}
                  disabled={valueDisabled}
                  onChange={handlePercentChange}
                  suffix="%"
                  ariaLabel="Porcentaje de descuento"
                />
              ) : (
                <CheckoutMoneyValueField
                  id={valueFieldId}
                  value={draftText}
                  disabled={valueDisabled}
                  onChange={handleFixedAmountChange}
                  ariaLabel="Monto fijo de descuento"
                />
              )}
              {draftMode === "fijo" && subtotal > 0 ? (
                <p className="px-0.5 text-xs text-[var(--rootsy-bruma-500)]">
                  Máximo sobre el subtotal:{" "}
                  <span className={saleOpImporteBaseClass}>
                    {saleOpFmt.format(subtotal)}
                  </span>
                </p>
              ) : null}
              {draftMode === "fijo" && subtotal === 0 ? (
                <p className="px-0.5 text-xs text-[var(--rootsy-bruma-500)]">
                  Agregá ítems al carrito para usar monto fijo.
                </p>
              ) : null}
            </div>
          </CheckoutSectionPanel>
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
