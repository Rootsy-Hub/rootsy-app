"use client"

import {
  getAccountingCashFlow,
  type CashFlowRow,
} from "@/app/[siteId]/[popId]/accounting/actions"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
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
import {
  formatReportMoneyAr,
  formatReportPeriodSummary,
} from "@/lib/reportFormatters"
import type { DataWorkspaceDatePreset } from "@/lib/dataWorkspaceDateFilter"
import { cn } from "@/lib/utils"
import { Waves } from "lucide-react"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { useCallback, useEffect, useMemo, useState } from "react"
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

function sumCashFlowTotals(rows: CashFlowRow[]) {
  return rows.reduce(
    (acc, row) => ({
      entradas: acc.entradas + row.entradas,
      salidas: acc.salidas + row.salidas,
      neto: acc.neto + row.neto,
    }),
    { entradas: 0, salidas: 0, neto: 0 },
  )
}

export function CashFlowReportView({
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
  const [rows, setRows] = useState<CashFlowRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const periodSummary = useMemo(
    () => formatReportPeriodSummary(preset, { from, to }),
    [preset, from, to],
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await getAccountingCashFlow(popId, from, to)
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

  const totals = useMemo(() => sumCashFlowTotals(rows), [rows])

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div className="flex min-h-full flex-1 flex-col gap-6 px-4 pt-6 pb-0 sm:px-6 lg:px-8">
        <ReportDetailHeaderCard
          eyebrow="Reporte de gestión"
          title="Flujo de caja"
          icon={Waves}
          onBack={onBack}
          preset={preset}
          customRange={customRange}
          bounds={bounds}
          onPresetChange={onPresetChange}
          onCustomRangeChange={onCustomRangeChange}
          stats={
            <>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Entradas</p>
                <ReportStatValue loading={loading}>
                  {formatReportMoneyAr(totals.entradas)}
                </ReportStatValue>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Salidas</p>
                <ReportStatValue loading={loading}>
                  {formatReportMoneyAr(totals.salidas)}
                </ReportStatValue>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Flujo neto</p>
                <ReportStatValue loading={loading}>
                  {formatReportMoneyAr(totals.neto)}
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
          <div className="border-b border-[var(--rootsy-bruma-200)] px-4 py-3 sm:px-6 lg:px-8">
            <p className={dataWorkspaceDetailEmptyStateDescriptionClass}>
              {periodSummary}
            </p>
          </div>

          {error ? (
            <div
              role="alert"
              className="mx-4 mt-4 rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:mx-6 lg:mx-8"
            >
              {error}
            </div>
          ) : null}

          <ReportTableScrollArea className="py-4">
            {loading ? (
              <div
                className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10"
                aria-busy="true"
              >
                <RootsSpinner size="default" label="Cargando flujo de caja" />
                <p className="text-sm text-rootsy-bruma-500">Cargando flujo de caja…</p>
              </div>
            ) : rows.length === 0 ? (
              <DataWorkspaceDetailEmptyState
                icon={Waves}
                title="Sin movimientos de caja en el período"
                className="min-h-52"
              />
            ) : (
              <>
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
                        <WorkspaceTableHead
                          className={cn(workspaceTableLayoutHeaderHeadClass, "text-right")}
                        >
                          Entradas
                        </WorkspaceTableHead>
                        <WorkspaceTableHead
                          className={cn(workspaceTableLayoutHeaderHeadClass, "text-right")}
                        >
                          Salidas
                        </WorkspaceTableHead>
                        <WorkspaceTableHead
                          className={cn(workspaceTableLayoutHeaderHeadClass, "text-right")}
                        >
                          Neto
                        </WorkspaceTableHead>
                      </WorkspaceTableHeaderRow>
                    </WorkspaceTableHeader>
                    <TableBody>
                      {rows.map((row, index) => (
                        <WorkspaceTableBodyRow key={row.accountCode} index={index}>
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
                            <div className="min-w-0">
                              <span
                                className={cn(
                                  workspaceTableLayoutCellPrimaryTextClass,
                                  workspaceTableNatureTextSecondaryClass,
                                )}
                              >
                                {row.accountName}
                              </span>
                              {row.entityName ? (
                                <p className="mt-0.5 text-xs text-[var(--rootsy-bruma-500)]">
                                  {row.entityName}
                                </p>
                              ) : null}
                            </div>
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
                              {formatReportMoneyAr(row.entradas)}
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
                              {formatReportMoneyAr(row.salidas)}
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
                              {formatReportMoneyAr(row.neto)}
                            </span>
                          </TableCell>
                        </WorkspaceTableBodyRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mx-4 mt-4 rounded-xl border border-[color-mix(in_srgb,var(--rootsy-savia-600)_25%,var(--rootsy-bruma-200))] bg-[color-mix(in_srgb,var(--rootsy-savia-600)_6%,white)] px-4 py-4 sm:mx-6 lg:mx-8">
                  <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 text-center">
                    <p className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">
                      Flujo neto del período
                    </p>
                    <span
                      className={cn(
                        "text-base font-bold tabular-nums",
                        workspaceTableNatureMoneyClass,
                      )}
                    >
                      {formatReportMoneyAr(totals.neto)}
                    </span>
                  </div>
                </div>

                <p
                  className={cn(
                    dataWorkspaceDetailEmptyStateDescriptionClass,
                    "mx-4 mt-3 text-center sm:mx-6 lg:mx-8",
                  )}
                >
                  Movimientos del período en cuentas{" "}
                  <span className="font-mono text-[11px]">1.1.1.*</span> (caja y
                  equivalentes). Entradas = debe, salidas = haber, neto = variación del
                  saldo.
                </p>
              </>
            )}
          </ReportTableScrollArea>
        </section>
      </div>
    </div>
  )
}
