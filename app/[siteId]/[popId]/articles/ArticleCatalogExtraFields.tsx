"use client"

import type { ArticleDiscountMode } from "@/lib/articleDiscount"
import type { ArticleItemKind } from "@/lib/articleItemKind"
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

export type ArticleSupplierOption = {
  id: string
  name: string
}

export type ArticleCatalogExtraFormState = {
  brand: string
  discountMode: "" | ArticleDiscountMode
  discountValue: string
  supplierIds: string[]
}

type Props = {
  itemKind: ArticleItemKind
  idPrefix: string
  suppliers: ArticleSupplierOption[]
  suppliersLoading?: boolean
  value: ArticleCatalogExtraFormState
  onChange: (patch: Partial<ArticleCatalogExtraFormState>) => void
}

export function ArticleCatalogExtraFields({
  itemKind,
  idPrefix,
  suppliers,
  suppliersLoading = false,
  value,
  onChange,
}: Props) {
  const toggleSupplier = (supplierId: string, checked: boolean) => {
    onChange({
      supplierIds: checked
        ? [...new Set([...value.supplierIds, supplierId])]
        : value.supplierIds.filter((id) => id !== supplierId),
    })
  }

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

      <div className="space-y-2">
        <Label>Proveedores</Label>
        {suppliersLoading ? (
          <p className="text-sm text-muted-foreground">Cargando proveedores…</p>
        ) : suppliers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay proveedores cargados en este punto de venta.
          </p>
        ) : (
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border/60 bg-muted/10 p-2">
            {suppliers.map((s) => {
              const checked = value.supplierIds.includes(s.id)
              return (
                <label
                  key={s.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 hover:bg-muted/40"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(c) => toggleSupplier(s.id, c === true)}
                    aria-label={s.name}
                  />
                  <span className="truncate text-sm text-foreground">{s.name}</span>
                </label>
              )
            })}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Podés elegir uno o más proveedores habituales para este ítem.
        </p>
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
    supplierIds: [],
  }
}
