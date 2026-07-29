"use client"

import { CheckoutDialogFooter } from "@/components/checkout/CheckoutDialogFooter"
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

type DiscountMode = "porcentaje" | "fijo"

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

function DiscountModeSegment({
  mode,
  disabled,
  fixedAmountDisabled,
  onChange,
}: {
  mode: DiscountMode
  disabled: boolean
  fixedAmountDisabled: boolean
  onChange: (mode: DiscountMode) => void
}) {
  const segmentClass = (selected: boolean, optionDisabled: boolean) =>
    cn(
      "inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-150",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      optionDisabled && "pointer-events-none opacity-45",
      selected
        ? "bg-primary/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
    )

  return (
    <div
      role="group"
      aria-label="Tipo de descuento"
      className="grid grid-cols-2 gap-1 rounded-xl border border-border/70 bg-muted/15 p-1"
    >
      <button
        type="button"
        disabled={disabled}
        aria-pressed={mode === "porcentaje"}
        className={segmentClass(mode === "porcentaje", disabled)}
        onClick={() => onChange("porcentaje")}
      >
        <Percent className="size-4" aria-hidden />
        Porcentaje
      </button>
      <button
        type="button"
        disabled={fixedAmountDisabled}
        aria-pressed={mode === "fijo"}
        className={segmentClass(mode === "fijo", fixedAmountDisabled)}
        onClick={() => onChange("fijo")}
      >
        <Banknote className="size-4" aria-hidden />
        Monto fijo
      </button>
    </div>
  )
}

/** Campo de valor numérico (monto / porcentaje), no un text input de formulario. */
function DiscountValueField({
  id,
  mode,
  value,
  disabled,
  onChange,
}: {
  id: string
  mode: DiscountMode
  value: string
  disabled: boolean
  onChange: (raw: string) => void
}) {
  const suffix = mode === "porcentaje" ? "%" : "$"
  const Icon = mode === "porcentaje" ? Percent : Banknote

  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-muted/15 transition-all duration-150",
        "focus-within:border-primary/45 focus-within:ring-2 focus-within:ring-primary/20",
        disabled && "opacity-50",
      )}
    >
      <label htmlFor={id} className="sr-only">
        {mode === "porcentaje" ? "Porcentaje de descuento" : "Monto fijo de descuento"}
      </label>
      <div className="flex items-center gap-3 px-3.5 py-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
          <Icon className="size-[18px]" aria-hidden />
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={mode === "porcentaje" ? "0" : "0"}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-2xl font-semibold leading-none tabular-nums tracking-tight text-foreground outline-none",
            "placeholder:text-muted-foreground/40",
          )}
        />
        <span
          className="shrink-0 text-lg font-semibold tabular-nums text-muted-foreground"
          aria-hidden
        >
          {suffix}
        </span>
      </div>
    </div>
  )
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

          <div className="space-y-4 rounded-xl border border-border/50 bg-muted/10 p-3.5">
            <div className="space-y-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Tipo
              </p>
              <DiscountModeSegment
                mode={draftMode}
                disabled={disabled}
                fixedAmountDisabled={fixedAmountDisabled}
                onChange={onDraftModeChange}
              />
            </div>

            <div className="space-y-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Valor
              </p>
              <DiscountValueField
                id={valueFieldId}
                mode={draftMode}
                value={draftText}
                disabled={valueDisabled}
                onChange={handleDraftChange}
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
          </div>
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
