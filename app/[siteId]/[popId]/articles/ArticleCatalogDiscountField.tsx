"use client"

import type { ArticleDiscountMode } from "@/lib/articleDiscount"
import {
  articleFormControlShellClass,
  articleFormFieldStackClass,
  articleFormInlineAddonClass,
  articleFormTwoColRowClass,
} from "@/app/[siteId]/[popId]/articles/articleConstants"
import { CheckoutSectionLabel } from "@/components/checkout/CheckoutFormFields"
import { cn } from "@/lib/utils"
import { useId } from "react"

type Props = {
  idPrefix: string
  discountMode: "" | ArticleDiscountMode
  discountValue: string
  onChange: (patch: {
    discountMode?: "" | ArticleDiscountMode
    discountValue?: string
  }) => void
  salePrice: number
  disabled?: boolean
}

type DiscountUiMode = "porcentaje" | "fijo"

function CompactDiscountModeToggle({
  mode,
  disabled,
  fixedAmountDisabled,
  onChange,
}: {
  mode: DiscountUiMode
  disabled?: boolean
  fixedAmountDisabled?: boolean
  onChange: (mode: DiscountUiMode) => void
}) {
  const optionClass = (selected: boolean, optionDisabled: boolean) =>
    cn(
      "inline-flex h-full flex-1 items-center justify-center rounded-lg px-2 text-xs font-semibold transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
      optionDisabled && "pointer-events-none opacity-45",
      selected
        ? "bg-background text-primary shadow-sm"
        : "text-muted-foreground hover:bg-muted/30 hover:text-foreground",
    )

  return (
    <div
      role="group"
      aria-label="Tipo de descuento"
      className={cn(
        articleFormControlShellClass,
        "grid grid-cols-2 gap-1 overflow-hidden p-1",
      )}
    >
      <button
        type="button"
        disabled={disabled}
        aria-pressed={mode === "porcentaje"}
        className={optionClass(mode === "porcentaje", Boolean(disabled))}
        onClick={() => onChange("porcentaje")}
      >
        Porcentaje
      </button>
      <button
        type="button"
        disabled={fixedAmountDisabled}
        aria-pressed={mode === "fijo"}
        className={optionClass(mode === "fijo", Boolean(fixedAmountDisabled))}
        onClick={() => onChange("fijo")}
      >
        Monto fijo
      </button>
    </div>
  )
}

function CompactDiscountValueField({
  id,
  mode,
  value,
  disabled,
  onChange,
}: {
  id: string
  mode: DiscountUiMode
  value: string
  disabled?: boolean
  onChange: (raw: string) => void
}) {
  const suffix = mode === "porcentaje" ? "%" : "$"

  return (
    <div
      className={cn(
        articleFormControlShellClass,
        "flex items-stretch overflow-hidden p-0",
        disabled && "opacity-60",
      )}
    >
      <label htmlFor={id} className="sr-only">
        {mode === "porcentaje"
          ? "Porcentaje de descuento de catálogo"
          : "Monto fijo de descuento de catálogo"}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        disabled={disabled}
        value={value}
        placeholder="0"
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent px-3.5 text-sm font-numeric tabular-nums text-foreground outline-none placeholder:text-muted-foreground/70"
      />
      <span
        aria-hidden
        className={cn(articleFormInlineAddonClass, "border-l")}
      >
        {suffix}
      </span>
    </div>
  )
}

export function ArticleCatalogDiscountField({
  idPrefix,
  discountMode,
  discountValue,
  onChange,
  salePrice,
  disabled = false,
}: Props) {
  const valueFieldId = useId()
  const uiMode: DiscountUiMode =
    discountMode === "fijo" ? "fijo" : "porcentaje"
  const fixedAmountDisabled = disabled || salePrice <= 0
  const valueDisabled =
    disabled || (uiMode === "fijo" && salePrice <= 0)

  const handleModeChange = (mode: DiscountUiMode) => {
    onChange({ discountMode: mode })
  }

  const handleValueChange = (raw: string) => {
    if (!/^\d*$/.test(raw)) return
    if (raw === "") {
      onChange({ discountValue: "" })
      return
    }
    if (uiMode === "fijo" && salePrice > 0 && Number(raw) > salePrice) {
      onChange({ discountMode: "porcentaje", discountValue: "100" })
      return
    }
    const nextValue =
      uiMode === "porcentaje" ? String(Math.min(100, Number(raw))) : raw
    onChange({
      discountMode: discountMode || uiMode,
      discountValue: nextValue,
    })
  }

  const handleClear = () => {
    onChange({ discountMode: "", discountValue: "" })
  }

  const hasDiscount =
    discountValue.trim().length > 0 || discountMode !== ""

  return (
    <div className={articleFormFieldStackClass}>
      <div className="flex w-full min-w-0 items-center justify-between gap-3">
        <CheckoutSectionLabel>Descuento de catálogo</CheckoutSectionLabel>
        {hasDiscount ? (
          <button
            type="button"
            className="shrink-0 text-xs font-medium text-primary hover:underline"
            onClick={handleClear}
            disabled={disabled}
          >
            Quitar
          </button>
        ) : null}
      </div>

      <div className={articleFormTwoColRowClass}>
        <CompactDiscountModeToggle
          mode={uiMode}
          disabled={disabled}
          fixedAmountDisabled={fixedAmountDisabled}
          onChange={handleModeChange}
        />
        <CompactDiscountValueField
          id={`${idPrefix}-discount-${valueFieldId}`}
          mode={uiMode}
          value={discountValue}
          disabled={valueDisabled}
          onChange={handleValueChange}
        />
      </div>

      {uiMode === "fijo" && salePrice > 0 ? (
        <p className="text-xs leading-snug text-muted-foreground">
          Máximo sobre el precio de venta.
        </p>
      ) : null}
    </div>
  )
}
