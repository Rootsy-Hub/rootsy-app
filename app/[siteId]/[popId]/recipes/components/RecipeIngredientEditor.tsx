"use client"

import type {
  RecipeIngredientInput,
  RecipeIngredientOption,
} from "@/app/[siteId]/[popId]/recipes/actions"
import { RootsSubtleButton } from "@/components/rootsy-button"
import {
  RootsFormQuantityField,
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormTextField,
  rootsFormEarthTextSecondaryClass,
  rootsFormFieldLabelClass,
} from "@/components/rootsy-form"
import { unitOfMeasureAffix } from "@/components/rootsy-form/RootsFormUnitOfMeasureAffix"
import { computeRecipeCostPrice } from "@/lib/recipeCost"
import {
  ARTICLE_ITEM_KIND_STOCK_LABEL,
  isCustomUnitOfMeasure,
  labelUnitOfMeasure,
} from "@/lib/articleItemKind"
import { cn } from "@/lib/utils"
import { Plus, Trash2 } from "lucide-react"
import { useMemo } from "react"

export type RecipeIngredientFormLine = {
  key: string
  articleId: string
  quantity: string
  wastePct: string
}

type Props = {
  idPrefix: string
  lines: RecipeIngredientFormLine[]
  options: RecipeIngredientOption[]
  onChange: (lines: RecipeIngredientFormLine[]) => void
  disabled?: boolean
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(n)
}

function newLineKey(): string {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createEmptyIngredientLine(): RecipeIngredientFormLine {
  return {
    key: newLineKey(),
    articleId: "",
    quantity: "",
    wastePct: "",
  }
}

export function ingredientLinesToInput(
  lines: RecipeIngredientFormLine[],
): RecipeIngredientInput[] {
  return lines
    .filter((l) => l.articleId.trim())
    .map((l) => ({
      articleId: l.articleId.trim(),
      quantity: Number(l.quantity.replace(",", ".")),
      wastePct:
        l.wastePct.trim() === ""
          ? null
          : Number(l.wastePct.replace(",", ".")),
    }))
}

export function ingredientLinesFromDetail(
  ingredients: {
    articleId: string
    quantity: number
    wastePct: number | null
  }[],
): RecipeIngredientFormLine[] {
  return ingredients.map((ing) => ({
    key: newLineKey(),
    articleId: ing.articleId,
    quantity: String(ing.quantity),
    wastePct: ing.wastePct != null ? String(ing.wastePct) : "",
  }))
}

export function RecipeIngredientEditor({
  idPrefix,
  lines,
  options,
  onChange,
  disabled,
}: Props) {
  const optionsById = useMemo(
    () => new Map(options.map((o) => [o.id, o])),
    [options],
  )

  const computedCost = useMemo(() => {
    const inputs = lines
      .filter((l) => l.articleId.trim() && l.quantity.trim())
      .map((l) => {
        const opt = optionsById.get(l.articleId)
        if (!opt) return null
        const qty = Number(l.quantity.replace(",", "."))
        if (!Number.isFinite(qty) || qty <= 0) return null
        const waste =
          l.wastePct.trim() === ""
            ? null
            : Number(l.wastePct.replace(",", "."))
        return {
          quantity: qty,
          wastePct: Number.isFinite(waste) ? waste : null,
          articleCostPrice: opt.costPrice,
          articleDefaultWastePct: opt.defaultWastePct,
        }
      })
      .filter((x): x is NonNullable<typeof x> => x != null)
    return computeRecipeCostPrice(inputs)
  }, [lines, optionsById])

  const usedIds = new Set(lines.map((l) => l.articleId).filter(Boolean))

  const updateLine = (
    key: string,
    patch: Partial<RecipeIngredientFormLine>,
  ) => {
    onChange(lines.map((l) => (l.key === key ? { ...l, ...patch } : l)))
  }

  const removeLine = (key: string) => {
    onChange(lines.filter((l) => l.key !== key))
  }

  const addLine = () => {
    onChange([...lines, createEmptyIngredientLine()])
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={rootsFormFieldLabelClass}>Ingredientes</h3>
          <p className={cn("mt-1 text-xs leading-relaxed", rootsFormEarthTextSecondaryClass)}>
            Materias primas e insumos. Mínimo 1 línea.
          </p>
        </div>
        <p className={cn("text-sm font-semibold tabular-nums", rootsFormFieldLabelClass)}>
          Costo: {formatMoney(computedCost)}
        </p>
      </div>

      {lines.length === 0 ? (
        <p
          className={cn(
            "rounded-lg border border-dashed border-border/70 px-3 py-4 text-center text-sm",
            rootsFormEarthTextSecondaryClass,
          )}
        >
          Agregá al menos un ingrediente.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {lines.map((line) => {
            const opt = line.articleId ? optionsById.get(line.articleId) : null
            const quantityAffix = unitOfMeasureAffix(opt?.unitOfMeasure)
            return (
              <li
                key={line.key}
                className="rounded-xl border border-border/70 bg-muted/10 p-3"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="min-w-[12rem] flex-1">
                      <RootsFormSelectField
                        label="Ingrediente"
                        id={`${idPrefix}-ing-${line.key}`}
                        value={line.articleId}
                        onValueChange={(value) =>
                          updateLine(line.key, { articleId: value })
                        }
                        disabled={disabled}
                        placeholder="Elegir ingrediente"
                      >
                        {options.map((o) => (
                          <RootsFormSelectItem
                            key={o.id}
                            value={o.id}
                            disabled={usedIds.has(o.id) && o.id !== line.articleId}
                          >
                            {o.name} · {ARTICLE_ITEM_KIND_STOCK_LABEL[o.itemKind]}
                          </RootsFormSelectItem>
                        ))}
                      </RootsFormSelectField>
                    </div>
                    <button
                      type="button"
                      disabled={disabled || lines.length <= 1}
                      className="mb-1 inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                      aria-label="Quitar ingrediente"
                      onClick={() => removeLine(line.key)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                  {opt &&
                  (!isCustomUnitOfMeasure(opt.unitOfMeasure) ||
                    opt.defaultWastePct != null) ? (
                    <p className={cn("text-xs", rootsFormEarthTextSecondaryClass)}>
                      {!isCustomUnitOfMeasure(opt.unitOfMeasure)
                        ? labelUnitOfMeasure(opt.unitOfMeasure)
                        : null}
                      {opt.defaultWastePct != null
                        ? `${
                            !isCustomUnitOfMeasure(opt.unitOfMeasure)
                              ? " · "
                              : ""
                          }merma base ${opt.defaultWastePct}%`
                        : null}
                    </p>
                  ) : null}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <RootsFormQuantityField
                      label="Cantidad"
                      id={`${idPrefix}-qty-${line.key}`}
                      value={line.quantity}
                      onChange={(value) => updateLine(line.key, { quantity: value })}
                      disabled={disabled}
                      prefix={quantityAffix.prefix}
                      prefixClassName={quantityAffix.prefixClassName}
                      hint={quantityAffix.hint}
                    />
                    <RootsFormTextField
                      label="Merma (%)"
                      id={`${idPrefix}-waste-${line.key}`}
                      value={line.wastePct}
                      onChange={(e) =>
                        updateLine(line.key, { wastePct: e.target.value })
                      }
                      disabled={disabled}
                      placeholder="Opcional"
                      inputMode="decimal"
                    />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <RootsSubtleButton
        type="button"
        className="self-start"
        disabled={disabled}
        onClick={addLine}
      >
        <Plus className="size-4" aria-hidden />
        Agregar ingrediente
      </RootsSubtleButton>
    </section>
  )
}
