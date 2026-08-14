"use client"

import {
  getAccountingVatPosition,
  type VatPositionRow,
} from "@/app/[siteId]/[popId]/accounting/actions"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import { ReportDetailHeaderCard } from "@/components/reports/ReportDetailHeaderCard"
import {
  dataWorkspaceDetailEmptyStateDescriptionClass,
  dataWorkspaceDetailFlushBottomCardClass,
  dataWorkspaceEntityCardStatLabelClass,
  dataWorkspaceEntityCardStatValueLargeClass,
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
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import type { DataWorkspaceDatePreset } from "@/lib/dataWorkspaceDateFilter"
import { cn } from "@/lib/utils"
import { Receipt } from "lucide-react"
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

function sumVatTotals(rows: VatPositionRow[]) {
  return rows.reduce(
    (acc, row) => ({
      debit: acc.debit + row.sumDebit,
      credit: acc.credit + row.sumCredit,
      balance: acc.balance + row.balance,
    }),
    { debit: 0, credit: 0, balance: 0 },
  )
}

export function VatPositionReportView({
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
  const [rows, setRows] = useState<VatPositionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await getAccountingVatPosition(popId, from, to)
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

  const totals = useMemo(() => sumVatTotals(rows), [rows])

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div className="flex min-h-full flex-1 flex-col gap-6 px-4 pt-6 pb-0 sm:px-6 lg:px-8">
        <ReportDetailHeaderCard
          eyebrow="Reporte fiscal"
          title="Posición IVA"
          icon={Receipt}
          categoryId="fiscal"
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
                <p className={cn("mt-1.5", dataWorkspaceEntityCardStatValueLargeClass)}>
                  {loading ? "…" : formatReportMoneyAr(totals.debit)}
                </p>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Total haber</p>
                <p className={cn("mt-1.5", dataWorkspaceEntityCardStatValueLargeClass)}>
                  {loading ? "…" : formatReportMoneyAr(totals.credit)}
                </p>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Saldo neto</p>
                <p className={cn("mt-1.5", dataWorkspaceEntityCardStatValueLargeClass)}>
                  {loading ? "…" : formatReportMoneyAr(totals.balance)}
                </p>
              </div>
            </>
          }
        />

        <section className={cn(dataWorkspaceDetailFlushBottomCardClass, "flex min-h-0 flex-1 flex-col")}>
          <div className="border-b border-[var(--rootsy-bruma-200)] px-4 py-3 sm:px-6 lg:px-8">
            <p className={dataWorkspaceDetailEmptyStateDescriptionClass}>
              Movimientos del período en cuentas{" "}
              <span className="font-mono text-[11px]">1.1.2.*</span> y{" "}
              <span className="font-mono text-[11px]">2.1.2.*</span>. Validá la
              liquidación con tu asesor fiscal.
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

          <div className="min-h-0 flex-1 overflow-auto">
            {loading ? (
              <div
                className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10"
                aria-busy="true"
              >
                <RootsSpinner size="default" label="Cargando posición IVA" />
                <p className="text-sm text-rootsy-bruma-500">Cargando posición IVA…</p>
              </div>
            ) : rows.length === 0 ? (
              <DataWorkspaceDetailEmptyState
                icon={Receipt}
                title="Sin cuentas IVA en el período"
                description="No hay movimientos publicados en cuentas fiscales para este rango."
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
                          <span
                            className={cn(
                              workspaceTableLayoutCellPrimaryTextClass,
                              workspaceTableNatureTextSecondaryClass,
                            )}
                          >
                            {row.accountName}
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
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
