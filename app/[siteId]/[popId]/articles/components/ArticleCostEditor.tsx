"use client"

import type { ArticleCostRow } from "@/lib/articleCosts"
import type { ArticleCostLineInput } from "@/lib/articleCosts"
import { unitCostInSaleUom } from "@/lib/articleCosts"
import { RootsSubtleButton } from "@/components/rootsy-button"
import {
  RootsFormMoneyField,
  RootsFormQuantityField,
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormSwitchField,
  RootsFormTextField,
  rootsFormEarthTextSecondaryClass,
  rootsFormFieldLabelClass,
} from "@/components/rootsy-form"
import { labelUnitOfMeasure, shortUnitOfMeasure } from "@/lib/articleItemKind"
import { parseMoneyInput } from "@/lib/moneyInput"
import { cn } from "@/lib/utils"
import { Plus, Trash2 } from "lucide-react"

export type ArticleCostFormLine = {
  key: string
  name: string
  costUnitLabel: string
  saleUnitsPerCostUnit: string
  unitPrice: string
  supplierId: string
  isActive: boolean
}

type SupplierOption = {
  id: string
  name: string
}

type Props = {
  idPrefix: string
  lines: ArticleCostFormLine[]
  onChange: (lines: ArticleCostFormLine[]) => void
  supplierOptions: SupplierOption[]
  saleUnitOfMeasure: string
  disabled?: boolean
}

function newLineKey(): string {
  return `cost-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createEmptyArticleCostLine(): ArticleCostFormLine {
  return {
    key: newLineKey(),
    name: "",
    costUnitLabel: "",
    saleUnitsPerCostUnit: "1",
    unitPrice: "",
    supplierId: "",
    isActive: true,
  }
}

export function articleCostLinesFromRows(costs: ArticleCostRow[]): ArticleCostFormLine[] {
  return costs.map((cost) => ({
    key: newLineKey(),
    name: cost.name,
    costUnitLabel: cost.costUnitLabel,
    saleUnitsPerCostUnit: String(cost.saleUnitsPerCostUnit),
    unitPrice: String(cost.unitPrice).replace(".", ","),
    supplierId: cost.supplierId ?? "",
    isActive: cost.isActive,
  }))
}

export function articleCostLinesToInput(
  lines: ArticleCostFormLine[],
): ArticleCostLineInput[] {
  return lines.map((line) => ({
    name: line.name.trim() || undefined,
    costUnitLabel: line.costUnitLabel.trim(),
    saleUnitsPerCostUnit: Number(line.saleUnitsPerCostUnit.replace(",", ".")),
    unitPrice: parseMoneyInput(line.unitPrice, 0),
    supplierId: line.supplierId.trim() || null,
    isActive: line.isActive,
  }))
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(n)
}

export function ArticleCostEditor({
  idPrefix,
  lines,
  onChange,
  supplierOptions,
  saleUnitOfMeasure,
  disabled = false,
}: Props) {
  const saleUomLabel = labelUnitOfMeasure(saleUnitOfMeasure)
  const saleUomShort = shortUnitOfMeasure(saleUnitOfMeasure)

  const updateLine = (key: string, patch: Partial<ArticleCostFormLine>) => {
    onChange(lines.map((line) => (line.key === key ? { ...line, ...patch } : line)))
  }

  const removeLine = (key: string) => {
    onChange(lines.filter((line) => line.key !== key))
  }

  const addLine = () => {
    onChange([...lines, createEmptyArticleCostLine()])
  }

  return (
    <section className="flex flex-col gap-4 border-t border-border/50 pt-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className={rootsFormFieldLabelClass}>Costos de compra</h3>
          <p className={cn("mt-1 text-xs leading-relaxed", rootsFormEarthTextSecondaryClass)}>
            Formas en que podés comprar este artículo. La equivalencia convierte a{" "}
            {saleUomLabel.toLowerCase()} de venta.
          </p>
        </div>
        <RootsSubtleButton
          type="button"
          onClick={addLine}
          disabled={disabled}
        >
          <Plus className="size-4" aria-hidden />
          Agregar costo
        </RootsSubtleButton>
      </div>

      {lines.length === 0 ? (
        <p
          className={cn(
            "rounded-lg border border-dashed border-border/70 px-3 py-4 text-center text-sm",
            rootsFormEarthTextSecondaryClass,
          )}
        >
          Sin costos cargados. Podés agregarlos ahora o más tarde.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {lines.map((line, index) => {
            const factor = Number(line.saleUnitsPerCostUnit.replace(",", "."))
            const unitPrice = parseMoneyInput(line.unitPrice, 0)
            const previewUnitCost =
              Number.isFinite(factor) &&
              factor > 0 &&
              unitPrice >= 0 &&
              line.isActive
                ? unitCostInSaleUom({
                    unitPrice,
                    saleUnitsPerCostUnit: factor,
                  })
                : null

            return (
              <li
                key={line.key}
                className="rounded-xl border border-border/70 bg-muted/10 p-3"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Costo {index + 1}
                  </p>
                  <button
                    type="button"
                    disabled={disabled}
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                    aria-label={`Quitar costo ${index + 1}`}
                    onClick={() => removeLine(line.key)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <RootsFormTextField
                      label="Nombre (opcional)"
                      id={`${idPrefix}-cost-name-${line.key}`}
                      value={line.name}
                      onChange={(e) => updateLine(line.key, { name: e.target.value })}
                      placeholder="Ej. Maple 32 huevos"
                      disabled={disabled}
                    />
                    <RootsFormSelectField
                      label="Proveedor (opcional)"
                      id={`${idPrefix}-cost-supplier-${line.key}`}
                      value={line.supplierId || "__none__"}
                      onValueChange={(value) =>
                        updateLine(line.key, {
                          supplierId: value === "__none__" ? "" : value,
                        })
                      }
                      disabled={disabled}
                    >
                      <RootsFormSelectItem value="__none__">Sin proveedor</RootsFormSelectItem>
                      {supplierOptions.map((supplier) => (
                        <RootsFormSelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </RootsFormSelectItem>
                      ))}
                    </RootsFormSelectField>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <RootsFormTextField
                      label="Unidad de compra"
                      id={`${idPrefix}-cost-uom-${line.key}`}
                      value={line.costUnitLabel}
                      onChange={(e) =>
                        updateLine(line.key, { costUnitLabel: e.target.value })
                      }
                      placeholder="Ej. maple de 32"
                      disabled={disabled}
                      required
                    />
                    <RootsFormMoneyField
                      label="Precio por unidad de compra"
                      id={`${idPrefix}-cost-price-${line.key}`}
                      value={line.unitPrice}
                      onChange={(value) => updateLine(line.key, { unitPrice: value })}
                      disabled={disabled}
                    />
                  </div>

                  <RootsFormQuantityField
                    label={`Equivalencia (${saleUomShort || saleUomLabel} de venta por 1 unidad de compra)`}
                    id={`${idPrefix}-cost-factor-${line.key}`}
                    value={line.saleUnitsPerCostUnit}
                    onChange={(value) =>
                      updateLine(line.key, { saleUnitsPerCostUnit: value })
                    }
                    disabled={disabled}
                    placeholder="32"
                  />

                  {previewUnitCost != null && previewUnitCost > 0 ? (
                    <p className={cn("text-xs tabular-nums", rootsFormEarthTextSecondaryClass)}>
                      ≈ {formatMoney(previewUnitCost)} por {saleUomShort || saleUomLabel} de venta
                    </p>
                  ) : null}

                  <RootsFormSwitchField
                    label="Costo activo"
                    description="Los costos inactivos no se ofrecen al comprar."
                    id={`${idPrefix}-cost-active-${line.key}`}
                    checked={line.isActive}
                    onCheckedChange={(checked) =>
                      updateLine(line.key, { isActive: checked })
                    }
                    disabled={disabled}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
