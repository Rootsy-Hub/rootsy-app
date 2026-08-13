"use client"

import type { ServiceArticleOption } from "@/app/[siteId]/[popId]/services/actions"
import {
  serviceDialogAddActionClass,
  serviceDialogEmptyHintClass,
  serviceDialogPanelClass,
} from "@/app/[siteId]/[popId]/services/serviceDialogShared"
import { RootsSubtleButton } from "@/components/rootsy-button"
import {
  RootsFormQuantityField,
  RootsFormSelectField,
  RootsFormSelectItem,
} from "@/components/rootsy-form"
import { unitOfMeasureAffix } from "@/components/rootsy-form/RootsFormUnitOfMeasureAffix"
import { Plus, Trash2 } from "lucide-react"
import { useMemo } from "react"

export type ServiceArticleFormLine = {
  key: string
  articleId: string
  quantity: string
}

type Props = {
  idPrefix: string
  lines: ServiceArticleFormLine[]
  options: ServiceArticleOption[]
  onChange: (lines: ServiceArticleFormLine[]) => void
  disabled?: boolean
  error?: string
}

function newLineKey(): string {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createEmptyServiceArticleLine(): ServiceArticleFormLine {
  return {
    key: newLineKey(),
    articleId: "",
    quantity: "1",
  }
}

export function ServiceArticlesEditor({
  idPrefix,
  lines,
  options,
  onChange,
  disabled = false,
  error,
}: Props) {
  const optionsById = useMemo(
    () => new Map(options.map((o) => [o.id, o])),
    [options],
  )
  const usedIds = new Set(lines.map((l) => l.articleId).filter(Boolean))

  const updateLine = (key: string, patch: Partial<ServiceArticleFormLine>) => {
    onChange(lines.map((line) => (line.key === key ? { ...line, ...patch } : line)))
  }

  const removeLine = (key: string) => {
    onChange(lines.filter((line) => line.key !== key))
  }

  const addLine = () => {
    onChange([...lines, createEmptyServiceArticleLine()])
  }

  if (options.length === 0) {
    return (
      <p className={serviceDialogEmptyHintClass}>
        No hay artículos con stock en este punto de venta. Podés omitir este paso
        o cargar artículos primero.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? (
        <p className="text-sm text-[var(--rootsy-coral-700)]">{error}</p>
      ) : null}

      {lines.length === 0 ? (
        <p className={serviceDialogEmptyHintClass}>
          Opcional — relacioná insumos o productos de stock que se consumen por
          período al prestar este servicio.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {lines.map((line, index) => {
            const opt = line.articleId ? optionsById.get(line.articleId) : null
            const quantityAffix = unitOfMeasureAffix(opt?.unitOfMeasure)
            return (
              <div key={line.key} className={serviceDialogPanelClass}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1">
                    <RootsFormSelectField
                      label={`Artículo ${index + 1}`}
                      id={`${idPrefix}-article-${line.key}`}
                      value={line.articleId}
                      onValueChange={(value) =>
                        updateLine(line.key, { articleId: value })
                      }
                      disabled={disabled}
                      placeholder="Elegí un artículo"
                    >
                      {options.map((o) => (
                        <RootsFormSelectItem
                          key={o.id}
                          value={o.id}
                          disabled={usedIds.has(o.id) && o.id !== line.articleId}
                        >
                          {o.name}
                        </RootsFormSelectItem>
                      ))}
                    </RootsFormSelectField>
                  </div>

                  <div className="w-full sm:w-36">
                    <RootsFormQuantityField
                      label="Cantidad"
                      id={`${idPrefix}-qty-${line.key}`}
                      value={line.quantity}
                      onChange={(value) => updateLine(line.key, { quantity: value })}
                      disabled={disabled || !line.articleId}
                      prefix={quantityAffix.prefix}
                      prefixClassName={quantityAffix.prefixClassName}
                      hint={quantityAffix.hint}
                    />
                  </div>

                  <RootsSubtleButton
                    type="button"
                    onClick={() => removeLine(line.key)}
                    disabled={disabled}
                    aria-label="Quitar artículo"
                    className="shrink-0 self-end"
                  >
                    <Trash2 className="size-4" />
                  </RootsSubtleButton>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button
        type="button"
        className={serviceDialogAddActionClass}
        onClick={addLine}
        disabled={disabled || lines.length >= options.length}
      >
        <Plus className="size-4" />
        Agregar artículo
      </button>
    </div>
  )
}
