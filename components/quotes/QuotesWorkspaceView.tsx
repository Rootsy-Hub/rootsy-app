"use client"

import {
  deleteSaleQuote,
  getSaleQuoteDetail,
  getSaleQuotesTable,
} from "@/app/[siteId]/[popId]/quotes/actions"
import {
  DEFAULT_QUOTE_TABLE_PAGE_SIZE,
  QUOTE_TABLE_PAGE_SIZES,
} from "@/app/[siteId]/[popId]/quotes/quoteConstants"
import { buildPaginationItems } from "@/app/[siteId]/[popId]/layout/layoutPreviewPagination"
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
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
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
import { useRouter } from "next/navigation"
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

type Props = {
  siteId: string
  popId: string
}

export function QuotesWorkspaceView({ siteId, popId }: Props) {
  const router = useRouter()
  const timeZone = usePopTimeZone()
  const { bootstrap, popAccess, loading: bootstrapLoading } = usePopWorkspace()

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

  const [rows, setRows] = useState<SaleQuoteTableRow[]>([])
  const [listFetching, setListFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [datePreset, setDatePreset] =
    useState<DataWorkspaceDatePreset>("this_month")
  const [customDateRange, setCustomDateRange] = useState<
    DateRange | undefined
  >(undefined)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_QUOTE_TABLE_PAGE_SIZE)

  const searchInputId = useId()
  const dateFilterLabelId = useId()
  const dateFilterTriggerId = useId()
  const pageSizeLabelId = useId()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [viewQuote, setViewQuote] = useState<SaleQuoteDetail | null>(null)
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

  const fetchList = useCallback(async () => {
    setListFetching(true)
    try {
      const res = await getSaleQuotesTable(popId, {
        page,
        pageSize,
        q: debouncedSearch,
        dateFrom: dateBounds.from,
        dateTo: dateBounds.to,
      })
      if (!res.success) {
        setRows([])
        setTotalCount(0)
        setError(res.error)
        return
      }
      setRows(res.rows)
      setTotalCount(res.totalCount)
      if (res.page !== page) setPage(res.page)
      setError(null)
    } catch {
      setError("Error inesperado al cargar presupuestos.")
      setRows([])
      setTotalCount(0)
    } finally {
      setListFetching(false)
    }
  }, [
    popId,
    page,
    pageSize,
    debouncedSearch,
    dateBounds.from,
    dateBounds.to,
  ])

  useEffect(() => {
    void fetchList()
  }, [fetchList])

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
    }, 300)
    return () => window.clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, datePreset, customDateRange, pageSize])

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

  const openView = useCallback(async (quoteId: string) => {
    setActionBusyId(quoteId)
    const res = await getSaleQuoteDetail(popId, quoteId)
    setActionBusyId(null)
    if (!res.success) {
      setError(res.error)
      return
    }
    setViewQuote(res.quote)
    setViewOpen(true)
  }, [popId])

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
        const res = await getSaleQuoteDetail(popId, quoteId)
        if (!res.success) {
          setError(res.error)
          return
        }
        if (action === "download") {
          await exportSaleQuotePdf(res.quote, {
            popName: bootstrap?.popName,
            popLogoUrl,
            popStreetAddress: popAccess?.pop.streetAddress ?? null,
            timeZone,
          })
        } else {
          await printSaleQuotePdf(res.quote, {
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
    [bootstrap?.popName, popAccess?.pop.streetAddress, popId, popLogoUrl, timeZone],
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
    await fetchList()
  }, [deleteTarget, fetchList, popId])

  const clearSearch = useCallback(() => {
    setSearchInput("")
    searchInputRef.current?.focus()
  }, [])

  const clearDateFilter = useCallback(() => {
    setDatePreset("this_month")
    setCustomDateRange(undefined)
  }, [])

  const clearAllFilters = useCallback(() => {
    clearSearch()
    clearDateFilter()
    setPage(1)
  }, [clearDateFilter, clearSearch])

  const hasSearchChip = searchInput.trim().length > 0
  const hasFilterChips = hasSearchChip || dateFilterActive
  const activeFilterCount =
    (hasSearchChip ? 1 : 0) + (dateFilterActive ? 1 : 0)

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / Math.max(1, pageSize))),
    [totalCount, pageSize],
  )
  const currentPage = Math.min(Math.max(1, page), totalPages)

  const rangeLabel = useMemo(() => {
    if (totalCount === 0) return { start: 0, end: 0 }
    const start = (currentPage - 1) * pageSize + 1
    const end = Math.min(currentPage * pageSize, totalCount)
    return { start, end }
  }, [currentPage, pageSize, totalCount])

  const paginationItems = useMemo(
    () => buildPaginationItems(totalPages, currentPage),
    [totalPages, currentPage],
  )

  const skeletonRowCount = useMemo(
    () => Math.min(12, Math.max(5, pageSize)),
    [pageSize],
  )

  const resultsSummary = useMemo(() => {
    if (listFetching && totalCount === 0) return "…"
    if (totalCount === 0) return "Sin resultados"
    const noun = totalCount === 1 ? "presupuesto" : "presupuestos"
    return `${totalCount.toLocaleString("es-AR")} ${noun}`
  }, [listFetching, totalCount])

  return (
    <>
      <DataWorkspaceTableListPage
        layout={{
          siteId,
          popId,
          popName: bootstrap?.popName ?? "",
          title: "Presupuestos",
          loading: bootstrapLoading || listFetching,
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
                  onPresetChange={setDatePreset}
                  onCustomRangeChange={setCustomDateRange}
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
                pageSize={pageSize}
                pageSizeOptions={QUOTE_TABLE_PAGE_SIZES}
                paginationItems={paginationItems}
                onPageChange={setPage}
                onPageSizeChange={(ps) => {
                  setPageSize(ps)
                  setPage(1)
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
                                onClick={() => void openView(row.id)}
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
                              <DataWorkspaceTableIconAction
                                label="Eliminar"
                                disabled={busy}
                                icon={Trash2}
                                variant="destructive"
                                onClick={() => setDeleteTarget(row)}
                              />
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
        onOpenChange={setViewOpen}
        quote={viewQuote}
        formatCreatedAt={formatCreatedAt}
        popBrand={popBrand}
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
