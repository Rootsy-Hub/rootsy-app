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
import {
  mergeOperationsWorkspaceUrl,
  operationsCustomDateRange,
  parseOperationsWorkspaceUrl,
} from "@/app/[siteId]/[popId]/operations/workspaceUrl"
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
  tableListInfiniteFromQuery,
  DataWorkspaceTableListShell,
} from "@/components/data-workspace/DataWorkspaceTableListLayout"
import { DataWorkspaceTableListPageDock } from "@/components/data-workspace/DataWorkspaceTableInfinitePageDock"
import { DataWorkspaceTableEmptyMascot } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { DataWorkspacePeriodFilter } from "@/components/data-workspace/DataWorkspacePeriodFilter"
import { DataWorkspaceViewFilter } from "@/components/data-workspace/DataWorkspaceViewFilter"
import { DATA_WORKSPACE_TABLE_SKELETON_ROW_COUNT } from "@/components/data-workspace/WorkspaceTableSkeleton"
import {
  dataWorkspaceListFiltersGridFourClass,
  dataWorkspaceListFiltersPanelClass,
  dataWorkspaceListFiltersPanelLastClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { useAfterHydration } from "@/hooks/useIsHydrated"
import { usePopMenuCache } from "@/hooks/usePopMenuCache"
import { usePopOperationsList } from "@/hooks/usePopOperationsList"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { hasPopAccessPermission } from "@/lib/popAccessPermissions"
import { POP_PERMS } from "@/lib/popPermissionConstants"
import {
  computeDataWorkspaceDateBounds,
  toISODateLocal,
} from "@/lib/dataWorkspaceDateFilter"
import {
  readSavedOperationsView,
  writeSavedOperationsView,
} from "@/lib/operationsViewPreference"
import {
  nextWorkspaceTableSortState,
  workspaceTableSortDisplayDirection,
} from "@/lib/workspaceTableSort"
import {
  Briefcase,
  Receipt,
  ShoppingCart,
  Monitor,
  UtensilsCrossed,
  Wallet,
} from "lucide-react"
import { useParams, usePathname, useSearchParams } from "@/lib/pop-spa/navigation"
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react"

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
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const { bootstrap, loading: bootstrapLoading, hasPermission } =
    usePopWorkspace()
  const afterHydration = useAfterHydration()
  const menuCache = usePopMenuCache(popId ?? "")
  const timeZone = usePopTimeZone()

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
    () => parseOperationsWorkspaceUrl(workspaceParams),
    [workspaceParams],
  )

  const pushWs = useCallback(
    (patch: Parameters<typeof mergeOperationsWorkspaceUrl>[1]) => {
      const next = mergeOperationsWorkspaceUrl(workspaceParams, patch)
      const qs = next.toString()
      const href = qs ? `${pathname}?${qs}` : pathname
      if (typeof window !== "undefined") {
        const current = `${window.location.pathname}${window.location.search}`
        if (current !== href) {
          window.history.replaceState(window.history.state, "", href)
        }
      }
      setWorkspaceSearch(qs)
    },
    [pathname, workspaceParams],
  )

  const activeView = ws.view
  const page = ws.page
  const pageSize = ws.pageSize
  const sort = ws.sort
  const ord = ws.ord
  const datePreset = ws.datePreset
  const appliedFilters = ws.filters
  const customDateRange = useMemo(
    () => operationsCustomDateRange(ws),
    [ws],
  )

  const [searchInput, setSearchInput] = useState(ws.q)
  const searchInputId = useId()
  const viewFilterLabelId = useId()
  const viewFilterTriggerId = useId()
  const dateFilterLabelId = useId()
  const dateFilterTriggerId = useId()
  const filtersButtonId = useId()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const hydratedViewPopRef = useRef<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const [draftFilters, setDraftFilters] = useState<OperationsModalFilters>(
    defaultOperationsModalFilters,
  )
  const [filtersModalOpen, setFiltersModalOpen] = useState(false)

  const checkPerm = useCallback(
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
  const canRead = checkPerm(POP_PERMS.OPERATIONS_READ)

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
      search: ws.q,
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
      ws.q,
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
      : afterHydration && !menuCache.isLoading && !canRead
        ? "No tenés permiso para ver operaciones en este punto."
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
    if (res.page !== page) pushWs({ page: res.page })
  }, [operationsQuery.data, page, pushWs])

  useEffect(() => {
    setSearchInput(ws.q)
  }, [ws.q])

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (searchInput.trim() === ws.q.trim()) return
      pushWs({ q: searchInput })
    }, 300)
    return () => window.clearTimeout(t)
  }, [pushWs, searchInput, ws.q])

  useEffect(() => {
    if (!popId || hydratedViewPopRef.current === popId) return
    hydratedViewPopRef.current = popId
    if (workspaceParams.get("view")) return
    const saved = readSavedOperationsView(popId)
    if (saved && saved !== "sales") pushWs({ view: saved })
  }, [popId, pushWs, workspaceParams])

  useEffect(() => {
    setSelected(new Set())
  }, [activeView, page, ws.q, dateBounds.from, dateBounds.to, filtersKey])

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
      if (popId) writeSavedOperationsView(popId, id)
      const empty = defaultOperationsModalFilters()
      setSearchInput("")
      setDraftFilters(empty)
      setFiltersModalOpen(false)
      pushWs({
        view: id,
        q: "",
        filters: empty,
        sort: null,
        ord: "asc",
        page: 1,
      })
    },
    [popId, pushWs],
  )

  const handleSortColumn = useCallback(
    (column: string) => {
      const next = nextWorkspaceTableSortState({ sort, ord }, column)
      pushWs({ sort: next.sort, ord: next.ord, page: 1 })
    },
    [ord, pushWs, sort],
  )

  const sortDirection = useCallback(
    (column: string) =>
      workspaceTableSortDisplayDirection({ sort, ord }, column),
    [ord, sort],
  )

  const pageSales = sales
  const pagePurchases = purchases
  const pageExpenses = expenseLedger
  const pageServices = serviceCharges
  const skeletonRowCount = DATA_WORKSPACE_TABLE_SKELETON_ROW_COUNT

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
    pushWs({ q: "" })
    searchInputRef.current?.focus()
  }, [pushWs])

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
    setDraftFilters(empty)
    pushWs({ filters: empty })
  }, [pushWs])

  const clearAllFilters = useCallback(() => {
    clearSearch()
    clearAppliedFilters()
  }, [clearSearch, clearAppliedFilters])

  const removeFilterChip = useCallback(
    (id: string) => {
      const next = { ...appliedFilters }
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
      pushWs({ filters: next })
    },
    [appliedFilters, pushWs],
  )

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
                    onPresetChange={(preset) => {
                      pushWs({
                        datePreset: preset,
                        customFrom: null,
                        customTo: null,
                      })
                    }}
                    onCustomRangeChange={(range) => {
                      if (range?.from && range.to) {
                        pushWs({
                          datePreset: "custom",
                          customFrom: toISODateLocal(range.from),
                          customTo: toISODateLocal(range.to),
                        })
                        return
                      }
                      pushWs({
                        datePreset: "custom",
                        customFrom: range?.from
                          ? toISODateLocal(range.from)
                          : null,
                        customTo: range?.to ? toISODateLocal(range.to) : null,
                      })
                    }}
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
            lockScroll={listFetching}
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
            footerFloating
            footerFloatingCentered
            scrollResetKey={`${activeView}:${page}`}
            footer={
              <DataWorkspaceTableListPageDock
                listFetching={listFetching}
                loadedCount={
                  activeView === "purchases"
                    ? purchases.length
                    : activeView === "services"
                      ? serviceCharges.length
                      : activeView === "expenses"
                        ? expenseLedger.length
                        : sales.length
                }
                totalCount={totalCount}
                page={page}
                onPageJump={(nextPage) => pushWs({ page: nextPage })}
              />
            }
            infinite={tableListInfiniteFromQuery(operationsQuery, "operations")}
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
          pushWs({ filters: draftFilters, page: 1 })
          setFiltersModalOpen(false)
        }}
      />
    </DataWorkspaceTableListPage>
  )
}

