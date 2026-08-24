"use client"

import { ManufacturingConfirmDialog } from "@/app/[siteId]/[popId]/manufacturing/ManufacturingConfirmDialog"
import type { ManufacturableRecipe } from "@/app/[siteId]/[popId]/manufacturing/manufacturingTypes"
import { ManufacturingRecipeSearchField } from "@/app/[siteId]/[popId]/manufacturing/ManufacturingRecipeSearchField"
import { RecipeOutputArticleField } from "@/app/[siteId]/[popId]/recipes/components/RecipeOutputArticleField"
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
} from "@/components/rootsy-form"
import { unitOfMeasureAffix } from "@/components/rootsy-form/RootsFormUnitOfMeasureAffix"
import {
  formatInventoryQtyWithUnit,
} from "@/app/[siteId]/[popId]/inventory/inventoryFormat"
import { labelUnitOfMeasure } from "@/lib/articleItemKind"
import { Dialog } from "@/components/ui/dialog"
import { useEffect, useMemo, useState, type FormEvent } from "react"

type Props = {
  open: boolean
  popId: string
  defaultDay: string
  saving: boolean
  error: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (input: {
    recipeId: string
    quantity: number
    producedAt: string
    expiresAt: string | null
    outputArticleId: string | null
  }) => void | Promise<void>
}

export function ManufacturingDialog({
  open,
  popId,
  defaultDay,
  saving,
  error,
  onOpenChange,
  onSubmit,
}: Props) {
  const [recipe, setRecipe] = useState<ManufacturableRecipe | null>(null)
  const [quantity, setQuantity] = useState("1")
  const [producedAt, setProducedAt] = useState(defaultDay)
  const [expiresAt, setExpiresAt] = useState("")
  const [outputArticleId, setOutputArticleId] = useState("")
  const [outputArticleName, setOutputArticleName] = useState("")
  const [outputUnitOfMeasure, setOutputUnitOfMeasure] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmValue, setConfirmValue] = useState("")

  useEffect(() => {
    if (!open) {
      setConfirmOpen(false)
      setConfirmValue("")
      return
    }
    setRecipe(null)
    setQuantity("1")
    setProducedAt(defaultDay)
    setExpiresAt("")
    setOutputArticleId("")
    setOutputArticleName("")
    setOutputUnitOfMeasure("")
    setConfirmOpen(false)
    setConfirmValue("")
  }, [defaultDay, open])

  const qty = Number(quantity.replace(",", "."))
  const qtyOk = Number.isInteger(qty) && qty > 0 && qty <= 10000
  const dayOk = /^\d{4}-\d{2}-\d{2}$/.test(producedAt.trim())
  const outputOk = outputArticleId.trim().length > 0
  const qtyAffix = unitOfMeasureAffix(
    outputUnitOfMeasure || null,
    outputArticleId ? "uds." : "—",
  )
  const qtyUnitLabel = outputUnitOfMeasure
    ? labelUnitOfMeasure(outputUnitOfMeasure)
    : ""

  const preview = useMemo(() => {
    if (!recipe || !qtyOk) return []
    return recipe.ingredients.map((line) => {
      const need = line.consumeQty * qty
      return {
        ...line,
        need,
        short: need > line.onHand + 1e-6,
      }
    })
  }, [qty, qtyOk, recipe])

  const blockedByStock =
    recipe != null &&
    !recipe.allowNegativeStock &&
    preview.some((line) => line.short)

  const canSubmit =
    Boolean(recipe) && qtyOk && dayOk && outputOk && !blockedByStock

  const applyOutput = (input: {
    id: string
    name: string
    unitOfMeasure: string
  }) => {
    setOutputArticleId(input.id)
    setOutputArticleName(input.name)
    setOutputUnitOfMeasure(input.unitOfMeasure)
  }

  const clearOutput = () => {
    setOutputArticleId("")
    setOutputArticleName("")
    setOutputUnitOfMeasure("")
  }

  const handleRecipeSelect = (next: ManufacturableRecipe) => {
    setRecipe(next)
    if (next.outputArticleId) {
      applyOutput({
        id: next.outputArticleId,
        name: next.outputArticleName,
        unitOfMeasure: next.outputUnitOfMeasure,
      })
      return
    }
    clearOutput()
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit || !recipe) return
    setConfirmValue("")
    setConfirmOpen(true)
  }

  const handleConfirm = () => {
    if (!canSubmit || !recipe) return
    void onSubmit({
      recipeId: recipe.id,
      quantity: qty,
      producedAt: producedAt.trim(),
      expiresAt: expiresAt.trim() || null,
      outputArticleId: outputArticleId.trim() || null,
    })
  }

  const closeConfirm = () => {
    if (saving) return
    setConfirmOpen(false)
    setConfirmValue("")
  }

  return (
    <>
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (saving) return
        if (!next) closeConfirm()
        onOpenChange(next)
      }}
    >
      <RootsDialogContent showCloseButton={!saving}>
        <RootsDialogForm onSubmit={handleSubmit}>
          <RootsDialogHeader
            open={open}
            title="Fabricar"
            description="Una receta, una cantidad, un día. Baja los insumos y entra el artículo al depósito."
          />
          <RootsDialogBody className="space-y-4">
            <ManufacturingRecipeSearchField
              id="manufacturing-recipe"
              popId={popId}
              selectedId={recipe?.id ?? ""}
              selectedName={recipe?.name ?? ""}
              onSelect={handleRecipeSelect}
              onClear={() => {
                setRecipe(null)
                clearOutput()
              }}
            />
            <RecipeOutputArticleField
              id="manufacturing-output-article"
              popId={popId}
              selectedId={outputArticleId}
              selectedName={outputArticleName}
              excludeIds={recipe?.ingredients.map((line) => line.articleId) ?? []}
              onSelect={(option) => applyOutput(option)}
              onClear={clearOutput}
            />
            <RootsFormQuantityField
              label={
                qtyUnitLabel ? `Cantidad en ${qtyUnitLabel}` : "Cantidad"
              }
              id="manufacturing-qty"
              value={quantity}
              prefix={qtyAffix.prefix}
              prefixClassName={qtyAffix.prefixClassName}
              disabled={!outputArticleId}
              onChange={setQuantity}
              hint={
                !outputArticleId
                  ? "Elegí el artículo para ver la unidad."
                  : qtyAffix.hint
              }
            />
            <RootsFormDateField
              label="Día"
              id="manufacturing-day"
              value={producedAt}
              onChange={setProducedAt}
            />
            <RootsFormDateField
              label="Vencimiento (opcional)"
              id="manufacturing-expires"
              value={expiresAt}
              onChange={setExpiresAt}
            />
            {preview.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-rootsy-bruma-700">
                  Insumos que se descuentan
                </p>
                <ul className="space-y-1.5">
                  {preview.map((line) => (
                    <li
                      key={line.articleId}
                      className="flex items-start justify-between gap-3 text-sm"
                    >
                      <span className="min-w-0 text-rootsy-bruma-900">
                        {line.articleName}
                      </span>
                      <span
                        className={
                          line.short
                            ? "shrink-0 text-right text-xs text-red-600"
                            : "shrink-0 text-right text-xs text-rootsy-bruma-500"
                        }
                      >
                        {formatInventoryQtyWithUnit(
                          line.need,
                          line.unitOfMeasure,
                        )}
                        {" · hay "}
                        {formatInventoryQtyWithUnit(
                          line.onHand,
                          line.unitOfMeasure,
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                {blockedByStock ? (
                  <p className="text-xs text-red-600">
                    No hay stock suficiente de un insumo. Esta receta no
                    permite quedar en negativo.
                  </p>
                ) : null}
              </div>
            ) : null}
            {error && !confirmOpen ? (
              <RootsDialogErrorBanner>{error}</RootsDialogErrorBanner>
            ) : null}
          </RootsDialogBody>
          <RootsDialogDualActionFooter
            onCancel={() => onOpenChange(false)}
            confirmLabel="Confirmar"
            confirmLoadingLabel="Fabricando…"
            confirmType="submit"
            confirmDisabled={!canSubmit}
            confirmLoading={saving}
          />
        </RootsDialogForm>
      </RootsDialogContent>
    </Dialog>
    <ManufacturingConfirmDialog
      open={confirmOpen}
      recipeName={recipe?.name ?? ""}
      outputArticleName={outputArticleName}
      quantity={qtyOk ? qty : 0}
      unitOfMeasure={outputUnitOfMeasure}
      producedAt={producedAt.trim()}
      expiresAt={expiresAt.trim()}
      lines={preview.map((line) => ({
        articleId: line.articleId,
        articleName: line.articleName,
        itemKind: line.itemKind ?? "raw_material",
        need: line.need,
        unitOfMeasure: line.unitOfMeasure,
      }))}
      confirmValue={confirmValue}
      banner={error}
      busy={saving}
      onOpenChange={(next) => {
        if (next) {
          setConfirmOpen(true)
          return
        }
        closeConfirm()
      }}
      onClose={closeConfirm}
      onConfirmValueChange={setConfirmValue}
      onConfirm={handleConfirm}
    />
    </>
  )
}
