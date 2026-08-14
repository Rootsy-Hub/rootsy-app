"use client"

import {
  getPopInvoicesArcaTable,
  type InvoiceArcaTableRow,
} from "@/app/[siteId]/[popId]/invoices/actions"
import { ReportStatValue } from "@/components/reports/ReportStatValue"
import { ReportDetailHeaderCard } from "@/components/reports/ReportDetailHeaderCard"
import { ReportTableScrollArea } from "@/components/reports/ReportTableScrollArea"
import { IssuedInvoicesReportTable } from "@/components/reports/IssuedInvoicesReportTable"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import {
  dataWorkspaceDetailEmptyStateDescriptionClass,
  dataWorkspaceDetailFlushBottomCardClass,
  dataWorkspaceEntityCardStatLabelClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { formatReportMoneyAr, formatReportPeriodSummary } from "@/lib/reportFormatters"
import { exportIssuedInvoicesReportCsv } from "@/lib/issuedInvoicesReportCsvExport"
import { exportIssuedInvoicesReportPdf } from "@/lib/issuedInvoicesReportPdfExport"
import {
  sumIssuedInvoicesReportIva,
  sumIssuedInvoicesReportTotal,
} from "@/lib/issuedInvoicesReportExportData"
import type { DataWorkspaceDatePreset } from "@/lib/dataWorkspaceDateFilter"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { cn } from "@/lib/utils"
import { FileBarChart } from "lucide-react"
import {
  SalesReportDownloadMenu,
  type SalesReportExportFormat,
} from "@/components/reports/SalesReportDownloadMenu"
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

async function fetchInvoicesPeriodTotals(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<
  { count: number; total: number; iva: number } | { error: string }
> {
  let page = 1
  let total = 0
  let iva = 0
  let count = 0

  while (page <= 50) {
    const res = await getPopInvoicesArcaTable(popId, {
      page,
      pageSize: 100,
      dateFrom: from,
      dateTo: to,
      sort: "cbte_fch",
      ord: "desc",
    })
    if (!res.success) {
      return { error: res.error || "Error al cargar facturas" }
    }
    count = res.totalCount
    for (const row of res.invoices) {
      total += row.impTotal
      iva += row.impIva
    }
    if (page * 100 >= res.totalCount) break
    page += 1
  }

  return { count, total, iva }
}

async function fetchAllIssuedInvoicesReportRows(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<{ rows: InvoiceArcaTableRow[] } | { error: string }> {
  const rows: InvoiceArcaTableRow[] = []
  let page = 1

  while (page <= 100) {
    const res = await getPopInvoicesArcaTable(popId, {
      page,
      pageSize: 100,
      dateFrom: from,
      dateTo: to,
      sort: "cbte_fch",
      ord: "desc",
    })
    if (!res.success) {
      return { error: res.error || "Error al cargar facturas" }
    }
    rows.push(...res.invoices)
    if (page * 100 >= res.totalCount) break
    page += 1
  }

  return { rows }
}

export function IssuedInvoicesReportView({
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

  const [rows, setRows] = useState<InvoiceArcaTableRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [listError, setListError] = useState<string | null>(null)

  const [periodTotal, setPeriodTotal] = useState<number | null>(null)
  const [periodIva, setPeriodIva] = useState<number | null>(null)
  const [periodTotalBusy, setPeriodTotalBusy] = useState(true)
  const [periodTotalError, setPeriodTotalError] = useState<string | null>(null)
  const [exportBusy, setExportBusy] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const periodSummary = useMemo(
    () => formatReportPeriodSummary(preset, { from, to }),
    [preset, from, to],
  )

  const loadPage = useCallback(
    async (pageNum: number, append: boolean) => {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
        setListError(null)
      }

      const res = await getPopInvoicesArcaTable(popId, {
        page: pageNum,
        pageSize: PAGE_SIZE,
        dateFrom: from,
        dateTo: to,
        sort: "cbte_fch",
        ord: "desc",
      })

      if (append) {
        setLoadingMore(false)
      } else {
        setLoading(false)
      }

      if (!res.success) {
        if (!append) {
          setRows([])
          setTotalCount(0)
          setHasMore(false)
        }
        setListError(res.error || "Error al cargar facturas")
        return
      }

      setTotalCount(res.totalCount)
      setPage(res.page)
      setHasMore(res.page * PAGE_SIZE < res.totalCount)
      setRows((prev) => (append ? [...prev, ...res.invoices] : res.invoices))
    },
    [popId, from, to],
  )

  const handleExport = useCallback(
    async (format: SalesReportExportFormat) => {
      setExportBusy(true)
      setExportError(null)
      try {
        const result = await fetchAllIssuedInvoicesReportRows(popId, from, to)
        if ("error" in result) {
          setExportError(result.error)
          return
        }
        if (result.rows.length === 0) {
          setExportError("No hay facturas para exportar en este período.")
          return
        }

        const exportOptions = {
          timeZone,
          periodSummary,
          invoiceCount: totalCount || result.rows.length,
          periodTotal: periodTotal ?? sumIssuedInvoicesReportTotal(result.rows),
          periodIva: periodIva ?? sumIssuedInvoicesReportIva(result.rows),
        }

        if (format === "csv") {
          exportIssuedInvoicesReportCsv(result.rows, exportOptions)
        } else {
          await exportIssuedInvoicesReportPdf(result.rows, exportOptions)
        }
      } finally {
        setExportBusy(false)
      }
    },
    [popId, from, to, timeZone, periodSummary, totalCount, periodTotal, periodIva],
  )

  useEffect(() => {
    setExportError(null)
    setRows([])
    setPage(1)
    setHasMore(true)
    void loadPage(1, false)
  }, [loadPage])

  useEffect(() => {
    let cancelled = false
    setPeriodTotalBusy(true)
    setPeriodTotalError(null)
    void fetchInvoicesPeriodTotals(popId, from, to).then((result) => {
      if (cancelled) return
      setPeriodTotalBusy(false)
      if ("error" in result) {
        setPeriodTotal(null)
        setPeriodIva(null)
        setPeriodTotalError(result.error)
        return
      }
      setPeriodTotal(result.total)
      setPeriodIva(result.iva)
      setTotalCount((prev) => (prev === 0 ? result.count : prev))
    })
    return () => {
      cancelled = true
    }
  }, [popId, from, to])

  useEffect(() => {
    const root = scrollRef.current
    const sentinel = sentinelRef.current
    if (!root || !sentinel || !hasMore || loading || loadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadPage(page + 1, true)
        }
      },
      { root, rootMargin: "240px" },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loading, loadingMore, loadPage, page])

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div className="flex min-h-full flex-1 flex-col gap-6 px-4 pt-6 pb-0 sm:px-6 lg:px-8">
        <ReportDetailHeaderCard
          eyebrow="Reporte fiscal"
          title="Facturas emitidas"
          icon={FileBarChart}
          onBack={onBack}
          preset={preset}
          customRange={customRange}
          bounds={bounds}
          onPresetChange={onPresetChange}
          onCustomRangeChange={onCustomRangeChange}
          stats={
            <>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Comprobantes</p>
                <ReportStatValue loading={loading && totalCount === 0}>
                  {totalCount.toLocaleString("es-AR")}
                </ReportStatValue>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Total facturado</p>
                <ReportStatValue loading={periodTotalBusy}>
                  {periodTotalError ? "—" : formatReportMoneyAr(periodTotal ?? 0)}
                </ReportStatValue>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>IVA</p>
                <ReportStatValue loading={periodTotalBusy}>
                  {periodTotalError ? "—" : formatReportMoneyAr(periodIva ?? 0)}
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
          <div className="flex flex-col gap-3 border-b border-rootsy-bruma-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p className={dataWorkspaceDetailEmptyStateDescriptionClass}>
              {periodSummary}
            </p>
            <SalesReportDownloadMenu
              disabled={loading || totalCount === 0}
              busy={exportBusy}
              onExport={handleExport}
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

          {listError ? (
            <div
              role="alert"
              className="mx-4 mt-4 rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:mx-6 lg:mx-8"
            >
              {listError}
            </div>
          ) : null}

          <ReportTableScrollArea scrollRef={scrollRef}>
            {loading ? (
              <div
                className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10"
                aria-busy="true"
              >
                <RootsSpinner size="default" label="Cargando facturas" />
                <p className="text-sm text-rootsy-bruma-500">Cargando facturas…</p>
              </div>
            ) : !rows.length && !listError ? (
              <DataWorkspaceDetailEmptyState
                icon={FileBarChart}
                title="Sin facturas en el período"
                className="min-h-52"
              />
            ) : (
              <>
                <IssuedInvoicesReportTable rows={rows} />
                <div ref={sentinelRef} className="h-px w-full" aria-hidden />
                {loadingMore ? (
                  <div className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-rootsy-bruma-500 sm:px-6 lg:px-8">
                    <RootsSpinner size="xs" aria-hidden className="shrink-0" />
                    Cargando más facturas…
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
