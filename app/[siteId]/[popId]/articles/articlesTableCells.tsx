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
  workspaceTableNatureStatusBadgeClass,
  workspaceTableNatureStockDangerClass,
  workspaceTableNatureStockOkClass,
  workspaceTableNatureStockWarningClass,
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
  workspaceTableNatureTextTertiaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { RootsNaturePill } from "@/components/rootsy-pill"
import { articleHasCatalogDiscount, formatArticleDiscountBadge } from "@/lib/articleDiscount"
import { shortUnitOfMeasure } from "@/lib/articleItemKind"
import { cn } from "@/lib/utils"
import { TableCell } from "@/components/ui/table"

export function formatArticleStockOnHand(value: number): string {
  if (Number.isInteger(value) || Math.abs(value - Math.round(value)) < 1e-6) {
    return Math.round(value).toLocaleString("es-AR")
  }
  return value.toLocaleString("es-AR", { maximumFractionDigits: 2 })
}

export type ArticleStockSignal = "ok" | "bajo" | "sin" | "negativo"

export function resolveArticleStockSignal(
  stockOnHand: number,
  minStockLevel: number | null,
): ArticleStockSignal {
  if (stockOnHand < -1e-6) return "negativo"
  if (Math.abs(stockOnHand) < 1e-6) return "sin"
  if (minStockLevel != null && stockOnHand <= minStockLevel + 1e-6) return "bajo"
  return "ok"
}

export function articleStockRowSignal(
  signal: ArticleStockSignal,
): "warning" | "danger" | undefined {
  if (signal === "bajo") return "warning"
  if (signal === "sin" || signal === "negativo") return "danger"
  return undefined
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

export function ArticleTableStockCell({
  stockOnHand,
  unitOfMeasure,
  minStockLevel = null,
}: {
  stockOnHand: number
  unitOfMeasure: string
  minStockLevel?: number | null
}) {
  const unitSuffix = shortUnitOfMeasure(unitOfMeasure)
  const signal = resolveArticleStockSignal(stockOnHand, minStockLevel)
  const amountClass =
    signal === "negativo" || signal === "sin"
      ? workspaceTableNatureStockDangerClass
      : signal === "bajo"
        ? workspaceTableNatureStockWarningClass
        : workspaceTableNatureStockOkClass
  const whisper =
    signal === "negativo"
      ? "En negativo"
      : signal === "sin"
        ? "Sin stock"
        : signal === "bajo"
          ? "Bajo el mínimo"
          : null
  const badgeTone =
    signal === "negativo" || signal === "sin"
      ? "vencido"
      : signal === "bajo"
        ? "pendiente"
        : null

  return (
    <TableCell
      className={cn(
        workspaceTableLayoutBodyCellClass,
        "w-32 min-w-32 text-right",
      )}
    >
      <div className={cn(workspaceTableLayoutCellStackClass, "items-end")}>
        <span className="inline-flex items-baseline justify-end gap-1 leading-4">
          <span
            className={cn(
              "font-numeric text-sm font-semibold tabular-nums tracking-tight",
              amountClass,
            )}
          >
            {formatArticleStockOnHand(stockOnHand)}
          </span>
          {unitSuffix ? (
            <span
              className={cn(
                "text-xs font-normal",
                workspaceTableNatureTextSecondaryClass,
              )}
            >
              {unitSuffix}
            </span>
          ) : null}
        </span>
        {whisper && badgeTone ? (
          <span
            className={cn(
              "inline-flex rounded px-1.5 py-px text-[10px] font-semibold leading-4",
              workspaceTableNatureStatusBadgeClass[badgeTone],
            )}
          >
            {whisper}
          </span>
        ) : (
          <span
            className="invisible text-[10px] leading-4"
            aria-hidden
          >
            &nbsp;
          </span>
        )}
      </div>
    </TableCell>
  )
}
