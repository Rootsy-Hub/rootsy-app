"use client"

import type { ArticleItemFormState } from "@/app/[siteId]/[popId]/articles/ArticleItemFormFields"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormTextField,
  rootsFormFieldStackClass,
} from "@/components/rootsy-form"
import type { ArticleItemKind } from "@/lib/articleItemKind"
import {
  ARTICLE_ITEM_KIND_HINT,
  CUSTOM_UNIT_OF_MEASURE_SELECT,
  UNIT_OF_MEASURE_OPTIONS,
} from "@/lib/articleItemKind"

type Props = {
  itemKind: ArticleItemKind
  idPrefix: string
  value: ArticleItemFormState
  onChange: (patch: Partial<ArticleItemFormState>) => void
  disabled?: boolean
}

export function ArticleUnitOfMeasureField({
  itemKind,
  idPrefix,
  value,
  onChange,
  disabled = false,
}: Props) {
  const showWaste = itemKind === "raw_material"
  const showMinStock = itemKind !== "merchandise"
  const showCustomUnit = value.unitOfMeasure === CUSTOM_UNIT_OF_MEASURE_SELECT

  return (
    <div className="flex w-full min-w-0 flex-col gap-3.5">
      <RootsFormSelectField
        label="Unidad de medida"
        id={`${idPrefix}-uom`}
        value={value.unitOfMeasure || "unidad"}
        onValueChange={(next) => onChange({ unitOfMeasure: next })}
        disabled={disabled}
        hint={ARTICLE_ITEM_KIND_HINT[itemKind]}
      >
        {UNIT_OF_MEASURE_OPTIONS.map((option) => (
          <RootsFormSelectItem key={option.value} value={option.value}>
            {option.label}
          </RootsFormSelectItem>
        ))}
        <RootsFormSelectItem value={CUSTOM_UNIT_OF_MEASURE_SELECT}>
          Personalizado
        </RootsFormSelectItem>
      </RootsFormSelectField>

      {showCustomUnit ? (
        <RootsFormTextField
          label="Unidad personalizada"
          id={`${idPrefix}-uom-custom`}
          value={value.customUnitOfMeasure}
          onChange={(e) => onChange({ customUnitOfMeasure: e.target.value })}
          placeholder="Ej. maple de 12"
          disabled={disabled}
        />
      ) : null}

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
    </div>
  )
}
