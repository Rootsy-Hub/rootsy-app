"use client"

import type { ArticleTableRow } from "@/app/[siteId]/[popId]/articles/actions"
import { ArticleCatalogImagePlaceholder } from "@/app/[siteId]/[popId]/articles/ArticleCatalogImagePlaceholder"
import { DataWorkspaceTableThumbnail } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  workspaceTableLayoutBodyCellClass,
  workspaceTableLayoutCellPrimaryTextClass,
  workspaceTableLayoutCellSecondaryTextClass,
  workspaceTableLayoutCellStackClass,
  workspaceTableLayoutImageColumnClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import {
  workspaceTableNatureLinkClass,
  workspaceTableNatureMoneyClass,
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
import { TableCell } from "@/components/ui/table"

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
    <TableCell
      className={cn(
        workspaceTableLayoutImageColumnClass,
        workspaceTableLayoutBodyCellClass,
      )}
    >
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
            size="sm"
          />
        </button>
      ) : (
        <ArticleCatalogImagePlaceholder size="sm" />
      )}
    </TableCell>
  )
}

export function ArticleTableArticleCell({ row }: { row: ArticleTableRow }) {
  const secondary =
    row.description.trim() || row.brand.trim() || null

  return (
    <TableCell className={cn("min-w-0", workspaceTableLayoutBodyCellClass)}>
      <div className={workspaceTableLayoutCellStackClass}>
        <p
          className={cn(
            workspaceTableLayoutCellPrimaryTextClass,
            workspaceTableNatureTextPrimaryClass,
          )}
          title={row.name || undefined}
        >
          {row.name || "—"}
        </p>
        <p
          className={cn(
            workspaceTableLayoutCellSecondaryTextClass,
            secondary
              ? workspaceTableNatureTextSecondaryClass
              : "invisible",
          )}
          title={secondary ?? undefined}
          aria-hidden={!secondary}
        >
          {secondary ?? "\u00A0"}
        </p>
      </div>
    </TableCell>
  )
}

export function ArticleTableDetailCell({
  row,
  onVerDetalle,
}: {
  row: ArticleTableRow
  onVerDetalle: () => void
}) {
  return (
    <TableCell
      className={cn(
        workspaceTableLayoutBodyCellClass,
        "min-w-[9rem] max-w-[11rem]",
      )}
    >
      <div className={workspaceTableLayoutCellStackClass}>
        <button
          type="button"
          className={cn(
            "w-fit text-left text-xs font-medium leading-4 underline-offset-2 hover:underline",
            workspaceTableNatureLinkClass,
          )}
          onClick={onVerDetalle}
        >
          Ver detalles
          <span className="sr-only">{row.name || "artículo"}</span>
        </button>
      </div>
    </TableCell>
  )
}

export function ArticleTableCategoryCell({ name }: { name: string }) {
  const label = name || "—"

  return (
    <TableCell className={workspaceTableLayoutBodyCellClass}>
      <div className={workspaceTableLayoutCellStackClass}>
        <p
          className={cn(
            workspaceTableLayoutCellPrimaryTextClass,
            workspaceTableNatureTextPrimaryClass,
          )}
          title={name || undefined}
        >
          {label}
        </p>
      </div>
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
    <TableCell className={workspaceTableLayoutBodyCellClass}>
      <div className={workspaceTableLayoutCellStackClass}>
        <p
          className={cn(
            workspaceTableLayoutCellPrimaryTextClass,
            workspaceTableNatureTextSecondaryClass,
          )}
          title={label === "—" ? undefined : label}
        >
          {label}
        </p>
      </div>
    </TableCell>
  )
}

export function ArticleTableStockCell({ stockOnHand }: { stockOnHand: number }) {
  return (
    <TableCell
      className={cn(
        workspaceTableLayoutBodyCellClass,
        "w-[5.5rem] text-right",
      )}
    >
      <span
        className={cn(
          "block text-sm font-semibold tabular-nums leading-4",
          workspaceTableNatureMoneyClass,
        )}
      >
        {formatArticleStockOnHand(stockOnHand)}
      </span>
    </TableCell>
  )
}
