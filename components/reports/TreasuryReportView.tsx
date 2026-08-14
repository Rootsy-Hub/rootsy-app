"use client"

import {
  getTreasuryPeriodReport,
  type TreasuryPeriodReportRow,
} from "@/app/[siteId]/[popId]/accounts/treasuryDetailActions"
import {
  TreasuryBrandIsotype,
  TreasuryBrandName,
} from "@/app/[siteId]/[popId]/accounts/TreasuryBrandMark"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import { ReportDetailHeaderCard } from "@/components/reports/ReportDetailHeaderCard"
import { ReportStatValue } from "@/components/reports/ReportStatValue"
import { ReportTableScrollArea } from "@/components/reports/ReportTableScrollArea"
import {
  dataWorkspaceDetailEmptyStateDescriptionClass,
  dataWorkspaceDetailFlushBottomCardClass,
  dataWorkspaceEntityCardEyebrowClass,
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
import type { DataWorkspaceDatePreset } from "@/lib/dataWorkspaceDateFilter"
import {
  formatReportMoneyAr,
  formatReportPeriodSummary,
} from "@/lib/reportFormatters"
import { resolveTreasuryAccountBrand } from "@/lib/treasuryAccountBrands"
import { treasuryKindLabel } from "@/lib/treasuryAccountKinds"
import { cn } from "@/lib/utils"
import { ArrowLeftRight } from "lucide-react"
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

const treasuryTableAccountColumnClass = "min-w-44"
const treasuryTableMoneyColumnClass = "w-32 min-w-32 max-w-32"

function formatOptionalReportMoney(value: number | null | undefined): string {
  if (value == null) return "—"
  return formatReportMoneyAr(value)
}

function computeTreasuryReportSummary(rows: TreasuryPeriodReportRow[]) {
  return rows.reduce(
    (acc, row) => ({
      accountCount: acc.accountCount + 1,
      closingBalance: acc.closingBalance + row.closingBalance,
      periodIn: acc.periodIn + row.periodIn,
      periodOut: acc.periodOut + row.periodOut,
    }),
    {
      accountCount: 0,
      closingBalance: 0,
      periodIn: 0,
      periodOut: 0,
    },
  )
}

function TreasuryReportMoneyCell({
  children,
  muted,
}: {
  children: string
  muted?: boolean
}) {
  return (
    <TableCell
      className={cn(
        workspaceTableLayoutBodyCellClass,
        treasuryTableMoneyColumnClass,
        "text-right",
      )}
    >
      <span
        className={cn(
          "block tabular-nums",
          muted
            ? cn("text-sm leading-4", workspaceTableNatureTextSecondaryClass)
            : workspaceTableNatureMoneyClass,
        )}
      >
        {children}
      </span>
    </TableCell>
  )
}

export function TreasuryReportView({
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
  const [rows, setRows] = useState<TreasuryPeriodReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const periodSummary = useMemo(
    () => formatReportPeriodSummary(preset, { from, to }),
    [preset, from, to],
  )

  const summary = useMemo(() => computeTreasuryReportSummary(rows), [rows])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setRows([])
    const res = await getTreasuryPeriodReport(popId, { from, to })
    setLoading(false)
    if (res.success) {
      setRows(res.data.rows)
      return
    }
    setError(res.error)
  }, [from, popId, to])

  useEffect(() => {
    void load()
  }, [load])

  const loadedCountLabel = useMemo(() => {
    const count = rows.length
    return count === 1 ? "1 cuenta" : `${count.toLocaleString("es-AR")} cuentas`
  }, [rows.length])

  const showSettlementColumns = useMemo(
    () =>
      rows.some(
        (row) => row.toLiquidateBalance != null || row.toPayBalance != null,
      ),
    [rows],
  )

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div className="flex min-h-full flex-1 flex-col gap-6 px-4 pt-6 pb-0 sm:px-6 lg:px-8">
        <ReportDetailHeaderCard
          eyebrow="Reporte de control"
          title="Cuentas y tesorería"
          icon={ArrowLeftRight}
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
                  {summary.accountCount.toLocaleString("es-AR")}
                </ReportStatValue>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>
                  Saldo al cierre
                </p>
                <ReportStatValue loading={loading}>
                  {formatReportMoneyAr(summary.closingBalance)}
                </ReportStatValue>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Ingresos</p>
                <ReportStatValue loading={loading}>
                  {formatReportMoneyAr(summary.periodIn)}
                </ReportStatValue>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Egresos</p>
                <ReportStatValue loading={loading}>
                  {formatReportMoneyAr(summary.periodOut)}
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
          <div className="border-b border-rootsy-bruma-200 px-4 py-3 sm:px-6 lg:px-8">
            <p className={dataWorkspaceDetailEmptyStateDescriptionClass}>
              {periodSummary}
            </p>
          </div>

          <ReportTableScrollArea>
            {loading ? (
              <div
                className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10"
                aria-busy="true"
              >
                <RootsSpinner size="default" label="Cargando cuentas" />
                <p className="text-sm text-rootsy-bruma-500">Cargando cuentas…</p>
              </div>
            ) : error ? (
              <div className="px-4 py-10 sm:px-6 lg:px-8">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            ) : rows.length === 0 ? (
              <DataWorkspaceDetailEmptyState
                icon={ArrowLeftRight}
                title="Sin cuentas de tesorería"
                description="Creá cuentas en el módulo de tesorería para ver saldos aquí."
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
                <Table
                  className={cn(
                    workspaceTableLayoutClassName,
                    showSettlementColumns ? "min-w-[64rem]" : "min-w-[44rem]",
                  )}
                >
                  <WorkspaceTableHeader>
                    <WorkspaceTableHeaderRow>
                      <WorkspaceTableHead
                        tone="nature"
                        className={cn(
                          treasuryTableAccountColumnClass,
                          workspaceTableLayoutHeaderHeadClass,
                        )}
                      >
                        Cuenta
                      </WorkspaceTableHead>
                      <WorkspaceTableHead
                        tone="nature"
                        align="right"
                        className={cn(
                          treasuryTableMoneyColumnClass,
                          workspaceTableLayoutHeaderHeadClass,
                        )}
                      >
                        Saldo inicial
                      </WorkspaceTableHead>
                      <WorkspaceTableHead
                        tone="nature"
                        align="right"
                        className={cn(
                          treasuryTableMoneyColumnClass,
                          workspaceTableLayoutHeaderHeadClass,
                        )}
                      >
                        Ingresos
                      </WorkspaceTableHead>
                      <WorkspaceTableHead
                        tone="nature"
                        align="right"
                        className={cn(
                          treasuryTableMoneyColumnClass,
                          workspaceTableLayoutHeaderHeadClass,
                        )}
                      >
                        Egresos
                      </WorkspaceTableHead>
                      <WorkspaceTableHead
                        tone="nature"
                        align="right"
                        className={cn(
                          treasuryTableMoneyColumnClass,
                          workspaceTableLayoutHeaderHeadClass,
                        )}
                      >
                        Saldo al cierre
                      </WorkspaceTableHead>
                      {showSettlementColumns ? (
                        <>
                          <WorkspaceTableHead
                            tone="nature"
                            align="right"
                            className={cn(
                              treasuryTableMoneyColumnClass,
                              workspaceTableLayoutHeaderHeadClass,
                            )}
                          >
                            A liquidar
                          </WorkspaceTableHead>
                          <WorkspaceTableHead
                            tone="nature"
                            align="right"
                            className={cn(
                              treasuryTableMoneyColumnClass,
                              workspaceTableLayoutHeaderHeadClass,
                            )}
                          >
                            A pagar
                          </WorkspaceTableHead>
                        </>
                      ) : null}
                    </WorkspaceTableHeaderRow>
                  </WorkspaceTableHeader>
                  <TableBody>
                    {rows.map((row, index) => {
                      const brand = resolveTreasuryAccountBrand({
                        kind: row.kind,
                        brandKey: row.brandKey,
                        name: row.name,
                      })

                      return (
                        <WorkspaceTableBodyRow
                          key={row.id}
                          index={index}
                          noHover
                        >
                          <TableCell className={workspaceTableLayoutBodyCellClass}>
                            <div className="flex min-w-0 items-start gap-2">
                              <TreasuryBrandIsotype
                                brandKey={brand?.key}
                                monogram={
                                  brand?.monogram ??
                                  (row.name.slice(0, 2).toUpperCase() || "—")
                                }
                                size="sm"
                              />
                              <div className="min-w-0">
                                <p className={dataWorkspaceEntityCardEyebrowClass}>
                                  {treasuryKindLabel(row.kind)}
                                  {!row.isActive ? " · Inactiva" : ""}
                                </p>
                                <TreasuryBrandName
                                  preset={brand}
                                  name={row.name}
                                  textClass={workspaceTableNatureTextPrimaryClass}
                                  className={cn(
                                    "mt-0.5 truncate font-medium",
                                    workspaceTableLayoutCellPrimaryTextClass,
                                  )}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TreasuryReportMoneyCell muted={row.openingBalance == null}>
                            {formatOptionalReportMoney(row.openingBalance)}
                          </TreasuryReportMoneyCell>
                          <TreasuryReportMoneyCell>
                            {formatReportMoneyAr(row.periodIn)}
                          </TreasuryReportMoneyCell>
                          <TreasuryReportMoneyCell>
                            {formatReportMoneyAr(row.periodOut)}
                          </TreasuryReportMoneyCell>
                          <TreasuryReportMoneyCell>
                            {formatReportMoneyAr(row.closingBalance)}
                          </TreasuryReportMoneyCell>
                          {showSettlementColumns ? (
                            <>
                              <TreasuryReportMoneyCell
                                muted={row.toLiquidateBalance == null}
                              >
                                {formatOptionalReportMoney(row.toLiquidateBalance)}
                              </TreasuryReportMoneyCell>
                              <TreasuryReportMoneyCell muted={row.toPayBalance == null}>
                                {formatOptionalReportMoney(row.toPayBalance)}
                              </TreasuryReportMoneyCell>
                            </>
                          ) : null}
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
