"use client"

import type { ArticleDiscountMode } from "@/lib/articleDiscount"
import {
  RootsFormDiscountField,
  type RootsFormDiscountMode,
} from "@/components/rootsy-form"
import { parseNonNegativeIntegerInput } from "@/lib/integerInput"
import {
  formatMoneyInputForField,
  parseMoneyInput,
} from "@/lib/moneyInput"

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

function normalizePercentDiscountValue(raw: string): string {
  const whole = raw.includes(",")
    ? (raw.split(",")[0] ?? "")
    : raw.includes(".")
      ? (raw.split(".")[0] ?? "")
      : raw
  const sanitized = whole.replace(/\D/g, "").slice(0, 3)
  if (!sanitized) return ""
  const parsed = parseNonNegativeIntegerInput(sanitized, Number.NaN)
  if (!Number.isFinite(parsed)) return ""
  return String(Math.min(100, parsed))
}

function normalizeFixedDiscountValue(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ""
  const parsed = parseMoneyInput(trimmed, Number.NaN)
  if (!Number.isFinite(parsed) || parsed < 0) return trimmed
  return formatMoneyInputForField(parsed)
}

export function ArticleCatalogDiscountField({
  idPrefix,
  discountMode,
  discountValue,
  onChange,
  salePrice,
  disabled = false,
}: Props) {
  const uiMode: RootsFormDiscountMode =
    discountMode === "fijo" ? "fijo" : "porcentaje"
  const fixedAmountDisabled = disabled || salePrice <= 0
  const displayValue =
    uiMode === "porcentaje"
      ? normalizePercentDiscountValue(discountValue)
      : discountValue

  const handleModeChange = (mode: RootsFormDiscountMode) => {
    const nextValue =
      mode === "porcentaje"
        ? normalizePercentDiscountValue(discountValue)
        : normalizeFixedDiscountValue(discountValue)
    onChange({ discountMode: mode, discountValue: nextValue })
  }

  const handleValueChange = (raw: string) => {
    const nextMode = discountMode || uiMode
    const nextValue =
      nextMode === "porcentaje"
        ? normalizePercentDiscountValue(raw)
        : raw

    if (nextMode === "fijo" && salePrice > 0) {
      const parsed = parseMoneyInput(nextValue, Number.NaN)
      if (Number.isFinite(parsed) && parsed > salePrice) {
        onChange({ discountMode: "porcentaje", discountValue: "100" })
        return
      }
    }

    onChange({
      discountMode: nextMode,
      discountValue: nextValue,
    })
  }

  const handleClear = () => {
    onChange({ discountMode: "", discountValue: "" })
  }

  return (
    <RootsFormDiscountField
      label="Descuento de catálogo"
      id={`${idPrefix}-discount`}
      mode={uiMode}
      onModeChange={handleModeChange}
      value={displayValue}
      onChange={handleValueChange}
      onClear={handleClear}
      disabled={disabled}
      fixedAmountDisabled={fixedAmountDisabled}
      hint={
        uiMode === "fijo" && salePrice <= 0
          ? "Ingresá precio de venta para usar monto fijo."
          : uiMode === "fijo" && salePrice > 0
            ? "Máximo sobre el precio de venta."
            : undefined
      }
    />
  )
}
