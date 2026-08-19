"use client"

import type { InventoryArticleRow } from "@/app/[siteId]/[popId]/inventory/actions"
import {
  formatInventoryMoney,
  formatInventoryQty,
  inventoryAttentionLabel,
} from "@/app/[siteId]/[popId]/inventory/inventoryFormat"
import {
  dataWorkspaceBlocksEmptyStateClass,
  dataWorkspaceEntityCardLosetaSurfaceClass,
  dataWorkspaceEntityCardStatusClosedClass,
  dataWorkspaceEntityCardStatusOpenClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { shortUnitOfMeasure } from "@/lib/articleItemKind"
import type { InventoryAttention } from "@/lib/inventory/inventoryStockLevels"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

function AttentionChip({ attention }: { attention: InventoryAttention }) {
  const label = inventoryAttentionLabel(attention)
  if (attention === "ok") {
    return <span className={dataWorkspaceEntityCardStatusOpenClass}>{label}</span>
  }
  if (attention === "overstock") {
    return (
      <span className={dataWorkspaceEntityCardStatusClosedClass}>{label}</span>
    )
  }
  return (
    <span
      className={cn(
        dataWorkspaceEntityCardStatusClosedClass,
        attention === "negative"
          ? "border-destructive/25 text-destructive"
          : "text-[var(--rootsy-bruma-900)]",
      )}
    >
      {label}
    </span>
  )
}

export function InventoryArticleRowList({
  rows,
  empty,
  trailing,
  onRowClick,
}: {
  rows: InventoryArticleRow[]
  empty: string
  trailing?: (row: InventoryArticleRow) => ReactNode
  onRowClick?: (row: InventoryArticleRow) => void
}) {
  if (rows.length === 0) {
    return <p className={dataWorkspaceBlocksEmptyStateClass}>{empty}</p>
  }

  return (
    <div className={cn(dataWorkspaceEntityCardLosetaSurfaceClass, "overflow-hidden")}>
      <ul className="divide-y divide-[var(--rootsy-bruma-200)]">
        {rows.map((row) => {
          const uom = shortUnitOfMeasure(row.unitOfMeasure)
          const content = (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate font-canopy text-sm font-semibold text-[var(--rootsy-bruma-900)]">
                  {row.name}
                </p>
                <p className="mt-0.5 font-canopy text-xs text-[var(--rootsy-bruma-500)]">
                  {row.minLevel != null && row.minLevel > 0
                    ? `Mínimo ${formatInventoryQty(row.minLevel)}${uom ? ` ${uom}` : ""}`
                    : "Sin mínimo"}
                  {row.inventoryValue > 0
                    ? ` · ${formatInventoryMoney(row.inventoryValue)}`
                    : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <AttentionChip attention={row.attention} />
                <div className="min-w-[4.5rem] text-right">
                  <p
                    className={cn(
                      "font-numeric text-base font-bold tabular-nums tracking-tight",
                      row.attention === "negative"
                        ? "text-destructive"
                        : "text-[var(--rootsy-bruma-900)]",
                    )}
                  >
                    {formatInventoryQty(row.onHand)}
                    {uom ? (
                      <span className="ml-1 font-canopy text-[11px] font-medium text-[var(--rootsy-bruma-500)]">
                        {uom}
                      </span>
                    ) : null}
                  </p>
                  {trailing ? (
                    <div className="mt-0.5 font-canopy text-[11px] text-[var(--rootsy-bruma-500)]">
                      {trailing(row)}
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          )

          if (!onRowClick) {
            return (
              <li
                key={row.articleId}
                className="flex items-center gap-4 px-4 py-3.5"
              >
                {content}
              </li>
            )
          }

          return (
            <li key={row.articleId}>
              <button
                type="button"
                onClick={() => onRowClick(row)}
                className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-[var(--rootsy-bruma-50)] focus-visible:bg-[var(--rootsy-bruma-50)] focus-visible:outline-none"
              >
                {content}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
