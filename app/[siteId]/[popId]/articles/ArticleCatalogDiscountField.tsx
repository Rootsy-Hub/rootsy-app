"use client"

import type { ArticleDiscountMode } from "@/lib/articleDiscount"
import {
  RootsFormDiscountField,
  type RootsFormDiscountMode,
} from "@/components/rootsy-form"
import { parseMoneyInput } from "@/lib/moneyInput"

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

  const handleModeChange = (mode: RootsFormDiscountMode) => {
    onChange({ discountMode: mode })
  }

  const handleValueChange = (raw: string) => {
    if (uiMode === "fijo" && salePrice > 0) {
      const parsed = parseMoneyInput(raw, Number.NaN)
      if (Number.isFinite(parsed) && parsed > salePrice) {
        onChange({ discountMode: "porcentaje", discountValue: "100" })
        return
      }
    }

    onChange({
      discountMode: discountMode || uiMode,
      discountValue: raw,
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
      value={discountValue}
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
