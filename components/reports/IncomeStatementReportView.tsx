"use client"

import {
  getAccountingIncomeStatement,
  type IncomeStatementResult,
} from "@/app/[siteId]/[popId]/accounting/actions"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import { ReportDownloadToolbar } from "@/components/reports/ReportDownloadToolbar"
import { ReportStatValue } from "@/components/reports/ReportStatValue"
import { ReportDetailHeaderCard } from "@/components/reports/ReportDetailHeaderCard"
import {
  dataWorkspaceDetailEmptyStateDescriptionClass,
  dataWorkspaceDetailFlushBottomCardClass,
  dataWorkspaceEntityCardStatLabelClass,
  workspaceTableNatureMoneyClass,
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { useReportDocumentExport } from "@/hooks/useReportDocumentExport"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { exportIncomeStatementReportDocument } from "@/lib/inlineReportsExport"
import type { ReportExportContext } from "@/lib/reportExportContext"
import {
  formatReportExportPeriodLabel,
  formatReportMoneyAr,
  formatReportPeriodSummary,
} from "@/lib/reportFormatters"
import type { DataWorkspaceDatePreset } from "@/lib/dataWorkspaceDateFilter"
import {
  buildIncomeStatementDisplayRows,
  hasIncomeStatementMovement,
  type IncomeStatementDisplayRow,
} from "@/lib/incomeStatementReportHierarchy"
import { cn } from "@/lib/utils"
import { TrendingUp } from "lucide-react"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { DateRange } from "react-day-picker"
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

function IncomeStatementAmount({
  amount,
  className,
}: {
  amount: number
  className?: string
}) {
  return (
    <span
      className={cn(
        "shrink-0 text-right text-sm tabular-nums",
        workspaceTableNatureMoneyClass,
        className,
      )}
    >
      {formatReportMoneyAr(amount)}
    </span>
  )
}

function IncomeStatementRowView({
  row,
  showGroupAccounts,
}: {
  row: IncomeStatementDisplayRow
  showGroupAccounts: boolean
}) {
  if (row.kind === "section-header") {
    return (
      <div className="flex items-center justify-between gap-4 border-y border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] px-4 py-3 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--rootsy-bruma-700)]">
          {row.label}
        </p>
      </div>
    )
  }

  if (row.kind === "group-header") {
    return (
      <div className="flex items-start justify-between gap-4 border-b border-[var(--rootsy-bruma-100)] px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="min-w-0 pl-2 sm:pl-3">
          <p className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">
            {row.label}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-[var(--rootsy-bruma-500)]">
            {row.prefix}
          </p>
        </div>
        <IncomeStatementAmount amount={row.total} className="font-semibold" />
      </div>
    )
  }

  if (row.kind === "account") {
    if (!showGroupAccounts) return null

    return (
      <div className="flex items-start justify-between gap-4 border-b border-[var(--rootsy-bruma-100)] px-4 py-2 sm:px-6 lg:px-8">
        <div className="min-w-0 pl-6 sm:pl-10">
          <p
            className={cn(
              "text-sm",
              workspaceTableNatureTextSecondaryClass,
            )}
          >
            {row.line.accountName}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-[var(--rootsy-bruma-500)]">
            {row.line.accountCode}
          </p>
        </div>
        <IncomeStatementAmount amount={row.line.balance} />
      </div>
    )
  }

  if (row.kind === "section-total") {
    return (
      <div className="flex items-center justify-between gap-4 border-b-2 border-[var(--rootsy-bruma-200)] bg-[color-mix(in_srgb,var(--rootsy-bruma-100)_55%,white)] px-4 py-2.5 sm:px-6 lg:px-8">
        <p className="pl-2 text-sm font-semibold text-[var(--rootsy-bruma-900)] sm:pl-3">
          {row.label}
        </p>
        <IncomeStatementAmount amount={row.total} className="font-semibold" />
      </div>
    )
  }

  return (
    <div className="mx-4 mt-4 rounded-xl border border-[color-mix(in_srgb,var(--rootsy-savia-600)_25%,var(--rootsy-bruma-200))] bg-[color-mix(in_srgb,var(--rootsy-savia-600)_6%,white)] px-4 py-4 sm:mx-6 lg:mx-8">
      <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 text-center">
        <p className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">
          {row.label}
        </p>
        <IncomeStatementAmount
          amount={row.total}
          className="text-base font-bold"
        />
      </div>
    </div>
  )
}

export function IncomeStatementReportView({
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
  const [data, setData] = useState<IncomeStatementResult | null>(null)
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
    const res = await getAccountingIncomeStatement(popId, from, to)
    setLoading(false)
    if (res.success) {
      setData(res.data)
      return
    }
    setData(null)
    setError(res.error)
  }, [popId, from, to])

  useEffect(() => {
    void load()
  }, [load])

  const displayRows = useMemo(
    () => (data ? buildIncomeStatementDisplayRows(data) : []),
    [data],
  )

  const showGroupAccounts = useMemo(
    () =>
      displayRows.some(
        (row) => row.kind === "group-header" || row.kind === "account",
      ) &&
      displayRows.some((row) => row.kind === "account"),
    [displayRows],
  )

  const exportDocument = useCallback(
    async (format: "csv" | "pdf", context: ReportExportContext) => {
      await exportIncomeStatementReportDocument(displayRows, format, {
        periodLabel: exportPeriodLabel,
        exportContext: context,
        timeZone,
        resultadoNeto: data?.resultadoNeto ?? 0,
      })
    },
    [data?.resultadoNeto, displayRows, exportPeriodLabel, timeZone],
  )

  const { exportBusy, exportError, handleExport } = useReportDocumentExport({
    popId,
    disabled: loading || !data || !hasIncomeStatementMovement(data),
    emptyMessage: "No hay movimientos para exportar en este período.",
    exportFn: exportDocument,
  })

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div className="flex min-h-full flex-1 flex-col gap-6 px-4 pt-6 pb-0 sm:px-6 lg:px-8">
        <ReportDetailHeaderCard
          eyebrow="Reporte de gestión"
          title="Estado de resultados"
          icon={TrendingUp}
          onBack={onBack}
          preset={preset}
          customRange={customRange}
          bounds={bounds}
          onPresetChange={onPresetChange}
          onCustomRangeChange={onCustomRangeChange}
          stats={
            <>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Ingresos</p>
                <ReportStatValue loading={loading}>
                  {formatReportMoneyAr(data?.totalIngresos ?? 0)}
                </ReportStatValue>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Costos</p>
                <ReportStatValue loading={loading}>
                  {formatReportMoneyAr(data?.totalCostos ?? 0)}
                </ReportStatValue>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Gastos</p>
                <ReportStatValue loading={loading}>
                  {formatReportMoneyAr(data?.totalGastos ?? 0)}
                </ReportStatValue>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Resultado neto</p>
                <ReportStatValue loading={loading}>
                  {formatReportMoneyAr(data?.resultadoNeto ?? 0)}
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
            disabled={loading || !data || !hasIncomeStatementMovement(data)}
            exportBusy={exportBusy}
            exportError={exportError}
            onExport={handleExport}
          />

          {error ? (
            <div
              role="alert"
              className="mx-4 mt-4 rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:mx-6 lg:mx-8"
            >
              {error}
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-auto py-4">
            {loading ? (
              <div
                className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10"
                aria-busy="true"
              >
                <RootsSpinner size="default" label="Cargando estado de resultados" />
                <p className="text-sm text-rootsy-bruma-500">
                  Cargando estado de resultados…
                </p>
              </div>
            ) : !data || !hasIncomeStatementMovement(data) ? (
              <DataWorkspaceDetailEmptyState
                icon={TrendingUp}
                title="Sin movimientos en el período"
                className="min-h-52"
              />
            ) : (
              <div className="space-y-0">
                {displayRows.map((row, index) => {
                  if (row.kind === "result-total") {
                    return (
                      <div key="result-total">
                        <IncomeStatementRowView
                          row={row}
                          showGroupAccounts={showGroupAccounts}
                        />
                        <p
                          className={cn(
                            dataWorkspaceDetailEmptyStateDescriptionClass,
                            "mx-4 mt-3 text-center sm:mx-6 lg:mx-8",
                          )}
                        >
                          Movimientos del período en cuentas de resultados. Resultado
                          neto = ingresos − costos − gastos.
                        </p>
                      </div>
                    )
                  }

                  const key =
                    row.kind === "section-header"
                      ? `section-${row.section}`
                      : row.kind === "group-header"
                        ? `group-${row.section}-${row.prefix}`
                        : row.kind === "account"
                          ? `account-${row.line.accountCode}`
                          : `total-${row.section}`

                  return (
                    <IncomeStatementRowView
                      key={`${key}-${index}`}
                      row={row}
                      showGroupAccounts={showGroupAccounts}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
