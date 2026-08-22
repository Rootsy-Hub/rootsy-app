"use client"

import {
  getAccountingTrialBalance,
  type AccountType,
  type TrialBalanceRow,
} from "@/app/[siteId]/[popId]/reports/accountingActions"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import { ReportDownloadToolbar } from "@/components/reports/ReportDownloadToolbar"
import { ReportStatValue } from "@/components/reports/ReportStatValue"
import { ReportDetailHeaderCard } from "@/components/reports/ReportDetailHeaderCard"
import { ReportTableScrollArea } from "@/components/reports/ReportTableScrollArea"
import {
  dataWorkspaceDetailEmptyStateDescriptionClass,
  dataWorkspaceDetailFlushBottomCardClass,
  dataWorkspaceEntityCardStatLabelClass,
  workspaceTableNatureMoneyClass,
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
  workspaceTableLayoutClassName,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  workspaceTableLayoutBodyCellClass,
  workspaceTableLayoutCellPrimaryTextClass,
  workspaceTableLayoutHeaderHeadClass,
  workspaceTableLayoutListBodyScopeClass,
  workspaceTableLayoutListSurfaceClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { workspaceLayoutsTablesScopeClass } from "@/components/layouts-tables/rootsLayoutsTablesProductStyles"
import {
  WorkspaceTableBodyRow,
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { useReportDocumentExport } from "@/hooks/useReportDocumentExport"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { exportTrialBalanceReportDocument } from "@/lib/inlineReportsExport"
import type { ReportExportContext } from "@/lib/reportExportContext"
import {
  formatReportExportPeriodLabel,
  formatReportMoneyAr,
  formatReportPeriodSummary,
} from "@/lib/reportFormatters"
import type { DataWorkspaceDatePreset } from "@/lib/dataWorkspaceDateFilter"
import { cn } from "@/lib/utils"
import { Calculator } from "lucide-react"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { DateRange } from "react-day-picker"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
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

function formatAccountTypeLabel(type: AccountType): string {
  return ACCOUNT_TYPE_LABELS[type] ?? type
}

function sumTrialBalanceTotals(rows: TrialBalanceRow[]) {
  return rows.reduce(
    (acc, row) => ({
      debit: acc.debit + row.sumDebit,
      credit: acc.credit + row.sumCredit,
    }),
    { debit: 0, credit: 0 },
  )
}

export function TrialBalanceReportView({
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
  const [rows, setRows] = useState<TrialBalanceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const periodSummary = useMemo(
    () => formatReportPeriodSummary(preset, { from, to }),
    [preset, from, to],
  )

  const exportPeriodLabel = useMemo(
    () => formatReportExportPeriodLabel({ from, to }),
    [from, to],
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await getAccountingTrialBalance(popId, from, to)
    setLoading(false)
    if (res.success) {
      setRows(res.rows)
      return
    }
    setRows([])
    setError(res.error)
  }, [popId, from, to])

  useEffect(() => {
    void load()
  }, [load])

  const totals = useMemo(() => sumTrialBalanceTotals(rows), [rows])
  const diferenciaDebeHaber = useMemo(
    () => totals.debit - totals.credit,
    [totals],
  )
  const cuadra = Math.abs(diferenciaDebeHaber) < 0.02

  const exportDocument = useCallback(
    async (format: "csv" | "pdf", context: ReportExportContext) => {
      await exportTrialBalanceReportDocument(rows, format, {
        periodLabel: exportPeriodLabel,
        exportContext: context,
        timeZone,
      })
    },
    [exportPeriodLabel, rows, timeZone],
  )

  const printDocument = useCallback(
    async (context: ReportExportContext) => {
      await exportTrialBalanceReportDocument(rows, "print", {
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
    emptyMessage: "No hay movimientos para exportar en este período.",
    exportFn: exportDocument,
    printFn: printDocument,
  })

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div className="flex min-h-full flex-1 flex-col gap-6 px-4 pt-6 pb-0 sm:px-6 lg:px-8">
        <ReportDetailHeaderCard
          eyebrow="Reporte de control"
          title="Sumas y saldos"
          icon={Calculator}
          onBack={onBack}
          preset={preset}
          customRange={customRange}
          bounds={bounds}
          onPresetChange={onPresetChange}
          onCustomRangeChange={onCustomRangeChange}
          stats={
            <>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Total debe</p>
                <ReportStatValue loading={loading}>
                  {formatReportMoneyAr(totals.debit)}
                </ReportStatValue>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Total haber</p>
                <ReportStatValue loading={loading}>
                  {formatReportMoneyAr(totals.credit)}
                </ReportStatValue>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Diferencia</p>
                <ReportStatValue
                  loading={loading}
                  className={!loading && !cuadra ? "text-amber-700" : undefined}
                >
                  {formatReportMoneyAr(diferenciaDebeHaber)}
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
                <RootsSpinner size="default" label="Cargando sumas y saldos" />
                <p className="text-sm text-rootsy-bruma-500">Cargando sumas y saldos…</p>
              </div>
            ) : rows.length === 0 ? (
              <DataWorkspaceDetailEmptyState
                icon={Calculator}
                title="Sin movimientos en el período"
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
                <Table className={workspaceTableLayoutClassName}>
                  <WorkspaceTableHeader>
                    <WorkspaceTableHeaderRow>
                      <WorkspaceTableHead className={workspaceTableLayoutHeaderHeadClass}>
                        Código
                      </WorkspaceTableHead>
                      <WorkspaceTableHead className={workspaceTableLayoutHeaderHeadClass}>
                        Cuenta
                      </WorkspaceTableHead>
                      <WorkspaceTableHead className={workspaceTableLayoutHeaderHeadClass}>
                        Tipo
                      </WorkspaceTableHead>
                      <WorkspaceTableHead
                        className={cn(workspaceTableLayoutHeaderHeadClass, "text-right")}
                      >
                        Debe
                      </WorkspaceTableHead>
                      <WorkspaceTableHead
                        className={cn(workspaceTableLayoutHeaderHeadClass, "text-right")}
                      >
                        Haber
                      </WorkspaceTableHead>
                      <WorkspaceTableHead
                        className={cn(workspaceTableLayoutHeaderHeadClass, "text-right")}
                      >
                        Saldo
                      </WorkspaceTableHead>
                    </WorkspaceTableHeaderRow>
                  </WorkspaceTableHeader>
                  <TableBody>
                    {rows.map((row, index) => (
                      <WorkspaceTableBodyRow
                        key={`${row.accountCode}-${index}`}
                        index={index}
                      >
                        <TableCell className={workspaceTableLayoutBodyCellClass}>
                          <span
                            className={cn(
                              workspaceTableLayoutCellPrimaryTextClass,
                              workspaceTableNatureTextPrimaryClass,
                            )}
                          >
                            {row.accountCode}
                          </span>
                        </TableCell>
                        <TableCell className={workspaceTableLayoutBodyCellClass}>
                          <span
                            className={cn(
                              workspaceTableLayoutCellPrimaryTextClass,
                              workspaceTableNatureTextSecondaryClass,
                            )}
                          >
                            {row.accountName}
                          </span>
                        </TableCell>
                        <TableCell className={workspaceTableLayoutBodyCellClass}>
                          <span
                            className={cn(
                              workspaceTableLayoutCellPrimaryTextClass,
                              workspaceTableNatureTextSecondaryClass,
                            )}
                          >
                            {formatAccountTypeLabel(row.accountType)}
                          </span>
                        </TableCell>
                        <TableCell
                          className={cn(workspaceTableLayoutBodyCellClass, "text-right")}
                        >
                          <span
                            className={cn(
                              workspaceTableLayoutCellPrimaryTextClass,
                              workspaceTableNatureMoneyClass,
                            )}
                          >
                            {formatReportMoneyAr(row.sumDebit)}
                          </span>
                        </TableCell>
                        <TableCell
                          className={cn(workspaceTableLayoutBodyCellClass, "text-right")}
                        >
                          <span
                            className={cn(
                              workspaceTableLayoutCellPrimaryTextClass,
                              workspaceTableNatureMoneyClass,
                            )}
                          >
                            {formatReportMoneyAr(row.sumCredit)}
                          </span>
                        </TableCell>
                        <TableCell
                          className={cn(workspaceTableLayoutBodyCellClass, "text-right")}
                        >
                          <span
                            className={cn(
                              workspaceTableLayoutCellPrimaryTextClass,
                              workspaceTableNatureMoneyClass,
                            )}
                          >
                            {formatReportMoneyAr(row.balance)}
                          </span>
                        </TableCell>
                      </WorkspaceTableBodyRow>
                    ))}
                    <TableRow className="border-t-2 border-[var(--rootsy-bruma-200)] bg-[color-mix(in_srgb,var(--rootsy-bruma-100)_55%,white)] hover:bg-[color-mix(in_srgb,var(--rootsy-bruma-100)_55%,white)]">
                      <TableCell
                        colSpan={3}
                        className={cn(workspaceTableLayoutBodyCellClass, "font-semibold")}
                      >
                        Totales
                      </TableCell>
                      <TableCell
                        className={cn(
                          workspaceTableLayoutBodyCellClass,
                          "text-right font-semibold",
                        )}
                      >
                        <span className={workspaceTableNatureMoneyClass}>
                          {formatReportMoneyAr(totals.debit)}
                        </span>
                      </TableCell>
                      <TableCell
                        className={cn(
                          workspaceTableLayoutBodyCellClass,
                          "text-right font-semibold",
                        )}
                      >
                        <span className={workspaceTableNatureMoneyClass}>
                          {formatReportMoneyAr(totals.credit)}
                        </span>
                      </TableCell>
                      <TableCell className={workspaceTableLayoutBodyCellClass} />
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </ReportTableScrollArea>
        </section>
      </div>
    </div>
  )
}
