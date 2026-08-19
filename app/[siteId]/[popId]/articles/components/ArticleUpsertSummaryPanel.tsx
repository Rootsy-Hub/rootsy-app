"use client"

import type { ArticleCategoryOption } from "@/app/[siteId]/[popId]/articles/actions"
import type { ArticleUpsertFormState } from "@/app/[siteId]/[popId]/articles/ArticleUpsertFormFields"
import type { ArticleCostFormLine } from "@/app/[siteId]/[popId]/articles/components/ArticleCostEditor"
import { DataWorkspaceTableThumbnail } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  articleHasCatalogDiscount,
  formatArticleDiscountBadge,
  isArticleDiscountMode,
  type ArticleDiscountMode,
} from "@/lib/articleDiscount"
import { unitCostInSaleUom } from "@/lib/articleCosts"
import {
  ARTICLE_ITEM_KIND_STOCK_LABEL,
  labelUnitOfMeasure,
  shortUnitOfMeasure,
} from "@/lib/articleItemKind"
import { findArcaIvaAlicuotaById } from "@/lib/arcaArgentinaConstants"
import { formatArticleIvaOptionLabel } from "@/lib/articleIva"
import { parseNonNegativeIntegerInput } from "@/lib/integerInput"
import { parseMoneyInput } from "@/lib/moneyInput"
import { cn } from "@/lib/utils"

const PLACEHOLDER = "—"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

const summaryRowLabelClass =
  "shrink-0 text-[11px] leading-snug text-[var(--rootsy-bruma-500)]"

const summaryRowValueClass =
  "min-w-0 truncate text-right text-xs leading-snug text-[var(--rootsy-bruma-700)]"

const summaryRowEmptyClass = "text-[var(--rootsy-bruma-400)]"

const summaryCoreMetaClass =
  "text-[11px] font-medium uppercase tracking-wide text-[var(--rootsy-bruma-500)]"

const summaryCoreNameClass =
  "text-sm font-medium leading-snug text-[var(--rootsy-bruma-800)]"

const summaryCoreNameEmptyClass =
  "text-sm font-medium leading-snug text-[var(--rootsy-bruma-400)]"

const summaryCoreDescriptionClass =
  "text-xs leading-relaxed text-[var(--rootsy-bruma-600)]"

const summaryCoreDescriptionEmptyClass =
  "text-xs leading-relaxed text-[var(--rootsy-bruma-400)]"

type Props = {
  form: ArticleUpsertFormState
  siteId: string
  mode: "create" | "edit"
  categories: ArticleCategoryOption[]
  supplierOptions: { id: string; name: string }[]
  costLines: ArticleCostFormLine[]
  canPostInitialStock?: boolean
}

function SummaryRow({
  label,
  value,
  empty = false,
}: {
  label: string
  value: string
  empty?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5">
      <span className={summaryRowLabelClass}>{label}</span>
      <span
        className={cn(
          summaryRowValueClass,
          (empty || value === PLACEHOLDER) && summaryRowEmptyClass,
        )}
        title={value === PLACEHOLDER ? undefined : value}
      >
        {value}
      </span>
    </div>
  )
}

function filledText(value: string | null | undefined): boolean {
  return Boolean(value?.trim())
}

function SummaryStackedRow({
  label,
  primary,
  secondary,
  empty = false,
}: {
  label: string
  primary: string
  secondary?: string
  empty?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-2 py-0.5">
      <span className={cn(summaryRowLabelClass, "pt-px")}>{label}</span>
      <div
        className={cn(
          "min-w-0 text-right",
          empty && summaryRowEmptyClass,
        )}
      >
        <span
          className={cn(
            summaryRowValueClass,
            "block",
            (empty || primary === PLACEHOLDER) && summaryRowEmptyClass,
          )}
          title={primary === PLACEHOLDER ? undefined : primary}
        >
          {primary}
        </span>
        {secondary ? (
          <span
            className={cn(
              "mt-0.5 block text-[10px] leading-snug text-[var(--rootsy-bruma-500)]",
            )}
            title={secondary}
          >
            {secondary}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function rowValue(value: string | null | undefined): { value: string; empty: boolean } {
  const trimmed = value?.trim() ?? ""
  return trimmed
    ? { value: trimmed, empty: false }
    : { value: PLACEHOLDER, empty: true }
}

function parseFormCatalogDiscount(
  mode: string,
  value: string,
): { mode: ArticleDiscountMode | null; value: number | null } {
  if (!isArticleDiscountMode(mode)) {
    return { mode: null, value: null }
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return { mode: null, value: null }
  }

  if (mode === "porcentaje") {
    const whole = trimmed.includes(",")
      ? (trimmed.split(",")[0] ?? "")
      : trimmed.includes(".")
        ? (trimmed.split(".")[0] ?? "")
        : trimmed
    const parsed = parseNonNegativeIntegerInput(whole.replace(/\D/g, ""), Number.NaN)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return { mode: null, value: null }
    }
    return { mode, value: Math.min(100, parsed) }
  }

  const parsed = parseMoneyInput(trimmed, Number.NaN)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return { mode: null, value: null }
  }

  return { mode, value: parsed }
}

export function ArticleUpsertSummaryPanel({
  form,
  siteId,
  mode,
  categories,
  supplierOptions,
  costLines,
  canPostInitialStock = false,
}: Props) {
  const isMerchandise = form.itemKind === "merchandise"
  const showInitialStock = mode === "create" && canPostInitialStock

  const categoryName =
    categories.find((category) => category.id === form.categoryId)?.name ?? ""
  const saleUomLabel = labelUnitOfMeasure(form.unitOfMeasure)
  const saleUomShort = shortUnitOfMeasure(form.unitOfMeasure)

  const ivaOption = form.iva.trim()
    ? findArcaIvaAlicuotaById(siteId, Number.parseInt(form.iva, 10))
    : null

  const supplierNames = [
    ...new Set(
      costLines
        .map((line) => {
          if (!line.supplierId.trim()) return null
          return (
            line.supplierName.trim() ||
            supplierOptions.find((supplier) => supplier.id === line.supplierId)
              ?.name ||
            null
          )
        })
        .filter((name): name is string => Boolean(name)),
    ),
  ]

  const parsedSalePrice = parseMoneyInput(form.salePrice, 0)
  const parsedDiscount = parseFormCatalogDiscount(
    form.discountMode,
    form.discountValue,
  )
  const hasDiscount = articleHasCatalogDiscount(
    parsedDiscount.mode,
    parsedDiscount.value,
  )

  const primaryCost = costLines.find((line) => line.unitPrice.trim() !== "")
  let compraPrimary = PLACEHOLDER
  let compraSecondary: string | undefined
  let compraEmpty = true
  let compraStacked = false

  if (primaryCost) {
    const unitLabel =
      primaryCost.usesAlternateUnit && primaryCost.costUnitLabel.trim()
        ? primaryCost.costUnitLabel.trim()
        : saleUomShort || saleUomLabel
    const unitPrice = parseMoneyInput(primaryCost.unitPrice, 0)
    const factor = Number(primaryCost.saleUnitsPerCostUnit.replace(",", "."))
    const unitCost = unitCostInSaleUom({
      unitPrice,
      saleUnitsPerCostUnit: factor,
    })
    const usesAlternatePack =
      primaryCost.usesAlternateUnit && factor !== 1 && unitLabel.trim() !== ""

    if (usesAlternatePack) {
      compraPrimary = `${fmt.format(unitPrice)} / ${unitLabel}`
      if (unitCost > 0) {
        compraSecondary = `${fmt.format(unitCost)}/${saleUomShort || "u."}`
      }
      compraStacked = true
    } else {
      compraPrimary = fmt.format(unitPrice)
      if (unitCost > 0 && unitCost !== unitPrice) {
        compraPrimary += ` · ${fmt.format(unitCost)}/${saleUomShort || "u."}`
      }
    }

    compraEmpty = false
  }

  const hasName = filledText(form.name)
  const hasDescription = filledText(form.description)
  const displayName = form.name.trim() || "Sin nombre"
  const displayDescription = form.description.trim()

  return (
    <aside
      aria-hidden
      className="pointer-events-none flex min-h-0 select-none flex-col gap-3"
    >
      <div className="flex flex-col gap-2.5">
        <p className={summaryCoreMetaClass}>
          {ARTICLE_ITEM_KIND_STOCK_LABEL[form.itemKind]}
          {categoryName ? ` · ${categoryName}` : " · Sin categoría"}
        </p>

        <div className="flex items-start gap-2.5">
          <DataWorkspaceTableThumbnail
            src={form.imageUrl.trim() || null}
            alt={displayName}
            size="md"
            className={cn("shrink-0", !filledText(form.imageUrl) && "opacity-75")}
          />

          <div className="min-w-0 flex-1 pt-0.5">
            <p
              className={cn(
                "truncate",
                hasName ? summaryCoreNameClass : summaryCoreNameEmptyClass,
              )}
              title={hasName ? displayName : undefined}
            >
              {displayName}
            </p>
            <p
              className={cn(
                "mt-0.5 line-clamp-3",
                hasDescription
                  ? summaryCoreDescriptionClass
                  : summaryCoreDescriptionEmptyClass,
              )}
              title={hasDescription ? displayDescription : undefined}
            >
              {hasDescription ? displayDescription : PLACEHOLDER}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 border-t border-[var(--rootsy-bruma-200)] pt-3">
        <SummaryRow label="Marca" {...rowValue(form.brand)} />
        <SummaryRow
          label="IVA"
          value={ivaOption ? formatArticleIvaOptionLabel(ivaOption) : PLACEHOLDER}
          empty={!ivaOption}
        />
        <SummaryRow label="Unidad" value={saleUomLabel} empty={false} />
        {isMerchandise ? (
          <>
            <SummaryRow
              label="Venta"
              value={parsedSalePrice > 0 ? fmt.format(parsedSalePrice) : PLACEHOLDER}
              empty={parsedSalePrice <= 0}
            />
            <SummaryRow
              label="Descuento"
              value={
                hasDiscount && parsedDiscount.mode && parsedDiscount.value != null
                  ? formatArticleDiscountBadge(
                      parsedDiscount.mode,
                      parsedDiscount.value,
                    )
                  : PLACEHOLDER
              }
              empty={!hasDiscount}
            />
            {compraStacked ? (
              <SummaryStackedRow
                label="Compra"
                primary={compraPrimary}
                secondary={compraSecondary}
                empty={compraEmpty}
              />
            ) : (
              <SummaryRow label="Compra" value={compraPrimary} empty={compraEmpty} />
            )}
          </>
        ) : null}
        {showInitialStock ? (
          <SummaryRow label="Stock inicial" {...rowValue(form.initialStock)} />
        ) : null}
        {isMerchandise ? (
          <SummaryRow
            label="Stock negativo"
            value={form.allowNegativeStock ? "Permitido" : "No permitido"}
            empty={false}
          />
        ) : null}
        {isMerchandise ? (
          <SummaryRow label="Código" {...rowValue(form.barcode)} />
        ) : null}
        <SummaryRow label="SKU" {...rowValue(form.sku)} />
        <SummaryRow
          label="Proveedores"
          value={supplierNames.length > 0 ? supplierNames.join(", ") : PLACEHOLDER}
          empty={supplierNames.length === 0}
        />
        <SummaryRow
          label="Estado"
          value={form.isActive ? "Activo" : "Inactivo"}
          empty={false}
        />
      </div>
    </aside>
  )
}
