"use client"

import type { InventoryCostLayerRow } from "@/app/[siteId]/[popId]/inventory/actions"
import { formatInventoryQtyWithUnit } from "@/app/[siteId]/[popId]/inventory/inventoryFormat"
import {
  dataWorkspaceBlocksEmptyStateClass,
  dataWorkspaceBlocksSectionTitleClass,
  dataWorkspaceEntityCardLosetaSurfaceClass,
  dataWorkspaceEntityCardStatusClosedClass,
  dataWorkspaceEntityCardStatusOpenClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { RootsFormSearchField, RootsFormSegmentField } from "@/components/rootsy-form"
import { RootsSubtleButton } from "@/components/rootsy-button"
import { toISODateLocal } from "@/lib/dataWorkspaceDateFilter"
import {
  formatInventoryExpiryDate,
  inventoryExpiryGroup,
  inventoryExpiryGroupLabel,
  type InventoryExpiryGroup,
} from "@/lib/inventory/inventoryExpiry"
import { cn } from "@/lib/utils"
import { useMemo, useState } from "react"

type ExpiryFilter = "alert" | "dated" | "none"

const FILTER_OPTIONS = [
  { value: "alert", label: "Atención" },
  { value: "dated", label: "Con fecha" },
  { value: "none", label: "Sin fecha" },
] as const

const GROUP_ORDER: InventoryExpiryGroup[] = [
  "expired",
  "d7",
  "d15",
  "d30",
  "later",
  "none",
]

function chipClass(group: InventoryExpiryGroup) {
  if (group === "expired") {
    return cn(
      dataWorkspaceEntityCardStatusClosedClass,
      "border-destructive/25 text-destructive",
    )
  }
  if (group === "none") return dataWorkspaceEntityCardStatusOpenClass
  return dataWorkspaceEntityCardStatusClosedClass
}

export function InventoryExpiryClearing({
  layers,
  canWrite,
  canMerma,
  onEdit,
  onMerma,
}: {
  layers: InventoryCostLayerRow[]
  canWrite: boolean
  canMerma: boolean
  onEdit: (layer: InventoryCostLayerRow) => void
  onMerma: (layer: InventoryCostLayerRow) => void
}) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<ExpiryFilter>("alert")
  const todayIso = toISODateLocal(new Date())

  const rows = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("es")
    return layers
      .filter((layer) => layer.quantityRemaining > 1e-6)
      .filter((layer) => {
        if (!q) return true
        return (
          layer.articleName.toLocaleLowerCase("es").includes(q) ||
          layer.locationName.toLocaleLowerCase("es").includes(q)
        )
      })
      .map((layer) => ({
        layer,
        group: inventoryExpiryGroup(layer.expiresAt, todayIso),
      }))
      .filter(({ group }) => {
        if (filter === "none") return group === "none"
        if (filter === "dated") return group !== "none"
        return group === "expired" || group === "d7" || group === "d15" || group === "d30"
      })
      .sort((a, b) => {
        const byGroup = GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group)
        if (byGroup !== 0) return byGroup
        return (a.layer.expiresAt ?? "9999").localeCompare(
          b.layer.expiresAt ?? "9999",
        )
      })
  }, [layers, query, filter, todayIso])

  const sections = useMemo(() => {
    const map = new Map<InventoryExpiryGroup, typeof rows>()
    for (const row of rows) {
      const list = map.get(row.group) ?? []
      list.push(row)
      map.set(row.group, list)
    }
    return GROUP_ORDER.flatMap((group) => {
      const items = map.get(group)
      return items?.length ? [{ group, items }] : []
    })
  }, [rows])

  return (
    <div className="space-y-4">
      <RootsFormSegmentField
        label="Filtrar vencimientos"
        aria-label="Filtrar vencimientos"
        layout="inline"
        className="[&>span:first-child]:sr-only"
        value={filter}
        onValueChange={(value) => setFilter(value as ExpiryFilter)}
        options={FILTER_OPTIONS}
      />
      <RootsFormSearchField
        label="Buscar artículo"
        hideLabel
        placeholder="Buscar artículo o depósito"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClear={() => setQuery("")}
      />

      {sections.length === 0 ? (
        <p className={dataWorkspaceBlocksEmptyStateClass}>
          {filter === "none"
            ? "Todo el stock con cantidad ya tiene fecha, o no hay capas abiertas."
            : filter === "dated"
              ? "Ningún lote tiene fecha todavía."
              : "Nada vencido ni por vencer en los próximos 30 días."}
        </p>
      ) : (
        sections.map(({ group, items }) => (
          <div key={group} className="space-y-2">
            <h3 className={dataWorkspaceBlocksSectionTitleClass}>
              {inventoryExpiryGroupLabel(group)}
            </h3>
            <div
              className={cn(
                dataWorkspaceEntityCardLosetaSurfaceClass,
                "overflow-hidden",
              )}
            >
              <ul className="divide-y divide-[var(--rootsy-bruma-200)]">
                {items.map(({ layer, group: rowGroup }) => (
                  <li key={layer.id}>
                    <div className="flex items-start gap-3 px-4 py-3">
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        disabled={!canWrite}
                        onClick={() => onEdit(layer)}
                      >
                        <p className="truncate font-canopy text-sm font-semibold text-[var(--rootsy-bruma-900)]">
                          {layer.articleName}
                        </p>
                        <p className="mt-0.5 font-canopy text-xs text-[var(--rootsy-bruma-500)]">
                          {layer.locationName}
                          {" · "}
                          {formatInventoryQtyWithUnit(
                            layer.quantityRemaining,
                            layer.unitOfMeasure,
                          )}
                          {layer.expiresAt
                            ? ` · ${formatInventoryExpiryDate(layer.expiresAt)}`
                            : ""}
                        </p>
                      </button>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span className={chipClass(rowGroup)}>
                          {inventoryExpiryGroupLabel(rowGroup)}
                        </span>
                        {canMerma ? (
                          <RootsSubtleButton
                            type="button"
                            size="compact"
                            onClick={() => onMerma(layer)}
                          >
                            Restar merma
                          </RootsSubtleButton>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
