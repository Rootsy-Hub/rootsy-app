"use client"

import {
  getOperationsSales,
  type OperationExpenseLedgerRow,
  type OperationPurchaseRow,
  type OperationSaleRow,
} from "@/app/[siteId]/[popId]/operations/actions"
import {
  OperationsSalesTable,
  formatOperationShortId,
} from "@/app/[siteId]/[popId]/operations/OperationsSalesTable"
import { buildPaginationItems } from "@/app/[siteId]/[popId]/layout/layoutPreviewPagination"
import { DataWorkspaceListPaginationFooter } from "@/components/data-workspace/DataWorkspaceListPaginationFooter"
import { DataWorkspaceListTableShell } from "@/components/data-workspace/DataWorkspaceListTableShell"
import { DataWorkspacePeriodFilter } from "@/components/data-workspace/DataWorkspacePeriodFilter"
import { DataWorkspaceToolbarFieldLabel } from "@/components/data-workspace/DataWorkspaceToolbarFieldLabel"
import {
  lightFilterChipClass,
  lightTableThClass,
  lightToolbarClearButtonClass,
  lightToolbarInputClass,
  lightToolbarPanelLastClass,
  lightToolbarShellClass,
  toolbarBlockLabelClass,
  workspaceDataTableClassName,
  workspaceTableBodyRowClassNames,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
import { DataWorkspaceSectionMenu } from "@/components/layouts/DataWorkspaceSectionMenu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import withAuth from "@/hoc/withAuth"
import {
  computeDataWorkspaceDateBounds,
  dataWorkspaceDateFilterSummary,
  isoDateInBounds,
  type DataWorkspaceDatePreset,
} from "@/lib/dataWorkspaceDateFilter"
import { getWorkspaceHeaderForPop } from "@/lib/workspaceHeaderServer"
import { cn } from "@/lib/utils"
import {
  ChevronDown,
  ChevronRight,
  Receipt,
  Search,
  ShoppingCart,
  Wallet,
  X,
} from "lucide-react"
import { useParams } from "next/navigation"
import type { DateRange } from "react-day-picker"
import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react"

const OPERATIONS_PAGE_SIZES = [10, 25, 50, 100] as const
const DEFAULT_PAGE_SIZE = 25

type OperationsViewId = "sales" | "purchases" | "expenses"

const VIEW_ITEMS = [
  { id: "sales", label: "Ventas", icon: Receipt },
  { id: "purchases", label: "Compras", icon: ShoppingCart },
  { id: "expenses", label: "Gastos", icon: Wallet },
] as const

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

function formatDateTime(iso: string) {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d)
}

function formatQty(n: number) {
  const t = Math.round(n * 1e6) / 1e6
  if (Number.isInteger(t)) return String(t)
  return t.toLocaleString("es-AR", { maximumFractionDigits: 6 })
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  completed: "Completada",
  cancelled: "Anulada",
}

const PURCHASE_STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  pending: "Pendiente",
  partial: "Pago parcial",
  paid: "Pagada",
  cancelled: "Cancelada",
  voided: "Anulada",
}

const PURCHASE_KIND_LABEL: Record<string, string> = {
  merchandise: "Mercadería",
  raw_material: "Materia prima",
  supply: "Insumo",
}

function statusLabel(s: string) {
  return STATUS_LABEL[s] ?? s
}

function purchaseStatusLabel(s: string) {
  return PURCHASE_STATUS_LABEL[s] ?? s
}

function purchaseKindLabel(k: string) {
  return PURCHASE_KIND_LABEL[k] ?? k
}

function expenseLedgerKindLabel(row: OperationExpenseLedgerRow) {
  if (row.sourceType === "expense_void") return "Anulación gasto"
  return "Gasto"
}

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

const operationsSk = {
  box: "animate-pulse rounded-sm bg-muted-foreground/10 dark:bg-muted-foreground/[0.12]",
} as const

function OperationsTableFooterSkeleton() {
  return (
    <div
      className="flex min-h-16 w-full items-center justify-center px-4"
      aria-hidden
    >
      <div className={cn("h-11 w-full max-w-md rounded-lg", operationsSk.box)} />
    </div>
  )
}

function OperationsPage() {
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const [popName, setPopName] = useState("")
  const [sales, setSales] = useState<OperationSaleRow[]>([])
  const [purchases, setPurchases] = useState<OperationPurchaseRow[]>([])
  const [expenseLedger, setExpenseLedger] = useState<
    OperationExpenseLedgerRow[]
  >([])
  const [listFetching, setListFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [activeView, setActiveView] = useState<OperationsViewId>("sales")
  const [searchInput, setSearchInput] = useState("")
  const [datePreset, setDatePreset] =
    useState<DataWorkspaceDatePreset>("all")
  const [customDateRange, setCustomDateRange] = useState<
    DateRange | undefined
  >(undefined)
  const searchInputId = useId()
  const dateFilterLabelId = useId()
  const dateFilterTriggerId = useId()
  const pageSizeLabelId = useId()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const [workspaceHeader, setWorkspaceHeader] = useState<{
    userFullName: string
    userImageUrl: string | null
    roleLabel: string
  } | null>(null)

  const load = useCallback(async () => {
    if (!popId || !siteId) return
    const res = await getOperationsSales(popId)
    if (!res.success) {
      setError(res.error || "Error")
      setSales([])
      setPurchases(res.purchases ?? [])
      setExpenseLedger(res.expenseLedger ?? [])
      setPopName(res.popName ?? "")
      return
    }
    setSales(res.sales)
    setPurchases(res.purchases)
    setExpenseLedger(res.expenseLedger)
    setPopName(res.popName)
    setError(null)
  }, [popId, siteId])

  const fetchWorkspaceHeader = useCallback(async () => {
    if (!popId) return
    const head = await getWorkspaceHeaderForPop(popId)
    if (head.success) {
      setWorkspaceHeader({
        userFullName: head.userFullName,
        userImageUrl: head.userImageUrl,
        roleLabel: head.roleLabel,
      })
    } else {
      setWorkspaceHeader(null)
    }
  }, [popId])

  useEffect(() => {
    if (!popId || !siteId) {
      setListFetching(false)
      setError("Punto de venta no encontrado")
      return
    }
    let cancelled = false
    ;(async () => {
      setListFetching(true)
      try {
        await load()
        if (!cancelled) await fetchWorkspaceHeader()
      } catch {
        if (!cancelled) setError("Error inesperado")
      } finally {
        if (!cancelled) setListFetching(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [load, popId, siteId, fetchWorkspaceHeader])

  useEffect(() => {
    setPage(1)
    setExpandedId(null)
  }, [searchInput, activeView, datePreset, customDateRange])

  const dateBounds = useMemo(
    () => computeDataWorkspaceDateBounds(datePreset, customDateRange),
    [datePreset, customDateRange],
  )

  const dateFilterActive = datePreset !== "all"
  const dateFilterSummary = useMemo(
    () => dataWorkspaceDateFilterSummary(datePreset, dateBounds),
    [datePreset, dateBounds],
  )

  const clearDateFilter = useCallback(() => {
    setDatePreset("all")
    setCustomDateRange(undefined)
  }, [])

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

  const handleViewSelect = useCallback((id: string) => {
    if (id !== "sales" && id !== "purchases" && id !== "expenses") return
    setActiveView(id)
    setSearchInput("")
    setPage(1)
    setExpandedId(null)
  }, [])

  const dateFilteredSales = useMemo(() => {
    const { from, to } = dateBounds
    return sales.filter((sale) => isoDateInBounds(sale.soldAt, from, to))
  }, [sales, dateBounds])

  const dateFilteredPurchases = useMemo(() => {
    const { from, to } = dateBounds
    return purchases.filter((row) =>
      isoDateInBounds(row.operationDate, from, to),
    )
  }, [purchases, dateBounds])

  const dateFilteredExpenses = useMemo(() => {
    const { from, to } = dateBounds
    return expenseLedger.filter((row) =>
      isoDateInBounds(row.entryDate, from, to),
    )
  }, [expenseLedger, dateBounds])

  const filteredSales = useMemo(() => {
    const q = searchInput.trim().toLowerCase()
    if (!q) return dateFilteredSales
    return dateFilteredSales.filter((sale) => {
      const haystack = [
        sale.id,
        formatOperationShortId(sale.id),
        sale.customerName ?? "",
        sale.invoiceTypeLabel ?? "",
        sale.arcaInvoice?.tipoLabel ?? "",
        statusLabel(sale.status),
        sale.status,
        formatDateTime(sale.soldAt),
        fmt.format(sale.total),
        fmt.format(sale.discountTotal),
        fmt.format(sale.taxTotal),
        sale.currency,
      ]
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [dateFilteredSales, searchInput])

  const filteredPurchases = useMemo(() => {
    const q = searchInput.trim().toLowerCase()
    if (!q) return dateFilteredPurchases
    return dateFilteredPurchases.filter((row) => {
      const haystack = [
        row.supplierName,
        purchaseStatusLabel(row.status),
        purchaseKindLabel(row.purchaseKind),
        row.documentNumber ?? "",
        formatLedgerDate(row.operationDate),
        fmt.format(row.total),
        fmt.format(row.paidTotal),
      ]
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [dateFilteredPurchases, searchInput])

  const filteredExpenses = useMemo(() => {
    const q = searchInput.trim().toLowerCase()
    if (!q) return dateFilteredExpenses
    return dateFilteredExpenses.filter((row) => {
      const haystack = [
        expenseLedgerKindLabel(row),
        row.methodName ?? "",
        row.description,
        formatLedgerDate(row.entryDate),
        fmt.format(row.amount),
      ]
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [dateFilteredExpenses, searchInput])

  const activeRows =
    activeView === "sales"
      ? filteredSales
      : activeView === "purchases"
        ? filteredPurchases
        : filteredExpenses
  const sourceTotal =
    activeView === "sales"
      ? dateFilteredSales.length
      : activeView === "purchases"
        ? dateFilteredPurchases.length
        : dateFilteredExpenses.length
  const sourceTotalAll =
    activeView === "sales"
      ? sales.length
      : activeView === "purchases"
        ? purchases.length
        : expenseLedger.length
  const totalCount = activeRows.length

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / Math.max(1, pageSize))),
    [totalCount, pageSize],
  )
  const currentPage = Math.min(Math.max(1, page), totalPages)

  const pageSales = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredSales.slice(start, start + pageSize)
  }, [filteredSales, currentPage, pageSize])

  const pagePurchases = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredPurchases.slice(start, start + pageSize)
  }, [filteredPurchases, currentPage, pageSize])

  const pageExpenses = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredExpenses.slice(start, start + pageSize)
  }, [filteredExpenses, currentPage, pageSize])

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

  const resultsSummary = useMemo(() => {
    if (listFetching && totalCount === 0) return "…"
    if (totalCount === 0) return "Sin resultados"
    const noun =
      activeView === "sales"
        ? totalCount === 1
          ? "venta"
          : "ventas"
        : activeView === "purchases"
          ? totalCount === 1
            ? "compra"
            : "compras"
          : totalCount === 1
            ? "movimiento"
            : "movimientos"
    const hasFilters = searchInput.trim() || dateFilterActive
    if (hasFilters && totalCount !== sourceTotalAll) {
      return `${totalCount.toLocaleString("es-AR")} de ${sourceTotalAll.toLocaleString("es-AR")} ${noun}`
    }
    if (searchInput.trim() && totalCount !== sourceTotal) {
      return `${totalCount.toLocaleString("es-AR")} de ${sourceTotal.toLocaleString("es-AR")} ${noun}`
    }
    return `${totalCount.toLocaleString("es-AR")} ${noun}`
  }, [
    listFetching,
    totalCount,
    sourceTotal,
    searchInput,
    activeView,
    dateFilterActive,
    sourceTotalAll,
  ])

  const searchPlaceholder =
    activeView === "sales"
      ? "Cliente, estado, fecha, total… ( / )"
      : activeView === "purchases"
        ? "Proveedor, tipo, comprobante, total… ( / )"
        : "Tipo, medio, detalle, importe… ( / )"

  const clearSearch = useCallback(() => {
    setSearchInput("")
    searchInputRef.current?.focus()
  }, [])

  const clearAllFilters = useCallback(() => {
    setSearchInput("")
    clearDateFilter()
    searchInputRef.current?.focus()
  }, [clearDateFilter])

  const hasSearchChip = searchInput.trim().length > 0
  const hasFilterChips = hasSearchChip || dateFilterActive

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
      popName={popName}
      title="Operaciones"
      headerVariant="dark"
      contentFlush
      sidebarCollapsible={false}
      loading={!popName && listFetching}
      userName={workspaceHeader?.userFullName}
      userAvatarSrc={workspaceHeader?.userImageUrl ?? undefined}
      userRoleLabel={workspaceHeader?.roleLabel ?? "Ventas"}
      mainClassName="min-h-0 overflow-hidden"
      sectionMenu={
        <DataWorkspaceSectionMenu
          headerVariant="dark"
          viewItems={VIEW_ITEMS}
          activeId={activeView}
          onSelect={handleViewSelect}
          viewsSectionLabel="Tipo de operación"
        />
      }
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
              <DataWorkspacePeriodFilter
                className="order-2 w-full min-w-0 md:col-span-1 xl:order-1 xl:col-span-3"
                preset={datePreset}
                customRange={customDateRange}
                onPresetChange={setDatePreset}
                onCustomRangeChange={setCustomDateRange}
                bounds={dateBounds}
                labelId={dateFilterLabelId}
                triggerId={dateFilterTriggerId}
              />

              <div
                className={cn(
                  lightToolbarPanelLastClass,
                  "order-1 min-w-0 md:col-span-2 xl:order-2 xl:col-span-9",
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

            {hasFilterChips ? (
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
                    onClick={clearAllFilters}
                  >
                    Limpiar todo
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {hasSearchChip ? (
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
                  ) : null}
                  {dateFilterActive ? (
                    <Badge variant="secondary" className={lightFilterChipClass}>
                      <span className="truncate">
                        Fecha: {dateFilterSummary}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 shrink-0"
                        onClick={clearDateFilter}
                        aria-label="Quitar filtro de fecha"
                      >
                        <X className="size-3" />
                      </Button>
                    </Badge>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <DataWorkspaceListTableShell
            variant="flush"
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
                  setExpandedId(null)
                }}
                pageSizeLabelId={pageSizeLabelId}
                loadingSlot={<OperationsTableFooterSkeleton />}
              />
            }
          >
            {activeView === "sales" ? (
              <OperationsSalesTable
                siteId={siteId}
                popId={popId}
                rows={pageSales}
                listFetching={listFetching}
                totalCount={totalCount}
                hasActiveFilters={Boolean(searchInput.trim() || dateFilterActive)}
              />
            ) : activeView === "purchases" ? (
              <table
                className={workspaceDataTableClassName}
                aria-busy={listFetching}
              >
                <TableHeader>
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableHead className={cn(lightTableThClass, "w-10")} />
                    <TableHead className={cn(lightTableThClass, "text-left")}>
                      Fecha
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "text-left")}>
                      Estado
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "text-left")}>
                      Tipo
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "text-left")}>
                      Proveedor
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "text-right")}>
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listFetching ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-12 text-center text-muted-foreground"
                      >
                        Cargando compras…
                      </TableCell>
                    </TableRow>
                  ) : totalCount === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-12 text-center text-muted-foreground"
                      >
                        {searchInput.trim() || dateFilterActive
                          ? "No hay compras que coincidan con los filtros."
                          : "No hay compras confirmadas en este punto."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagePurchases.map((purchase, i) => {
                      const open = expandedId === purchase.id
                      return (
                        <Fragment key={purchase.id}>
                          <TableRow
                            className={cn(
                              workspaceTableBodyRowClassNames(i),
                              open && "bg-primary/5",
                            )}
                          >
                            <TableCell className="align-middle px-2 py-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-foreground"
                                aria-expanded={open}
                                aria-label={
                                  open
                                    ? "Ocultar detalle de la compra"
                                    : "Ver detalle de la compra"
                                }
                                onClick={() =>
                                  setExpandedId((id) =>
                                    id === purchase.id ? null : purchase.id,
                                  )
                                }
                              >
                                {open ? (
                                  <ChevronDown className="size-4" />
                                ) : (
                                  <ChevronRight className="size-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="px-3 py-2.5 text-sm tabular-nums text-foreground">
                              {formatLedgerDate(purchase.operationDate)}
                            </TableCell>
                            <TableCell className="px-3 py-2.5">
                              <span
                                className={cn(
                                  "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
                                  purchase.status === "paid"
                                    ? "border-emerald-500/35 bg-emerald-50 text-emerald-900"
                                    : purchase.status === "partial"
                                      ? "border-sky-500/35 bg-sky-50 text-sky-900"
                                      : purchase.status === "pending"
                                        ? "border-amber-500/35 bg-amber-50 text-amber-950"
                                        : purchase.status === "cancelled" ||
                                            purchase.status === "voided"
                                          ? "border-border bg-muted text-muted-foreground"
                                          : "border-border bg-muted text-muted-foreground",
                                )}
                              >
                                {purchaseStatusLabel(purchase.status)}
                              </span>
                            </TableCell>
                            <TableCell className="px-3 py-2.5 text-sm text-foreground">
                              {purchaseKindLabel(purchase.purchaseKind)}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate px-3 py-2.5 text-sm text-foreground">
                              {purchase.supplierName}
                            </TableCell>
                            <TableCell className="px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-primary">
                              {fmt.format(purchase.total)}
                            </TableCell>
                          </TableRow>
                          {open ? (
                            <TableRow className="border-border/50 bg-muted/20 hover:bg-muted/20">
                              <TableCell colSpan={6} className="p-0">
                                <div className="space-y-4 px-4 py-4 sm:px-6">
                                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="rounded-lg border border-border bg-card px-3 py-2">
                                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Comprobante
                                      </p>
                                      <p className="text-sm font-medium text-foreground">
                                        {purchase.documentNumber ?? "—"}
                                      </p>
                                    </div>
                                    <div className="rounded-lg border border-border bg-card px-3 py-2">
                                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Pagado
                                      </p>
                                      <p className="text-sm font-medium tabular-nums text-foreground">
                                        {fmt.format(purchase.paidTotal)}
                                      </p>
                                    </div>
                                    <div className="rounded-lg border border-border bg-card px-3 py-2">
                                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Saldo
                                      </p>
                                      <p className="text-sm font-medium tabular-nums text-foreground">
                                        {fmt.format(
                                          Math.max(
                                            0,
                                            purchase.total - purchase.paidTotal,
                                          ),
                                        )}
                                      </p>
                                    </div>
                                    <div className="rounded-lg border border-border bg-card px-3 py-2">
                                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Moneda
                                      </p>
                                      <p className="text-sm font-medium text-foreground">
                                        {purchase.currency}
                                      </p>
                                    </div>
                                  </div>

                                  {purchase.payments.length > 0 ? (
                                    <div>
                                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Pagos
                                      </p>
                                      <ul className="space-y-1 rounded-lg border border-border bg-muted/50 px-3 py-2">
                                        {purchase.payments.map((p, pi) => (
                                          <li
                                            key={`${purchase.id}-p-${pi}`}
                                            className="flex justify-between gap-3 text-sm text-foreground"
                                          >
                                            <span>
                                              {p.methodName}
                                              {p.paidAt ? (
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                  {formatLedgerDate(p.paidAt)}
                                                </span>
                                              ) : null}
                                            </span>
                                            <span className="tabular-nums">
                                              {fmt.format(p.amount)}
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ) : null}

                                  <div>
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                      Ítems
                                    </p>
                                    <div className="overflow-x-auto rounded-lg border border-border">
                                      <table className="w-full caption-bottom text-sm">
                                        <TableHeader>
                                          <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
                                            <TableHead className="font-semibold text-foreground">
                                              Producto
                                            </TableHead>
                                            <TableHead className="text-right font-semibold text-foreground">
                                              Cant.
                                            </TableHead>
                                            <TableHead className="text-right font-semibold text-foreground">
                                              Costo unit.
                                            </TableHead>
                                            <TableHead className="text-right font-semibold text-foreground">
                                              IVA %
                                            </TableHead>
                                            <TableHead className="text-right font-semibold text-foreground">
                                              Línea
                                            </TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {purchase.lineItems.length === 0 ? (
                                            <TableRow className="border-border">
                                              <TableCell
                                                colSpan={5}
                                                className="text-center text-muted-foreground"
                                              >
                                                Sin líneas en el comprobante.
                                              </TableCell>
                                            </TableRow>
                                          ) : (
                                            purchase.lineItems.map(
                                              (line, li) => (
                                                <TableRow
                                                  key={`${purchase.id}-line-${li}`}
                                                  className="border-border"
                                                >
                                                  <TableCell className="max-w-[220px]">
                                                    <span className="font-medium text-foreground">
                                                      {line.nameSnapshot}
                                                    </span>
                                                  </TableCell>
                                                  <TableCell className="text-right text-sm tabular-nums text-foreground">
                                                    {formatQty(line.quantity)}
                                                  </TableCell>
                                                  <TableCell className="text-right text-sm tabular-nums text-foreground">
                                                    {fmt.format(line.unitCost)}
                                                  </TableCell>
                                                  <TableCell className="text-right text-sm tabular-nums text-foreground">
                                                    {line.iva > 0
                                                      ? `${line.iva}%`
                                                      : "—"}
                                                  </TableCell>
                                                  <TableCell className="text-right text-sm font-medium tabular-nums text-primary">
                                                    {fmt.format(line.lineTotal)}
                                                  </TableCell>
                                                </TableRow>
                                              ),
                                            )
                                          )}
                                        </TableBody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : null}
                        </Fragment>
                      )
                    })
                  )}
                </TableBody>
              </table>
            ) : (
              <table
                className={workspaceDataTableClassName}
                aria-busy={listFetching}
              >
                <TableHeader>
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableHead className={cn(lightTableThClass, "text-left")}>
                      Fecha asiento
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "text-left")}>
                      Tipo
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "text-left")}>
                      Medio
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "text-left")}>
                      Detalle
                    </TableHead>
                    <TableHead className={cn(lightTableThClass, "text-right")}>
                      Importe
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listFetching ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-12 text-center text-muted-foreground"
                      >
                        Cargando gastos…
                      </TableCell>
                    </TableRow>
                  ) : totalCount === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-12 text-center text-muted-foreground"
                      >
                        {searchInput.trim() || dateFilterActive
                          ? "No hay gastos que coincidan con los filtros."
                          : "No hay pagos de gastos contabilizados en este punto."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    pageExpenses.map((row, i) => (
                      <TableRow
                        key={row.entryId}
                        className={workspaceTableBodyRowClassNames(i)}
                      >
                        <TableCell className="px-3 py-2.5 text-sm text-foreground">
                          {formatLedgerDate(row.entryDate)}
                        </TableCell>
                        <TableCell className="px-3 py-2.5 text-sm">
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-xs font-medium",
                              row.sourceType === "expense_void"
                                ? "border-border bg-muted text-muted-foreground"
                                : "border-primary/25 bg-primary/10 text-primary",
                            )}
                          >
                            {expenseLedgerKindLabel(row)}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate px-3 py-2.5 text-sm text-foreground">
                          {row.methodName ?? "—"}
                        </TableCell>
                        <TableCell className="max-w-[280px] px-3 py-2.5 text-sm text-foreground">
                          <span className="line-clamp-2">{row.description}</span>
                        </TableCell>
                        <TableCell
                          className={cn(
                            "px-3 py-2.5 text-right text-sm font-semibold tabular-nums",
                            row.sourceType === "expense_void"
                              ? "text-muted-foreground"
                              : "text-primary",
                          )}
                        >
                          {fmt.format(row.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </table>
            )}
          </DataWorkspaceListTableShell>
        </div>
      </div>
    </DataWorkspaceLayout>
  )
}

export default withAuth(OperationsPage)
