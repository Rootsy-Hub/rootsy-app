"use client"

import type { ArticleDiscountMode } from "@/lib/articleDiscount"
import type { ArticleItemKind } from "@/lib/articleItemKind"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type ArticleCatalogExtraFormState = {
  brand: string
  discountMode: "" | ArticleDiscountMode
  discountValue: string
}

type Props = {
  itemKind: ArticleItemKind
  idPrefix: string
  value: ArticleCatalogExtraFormState
  onChange: (patch: Partial<ArticleCatalogExtraFormState>) => void
}

export function ArticleCatalogExtraFields({
  itemKind,
  idPrefix,
  value,
  onChange,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-brand`}>Marca</Label>
        <Input
          id={`${idPrefix}-brand`}
          value={value.brand}
          onChange={(e) => onChange({ brand: e.target.value })}
          placeholder="Opcional"
          className="bg-background"
        />
      </div>

      {itemKind === "merchandise" ? (
        <div className="space-y-3 rounded-lg border border-border/50 bg-muted/15 p-3">
          <div>
            <p className="text-sm font-medium text-foreground">Descuento de catálogo</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Opcional. Se aplica sobre el precio de venta en mostrador y listados.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-discount-mode`}>Tipo</Label>
              <Select
                value={value.discountMode || "__none__"}
                onValueChange={(v) =>
                  onChange({
                    discountMode:
                      v === "__none__" ? "" : (v as ArticleDiscountMode),
                    ...(v === "__none__" ? { discountValue: "" } : {}),
                  })
                }
              >
                <SelectTrigger id={`${idPrefix}-discount-mode`} className="bg-background">
                  <SelectValue placeholder="Sin descuento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sin descuento</SelectItem>
                  <SelectItem value="porcentaje">Porcentaje (%)</SelectItem>
                  <SelectItem value="fijo">Monto fijo ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-discount-value`}>Monto</Label>
              <Input
                id={`${idPrefix}-discount-value`}
                type="number"
                min={0}
                step={value.discountMode === "porcentaje" ? "0.01" : "0.01"}
                max={value.discountMode === "porcentaje" ? 100 : undefined}
                value={value.discountValue}
                onChange={(e) => onChange({ discountValue: e.target.value })}
                disabled={!value.discountMode}
                placeholder={
                  value.discountMode === "porcentaje"
                    ? "Ej. 15"
                    : value.discountMode === "fijo"
                      ? "Ej. 500"
                      : "—"
                }
                className="bg-background"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function defaultArticleCatalogExtraFormState(): ArticleCatalogExtraFormState {
  return {
    brand: "",
    discountMode: "",
    discountValue: "",
  }
}
