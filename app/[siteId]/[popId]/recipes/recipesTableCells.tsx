"use client"

import type { RecipeTableRow } from "@/app/[siteId]/[popId]/recipes/actions"
import {
  recipeTableCategoryColumnClass,
  recipeTableCostColumnClass,
  recipeTableImageColumnClass,
  recipeTableIngredientsColumnClass,
  recipeTableNameColumnClass,
  recipeTableSaleColumnClass,
  recipeTableStatusColumnClass,
} from "@/app/[siteId]/[popId]/recipes/recipesTableLayout"
import { ArticleCatalogImagePlaceholder } from "@/app/[siteId]/[popId]/articles/ArticleCatalogImagePlaceholder"
import { DataWorkspaceTableThumbnail } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { WorkspaceTableSelectCell } from "@/components/data-workspace/WorkspaceTableHeader"
import {
  workspaceTableNatureMoneyClass,
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  workspaceTableLayoutBodyCellClass,
  workspaceTableLayoutCellPrimaryTextClass,
  workspaceTableLayoutCellSecondaryTextClass,
  workspaceTableLayoutCellStackClass,
  workspaceTableLayoutImageColumnClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { RootsNaturePill } from "@/components/rootsy-pill"
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
    <WorkspaceTableSelectCell
      tone="nature"
      checked={checked}
      onCheckedChange={(c) => onCheckedChange(c === true)}
      ariaLabel={label}
    />
  )
}

export function RecipeTableImageCell({ row }: { row: RecipeTableRow }) {
  const src = row.imageUrl?.trim()

  return (
    <TableCell
      className={cn(
        workspaceTableLayoutImageColumnClass,
        recipeTableImageColumnClass,
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

export function RecipeTableNameCell({ row }: { row: RecipeTableRow }) {
  const description = row.description.trim()
  const secondary = description || null

  return (
    <TableCell
      className={cn(
        recipeTableNameColumnClass,
        "min-w-0",
        workspaceTableLayoutBodyCellClass,
      )}
    >
      <div className={workspaceTableLayoutCellStackClass}>
        <p className={cn(primaryClass, "truncate")} title={row.name || undefined}>
          {row.name || "—"}
        </p>
        <p
          className={cn(secondaryClass, "truncate", !secondary && "invisible")}
          title={secondary ?? undefined}
          aria-hidden={!secondary}
        >
          {secondary ?? "\u00A0"}
        </p>
      </div>
    </TableCell>
  )
}

export function RecipeTableCategoryCell({ row }: { row: RecipeTableRow }) {
  return (
    <TableCell
      className={cn(recipeTableCategoryColumnClass, workspaceTableLayoutBodyCellClass)}
    >
      <div className={workspaceTableLayoutCellStackClass}>
        <p className={cn(secondaryClass, "truncate")} title={row.categoryName}>
          {row.categoryName}
        </p>
      </div>
    </TableCell>
  )
}

export function RecipeTableSalePriceCell({ row }: { row: RecipeTableRow }) {
  return (
    <TableCell
      className={cn(
        recipeTableSaleColumnClass,
        workspaceTableLayoutBodyCellClass,
        "text-right text-sm leading-4",
      )}
    >
      <span className={cn("block truncate tabular-nums", workspaceTableNatureMoneyClass)}>
        {formatMoney(row.salePrice)}
      </span>
    </TableCell>
  )
}

export function RecipeTableCostPriceCell({ row }: { row: RecipeTableRow }) {
  return (
    <TableCell
      className={cn(
        recipeTableCostColumnClass,
        workspaceTableLayoutBodyCellClass,
        "text-right text-sm leading-4",
      )}
    >
      <span
        className={cn(
          "block truncate tabular-nums",
          workspaceTableNatureTextSecondaryClass,
        )}
      >
        {formatMoney(row.costPrice)}
      </span>
    </TableCell>
  )
}

export function RecipeTableIngredientsCell({ row }: { row: RecipeTableRow }) {
  return (
    <TableCell
      className={cn(
        recipeTableIngredientsColumnClass,
        workspaceTableLayoutBodyCellClass,
        "text-center text-sm leading-4",
      )}
    >
      <span className={cn("tabular-nums", workspaceTableNatureTextSecondaryClass)}>
        {row.ingredientCount}
      </span>
    </TableCell>
  )
}

export function RecipeTableStatusCell({ row }: { row: RecipeTableRow }) {
  return (
    <TableCell
      className={cn(recipeTableStatusColumnClass, workspaceTableLayoutBodyCellClass)}
    >
      <div className={workspaceTableLayoutCellStackClass}>
        <div className="flex min-h-4 min-w-0 items-center">
          <RootsNaturePill variant={row.isActive ? "savia" : "brumaMuted"}>
            {row.isActive ? "Activa" : "Inactiva"}
          </RootsNaturePill>
        </div>
      </div>
    </TableCell>
  )
}
