"use client"

import { ArticleIvaSelect } from "@/app/[siteId]/[popId]/articles/ArticleIvaSelect"
import { RecipeImageUploadField } from "@/app/[siteId]/[popId]/recipes/RecipeImageUploadField"
import type { RecipeCategoryOption } from "@/app/[siteId]/[popId]/recipes/actions"
import { RecipeIngredientEditor } from "@/app/[siteId]/[popId]/recipes/components/RecipeIngredientEditor"
import { RecipeOutputArticleField } from "@/app/[siteId]/[popId]/recipes/components/RecipeOutputArticleField"
import type { RecipeFormState } from "@/app/[siteId]/[popId]/recipes/recipeFormState"
import {
  RootsFormGrid,
  RootsFormMoneyField,
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormSwitchField,
  RootsFormTextField,
  RootsFormTextareaField,
  rootsFormColumnClass,
  rootsFormFieldLabelClass,
  rootsFormTwoColRowClass,
} from "@/components/rootsy-form"
import { SalePriceListExtraFields } from "@/components/sale-operation/SalePriceListExtraFields"
import type { SalePriceList } from "@/lib/salePriceLists"
import { cn } from "@/lib/utils"
import type { Dispatch, ReactNode, SetStateAction } from "react"

const sectionDividerClass = "h-px w-full shrink-0 bg-[var(--rootsy-bruma-200)]"

function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h3 className={rootsFormFieldLabelClass}>{title}</h3>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-[var(--rootsy-bruma-500)]">
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

type Props = {
  idPrefix: string
  siteId: string
  popId: string
  form: RecipeFormState
  setForm: Dispatch<SetStateAction<RecipeFormState>>
  categories: RecipeCategoryOption[]
  categoriesLoading?: boolean
  priceLists?: SalePriceList[]
  priceListsLoading?: boolean
  disabled?: boolean
}

export function RecipeUpsertFormFields({
  idPrefix,
  siteId,
  popId,
  form,
  setForm,
  categories,
  categoriesLoading = false,
  priceLists = [],
  priceListsLoading = false,
  disabled = false,
}: Props) {
  const activeCategories = categories.filter((c) => c.isActive)

  return (
    <div className={cn(rootsFormColumnClass, "gap-6")}>
      <RootsFormGrid>
        <div className={cn(rootsFormColumnClass, "gap-6")}>
          <FormSection
            title="General"
            description="Datos visibles en el menú y al vender."
          >
            <RootsFormTextField
              label="Nombre"
              id={`${idPrefix}-name`}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              disabled={disabled}
            />
            <RootsFormTextareaField
              label="Descripción"
              id={`${idPrefix}-desc`}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={2}
              placeholder="Opcional"
              disabled={disabled}
            />
            <RootsFormSelectField
              label="Categoría"
              id={`${idPrefix}-category`}
              value={form.categoryId}
              onValueChange={(value) =>
                setForm((f) => ({ ...f, categoryId: value }))
              }
              disabled={disabled || categoriesLoading}
              placeholder={
                categoriesLoading ? "Cargando categorías…" : "Elegir categoría"
              }
            >
              {activeCategories.map((category) => (
                <RootsFormSelectItem key={category.id} value={category.id}>
                  {category.name}
                </RootsFormSelectItem>
              ))}
            </RootsFormSelectField>
            <RecipeImageUploadField
              id={`${idPrefix}-image`}
              popId={popId}
              value={form.imageUrl}
              onChange={(imageUrl) =>
                setForm((f) => ({ ...f, imageUrl }))
              }
              disabled={disabled}
            />
          </FormSection>

          <div className={sectionDividerClass} />

          <FormSection title="Precio e impuestos">
            <div className={rootsFormTwoColRowClass}>
              <RootsFormMoneyField
                label="Precio venta"
                id={`${idPrefix}-sale`}
                value={form.salePrice}
                onChange={(value) =>
                  setForm((f) => ({ ...f, salePrice: value }))
                }
                disabled={disabled}
              />
              <ArticleIvaSelect
                id={`${idPrefix}-iva`}
                siteId={siteId}
                value={form.iva}
                onChange={(value) => setForm((f) => ({ ...f, iva: value }))}
                disabled={disabled}
              />
            </div>
            <SalePriceListExtraFields
              idPrefix={idPrefix}
              lists={priceListsLoading ? [] : priceLists}
              values={form.listPrices ?? {}}
              onChange={(listId, value) =>
                setForm((f) => ({
                  ...f,
                  listPrices: { ...f.listPrices, [listId]: value },
                }))
              }
              disabled={disabled}
            />
          </FormSection>
        </div>

        <div className={cn(rootsFormColumnClass, "gap-6")}>
          <FormSection title="Estado">
            <RootsFormSwitchField
              label="Receta activa"
              id={`${idPrefix}-active`}
              checked={form.isActive}
              onCheckedChange={(checked) =>
                setForm((f) => ({ ...f, isActive: checked }))
              }
              disabled={disabled}
            />
            <RootsFormSwitchField
              label="Vender con stock negativo"
              description="Permite vender aunque algún ingrediente quede por debajo de cero."
              id={`${idPrefix}-allow-negative-stock`}
              checked={form.allowNegativeStock}
              onCheckedChange={(checked) =>
                setForm((f) => ({ ...f, allowNegativeStock: checked }))
              }
              disabled={disabled}
            />
          </FormSection>

          <div className={sectionDividerClass} />

          <FormSection
            title="Fabricar"
            description="Si esta receta fabrica un lote (medialunas, salsa), elegí el artículo que entra al depósito. Si se descuenta al vender, dejalo vacío."
          >
            <RecipeOutputArticleField
              id={`${idPrefix}-output-article`}
              popId={popId}
              selectedId={form.outputArticleId}
              selectedName={form.outputArticleName}
              excludeIds={form.ingredients
                .map((line) => line.articleId)
                .filter(Boolean)}
              onSelect={(option) =>
                setForm((f) => ({
                  ...f,
                  outputArticleId: option.id,
                  outputArticleName: option.name,
                }))
              }
              onClear={() =>
                setForm((f) => ({
                  ...f,
                  outputArticleId: "",
                  outputArticleName: "",
                }))
              }
              disabled={disabled}
            />
          </FormSection>

          <div className={sectionDividerClass} />

          <RecipeIngredientEditor
            idPrefix={idPrefix}
            popId={popId}
            lines={form.ingredients}
            disabled={disabled}
            onChange={(ingredients) =>
              setForm((f) => ({ ...f, ingredients }))
            }
          />
        </div>
      </RootsFormGrid>
    </div>
  )
}
