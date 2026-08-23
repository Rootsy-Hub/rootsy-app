"use client"

import type { ManufacturableRecipe } from "@/app/[siteId]/[popId]/manufacturing/manufacturingTypes"
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
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormTextField,
} from "@/components/rootsy-form"
import {
  formatInventoryQtyWithUnit,
} from "@/app/[siteId]/[popId]/inventory/inventoryFormat"
import { Dialog } from "@/components/ui/dialog"
import { useEffect, useMemo, useState, type FormEvent } from "react"

type Props = {
  open: boolean
  recipes: ManufacturableRecipe[]
  defaultDay: string
  saving: boolean
  error: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (input: {
    recipeId: string
    quantity: number
    producedAt: string
    expiresAt: string | null
  }) => void | Promise<void>
}

export function ManufacturingDialog({
  open,
  recipes,
  defaultDay,
  saving,
  error,
  onOpenChange,
  onSubmit,
}: Props) {
  const [recipeId, setRecipeId] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [producedAt, setProducedAt] = useState(defaultDay)
  const [expiresAt, setExpiresAt] = useState("")

  useEffect(() => {
    if (!open) return
    setRecipeId(recipes[0]?.id ?? "")
    setQuantity("1")
    setProducedAt(defaultDay)
    setExpiresAt("")
  }, [defaultDay, open, recipes])

  const recipe = useMemo(
    () => recipes.find((item) => item.id === recipeId) ?? null,
    [recipeId, recipes],
  )

  const qty = Number(quantity.replace(",", "."))
  const qtyOk = Number.isFinite(qty) && qty > 0 && qty <= 10000
  const dayOk = /^\d{4}-\d{2}-\d{2}$/.test(producedAt.trim())

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
    Boolean(recipe) && qtyOk && dayOk && !blockedByStock && recipes.length > 0

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit || !recipe) return
    void onSubmit({
      recipeId: recipe.id,
      quantity: qty,
      producedAt: producedAt.trim(),
      expiresAt: expiresAt.trim() || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent showCloseButton={!saving}>
        <RootsDialogForm onSubmit={handleSubmit}>
          <RootsDialogHeader
            open={open}
            title="Fabricar"
            description="Una receta, una cantidad, un día. Baja los insumos y entra el artículo al depósito."
          />
          <RootsDialogBody className="space-y-4">
            {recipes.length === 0 ? (
              <p className="text-sm text-[var(--rootsy-bruma-500)]">
                Ninguna receta declara qué produce. Completalo en Recetas, en
                «Artículo que produce».
              </p>
            ) : (
              <>
                <RootsFormSelectField
                  label="Receta"
                  id="manufacturing-recipe"
                  value={recipeId}
                  onValueChange={setRecipeId}
                  placeholder="Elegir receta"
                >
                  {recipes.map((item) => (
                    <RootsFormSelectItem key={item.id} value={item.id}>
                      {item.name}
                    </RootsFormSelectItem>
                  ))}
                </RootsFormSelectField>
                {recipe ? (
                  <p className="text-xs text-[var(--rootsy-bruma-500)]">
                    Entra {recipe.outputArticleName || "el artículo"} al
                    depósito.
                  </p>
                ) : null}
                <RootsFormTextField
                  label="Cantidad"
                  id="manufacturing-qty"
                  inputMode="decimal"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
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
                    <p className="text-xs font-medium text-[var(--rootsy-bruma-700)]">
                      Insumos que se descuentan
                    </p>
                    <ul className="space-y-1.5">
                      {preview.map((line) => (
                        <li
                          key={line.articleId}
                          className="flex items-start justify-between gap-3 text-sm"
                        >
                          <span className="min-w-0 text-[var(--rootsy-bruma-900)]">
                            {line.articleName}
                          </span>
                          <span
                            className={
                              line.short
                                ? "shrink-0 text-right text-xs text-red-600"
                                : "shrink-0 text-right text-xs text-[var(--rootsy-bruma-500)]"
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
              </>
            )}
            {error ? (
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
  )
}
