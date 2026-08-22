"use client"

import type { ArticleCategoryOption } from "@/app/[siteId]/[popId]/articles/actions"
import { ArticleCatalogDiscountField } from "@/app/[siteId]/[popId]/articles/ArticleCatalogDiscountField"
import type { ArticleCatalogExtraFormState } from "@/app/[siteId]/[popId]/articles/ArticleCatalogExtraFields"
import { ArticleImageUploadField } from "@/app/[siteId]/[popId]/articles/ArticleImageUploadField"
import { ArticleIvaSelect } from "@/app/[siteId]/[popId]/articles/ArticleIvaSelect"
import type { ArticleItemFormState } from "@/app/[siteId]/[popId]/articles/ArticleItemFormFields"
import { ArticleItemKindSelector } from "@/app/[siteId]/[popId]/articles/ArticleItemKindSelector"
import { ArticleUnitOfMeasureField } from "@/app/[siteId]/[popId]/articles/ArticleUnitOfMeasureField"
import {
  ArticleCostEditor,
  type ArticleCostFormLine,
} from "@/app/[siteId]/[popId]/articles/components/ArticleCostEditor"
import {
  RootsFormMoneyField,
  RootsFormQuantityField,
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormSwitchField,
  RootsFormTextField,
  RootsFormLabelInfo,
  rootsFormFieldLabelClass,
  rootsFormTwoColRowClass,
} from "@/components/rootsy-form"
import { labelUnitOfMeasure, type ArticleItemKind } from "@/lib/articleItemKind"
import { SalePriceListExtraFields } from "@/components/sale-operation/SalePriceListExtraFields"
import { parseMoneyInput } from "@/lib/moneyInput"
import type { SalePriceList } from "@/lib/salePriceLists"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export type ArticleUpsertFormState = ArticleItemFormState &
  ArticleCatalogExtraFormState & {
    name: string
    description: string
    imageUrl: string
    sku: string
    barcode: string
    salePrice: string
    iva: string
    categoryId: string
    isActive: boolean
    allowNegativeStock: boolean
    itemKind: ArticleItemKind
    initialStock?: string
    listPrices?: Record<string, string>
  }

export type ArticleUpsertWizardStep = 1 | 2 | 3 | 4

export const ARTICLE_UPSERT_WIZARD_STEPS: {
  step: ArticleUpsertWizardStep
  label: string
}[] = [
  { step: 1, label: "Datos" },
  { step: 2, label: "Precios" },
  { step: 3, label: "Detalles" },
  { step: 4, label: "Resumen" },
]

const SKU_LABEL_INFO =
  "Código propio para identificar el artículo en stock e inventario."
const BARCODE_LABEL_INFO =
  "Se imprime en el ticket de venta. Solo para productos de venta."
const IVA_LABEL_INFO =
  "El tipo de IVA seleccionado está incluido en el precio de venta."
const COMPRA_SECTION_INFO =
  "Referencia para cargar compras. El costo real se registra al confirmar cada compra."

type Props = {
  idPrefix: string
  siteId: string
  popId: string
  form: ArticleUpsertFormState
  onChange: (patch: Partial<ArticleUpsertFormState>) => void
  onItemKindChange: (kind: ArticleItemKind) => void
  categories: ArticleCategoryOption[]
  categoriesLoading?: boolean
  priceLists?: SalePriceList[]
  priceListsLoading?: boolean
  supplierOptions: { id: string; name: string }[]
  costLines: ArticleCostFormLine[]
  onCostLinesChange: (lines: ArticleCostFormLine[]) => void
  canPostInitialStock?: boolean
  mode: "create" | "edit"
  step: ArticleUpsertWizardStep
  fieldErrors?: ArticleUpsertFieldErrors
  disabled?: boolean
}

function WizardSection({
  title,
  labelInfo,
  children,
  className,
}: {
  title: string
  labelInfo?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <h3
        className={cn(
          rootsFormFieldLabelClass,
          "inline-flex items-center gap-1.5",
        )}
      >
        {title}
        {labelInfo ? (
          <RootsFormLabelInfo
            content={labelInfo}
            ariaLabel={`Información sobre ${title}`}
          />
        ) : null}
      </h3>
      {children}
    </section>
  )
}

export type ArticleUpsertFieldErrors = {
  categoryId?: string
  name?: string
  iva?: string
  salePrice?: string
}

export function hasArticleUpsertFieldErrors(
  errors: ArticleUpsertFieldErrors,
): boolean {
  return Object.values(errors).some(Boolean)
}

export function validateArticleUpsertWizardStep(
  step: ArticleUpsertWizardStep,
  form: ArticleUpsertFormState,
): ArticleUpsertFieldErrors {
  const errors: ArticleUpsertFieldErrors = {}

  if (step === 1) {
    if (!form.categoryId.trim()) {
      errors.categoryId = "Elegí una categoría."
    }
    if (!form.name.trim()) {
      errors.name = "Indicá el nombre del artículo."
    }
    return errors
  }

  if (step === 2) {
    if (!form.iva.trim()) {
      errors.iva = "Elegí el tipo de IVA."
    }
    if (form.itemKind === "merchandise") {
      const price = parseMoneyInput(form.salePrice, -1)
      if (!Number.isFinite(price) || price < 0) {
        errors.salePrice = "Indicá un precio de venta válido."
      }
    }
    return errors
  }

  return errors
}

export function ArticleUpsertFormFields({
  idPrefix,
  siteId,
  popId,
  form,
  onChange,
  onItemKindChange,
  categories,
  categoriesLoading = false,
  priceLists = [],
  priceListsLoading = false,
  supplierOptions,
  costLines,
  onCostLinesChange,
  canPostInitialStock = false,
  mode,
  step,
  fieldErrors = {},
  disabled = false,
}: Props) {
  const isMerchandise = form.itemKind === "merchandise"
  const parsedSalePrice = parseMoneyInput(form.salePrice, 0)
  const saleUomLabel = labelUnitOfMeasure(form.unitOfMeasure)
  const showInitialStock = mode === "create" && canPostInitialStock

  if (step === 4) {
    return null
  }

  if (step === 1) {
    return (
      <div className="flex flex-col gap-4">
        <ArticleItemKindSelector
          value={form.itemKind}
          onChange={onItemKindChange}
          readOnly={mode === "edit"}
          disabled={disabled}
        />

        <RootsFormSelectField
          label="Categoría"
          id={`${idPrefix}-cat`}
          value={form.categoryId}
          onValueChange={(value) => onChange({ categoryId: value })}
          disabled={disabled || categoriesLoading}
          placeholder={
            categoriesLoading ? "Cargando categorías…" : "Elegir categoría…"
          }
          valueLabel={categoriesLoading ? "Cargando categorías…" : undefined}
          error={fieldErrors.categoryId}
          invalid={Boolean(fieldErrors.categoryId)}
        >
          {categories.map((category) => (
            <RootsFormSelectItem key={category.id} value={category.id}>
              {category.name}
            </RootsFormSelectItem>
          ))}
        </RootsFormSelectField>

        <div className={rootsFormTwoColRowClass}>
          <RootsFormTextField
            label="Nombre"
            id={`${idPrefix}-name`}
            value={form.name}
            onChange={(e) => onChange({ name: e.target.value })}
            disabled={disabled}
            error={fieldErrors.name}
            invalid={Boolean(fieldErrors.name)}
          />
          <RootsFormTextField
            label="Marca"
            id={`${idPrefix}-brand`}
            value={form.brand}
            onChange={(e) => onChange({ brand: e.target.value })}
            placeholder="Opcional"
            disabled={disabled}
          />
        </div>

        <RootsFormTextField
          label="Descripción"
          id={`${idPrefix}-desc`}
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Opcional"
          disabled={disabled}
        />

        <ArticleImageUploadField
          id={`${idPrefix}-image`}
          popId={popId}
          value={form.imageUrl}
          onChange={(imageUrl) => onChange({ imageUrl })}
          disabled={disabled}
        />
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="flex flex-col gap-4">
        <ArticleIvaSelect
          id={`${idPrefix}-iva`}
          siteId={siteId}
          value={form.iva}
          onChange={(value) => onChange({ iva: value })}
          disabled={disabled}
          labelInfo={IVA_LABEL_INFO}
          error={fieldErrors.iva}
        />

        <WizardSection title="Venta">
          {isMerchandise ? (
            <div className={rootsFormTwoColRowClass}>
              <ArticleUnitOfMeasureField
                itemKind={form.itemKind}
                idPrefix={idPrefix}
                value={form}
                onChange={onChange}
                disabled={disabled}
                part="select"
              />
              <RootsFormMoneyField
                label={`Precio por ${saleUomLabel.toLowerCase()}`}
                id={`${idPrefix}-price`}
                value={form.salePrice}
                onChange={(value) => onChange({ salePrice: value })}
                disabled={disabled}
                error={fieldErrors.salePrice}
                invalid={Boolean(fieldErrors.salePrice)}
              />
            </div>
          ) : (
            <>
              <ArticleUnitOfMeasureField
                itemKind={form.itemKind}
                idPrefix={idPrefix}
                value={form}
                onChange={onChange}
                disabled={disabled}
                part="select"
              />
              <ArticleUnitOfMeasureField
                itemKind={form.itemKind}
                idPrefix={idPrefix}
                value={form}
                onChange={onChange}
                disabled={disabled}
                part="auxiliary"
              />
            </>
          )}

          {isMerchandise ? (
            <>
              <SalePriceListExtraFields
                idPrefix={idPrefix}
                lists={priceLists}
                values={form.listPrices ?? {}}
                onChange={(listId, value) =>
                  onChange({
                    listPrices: { ...form.listPrices, [listId]: value },
                  })
                }
                disabled={disabled}
                loading={priceListsLoading}
              />
              <ArticleCatalogDiscountField
                idPrefix={idPrefix}
                discountMode={form.discountMode}
                discountValue={form.discountValue}
                salePrice={parsedSalePrice}
                onChange={onChange}
                disabled={disabled}
              />
            </>
          ) : null}
        </WizardSection>

        <WizardSection title="Compra" labelInfo={COMPRA_SECTION_INFO} className="border-t border-[var(--rootsy-bruma-200)] pt-4">
          <ArticleCostEditor
            idPrefix={idPrefix}
            lines={costLines}
            onChange={onCostLinesChange}
            saleUnitOfMeasure={form.unitOfMeasure}
            disabled={disabled}
            popId={popId}
            supplierOptions={supplierOptions}
            embedded
          />
        </WizardSection>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {showInitialStock ? (
        <RootsFormQuantityField
          label="Stock inicial"
          id={`${idPrefix}-initial-stock`}
          value={form.initialStock ?? ""}
          onChange={(value) => onChange({ initialStock: value })}
          disabled={disabled}
          max={10000}
          placeholder="Opcional"
        />
      ) : null}

      {isMerchandise ? (
        <RootsFormSwitchField
          label="Vender con stock negativo"
          description="Permite vender aunque el stock quede por debajo de cero."
          id={`${idPrefix}-allow-negative-stock`}
          checked={form.allowNegativeStock}
          onCheckedChange={(checked) => onChange({ allowNegativeStock: checked })}
          disabled={disabled}
        />
      ) : null}

      {isMerchandise ? (
        <RootsFormTextField
          label="Código de barras"
          id={`${idPrefix}-barcode`}
          value={form.barcode}
          onChange={(e) => onChange({ barcode: e.target.value.replace(/\D/g, "") })}
          placeholder="EAN / UPC (8 a 14 dígitos)"
          disabled={disabled}
          inputClassName="tabular-nums"
          inputMode="numeric"
          autoComplete="off"
          labelInfo={BARCODE_LABEL_INFO}
        />
      ) : null}

      <RootsFormTextField
        label="SKU"
        id={`${idPrefix}-sku`}
        value={form.sku}
        onChange={(e) => onChange({ sku: e.target.value })}
        placeholder="Código interno (opcional)"
        disabled={disabled}
        autoComplete="off"
        labelInfo={SKU_LABEL_INFO}
      />

      <RootsFormSwitchField
        label="Artículo activo"
        description="Los inactivos no aparecen en ventas ni catálogo."
        id={`${idPrefix}-active`}
        checked={form.isActive}
        onCheckedChange={(checked) => onChange({ isActive: checked })}
        disabled={disabled}
      />
    </div>
  )
}
