"use client"

import type {
  CashRegistersPeriodReportPopInfo,
  CashRegistersPeriodReportRow,
} from "@/app/[siteId]/[popId]/cash-registers/actions"
import {
  fetchCashRegistersPeriodReport,
  fetchCashRegistersPeriodTotals,
  type CashRegistersPeriodTotals,
} from "@/lib/rootsyApi/cashRegistersClient"
import {
  arqueoDifferenceToneClass,
  formatArqueoDifferenceDisplay,
  formatCashRegisterDateTime,
  formatCashRegisterMoney,
  type ArqueoDifferenceTone,
} from "@/app/[siteId]/[popId]/cash-registers/cashRegisterFormatters"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import { ReportDetailHeaderCard } from "@/components/reports/ReportDetailHeaderCard"
import { ReportStatValue } from "@/components/reports/ReportStatValue"
import { ReportTableScrollArea } from "@/components/reports/ReportTableScrollArea"
import { ReportExportActionButtons } from "@/components/reports/ReportExportActionButtons"
import type { SalesReportExportFormat } from "@/components/reports/SalesReportDownloadMenu"
import {
  dataWorkspaceDetailEmptyStateDescriptionClass,
  dataWorkspaceDetailFlushBottomCardClass,
  dataWorkspaceEntityCardStatLabelClass,
  workspaceTableLayoutClassName,
  workspaceTableNatureMoneyClass,
  workspaceTableNatureMoneyNegativeClass,
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  workspaceTableLayoutBodyCellClass,
  workspaceTableLayoutCellPrimaryTextClass,
  workspaceTableLayoutCellSecondaryTextClass,
  workspaceTableLayoutCellStackClass,
  workspaceTableLayoutHeaderHeadClass,
  workspaceTableLayoutListBodyScopeClass,
  workspaceTableLayoutListEndFooterClass,
  workspaceTableLayoutListEndFooterDividerClass,
  workspaceTableLayoutListSurfaceClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { workspaceLayoutsTablesScopeClass } from "@/components/layouts-tables/rootsLayoutsTablesProductStyles"
import {
  WorkspaceTableBodyRow,
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { exportCashRegistersReportCsv } from "@/lib/cashRegistersReportCsvExport"
import {
  exportCashRegistersReportPdf,
  printCashRegistersReportPdf,
} from "@/lib/cashRegistersReportPdfExport"
import { type DataWorkspaceDatePreset } from "@/lib/dataWorkspaceDateFilter"
import {
  formatReportMoneyAr,
  formatReportExportPeriodLabel,
  formatReportPeriodSummary,
} from "@/lib/reportFormatters"
import { cn } from "@/lib/utils"
import { Landmark } from "lucide-react"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import type { DateRange } from "react-day-picker"
import { Table, TableBody, TableCell } from "@/components/ui/table"
import "@/components/layouts-tables/rootsLayoutsTablesScope.css"

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

const arqueoTableRegisterColumnClass = "min-w-36"
const arqueoTableTotalColumnClass = "w-32 min-w-32 max-w-32"
const arqueoTableDifferenceColumnClass = "w-28 min-w-28 max-w-28"

function arqueoTableMoneyValueClass(tone?: ArqueoDifferenceTone) {
  if (tone === "negative") return workspaceTableNatureMoneyNegativeClass
  if (tone === "positive") {
    return cn(workspaceTableNatureMoneyClass, arqueoDifferenceToneClass("positive"))
  }
  if (tone === "muted" || tone === "neutral") {
    return cn("text-sm leading-4", workspaceTableNatureTextSecondaryClass)
  }
  return workspaceTableNatureMoneyClass
}

function ArqueoTableMoneyCell({
  children,
  columnClass,
  tone,
}: {
  children: ReactNode
  columnClass: string
  tone?: ArqueoDifferenceTone
}) {
  return (
    <TableCell
      className={cn(
        workspaceTableLayoutBodyCellClass,
        columnClass,
        "text-right",
      )}
    >
      <span className={cn("block tabular-nums", arqueoTableMoneyValueClass(tone))}>
        {children}
      </span>
    </TableCell>
  )
}

function SessionMomentCell({
  primary,
  secondary,
}: {
  primary: ReactNode
  secondary: ReactNode
}) {
  return (
    <div className={workspaceTableLayoutCellStackClass}>
      <div className={workspaceTableLayoutCellPrimaryTextClass}>
        <span className={cn("truncate", workspaceTableNatureTextPrimaryClass)}>
          {primary}
        </span>
      </div>
      <div className={workspaceTableLayoutCellSecondaryTextClass}>
        <span className={cn("truncate", workspaceTableNatureTextSecondaryClass)}>
          {secondary}
        </span>
      </div>
    </div>
  )
}

export function CashRegistersReportView({
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

  const [rows, setRows] = useState<CashRegistersPeriodReportRow[]>([])
  const [popInfo, setPopInfo] = useState<CashRegistersPeriodReportPopInfo | null>(
    null,
  )
  const [registerCount, setRegisterCount] = useState(0)
  const [totals, setTotals] = useState<CashRegistersPeriodTotals | null>(null)
  const [totalsBusy, setTotalsBusy] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exportBusy, setExportBusy] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const periodSummary = useMemo(
    () => formatReportPeriodSummary(preset, { from, to }),
    [preset, from, to],
  )

  const exportPeriodLabel = useMemo(
    () => formatReportExportPeriodLabel({ from, to }),
    [from, to],
  )

  const exportContext = useMemo(
    () =>
      popInfo
        ? {
            popName: popInfo.popName,
            popFiscalRazonSocial: popInfo.popFiscalRazonSocial,
            popFiscalCuit: popInfo.popFiscalCuit,
            popStreetAddress: popInfo.popStreetAddress,
          }
        : null,
    [popInfo],
  )

  const summary = useMemo(
    () =>
      totals ?? {
        registerCount,
        closedCount: 0,
        totalCobrado: 0,
        netDifference: 0,
        sessionsWithVariance: 0,
      },
    [registerCount, totals],
  )

  useEffect(() => {
    let cancelled = false
    setTotalsBusy(true)
    void fetchCashRegistersPeriodTotals(popId, from, to).then((res) => {
      if (cancelled) return
      setTotalsBusy(false)
      if (res.success) {
        setTotals(res.data)
        setRegisterCount(res.data.registerCount)
        return
      }
      setTotals(null)
    })
    return () => {
      cancelled = true
    }
  }, [from, popId, to])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await fetchCashRegistersPeriodReport(popId, from, to)
    setLoading(false)
    if (res.success) {
      setRows(res.data.rows)
      setRegisterCount(res.data.registerCount)
      setPopInfo(res.data.popInfo)
      return
    }
    setRows([])
    setRegisterCount(0)
    setPopInfo(null)
    setError(res.error)
  }, [from, popId, to])

  useEffect(() => {
    void load()
  }, [load])

  const handleExport = useCallback(
    async (format: SalesReportExportFormat) => {
      if (rows.length === 0) {
        setExportError("No hay arqueos cerrados para exportar en este período.")
        return
      }
      if (!exportContext) {
        setExportError("No se pudieron cargar los datos del punto de venta.")
        return
      }

      setExportBusy(true)
      setExportError(null)
      try {
        const exportOptions = {
          timeZone,
          periodSummary: exportPeriodLabel,
          exportContext,
          arqueoCount: summary.closedCount,
          totalCobrado: summary.totalCobrado,
          netDifference: summary.netDifference,
        }
        if (format === "csv") {
          exportCashRegistersReportCsv(rows, exportOptions)
        } else {
          await exportCashRegistersReportPdf(rows, exportOptions)
        }
      } finally {
        setExportBusy(false)
      }
    },
    [exportContext, exportPeriodLabel, rows, summary, timeZone],
  )

  const handlePrint = useCallback(async () => {
    if (rows.length === 0) {
      setExportError("No hay arqueos cerrados para exportar en este período.")
      return
    }
    if (!exportContext) {
      setExportError("No se pudieron cargar los datos del punto de venta.")
      return
    }

    setExportBusy(true)
    setExportError(null)
    try {
      await printCashRegistersReportPdf(rows, {
        timeZone,
        periodSummary: exportPeriodLabel,
        exportContext,
        arqueoCount: summary.closedCount,
        totalCobrado: summary.totalCobrado,
        netDifference: summary.netDifference,
      })
    } finally {
      setExportBusy(false)
    }
  }, [exportContext, exportPeriodLabel, rows, summary, timeZone])

  const loadedCountLabel = useMemo(() => {
    const count = rows.length
    return count === 1 ? "1 arqueo" : `${count.toLocaleString("es-AR")} arqueos`
  }, [rows.length])

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div className="flex min-h-full flex-1 flex-col gap-6 px-4 pt-6 pb-0 sm:px-6 lg:px-8">
        <ReportDetailHeaderCard
          eyebrow="Reporte de control"
          title="Arqueo de caja"
          icon={Landmark}
          onBack={onBack}
          preset={preset}
          customRange={customRange}
          bounds={bounds}
          onPresetChange={onPresetChange}
          onCustomRangeChange={onCustomRangeChange}
          stats={
            <>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Arqueos</p>
                <ReportStatValue loading={totalsBusy}>
                  {summary.closedCount.toLocaleString("es-AR")}
                </ReportStatValue>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Total cobrado</p>
                <ReportStatValue loading={totalsBusy}>
                  {formatReportMoneyAr(summary.totalCobrado)}
                </ReportStatValue>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Diferencia neta</p>
                <ReportStatValue loading={totalsBusy}>
                  {formatReportMoneyAr(summary.netDifference)}
                </ReportStatValue>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Con faltante/sobrante</p>
                <ReportStatValue loading={totalsBusy}>
                  {summary.sessionsWithVariance.toLocaleString("es-AR")}
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
            <ReportExportActionButtons
              disabled={loading || rows.length === 0}
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

          {error ? (
            <div
              role="alert"
              className="mx-4 mt-4 rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:mx-6 lg:mx-8"
            >
              {error}
            </div>
          ) : null}

          <ReportTableScrollArea>
            {loading ? (
              <div
                className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10"
                aria-busy="true"
              >
                <RootsSpinner size="default" label="Cargando arqueos" />
                <p className="text-sm text-rootsy-bruma-500">Cargando arqueos…</p>
              </div>
            ) : registerCount === 0 ? (
              <DataWorkspaceDetailEmptyState
                icon={Landmark}
                title="Sin cajas registradas"
                className="min-h-52"
              />
            ) : rows.length === 0 ? (
              <DataWorkspaceDetailEmptyState
                icon={Landmark}
                title="Sin arqueos en este período"
                className="min-h-52"
              />
            ) : (
              <div
                className={cn(
                  workspaceLayoutsTablesScopeClass,
                  workspaceTableLayoutListSurfaceClass,
                  workspaceTableLayoutListBodyScopeClass,
                )}
              >
                <Table className={cn(workspaceTableLayoutClassName, "min-w-[52rem]")}>
                  <WorkspaceTableHeader>
                    <WorkspaceTableHeaderRow>
                      <WorkspaceTableHead
                        tone="nature"
                        className={cn(
                          arqueoTableRegisterColumnClass,
                          workspaceTableLayoutHeaderHeadClass,
                        )}
                      >
                        Caja
                      </WorkspaceTableHead>
                      <WorkspaceTableHead
                        tone="nature"
                        className={cn("w-16", workspaceTableLayoutHeaderHeadClass)}
                      >
                        #
                      </WorkspaceTableHead>
                      <WorkspaceTableHead
                        tone="nature"
                        className={cn("min-w-44", workspaceTableLayoutHeaderHeadClass)}
                      >
                        Apertura
                      </WorkspaceTableHead>
                      <WorkspaceTableHead
                        tone="nature"
                        className={cn("min-w-44", workspaceTableLayoutHeaderHeadClass)}
                      >
                        Cierre
                      </WorkspaceTableHead>
                      <WorkspaceTableHead
                        tone="nature"
                        align="right"
                        className={cn(
                          arqueoTableTotalColumnClass,
                          workspaceTableLayoutHeaderHeadClass,
                        )}
                      >
                        Total cobrado
                      </WorkspaceTableHead>
                      <WorkspaceTableHead
                        tone="nature"
                        align="right"
                        className={cn(
                          arqueoTableDifferenceColumnClass,
                          workspaceTableLayoutHeaderHeadClass,
                        )}
                      >
                        Diferencia
                      </WorkspaceTableHead>
                    </WorkspaceTableHeaderRow>
                  </WorkspaceTableHeader>
                  <TableBody>
                    {rows.map((row, index) => {
                      const difference = formatArqueoDifferenceDisplay(
                        row.cashArqueoDifference,
                      )
                      const arqueoLabel =
                        row.arqueoNumber > 0 ? `#${row.arqueoNumber}` : "—"

                      return (
                        <WorkspaceTableBodyRow
                          key={`${row.registerId}-${row.id}`}
                          index={index}
                          noHover
                        >
                          <TableCell className={workspaceTableLayoutBodyCellClass}>
                            <span
                              className={cn(
                                "truncate font-medium",
                                workspaceTableNatureTextPrimaryClass,
                              )}
                            >
                              {row.registerName}
                            </span>
                          </TableCell>
                          <TableCell
                            className={cn(
                              workspaceTableLayoutBodyCellClass,
                              "font-medium tabular-nums",
                              workspaceTableNatureTextSecondaryClass,
                            )}
                          >
                            {arqueoLabel}
                          </TableCell>
                          <TableCell className={workspaceTableLayoutBodyCellClass}>
                            <SessionMomentCell
                              primary={formatCashRegisterDateTime(
                                row.openedAt,
                                timeZone,
                              )}
                              secondary={row.openedByName ?? "—"}
                            />
                          </TableCell>
                          <TableCell className={workspaceTableLayoutBodyCellClass}>
                            <SessionMomentCell
                              primary={
                                row.closedAt
                                  ? formatCashRegisterDateTime(row.closedAt, timeZone)
                                  : "—"
                              }
                              secondary={row.closedByName ?? "—"}
                            />
                          </TableCell>
                          <ArqueoTableMoneyCell columnClass={arqueoTableTotalColumnClass}>
                            {formatCashRegisterMoney(row.totalCobrado)}
                          </ArqueoTableMoneyCell>
                          <ArqueoTableMoneyCell
                            columnClass={arqueoTableDifferenceColumnClass}
                            tone={difference.tone}
                          >
                            {difference.text}
                          </ArqueoTableMoneyCell>
                        </WorkspaceTableBodyRow>
                      )
                    })}
                  </TableBody>
                </Table>
                <div className={workspaceTableLayoutListEndFooterClass}>
                  <span
                    className={workspaceTableLayoutListEndFooterDividerClass}
                    aria-hidden
                  />
                  <span className="shrink-0 text-center">
                    Fin del listado · {loadedCountLabel}
                  </span>
                  <span
                    className={workspaceTableLayoutListEndFooterDividerClass}
                    aria-hidden
                  />
                </div>
              </div>
            )}
          </ReportTableScrollArea>
        </section>
      </div>
    </div>
  )
}
