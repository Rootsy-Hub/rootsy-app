"use client"

import type { ArticleItemFormState } from "@/app/[siteId]/[popId]/articles/ArticleItemFormFields"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormTextField,
} from "@/components/rootsy-form"
import type { ArticleItemKind } from "@/lib/articleItemKind"
import {
  ARTICLE_ITEM_KIND_HINT,
  UNIT_OF_MEASURE_OPTIONS,
} from "@/lib/articleItemKind"
import type { ReactNode } from "react"

type Props = {
  itemKind: ArticleItemKind
  idPrefix: string
  value: ArticleItemFormState
  onChange: (patch: Partial<ArticleItemFormState>) => void
  disabled?: boolean
  labelInfo?: ReactNode
  /** `select`: solo UDM; `auxiliary`: merma/stock mínimo; `all`: ambos. */
  part?: "all" | "select" | "auxiliary"
}

export function ArticleUnitOfMeasureField({
  itemKind,
  idPrefix,
  value,
  onChange,
  disabled = false,
  labelInfo,
  part = "all",
}: Props) {
  const showWaste = itemKind === "raw_material"
  const showMinStock = itemKind !== "merchandise"

  const selectField = (
    <RootsFormSelectField
      label="Unidad de medida"
      id={`${idPrefix}-uom`}
      value={value.unitOfMeasure || "unidad"}
      onValueChange={(next) => onChange({ unitOfMeasure: next })}
      disabled={disabled}
      labelInfo={labelInfo ?? ARTICLE_ITEM_KIND_HINT[itemKind]}
    >
      {UNIT_OF_MEASURE_OPTIONS.map((option) => (
        <RootsFormSelectItem key={option.value} value={option.value}>
          {option.label}
        </RootsFormSelectItem>
      ))}
    </RootsFormSelectField>
  )

  const auxiliaryFields =
    showWaste || showMinStock ? (
      <>
        {showWaste ? (
          <RootsFormTextField
            label="Merma esperada (%)"
            id={`${idPrefix}-waste`}
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={value.defaultWastePct}
            onChange={(e) => onChange({ defaultWastePct: e.target.value })}
            placeholder="Opcional"
            disabled={disabled}
          />
        ) : null}

        {showMinStock ? (
          <RootsFormTextField
            label="Stock mínimo (alerta)"
            id={`${idPrefix}-min`}
            type="number"
            min={0}
            step="any"
            value={value.minStockLevel}
            onChange={(e) => onChange({ minStockLevel: e.target.value })}
            placeholder="Opcional"
            disabled={disabled}
          />
        ) : null}
      </>
    ) : null

  if (part === "select") return selectField

  if (part === "auxiliary") {
    if (!auxiliaryFields) return null
    return <div className="flex w-full min-w-0 flex-col gap-3.5">{auxiliaryFields}</div>
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-3.5">
      {selectField}
      {auxiliaryFields}
    </div>
  )
}
