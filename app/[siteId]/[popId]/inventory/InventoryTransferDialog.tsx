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
  RootsFormQuantityField,
  RootsFormSearchField,
  RootsFormSelectField,
  RootsFormSelectItem,
  unitOfMeasureAffix,
} from "@/components/rootsy-form"
import {
  rootsFormDropdownHighlightItemClassForTone,
  rootsFormDropdownListClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { Dialog } from "@/components/ui/dialog"
import { labelUnitOfMeasure, shortUnitOfMeasure } from "@/lib/articleItemKind"
import { cn } from "@/lib/utils"
import { useEffect, useState, type FormEvent } from "react"

type Props = {
  open: boolean
  popId: string
  locations: InventoryLocationRow[]
  onOpenChange: (open: boolean) => void
  articleId: string
  articleName: string
  unitOfMeasure: string
  onArticleChange: (article: {
    id: string
    name: string
    unitOfMeasure: string
  }) => void
  fromLocationId: string
  toLocationId: string
  onFromLocationChange: (id: string) => void
  onToLocationChange: (id: string) => void
  qty: string
  onQtyChange: (qty: string) => void
  onHand: number | null
  stockLoading: boolean
  stockError: string | null
  banner: string | null
  saving: boolean
  onGoLocations: () => void
  onSubmit: (e: FormEvent) => void
}

export function InventoryTransferDialog({
  open,
  popId,
  locations,
  onOpenChange,
  articleId,
  articleName,
  unitOfMeasure,
  onArticleChange,
  fromLocationId,
  toLocationId,
  onFromLocationChange,
  onToLocationChange,
  qty,
  onQtyChange,
  onHand,
  stockLoading,
  stockError,
  banner,
  saving,
  onGoLocations,
  onSubmit,
}: Props) {
  const [query, setQuery] = useState(articleName)
  const [results, setResults] = useState<InventoryArticleSearchHit[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const canTransfer = locations.length >= 2

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
    if (!open || !canTransfer) return
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
  }, [articleId, articleName, canTransfer, open, popId, query])

  const parsedQty = parseInt(qty, 10)
  const qtyValid =
    Number.isFinite(parsedQty) && parsedQty >= 1 && parsedQty <= 10000
  const maxMove = onHand === null ? 0 : Math.min(10000, Math.floor(onHand))
  const canSubmit =
    canTransfer &&
    Boolean(articleId) &&
    fromLocationId !== toLocationId &&
    qtyValid &&
    onHand !== null &&
    parsedQty <= maxMove
  const showResults =
    !articleId && query.trim().length >= 2 && (searching || hasSearched)
  const qtyUnit = shortUnitOfMeasure(unitOfMeasure)
  const qtyAffix = unitOfMeasureAffix(unitOfMeasure || null, "—")
  const confirmLabel =
    qtyValid && articleId
      ? `Mover ${formatInventoryQtyWithUnit(parsedQty, unitOfMeasure)}`
      : "Mover"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="default">
        <RootsDialogHeader
          open={open}
          title="Traslado"
          description="Mover stock de un depósito a otro. El costo y el vencimiento viajan con el lote."
        />
        <RootsDialogForm onSubmit={onSubmit}>
          <RootsDialogBody className="space-y-4">
            {banner ? <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner> : null}

            {!canTransfer ? (
              <p className="font-canopy text-sm leading-relaxed text-rootsy-bruma-700">
                Necesitás al menos dos depósitos. Creá el segundo y después
                trasladá.
              </p>
            ) : (
              <>
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
                      onArticleChange({ id: "", name: "", unitOfMeasure: "" })
                    }}
                  />
                  {showResults ? (
                    <div className="relative mt-1.5">
                      {searching ? (
                        <div className="flex items-center gap-2 px-1 py-2 font-canopy text-xs text-rootsy-bruma-500">
                          <RootsSpinner className="size-3.5" />
                          Buscando…
                        </div>
                      ) : searchError ? (
                        <p className="font-canopy text-xs text-destructive">
                          {searchError}
                        </p>
                      ) : results.length === 0 && hasSearched ? (
                        <p className="font-canopy text-xs text-rootsy-bruma-500">
                          No hay artículos con eso.
                        </p>
                      ) : (
                        <ul className={rootsFormDropdownListClass}>
                          {results.map((hit) => (
                            <li key={hit.id}>
                              <button
                                type="button"
                                className={cn(
                                  rootsFormDropdownHighlightItemClassForTone("light"),
                                  "w-full px-3 py-2 text-left",
                                )}
                                onClick={() => {
                                  onArticleChange({
                                    id: hit.id,
                                    name: hit.name,
                                    unitOfMeasure: hit.unitOfMeasure,
                                  })
                                  setQuery(hit.name)
                                  setResults([])
                                }}
                              >
                                <span className="block font-canopy text-sm text-rootsy-bruma-900">
                                  {hit.name}
                                </span>
                                {hit.sku || hit.barcode ? (
                                  <span className="block font-canopy text-xs text-rootsy-bruma-500">
                                    {[hit.sku, hit.barcode].filter(Boolean).join(" · ")}
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
                    {stockLoading
                      ? "Consultando stock del origen…"
                      : stockError
                        ? <span className="text-destructive">{stockError}</span>
                        : articleId && onHand !== null
                          ? `Hay en origen: ${formatInventoryQtyWithUnit(onHand, unitOfMeasure)}`
                          : "\u00a0"}
                  </p>
                </div>

                <RootsFormSelectField
                  label="Desde"
                  value={fromLocationId}
                  onValueChange={onFromLocationChange}
                >
                  {locations.map((location) => (
                    <RootsFormSelectItem key={location.id} value={location.id}>
                      {location.name}
                    </RootsFormSelectItem>
                  ))}
                </RootsFormSelectField>

                <RootsFormSelectField
                  label="Hasta"
                  value={toLocationId}
                  onValueChange={onToLocationChange}
                >
                  {locations.map((location) => (
                    <RootsFormSelectItem key={location.id} value={location.id}>
                      {location.name}
                    </RootsFormSelectItem>
                  ))}
                </RootsFormSelectField>

                <RootsFormQuantityField
                  label={
                    qtyUnit
                      ? `Cantidad en ${labelUnitOfMeasure(unitOfMeasure)}`
                      : "Cantidad"
                  }
                  id="inv-transfer-qty"
                  value={qty}
                  prefix={qtyAffix.prefix}
                  prefixClassName={qtyAffix.prefixClassName}
                  disabled={!articleId}
                  max={Math.max(1, maxMove)}
                  onChange={onQtyChange}
                />
              </>
            )}
          </RootsDialogBody>
          <RootsDialogDualActionFooter
            onCancel={() => onOpenChange(false)}
            confirmType={canTransfer ? "submit" : "button"}
            confirmLabel={canTransfer ? confirmLabel : "Ir a depósitos"}
            confirmDisabled={canTransfer ? !canSubmit || saving : false}
            onConfirm={canTransfer ? undefined : onGoLocations}
          />
        </RootsDialogForm>
      </RootsDialogContent>
    </Dialog>
  )
}
