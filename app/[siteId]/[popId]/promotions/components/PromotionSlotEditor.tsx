"use client"

import type {
  PromotionCatalogOption,
  PromotionSlotInput,
  PromotionSlotOptionInput,
} from "@/app/[siteId]/[popId]/promotions/actions"
import { QUANTITY_DEAL_SLOT_LABEL } from "@/app/[siteId]/[popId]/promotions/promotionConstants"
import {
  RootsFormQuantityField,
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormTextField,
  rootsFormEarthTextSecondaryClass,
  rootsFormFieldLabelClass,
} from "@/components/rootsy-form"
import { RootsSubtleButton } from "@/components/rootsy-button"
import { SelectGroup, SelectLabel } from "@/components/ui/select"
import {
  PROMOTION_OPTION_KIND_LABEL,
  type PromotionOptionKind,
  type PromotionType,
} from "@/lib/promotionTypes"
import { cn } from "@/lib/utils"
import { Plus, Trash2 } from "lucide-react"
import { useMemo } from "react"

export type PromotionSlotFormLine = {
  key: string
  label: string
  quantity: string
  options: PromotionOptionFormLine[]
}

export type PromotionOptionFormLine = {
  key: string
  kind: PromotionOptionKind
  refId: string
}

type Props = {
  idPrefix: string
  promotionType: PromotionType
  lines: PromotionSlotFormLine[]
  catalogOptions: PromotionCatalogOption[]
  onChange: (lines: PromotionSlotFormLine[]) => void
  disabled?: boolean
}

function newLineKey(): string {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createEmptySlotLine(label = ""): PromotionSlotFormLine {
  return {
    key: newLineKey(),
    label,
    quantity: "1",
    options: [],
  }
}

export function createEmptyOptionLine(): PromotionOptionFormLine {
  return {
    key: newLineKey(),
    kind: "article",
    refId: "",
  }
}

export function slotLinesToInput(
  lines: PromotionSlotFormLine[],
): PromotionSlotInput[] {
  return lines
    .map((line) => ({
      label: line.label.trim(),
      quantity: Number(line.quantity.replace(",", ".")),
      options: line.options
        .filter((o) => o.refId.trim())
        .map(
          (o): PromotionSlotOptionInput => ({
            kind: o.kind,
            refId: o.refId.trim(),
          }),
        ),
    }))
    .filter((line) => line.label || line.options.length > 0)
}

export function slotLinesFromDetail(
  promotionType: PromotionType,
  slots: {
    label: string
    quantity: number
    options: { kind: PromotionOptionKind; refId: string }[]
  }[],
): PromotionSlotFormLine[] {
  if (promotionType === "quantity_deal") {
    const pool = slots[0]
    return [
      {
        key: newLineKey(),
        label: QUANTITY_DEAL_SLOT_LABEL,
        quantity: "1",
        options: (pool?.options ?? []).map((o) => ({
          key: newLineKey(),
          kind: o.kind,
          refId: o.refId,
        })),
      },
    ]
  }
  if (slots.length === 0) return [createEmptySlotLine()]
  return slots.map((slot) => ({
    key: newLineKey(),
    label: slot.label,
    quantity: String(slot.quantity),
    options: slot.options.map((o) => ({
      key: newLineKey(),
      kind: o.kind,
      refId: o.refId,
    })),
  }))
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n)
}

function optionSelectValue(kind: PromotionOptionKind, refId: string): string {
  return refId ? `${kind}:${refId}` : ""
}

function parseOptionSelectValue(value: string): PromotionOptionFormLine | null {
  const i = value.indexOf(":")
  if (i <= 0) return null
  const kindRaw = value.slice(0, i)
  const refId = value.slice(i + 1)
  if (kindRaw !== "article" && kindRaw !== "recipe") return null
  if (!refId) return null
  return {
    key: newLineKey(),
    kind: kindRaw,
    refId,
  }
}

export function PromotionSlotEditor({
  idPrefix,
  promotionType,
  lines,
  catalogOptions,
  onChange,
  disabled,
}: Props) {
  const articles = useMemo(
    () => catalogOptions.filter((o) => o.kind === "article"),
    [catalogOptions],
  )
  const recipes = useMemo(
    () => catalogOptions.filter((o) => o.kind === "recipe"),
    [catalogOptions],
  )
  const optionsByKey = useMemo(() => {
    const map = new Map<string, PromotionCatalogOption>()
    for (const o of catalogOptions) {
      map.set(`${o.kind}:${o.id}`, o)
    }
    return map
  }, [catalogOptions])

  const isQuantityDeal = promotionType === "quantity_deal"
  const displayLines = isQuantityDeal ? lines.slice(0, 1) : lines

  const updateLine = (index: number, patch: Partial<PromotionSlotFormLine>) => {
    const next = [...lines]
    next[index] = { ...next[index], ...patch }
    onChange(next)
  }

  const removeLine = (index: number) => {
    if (isQuantityDeal || lines.length <= 1) return
    onChange(lines.filter((_, i) => i !== index))
  }

  const addLine = () => {
    onChange([...lines, createEmptySlotLine()])
  }

  const addOption = (slotIndex: number) => {
    const next = [...lines]
    next[slotIndex] = {
      ...next[slotIndex],
      options: [...next[slotIndex].options, createEmptyOptionLine()],
    }
    onChange(next)
  }

  const updateOption = (
    slotIndex: number,
    optIndex: number,
    patch: Partial<PromotionOptionFormLine>,
  ) => {
    const next = [...lines]
    const opts = [...next[slotIndex].options]
    opts[optIndex] = { ...opts[optIndex], ...patch }
    next[slotIndex] = { ...next[slotIndex], options: opts }
    onChange(next)
  }

  const removeOption = (slotIndex: number, optIndex: number) => {
    const next = [...lines]
    next[slotIndex] = {
      ...next[slotIndex],
      options: next[slotIndex].options.filter((_, i) => i !== optIndex),
    }
    onChange(next)
  }

  const setOptionFromSelect = (
    slotIndex: number,
    optIndex: number,
    value: string,
  ) => {
    const parsed = parseOptionSelectValue(value)
    if (!parsed) return
    updateOption(slotIndex, optIndex, parsed)
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={rootsFormFieldLabelClass}>
            {isQuantityDeal ? "Productos y recetas elegibles" : "Ítems del combo"}
          </h3>
          <p className={cn("mt-1 text-xs leading-relaxed", rootsFormEarthTextSecondaryClass)}>
            {isQuantityDeal
              ? "Unidades que participan de la oferta por cantidad."
              : "Cada ítem agrupa las opciones que el cliente puede elegir."}
          </p>
        </div>
        {!isQuantityDeal ? (
          <RootsSubtleButton
            type="button"
            className="shrink-0"
            disabled={disabled}
            onClick={addLine}
          >
            <Plus className="size-4" aria-hidden />
            Ítem
          </RootsSubtleButton>
        ) : null}
      </div>

      <div className="flex flex-col gap-4">
        {displayLines.map((line, slotIndex) => (
          <div
            key={line.key}
            className="rounded-xl border border-border/70 bg-muted/10 p-4"
          >
            {!isQuantityDeal ? (
              <div className="mb-4 flex flex-wrap items-end gap-3">
                <div className="min-w-[10rem] flex-1">
                  <RootsFormTextField
                    label="Nombre del ítem"
                    id={`${idPrefix}-slot-label-${line.key}`}
                    value={line.label}
                    disabled={disabled}
                    placeholder="Ej. Cerveza"
                    onChange={(e) =>
                      updateLine(slotIndex, { label: e.target.value })
                    }
                  />
                </div>
                <div className="w-28 shrink-0">
                  <RootsFormQuantityField
                    label="Cant."
                    id={`${idPrefix}-slot-qty-${line.key}`}
                    value={line.quantity}
                    disabled={disabled}
                    prefix="uds."
                    onChange={(value) => updateLine(slotIndex, { quantity: value })}
                  />
                </div>
                {lines.length > 1 ? (
                  <button
                    type="button"
                    disabled={disabled}
                    className="mb-1 inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                    aria-label="Quitar ítem"
                    onClick={() => removeLine(slotIndex)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-col gap-3">
              {line.options.length === 0 ? (
                <p className={cn("text-xs", rootsFormEarthTextSecondaryClass)}>
                  Todavía no hay opciones en este ítem.
                </p>
              ) : (
                line.options.map((opt, optIndex) => {
                  const meta = optionsByKey.get(`${opt.kind}:${opt.refId}`)
                  return (
                    <div
                      key={opt.key}
                      className="flex flex-wrap items-end gap-2"
                    >
                      <div className="min-w-[220px] flex-1">
                        <RootsFormSelectField
                          label="Producto o receta"
                          id={`${idPrefix}-opt-${opt.key}`}
                          value={optionSelectValue(opt.kind, opt.refId)}
                          onValueChange={(value) =>
                            setOptionFromSelect(slotIndex, optIndex, value)
                          }
                          disabled={disabled}
                          placeholder="Elegir producto o receta"
                        >
                          {articles.length > 0 ? (
                            <SelectGroup>
                              <SelectLabel>Productos</SelectLabel>
                              {articles.map((a) => (
                                <RootsFormSelectItem
                                  key={`article:${a.id}`}
                                  value={`article:${a.id}`}
                                >
                                  {a.name} · {formatMoney(a.salePrice)}
                                </RootsFormSelectItem>
                              ))}
                            </SelectGroup>
                          ) : null}
                          {recipes.length > 0 ? (
                            <SelectGroup>
                              <SelectLabel>Recetas</SelectLabel>
                              {recipes.map((r) => (
                                <RootsFormSelectItem
                                  key={`recipe:${r.id}`}
                                  value={`recipe:${r.id}`}
                                >
                                  {r.name} · {formatMoney(r.salePrice)}
                                </RootsFormSelectItem>
                              ))}
                            </SelectGroup>
                          ) : null}
                        </RootsFormSelectField>
                      </div>
                      {meta ? (
                        <span
                          className={cn(
                            "pb-3 text-xs",
                            rootsFormEarthTextSecondaryClass,
                          )}
                        >
                          {PROMOTION_OPTION_KIND_LABEL[meta.kind]}
                        </span>
                      ) : null}
                      <button
                        type="button"
                        disabled={disabled}
                        className="mb-1 inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                        aria-label="Quitar opción"
                        onClick={() => removeOption(slotIndex, optIndex)}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </div>
                  )
                })
              )}
              <RootsSubtleButton
                type="button"
                className="self-start"
                disabled={disabled}
                onClick={() => addOption(slotIndex)}
              >
                <Plus className="size-4" aria-hidden />
                Agregar opción
              </RootsSubtleButton>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
