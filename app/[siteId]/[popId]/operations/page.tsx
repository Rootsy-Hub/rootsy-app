"use client"

import {
  getOperationsSales,
  type OperationExpenseLedgerRow,
  type OperationSaleRow,
} from "@/app/[siteId]/[popId]/operations/actions"
import { buildPaginationItems } from "@/app/[siteId]/[popId]/layout/layoutPreviewPagination"
import { DataWorkspaceListPaginationFooter } from "@/components/data-workspace/DataWorkspaceListPaginationFooter"
import { DataWorkspaceListTableShell } from "@/components/data-workspace/DataWorkspaceListTableShell"
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
import { getWorkspaceHeaderForPop } from "@/lib/workspaceHeaderServer"
import { cn } from "@/lib/utils"
import {
  ChevronDown,
  ChevronRight,
  Receipt,
  Search,
  Wallet,
  X,
} from "lucide-react"
import { useParams } from "next/navigation"
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

type OperationsViewId = "sales" | "expenses"

const VIEW_ITEMS = [
  { id: "sales", label: "Ventas", icon: Receipt },
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

function statusLabel(s: string) {
  return STATUS_LABEL[s] ?? s
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
  const [expenseLedger, setExpenseLedger] = useState<
    OperationExpenseLedgerRow[]
  >([])
  const [listFetching, setListFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [activeView, setActiveView] = useState<OperationsViewId>("sales")
  const [searchInput, setSearchInput] = useState("")
  const searchInputId = useId()
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
      setExpenseLedger(res.expenseLedger ?? [])
      setPopName(res.popName ?? "")
      return
    }
    setSales(res.sales)
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
  }, [searchInput, activeView])

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
    if (id !== "sales" && id !== "expenses") return
    setActiveView(id)
    setSearchInput("")
    setPage(1)
    setExpandedId(null)
  }, [])

  const filteredSales = useMemo(() => {
    const q = searchInput.trim().toLowerCase()
    if (!q) return sales
    return sales.filter((sale) => {
      const haystack = [
        sale.customerName ?? "",
        statusLabel(sale.status),
        sale.status,
        formatDateTime(sale.soldAt),
        fmt.format(sale.total),
        sale.currency,
      ]
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [sales, searchInput])

  const filteredExpenses = useMemo(() => {
    const q = searchInput.trim().toLowerCase()
    if (!q) return expenseLedger
    return expenseLedger.filter((row) => {
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
  }, [expenseLedger, searchInput])

  const activeRows = activeView === "sales" ? filteredSales : filteredExpenses
  const sourceTotal =
    activeView === "sales" ? sales.length : expenseLedger.length
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
        : totalCount === 1
          ? "movimiento"
          : "movimientos"
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
  ])

  const searchPlaceholder =
    activeView === "sales"
      ? "Cliente, estado, fecha, total… ( / )"
      : "Tipo, medio, detalle, importe… ( / )"

  const clearSearch = useCallback(() => {
    setSearchInput("")
    searchInputRef.current?.focus()
  }, [])

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
            <div className={cn(lightToolbarPanelLastClass, "w-full")}>
              <div className="mb-2 flex min-w-0 items-baseline justify-between gap-3">
                <label htmlFor={searchInputId} className={toolbarBlockLabelClass}>
                  Buscar
                </label>
                <span
                  className="shrink-0 text-[11px] font-medium text-muted-foreground"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {resultsSummary}
                </span>
              </div>
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
                      Cliente
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
                        colSpan={5}
                        className="py-12 text-center text-muted-foreground"
                      >
                        Cargando ventas…
                      </TableCell>
                    </TableRow>
                  ) : totalCount === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-12 text-center text-muted-foreground"
                      >
                        {searchInput.trim()
                          ? "No hay ventas que coincidan con la búsqueda."
                          : "No hay ventas registradas en este punto."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    pageSales.map((sale, i) => {
                      const open = expandedId === sale.id
                      return (
                        <Fragment key={sale.id}>
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
                                    ? "Ocultar detalle de la venta"
                                    : "Ver detalle de la venta"
                                }
                                onClick={() =>
                                  setExpandedId((id) =>
                                    id === sale.id ? null : sale.id,
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
                              {formatDateTime(sale.soldAt)}
                            </TableCell>
                            <TableCell className="px-3 py-2.5">
                              <span
                                className={cn(
                                  "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
                                  sale.status === "completed"
                                    ? "border-emerald-500/35 bg-emerald-50 text-emerald-900"
                                    : sale.status === "cancelled"
                                      ? "border-border bg-muted text-muted-foreground"
                                      : "border-amber-500/35 bg-amber-50 text-amber-950",
                                )}
                              >
                                {statusLabel(sale.status)}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate px-3 py-2.5 text-sm text-foreground">
                              {sale.customerName ?? "—"}
                            </TableCell>
                            <TableCell className="px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-primary">
                              {fmt.format(sale.total)}
                            </TableCell>
                          </TableRow>
                          {open ? (
                            <TableRow className="border-border/50 bg-muted/20 hover:bg-muted/20">
                              <TableCell colSpan={5} className="p-0">
                                <div className="space-y-4 px-4 py-4 sm:px-6">
                                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="rounded-lg border border-border bg-card px-3 py-2">
                                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Subtotal (neto)
                                      </p>
                                      <p className="text-sm font-medium tabular-nums text-foreground">
                                        {fmt.format(sale.subtotal)}
                                      </p>
                                    </div>
                                    <div className="rounded-lg border border-border bg-card px-3 py-2">
                                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        IVA
                                      </p>
                                      <p className="text-sm font-medium tabular-nums text-foreground">
                                        {fmt.format(sale.taxTotal)}
                                      </p>
                                    </div>
                                    <div className="rounded-lg border border-border bg-card px-3 py-2">
                                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Descuentos
                                      </p>
                                      <p className="text-sm font-medium tabular-nums text-foreground">
                                        {fmt.format(sale.discountTotal)}
                                      </p>
                                    </div>
                                    <div className="rounded-lg border border-border bg-card px-3 py-2">
                                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Moneda
                                      </p>
                                      <p className="text-sm font-medium text-foreground">
                                        {sale.currency}
                                      </p>
                                    </div>
                                  </div>

                                  {sale.payments.length > 0 ? (
                                    <div>
                                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Cobros
                                      </p>
                                      <ul className="space-y-1 rounded-lg border border-border bg-muted/50 px-3 py-2">
                                        {sale.payments.map((p, pi) => (
                                          <li
                                            key={`${sale.id}-p-${pi}`}
                                            className="flex justify-between text-sm text-foreground"
                                          >
                                            <span>{p.methodName}</span>
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
                                              P. unit.
                                            </TableHead>
                                            <TableHead className="text-right font-semibold text-foreground">
                                              IVA %
                                            </TableHead>
                                            <TableHead className="text-right font-semibold text-foreground">
                                              Desc.
                                            </TableHead>
                                            <TableHead className="text-right font-semibold text-foreground">
                                              Línea
                                            </TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {sale.lineItems.length === 0 ? (
                                            <TableRow className="border-border">
                                              <TableCell
                                                colSpan={6}
                                                className="text-center text-muted-foreground"
                                              >
                                                Sin líneas en el comprobante.
                                              </TableCell>
                                            </TableRow>
                                          ) : (
                                            sale.lineItems.map((line, li) => (
                                              <TableRow
                                                key={`${sale.id}-line-${li}`}
                                                className="border-border"
                                              >
                                                <TableCell className="max-w-[220px]">
                                                  <span className="font-medium text-foreground">
                                                    {line.nameSnapshot}
                                                  </span>
                                                  {line.comment ? (
                                                    <span className="mt-0.5 block text-xs text-muted-foreground">
                                                      {line.comment}
                                                    </span>
                                                  ) : null}
                                                </TableCell>
                                                <TableCell className="text-right text-sm tabular-nums text-foreground">
                                                  {formatQty(line.quantity)}
                                                </TableCell>
                                                <TableCell className="text-right text-sm tabular-nums text-foreground">
                                                  {fmt.format(line.unitPrice)}
                                                </TableCell>
                                                <TableCell className="text-right text-sm tabular-nums text-foreground">
                                                  {line.iva > 0
                                                    ? `${line.iva}%`
                                                    : "—"}
                                                </TableCell>
                                                <TableCell className="text-right text-sm tabular-nums text-foreground">
                                                  {fmt.format(line.lineDiscount)}
                                                </TableCell>
                                                <TableCell className="text-right text-sm font-medium tabular-nums text-primary">
                                                  {fmt.format(line.lineTotal)}
                                                </TableCell>
                                              </TableRow>
                                            ))
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
                        {searchInput.trim()
                          ? "No hay gastos que coincidan con la búsqueda."
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
