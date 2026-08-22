"use client"

import type { InventoryCostLayerRow } from "@/app/[siteId]/[popId]/inventory/actions"
import { formatInventoryQtyWithUnit } from "@/app/[siteId]/[popId]/inventory/inventoryFormat"
import {
  InventoryListStatus,
  useInventoryInfiniteSentinel,
} from "@/app/[siteId]/[popId]/inventory/inventoryInfinite"
import {
  dataWorkspaceBlocksEmptyStateClass,
  dataWorkspaceBlocksSectionTitleClass,
  dataWorkspaceEntityCardLosetaSurfaceClass,
  dataWorkspaceEntityCardStatusClosedClass,
  dataWorkspaceEntityCardStatusOpenClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { RootsBanner } from "@/components/rootsy-banner"
import { RootsSubtleButton } from "@/components/rootsy-button"
import { RootsFormSearchField, RootsFormSegmentField } from "@/components/rootsy-form"
import { usePopInventoryExpiry } from "@/hooks/usePopInventory"
import { toISODateLocal } from "@/lib/dataWorkspaceDateFilter"
import {
  formatInventoryExpiryDate,
  inventoryExpiryGroup,
  inventoryExpiryGroupLabel,
  type InventoryExpiryGroup,
} from "@/lib/inventory/inventoryExpiry"
import { cn } from "@/lib/utils"
import { useCallback, useEffect, useMemo, useState } from "react"

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
  popId,
  canWrite,
  canMerma,
  onEdit,
  onMerma,
}: {
  popId: string
  canWrite: boolean
  canMerma: boolean
  onEdit: (layer: InventoryCostLayerRow) => void
  onMerma: (layer: InventoryCostLayerRow) => void
}) {
  const [filter, setFilter] = useState<ExpiryFilter>("alert")
  const [searchInput, setSearchInput] = useState("")
  const [query, setQuery] = useState("")
  const todayIso = toISODateLocal(new Date())

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (searchInput.trim() === query.trim()) return
      setQuery(searchInput)
    }, 400)
    return () => window.clearTimeout(t)
  }, [query, searchInput])

  const expiryQuery = usePopInventoryExpiry(popId, {
    q: query,
    filter,
  })
  const fetchMore = expiryQuery.fetchNextPage
  const canFetchMore =
    Boolean(expiryQuery.hasNextPage) && !expiryQuery.isFetchingNextPage
  const loadMore = useCallback(() => {
    if (!canFetchMore) return
    void fetchMore()
  }, [canFetchMore, fetchMore])
  const setSentinel = useInventoryInfiniteSentinel(canFetchMore, loadMore)

  const rows = useMemo(
    () =>
      expiryQuery.costLayers.map((layer) => ({
        layer,
        group: inventoryExpiryGroup(layer.expiresAt, todayIso),
      })),
    [expiryQuery.costLayers, todayIso],
  )

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
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onClear={() => {
          setSearchInput("")
          setQuery("")
        }}
      />

      {expiryQuery.errorMessage ? (
        <RootsBanner
          intent="danger"
          layout="message"
          message={expiryQuery.errorMessage}
        />
      ) : null}

      {expiryQuery.isPending && rows.length === 0 ? (
        <p className={dataWorkspaceBlocksEmptyStateClass}>Cargando…</p>
      ) : sections.length === 0 ? (
        <p className={dataWorkspaceBlocksEmptyStateClass}>
          {filter === "none"
            ? "Todo el stock con cantidad ya tiene fecha, o no hay capas abiertas."
            : filter === "dated"
              ? "Ningún lote tiene fecha todavía."
              : "Nada vencido ni por vencer en los próximos 30 días."}
        </p>
      ) : (
        <>
          {sections.map(({ group, items }) => (
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
          ))}
          <div ref={setSentinel} className="h-px w-full" aria-hidden />
          <InventoryListStatus
            hasItems
            hasMore={Boolean(expiryQuery.hasNextPage)}
            fetchingMore={expiryQuery.isFetchingNextPage}
          />
        </>
      )}
    </div>
  )
}
