"use client"

import type {
  RecipeIngredientInput,
  RecipeIngredientOption,
} from "@/app/[siteId]/[popId]/recipes/actions"
import { getRecipeIngredientOptionsByIds } from "@/lib/rootsyApi/recipesClient"
import { RecipeIngredientSearchField } from "@/app/[siteId]/[popId]/recipes/components/RecipeIngredientSearchField"
import { RootsIconButton, RootsSubtleButton } from "@/components/rootsy-button"
import {
  RootsFormQuantityField,
  RootsFormTextField,
  rootsFormFieldLabelClass,
} from "@/components/rootsy-form"
import { unitOfMeasureAffix } from "@/components/rootsy-form/RootsFormUnitOfMeasureAffix"
import { computeRecipeCostPrice } from "@/lib/recipeCost"
import {
  isCustomUnitOfMeasure,
  labelUnitOfMeasure,
} from "@/lib/articleItemKind"
import { cn } from "@/lib/utils"
import { Plus, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

export type RecipeIngredientFormLine = {
  key: string
  articleId: string
  quantity: string
  wastePct: string
}

type Props = {
  idPrefix: string
  popId: string
  lines: RecipeIngredientFormLine[]
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
  popId,
  lines,
  onChange,
  disabled,
}: Props) {
  const [optionsById, setOptionsById] = useState<
    Map<string, RecipeIngredientOption>
  >(() => new Map())

  const selectedIdsKey = lines
    .map((line) => line.articleId.trim())
    .filter(Boolean)
    .sort()
    .join(",")

  useEffect(() => {
    const ids = selectedIdsKey ? selectedIdsKey.split(",") : []
    if (ids.length === 0) return
    let cancelled = false
    void getRecipeIngredientOptionsByIds(popId, ids).then((res) => {
      if (cancelled || !res.success) return
      setOptionsById((prev) => {
        const next = new Map(prev)
        for (const option of res.ingredients) {
          next.set(option.id, option)
        }
        return next
      })
    })
    return () => {
      cancelled = true
    }
  }, [popId, selectedIdsKey])

  const rememberOption = (option: RecipeIngredientOption) => {
    setOptionsById((prev) => {
      const next = new Map(prev)
      next.set(option.id, option)
      return next
    })
  }

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
          <p className="mt-1 text-xs leading-relaxed text-[var(--rootsy-bruma-500)]">
            Buscá materia prima del catálogo. Mínimo 1 línea.
          </p>
        </div>
        <p className={cn("text-sm font-semibold tabular-nums", rootsFormFieldLabelClass)}>
          Costo: {formatMoney(computedCost)}
        </p>
      </div>

      {lines.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--rootsy-bruma-200)] px-3 py-4 text-center text-sm text-[var(--rootsy-bruma-500)]">
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
                className="rounded-xl border border-[var(--rootsy-bruma-200)] bg-white p-3"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="min-w-[12rem] flex-1">
                      <RecipeIngredientSearchField
                        id={`${idPrefix}-ing-${line.key}`}
                        popId={popId}
                        selected={opt ?? null}
                        excludeIds={[...usedIds].filter((id) => id !== line.articleId)}
                        disabled={disabled}
                        onSelect={(option) => {
                          rememberOption(option)
                          updateLine(line.key, { articleId: option.id })
                        }}
                        onClear={() => updateLine(line.key, { articleId: "" })}
                      />
                    </div>
                    <RootsIconButton
                      type="button"
                      className="mb-1"
                      tone="ghost"
                      intent="destructive"
                      disabled={disabled || lines.length <= 1}
                      label="Quitar ingrediente"
                      onClick={() => removeLine(line.key)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </RootsIconButton>
                  </div>
                  {opt &&
                  (!isCustomUnitOfMeasure(opt.unitOfMeasure) ||
                    opt.defaultWastePct != null) ? (
                    <p className="text-xs text-[var(--rootsy-bruma-500)]">
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
