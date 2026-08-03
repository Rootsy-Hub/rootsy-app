"use client"

import type { RecipeTableRow } from "@/app/[siteId]/[popId]/recipes/actions"
import { ArticleCatalogImagePlaceholder } from "@/app/[siteId]/[popId]/articles/ArticleCatalogImagePlaceholder"
import { DataWorkspaceTableThumbnail } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  selectColumnInnerClass,
  tableRowSelectCheckboxClass,
  tdMoneyMutedClass,
  tdMoneyTotalClass,
  tdTruncatedNameCellClass,
  tdTruncatedTextCellClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { TableCell } from "@/components/ui/table"

const primaryClass =
  "block min-w-0 truncate text-sm font-medium leading-snug text-foreground"

const secondaryClass =
  "block min-w-0 truncate text-xs leading-snug text-muted-foreground"

function formatMoney(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(n)
}

export function RecipeTableSelectCell({
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

export function RecipeTableImageCell({ row }: { row: RecipeTableRow }) {
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

export function RecipeTableNameCell({ row }: { row: RecipeTableRow }) {
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

export function RecipeTableCategoryCell({ row }: { row: RecipeTableRow }) {
  return (
    <TableCell className={cn(tdTruncatedTextCellClass, "text-muted-foreground")}>
      <span className="block truncate" title={row.categoryName}>
        {row.categoryName}
      </span>
    </TableCell>
  )
}

export function RecipeTableSalePriceCell({ row }: { row: RecipeTableRow }) {
  return (
    <TableCell className={cn("px-3 py-2.5 text-right text-sm", tdMoneyTotalClass)}>
      {formatMoney(row.salePrice)}
    </TableCell>
  )
}

export function RecipeTableCostPriceCell({ row }: { row: RecipeTableRow }) {
  return (
    <TableCell className={cn("px-3 py-2.5 text-right text-sm", tdMoneyMutedClass)}>
      {formatMoney(row.costPrice)}
    </TableCell>
  )
}

export function RecipeTableIngredientsCell({ row }: { row: RecipeTableRow }) {
  return (
    <TableCell className="w-[5.5rem] px-3 py-2.5 text-center text-sm tabular-nums text-muted-foreground">
      {row.ingredientCount}
    </TableCell>
  )
}

export function RecipeTableStatusCell({ row }: { row: RecipeTableRow }) {
  return (
    <TableCell className="w-[6.5rem] px-3 py-2.5 align-middle">
      <Badge
        variant="secondary"
        className={cn(
          "font-normal",
          row.isActive
            ? "border-emerald-200/80 bg-emerald-50 text-emerald-800"
            : "text-muted-foreground",
        )}
      >
        {row.isActive ? "Activa" : "Inactiva"}
      </Badge>
    </TableCell>
  )
}
