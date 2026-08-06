"use client"

import {
  getOperationsList,
  type OperationExpenseLedgerRow,
  type OperationPurchaseRow,
  type OperationSaleRow,
} from "@/app/[siteId]/[popId]/operations/actions"
import {
  OperationsSalesTable,
} from "@/app/[siteId]/[popId]/operations/OperationsSalesTable"
import { OperationsExpensesTable } from "@/app/[siteId]/[popId]/operations/OperationsExpensesTable"
import { OperationsPurchasesTable } from "@/app/[siteId]/[popId]/operations/OperationsPurchasesTable"
import { exportOperationsCsv } from "@/app/[siteId]/[popId]/operations/operationsCsvExport"
import { buildPaginationItems } from "@/app/[siteId]/[popId]/layout/layoutPreviewPagination"
import { DataWorkspaceListActiveFiltersBar } from "@/components/data-workspace/DataWorkspaceListActiveFiltersBar"
import { DataWorkspaceListBulkToolbar } from "@/components/data-workspace/DataWorkspaceListBulkToolbar"
import { DataWorkspaceListFilterChip } from "@/components/data-workspace/DataWorkspaceListFilterChip"
import { DataWorkspaceListSearchField } from "@/components/data-workspace/DataWorkspaceListFilterFields"
import {
  DataWorkspaceTableListFiltersBar,
  DataWorkspaceTableListNatureShell,
  DataWorkspaceTableListPage,
  DataWorkspaceTableListPaginationFooter,
  DataWorkspaceTableListShell,
} from "@/components/data-workspace/DataWorkspaceTableListLayout"
import { DataWorkspaceTableEmptyMascot } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { DataWorkspacePeriodFilter } from "@/components/data-workspace/DataWorkspacePeriodFilter"
import { DataWorkspaceViewFilter } from "@/components/data-workspace/DataWorkspaceViewFilter"
import {
  dataWorkspaceListFiltersGridClass,
  dataWorkspaceListFiltersPanelClass,
  dataWorkspaceListFiltersPanelLastClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import withAuth from "@/hoc/withAuth"
import {
  computeDataWorkspaceDateBounds,
  type DataWorkspaceDatePreset,
} from "@/lib/dataWorkspaceDateFilter"
import {
  readSavedOperationsView,
  writeSavedOperationsView,
  type OperationsViewId,
} from "@/lib/operationsViewPreference"
import {
  nextWorkspaceTableSortState,
  workspaceTableSortDisplayDirection,
  type WorkspaceTableSortDirection,
} from "@/lib/workspaceTableSort"
import {
  Receipt,
  ShoppingCart,
  Monitor,
  UtensilsCrossed,
  Wallet,
} from "lucide-react"
import { useParams } from "next/navigation"
import type { DateRange } from "react-day-picker"
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react"

const OPERATIONS_PAGE_SIZES = [10, 25, 50, 100] as const
const DEFAULT_PAGE_SIZE = 25

const VIEW_ITEMS = [
  { id: "sales", label: "Ventas", icon: Receipt },
  { id: "tables", label: "Mesas", icon: UtensilsCrossed },
  { id: "counter", label: "Mostrador", icon: Monitor },
  { id: "purchases", label: "Compras", icon: ShoppingCart },
  { id: "expenses", label: "Gastos", icon: Wallet },
] as const

function OperationsPage() {
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const { bootstrap, loading: bootstrapLoading } = usePopWorkspace()
  const timeZone = usePopTimeZone()

  const [sales, setSales] = useState<OperationSaleRow[]>([])
  const [purchases, setPurchases] = useState<OperationPurchaseRow[]>([])
  const [expenseLedger, setExpenseLedger] = useState<
    OperationExpenseLedgerRow[]
  >([])
  const [listFetching, setListFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const [activeView, setActiveView] = useState<OperationsViewId>("sales")
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [datePreset, setDatePreset] =
    useState<DataWorkspaceDatePreset>("this_month")
  const [customDateRange, setCustomDateRange] = useState<
    DateRange | undefined
  >(undefined)
  const searchInputId = useId()
  const viewFilterLabelId = useId()
  const viewFilterTriggerId = useId()
  const dateFilterLabelId = useId()
  const dateFilterTriggerId = useId()
  const pageSizeLabelId = useId()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const hydratedViewPopRef = useRef<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [sort, setSort] = useState<string | null>(null)
  const [ord, setOrd] = useState<WorkspaceTableSortDirection>("asc")
  const [selected, setSelected] = useState<Set<string>>(() => new Set())

  const dateBounds = useMemo(
    () => computeDataWorkspaceDateBounds(datePreset, customDateRange),
    [datePreset, customDateRange],
  )

  const fetchList = useCallback(async () => {
    if (!popId || !siteId) return
    setListFetching(true)
    try {
      const res = await getOperationsList(popId, {
        view: activeView,
        dateFrom: dateBounds.from,
        dateTo: dateBounds.to,
        search: debouncedSearch,
        page,
        pageSize,
        sort,
        ord,
      })
      if (!res.success) {
        setError(res.error || "Error")
        setSales([])
        setPurchases([])
        setExpenseLedger([])
        setTotalCount(0)
        return
      }
      setSales(res.sales)
      setPurchases(res.purchases)
      setExpenseLedger(res.expenseLedger)
      setTotalCount(res.totalCount)
      if (res.page !== page) setPage(res.page)
      setError(null)
    } catch {
      setError("Error inesperado")
    } finally {
      setListFetching(false)
    }
  }, [
    popId,
    siteId,
    activeView,
    dateBounds.from,
    dateBounds.to,
    debouncedSearch,
    page,
    pageSize,
    sort,
    ord,
  ])

  useEffect(() => {
    if (!popId || !siteId) {
      setListFetching(false)
      setError("Punto de venta no encontrado")
      return
    }
    void fetchList()
  }, [fetchList, popId, siteId])

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
    }, 300)
    return () => window.clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    if (!popId || hydratedViewPopRef.current === popId) return
    hydratedViewPopRef.current = popId
    const saved = readSavedOperationsView(popId)
    if (saved) setActiveView(saved)
  }, [popId])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, activeView, datePreset, customDateRange, sort, ord])

  useEffect(() => {
    setSelected(new Set())
  }, [activeView, page, debouncedSearch, dateBounds.from, dateBounds.to])

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

  const handleViewSelect = useCallback(
    (id: string) => {
      if (
        id !== "sales" &&
        id !== "tables" &&
        id !== "counter" &&
        id !== "purchases" &&
        id !== "expenses"
      ) {
        return
      }
      setActiveView(id)
      if (popId) writeSavedOperationsView(popId, id)
      setSearchInput("")
      setDebouncedSearch("")
      setSort(null)
      setOrd("asc")
      setPage(1)
    },
    [popId],
  )

  const handleSortColumn = useCallback((column: string) => {
    const next = nextWorkspaceTableSortState({ sort, ord }, column)
    setSort(next.sort)
    setOrd(next.ord)
    setPage(1)
  }, [ord, sort])

  const sortDirection = useCallback(
    (column: string) =>
      workspaceTableSortDisplayDirection({ sort, ord }, column),
    [ord, sort],
  )

  const pageSales = sales
  const pagePurchases = purchases
  const pageExpenses = expenseLedger

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
    const noun =
      activeView === "sales"
        ? totalCount === 1
          ? "venta"
          : "ventas"
        : activeView === "tables"
          ? totalCount === 1
            ? "operación de mesa"
            : "operaciones de mesa"
          : activeView === "counter"
            ? totalCount === 1
              ? "operación de mostrador"
              : "operaciones de mostrador"
            : activeView === "purchases"
            ? totalCount === 1
              ? "compra"
              : "compras"
            : totalCount === 1
              ? "gasto"
              : "gastos"
    return `${totalCount.toLocaleString("es-AR")} ${noun}`
  }, [listFetching, totalCount, activeView])

  const searchPlaceholder =
    activeView === "sales"
      ? "Cliente, estado, fecha, total… ( / )"
      : activeView === "tables"
        ? "Cliente, mesa, estado, total… ( / )"
        : activeView === "counter"
          ? "Cliente, estado, total… ( / )"
          : activeView === "purchases"
          ? "Proveedor, tipo, comprobante, total… ( / )"
          : "Categoría, detalle, importe… ( / )"

  const clearSearch = useCallback(() => {
    setSearchInput("")
    searchInputRef.current?.focus()
  }, [])

  const handleExportCsv = useCallback(() => {
    if (selected.size === 0) return
    if (activeView === "sales" || activeView === "tables" || activeView === "counter") {
      exportOperationsCsv(
        activeView,
        pageSales.filter((row) => selected.has(row.id)),
        timeZone,
      )
      return
    }
    if (activeView === "purchases") {
      exportOperationsCsv(
        "purchases",
        pagePurchases.filter((row) => selected.has(row.id)),
      )
      return
    }
    exportOperationsCsv(
      "expenses",
      pageExpenses.filter((row) => selected.has(row.entryId)),
      timeZone,
    )
  }, [activeView, pageSales, pagePurchases, pageExpenses, selected, timeZone])

  const hasSearchChip = searchInput.trim().length > 0

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado.</p>
      </div>
    )
  }

  return (
    <DataWorkspaceTableListPage
      layout={{
        siteId,
        popId,
        popName: bootstrap?.popName ?? "",
        title: "Operaciones",
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
                  <DataWorkspaceViewFilter
                    variant="layout"
                    viewItems={VIEW_ITEMS}
                    activeId={activeView}
                    onSelect={handleViewSelect}
                    labelId={viewFilterLabelId}
                    triggerId={viewFilterTriggerId}
                  />
                </div>

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
                    placeholder={searchPlaceholder}
                    resultsSummary={resultsSummary}
                    inputProps={{
                      "aria-label":
                        activeView === "sales"
                          ? "Buscar ventas"
                          : activeView === "tables"
                            ? "Buscar operaciones de mesa"
                            : activeView === "counter"
                              ? "Buscar operaciones de mostrador"
                              : activeView === "purchases"
                                ? "Buscar compras"
                                : "Buscar gastos",
                    }}
                  />
                </div>
              </div>
        </DataWorkspaceTableListFiltersBar>

          <DataWorkspaceTableListShell
            activeFiltersBar={
              hasSearchChip ? (
                <DataWorkspaceListActiveFiltersBar
                  activeCount={1}
                  onClearAll={clearSearch}
                >
                  <DataWorkspaceListFilterChip
                    label={`Buscar: «${searchInput.trim()}»`}
                    onRemove={clearSearch}
                    removeAriaLabel="Quitar búsqueda"
                  />
                </DataWorkspaceListActiveFiltersBar>
              ) : null
            }
            bulkToolbar={
              selected.size > 0 ? (
                <DataWorkspaceListBulkToolbar
                  selectedCount={selected.size}
                  onClear={() => setSelected(new Set())}
                  placement={hasSearchChip ? "stacked" : "standalone"}
                  disabled={listFetching}
                  actions={[
                    { label: "Exportar CSV", onClick: handleExportCsv },
                  ]}
                />
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
                pageSizeOptions={OPERATIONS_PAGE_SIZES}
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
            {activeView === "sales" || activeView === "tables" || activeView === "counter" ? (
              <OperationsSalesTable
                siteId={siteId}
                popId={popId}
                rows={pageSales}
                listFetching={listFetching}
                totalCount={totalCount}
                skeletonRowCount={skeletonRowCount}
                selected={selected}
                onSelectedChange={setSelected}
                showTableColumn={activeView === "tables"}
                showOrderColumn={activeView === "counter"}
                sortable={activeView === "sales"}
                sortDirection={sortDirection}
                onSortColumn={handleSortColumn}
              />
            ) : activeView === "purchases" ? (
              <OperationsPurchasesTable
                siteId={siteId}
                popId={popId}
                rows={pagePurchases}
                listFetching={listFetching}
                totalCount={totalCount}
                skeletonRowCount={skeletonRowCount}
                selected={selected}
                onSelectedChange={setSelected}
                sortDirection={sortDirection}
                onSortColumn={handleSortColumn}
              />
            ) : (
              <OperationsExpensesTable
                rows={pageExpenses}
                listFetching={listFetching}
                totalCount={totalCount}
                skeletonRowCount={skeletonRowCount}
                selected={selected}
                onSelectedChange={setSelected}
                sortDirection={sortDirection}
                onSortColumn={handleSortColumn}
              />
            )}
          </DataWorkspaceTableListShell>
      </DataWorkspaceTableListNatureShell>
    </DataWorkspaceTableListPage>
  )
}

export default withAuth(OperationsPage)
