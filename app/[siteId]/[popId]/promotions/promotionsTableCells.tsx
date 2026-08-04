"use client"

import type { PromotionTableRow } from "@/app/[siteId]/[popId]/promotions/actions"
import { ArticleCatalogImagePlaceholder } from "@/app/[siteId]/[popId]/articles/ArticleCatalogImagePlaceholder"
import {
  promotionTableImageColumnClass,
  promotionTableItemsColumnClass,
  promotionTableNameColumnClass,
  promotionTablePricingColumnClass,
  promotionTableScheduleColumnClass,
  promotionTableStatusColumnClass,
  promotionTableTypeColumnClass,
} from "@/app/[siteId]/[popId]/promotions/promotionsTableLayout"
import { DataWorkspaceTableThumbnail } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  selectColumnInnerClass,
  workspaceTableNatureCheckboxClass,
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  workspaceTableLayoutBodyCellClass,
  workspaceTableLayoutCellPrimaryTextClass,
  workspaceTableLayoutCellSecondaryTextClass,
  workspaceTableLayoutCellStackClass,
  workspaceTableLayoutImageColumnClass,
  workspaceTableLayoutSelectBodyCellClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { RootsNaturePill } from "@/components/rootsy-pill"
import { Checkbox } from "@/components/ui/checkbox"
import { PROMOTION_TYPE_LABEL } from "@/lib/promotionTypes"
import { cn } from "@/lib/utils"
import { TableCell } from "@/components/ui/table"

const primaryClass = cn(
  workspaceTableLayoutCellPrimaryTextClass,
  workspaceTableNatureTextPrimaryClass,
)

const secondaryClass = cn(
  workspaceTableLayoutCellSecondaryTextClass,
  workspaceTableNatureTextSecondaryClass,
)

function promotionStatusMeta(row: PromotionTableRow): string | null {
  const parts: string[] = []
  if (row.showInMenu) parts.push("Menú")
  if (row.autoApply) parts.push("Auto")
  return parts.length > 0 ? parts.join(" · ") : null
}

export function PromotionTableSelectCell({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
}) {
  return (
    <TableCell className={workspaceTableLayoutSelectBodyCellClass}>
      <div className={selectColumnInnerClass}>
        <Checkbox
          className={workspaceTableNatureCheckboxClass}
          checked={checked}
          onCheckedChange={(c) => onCheckedChange(c === true)}
          aria-label={label}
        />
      </div>
    </TableCell>
  )
}

export function PromotionTableImageCell({ row }: { row: PromotionTableRow }) {
  const src = row.imageUrl?.trim()

  return (
    <TableCell
      className={cn(
        workspaceTableLayoutImageColumnClass,
        promotionTableImageColumnClass,
        workspaceTableLayoutBodyCellClass,
      )}
    >
      {src ? (
        <DataWorkspaceTableThumbnail src={src} alt={row.name} size="sm" />
      ) : (
        <ArticleCatalogImagePlaceholder size="sm" />
      )}
    </TableCell>
  )
}

export function PromotionTableNameCell({ row }: { row: PromotionTableRow }) {
  const description = row.description.trim()
  const secondary = description || null

  return (
    <TableCell
      className={cn(
        promotionTableNameColumnClass,
        "min-w-0",
        workspaceTableLayoutBodyCellClass,
      )}
    >
      <div className={workspaceTableLayoutCellStackClass}>
        <p className={cn(primaryClass, "truncate")} title={row.name || undefined}>
          {row.name || "—"}
        </p>
        <p
          className={cn(
            secondaryClass,
            "truncate",
            !secondary && "invisible",
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

export function PromotionTableTypeCell({ row }: { row: PromotionTableRow }) {
  const label = PROMOTION_TYPE_LABEL[row.promotionType]

  return (
    <TableCell
      className={cn(promotionTableTypeColumnClass, workspaceTableLayoutBodyCellClass)}
    >
      <div className={workspaceTableLayoutCellStackClass}>
        <p className={cn(primaryClass, "truncate")} title={label}>
          {label}
        </p>
      </div>
    </TableCell>
  )
}

export function PromotionTablePricingCell({ row }: { row: PromotionTableRow }) {
  return (
    <TableCell
      className={cn(promotionTablePricingColumnClass, workspaceTableLayoutBodyCellClass)}
    >
      <div className={workspaceTableLayoutCellStackClass}>
        <p className={cn(primaryClass, "truncate")} title={row.pricingSummary}>
          {row.pricingSummary}
        </p>
      </div>
    </TableCell>
  )
}

export function PromotionTableScheduleCell({ row }: { row: PromotionTableRow }) {
  return (
    <TableCell
      className={cn(promotionTableScheduleColumnClass, workspaceTableLayoutBodyCellClass)}
    >
      <div className={workspaceTableLayoutCellStackClass}>
        <p className={cn(secondaryClass, "truncate")} title={row.scheduleSummary}>
          {row.scheduleSummary}
        </p>
      </div>
    </TableCell>
  )
}

export function PromotionTableItemsCell({ row }: { row: PromotionTableRow }) {
  const label =
    row.promotionType === "combo"
      ? `${row.slotCount} ítems · ${row.optionCount} opc.`
      : `${row.optionCount} elegibles`

  return (
    <TableCell
      className={cn(promotionTableItemsColumnClass, workspaceTableLayoutBodyCellClass)}
    >
      <div className={workspaceTableLayoutCellStackClass}>
        <p className={cn(secondaryClass, "truncate")} title={label}>
          {label}
        </p>
      </div>
    </TableCell>
  )
}

export function PromotionTableStatusCell({ row }: { row: PromotionTableRow }) {
  const meta = promotionStatusMeta(row)

  return (
    <TableCell
      className={cn(promotionTableStatusColumnClass, workspaceTableLayoutBodyCellClass)}
    >
      <div className={workspaceTableLayoutCellStackClass}>
        <div className="flex min-h-4 min-w-0 items-center">
          <RootsNaturePill variant={row.isActive ? "canopy" : "earthMuted"}>
            {row.isActive ? "Activa" : "Inactiva"}
          </RootsNaturePill>
        </div>
        <p
          className={cn(secondaryClass, "truncate", !meta && "invisible")}
          title={meta ?? undefined}
          aria-hidden={!meta}
        >
          {meta ?? "\u00A0"}
        </p>
      </div>
    </TableCell>
  )
}
