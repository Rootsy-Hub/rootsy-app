"use client"

import type { InventoryArticleSearchHit } from "@/app/[siteId]/[popId]/inventory/actions"
import { searchInventoryArticles } from "@/lib/rootsyApi/inventoryClient"
import type { InventoryLocationRow } from "@/lib/inventory/inventoryLocations"
import { formatInventoryQtyWithUnit } from "@/app/[siteId]/[popId]/inventory/inventoryFormat"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import {
  RootsFormDateField,
  RootsFormQuantityField,
  RootsFormSearchField,
  RootsFormSegmentField,
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormTextareaField,
  unitOfMeasureAffix,
} from "@/components/rootsy-form"
import { RootsSubtleButton } from "@/components/rootsy-button"
import {
  rootsFormDropdownHighlightItemClassForTone,
  rootsFormDropdownListClass,
  rootsFormSelectContentClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { Dialog } from "@/components/ui/dialog"
import { labelUnitOfMeasure, shortUnitOfMeasure } from "@/lib/articleItemKind"
import { cn } from "@/lib/utils"
import { useEffect, useState, type FormEvent } from "react"

type Props = {
  open: boolean
  popId: string
  onOpenChange: (open: boolean) => void
  articleId: string
  articleName: string
  unitOfMeasure: string
  onArticleChange: (article: {
    id: string
    name: string
    unitOfMeasure: string
  }) => void
  addStock: boolean
  onAddStockChange: (add: boolean) => void
  locations: InventoryLocationRow[]
  locationId: string
  onLocationChange: (id: string) => void
  qty: string
  onQtyChange: (qty: string) => void
  note: string
  onNoteChange: (note: string) => void
  expiresAt: string
  onExpiresAtChange: (iso: string) => void
  onHand: number | null
  stockLoading: boolean
  stockError: string | null
  banner: string | null
  saving: boolean
  onSubmit: (e: FormEvent) => void
}

export function InventoryAdjustmentDialog({
  open,
  popId,
  onOpenChange,
  articleId,
  articleName,
  unitOfMeasure,
  onArticleChange,
  addStock,
  onAddStockChange,
  locations,
  locationId,
  onLocationChange,
  qty,
  onQtyChange,
  note,
  onNoteChange,
  expiresAt,
  onExpiresAtChange,
  onHand,
  stockLoading,
  stockError,
  banner,
  saving,
  onSubmit,
}: Props) {
  const [query, setQuery] = useState(articleName)
  const [results, setResults] = useState<InventoryArticleSearchHit[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    if (!open) {
      setResults([])
      setSearching(false)
      setSearchError(null)
      setHasSearched(false)
      return
    }
    setQuery(articleName)
  }, [open, articleName])

  useEffect(() => {
    if (!open) return
    const trimmed = query.trim()
    if (articleId && trimmed === articleName.trim()) {
      setResults([])
      setSearching(false)
      setSearchError(null)
      setHasSearched(false)
      return
    }
    if (trimmed.length < 2) {
      setResults([])
      setSearching(false)
      setSearchError(null)
      setHasSearched(false)
      return
    }

    let cancelled = false
    setSearching(true)
    setSearchError(null)
    const timer = window.setTimeout(async () => {
      const res = await searchInventoryArticles(popId, trimmed)
      if (cancelled) return
      setSearching(false)
      setHasSearched(true)
      if (!res.success) {
        setSearchError(res.error)
        setResults([])
        return
      }
      setResults(res.articles)
    }, 280)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [articleId, articleName, open, popId, query])

  const parsedQty = parseInt(qty, 10)
  const qtyValid =
    Number.isFinite(parsedQty) && parsedQty >= 1 && parsedQty <= 10000
  const maxSubtract = onHand === null ? 0 : Math.min(10000, Math.floor(onHand))
  const canSubmit =
    Boolean(articleId) &&
    qtyValid &&
    note.trim().length > 0 &&
    (addStock || (onHand !== null && parsedQty <= maxSubtract))
  const stockAfter =
    onHand !== null && !stockLoading && Number.isFinite(parsedQty)
      ? Math.round((onHand + (addStock ? parsedQty : -parsedQty)) * 1e6) / 1e6
      : null
  const showResults =
    !articleId &&
    query.trim().length >= 2 &&
    (searching || hasSearched)

  const selectArticle = (hit: InventoryArticleSearchHit) => {
    onArticleChange({
      id: hit.id,
      name: hit.name,
      unitOfMeasure: hit.unitOfMeasure,
    })
    setQuery(hit.name)
    setResults([])
  }

  const qtyUnit = shortUnitOfMeasure(unitOfMeasure)
  const qtyAffix = unitOfMeasureAffix(unitOfMeasure || null, "—")
  const confirmLabel = !qtyValid
    ? addStock
      ? "Sumar"
      : "Restar"
    : addStock
      ? `Sumar ${formatInventoryQtyWithUnit(parsedQty, unitOfMeasure)}`
      : `Restar ${formatInventoryQtyWithUnit(parsedQty, unitOfMeasure)}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="default">
        <RootsDialogHeader
          open={open}
          title={addStock ? "Sumar stock" : "Restar stock"}
          description="Elegí el artículo, la cantidad y el motivo."
        />
        <RootsDialogForm onSubmit={onSubmit}>
          <RootsDialogBody className="space-y-4">
            {banner ? <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner> : null}

            <div>
              <RootsFormSearchField
                label="Artículo"
                value={query}
                placeholder="Nombre, SKU o código"
                onChange={(event) => {
                  const next = event.target.value
                  setQuery(next)
                  if (articleId) {
                    onArticleChange({ id: "", name: "", unitOfMeasure: "" })
                  }
                }}
                onClear={() => {
                  setQuery("")
                  setResults([])
                  setHasSearched(false)
                  onArticleChange({ id: "", name: "", unitOfMeasure: "" })
                }}
              />
              {showResults ? (
                <div
                  className={cn(
                    "mt-2 max-h-48 overflow-y-auto",
                    rootsFormSelectContentClass,
                    "w-full min-w-0 max-w-none",
                  )}
                >
                  {searching ? (
                    <div className="flex items-center justify-center py-6">
                      <RootsSpinner size="default" />
                      <span className="sr-only">Buscando artículos</span>
                    </div>
                  ) : searchError ? (
                    <p className="px-3 py-3 text-sm text-destructive">{searchError}</p>
                  ) : results.length === 0 ? (
                    <p className="px-3 py-3 text-sm text-rootsy-bruma-500">
                      No hay artículos con eso.
                    </p>
                  ) : (
                    <ul className={rootsFormDropdownListClass}>
                      {results.map((hit) => (
                        <li key={hit.id}>
                          <button
                            type="button"
                            className={cn(
                              "flex w-full flex-col items-start px-3 py-2.5 text-left text-sm",
                              rootsFormDropdownHighlightItemClassForTone(
                                "light",
                                "default",
                              ),
                            )}
                            onClick={() => selectArticle(hit)}
                          >
                            <span className="font-medium text-rootsy-bruma-900">
                              {hit.name}
                            </span>
                            {hit.unitOfMeasure || hit.sku || hit.barcode ? (
                              <span className="text-xs text-rootsy-bruma-500">
                                {[
                                  hit.unitOfMeasure
                                    ? labelUnitOfMeasure(hit.unitOfMeasure)
                                    : null,
                                  hit.sku,
                                  hit.barcode,
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </span>
                            ) : null}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
              <p className="mt-1.5 min-h-5 font-canopy text-xs text-rootsy-bruma-500">
                {stockLoading ? (
                  "Consultando stock…"
                ) : stockError ? (
                  <span className="text-destructive">{stockError}</span>
                ) : articleId && onHand !== null ? (
                  `Hay ahora: ${formatInventoryQtyWithUnit(onHand, unitOfMeasure)}`
                ) : query.trim().length > 0 && query.trim().length < 2 ? (
                  "Escribí al menos 2 letras o un código."
                ) : (
                  "\u00a0"
                )}
              </p>
            </div>

            {locations.length > 1 ? (
              <RootsFormSelectField
                label="Depósito"
                value={locationId}
                onValueChange={onLocationChange}
              >
                {locations.map((location) => (
                  <RootsFormSelectItem key={location.id} value={location.id}>
                    {location.name}
                  </RootsFormSelectItem>
                ))}
              </RootsFormSelectField>
            ) : null}

            <RootsFormSegmentField
              label="Qué hacer"
              value={addStock ? "add" : "remove"}
              onValueChange={(value) => onAddStockChange(value === "add")}
              options={[
                { value: "remove", label: "Restar" },
                { value: "add", label: "Sumar" },
              ]}
            />

            <RootsFormQuantityField
              label={qtyUnit ? `Cantidad en ${labelUnitOfMeasure(unitOfMeasure)}` : "Cantidad"}
              id="inv-qty"
              value={qty}
              prefix={qtyAffix.prefix}
              prefixClassName={qtyAffix.prefixClassName}
              disabled={!articleId}
              max={
                addStock
                  ? 10000
                  : Math.max(1, Math.min(10000, Math.floor(onHand ?? 0)))
              }
              onChange={onQtyChange}
              hint={
                !articleId
                  ? "Primero elegí el artículo para saber la unidad."
                  : [
                      qtyAffix.hint,
                      onHand !== null && !stockLoading && stockAfter !== null
                        ? `Después: ${formatInventoryQtyWithUnit(stockAfter, unitOfMeasure)}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || undefined
              }
            />

            {addStock ? (
              <div className="space-y-2">
                <RootsFormDateField
                  label="Vencimiento"
                  value={expiresAt}
                  onChange={onExpiresAtChange}
                  placeholder="Sin fecha"
                  hint="Opcional. Queda en este lote."
                />
                {expiresAt ? (
                  <RootsSubtleButton
                    type="button"
                    size="compact"
                    onClick={() => onExpiresAtChange("")}
                  >
                    Quitar fecha
                  </RootsSubtleButton>
                ) : null}
              </div>
            ) : null}

            <RootsFormTextareaField
              label="Motivo"
              id="inv-note"
              rows={2}
              required
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              placeholder="Conteo, merma, hallazgo…"
            />
          </RootsDialogBody>
          <RootsDialogDualActionFooter
            onCancel={() => onOpenChange(false)}
            confirmType="submit"
            confirmLabel={confirmLabel}
            confirmDisabled={
              saving ||
              stockLoading ||
              stockError != null ||
              !canSubmit
            }
            confirmLoading={saving}
            confirmLoadingLabel="Aplicando…"
          />
        </RootsDialogForm>
      </RootsDialogContent>
    </Dialog>
  )
}
