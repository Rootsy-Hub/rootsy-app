"use client"

import {
  OperationsSalesTable,
} from "@/app/[siteId]/[popId]/operations/OperationsSalesTable"
import { OperationsExpensesTable } from "@/app/[siteId]/[popId]/operations/OperationsExpensesTable"
import { OperationsPurchasesTable } from "@/app/[siteId]/[popId]/operations/OperationsPurchasesTable"
import { OperationsServicesTable } from "@/app/[siteId]/[popId]/operations/OperationsServicesTable"
import { OperationsFiltersDialog } from "@/app/[siteId]/[popId]/operations/OperationsFiltersDialog"
import { exportOperationsCsv } from "@/app/[siteId]/[popId]/operations/operationsCsvExport"
import {
  defaultOperationsModalFilters,
  operationsFilterChips,
  operationsFiltersPlaceholder,
  operationsFiltersQueryKey,
  operationsListFiltersFromModal,
  operationsModalFiltersActiveCount,
  type OperationsModalFilters,
} from "@/app/[siteId]/[popId]/operations/operationsFilters"
import { buildPaginationItems } from "@/components/data-workspace/buildPaginationItems"
import { DataWorkspaceListActiveFiltersBar } from "@/components/data-workspace/DataWorkspaceListActiveFiltersBar"
import { DataWorkspaceListBulkToolbar } from "@/components/data-workspace/DataWorkspaceListBulkToolbar"
import { DataWorkspaceListFilterChip } from "@/components/data-workspace/DataWorkspaceListFilterChip"
import {
  DataWorkspaceListFiltersDialogTrigger,
  DataWorkspaceListSearchField,
} from "@/components/data-workspace/DataWorkspaceListFilterFields"
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
  dataWorkspaceListFiltersGridFourClass,
  dataWorkspaceListFiltersPanelClass,
  dataWorkspaceListFiltersPanelLastClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { usePopOperationsList } from "@/hooks/usePopOperationsList"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
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
  Briefcase,
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
  { id: "services", label: "Servicios", icon: Briefcase },
] as const

export function OperationsWorkspaceView() {
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const { bootstrap, loading: bootstrapLoading } = usePopWorkspace()
  const timeZone = usePopTimeZone()

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
  const filtersButtonId = useId()
  const pageSizeLabelId = useId()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const hydratedViewPopRef = useRef<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [sort, setSort] = useState<string | null>(null)
  const [ord, setOrd] = useState<WorkspaceTableSortDirection>("asc")
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const [appliedFilters, setAppliedFilters] = useState<OperationsModalFilters>(
    defaultOperationsModalFilters,
  )
  const [draftFilters, setDraftFilters] = useState<OperationsModalFilters>(
    defaultOperationsModalFilters,
  )
  const [filtersModalOpen, setFiltersModalOpen] = useState(false)

  const dateBounds = useMemo(
    () => computeDataWorkspaceDateBounds(datePreset, customDateRange),
    [datePreset, customDateRange],
  )

  const listFilters = useMemo(
    () => operationsListFiltersFromModal(activeView, appliedFilters),
    [activeView, appliedFilters],
  )
  const filtersKey = useMemo(
    () => operationsFiltersQueryKey(activeView, appliedFilters),
    [activeView, appliedFilters],
  )
  const fiscalOnly =
    activeView === "purchases" && appliedFilters.purchaseFiscalOnly

  const operationsListParams = useMemo(
    () => ({
      view: activeView,
      dateFrom: dateBounds.from,
      dateTo: dateBounds.to,
      search: debouncedSearch,
      page,
      pageSize,
      sort,
      ord,
      filtersKey,
      fiscalOnly,
      filters: listFilters,
    }),
    [
      activeView,
      dateBounds.from,
      dateBounds.to,
      debouncedSearch,
      page,
      pageSize,
      sort,
      ord,
      filtersKey,
      fiscalOnly,
      listFilters,
    ],
  )

  const operationsQuery = usePopOperationsList(popId, operationsListParams, {
    enabled: Boolean(popId && siteId),
  })

  const sales = operationsQuery.data?.sales ?? []
  const purchases = operationsQuery.data?.purchases ?? []
  const expenseLedger = operationsQuery.data?.expenseLedger ?? []
  const serviceCharges = operationsQuery.data?.serviceCharges ?? []
  const totalCount = operationsQuery.data?.totalCount ?? 0
  const listFetching =
    !popId || !siteId
      ? false
      : operationsQuery.isPending ||
        (operationsQuery.isFetching && !operationsQuery.isFetched)
  const error =
    !popId || !siteId
      ? "Punto de venta no encontrado"
      : operationsQuery.data?.success === false
        ? operationsQuery.data.error || "Error"
        : operationsQuery.error instanceof Error
          ? operationsQuery.error.message
          : operationsQuery.error
            ? String(operationsQuery.error)
            : null

  useEffect(() => {
    const res = operationsQuery.data
    if (!res?.success) return
    if (res.page !== page) setPage(res.page)
  }, [operationsQuery.data, page])

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
  }, [
    debouncedSearch,
    activeView,
    datePreset,
    customDateRange,
    sort,
    ord,
    filtersKey,
  ])

  useEffect(() => {
    setSelected(new Set())
  }, [
    activeView,
    page,
    debouncedSearch,
    dateBounds.from,
    dateBounds.to,
    filtersKey,
  ])

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
        id !== "expenses" &&
        id !== "services"
      ) {
        return
      }
      setActiveView(id)
      if (popId) writeSavedOperationsView(popId, id)
      setSearchInput("")
      setDebouncedSearch("")
      setAppliedFilters(defaultOperationsModalFilters())
      setDraftFilters(defaultOperationsModalFilters())
      setFiltersModalOpen(false)
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
  const pageServices = serviceCharges

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
            : activeView === "services"
              ? totalCount === 1
                ? "servicio"
                : "servicios"
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
          : activeView === "services"
            ? "Cliente, servicio, vencido, estado… ( / )"
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
    if (activeView === "services") {
      exportOperationsCsv(
        "services",
        pageServices.filter((row) => selected.has(row.id)),
      )
      return
    }
    exportOperationsCsv(
      "expenses",
      pageExpenses.filter((row) => selected.has(row.entryId)),
      timeZone,
    )
  }, [
    activeView,
    pageSales,
    pagePurchases,
    pageExpenses,
    pageServices,
    selected,
    timeZone,
  ])

  const modalFiltersActiveCount = operationsModalFiltersActiveCount(
    activeView,
    appliedFilters,
  )
  const filterChips = operationsFilterChips(activeView, appliedFilters)
  const hasSearchChip = searchInput.trim().length > 0
  const activeFilterCount = (hasSearchChip ? 1 : 0) + filterChips.length
  const hasFilterChips = activeFilterCount > 0

  const clearAppliedFilters = useCallback(() => {
    const empty = defaultOperationsModalFilters()
    setAppliedFilters(empty)
    setDraftFilters(empty)
  }, [])

  const clearAllFilters = useCallback(() => {
    clearSearch()
    clearAppliedFilters()
  }, [clearSearch, clearAppliedFilters])

  const removeFilterChip = useCallback((id: string) => {
    setAppliedFilters((current) => {
      const next = { ...current }
      if (id === "saleStatus") next.saleStatus = ""
      if (id === "saleWithDiscount") next.saleWithDiscount = false
      if (id === "tableSession") next.tableSession = ""
      if (id === "counterStatus") next.counterStatus = ""
      if (id === "counterFulfillment") next.counterFulfillment = ""
      if (id === "purchaseKind") next.purchaseKind = ""
      if (id === "purchaseFiscalOnly") next.purchaseFiscalOnly = false
      if (id === "expenseSource") next.expenseSource = ""
      if (id === "serviceStatus") next.serviceStatus = ""
      if (id === "serviceScope") next.serviceScope = ""
      return next
    })
  }, [])

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
        loading: bootstrapLoading,
        userName: bootstrap?.userFullName,
        userAvatarSrc: bootstrap?.userImageUrl ?? undefined,
      }}
      error={error}
    >
      <DataWorkspaceTableListNatureShell>
        <DataWorkspaceTableListFiltersBar>
              <div className={dataWorkspaceListFiltersGridFourClass}>
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

                <div className={dataWorkspaceListFiltersPanelClass}>
                  <DataWorkspaceListFiltersDialogTrigger
                    id={filtersButtonId}
                    placeholder={operationsFiltersPlaceholder(activeView)}
                    activeCount={modalFiltersActiveCount}
                    expanded={filtersModalOpen}
                    onClick={() => {
                      setDraftFilters(appliedFilters)
                      setFiltersModalOpen(true)
                    }}
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
                                : activeView === "services"
                                  ? "Buscar servicios"
                                  : "Buscar gastos",
                    }}
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
                  {hasSearchChip ? (
                    <DataWorkspaceListFilterChip
                      label={`Buscar: «${searchInput.trim()}»`}
                      onRemove={clearSearch}
                      removeAriaLabel="Quitar búsqueda"
                    />
                  ) : null}
                  {filterChips.map((chip) => (
                    <DataWorkspaceListFilterChip
                      key={chip.id}
                      label={chip.label}
                      onRemove={() => removeFilterChip(chip.id)}
                      removeAriaLabel={chip.removeAriaLabel}
                    />
                  ))}
                </DataWorkspaceListActiveFiltersBar>
              ) : null
            }
            bulkToolbar={
              selected.size > 0 ? (
                <DataWorkspaceListBulkToolbar
                  selectedCount={selected.size}
                  onClear={() => setSelected(new Set())}
                  placement={hasFilterChips ? "stacked" : "standalone"}
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
            ) : activeView === "services" ? (
              <OperationsServicesTable
                siteId={siteId}
                popId={popId}
                rows={pageServices}
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
      <OperationsFiltersDialog
        open={filtersModalOpen}
        onOpenChange={setFiltersModalOpen}
        view={activeView}
        draft={draftFilters}
        onDraftChange={setDraftFilters}
        onApply={() => {
          setAppliedFilters(draftFilters)
          setFiltersModalOpen(false)
          setPage(1)
        }}
      />
    </DataWorkspaceTableListPage>
  )
}

