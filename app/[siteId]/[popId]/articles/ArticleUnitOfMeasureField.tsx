"use client"

import type { ArticleItemFormState } from "@/app/[siteId]/[popId]/articles/ArticleItemFormFields"
import {
  articleFormFieldStackClass,
  articleFormSelectContentClass,
  articleFormSelectItemClass,
  articleFormSelectTriggerClass,
  articleFormTextFieldClass,
} from "@/app/[siteId]/[popId]/articles/articleConstants"
import { CheckoutFieldHint, CheckoutSectionLabel } from "@/components/checkout/CheckoutFormFields"
import type { ArticleItemKind } from "@/lib/articleItemKind"
import {
  ARTICLE_ITEM_KIND_HINT,
  CUSTOM_UNIT_OF_MEASURE_SELECT,
  UNIT_OF_MEASURE_OPTIONS,
} from "@/lib/articleItemKind"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
      <div className={articleFormFieldStackClass}>
        <CheckoutSectionLabel>Unidad de medida</CheckoutSectionLabel>
        <div className="w-full min-w-0">
          <Select
            value={value.unitOfMeasure || "unidad"}
            onValueChange={(v) => onChange({ unitOfMeasure: v })}
            disabled={disabled}
          >
            <SelectTrigger id={`${idPrefix}-uom`} className={articleFormSelectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={articleFormSelectContentClass} position="popper">
              {UNIT_OF_MEASURE_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className={articleFormSelectItemClass}
                >
                  {option.label}
                </SelectItem>
              ))}
              <SelectItem
                value={CUSTOM_UNIT_OF_MEASURE_SELECT}
                className={articleFormSelectItemClass}
              >
                Personalizado
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CheckoutFieldHint>{ARTICLE_ITEM_KIND_HINT[itemKind]}</CheckoutFieldHint>
      </div>

      {showCustomUnit ? (
        <div className={articleFormFieldStackClass}>
          <CheckoutSectionLabel>Unidad personalizada</CheckoutSectionLabel>
          <input
            id={`${idPrefix}-uom-custom`}
            value={value.customUnitOfMeasure}
            onChange={(e) => onChange({ customUnitOfMeasure: e.target.value })}
            placeholder="Ej. maple de 12"
            disabled={disabled}
            className={articleFormTextFieldClass}
          />
        </div>
      ) : null}

      {showWaste ? (
        <div className={articleFormFieldStackClass}>
          <CheckoutSectionLabel>Merma esperada (%)</CheckoutSectionLabel>
          <input
            id={`${idPrefix}-waste`}
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={value.defaultWastePct}
            onChange={(e) => onChange({ defaultWastePct: e.target.value })}
            placeholder="Opcional"
            disabled={disabled}
            className={articleFormTextFieldClass}
          />
        </div>
      ) : null}

      {showMinStock ? (
        <div className={articleFormFieldStackClass}>
          <CheckoutSectionLabel>Stock mínimo (alerta)</CheckoutSectionLabel>
          <input
            id={`${idPrefix}-min`}
            type="number"
            min={0}
            step="any"
            value={value.minStockLevel}
            onChange={(e) => onChange({ minStockLevel: e.target.value })}
            placeholder="Opcional"
            disabled={disabled}
            className={articleFormTextFieldClass}
          />
        </div>
      ) : null}
    </div>
  )
}
