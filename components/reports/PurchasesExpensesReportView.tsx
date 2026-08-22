"use client"

import type {
  OperationExpenseLedgerRow,
  OperationPurchaseRow,
} from "@/app/[siteId]/[popId]/operations/actions"
import { fetchPopOperationsList } from "@/lib/rootsyApi/operationsClient"
import { ReportStatValue } from "@/components/reports/ReportStatValue"
import { ReportDetailHeaderCard } from "@/components/reports/ReportDetailHeaderCard"
import { ReportTableScrollArea } from "@/components/reports/ReportTableScrollArea"
import { PurchasesReportTable } from "@/components/reports/PurchasesReportTable"
import { ExpensesReportTable } from "@/components/reports/ExpensesReportTable"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import {
  dataWorkspaceDetailEmptyStateDescriptionClass,
  dataWorkspaceDetailFlushBottomCardClass,
  dataWorkspaceEntityCardStatLabelClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { formatReportMoneyAr, formatReportPeriodSummary } from "@/lib/reportFormatters"
import { exportPurchasesReportCsv, exportExpensesReportCsv } from "@/lib/purchasesExpensesReportCsvExport"
import {
  exportExpensesReportPdf,
  exportPurchasesReportPdf,
  printExpensesReportPdf,
  printPurchasesReportPdf,
} from "@/lib/purchasesExpensesReportPdfExport"
import {
  sumExpensesReportAmount,
  sumPurchasesReportPaid,
} from "@/lib/purchasesExpensesReportExportData"
import type { DataWorkspaceDatePreset } from "@/lib/dataWorkspaceDateFilter"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { cn } from "@/lib/utils"
import { Wallet } from "lucide-react"
import { ReportExportActionButtons } from "@/components/reports/ReportExportActionButtons"
import type { SalesReportExportFormat } from "@/components/reports/SalesReportDownloadMenu"
import { RootsFormSegmentField } from "@/components/rootsy-form"
import { RootsSpinner } from "@/components/rootsy-spinner"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type { DateRange } from "react-day-picker"
import "@/components/layouts-tables/rootsLayoutsTablesScope.css"

const PAGE_SIZE = 50

type ReportTab = "purchases" | "expenses"

const REPORT_TAB_OPTIONS = [
  { value: "purchases" as const, label: "Compras" },
  { value: "expenses" as const, label: "Gastos" },
]

type Props = {
  popId: string
  from: string | null
  to: string | null
  preset: DataWorkspaceDatePreset
  customRange: DateRange | undefined
  bounds: { from: string | null; to: string | null }
  onPresetChange: (preset: DataWorkspaceDatePreset) => void
  onCustomRangeChange: (range: DateRange | undefined) => void
  onBack: () => void
}

async function fetchPurchasesPeriodTotal(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<{ count: number; total: number } | { error: string }> {
  let page = 1
  let total = 0
  let count = 0

  while (page <= 50) {
    const res = await fetchPopOperationsList(popId, {
      view: "purchases",
      dateFrom: from,
      dateTo: to,
      search: "",
      page,
      pageSize: 100,
      sort: "created_at",
      ord: "desc",
    })
    if (!res.success) {
      return { error: res.error || "Error al cargar compras" }
    }
    count = res.totalCount
    total += sumPurchasesReportPaid(res.purchases)
    if (page * 100 >= res.totalCount) break
    page += 1
  }

  return { count, total }
}

async function fetchExpensesPeriodTotal(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<{ count: number; total: number } | { error: string }> {
  let page = 1
  let total = 0
  let count = 0

  while (page <= 50) {
    const res = await fetchPopOperationsList(popId, {
      view: "expenses",
      dateFrom: from,
      dateTo: to,
      search: "",
      page,
      pageSize: 100,
      sort: "entry_date",
      ord: "desc",
    })
    if (!res.success) {
      return { error: res.error || "Error al cargar gastos" }
    }
    count = res.totalCount
    total += sumExpensesReportAmount(res.expenseLedger)
    if (page * 100 >= res.totalCount) break
    page += 1
  }

  return { count, total }
}

async function fetchAllPurchasesReportRows(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<{ rows: OperationPurchaseRow[] } | { error: string }> {
  const rows: OperationPurchaseRow[] = []
  let page = 1

  while (page <= 100) {
    const res = await fetchPopOperationsList(popId, {
      view: "purchases",
      dateFrom: from,
      dateTo: to,
      search: "",
      page,
      pageSize: 100,
      sort: "created_at",
      ord: "desc",
    })
    if (!res.success) {
      return { error: res.error || "Error al cargar compras" }
    }
    rows.push(...res.purchases)
    if (page * 100 >= res.totalCount) break
    page += 1
  }

  return { rows }
}

async function fetchAllExpensesReportRows(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<{ rows: OperationExpenseLedgerRow[] } | { error: string }> {
  const rows: OperationExpenseLedgerRow[] = []
  let page = 1

  while (page <= 100) {
    const res = await fetchPopOperationsList(popId, {
      view: "expenses",
      dateFrom: from,
      dateTo: to,
      search: "",
      page,
      pageSize: 100,
      sort: "entry_date",
      ord: "desc",
    })
    if (!res.success) {
      return { error: res.error || "Error al cargar gastos" }
    }
    rows.push(...res.expenseLedger)
    if (page * 100 >= res.totalCount) break
    page += 1
  }

  return { rows }
}

export function PurchasesExpensesReportView({
  popId,
  from,
  to,
  preset,
  customRange,
  bounds,
  onPresetChange,
  onCustomRangeChange,
  onBack,
}: Props) {
  const timeZone = usePopTimeZone()
  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const [activeTab, setActiveTab] = useState<ReportTab>("purchases")

  const [purchaseRows, setPurchaseRows] = useState<OperationPurchaseRow[]>([])
  const [purchaseCount, setPurchaseCount] = useState(0)
  const [purchasePage, setPurchasePage] = useState(1)
  const [purchaseHasMore, setPurchaseHasMore] = useState(true)
  const [purchaseLoading, setPurchaseLoading] = useState(true)
  const [purchaseLoadingMore, setPurchaseLoadingMore] = useState(false)
  const [purchaseListError, setPurchaseListError] = useState<string | null>(null)

  const [expenseRows, setExpenseRows] = useState<OperationExpenseLedgerRow[]>([])
  const [expenseCount, setExpenseCount] = useState(0)
  const [expensePage, setExpensePage] = useState(1)
  const [expenseHasMore, setExpenseHasMore] = useState(true)
  const [expenseLoading, setExpenseLoading] = useState(true)
  const [expenseLoadingMore, setExpenseLoadingMore] = useState(false)
  const [expenseListError, setExpenseListError] = useState<string | null>(null)

  const [purchasePeriodTotal, setPurchasePeriodTotal] = useState<number | null>(null)
  const [purchasePeriodTotalBusy, setPurchasePeriodTotalBusy] = useState(true)
  const [purchasePeriodTotalError, setPurchasePeriodTotalError] = useState<string | null>(null)

  const [expensePeriodTotal, setExpensePeriodTotal] = useState<number | null>(null)
  const [expensePeriodTotalBusy, setExpensePeriodTotalBusy] = useState(true)
  const [expensePeriodTotalError, setExpensePeriodTotalError] = useState<string | null>(null)

  const [exportBusy, setExportBusy] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const periodSummary = useMemo(
    () => formatReportPeriodSummary(preset, { from, to }),
    [preset, from, to],
  )

  const loadPurchasesPage = useCallback(
    async (pageNum: number, append: boolean) => {
      if (append) {
        setPurchaseLoadingMore(true)
      } else {
        setPurchaseLoading(true)
        setPurchaseListError(null)
      }

      const res = await fetchPopOperationsList(popId, {
        view: "purchases",
        dateFrom: from,
        dateTo: to,
        search: "",
        page: pageNum,
        pageSize: PAGE_SIZE,
        sort: "created_at",
        ord: "desc",
      })

      if (append) {
        setPurchaseLoadingMore(false)
      } else {
        setPurchaseLoading(false)
      }

      if (!res.success) {
        if (!append) {
          setPurchaseRows([])
          setPurchaseCount(0)
          setPurchaseHasMore(false)
        }
        setPurchaseListError(res.error || "Error al cargar compras")
        return
      }

      setPurchaseCount(res.totalCount)
      setPurchasePage(res.page)
      setPurchaseHasMore(res.page * PAGE_SIZE < res.totalCount)
      setPurchaseRows((prev) => (append ? [...prev, ...res.purchases] : res.purchases))
    },
    [popId, from, to],
  )

  const loadExpensesPage = useCallback(
    async (pageNum: number, append: boolean) => {
      if (append) {
        setExpenseLoadingMore(true)
      } else {
        setExpenseLoading(true)
        setExpenseListError(null)
      }

      const res = await fetchPopOperationsList(popId, {
        view: "expenses",
        dateFrom: from,
        dateTo: to,
        search: "",
        page: pageNum,
        pageSize: PAGE_SIZE,
        sort: "entry_date",
        ord: "desc",
      })

      if (append) {
        setExpenseLoadingMore(false)
      } else {
        setExpenseLoading(false)
      }

      if (!res.success) {
        if (!append) {
          setExpenseRows([])
          setExpenseCount(0)
          setExpenseHasMore(false)
        }
        setExpenseListError(res.error || "Error al cargar gastos")
        return
      }

      setExpenseCount(res.totalCount)
      setExpensePage(res.page)
      setExpenseHasMore(res.page * PAGE_SIZE < res.totalCount)
      setExpenseRows((prev) => (append ? [...prev, ...res.expenseLedger] : res.expenseLedger))
    },
    [popId, from, to],
  )

  const handleExport = useCallback(
    async (format: SalesReportExportFormat) => {
      setExportBusy(true)
      setExportError(null)
      try {
        if (activeTab === "purchases") {
          const result = await fetchAllPurchasesReportRows(popId, from, to)
          if ("error" in result) {
            setExportError(result.error)
            return
          }
          if (result.rows.length === 0) {
            setExportError("No hay compras para exportar en este período.")
            return
          }
          const exportOptions = {
            timeZone,
            periodSummary,
            rowCount: purchaseCount || result.rows.length,
            periodTotal: purchasePeriodTotal ?? undefined,
          }
          if (format === "csv") {
            exportPurchasesReportCsv(result.rows, exportOptions)
          } else {
            await exportPurchasesReportPdf(result.rows, exportOptions)
          }
        } else {
          const result = await fetchAllExpensesReportRows(popId, from, to)
          if ("error" in result) {
            setExportError(result.error)
            return
          }
          if (result.rows.length === 0) {
            setExportError("No hay gastos para exportar en este período.")
            return
          }
          const exportOptions = {
            timeZone,
            periodSummary,
            rowCount: expenseCount || result.rows.length,
            periodTotal: expensePeriodTotal ?? undefined,
          }
          if (format === "csv") {
            exportExpensesReportCsv(result.rows, exportOptions)
          } else {
            await exportExpensesReportPdf(result.rows, exportOptions)
          }
        }
      } finally {
        setExportBusy(false)
      }
    },
    [
      activeTab,
      popId,
      from,
      to,
      timeZone,
      periodSummary,
      purchaseCount,
      purchasePeriodTotal,
      expenseCount,
      expensePeriodTotal,
    ],
  )

  const handlePrint = useCallback(async () => {
    setExportBusy(true)
    setExportError(null)
    try {
      if (activeTab === "purchases") {
        const result = await fetchAllPurchasesReportRows(popId, from, to)
        if ("error" in result) {
          setExportError(result.error)
          return
        }
        if (result.rows.length === 0) {
          setExportError("No hay compras para exportar en este período.")
          return
        }
        await printPurchasesReportPdf(result.rows, {
          timeZone,
          periodSummary,
          rowCount: purchaseCount || result.rows.length,
          periodTotal: purchasePeriodTotal ?? undefined,
        })
      } else {
        const result = await fetchAllExpensesReportRows(popId, from, to)
        if ("error" in result) {
          setExportError(result.error)
          return
        }
        if (result.rows.length === 0) {
          setExportError("No hay gastos para exportar en este período.")
          return
        }
        await printExpensesReportPdf(result.rows, {
          timeZone,
          periodSummary,
          rowCount: expenseCount || result.rows.length,
          periodTotal: expensePeriodTotal ?? undefined,
        })
      }
    } finally {
      setExportBusy(false)
    }
  }, [
    activeTab,
    popId,
    from,
    to,
    timeZone,
    periodSummary,
    purchaseCount,
    purchasePeriodTotal,
    expenseCount,
    expensePeriodTotal,
  ])

  useEffect(() => {
    setExportError(null)
    setPurchaseRows([])
    setPurchasePage(1)
    setPurchaseHasMore(true)
    void loadPurchasesPage(1, false)
  }, [loadPurchasesPage])

  useEffect(() => {
    setExportError(null)
    setExpenseRows([])
    setExpensePage(1)
    setExpenseHasMore(true)
    void loadExpensesPage(1, false)
  }, [loadExpensesPage])

  useEffect(() => {
    let cancelled = false
    setPurchasePeriodTotalBusy(true)
    setPurchasePeriodTotalError(null)
    void fetchPurchasesPeriodTotal(popId, from, to).then((result) => {
      if (cancelled) return
      setPurchasePeriodTotalBusy(false)
      if ("error" in result) {
        setPurchasePeriodTotal(null)
        setPurchasePeriodTotalError(result.error)
        return
      }
      setPurchasePeriodTotal(result.total)
      setPurchaseCount((prev) => (prev === 0 ? result.count : prev))
    })
    return () => {
      cancelled = true
    }
  }, [popId, from, to])

  useEffect(() => {
    let cancelled = false
    setExpensePeriodTotalBusy(true)
    setExpensePeriodTotalError(null)
    void fetchExpensesPeriodTotal(popId, from, to).then((result) => {
      if (cancelled) return
      setExpensePeriodTotalBusy(false)
      if ("error" in result) {
        setExpensePeriodTotal(null)
        setExpensePeriodTotalError(result.error)
        return
      }
      setExpensePeriodTotal(result.total)
      setExpenseCount((prev) => (prev === 0 ? result.count : prev))
    })
    return () => {
      cancelled = true
    }
  }, [popId, from, to])

  const activeLoading = activeTab === "purchases" ? purchaseLoading : expenseLoading
  const activeLoadingMore =
    activeTab === "purchases" ? purchaseLoadingMore : expenseLoadingMore
  const activeHasMore = activeTab === "purchases" ? purchaseHasMore : expenseHasMore
  const activePage = activeTab === "purchases" ? purchasePage : expensePage
  const activeListError =
    activeTab === "purchases" ? purchaseListError : expenseListError
  const activeCount = activeTab === "purchases" ? purchaseCount : expenseCount
  const activeRowsEmpty =
    activeTab === "purchases" ? purchaseRows.length === 0 : expenseRows.length === 0

  useEffect(() => {
    const root = scrollRef.current
    const sentinel = sentinelRef.current
    if (!root || !sentinel || !activeHasMore || activeLoading || activeLoadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          if (activeTab === "purchases") {
            void loadPurchasesPage(activePage + 1, true)
          } else {
            void loadExpensesPage(activePage + 1, true)
          }
        }
      },
      { root, rootMargin: "240px" },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [
    activeTab,
    activeHasMore,
    activeLoading,
    activeLoadingMore,
    activePage,
    loadPurchasesPage,
    loadExpensesPage,
  ])

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div className="flex min-h-full flex-1 flex-col gap-6 px-4 pt-6 pb-0 sm:px-6 lg:px-8">
        <ReportDetailHeaderCard
          eyebrow="Reporte operativo"
          title="Compras y gastos"
          icon={Wallet}
          onBack={onBack}
          preset={preset}
          customRange={customRange}
          bounds={bounds}
          onPresetChange={onPresetChange}
          onCustomRangeChange={onCustomRangeChange}
          stats={
            <>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Compras</p>
                <ReportStatValue loading={purchaseLoading && purchaseCount === 0}>
                  {purchaseCount.toLocaleString("es-AR")}
                </ReportStatValue>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Total compras</p>
                <ReportStatValue loading={purchasePeriodTotalBusy}>
                  {purchasePeriodTotalError
                    ? "—"
                    : formatReportMoneyAr(purchasePeriodTotal ?? 0)}
                </ReportStatValue>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Gastos</p>
                <ReportStatValue loading={expenseLoading && expenseCount === 0}>
                  {expenseCount.toLocaleString("es-AR")}
                </ReportStatValue>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Total gastos</p>
                <ReportStatValue loading={expensePeriodTotalBusy}>
                  {expensePeriodTotalError
                    ? "—"
                    : formatReportMoneyAr(expensePeriodTotal ?? 0)}
                </ReportStatValue>
              </div>
            </>
          }
        />

        <section
          className={cn(
            dataWorkspaceDetailFlushBottomCardClass,
            "flex min-h-0 flex-1 flex-col",
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-rootsy-bruma-200 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
              <RootsFormSegmentField
                label="Compras y gastos"
                aria-label="Compras y gastos"
                layout="inline"
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as ReportTab)}
                options={REPORT_TAB_OPTIONS}
                style={{ width: "auto" }}
                className="shrink-0 [&>span:first-child]:sr-only"
                groupClassName="!w-auto shrink-0"
              />
              <p
                className={cn(
                  dataWorkspaceDetailEmptyStateDescriptionClass,
                  "min-w-0 truncate",
                )}
              >
                {periodSummary}
              </p>
            </div>
            <ReportExportActionButtons
              disabled={activeLoading || activeCount === 0}
              busy={exportBusy}
              onExport={handleExport}
              onPrint={handlePrint}
            />
          </div>

          {exportError ? (
            <div
              role="alert"
              className="mx-4 mt-4 rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:mx-6 lg:mx-8"
            >
              {exportError}
            </div>
          ) : null}

          {activeListError ? (
            <div
              role="alert"
              className="mx-4 mt-4 rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:mx-6 lg:mx-8"
            >
              {activeListError}
            </div>
          ) : null}

          <ReportTableScrollArea scrollRef={scrollRef}>
            {activeLoading ? (
              <div
                className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10"
                aria-busy="true"
              >
                <RootsSpinner
                  size="default"
                  label={activeTab === "purchases" ? "Cargando compras" : "Cargando gastos"}
                />
                <p className="text-sm text-rootsy-bruma-500">
                  {activeTab === "purchases" ? "Cargando compras…" : "Cargando gastos…"}
                </p>
              </div>
            ) : activeRowsEmpty && !activeListError ? (
              <DataWorkspaceDetailEmptyState
                icon={Wallet}
                title={
                  activeTab === "purchases"
                    ? "Sin compras en el período"
                    : "Sin gastos en el período"
                }
                className="min-h-52"
              />
            ) : (
              <>
                {activeTab === "purchases" ? (
                  <PurchasesReportTable rows={purchaseRows} />
                ) : (
                  <ExpensesReportTable rows={expenseRows} />
                )}
                <div ref={sentinelRef} className="h-px w-full" aria-hidden />
                {activeLoadingMore ? (
                  <div className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-rootsy-bruma-500 sm:px-6 lg:px-8">
                    <RootsSpinner size="xs" aria-hidden className="shrink-0" />
                    {activeTab === "purchases"
                      ? "Cargando más compras…"
                      : "Cargando más gastos…"}
                  </div>
                ) : null}
              </>
            )}
          </ReportTableScrollArea>
        </section>
      </div>
    </div>
  )
}
