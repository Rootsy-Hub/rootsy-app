"use client"

import type { PromotionTableRow } from "@/app/[siteId]/[popId]/promotions/actions"
import { ArticleCatalogImagePlaceholder } from "@/app/[siteId]/[popId]/articles/ArticleCatalogImagePlaceholder"
import { DataWorkspaceTableThumbnail } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  selectColumnInnerClass,
  tableRowSelectCheckboxClass,
  tdTruncatedNameCellClass,
  tdTruncatedTextCellClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { PROMOTION_TYPE_LABEL } from "@/lib/promotionTypes"
import { cn } from "@/lib/utils"
import { TableCell } from "@/components/ui/table"

const primaryClass =
  "block min-w-0 truncate text-sm font-medium leading-snug text-foreground"

const secondaryClass =
  "block min-w-0 truncate text-xs leading-snug text-muted-foreground"

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
    <TableCell className="w-12 !px-0 py-2.5 align-middle">
      <div className={selectColumnInnerClass}>
        <Checkbox
          className={tableRowSelectCheckboxClass}
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
    <TableCell className="w-24 px-3 py-2.5 align-middle">
      {src ? (
        <DataWorkspaceTableThumbnail src={src} alt={row.name} size="lg" />
      ) : (
        <ArticleCatalogImagePlaceholder size="lg" />
      )}
    </TableCell>
  )
}

export function PromotionTableNameCell({ row }: { row: PromotionTableRow }) {
  return (
    <TableCell className={tdTruncatedNameCellClass}>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className={primaryClass} title={row.name || undefined}>
          {row.name || "—"}
        </span>
        {row.description.trim() ? (
          <span className={secondaryClass} title={row.description}>
            {row.description}
          </span>
        ) : null}
      </div>
    </TableCell>
  )
}

export function PromotionTableTypeCell({ row }: { row: PromotionTableRow }) {
  return (
    <TableCell className={tdTruncatedTextCellClass}>
      {PROMOTION_TYPE_LABEL[row.promotionType]}
    </TableCell>
  )
}

export function PromotionTablePricingCell({ row }: { row: PromotionTableRow }) {
  return (
    <TableCell className={tdTruncatedTextCellClass}>
      <span className="block truncate" title={row.pricingSummary}>
        {row.pricingSummary}
      </span>
    </TableCell>
  )
}

export function PromotionTableScheduleCell({ row }: { row: PromotionTableRow }) {
  return (
    <TableCell className={tdTruncatedTextCellClass}>
      <span className="block truncate text-xs" title={row.scheduleSummary}>
        {row.scheduleSummary}
      </span>
    </TableCell>
  )
}

export function PromotionTableItemsCell({ row }: { row: PromotionTableRow }) {
  return (
    <TableCell className={tdTruncatedTextCellClass}>
      {row.promotionType === "combo"
        ? `${row.slotCount} ítems · ${row.optionCount} opc.`
        : `${row.optionCount} elegibles`}
    </TableCell>
  )
}

export function PromotionTableStatusCell({ row }: { row: PromotionTableRow }) {
  return (
    <TableCell className="w-[7.5rem] px-3 py-2.5 align-middle">
      <div className="flex flex-wrap gap-1">
        <Badge
          variant="outline"
          className={cn(
            "font-normal",
            row.isActive
              ? "border-emerald-200/90 bg-emerald-50/90 text-emerald-700"
              : "text-muted-foreground",
          )}
        >
          {row.isActive ? "Activa" : "Inactiva"}
        </Badge>
        {row.showInMenu ? (
          <Badge variant="secondary" className="font-normal">
            Menú
          </Badge>
        ) : null}
        {row.autoApply ? (
          <Badge variant="secondary" className="font-normal">
            Auto
          </Badge>
        ) : null}
      </div>
    </TableCell>
  )
}
