"use client"

import { RootsIconButton } from "@/components/rootsy-button"
import {
  mergePurchaseOrdersWorkspaceUrl,
  parsePurchaseOrdersWorkspaceUrl,
} from "@/app/[siteId]/[popId]/purchase-orders/workspaceUrl"
import { PurchaseOrderViewDialog } from "@/components/purchase-orders/PurchaseOrderViewDialog"
import { PurchaseOrderDeleteDialog } from "@/components/purchase-orders/PurchaseOrderDeleteDialog"
import { DataWorkspaceListActiveFiltersBar } from "@/components/data-workspace/DataWorkspaceListActiveFiltersBar"
import { DataWorkspaceListFilterChip } from "@/components/data-workspace/DataWorkspaceListFilterChip"
import { DataWorkspaceListSearchField } from "@/components/data-workspace/DataWorkspaceListFilterFields"
import {
  DataWorkspaceTableListFiltersBar,
  DataWorkspaceTableListNatureShell,
  DataWorkspaceTableListPage,
  tableListInfiniteFromQuery,
  DataWorkspaceTableListShell,
} from "@/components/data-workspace/DataWorkspaceTableListLayout"
import {
  DataWorkspaceListTableFrame,
  DataWorkspaceTableEmptyMascot,
} from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { DataWorkspacePeriodFilter } from "@/components/data-workspace/DataWorkspacePeriodFilter"
import {
  DATA_WORKSPACE_TABLE_SKELETON_ROW_COUNT,
  WorkspaceTableSkeletonRows,
} from "@/components/data-workspace/WorkspaceTableSkeleton"
import { purchaseOrdersSkeletonColumns } from "@/components/data-workspace/workspaceTableSkeletonPresets"
import {
  workspaceTableLayoutClassName,
  workspaceTableNatureMoneyClass,
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  dataWorkspaceListFiltersGridClass,
  dataWorkspaceListFiltersPanelClass,
  dataWorkspaceListFiltersPanelLastClass,
  workspaceTableLayoutActionsBodyCellClass,
  workspaceTableLayoutBodyCellClass,
  workspaceTableLayoutCellStackClass,
  workspaceTableLayoutHeaderHeadClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import {
  WorkspaceTableBodyRow,
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { useAfterHydration } from "@/hooks/useIsHydrated"
import { usePopMenuCache } from "@/hooks/usePopMenuCache"
import { usePopPurchaseOrdersTable } from "@/hooks/usePopPurchaseOrdersTable"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { usePurchaseOrderDetail } from "@/hooks/usePurchaseOrderDetail"
import { hasPopAccessPermission } from "@/lib/popAccessPermissions"
import { POP_PERMS } from "@/lib/popPermissionConstants"
import { invalidateDataWorkspaceTableInfinite } from "@/lib/dataWorkspaceTableInfinite"
import { popPurchaseOrdersQueryRoot } from "@/lib/queryKeys"
import {
  deletePurchaseOrder,
  fetchPurchaseOrderDetail,
} from "@/lib/rootsyApi/purchaseOrdersClient"
import { emptyPurchaseCheckoutSnapshot } from "@/lib/purchaseOrderCheckoutState"
import { useQueryClient } from "@tanstack/react-query"
import {
  computeDataWorkspaceDateBounds,
  dataWorkspaceDateFilterSummary,
  type DataWorkspaceDatePreset,
} from "@/lib/dataWorkspaceDateFilter"
import {
  exportPurchaseOrderPdf,
  printPurchaseOrderPdf,
} from "@/lib/purchaseOrderPdfExport"
import { showReportExportInProgressToast } from "@/lib/reportExportInProgressToast"
import type {
  PurchaseOrderDetail,
  PurchaseOrderTableRow,
} from "@/lib/purchaseOrderTypes"
import { popScopedHref } from "@/lib/popRoutes"
import { cn } from "@/lib/utils"
import { Download, Eye, Printer, Trash2, Truck } from "lucide-react"
import { useParams, usePathname, useRouter, useSearchParams } from "@/lib/pop-spa/navigation"
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react"
import type { DateRange } from "react-day-picker"
import { Table, TableBody, TableCell } from "@/components/ui/table"

const moneyFmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

export function PurchaseOrdersWorkspaceView() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : ""
  const queryClient = useQueryClient()
  const timeZone = usePopTimeZone()
  const { bootstrap, popAccess, loading: bootstrapLoading, hasPermission } =
    usePopWorkspace()
  const afterHydration = useAfterHydration()
  const menuCache = usePopMenuCache(popId)

  const [workspaceSearch, setWorkspaceSearch] = useState(() =>
    searchParams.toString(),
  )

  useEffect(() => {
    setWorkspaceSearch(searchParams.toString())
  }, [searchParams])

  const workspaceParams = useMemo(
    () => new URLSearchParams(workspaceSearch),
    [workspaceSearch],
  )
  const ws = useMemo(
    () => parsePurchaseOrdersWorkspaceUrl(workspaceParams),
    [workspaceParams],
  )

  const pushWs = useCallback(
    (patch: Parameters<typeof mergePurchaseOrdersWorkspaceUrl>[1]) => {
      const qs = mergePurchaseOrdersWorkspaceUrl(workspaceParams, patch)
      const next = qs.toString() ? `${pathname}?${qs.toString()}` : pathname
      if (typeof window !== "undefined") {
        const current = `${window.location.pathname}${window.location.search}`
        if (current !== next) {
          window.history.replaceState(window.history.state, "", next)
        }
      }
      setWorkspaceSearch(qs.toString())
    },
    [pathname, workspaceParams],
  )

  const popLogoUrl = useMemo(
    () =>
      popAccess?.pop.imageUrl?.trim() ||
      `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(popId)}&backgroundColor=e8f5ef`,
    [popAccess?.pop.imageUrl, popId],
  )

  const popBrand = useMemo(
    () => ({
      name: bootstrap?.popName ?? popAccess?.pop.name ?? "",
      imageUrl: popLogoUrl,
      streetAddress: popAccess?.pop.streetAddress ?? null,
      city: null as string | null,
      fallbackSeed: popId,
    }),
    [
      bootstrap?.popName,
      popAccess?.pop.name,
      popAccess?.pop.streetAddress,
      popId,
      popLogoUrl,
    ],
  )

  const [actionError, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState(ws.q)
  const [datePreset, setDatePreset] =
    useState<DataWorkspaceDatePreset>("this_month")
  const [customDateRange, setCustomDateRange] = useState<
    DateRange | undefined
  >(undefined)

  const searchInputId = useId()
  const dateFilterLabelId = useId()
  const dateFilterTriggerId = useId()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [viewOrderId, setViewOrderId] = useState<string | null>(null)
  const [viewPreview, setViewPreview] = useState<PurchaseOrderTableRow | null>(
    null,
  )
  const [viewOpen, setViewOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PurchaseOrderTableRow | null>(
    null,
  )
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [actionBusyId, setActionBusyId] = useState<string | null>(null)

  const dateBounds = useMemo(
    () => computeDataWorkspaceDateBounds(datePreset, customDateRange),
    [datePreset, customDateRange],
  )

  const dateFilterActive = datePreset !== "this_month"
  const dateFilterSummary = useMemo(
    () => dataWorkspaceDateFilterSummary(datePreset, dateBounds),
    [datePreset, dateBounds],
  )

  const orderPerm = useCallback(
    (perm: { resource: string; action: string }) =>
      afterHydration &&
      (hasPermission(perm.resource, perm.action) ||
        (menuCache.popAccess
          ? hasPopAccessPermission(
              menuCache.popAccess,
              perm.resource,
              perm.action,
            )
          : false)),
    [afterHydration, hasPermission, menuCache.popAccess],
  )
  const canDelete =
    orderPerm(POP_PERMS.PURCHASE_ORDERS_DELETE) ||
    orderPerm(POP_PERMS.PURCHASE_ORDERS_CREATE) ||
    orderPerm(POP_PERMS.OPERATIONS_DELETE) ||
    orderPerm(POP_PERMS.OPERATIONS_CREATE)

  const ordersQuery = usePopPurchaseOrdersTable(
    popId,
    {
      page: ws.page,
      pageSize: ws.pageSize,
      q: ws.q,
      dateFrom: dateBounds.from,
      dateTo: dateBounds.to,
    },
    { enabled: Boolean(popId && siteId) },
  )

  const detailQuery = usePurchaseOrderDetail(popId, viewOrderId ?? undefined, {
    enabled: viewOpen && Boolean(popId) && Boolean(viewOrderId),
  })
  const viewOrder: PurchaseOrderDetail | null = useMemo(() => {
    if (detailQuery.data?.success) return detailQuery.data.order
    if (!viewPreview) return null
    return {
      ...viewPreview,
      supplierId: null,
      checkoutSnapshot: emptyPurchaseCheckoutSnapshot(),
      metadata: {},
    }
  }, [detailQuery.data, viewPreview])
  const viewRefreshing =
    viewOpen &&
    (detailQuery.isPending ||
      (detailQuery.isFetching && !detailQuery.data?.success))

  const rows = ordersQuery.data?.success ? ordersQuery.data.rows : []
  const totalCount = ordersQuery.data?.success ? ordersQuery.data.totalCount : 0
  const listFetching =
    ordersQuery.isPending ||
    (ordersQuery.isFetching && !ordersQuery.isFetched)
  const tableError =
    ordersQuery.data?.success === false
      ? ordersQuery.data.error
      : ordersQuery.error instanceof Error
        ? ordersQuery.error.message
        : ordersQuery.error
          ? String(ordersQuery.error)
          : null
  const error = actionError ?? tableError

  const refreshPurchaseOrdersList = useCallback(async () => {
    if (!popId) return
    await invalidateDataWorkspaceTableInfinite(
      queryClient,
      popPurchaseOrdersQueryRoot(popId),
    )
  }, [popId, queryClient])

  useEffect(() => {
    const res = ordersQuery.data
    if (!res?.success) return
    if (res.page !== ws.page) pushWs({ page: res.page })
  }, [ordersQuery.data, pushWs, ws.page])

  useEffect(() => {
    setSearchInput(ws.q)
  }, [ws.q])

  useEffect(() => {
    const t = window.setTimeout(() => {
      const next = searchInput.trim()
      if (next === ws.q.trim()) return
      pushWs({ q: next, page: 1 })
    }, 300)
    return () => window.clearTimeout(t)
  }, [pushWs, searchInput, ws.q])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target
      if (!(target instanceof HTMLElement)) return
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return
      }
      e.preventDefault()
      searchInputRef.current?.focus()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const formatCreatedAt = useCallback(
    (iso: string) => {
      const date = new Date(iso)
      if (Number.isNaN(date.getTime())) return iso
      return new Intl.DateTimeFormat("es-AR", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone,
      }).format(date)
    },
    [timeZone],
  )

  const openView = useCallback((row: PurchaseOrderTableRow) => {
    setError(null)
    setViewOrderId(row.id)
    setViewPreview(row)
    setViewOpen(true)
  }, [])

  const runPdfAction = useCallback(
    async (orderId: string, action: "download" | "print") => {
      setActionBusyId(orderId)
      setError(null)
      const dismissToast =
        action === "download"
          ? showReportExportInProgressToast({
              title: "Generando orden de compra…",
            })
          : null
      if (dismissToast) {
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve())
          })
        })
      }
      try {
        const loaded = viewOrder?.id === orderId ? viewOrder : null
        const order = loaded
          ? loaded
          : await (async () => {
              const res = await fetchPurchaseOrderDetail(popId, orderId)
              if (!res.success) {
                setError(res.error)
                return null
              }
              return res.order
            })()
        if (!order) return
        if (action === "download") {
          await exportPurchaseOrderPdf(order, {
            popName: bootstrap?.popName,
            popLogoUrl,
            popStreetAddress: popAccess?.pop.streetAddress ?? null,
            timeZone,
          })
        } else {
          await printPurchaseOrderPdf(order, {
            popName: bootstrap?.popName,
            popLogoUrl,
            popStreetAddress: popAccess?.pop.streetAddress ?? null,
            timeZone,
          })
        }
      } catch (e: unknown) {
        setError(
          e instanceof Error
            ? e.message
            : "No se pudo exportar la orden de compra.",
        )
      } finally {
        setActionBusyId(null)
        dismissToast?.()
      }
    },
    [
      bootstrap?.popName,
      popAccess?.pop.streetAddress,
      popId,
      popLogoUrl,
      timeZone,
      viewOrder,
    ],
  )

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleteBusy(true)
    const res = await deletePurchaseOrder(popId, deleteTarget.id)
    setDeleteBusy(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    setDeleteTarget(null)
    setError(null)
    await refreshPurchaseOrdersList()
  }, [deleteTarget, popId, refreshPurchaseOrdersList])

  const clearSearch = useCallback(() => {
    setSearchInput("")
    pushWs({ q: "", page: 1 })
    searchInputRef.current?.focus()
  }, [pushWs])

  const clearDateFilter = useCallback(() => {
    setDatePreset("this_month")
    setCustomDateRange(undefined)
  }, [])

  const clearAllFilters = useCallback(() => {
    clearSearch()
    clearDateFilter()
    pushWs({ page: 1 })
  }, [clearDateFilter, clearSearch, pushWs])

  const hasSearchChip = searchInput.trim().length > 0
  const hasFilterChips = hasSearchChip || dateFilterActive
  const activeFilterCount =
    (hasSearchChip ? 1 : 0) + (dateFilterActive ? 1 : 0)
  const skeletonRowCount = DATA_WORKSPACE_TABLE_SKELETON_ROW_COUNT

  const resultsSummary = useMemo(() => {
    if (listFetching && totalCount === 0) return "…"
    if (totalCount === 0) return "Sin resultados"
    const noun = totalCount === 1 ? "orden de compra" : "órdenes de compra"
    return `${totalCount.toLocaleString("es-AR")} ${noun}`
  }, [listFetching, totalCount])

  useEffect(() => {
    if (!viewOpen || !detailQuery.data || detailQuery.data.success) return
    setError(detailQuery.data.error)
  }, [detailQuery.data, viewOpen])

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado</p>
      </div>
    )
  }

  return (
    <>
      <DataWorkspaceTableListPage
        layout={{
          siteId,
          popId,
          popName: bootstrap?.popName ?? "",
          title: "Órdenes de compra",
          loading: bootstrapLoading,
          userName: bootstrap?.userFullName,
          userAvatarSrc: bootstrap?.userImageUrl ?? undefined,
        }}
        error={error}
      >
        <DataWorkspaceTableListNatureShell>
          <DataWorkspaceTableListFiltersBar>
            <div className={dataWorkspaceListFiltersGridClass}>
              <div className={dataWorkspaceListFiltersPanelClass}>
                <DataWorkspacePeriodFilter
                  variant="layout"
                  preset={datePreset}
                  customRange={customDateRange}
                  onPresetChange={(preset) => {
                    setDatePreset(preset)
                    pushWs({ page: 1 })
                  }}
                  onCustomRangeChange={(range) => {
                    setCustomDateRange(range)
                    pushWs({ page: 1 })
                  }}
                  bounds={dateBounds}
                  showActiveState={false}
                  labelId={dateFilterLabelId}
                  triggerId={dateFilterTriggerId}
                />
              </div>

              <div className={dataWorkspaceListFiltersPanelLastClass}>
                <DataWorkspaceListSearchField
                  id={searchInputId}
                  inputRef={searchInputRef}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onClear={clearSearch}
                  placeholder="Nombre de proveedor… ( / )"
                  resultsSummary={resultsSummary}
                  inputProps={{ "aria-label": "Buscar por nombre de proveedor" }}
                />
              </div>
            </div>
          </DataWorkspaceTableListFiltersBar>

          <DataWorkspaceTableListShell
            activeFiltersBar={
              hasFilterChips ? (
                <DataWorkspaceListActiveFiltersBar
                  activeCount={activeFilterCount}
                  onClearAll={clearAllFilters}
                >
                  {dateFilterActive ? (
                    <DataWorkspaceListFilterChip
                      label={`Fecha: ${dateFilterSummary}`}
                      onRemove={clearDateFilter}
                      removeAriaLabel="Quitar filtro de fecha"
                    />
                  ) : null}
                  {hasSearchChip ? (
                    <DataWorkspaceListFilterChip
                      label={`Buscar: «${searchInput.trim()}»`}
                      onRemove={clearSearch}
                      removeAriaLabel="Quitar búsqueda"
                    />
                  ) : null}
                </DataWorkspaceListActiveFiltersBar>
              ) : null
            }
            overlay={
              !listFetching && totalCount === 0 ? (
                <DataWorkspaceTableEmptyMascot />
              ) : null
            }
            infinite={tableListInfiniteFromQuery(ordersQuery, "purchase-orders")}
          >
            <DataWorkspaceListTableFrame>
              <Table
                className={cn(workspaceTableLayoutClassName, "min-w-[48rem]")}
                aria-busy={listFetching}
              >
                <WorkspaceTableHeader>
                  <WorkspaceTableHeaderRow>
                    <WorkspaceTableHead className={workspaceTableLayoutHeaderHeadClass}>
                      N.º
                    </WorkspaceTableHead>
                    <WorkspaceTableHead className={workspaceTableLayoutHeaderHeadClass}>
                      Proveedor
                    </WorkspaceTableHead>
                    <WorkspaceTableHead className={workspaceTableLayoutHeaderHeadClass}>
                      Total
                    </WorkspaceTableHead>
                    <WorkspaceTableHead className={workspaceTableLayoutHeaderHeadClass}>
                      Fecha
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      className={cn(workspaceTableLayoutHeaderHeadClass, "text-right")}
                    >
                      Acciones
                    </WorkspaceTableHead>
                  </WorkspaceTableHeaderRow>
                </WorkspaceTableHeader>
                <TableBody>
                  {listFetching ? (
                    <WorkspaceTableSkeletonRows
                      rowCount={skeletonRowCount}
                      rowKeyPrefix="purchase-orders-sk"
                      columns={purchaseOrdersSkeletonColumns()}
                      tone="nature"
                    />
                  ) : totalCount === 0 ? null : (
                    rows.map((row, index) => {
                      const busy = actionBusyId === row.id
                      return (
                        <WorkspaceTableBodyRow key={row.id} index={index}>
                          <TableCell className={workspaceTableLayoutBodyCellClass}>
                            <span
                              className={cn(
                                workspaceTableNatureTextPrimaryClass,
                                "tabular-nums font-medium",
                              )}
                            >
                              {row.orderNumber}
                            </span>
                          </TableCell>
                          <TableCell className={workspaceTableLayoutBodyCellClass}>
                            <div className={workspaceTableLayoutCellStackClass}>
                              <span className={workspaceTableNatureTextPrimaryClass}>
                                {row.supplierName || "Sin proveedor"}
                              </span>
                              {row.supplierTaxId ? (
                                <span className={workspaceTableNatureTextSecondaryClass}>
                                  {row.supplierTaxId}
                                </span>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell className={workspaceTableLayoutBodyCellClass}>
                            <span className={workspaceTableNatureMoneyClass}>
                              {moneyFmt.format(row.total)}
                            </span>
                          </TableCell>
                          <TableCell className={workspaceTableLayoutBodyCellClass}>
                            <span className={workspaceTableNatureTextSecondaryClass}>
                              {formatCreatedAt(row.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell
                            className={cn(
                              workspaceTableLayoutActionsBodyCellClass,
                              "text-right",
                            )}
                          >
                            <div className="flex justify-end gap-1">
                              <RootsIconButton
                                type="button"
                                label="Ver"
                                tone="action"
                                intent="neutral"
                                size="compact"
                                disabled={busy}
                                onClick={() => openView(row)}
                              >
                                <Eye />
                              </RootsIconButton>
                              <RootsIconButton
                                type="button"
                                label="Descargar PDF"
                                tone="action"
                                intent="neutral"
                                size="compact"
                                disabled={busy}
                                onClick={() => void runPdfAction(row.id, "download")}
                              >
                                <Download />
                              </RootsIconButton>
                              <RootsIconButton
                                type="button"
                                label="Imprimir"
                                tone="action"
                                intent="neutral"
                                size="compact"
                                disabled={busy}
                                onClick={() => void runPdfAction(row.id, "print")}
                              >
                                <Printer />
                              </RootsIconButton>
                              <RootsIconButton
                                type="button"
                                label="Comprar"
                                tone="action"
                                intent="edit"
                                size="compact"
                                disabled={busy}
                                onClick={() => {
                                  router.push(
                                    `${popScopedHref(siteId, popId, "purchases")}?orderId=${row.id}`,
                                  )
                                }}
                              >
                                <Truck />
                              </RootsIconButton>
                              {canDelete ? (
                                <RootsIconButton
                                  type="button"
                                  label="Eliminar"
                                  tone="action"
                                  intent="destructive"
                                  size="compact"
                                  disabled={busy}
                                  onClick={() => setDeleteTarget(row)}
                                >
                                  <Trash2 />
                                </RootsIconButton>
                              ) : null}
                            </div>
                          </TableCell>
                        </WorkspaceTableBodyRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </DataWorkspaceListTableFrame>
          </DataWorkspaceTableListShell>
        </DataWorkspaceTableListNatureShell>
      </DataWorkspaceTableListPage>

      <PurchaseOrderViewDialog
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open)
          if (!open) {
            setViewOrderId(null)
            setViewPreview(null)
          }
        }}
        order={viewOrder}
        formatCreatedAt={formatCreatedAt}
        popBrand={popBrand}
        refreshing={viewRefreshing}
      />

      <PurchaseOrderDeleteDialog
        open={deleteTarget != null}
        order={deleteTarget}
        busy={deleteBusy}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={() => void confirmDelete()}
      />
    </>
  )
}
