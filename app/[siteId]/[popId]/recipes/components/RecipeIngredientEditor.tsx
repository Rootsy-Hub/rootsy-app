"use client"

import type {
  RecipeIngredientInput,
  RecipeIngredientOption,
} from "@/app/[siteId]/[popId]/recipes/actions"
import { computeRecipeCostPrice } from "@/lib/recipeCost"
import {
  ARTICLE_ITEM_KIND_STOCK_LABEL,
  labelUnitOfMeasure,
  shortUnitOfMeasure,
} from "@/lib/articleItemKind"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { recipeFormFieldClass } from "@/app/[siteId]/[popId]/recipes/recipeConstants"
import { Trash2 } from "lucide-react"
import { useMemo } from "react"

export type RecipeIngredientFormLine = {
  key: string
  articleId: string
  quantity: string
  wastePct: string
}

type Props = {
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
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">Ingredientes</p>
          <p className="text-xs text-slate-500">
            Materias primas e insumos. Mínimo 1 línea.
          </p>
        </div>
        <p className="text-sm font-semibold text-slate-700">
          Costo: {formatMoney(computedCost)}
        </p>
      </div>

      {lines.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-sm text-slate-500">
          Agregá al menos un ingrediente.
        </p>
      ) : (
        <ul className="space-y-2">
          {lines.map((line) => {
            const opt = line.articleId ? optionsById.get(line.articleId) : null
            return (
              <li
                key={line.key}
                className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50/50 p-3 sm:grid-cols-[minmax(0,1fr)_100px_90px_auto]"
              >
                <div>
                  <Select
                    value={line.articleId || undefined}
                    onValueChange={(v) => updateLine(line.key, { articleId: v })}
                    disabled={disabled}
                  >
                    <SelectTrigger className={recipeFormFieldClass}>
                      <SelectValue placeholder="Elegir ingrediente" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((o) => (
                        <SelectItem
                          key={o.id}
                          value={o.id}
                          disabled={usedIds.has(o.id) && o.id !== line.articleId}
                        >
                          {o.name} · {ARTICLE_ITEM_KIND_STOCK_LABEL[o.itemKind]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {opt ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {labelUnitOfMeasure(opt.unitOfMeasure)}
                      {opt.defaultWastePct != null
                        ? ` · merma base ${opt.defaultWastePct}%`
                        : ""}
                    </p>
                  ) : null}
                </div>
                <div>
                  <Input
                    value={line.quantity}
                    onChange={(e) =>
                      updateLine(line.key, { quantity: e.target.value })
                    }
                    placeholder="Cant."
                    disabled={disabled}
                    className={recipeFormFieldClass}
                  />
                  {opt ? (
                    <p className="mt-1 text-[10px] text-slate-400">
                      {shortUnitOfMeasure(opt.unitOfMeasure)}
                    </p>
                  ) : null}
                </div>
                <div>
                  <Input
                    value={line.wastePct}
                    onChange={(e) =>
                      updateLine(line.key, { wastePct: e.target.value })
                    }
                    placeholder="Merma %"
                    disabled={disabled}
                    className={recipeFormFieldClass}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 self-start text-slate-500 hover:text-red-600"
                  disabled={disabled || lines.length <= 1}
                  onClick={() => removeLine(line.key)}
                  aria-label="Quitar ingrediente"
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            )
          })}
        </ul>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={addLine}
      >
        Agregar ingrediente
      </Button>
    </div>
  )
}
