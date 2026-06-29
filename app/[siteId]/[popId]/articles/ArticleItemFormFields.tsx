"use client"

import type { ArticleItemKind } from "@/lib/articleItemKind"
import {
  ARTICLE_ITEM_KIND_HINT,
  isUnitOfMeasure,
  UNIT_OF_MEASURE_OPTIONS,
  type UnitOfMeasureValue,
} from "@/lib/articleItemKind"
import { Checkbox } from "@/components/ui/checkbox"
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
  isSellable: boolean
  defaultWastePct: string
  minStockLevel: string
}

type Props = {
  itemKind: ArticleItemKind
  value: ArticleItemFormState
  onChange: (patch: Partial<ArticleItemFormState>) => void
  idPrefix: string
}

export function ArticleItemFormFields({
  itemKind,
  value,
  onChange,
  idPrefix,
}: Props) {
  const showWaste = itemKind === "raw_material"
  const showSellable = itemKind !== "supply"
  const showMinStock = itemKind !== "merchandise"

  return (
    <div className="space-y-4 rounded-lg border border-border/50 bg-muted/15 p-3">
      <p className="text-xs leading-relaxed text-muted-foreground">
        {ARTICLE_ITEM_KIND_HINT[itemKind]}
      </p>
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
          </SelectContent>
        </Select>
      </div>
      {showSellable ? (
        <label className="flex cursor-pointer items-center gap-2">
          <Checkbox
            checked={value.isSellable}
            onCheckedChange={(c) => onChange({ isSellable: c === true })}
            aria-label="Vendible en mostrador"
          />
          <span className="text-sm">Vendible en mostrador / ventas</span>
        </label>
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
): {
  unitOfMeasure: UnitOfMeasureValue
  isSellable: boolean
  defaultWastePct: number | null
  minStockLevel: number | null
} {
  const wasteRaw = value.defaultWastePct.trim().replace(",", ".")
  const minRaw = value.minStockLevel.trim().replace(",", ".")
  const wasteN = Number.parseFloat(wasteRaw)
  const minN = Number.parseFloat(minRaw)
  return {
    unitOfMeasure: isUnitOfMeasure(value.unitOfMeasure)
      ? value.unitOfMeasure
      : "unidad",
    isSellable: value.isSellable,
    defaultWastePct:
      wasteRaw && Number.isFinite(wasteN) && wasteN >= 0 && wasteN <= 100
        ? wasteN
        : null,
    minStockLevel:
      minRaw && Number.isFinite(minN) && minN >= 0 ? minN : null,
  }
}
