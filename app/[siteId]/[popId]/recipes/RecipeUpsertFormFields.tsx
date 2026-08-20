"use client"

import { ArticleIvaSelect } from "@/app/[siteId]/[popId]/articles/ArticleIvaSelect"
import type { RecipeCategoryOption } from "@/app/[siteId]/[popId]/recipes/actions"
import { RecipeIngredientEditor } from "@/app/[siteId]/[popId]/recipes/components/RecipeIngredientEditor"
import type { RecipeIngredientOption } from "@/app/[siteId]/[popId]/recipes/actions"
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
  rootsFormEarthTextSecondaryClass,
  rootsFormFieldLabelClass,
  rootsFormTwoColRowClass,
} from "@/components/rootsy-form"
import { rootsFormEarthDividerClass } from "@/components/rootsy-form/rootsFormEarthTokens"
import { SalePriceListExtraFields } from "@/components/sale-operation/SalePriceListExtraFields"
import type { SalePriceList } from "@/lib/salePriceLists"
import { cn } from "@/lib/utils"
import type { Dispatch, ReactNode, SetStateAction } from "react"

const sectionDividerClass = cn("h-px w-full shrink-0", rootsFormEarthDividerClass)

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
          <p
            className={cn(
              "mt-1 text-xs leading-relaxed",
              rootsFormEarthTextSecondaryClass,
            )}
          >
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
  form: RecipeFormState
  setForm: Dispatch<SetStateAction<RecipeFormState>>
  categories: RecipeCategoryOption[]
  priceLists?: SalePriceList[]
  ingredientOptions: RecipeIngredientOption[]
  disabled?: boolean
}

export function RecipeUpsertFormFields({
  idPrefix,
  siteId,
  form,
  setForm,
  categories,
  priceLists = [],
  ingredientOptions,
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
              disabled={disabled}
              placeholder="Elegir categoría"
            >
              {activeCategories.map((category) => (
                <RootsFormSelectItem key={category.id} value={category.id}>
                  {category.name}
                </RootsFormSelectItem>
              ))}
            </RootsFormSelectField>
            <RootsFormTextField
              label="Imagen (URL)"
              id={`${idPrefix}-image`}
              value={form.imageUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, imageUrl: e.target.value }))
              }
              placeholder="https://…"
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
              lists={priceLists}
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
          </FormSection>

          <div className={sectionDividerClass} />

          <RecipeIngredientEditor
            idPrefix={idPrefix}
            lines={form.ingredients}
            options={ingredientOptions}
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
