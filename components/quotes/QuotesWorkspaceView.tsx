"use client"

import { QUOTE_TABLE_PAGE_SIZES } from "@/app/[siteId]/[popId]/quotes/quoteConstants"
import {
  mergeQuotesWorkspaceUrl,
  parseQuotesWorkspaceUrl,
} from "@/app/[siteId]/[popId]/quotes/workspaceUrl"
import { emptyTableSessionCheckout } from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"
import { buildPaginationItems } from "@/components/data-workspace/buildPaginationItems"
import { SaleQuoteViewDialog } from "@/components/quotes/SaleQuoteViewDialog"
import { SaleQuoteDeleteDialog } from "@/components/quotes/SaleQuoteDeleteDialog"
import { DataWorkspaceListActiveFiltersBar } from "@/components/data-workspace/DataWorkspaceListActiveFiltersBar"
import { DataWorkspaceListFilterChip } from "@/components/data-workspace/DataWorkspaceListFilterChip"
import { DataWorkspaceListSearchField } from "@/components/data-workspace/DataWorkspaceListFilterFields"
import {
  DataWorkspaceTableListFiltersBar,
  DataWorkspaceTableListNatureShell,
  DataWorkspaceTableListPage,
  DataWorkspaceTableListPaginationFooter,
  DataWorkspaceTableListShell,
} from "@/components/data-workspace/DataWorkspaceTableListLayout"
import {
  DataWorkspaceListTableFrame,
  DataWorkspaceTableEmptyMascot,
  DataWorkspaceTableIconAction,
} from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { DataWorkspacePeriodFilter } from "@/components/data-workspace/DataWorkspacePeriodFilter"
import { WorkspaceTableSkeletonRows } from "@/components/data-workspace/WorkspaceTableSkeleton"
import { quotesSkeletonColumns } from "@/components/data-workspace/workspaceTableSkeletonPresets"
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
import { usePopQuotesTable } from "@/hooks/usePopQuotesTable"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { useSaleQuoteDetail } from "@/hooks/useSaleQuoteDetail"
import { hasPopAccessPermission } from "@/lib/popAccessPermissions"
import { POP_PERMS } from "@/lib/popPermissionConstants"
import { popQuotesQueryRoot } from "@/lib/queryKeys"
import {
  deleteSaleQuote,
  fetchSaleQuoteDetail,
} from "@/lib/rootsyApi/quotesClient"
import { useQueryClient } from "@tanstack/react-query"
import {
  computeDataWorkspaceDateBounds,
  dataWorkspaceDateFilterSummary,
  type DataWorkspaceDatePreset,
} from "@/lib/dataWorkspaceDateFilter"
import { exportSaleQuotePdf, printSaleQuotePdf } from "@/lib/saleQuotePdfExport"
import { showReportExportInProgressToast } from "@/lib/reportExportInProgressToast"
import type { SaleQuoteDetail, SaleQuoteTableRow } from "@/lib/saleQuoteTypes"
import { popScopedHref } from "@/lib/popRoutes"
import { cn } from "@/lib/utils"
import {
  Download,
  Eye,
  Printer,
  ShoppingCart,
  Trash2,
} from "lucide-react"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
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

export function QuotesWorkspaceView() {
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
    () => parseQuotesWorkspaceUrl(workspaceParams),
    [workspaceParams],
  )

  const pushWs = useCallback(
    (patch: Parameters<typeof mergeQuotesWorkspaceUrl>[1]) => {
      const qs = mergeQuotesWorkspaceUrl(workspaceParams, patch)
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
  const pageSizeLabelId = useId()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [viewQuoteId, setViewQuoteId] = useState<string | null>(null)
  const [viewPreview, setViewPreview] = useState<SaleQuoteTableRow | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<SaleQuoteTableRow | null>(null)
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

  const quotePerm = useCallback(
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
    quotePerm(POP_PERMS.QUOTES_DELETE) ||
    quotePerm(POP_PERMS.QUOTES_CREATE) ||
    quotePerm({ resource: "sale", action: "delete" }) ||
    quotePerm(POP_PERMS.SALE_CREATE)

  const quotesQuery = usePopQuotesTable(
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

  const detailQuery = useSaleQuoteDetail(popId, viewQuoteId ?? undefined, {
    enabled: viewOpen && Boolean(popId) && Boolean(viewQuoteId),
  })
  const viewQuote: SaleQuoteDetail | null = useMemo(() => {
    if (detailQuery.data?.success) return detailQuery.data.quote
    if (!viewPreview) return null
    return {
      ...viewPreview,
      clientId: null,
      checkoutSnapshot: emptyTableSessionCheckout(),
      metadata: {},
    }
  }, [detailQuery.data, viewPreview])
  const viewRefreshing =
    viewOpen &&
    (detailQuery.isPending ||
      (detailQuery.isFetching && !detailQuery.data?.success))

  const rows = quotesQuery.data?.success ? quotesQuery.data.rows : []
  const totalCount = quotesQuery.data?.success ? quotesQuery.data.totalCount : 0
  const listFetching =
    quotesQuery.isPending ||
    (quotesQuery.isFetching && !quotesQuery.isFetched)
  const tableError =
    quotesQuery.data?.success === false
      ? quotesQuery.data.error
      : quotesQuery.error instanceof Error
        ? quotesQuery.error.message
        : quotesQuery.error
          ? String(quotesQuery.error)
          : null
  const error = actionError ?? tableError

  const refreshQuotesList = useCallback(async () => {
    if (!popId) return
    await queryClient.invalidateQueries({
      queryKey: popQuotesQueryRoot(popId),
    })
  }, [popId, queryClient])

  useEffect(() => {
    const res = quotesQuery.data
    if (!res?.success) return
    if (res.page !== ws.page) pushWs({ page: res.page })
  }, [quotesQuery.data, pushWs, ws.page])

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

  const openView = useCallback((row: SaleQuoteTableRow) => {
    setError(null)
    setViewQuoteId(row.id)
    setViewPreview(row)
    setViewOpen(true)
  }, [])

  const runPdfAction = useCallback(
    async (quoteId: string, action: "download" | "print") => {
      setActionBusyId(quoteId)
      setError(null)
      const dismissToast =
        action === "download"
          ? showReportExportInProgressToast({ title: "Generando presupuesto…" })
          : null
      if (dismissToast) {
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve())
          })
        })
      }
      try {
        const loaded =
          viewQuote?.id === quoteId
            ? viewQuote
            : null
        const quote = loaded
          ? loaded
          : await (async () => {
              const res = await fetchSaleQuoteDetail(popId, quoteId)
              if (!res.success) {
                setError(res.error)
                return null
              }
              return res.quote
            })()
        if (!quote) return
        if (action === "download") {
          await exportSaleQuotePdf(quote, {
            popName: bootstrap?.popName,
            popLogoUrl,
            popStreetAddress: popAccess?.pop.streetAddress ?? null,
            timeZone,
          })
        } else {
          await printSaleQuotePdf(quote, {
            popName: bootstrap?.popName,
            popLogoUrl,
            popStreetAddress: popAccess?.pop.streetAddress ?? null,
            timeZone,
          })
        }
      } catch (e: unknown) {
        setError(
          e instanceof Error ? e.message : "No se pudo exportar el presupuesto.",
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
      viewQuote,
    ],
  )

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleteBusy(true)
    const res = await deleteSaleQuote(popId, deleteTarget.id)
    setDeleteBusy(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    setDeleteTarget(null)
    setError(null)
    await refreshQuotesList()
  }, [deleteTarget, popId, refreshQuotesList])

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

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / Math.max(1, ws.pageSize))),
    [totalCount, ws.pageSize],
  )
  const currentPage = Math.min(Math.max(1, ws.page), totalPages)

  const rangeLabel = useMemo(() => {
    if (totalCount === 0) return { start: 0, end: 0 }
    const start = (currentPage - 1) * ws.pageSize + 1
    const end = Math.min(currentPage * ws.pageSize, totalCount)
    return { start, end }
  }, [currentPage, totalCount, ws.pageSize])

  const paginationItems = useMemo(
    () => buildPaginationItems(totalPages, currentPage),
    [totalPages, currentPage],
  )

  const skeletonRowCount = useMemo(
    () => Math.min(12, Math.max(5, ws.pageSize)),
    [ws.pageSize],
  )

  const resultsSummary = useMemo(() => {
    if (listFetching && totalCount === 0) return "…"
    if (totalCount === 0) return "Sin resultados"
    const noun = totalCount === 1 ? "presupuesto" : "presupuestos"
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
          title: "Presupuestos",
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
                  placeholder="Nombre de cliente… ( / )"
                  resultsSummary={resultsSummary}
                  inputProps={{ "aria-label": "Buscar por nombre de cliente" }}
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
            footer={
              <DataWorkspaceTableListPaginationFooter
                listFetching={listFetching}
                totalCount={totalCount}
                rangeStart={rangeLabel.start}
                rangeEnd={rangeLabel.end}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={ws.pageSize}
                pageSizeOptions={QUOTE_TABLE_PAGE_SIZES}
                paginationItems={paginationItems}
                onPageChange={(p) => pushWs({ page: p })}
                onPageSizeChange={(ps) => {
                  pushWs({
                    pageSize: ps as typeof ws.pageSize,
                    page: 1,
                  })
                }}
                pageSizeLabelId={pageSizeLabelId}
              />
            }
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
                      Cliente
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
                      rowKeyPrefix="quotes-sk"
                      columns={quotesSkeletonColumns()}
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
                              {row.quoteNumber}
                            </span>
                          </TableCell>
                          <TableCell className={workspaceTableLayoutBodyCellClass}>
                            <div className={workspaceTableLayoutCellStackClass}>
                              <span className={workspaceTableNatureTextPrimaryClass}>
                                {row.customerName || "Sin cliente"}
                              </span>
                              {row.customerTaxId ? (
                                <span className={workspaceTableNatureTextSecondaryClass}>
                                  {row.customerTaxId}
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
                              <DataWorkspaceTableIconAction
                                label="Ver"
                                disabled={busy}
                                icon={Eye}
                                variant="neutral"
                                onClick={() => openView(row)}
                              />
                              <DataWorkspaceTableIconAction
                                label="Descargar PDF"
                                disabled={busy}
                                icon={Download}
                                variant="neutral"
                                onClick={() => void runPdfAction(row.id, "download")}
                              />
                              <DataWorkspaceTableIconAction
                                label="Imprimir"
                                disabled={busy}
                                icon={Printer}
                                variant="neutral"
                                onClick={() => void runPdfAction(row.id, "print")}
                              />
                              <DataWorkspaceTableIconAction
                                label="Vender"
                                disabled={busy}
                                icon={ShoppingCart}
                                variant="edit"
                                onClick={() => {
                                  router.push(
                                    `${popScopedHref(siteId, popId, "sale")}?quoteId=${row.id}`,
                                  )
                                }}
                              />
                              {canDelete ? (
                                <DataWorkspaceTableIconAction
                                  label="Eliminar"
                                  disabled={busy}
                                  icon={Trash2}
                                  variant="destructive"
                                  onClick={() => setDeleteTarget(row)}
                                />
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

      <SaleQuoteViewDialog
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open)
          if (!open) {
            setViewQuoteId(null)
            setViewPreview(null)
          }
        }}
        quote={viewQuote}
        formatCreatedAt={formatCreatedAt}
        refreshing={viewRefreshing}
      />

      <SaleQuoteDeleteDialog
        open={deleteTarget != null}
        quote={deleteTarget}
        busy={deleteBusy}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={() => void confirmDelete()}
      />
    </>
  )
}
