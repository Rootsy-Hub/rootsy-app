"use client"

import type { ArticleTableRow } from "@/app/[siteId]/[popId]/articles/actions"
import { OperationTableVerMas } from "@/app/[siteId]/[popId]/operations/operationsTableCells"
import {
  formatArticleDiscountBadge,
} from "@/lib/articleDiscount"
import {
  ARTICLE_ITEM_KIND_STOCK_LABEL,
} from "@/lib/articleItemKind"
import {
  tdTruncatedNameCellClass,
  tdTruncatedTextCellClass,
  workspaceTableBodyCellClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { ArticleCatalogImagePlaceholder } from "@/app/[siteId]/[popId]/articles/ArticleCatalogImagePlaceholder"
import { DataWorkspaceTableThumbnail } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { cn } from "@/lib/utils"
import { TableCell } from "@/components/ui/table"

const articleTablePrimaryClass =
  "block min-w-0 truncate text-sm font-medium leading-snug text-foreground"

const articleTableSecondaryClass =
  "block min-w-0 truncate text-xs leading-snug text-muted-foreground"

const articleTableDetailLineClass =
  "block min-w-0 truncate text-xs leading-snug text-muted-foreground"

export function formatArticleStockOnHand(value: number): string {
  if (Number.isInteger(value) || Math.abs(value - Math.round(value)) < 1e-6) {
    return Math.round(value).toLocaleString("es-AR")
  }
  return value.toLocaleString("es-AR", { maximumFractionDigits: 2 })
}

export function ArticleTableImageCell({
  row,
  onPreview,
}: {
  row: ArticleTableRow
  onPreview: (imageUrl: string) => void
}) {
  const src = row.imageUrl?.trim()

  return (
    <TableCell className="w-24 px-3 py-2.5 align-middle">
      {src ? (
        <button
          type="button"
          className="rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary/30"
          onClick={() => onPreview(src)}
          aria-label={`Ver imagen de ${row.name || "artículo"}`}
        >
          <DataWorkspaceTableThumbnail
            src={src}
            alt={row.name || "Artículo"}
            size="lg"
          />
        </button>
      ) : (
        <ArticleCatalogImagePlaceholder size="lg" />
      )}
    </TableCell>
  )
}

export function ArticleTableArticleCell({ row }: { row: ArticleTableRow }) {
  return (
    <TableCell className={tdTruncatedNameCellClass}>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className={articleTablePrimaryClass} title={row.name || undefined}>
          {row.name || "—"}
        </span>
        {row.description.trim() ? (
          <span
            className={articleTableSecondaryClass}
            title={row.description}
          >
            {row.description}
          </span>
        ) : null}
        {row.brand.trim() ? (
          <span
            className="block min-w-0 truncate text-xs leading-snug text-foreground/75"
            title={row.brand}
          >
            {row.brand}
          </span>
        ) : null}
      </div>
    </TableCell>
  )
}

export function ArticleTableDetailCell({
  row,
  hasDiscount,
  onVerMas,
}: {
  row: ArticleTableRow
  hasDiscount: boolean
  onVerMas: () => void
}) {
  return (
    <TableCell className={cn(workspaceTableBodyCellClass, "min-w-[9rem] max-w-[11rem]")}>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm leading-snug text-foreground">
          {ARTICLE_ITEM_KIND_STOCK_LABEL[row.itemKind]}
        </span>
        {hasDiscount && row.discountMode && row.discountValue != null ? (
          <span className={articleTableDetailLineClass}>
            {formatArticleDiscountBadge(row.discountMode, row.discountValue)}
          </span>
        ) : null}
        <span className={articleTableDetailLineClass}>
          {row.isActive ? "Activo" : "Inactivo"}
        </span>
        <OperationTableVerMas
          label={row.name || "artículo"}
          onClick={onVerMas}
        />
      </div>
    </TableCell>
  )
}

export function ArticleTableCategoryCell({ name }: { name: string }) {
  return (
    <TableCell className={cn(tdTruncatedTextCellClass, "text-foreground/90")}>
      <span className="block truncate" title={name}>
        {name || "—"}
      </span>
    </TableCell>
  )
}

export function ArticleTableSuppliersCell({
  suppliers,
}: {
  suppliers: ArticleTableRow["suppliers"]
}) {
  const label =
    suppliers.length > 0 ? suppliers.map((s) => s.name).join(", ") : "—"

  return (
    <TableCell className={cn(tdTruncatedTextCellClass, "text-muted-foreground")}>
      <span className="block truncate" title={label === "—" ? undefined : label}>
        {label}
      </span>
    </TableCell>
  )
}

export function ArticleTableStockCell({ stockOnHand }: { stockOnHand: number }) {
  return (
    <TableCell className="w-[5.5rem] px-3 py-2.5 text-right align-middle">
      <span className="block font-numeric text-xl font-semibold tabular-nums tracking-tight text-foreground">
        {formatArticleStockOnHand(stockOnHand)}
      </span>
    </TableCell>
  )
}
