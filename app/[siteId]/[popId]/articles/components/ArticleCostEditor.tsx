"use client"

import { ArticleSupplierPickerField } from "@/app/[siteId]/[popId]/articles/ArticleSupplierPickerField"
import type { ArticleCostRow } from "@/lib/articleCosts"
import type { ArticleCostLineInput } from "@/lib/articleCosts"
import { unitCostInSaleUom } from "@/lib/articleCosts"
import { RootsSubtleButton } from "@/components/rootsy-button"
import {
  RootsFormMoneyField,
  RootsFormQuantityField,
  RootsFormSwitchField,
  RootsFormTextField,
  rootsFormFieldLabelClass,
} from "@/components/rootsy-form"
import { labelUnitOfMeasure, shortUnitOfMeasure } from "@/lib/articleItemKind"
import { parseMoneyInput } from "@/lib/moneyInput"
import { cn } from "@/lib/utils"
import { Plus, Trash2 } from "lucide-react"
import { useEffect } from "react"

export type ArticleCostFormLine = {
  key: string
  unitPrice: string
  usesAlternateUnit: boolean
  costUnitLabel: string
  saleUnitsPerCostUnit: string
  /** Persistido; no se edita en la UI simplificada. */
  name: string
  supplierId: string
  supplierName: string
  isActive: boolean
}

type Props = {
  idPrefix: string
  lines: ArticleCostFormLine[]
  onChange: (lines: ArticleCostFormLine[]) => void
  saleUnitOfMeasure: string
  disabled?: boolean
  popId: string
  supplierOptions?: { id: string; name: string }[]
  /** Sin título ni borde superior — p. ej. dentro del paso Compra del wizard. */
  embedded?: boolean
}

function newLineKey(): string {
  return `cost-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function defaultCostUnitLabel(saleUnitOfMeasure: string): string {
  return (
    shortUnitOfMeasure(saleUnitOfMeasure) ||
    labelUnitOfMeasure(saleUnitOfMeasure)
  )
}

type CreateEmptyLineOptions = {
  alternateUnit?: boolean
}

export function createEmptyArticleCostLine(
  options: CreateEmptyLineOptions = {},
): ArticleCostFormLine {
  return {
    key: newLineKey(),
    unitPrice: "",
    usesAlternateUnit: options.alternateUnit ?? false,
    costUnitLabel: "",
    saleUnitsPerCostUnit: "1",
    name: "",
    supplierId: "",
    supplierName: "",
    isActive: true,
  }
}

export function articleCostLinesFromRows(
  costs: ArticleCostRow[],
  saleUnitOfMeasure: string,
): ArticleCostFormLine[] {
  const defaultLabel = defaultCostUnitLabel(saleUnitOfMeasure)

  return costs.map((cost) => {
    const factor = cost.saleUnitsPerCostUnit
    const label = cost.costUnitLabel.trim()
    const usesAlternateUnit =
      factor !== 1 ||
      (label !== "" &&
        defaultLabel !== "" &&
        label.toLowerCase() !== defaultLabel.toLowerCase())

    return {
      key: newLineKey(),
      name: cost.name,
      costUnitLabel: cost.costUnitLabel,
      saleUnitsPerCostUnit: String(cost.saleUnitsPerCostUnit),
      unitPrice: String(cost.unitPrice).replace(".", ","),
      supplierId: cost.supplierId ?? "",
      supplierName: cost.supplierName ?? "",
      isActive: cost.isActive,
      usesAlternateUnit,
    }
  })
}

export function articleCostLinesToInput(
  lines: ArticleCostFormLine[],
  saleUnitOfMeasure: string,
): ArticleCostLineInput[] {
  const defaultLabel = defaultCostUnitLabel(saleUnitOfMeasure)

  return lines
    .filter((line) => line.unitPrice.trim() !== "")
    .map((line) => ({
      name: undefined,
      costUnitLabel: line.usesAlternateUnit
        ? line.costUnitLabel.trim()
        : defaultLabel,
      saleUnitsPerCostUnit: line.usesAlternateUnit
        ? Number(line.saleUnitsPerCostUnit.replace(",", "."))
        : 1,
      unitPrice: parseMoneyInput(line.unitPrice, 0),
      supplierId: line.supplierId.trim() || null,
      isActive: true,
    }))
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(n)
}

type CostLineFieldsProps = {
  idPrefix: string
  line: ArticleCostFormLine
  saleUnitOfMeasure: string
  disabled: boolean
  popId: string
  supplierOptions: { id: string; name: string }[]
  onUpdate: (patch: Partial<ArticleCostFormLine>) => void
}

function CostLineFields({
  idPrefix,
  line,
  saleUnitOfMeasure,
  disabled,
  popId,
  supplierOptions,
  onUpdate,
}: CostLineFieldsProps) {
  const saleUomLabel = labelUnitOfMeasure(saleUnitOfMeasure)
  const saleUomShort = shortUnitOfMeasure(saleUnitOfMeasure)
  const factor = Number(line.saleUnitsPerCostUnit.replace(",", "."))
  const unitPrice = parseMoneyInput(line.unitPrice, 0)
  const previewUnitCost =
    Number.isFinite(factor) && factor > 0 && unitPrice >= 0
      ? unitCostInSaleUom({
          unitPrice,
          saleUnitsPerCostUnit: factor,
        })
      : null

  return (
    <div className="flex flex-col gap-4">
      <RootsFormMoneyField
        label="Precio de compra referencia"
        id={`${idPrefix}-cost-price-${line.key}`}
        value={line.unitPrice}
        onChange={(value) => onUpdate({ unitPrice: value })}
        disabled={disabled}
      />

      <ArticleSupplierPickerField
        id={`${idPrefix}-cost-supplier-${line.key}`}
        popId={popId}
        value={line.supplierId}
        knownSuppliers={
          line.supplierId
            ? [
                ...supplierOptions,
                ...(line.supplierName
                  ? [{ id: line.supplierId, name: line.supplierName }]
                  : []),
              ]
            : supplierOptions
        }
        disabled={disabled}
        onChange={(supplier) =>
          onUpdate({
            supplierId: supplier?.id ?? "",
            supplierName: supplier?.name ?? "",
          })
        }
      />

      <RootsFormSwitchField
        label="Compro en otra unidad"
        labelInfo={`Por defecto se compra por ${saleUomLabel.toLowerCase()} de venta.`}
        id={`${idPrefix}-cost-alt-${line.key}`}
        checked={line.usesAlternateUnit}
        onCheckedChange={(checked) =>
          onUpdate({
            usesAlternateUnit: checked,
            saleUnitsPerCostUnit: checked ? line.saleUnitsPerCostUnit : "1",
            costUnitLabel: checked ? line.costUnitLabel : "",
          })
        }
        disabled={disabled}
      />

      {line.usesAlternateUnit ? (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <RootsFormTextField
              label="Unidad de compra"
              id={`${idPrefix}-cost-uom-${line.key}`}
              value={line.costUnitLabel}
              onChange={(e) => onUpdate({ costUnitLabel: e.target.value })}
              placeholder="Ej. maple de 32"
              disabled={disabled}
              required
            />
            <RootsFormQuantityField
              label={`Trae (${saleUomShort || saleUomLabel} de venta)`}
              id={`${idPrefix}-cost-factor-${line.key}`}
              value={line.saleUnitsPerCostUnit}
              onChange={(value) => onUpdate({ saleUnitsPerCostUnit: value })}
              disabled={disabled}
              placeholder="32"
            />
          </div>
          {previewUnitCost != null && previewUnitCost > 0 ? (
            <p
              className={cn(
                "text-xs tabular-nums text-[var(--rootsy-bruma-500)]",
              )}
            >
              ≈ {formatMoney(previewUnitCost)} por {saleUomShort || saleUomLabel} de
              venta
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

const costSectionTitleClass =
  "text-xs font-semibold uppercase tracking-wide text-[var(--rootsy-bruma-500)]"

const costRemoveButtonClass =
  "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-[var(--rootsy-savia-700)] transition-colors hover:bg-[color-mix(in_srgb,var(--rootsy-savia-500)_12%,transparent)] disabled:opacity-50"

function CostLineCard({
  idPrefix,
  line,
  saleUnitOfMeasure,
  disabled,
  popId,
  supplierOptions,
  onUpdate,
  onRemove,
  title,
  variant = "card",
}: CostLineFieldsProps & {
  onRemove?: () => void
  title?: string
  variant?: "card" | "divider"
}) {
  const fields = (
    <CostLineFields
      idPrefix={idPrefix}
      line={line}
      saleUnitOfMeasure={saleUnitOfMeasure}
      disabled={disabled}
      popId={popId}
      supplierOptions={supplierOptions}
      onUpdate={onUpdate}
    />
  )

  if (variant === "divider") {
    return (
      <div className="border-t border-[var(--rootsy-bruma-200)] pt-4">
        {title || onRemove ? (
          <div className="mb-4 flex items-center justify-between gap-3">
            {title ? <p className={costSectionTitleClass}>{title}</p> : <span />}
            {onRemove ? (
              <button
                type="button"
                disabled={disabled}
                className={costRemoveButtonClass}
                onClick={onRemove}
              >
                <Trash2 className="size-3.5" aria-hidden />
                Quitar
              </button>
            ) : null}
          </div>
        ) : null}
        {fields}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--rootsy-bruma-200)] bg-white p-4">
      {title || onRemove ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? <p className={costSectionTitleClass}>{title}</p> : <span />}
          {onRemove ? (
            <button
              type="button"
              disabled={disabled}
              className={costRemoveButtonClass}
              onClick={onRemove}
            >
              <Trash2 className="size-3.5" aria-hidden />
              Quitar
            </button>
          ) : null}
        </div>
      ) : null}
      {fields}
    </div>
  )
}

export function ArticleCostEditor({
  idPrefix,
  lines,
  onChange,
  saleUnitOfMeasure,
  disabled = false,
  popId,
  supplierOptions = [],
  embedded = false,
}: Props) {
  const saleUomLabel = labelUnitOfMeasure(saleUnitOfMeasure)

  useEffect(() => {
    if (lines.length === 0 && !disabled) {
      onChange([createEmptyArticleCostLine()])
    }
  }, [lines.length, disabled, onChange])

  const primaryLine = lines[0] ?? null
  const extraLines = lines.slice(1)

  const updateLine = (key: string, patch: Partial<ArticleCostFormLine>) => {
    onChange(lines.map((line) => (line.key === key ? { ...line, ...patch } : line)))
  }

  const removeLine = (key: string) => {
    onChange(lines.filter((line) => line.key !== key))
  }

  const addExtraLine = () => {
    onChange([...lines, createEmptyArticleCostLine({ alternateUnit: true })])
  }

  return (
    <section
      className={cn(
        "flex flex-col gap-4",
        !embedded && "border-t border-[var(--rootsy-bruma-200)] pt-4",
      )}
    >
      {!embedded ? (
        <div>
          <h3 className={rootsFormFieldLabelClass}>Costo de compra</h3>
          <p className="mt-1 text-xs leading-relaxed text-[var(--rootsy-bruma-500)]">
            Referencia para cargar compras más rápido. El costo real se registra al
            confirmar cada compra ({saleUomLabel.toLowerCase()} de venta).
          </p>
        </div>
      ) : null}

      {primaryLine ? (
        embedded ? (
          <CostLineFields
            idPrefix={idPrefix}
            line={primaryLine}
            saleUnitOfMeasure={saleUnitOfMeasure}
            disabled={disabled}
            popId={popId}
            supplierOptions={supplierOptions}
            onUpdate={(patch) => updateLine(primaryLine.key, patch)}
          />
        ) : (
          <CostLineCard
            idPrefix={idPrefix}
            line={primaryLine}
            saleUnitOfMeasure={saleUnitOfMeasure}
            disabled={disabled}
            popId={popId}
            supplierOptions={supplierOptions}
            onUpdate={(patch) => updateLine(primaryLine.key, patch)}
          />
        )
      ) : null}

      {extraLines.map((line, index) => (
        <CostLineCard
          key={line.key}
          idPrefix={idPrefix}
          line={line}
          saleUnitOfMeasure={saleUnitOfMeasure}
          disabled={disabled}
          popId={popId}
          supplierOptions={supplierOptions}
          onUpdate={(patch) => updateLine(line.key, patch)}
          onRemove={() => removeLine(line.key)}
          variant={embedded ? "divider" : "card"}
          title={
            extraLines.length > 1
              ? `Otra forma de compra ${index + 1}`
              : "Otra forma de compra"
          }
        />
      ))}

      <RootsSubtleButton type="button" onClick={addExtraLine} disabled={disabled}>
        <Plus className="size-4" aria-hidden />
        Agregar otra forma de compra
      </RootsSubtleButton>
    </section>
  )
}
