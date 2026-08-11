"use client"

import type { ArticleTableRow } from "@/app/[siteId]/[popId]/articles/actions"
import { getPopArticleCosts } from "@/app/[siteId]/[popId]/articles/articleCostsActions"
import {
  ArticleTableRowPills,
  formatArticleStockOnHand,
} from "@/app/[siteId]/[popId]/articles/articlesTableCells"
import { DataWorkspaceTableThumbnail } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  tdMoneyClass,
  tdMoneyMutedClass,
  tdMoneyVatClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogFooter,
  RootsDialogHeader,
  rootsDialogDetailFieldStackClass,
  rootsDialogDetailLabelClass,
  rootsDialogDetailMetaClass,
  rootsDialogDetailValueClass,
  rootsDialogDetailValueMultilineClass,
} from "@/components/rootsy-dialog"
import {
  RootsFormGrid,
  rootsFormColumnClass,
  rootsFormTwoColRowClass,
} from "@/components/rootsy-form"
import {
  rootsButtonClassForVariant,
  rootsButtonVariant,
} from "@/components/rootsy-button"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import {
  articleHasCatalogDiscount,
  effectiveArticleSalePrice,
  formatArticleDiscountBadge,
} from "@/lib/articleDiscount"
import { unitCostInSaleUom, type ArticleCostRow } from "@/lib/articleCosts"
import {
  ARTICLE_ITEM_KIND_STOCK_LABEL,
  labelUnitOfMeasure,
  shortUnitOfMeasure,
} from "@/lib/articleItemKind"
import { labelArticleIvaRate } from "@/lib/articleIva"
import { cn } from "@/lib/utils"
import { useEffect, useState, type ReactNode } from "react"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

function DetailField({
  label,
  children,
  multiline = false,
}: {
  label: string
  children: ReactNode
  multiline?: boolean
}) {
  return (
    <div className={rootsDialogDetailFieldStackClass}>
      <p className={rootsDialogDetailLabelClass}>{label}</p>
      <div
        className={
          multiline
            ? rootsDialogDetailValueMultilineClass
            : rootsDialogDetailValueClass
        }
      >
        {children}
      </div>
    </div>
  )
}

function DetailMoney({
  value,
  muted,
  vat,
  strikethrough,
}: {
  value: number
  muted?: boolean
  vat?: boolean
  strikethrough?: boolean
}) {
  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        strikethrough && "font-normal text-muted-foreground line-through",
        !strikethrough &&
          (vat ? tdMoneyVatClass : muted ? tdMoneyMutedClass : tdMoneyClass),
      )}
    >
      {vat ? `${value} %` : fmt.format(value)}
    </span>
  )
}

function emptyValue(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : "—"
}

export function ArticlesTableDetailDialog({
  row,
  popId,
  siteId,
  open,
  onOpenChange,
}: {
  row: ArticleTableRow | null
  popId: string
  siteId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [costs, setCosts] = useState<ArticleCostRow[]>([])
  const [costsLoading, setCostsLoading] = useState(false)

  useEffect(() => {
    if (!open || !row || !popId) {
      setCosts([])
      return
    }
    let cancelled = false
    ;(async () => {
      setCostsLoading(true)
      const res = await getPopArticleCosts(popId, row.id)
      if (cancelled) return
      setCostsLoading(false)
      setCosts(res.success ? res.costs : [])
    })()
    return () => {
      cancelled = true
    }
  }, [open, row, popId])

  if (!row) return null

  const isMerchandise = row.itemKind === "merchandise"
  const hasDiscount = articleHasCatalogDiscount(
    row.discountMode,
    row.discountValue,
  )
  const effectivePrice = effectiveArticleSalePrice(
    row.salePrice,
    row.discountMode,
    row.discountValue,
  )
  const supplierLabel =
    row.suppliers.length > 0
      ? row.suppliers.map((s) => s.name).join(", ")
      : "—"
  const saleUomShort = shortUnitOfMeasure(row.unitOfMeasure)
  const activeCosts = costs.filter((cost) => cost.isActive)

  const headerMeta = [
    ARTICLE_ITEM_KIND_STOCK_LABEL[row.itemKind],
    row.categoryName || null,
    row.brand.trim() || null,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="twoCol">
        <RootsDialogHeader
          title={row.name || "Artículo"}
          description={headerMeta || "Detalle del artículo"}
        />

        <RootsDialogBody>
          <div className="mb-5 flex flex-wrap items-start gap-4">
            <DataWorkspaceTableThumbnail
              src={row.imageUrl}
              alt={row.name || "Artículo"}
              size="lg"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <ArticleTableRowPills row={row} />
              <p className={rootsDialogDetailMetaClass}>
                ID · {row.id}
              </p>
            </div>
          </div>

          <RootsFormGrid>
            <div className={rootsFormColumnClass}>
              <DetailField label="Descripción" multiline>
                {row.description.trim() ? (
                  <span className="whitespace-pre-wrap">{row.description}</span>
                ) : (
                  "—"
                )}
              </DetailField>

              <div className={rootsFormTwoColRowClass}>
                <DetailField label="Tipo">
                  {ARTICLE_ITEM_KIND_STOCK_LABEL[row.itemKind]}
                </DetailField>
                <DetailField label="Categoría">
                  {emptyValue(row.categoryName)}
                </DetailField>
              </div>

              <div className={rootsFormTwoColRowClass}>
                <DetailField label="Marca">{emptyValue(row.brand)}</DetailField>
                <DetailField label="SKU">{emptyValue(row.sku)}</DetailField>
              </div>

              {isMerchandise ? (
                <DetailField label="Código de barras">
                  {emptyValue(row.barcode)}
                </DetailField>
              ) : null}

              <DetailField label="Proveedores" multiline>
                {supplierLabel}
              </DetailField>
            </div>

            <div className={rootsFormColumnClass}>
              <DetailField label="Unidad de medida de venta">
                {labelUnitOfMeasure(row.unitOfMeasure)}
              </DetailField>

              <DetailField label="IVA">
                <span className={tdMoneyVatClass}>
                  {labelArticleIvaRate(siteId, row.iva)}
                </span>
              </DetailField>

              {isMerchandise ? (
                <>
                  <DetailField label="Precio venta">
                    {hasDiscount ? (
                      <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <DetailMoney value={row.salePrice} strikethrough />
                        <DetailMoney value={effectivePrice} />
                      </span>
                    ) : (
                      <DetailMoney value={row.salePrice} />
                    )}
                  </DetailField>

                  <DetailField label="Descuento de catálogo">
                    {hasDiscount && row.discountMode && row.discountValue != null ? (
                      formatArticleDiscountBadge(row.discountMode, row.discountValue)
                    ) : (
                      "—"
                    )}
                  </DetailField>

                  <DetailField label="Vender con stock negativo">
                    {row.allowNegativeStock ? "Sí, permitido" : "No"}
                  </DetailField>
                </>
              ) : null}

              <DetailField label="Costo de compra" multiline>
                {costsLoading ? (
                  "Cargando…"
                ) : activeCosts.length === 0 ? (
                  "—"
                ) : (
                  <ul className="space-y-2">
                    {activeCosts.map((cost) => {
                      const unitCost = unitCostInSaleUom(cost)
                      return (
                        <li key={cost.id} className="text-sm leading-snug">
                          <span className="font-medium text-foreground">
                            {fmt.format(cost.unitPrice)} / {cost.costUnitLabel}
                          </span>
                          <span className="text-muted-foreground">
                            {cost.saleUnitsPerCostUnit !== 1 ? (
                              <>
                                {" "}
                                · {cost.saleUnitsPerCostUnit}{" "}
                                {saleUomShort || labelUnitOfMeasure(row.unitOfMeasure)}
                              </>
                            ) : null}
                            {unitCost > 0
                              ? ` · ≈ ${fmt.format(unitCost)}/${saleUomShort || "u."}`
                              : null}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </DetailField>

              <DetailField label="Stock actual">
                {formatArticleStockOnHand(row.stockOnHand)}{" "}
                {saleUomShort || labelUnitOfMeasure(row.unitOfMeasure)}
              </DetailField>

              {row.itemKind === "raw_material" ? (
                <DetailField label="Merma esperada">
                  {row.defaultWastePct != null ? `${row.defaultWastePct} %` : "—"}
                </DetailField>
              ) : null}

              {!isMerchandise ? (
                <DetailField label="Stock mínimo">
                  {row.minStockLevel != null ? row.minStockLevel : "—"}
                </DetailField>
              ) : null}
            </div>
          </RootsFormGrid>
        </RootsDialogBody>

        <RootsDialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant={rootsButtonVariant.tertiary}
            className={rootsButtonClassForVariant("tertiary")}
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </RootsDialogFooter>
      </RootsDialogContent>
    </Dialog>
  )
}
