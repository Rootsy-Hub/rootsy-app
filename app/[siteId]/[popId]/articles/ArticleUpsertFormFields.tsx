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
import { RootsFormTextField, RootsFormTextareaField, RootsFormMoneyField, RootsFormQuantityField } from "@/components/rootsy-form"
import {
  articleFormColumnClass,
  articleFormFieldStackClass,
  articleFormGridClass,
  articleFormSelectContentClass,
  articleFormSelectItemClass,
  articleFormSelectTriggerClass,
  articleFormTextFieldClass,
  articleFormTwoColRowClass,
} from "@/app/[siteId]/[popId]/articles/articleConstants"
import { CheckoutSectionLabel } from "@/components/checkout/CheckoutFormFields"
import type { ArticleItemKind } from "@/lib/articleItemKind"
import { parseMoneyInput } from "@/lib/moneyInput"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
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
    <div className={articleFormGridClass}>
      <div className={articleFormColumnClass}>
        <RootsFormTextField
          label="Nombre"
          id={`${idPrefix}-name`}
          value={form.name}
          onChange={(e) => onChange({ name: e.target.value })}
          required
          disabled={disabled}
        />

        <RootsFormTextareaField
          label="Descripción"
          id={`${idPrefix}-desc`}
          rows={3}
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
          disabled={disabled}
        />

        <div className={articleFormFieldStackClass}>
          <CheckoutSectionLabel>Marca</CheckoutSectionLabel>
          <input
            id={`${idPrefix}-brand`}
            value={form.brand}
            onChange={(e) => onChange({ brand: e.target.value })}
            placeholder="Opcional"
            disabled={disabled}
            className={articleFormTextFieldClass}
          />
        </div>

        <div className={articleFormFieldStackClass}>
          <CheckoutSectionLabel>SKU</CheckoutSectionLabel>
          <input
            id={`${idPrefix}-sku`}
            value={form.sku}
            onChange={(e) => onChange({ sku: e.target.value })}
            placeholder="Código interno (opcional)"
            disabled={disabled}
            className={articleFormTextFieldClass}
            autoComplete="off"
          />
          <p className="text-xs leading-snug text-muted-foreground">
            Código propio para identificar el artículo en stock e inventario.
          </p>
        </div>

        {isMerchandise ? (
          <div className={articleFormFieldStackClass}>
            <CheckoutSectionLabel>Código de barras</CheckoutSectionLabel>
            <input
              id={`${idPrefix}-barcode`}
              value={form.barcode}
              onChange={(e) =>
                onChange({ barcode: e.target.value.replace(/\D/g, "") })
              }
              placeholder="EAN / UPC (8 a 14 dígitos)"
              disabled={disabled}
              className={cn(articleFormTextFieldClass, "tabular-nums")}
              inputMode="numeric"
              autoComplete="off"
            />
            <p className="text-xs leading-snug text-muted-foreground">
              Se imprime en el ticket de venta. Solo para productos de venta.
            </p>
          </div>
        ) : null}

        <ArticleItemKindSelector
          idPrefix={idPrefix}
          value={form.itemKind}
          onChange={onItemKindChange}
          readOnly={mode === "edit"}
        />

        <div className={articleFormFieldStackClass}>
          <CheckoutSectionLabel>Categoría</CheckoutSectionLabel>
          <div className="w-full min-w-0">
            <Select
              value={form.categoryId || undefined}
              onValueChange={(value) => onChange({ categoryId: value })}
              disabled={disabled}
              required
            >
              <SelectTrigger
                id={`${idPrefix}-cat`}
                className={articleFormSelectTriggerClass}
              >
                <SelectValue placeholder="Elegir categoría…" />
              </SelectTrigger>
              <SelectContent
                className={articleFormSelectContentClass}
                position="popper"
              >
                {categories.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.id}
                    className={articleFormSelectItemClass}
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ArticleImageUploadField
          id={`${idPrefix}-image`}
          popId={popId}
          value={form.imageUrl}
          onChange={(imageUrl) => onChange({ imageUrl })}
          disabled={disabled}
        />
      </div>

      <div className={articleFormColumnClass}>
        <ArticleUnitOfMeasureField
          itemKind={form.itemKind}
          idPrefix={idPrefix}
          value={form}
          onChange={onChange}
          disabled={disabled}
        />

        <div
          className={cn(
            articleFormTwoColRowClass,
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

        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/15 px-3.5 py-2.5">
          <div className="min-w-0">
            <CheckoutSectionLabel>Artículo activo</CheckoutSectionLabel>
            <p className="mt-1 text-xs leading-snug text-muted-foreground">
              Los inactivos no aparecen en ventas ni catálogo.
            </p>
          </div>
          <Switch
            id={`${idPrefix}-active`}
            checked={form.isActive}
            onCheckedChange={(checked) => onChange({ isActive: checked })}
            disabled={disabled}
            className="shrink-0"
          />
        </div>
      </div>
    </div>
  )
}
