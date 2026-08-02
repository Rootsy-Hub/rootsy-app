"use client"

import type { ArticleTableRow } from "@/app/[siteId]/[popId]/articles/actions"
import { DataWorkspaceTableThumbnail } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  tdMoneyClass,
  tdMoneyMutedClass,
  tdMoneyVatClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArticleCatalogDiscountBadge } from "@/app/[siteId]/[popId]/articles/ArticleCatalogDiscountBadge"
import {
  articleHasCatalogDiscount,
  effectiveArticleSalePrice,
} from "@/lib/articleDiscount"
import {
  ARTICLE_ITEM_KIND_STOCK_LABEL,
  labelUnitOfMeasure,
} from "@/lib/articleItemKind"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

const dialogSurface = cn(
  "rootsy-app-light gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-0 text-foreground shadow-2xl ring-1 ring-black/[0.04] sm:max-w-2xl",
  "max-h-[min(90vh,760px)] flex flex-col overflow-hidden",
)

const dialogHeader =
  "shrink-0 space-y-1.5 border-b border-border/50 bg-muted/25 px-6 pb-4 pt-5 text-left"

const dialogBody =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4"

function DetailField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 text-sm text-foreground">{children}</div>
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
        "text-sm font-medium",
        strikethrough && "text-muted-foreground line-through",
        !strikethrough &&
          (vat ? tdMoneyVatClass : muted ? tdMoneyMutedClass : tdMoneyClass),
      )}
    >
      {vat ? `${value} %` : fmt.format(value)}
    </span>
  )
}

export function ArticlesTableDetailDialog({
  row,
  open,
  onOpenChange,
}: {
  row: ArticleTableRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!row) return null

  const sellable = row.itemKind === "merchandise"
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogSurface} data-rootsy-light-shell="true">
        <DialogHeader className={dialogHeader}>
          <DialogTitle className="text-base font-semibold tracking-tight">
            {row.name || "Artículo"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {ARTICLE_ITEM_KIND_STOCK_LABEL[row.itemKind]}
            {row.categoryName ? ` · ${row.categoryName}` : ""}
            {row.brand.trim() ? ` · ${row.brand}` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className={dialogBody}>
          <div className="mb-4 flex items-start gap-4">
            <DataWorkspaceTableThumbnail
              src={row.imageUrl}
              alt={row.name || "Artículo"}
              size="lg"
            />
            <div className="min-w-0 flex-1 space-y-2">
              <Badge
                variant="secondary"
                className={cn(
                  "font-normal",
                  row.isActive
                    ? "border-primary/25 bg-primary/10 text-forest"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {row.isActive ? "Activo" : "Inactivo"}
              </Badge>
              {sellable ? (
                <Badge variant="outline" className="font-normal">
                  Vendible
                </Badge>
              ) : null}
              {hasDiscount && row.discountMode && row.discountValue != null ? (
                <ArticleCatalogDiscountBadge
                  mode={row.discountMode}
                  value={row.discountValue}
                />
              ) : null}
            </div>
          </div>

          {row.description.trim() ? (
            <div className="mb-4 rounded-lg border border-border bg-muted/15 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Descripción
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {row.description}
              </p>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailField label="Tipo">
              {ARTICLE_ITEM_KIND_STOCK_LABEL[row.itemKind]}
            </DetailField>
            <DetailField label="Categoría">{row.categoryName || "—"}</DetailField>
            <DetailField label="Marca">{row.brand.trim() || "—"}</DetailField>
            <DetailField label="Proveedores">{supplierLabel}</DetailField>
            <DetailField label="Unidad de medida">
              {labelUnitOfMeasure(row.unitOfMeasure)}
            </DetailField>
            <DetailField label="IVA">
              {sellable ? (
                <span className={tdMoneyVatClass}>{row.iva} %</span>
              ) : (
                "—"
              )}
            </DetailField>
            <DetailField label="Precio venta">
              {sellable ? (
                hasDiscount ? (
                  <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <DetailMoney value={row.salePrice} strikethrough />
                    <DetailMoney value={effectivePrice} />
                  </span>
                ) : (
                  <DetailMoney value={row.salePrice} />
                )
              ) : (
                "—"
              )}
            </DetailField>
            <DetailField label="Precio costo">
              <DetailMoney value={row.costPrice} muted />
            </DetailField>
            {row.itemKind === "raw_material" ? (
              <DetailField label="Merma esperada">
                {row.defaultWastePct != null ? `${row.defaultWastePct} %` : "—"}
              </DetailField>
            ) : null}
            {row.itemKind !== "merchandise" ? (
              <DetailField label="Stock mínimo">
                {row.minStockLevel != null ? row.minStockLevel : "—"}
              </DetailField>
            ) : null}
          </div>

          <p className="mt-4 break-all text-[11px] text-muted-foreground">
            {row.id}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
