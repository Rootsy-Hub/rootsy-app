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
import { OperationAccountingModal } from "@/app/[siteId]/[popId]/operations/OperationAccountingModal"
import { buildPaginationItems } from "@/app/[siteId]/[popId]/layout/layoutPreviewPagination"
import { formatLocaleDateTime } from "@/lib/popTimezone"
import { DataWorkspaceListPaginationFooter } from "@/components/data-workspace/DataWorkspaceListPaginationFooter"
import { DataWorkspaceListTableShell } from "@/components/data-workspace/DataWorkspaceListTableShell"
import { DataWorkspaceTableEmptyMascot } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { DataWorkspacePeriodFilter } from "@/components/data-workspace/DataWorkspacePeriodFilter"
import { DataWorkspaceViewFilter } from "@/components/data-workspace/DataWorkspaceViewFilter"
import { DataWorkspaceToolbarFieldLabel } from "@/components/data-workspace/DataWorkspaceToolbarFieldLabel"
import {
  lightFilterChipClass,
  lightToolbarClearButtonClass,
  lightToolbarInputClass,
  lightToolbarPanelLastClass,
  lightToolbarShellClass,
  listBulkToolbarClearButtonClass,
  toolbarBlockLabelClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { cn } from "@/lib/utils"
import {
  Receipt,
  Search,
  ShoppingCart,
  Monitor,
  UtensilsCrossed,
  Wallet,
  X,
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

function formatLedgerDate(d: string) {
  if (!d || d.length < 10) return "—"
  const y = Number(d.slice(0, 4))
  const m = Number(d.slice(5, 7))
  const day = Number(d.slice(8, 10))
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(day)) {
    return "—"
  }
  return new Date(y, m - 1, day).toLocaleDateString("es-AR")
}

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
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const [accountingTarget, setAccountingTarget] = useState<{
    view: OperationsViewId
    operationId: string
    groupedSaleIds?: string[]
    subtitle: string
  } | null>(null)

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
  }, [debouncedSearch, activeView, datePreset, customDateRange])

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
      setPage(1)
    },
    [popId],
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

  const openSaleAccounting = useCallback(
    (sale: OperationSaleRow, view: OperationsViewId = "sales") => {
      const when = sale.soldAt ? formatLocaleDateTime(sale.soldAt) : "—"
      setAccountingTarget({
        view,
        operationId: sale.id,
        groupedSaleIds: sale.groupedSaleIds,
        subtitle: `${sale.customerName ?? "Consumidor final"} · ${when}`,
      })
    },
    [],
  )

  const openPurchaseAccounting = useCallback((purchase: OperationPurchaseRow) => {
    setAccountingTarget({
      view: "purchases",
      operationId: purchase.id,
      subtitle: `${purchase.supplierName} · ${formatLedgerDate(purchase.operationDate)}`,
    })
  }, [])

  const openExpenseAccounting = useCallback(
    (row: OperationExpenseLedgerRow) => {
      const voidSuffix =
        row.sourceType === "expense_void" ? " · Anulación" : ""
      setAccountingTarget({
        view: "expenses",
        operationId: row.entryId,
        subtitle: `${row.categoryName}${voidSuffix} · ${formatLedgerDate(row.operationDate)}`,
      })
    },
    [],
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
    <DataWorkspaceLayout
      siteId={siteId}
      popId={popId}
      popName={bootstrap?.popName ?? ""}
      title="Operaciones"
      headerVariant="dark"
      contentFlush
      sidebarCollapsible={false}
      loading={bootstrapLoading || listFetching}
      userName={bootstrap?.userFullName}
      userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
      mainClassName="min-h-0 overflow-hidden"
    >
      <div className="relative flex min-h-0 w-full flex-1 flex-col">
        {error ? (
          <div
            role="alert"
            className="relative shrink-0 border-b border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        ) : null}

        <div className="relative flex min-h-0 flex-1 flex-col">
          <div
            className={lightToolbarShellClass}
            role="toolbar"
            aria-label="Filtros del listado"
          >
            <div className="grid grid-cols-1 items-start md:grid-cols-2 xl:grid-cols-12">
              <DataWorkspaceViewFilter
                className="order-1 w-full min-w-0 md:col-span-1 xl:col-span-3"
                viewItems={VIEW_ITEMS}
                activeId={activeView}
                onSelect={handleViewSelect}
                labelId={viewFilterLabelId}
                triggerId={viewFilterTriggerId}
              />

              <DataWorkspacePeriodFilter
                className="order-2 w-full min-w-0 md:col-span-1 xl:order-2 xl:col-span-3"
                preset={datePreset}
                customRange={customDateRange}
                onPresetChange={setDatePreset}
                onCustomRangeChange={setCustomDateRange}
                bounds={dateBounds}
                showActiveState={false}
                labelId={dateFilterLabelId}
                triggerId={dateFilterTriggerId}
              />

              <div
                className={cn(
                  lightToolbarPanelLastClass,
                  "order-3 min-w-0 md:col-span-2 xl:order-3 xl:col-span-6",
                )}
              >
                <DataWorkspaceToolbarFieldLabel
                  htmlFor={searchInputId}
                  label="Buscar"
                  meta={
                    <span aria-live="polite" aria-atomic="true">
                      {resultsSummary}
                    </span>
                  }
                />
                <div className="relative min-w-0">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    ref={searchInputRef}
                    id={searchInputId}
                    type="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={searchPlaceholder}
                    className={cn(
                      lightToolbarInputClass,
                      searchInput.trim().length > 0 && "pr-10",
                    )}
                    autoComplete="off"
                    spellCheck={false}
                    aria-label={
                      activeView === "sales"
                        ? "Buscar ventas"
                        : activeView === "tables"
                          ? "Buscar operaciones de mesa"
                          : activeView === "counter"
                            ? "Buscar operaciones de mostrador"
                            : activeView === "purchases"
                            ? "Buscar compras"
                            : "Buscar gastos"
                    }
                  />
                  {searchInput.trim().length > 0 ? (
                    <button
                      type="button"
                      aria-label="Limpiar búsqueda"
                      className={lightToolbarClearButtonClass}
                      onClick={clearSearch}
                    >
                      <X className="size-3.5" aria-hidden />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {hasSearchChip ? (
              <div
                className="border-t border-border/80 bg-card px-4 py-3"
                role="region"
                aria-label="Filtros activos"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className={toolbarBlockLabelClass}>Filtros activos</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                    onClick={clearSearch}
                  >
                    Limpiar todo
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary" className={lightFilterChipClass}>
                    <span className="truncate">
                      Buscar: «{searchInput.trim()}»
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-6 shrink-0"
                      onClick={clearSearch}
                      aria-label="Quitar búsqueda"
                    >
                      <X className="size-3" />
                    </Button>
                  </Badge>
                </div>
              </div>
            ) : null}
          </div>

          <DataWorkspaceListTableShell
            variant="flush"
            bulkToolbar={
              selected.size > 0 ? (
                <div
                  className={cn(
                    "flex flex-wrap items-center gap-2 border-b border-border/80 bg-muted/35 px-3 py-2.5 sm:px-4",
                    listFetching && "pointer-events-none opacity-60",
                  )}
                  role="region"
                  aria-label="Acciones sobre selección"
                >
                  <span className="text-sm text-foreground">
                    <span className="font-semibold">{selected.size}</span>{" "}
                    <span className="text-muted-foreground">seleccionados</span>
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={handleExportCsv}
                    >
                      Exportar CSV
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className={listBulkToolbarClearButtonClass}
                      onClick={() => setSelected(new Set())}
                    >
                      Limpiar
                    </Button>
                  </div>
                </div>
              ) : null
            }
            overlay={
              !listFetching && totalCount === 0 ? (
                <DataWorkspaceTableEmptyMascot />
              ) : null
            }
            footer={
              <DataWorkspaceListPaginationFooter
                variant="dark"
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
                onOpenAccounting={(sale) =>
                  openSaleAccounting(
                    sale,
                    activeView === "tables"
                      ? "tables"
                      : activeView === "counter"
                        ? "counter"
                        : "sales",
                  )
                }
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
                onOpenAccounting={openPurchaseAccounting}
              />
            ) : (
              <OperationsExpensesTable
                rows={pageExpenses}
                listFetching={listFetching}
                totalCount={totalCount}
                skeletonRowCount={skeletonRowCount}
                selected={selected}
                onSelectedChange={setSelected}
                onOpenAccounting={openExpenseAccounting}
              />
            )}
          </DataWorkspaceListTableShell>
        </div>
      </div>

      <OperationAccountingModal
        popId={popId}
        view={accountingTarget?.view ?? "sales"}
        operationId={accountingTarget?.operationId ?? null}
        groupedSaleIds={accountingTarget?.groupedSaleIds}
        subtitle={accountingTarget?.subtitle}
        open={accountingTarget != null}
        onOpenChange={(open) => {
          if (!open) setAccountingTarget(null)
        }}
      />
    </DataWorkspaceLayout>
  )
}

export default withAuth(OperationsPage)
