"use client"

import type { ArticleCategoryOption } from "@/app/[siteId]/[popId]/articles/actions"
import { ArticleCatalogDiscountField } from "@/app/[siteId]/[popId]/articles/ArticleCatalogDiscountField"
import type { ArticleCatalogExtraFormState } from "@/app/[siteId]/[popId]/articles/ArticleCatalogExtraFields"
import { ArticleImageUploadField } from "@/app/[siteId]/[popId]/articles/ArticleImageUploadField"
import { ArticleIvaSelect } from "@/app/[siteId]/[popId]/articles/ArticleIvaSelect"
import type { ArticleItemFormState } from "@/app/[siteId]/[popId]/articles/ArticleItemFormFields"
import { ArticleItemKindSelector } from "@/app/[siteId]/[popId]/articles/ArticleItemKindSelector"
import { ArticleSupplierPickerField } from "@/app/[siteId]/[popId]/articles/ArticleSupplierPickerField"
import { ArticleUnitOfMeasureField } from "@/app/[siteId]/[popId]/articles/ArticleUnitOfMeasureField"
import {
  RootsFormGrid,
  RootsFormMoneyField,
  RootsFormQuantityField,
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormSwitchField,
  RootsFormTextField,
  rootsFormColumnClass,
  rootsFormTwoColRowClass,
} from "@/components/rootsy-form"
import type { ArticleItemKind } from "@/lib/articleItemKind"
import { parseMoneyInput } from "@/lib/moneyInput"
import { cn } from "@/lib/utils"

export type ArticleUpsertFormState = ArticleItemFormState &
  ArticleCatalogExtraFormState & {
    name: string
    description: string
    imageUrl: string
    sku: string
    barcode: string
    salePrice: string
    costPrice: string
    iva: string
    categoryId: string
    isActive: boolean
    allowNegativeStock: boolean
    itemKind: ArticleItemKind
    initialStock?: string
  }

type Props = {
  idPrefix: string
  siteId: string
  popId: string
  form: ArticleUpsertFormState
  onChange: (patch: Partial<ArticleUpsertFormState>) => void
  onItemKindChange: (kind: ArticleItemKind) => void
  categories: ArticleCategoryOption[]
  supplierOptions: { id: string; name: string }[]
  suppliersLoading?: boolean
  canPostInitialStock?: boolean
  mode: "create" | "edit"
  disabled?: boolean
}

export function ArticleUpsertFormFields({
  idPrefix,
  siteId,
  popId,
  form,
  onChange,
  onItemKindChange,
  categories,
  supplierOptions,
  canPostInitialStock = false,
  mode,
  disabled = false,
}: Props) {
  const isMerchandise = form.itemKind === "merchandise"
  const parsedSalePrice = parseMoneyInput(form.salePrice, 0)

  return (
    <RootsFormGrid>
      <div className={rootsFormColumnClass}>
        <ArticleItemKindSelector
          value={form.itemKind}
          onChange={onItemKindChange}
          readOnly={mode === "edit"}
          disabled={disabled}
        />

        <RootsFormTextField
          label="Nombre"
          id={`${idPrefix}-name`}
          value={form.name}
          onChange={(e) => onChange({ name: e.target.value })}
          required
          disabled={disabled}
        />

        <RootsFormTextField
          label="Descripción"
          id={`${idPrefix}-desc`}
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Opcional"
          disabled={disabled}
        />

        <RootsFormTextField
          label="Marca"
          id={`${idPrefix}-brand`}
          value={form.brand}
          onChange={(e) => onChange({ brand: e.target.value })}
          placeholder="Opcional"
          disabled={disabled}
        />

        <RootsFormTextField
          label="SKU"
          id={`${idPrefix}-sku`}
          value={form.sku}
          onChange={(e) => onChange({ sku: e.target.value })}
          placeholder="Código interno (opcional)"
          disabled={disabled}
          autoComplete="off"
          hint="Código propio para identificar el artículo en stock e inventario."
        />

        {isMerchandise ? (
          <RootsFormTextField
            label="Código de barras"
            id={`${idPrefix}-barcode`}
            value={form.barcode}
            onChange={(e) =>
              onChange({ barcode: e.target.value.replace(/\D/g, "") })
            }
            placeholder="EAN / UPC (8 a 14 dígitos)"
            disabled={disabled}
            inputClassName="tabular-nums"
            inputMode="numeric"
            autoComplete="off"
            hint="Se imprime en el ticket de venta. Solo para productos de venta."
          />
        ) : null}

        <RootsFormSelectField
          label="Categoría"
          id={`${idPrefix}-cat`}
          value={form.categoryId}
          onValueChange={(value) => onChange({ categoryId: value })}
          disabled={disabled}
          placeholder="Elegir categoría…"
        >
          {categories.map((category) => (
            <RootsFormSelectItem key={category.id} value={category.id}>
              {category.name}
            </RootsFormSelectItem>
          ))}
        </RootsFormSelectField>

        <ArticleImageUploadField
          id={`${idPrefix}-image`}
          popId={popId}
          value={form.imageUrl}
          onChange={(imageUrl) => onChange({ imageUrl })}
          disabled={disabled}
        />
      </div>

      <div className={rootsFormColumnClass}>
        <ArticleUnitOfMeasureField
          itemKind={form.itemKind}
          idPrefix={idPrefix}
          value={form}
          onChange={onChange}
          disabled={disabled}
        />

        <div
          className={cn(
            rootsFormTwoColRowClass,
            !isMerchandise && "sm:grid-cols-1",
          )}
        >
          {isMerchandise ? (
            <RootsFormMoneyField
              label="Precio venta"
              id={`${idPrefix}-price`}
              value={form.salePrice}
              onChange={(value) => onChange({ salePrice: value })}
              disabled={disabled}
            />
          ) : null}
          <RootsFormMoneyField
            label="Precio de compra"
            id={`${idPrefix}-cost`}
            value={form.costPrice}
            onChange={(value) => onChange({ costPrice: value })}
            disabled={disabled}
          />
        </div>

        <ArticleIvaSelect
          id={`${idPrefix}-iva`}
          siteId={siteId}
          value={form.iva}
          onChange={(value) => onChange({ iva: value })}
          disabled={disabled}
        />

        {isMerchandise ? (
          <ArticleCatalogDiscountField
            idPrefix={idPrefix}
            discountMode={form.discountMode}
            discountValue={form.discountValue}
            salePrice={parsedSalePrice}
            onChange={onChange}
            disabled={disabled}
          />
        ) : null}

        <ArticleSupplierPickerField
          popId={popId}
          value={form.supplierIds}
          onChange={(supplierIds) => onChange({ supplierIds })}
          knownSuppliers={supplierOptions}
          disabled={disabled}
        />

        {mode === "create" && canPostInitialStock ? (
          <div className={cn("border-t border-border/50 pt-1")}>
            <RootsFormQuantityField
              label="Stock inicial (opcional)"
              id={`${idPrefix}-initial-stock`}
              value={form.initialStock ?? ""}
              onChange={(value) => onChange({ initialStock: value })}
              disabled={disabled}
              max={10000}
              placeholder="Vacío = sin movimiento"
            />
          </div>
        ) : null}

        {isMerchandise ? (
          <RootsFormSwitchField
            label="Vender con stock negativo"
            description="Permite vender aunque el stock quede por debajo de cero."
            id={`${idPrefix}-allow-negative-stock`}
            checked={form.allowNegativeStock}
            onCheckedChange={(checked) =>
              onChange({ allowNegativeStock: checked })
            }
            disabled={disabled}
          />
        ) : null}

        <RootsFormSwitchField
          label="Artículo activo"
          description="Los inactivos no aparecen en ventas ni catálogo."
          id={`${idPrefix}-active`}
          checked={form.isActive}
          onCheckedChange={(checked) => onChange({ isActive: checked })}
          disabled={disabled}
        />
      </div>
    </RootsFormGrid>
  )
}
