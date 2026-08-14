"use client"

import {
  getChartOfAccountsReport,
  type AccountNature,
  type AccountType,
  type ChartOfAccountsReportRow,
} from "@/app/[siteId]/[popId]/accounting/actions"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import { ReportDownloadToolbar } from "@/components/reports/ReportDownloadToolbar"
import { ReportDetailHeaderCard } from "@/components/reports/ReportDetailHeaderCard"
import { ReportStatValue } from "@/components/reports/ReportStatValue"
import { ReportTableScrollArea } from "@/components/reports/ReportTableScrollArea"
import {
  dataWorkspaceDetailEmptyStateDescriptionClass,
  dataWorkspaceDetailFlushBottomCardClass,
  dataWorkspaceEntityCardStatLabelClass,
  workspaceTableLayoutClassName,
  workspaceTableNatureMoneyClass,
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  workspaceTableLayoutBodyCellClass,
  workspaceTableLayoutCellPrimaryTextClass,
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
import { RootsSpinner } from "@/components/rootsy-spinner"
import {
  toISODateLocal,
  type DataWorkspaceDatePreset,
} from "@/lib/dataWorkspaceDateFilter"
import { useReportDocumentExport } from "@/hooks/useReportDocumentExport"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { exportChartOfAccountsReportDocument } from "@/lib/inlineReportsExport"
import type { ReportExportContext } from "@/lib/reportExportContext"
import {
  formatReportAsOfSummary,
  formatReportExportPeriodLabel,
  formatReportMoneyAr,
} from "@/lib/reportFormatters"
import { cn } from "@/lib/utils"
import { ShieldCheck } from "lucide-react"
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react"
import type { DateRange } from "react-day-picker"
import { Table, TableBody, TableCell } from "@/components/ui/table"
import "@/components/layouts-tables/rootsLayoutsTablesScope.css"

type Props = {
  popId: string
  preset: DataWorkspaceDatePreset
  customRange: DateRange | undefined
  bounds: { from: string | null; to: string | null }
  onPresetChange: (preset: DataWorkspaceDatePreset) => void
  onCustomRangeChange: (range: DateRange | undefined) => void
  onBack: () => void
}

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  activo_corriente: "Activo corriente",
  activo_no_corriente: "Activo no corriente",
  pasivo_corriente: "Pasivo corriente",
  pasivo_no_corriente: "Pasivo no corriente",
  patrimonio_neto: "Patrimonio neto",
  ingresos: "Ingresos",
  costos: "Costos",
  gastos: "Gastos",
}

const NATURE_LABELS: Record<AccountNature, string> = {
  deudora: "Deudora",
  acreedora: "Acreedora",
}

const chartTableCodeColumnClass = "w-36 min-w-36 max-w-36"
const chartTableNameColumnClass = "min-w-48"
const chartTableTypeColumnClass = "min-w-40"
const chartTableNatureColumnClass = "w-28 min-w-28 max-w-28"
const chartTableMovementColumnClass = "w-28 min-w-28 max-w-28"
const chartTableBalanceColumnClass = "w-32 min-w-32 max-w-32"

function resolveChartOfAccountsAsOf(bounds: {
  from: string | null
  to: string | null
}): string {
  return bounds.to ?? toISODateLocal(new Date())
}

function computeChartOfAccountsSummary(rows: ChartOfAccountsReportRow[]) {
  let movementAccounts = 0
  let withBalance = 0

  for (const row of rows) {
    if (row.isMovementAccount) movementAccounts += 1
    if (Math.abs(row.balance) >= 0.01) withBalance += 1
  }

  return {
    totalAccounts: rows.length,
    movementAccounts,
    withBalance,
  }
}

function codeIndentStyle(level: number): CSSProperties {
  return { paddingLeft: `${Math.max(0, level - 1) * 0.75}rem` }
}

export function ChartOfAccountsReportView({
  popId,
  preset,
  customRange,
  bounds,
  onPresetChange,
  onCustomRangeChange,
  onBack,
}: Props) {
  const timeZone = usePopTimeZone()
  const [rows, setRows] = useState<ChartOfAccountsReportRow[]>([])
  const [asOf, setAsOf] = useState<string>(() => resolveChartOfAccountsAsOf(bounds))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const asOfDate = useMemo(() => resolveChartOfAccountsAsOf(bounds), [bounds])

  const periodSummary = useMemo(
    () => formatReportAsOfSummary(preset, bounds, asOf),
    [asOf, bounds, preset],
  )

  const exportPeriodLabel = useMemo(
    () => formatReportExportPeriodLabel({ from: null, to: asOfDate }),
    [asOfDate],
  )

  const summary = useMemo(() => computeChartOfAccountsSummary(rows), [rows])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setRows([])
    const res = await getChartOfAccountsReport(popId, asOfDate)
    setLoading(false)
    if (res.success) {
      setRows(res.data.rows)
      setAsOf(res.data.asOf)
      return
    }
    setError(res.error)
  }, [asOfDate, popId])

  useEffect(() => {
    void load()
  }, [load])

  const loadedCountLabel = useMemo(() => {
    const count = rows.length
    return count === 1 ? "1 cuenta" : `${count.toLocaleString("es-AR")} cuentas`
  }, [rows.length])

  const exportDocument = useCallback(
    async (format: "csv" | "pdf", context: ReportExportContext) => {
      await exportChartOfAccountsReportDocument(rows, format, {
        periodLabel: exportPeriodLabel,
        exportContext: context,
        timeZone,
      })
    },
    [exportPeriodLabel, rows, timeZone],
  )

  const printDocument = useCallback(
    async (context: ReportExportContext) => {
      await exportChartOfAccountsReportDocument(rows, "print", {
        periodLabel: exportPeriodLabel,
        exportContext: context,
        timeZone,
      })
    },
    [exportPeriodLabel, rows, timeZone],
  )

  const { exportBusy, exportError, handleExport, handlePrint } = useReportDocumentExport({
    popId,
    disabled: loading || rows.length === 0,
    emptyMessage: "No hay cuentas para exportar.",
    exportFn: exportDocument,
    printFn: printDocument,
  })

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div className="flex min-h-full flex-1 flex-col gap-6 px-4 pt-6 pb-0 sm:px-6 lg:px-8">
        <ReportDetailHeaderCard
          eyebrow="Reporte de configuración"
          title="Plan de cuentas"
          icon={ShieldCheck}
          onBack={onBack}
          preset={preset}
          customRange={customRange}
          bounds={bounds}
          onPresetChange={onPresetChange}
          onCustomRangeChange={onCustomRangeChange}
          stats={
            <>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Cuentas</p>
                <ReportStatValue loading={loading}>
                  {summary.totalAccounts.toLocaleString("es-AR")}
                </ReportStatValue>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Imputables</p>
                <ReportStatValue loading={loading}>
                  {summary.movementAccounts.toLocaleString("es-AR")}
                </ReportStatValue>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Con saldo</p>
                <ReportStatValue loading={loading}>
                  {summary.withBalance.toLocaleString("es-AR")}
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
          <ReportDownloadToolbar
            periodSummary={periodSummary}
            disabled={loading || rows.length === 0}
            exportBusy={exportBusy}
            exportError={exportError}
            onExport={handleExport}
            onPrint={handlePrint}
          />

          <ReportTableScrollArea>
            {loading ? (
              <div
                className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10"
                aria-busy="true"
              >
                <RootsSpinner size="default" label="Cargando plan de cuentas" />
                <p className="text-sm text-rootsy-bruma-500">
                  Cargando plan de cuentas…
                </p>
              </div>
            ) : error ? (
              <div className="px-4 py-10 sm:px-6 lg:px-8">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            ) : rows.length === 0 ? (
              <DataWorkspaceDetailEmptyState
                icon={ShieldCheck}
                title="Sin cuentas contables"
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
                <Table className={cn(workspaceTableLayoutClassName, "min-w-[56rem]")}>
                  <WorkspaceTableHeader>
                    <WorkspaceTableHeaderRow>
                      <WorkspaceTableHead
                        tone="nature"
                        className={cn(
                          chartTableCodeColumnClass,
                          workspaceTableLayoutHeaderHeadClass,
                        )}
                      >
                        Código
                      </WorkspaceTableHead>
                      <WorkspaceTableHead
                        tone="nature"
                        className={cn(
                          chartTableNameColumnClass,
                          workspaceTableLayoutHeaderHeadClass,
                        )}
                      >
                        Nombre
                      </WorkspaceTableHead>
                      <WorkspaceTableHead
                        tone="nature"
                        className={cn(
                          chartTableTypeColumnClass,
                          workspaceTableLayoutHeaderHeadClass,
                        )}
                      >
                        Rubro
                      </WorkspaceTableHead>
                      <WorkspaceTableHead
                        tone="nature"
                        className={cn(
                          chartTableNatureColumnClass,
                          workspaceTableLayoutHeaderHeadClass,
                        )}
                      >
                        Naturaleza
                      </WorkspaceTableHead>
                      <WorkspaceTableHead
                        tone="nature"
                        className={cn(
                          chartTableMovementColumnClass,
                          workspaceTableLayoutHeaderHeadClass,
                        )}
                      >
                        Imputable
                      </WorkspaceTableHead>
                      <WorkspaceTableHead
                        tone="nature"
                        align="right"
                        className={cn(
                          chartTableBalanceColumnClass,
                          workspaceTableLayoutHeaderHeadClass,
                        )}
                      >
                        Saldo
                      </WorkspaceTableHead>
                    </WorkspaceTableHeaderRow>
                  </WorkspaceTableHeader>
                  <TableBody>
                    {rows.map((row, index) => (
                      <WorkspaceTableBodyRow
                        key={row.id}
                        index={index}
                        noHover
                        className={cn(!row.isMovementAccount && "bg-rootsy-bruma-50/70")}
                      >
                        <TableCell
                          className={cn(
                            workspaceTableLayoutBodyCellClass,
                            chartTableCodeColumnClass,
                            "tabular-nums",
                            workspaceTableNatureTextSecondaryClass,
                          )}
                          style={codeIndentStyle(row.level)}
                        >
                          {row.code}
                        </TableCell>
                        <TableCell className={workspaceTableLayoutBodyCellClass}>
                          <span
                            className={cn(
                              "block truncate font-medium",
                              workspaceTableLayoutCellPrimaryTextClass,
                              workspaceTableNatureTextPrimaryClass,
                              !row.isMovementAccount &&
                                workspaceTableNatureTextSecondaryClass,
                            )}
                          >
                            {row.name}
                          </span>
                        </TableCell>
                        <TableCell
                          className={cn(
                            workspaceTableLayoutBodyCellClass,
                            chartTableTypeColumnClass,
                            "text-sm",
                            workspaceTableNatureTextSecondaryClass,
                          )}
                        >
                          {ACCOUNT_TYPE_LABELS[row.accountType]}
                        </TableCell>
                        <TableCell
                          className={cn(
                            workspaceTableLayoutBodyCellClass,
                            chartTableNatureColumnClass,
                            "text-sm",
                            workspaceTableNatureTextSecondaryClass,
                          )}
                        >
                          {NATURE_LABELS[row.nature]}
                        </TableCell>
                        <TableCell
                          className={cn(
                            workspaceTableLayoutBodyCellClass,
                            chartTableMovementColumnClass,
                            "text-sm",
                            workspaceTableNatureTextSecondaryClass,
                          )}
                        >
                          {row.isMovementAccount ? "Sí" : "No"}
                        </TableCell>
                        <TableCell
                          className={cn(
                            workspaceTableLayoutBodyCellClass,
                            chartTableBalanceColumnClass,
                            "text-right",
                          )}
                        >
                          <span
                            className={cn(
                              "block tabular-nums",
                              Math.abs(row.balance) >= 0.01
                                ? workspaceTableNatureMoneyClass
                                : cn(
                                    "text-sm leading-4",
                                    workspaceTableNatureTextSecondaryClass,
                                  ),
                            )}
                          >
                            {formatReportMoneyAr(row.balance)}
                          </span>
                        </TableCell>
                      </WorkspaceTableBodyRow>
                    ))}
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
