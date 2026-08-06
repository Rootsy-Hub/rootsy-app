"use client"

import type { ArticleTableRow } from "@/app/[siteId]/[popId]/articles/actions"
import { ArticleCatalogDiscountBadge } from "@/app/[siteId]/[popId]/articles/ArticleCatalogDiscountBadge"
import { ArticleCatalogImagePlaceholder } from "@/app/[siteId]/[popId]/articles/ArticleCatalogImagePlaceholder"
import { DataWorkspaceTableThumbnail } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  workspaceTableLayoutBodyCellClass,
  workspaceTableLayoutCellPrimaryTextClass,
  workspaceTableLayoutCellSecondaryTextClass,
  workspaceTableLayoutCellStackClass,
  workspaceTableLayoutImageColumnClass,
  workspaceTableLayoutThumbnailInteractiveClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import {
  workspaceTableNatureLinkClass,
  workspaceTableNatureMoneyClass,
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
  workspaceTableNatureTextTertiaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { RootsNaturePill } from "@/components/rootsy-pill"
import { articleHasCatalogDiscount, formatArticleDiscountBadge } from "@/lib/articleDiscount"
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
          className={workspaceTableLayoutThumbnailInteractiveClass}
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

export const articleTableArticleColumnClass = "w-40 min-w-40 max-w-44"

export function ArticleTableArticleCell({ row }: { row: ArticleTableRow }) {
  const metaSecondary =
    row.description.trim() || row.brand.trim() || null
  const secondary = !row.isActive ? "Inactivo" : metaSecondary

  return (
    <TableCell
      className={cn(
        articleTableArticleColumnClass,
        "min-w-0",
        workspaceTableLayoutBodyCellClass,
      )}
    >
      <div className={workspaceTableLayoutCellStackClass}>
        <p
          className={cn(
            workspaceTableLayoutCellPrimaryTextClass,
            row.isActive
              ? workspaceTableNatureTextPrimaryClass
              : workspaceTableNatureTextSecondaryClass,
          )}
          title={row.name || undefined}
        >
          {row.name || "—"}
        </p>
        <p
          className={cn(
            workspaceTableLayoutCellSecondaryTextClass,
            secondary
              ? row.isActive
                ? workspaceTableNatureTextSecondaryClass
                : workspaceTableNatureTextTertiaryClass
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

function getArticleTableRowDetailText(row: ArticleTableRow): string {
  const parts: string[] = []
  if (row.itemKind === "merchandise") {
    parts.push("Mercadería vendible")
  }
  if (
    articleHasCatalogDiscount(row.discountMode, row.discountValue) &&
    row.discountMode &&
    row.discountValue != null
  ) {
    parts.push(formatArticleDiscountBadge(row.discountMode, row.discountValue))
  }
  return parts.length > 0 ? parts.join(" · ") : "—"
}

export function ArticleTableRowPills({
  row,
  singleLine = false,
}: {
  row: ArticleTableRow
  singleLine?: boolean
}) {
  const isMerchandise = row.itemKind === "merchandise"
  const hasDiscount = articleHasCatalogDiscount(
    row.discountMode,
    row.discountValue,
  )

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-1",
        singleLine ? "flex-nowrap overflow-hidden" : "flex-wrap",
      )}
    >
      <RootsNaturePill variant={row.isActive ? "canopy" : "earthMuted"}>
        {row.isActive ? "Activo" : "Inactivo"}
      </RootsNaturePill>
      {isMerchandise ? (
        <RootsNaturePill variant="earth">Mercadería vendible</RootsNaturePill>
      ) : null}
      {hasDiscount && row.discountMode && row.discountValue != null ? (
        <ArticleCatalogDiscountBadge
          mode={row.discountMode}
          value={row.discountValue}
        />
      ) : null}
    </div>
  )
}

export const articleTableDetailColumnClass = "w-56 min-w-56 max-w-64"

export function ArticleTableDetailCell({
  row,
  onVerDetalle,
}: {
  row: ArticleTableRow
  onVerDetalle: () => void
}) {
  const detailText = getArticleTableRowDetailText(row)

  return (
    <TableCell
      className={cn(
        workspaceTableLayoutBodyCellClass,
        articleTableDetailColumnClass,
      )}
    >
      <div className={workspaceTableLayoutCellStackClass}>
        <p
          className={cn(
            workspaceTableLayoutCellPrimaryTextClass,
            workspaceTableNatureTextPrimaryClass,
            "truncate",
          )}
          title={detailText === "—" ? undefined : detailText}
        >
          {detailText}
        </p>
        <button
          type="button"
          className={cn(
            "h-4 min-h-4 w-full truncate text-left text-xs font-medium leading-4 underline-offset-2 hover:underline",
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
      <span className={cn("block leading-4", workspaceTableNatureMoneyClass)}>
        {formatArticleStockOnHand(stockOnHand)}
      </span>
    </TableCell>
  )
}
