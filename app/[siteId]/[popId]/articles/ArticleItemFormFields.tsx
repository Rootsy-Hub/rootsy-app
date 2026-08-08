"use client"

import type { ArticleItemKind } from "@/lib/articleItemKind"
import {
  ARTICLE_ITEM_KIND_HINT,
  CUSTOM_UNIT_OF_MEASURE_SELECT,
  UNIT_OF_MEASURE_OPTIONS,
  defaultIsSellableForKind,
  parseUnitOfMeasureFromForm,
} from "@/lib/articleItemKind"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type ArticleItemFormState = {
  unitOfMeasure: string
  customUnitOfMeasure: string
  defaultWastePct: string
  minStockLevel: string
}

type Props = {
  itemKind: ArticleItemKind
  value: ArticleItemFormState
  onChange: (patch: Partial<ArticleItemFormState>) => void
  idPrefix: string
  variant?: "panel" | "plain"
}

export function ArticleItemFormFields({
  itemKind,
  value,
  onChange,
  idPrefix,
  variant = "panel",
}: Props) {
  const showWaste = itemKind === "raw_material"
  const showMinStock = itemKind !== "merchandise"
  const showCustomUnit = value.unitOfMeasure === CUSTOM_UNIT_OF_MEASURE_SELECT

  return (
    <div
      className={
        variant === "panel"
          ? "space-y-4 rounded-lg border border-border/50 bg-muted/15 p-3"
          : "space-y-3"
      }
    >
      {variant === "panel" ? (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {ARTICLE_ITEM_KIND_HINT[itemKind]}
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-uom`}>Unidad de medida</Label>
        <Select
          value={value.unitOfMeasure || "unidad"}
          onValueChange={(v) => onChange({ unitOfMeasure: v })}
        >
          <SelectTrigger id={`${idPrefix}-uom`} className="bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {UNIT_OF_MEASURE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
            <SelectItem value={CUSTOM_UNIT_OF_MEASURE_SELECT}>
              Personalizado
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      {showCustomUnit ? (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-uom-custom`}>Unidad personalizada</Label>
          <Input
            id={`${idPrefix}-uom-custom`}
            value={value.customUnitOfMeasure}
            onChange={(e) =>
              onChange({ customUnitOfMeasure: e.target.value })
            }
            placeholder="Ej. maple de 12"
            className="bg-background"
          />
        </div>
      ) : null}
      {showWaste ? (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-waste`}>Merma esperada (%)</Label>
          <Input
            id={`${idPrefix}-waste`}
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={value.defaultWastePct}
            onChange={(e) => onChange({ defaultWastePct: e.target.value })}
            placeholder="Ej. 5"
            className="bg-background"
          />
        </div>
      ) : null}
      {showMinStock ? (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-min`}>Stock mínimo (alerta)</Label>
          <Input
            id={`${idPrefix}-min`}
            type="number"
            min={0}
            step="any"
            value={value.minStockLevel}
            onChange={(e) => onChange({ minStockLevel: e.target.value })}
            placeholder="Opcional"
            className="bg-background"
          />
        </div>
      ) : null}
    </div>
  )
}

export function parseArticleItemFormState(
  value: ArticleItemFormState,
  itemKind: ArticleItemKind,
):
  | {
      unitOfMeasure: string
      isSellable: boolean
      defaultWastePct: number | null
      minStockLevel: number | null
    }
  | { error: string } {
  const uom = parseUnitOfMeasureFromForm(
    value.unitOfMeasure,
    value.customUnitOfMeasure,
  )
  if (!uom.ok) {
    return { error: uom.error }
  }

  const wasteRaw = value.defaultWastePct.trim().replace(",", ".")
  const minRaw = value.minStockLevel.trim().replace(",", ".")
  const wasteN = Number.parseFloat(wasteRaw)
  const minN = Number.parseFloat(minRaw)
  return {
    unitOfMeasure: uom.value,
    isSellable: defaultIsSellableForKind(itemKind),
    defaultWastePct:
      wasteRaw && Number.isFinite(wasteN) && wasteN >= 0 && wasteN <= 100
        ? wasteN
        : null,
    minStockLevel:
      minRaw && Number.isFinite(minN) && minN >= 0 ? minN : null,
  }
}
