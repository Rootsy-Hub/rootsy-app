"use client"

import {
  getAccountingLedgerForAccount,
  type AccountNature,
  type LedgerMovementRow,
} from "@/app/[siteId]/[popId]/accounting/actions"
import { useTreasuryInfiniteScroll } from "@/app/[siteId]/[popId]/accounts/treasuryInfiniteScroll"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import { ReportStatValue } from "@/components/reports/ReportStatValue"
import { ReportDetailHeaderCard } from "@/components/reports/ReportDetailHeaderCard"
import { ReportExportActionButtons } from "@/components/reports/ReportExportActionButtons"
import type { SalesReportExportFormat } from "@/components/reports/SalesReportDownloadMenu"
import { LedgerAccountSearchField } from "@/components/reports/LedgerAccountSearchField"
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
  workspaceTableLayoutListEndFooterClass,
  workspaceTableLayoutListEndFooterDividerClass,
  workspaceTableLayoutListLoadingMoreClass,
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
import { type DataWorkspaceDatePreset } from "@/lib/dataWorkspaceDateFilter"
import {
  formatRootsFormDisplayDateCompact,
  parseRootsFormIsoDate,
} from "@/lib/rootsFormDateFormat"
import { useReportDocumentExport } from "@/hooks/useReportDocumentExport"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { exportLedgerReportDocument } from "@/lib/inlineReportsExport"
import type { ReportExportContext } from "@/lib/reportExportContext"
import {
  formatReportExportPeriodLabel,
  formatReportMoneyAr,
  formatReportPeriodSummary,
} from "@/lib/reportFormatters"
import { cn } from "@/lib/utils"
import { BookOpen } from "lucide-react"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
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

const LEDGER_VISIBLE_PAGE_SIZE = 40

function formatLedgerEntryDate(iso: string): string {
  const date = parseRootsFormIsoDate(iso)
  return date ? formatRootsFormDisplayDateCompact(date) : iso
}

function formatAccountNature(nature: AccountNature): string {
  return nature === "acreedora" ? "Acreedora" : "Deudora"
}

function sumLedgerTotals(rows: LedgerMovementRow[]) {
  return rows.reduce(
    (acc, row) => ({
      debit: acc.debit + row.debitAmount,
      credit: acc.credit + row.creditAmount,
    }),
    { debit: 0, credit: 0 },
  )
}

export function LedgerReportView({
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
  const [accountCode, setAccountCode] = useState("")
  const [rows, setRows] = useState<LedgerMovementRow[]>([])
  const [accountName, setAccountName] = useState("")
  const [accountNature, setAccountNature] = useState<AccountNature | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRootRef = useRef<HTMLDivElement | null>(null)
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null)

  const periodSummary = useMemo(
    () => formatReportPeriodSummary(preset, { from, to }),
    [preset, from, to],
  )

  const exportPeriodLabel = useMemo(
    () => formatReportExportPeriodLabel({ from, to }),
    [from, to],
  )

  const trimmedCode = accountCode.trim()
  const hasAccountQuery = trimmedCode.length > 0

  useLayoutEffect(() => {
    setScrollRoot(scrollRootRef.current)
  }, [loading, hasAccountQuery, rows.length])

  const load = useCallback(async () => {
    if (!trimmedCode) {
      setRows([])
      setAccountName("")
      setAccountNature(null)
      setError(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const res = await getAccountingLedgerForAccount(popId, trimmedCode, from, to)
    setLoading(false)
    if (res.success) {
      setRows(res.rows)
      setAccountName(res.accountName)
      setAccountNature(res.nature)
      return
    }
    setRows([])
    setAccountName("")
    setAccountNature(null)
    setError(res.error)
  }, [popId, trimmedCode, from, to])

  useEffect(() => {
    void load()
  }, [load])

  const totals = useMemo(() => sumLedgerTotals(rows), [rows])
  const closingBalance = rows.length > 0 ? rows[rows.length - 1]!.runningBalance : 0

  const accountSummary = useMemo(() => {
    if (!hasAccountQuery || !accountName) return null
    const natureLabel = accountNature ? formatAccountNature(accountNature) : "—"
    return `${trimmedCode} · ${accountName} · Naturaleza ${natureLabel.toLowerCase()}`
  }, [accountName, accountNature, hasAccountQuery, trimmedCode])

  const { visibleItems, hasMore, sentinelRef } = useTreasuryInfiniteScroll(
    rows,
    scrollRoot,
    LEDGER_VISIBLE_PAGE_SIZE,
  )

  const loadedCountLabel = useMemo(() => {
    const count = rows.length
    return count === 1 ? "1 movimiento" : `${count.toLocaleString("es-AR")} movimientos`
  }, [rows.length])

  const exportDocument = useCallback(
    async (format: SalesReportExportFormat, context: ReportExportContext) => {
      await exportLedgerReportDocument(rows, format, {
        periodLabel: exportPeriodLabel,
        exportContext: context,
        timeZone,
        accountCode: trimmedCode,
        accountName,
      })
    },
    [accountName, exportPeriodLabel, rows, timeZone, trimmedCode],
  )

  const printDocument = useCallback(
    async (context: ReportExportContext) => {
      await exportLedgerReportDocument(rows, "print", {
        periodLabel: exportPeriodLabel,
        exportContext: context,
        timeZone,
        accountCode: trimmedCode,
        accountName,
      })
    },
    [accountName, exportPeriodLabel, rows, timeZone, trimmedCode],
  )

  const { exportBusy, exportError, handleExport, handlePrint } = useReportDocumentExport({
    popId,
    disabled: loading || !hasAccountQuery || rows.length === 0,
    emptyMessage: "Seleccioná una cuenta con movimientos para exportar.",
    exportFn: exportDocument,
    printFn: printDocument,
  })

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div className="flex min-h-full flex-1 flex-col gap-6 px-4 pt-6 pb-0 sm:px-6 lg:px-8">
        <ReportDetailHeaderCard
          eyebrow="Reporte de control"
          title="Mayor general"
          icon={BookOpen}
          onBack={onBack}
          preset={preset}
          customRange={customRange}
          bounds={bounds}
          onPresetChange={onPresetChange}
          onCustomRangeChange={onCustomRangeChange}
          stats={
            <>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Movimientos</p>
                <ReportStatValue loading={loading && hasAccountQuery}>
                  {!hasAccountQuery
                    ? "—"
                    : rows.length.toLocaleString("es-AR")}
                </ReportStatValue>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Total debe</p>
                <ReportStatValue loading={loading && hasAccountQuery}>
                  {!hasAccountQuery ? "—" : formatReportMoneyAr(totals.debit)}
                </ReportStatValue>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Total haber</p>
                <ReportStatValue loading={loading && hasAccountQuery}>
                  {!hasAccountQuery ? "—" : formatReportMoneyAr(totals.credit)}
                </ReportStatValue>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Saldo</p>
                <ReportStatValue loading={loading && hasAccountQuery}>
                  {!hasAccountQuery ? "—" : formatReportMoneyAr(closingBalance)}
                </ReportStatValue>
              </div>
            </>
          }
        />

        <section
          className={cn(
            dataWorkspaceDetailFlushBottomCardClass,
            "flex min-h-0 flex-1 flex-col overflow-visible",
          )}
        >
          <div className="relative z-30 border-b border-[var(--rootsy-bruma-200)] px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1 space-y-1">
              <p className={dataWorkspaceDetailEmptyStateDescriptionClass}>
                {periodSummary}
              </p>
              {accountSummary ? (
                <p className={dataWorkspaceDetailEmptyStateDescriptionClass}>
                  {accountSummary}
                </p>
              ) : null}
            </div>
            <div className="flex w-full justify-center lg:w-auto lg:shrink-0">
              <LedgerAccountSearchField
                popId={popId}
                accountCode={accountCode}
                onAccountCodeChange={setAccountCode}
                selectedAccountLabel={
                  accountName && trimmedCode
                    ? `${trimmedCode} · ${accountName}`
                    : null
                }
                className="w-full min-w-0 sm:max-w-[20rem]"
              />
            </div>
            <div className="flex flex-1 justify-end">
              <ReportExportActionButtons
                disabled={loading || !hasAccountQuery || rows.length === 0}
                busy={exportBusy}
                onExport={handleExport}
                onPrint={handlePrint}
              />
            </div>
          </div>
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

          <ReportTableScrollArea scrollRef={scrollRootRef}>
            {!hasAccountQuery ? (
              <DataWorkspaceDetailEmptyState
                icon={BookOpen}
                title="Indicá una cuenta"
                className="min-h-52"
              />
            ) : loading ? (
              <div
                className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10"
                aria-busy="true"
              >
                <RootsSpinner size="default" label="Cargando mayor general" />
                <p className="text-sm text-rootsy-bruma-500">Cargando mayor general…</p>
              </div>
            ) : rows.length === 0 && !error ? (
              <DataWorkspaceDetailEmptyState
                icon={BookOpen}
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
                        Fecha
                      </WorkspaceTableHead>
                      <WorkspaceTableHead className={workspaceTableLayoutHeaderHeadClass}>
                        N.º
                      </WorkspaceTableHead>
                      <WorkspaceTableHead className={workspaceTableLayoutHeaderHeadClass}>
                        Referencia
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
                    {visibleItems.map((row, index) => (
                      <WorkspaceTableBodyRow key={row.id} index={index}>
                        <TableCell className={workspaceTableLayoutBodyCellClass}>
                          <span
                            className={cn(
                              workspaceTableLayoutCellPrimaryTextClass,
                              workspaceTableNatureTextPrimaryClass,
                              "whitespace-nowrap",
                            )}
                          >
                            {formatLedgerEntryDate(row.entryDate)}
                          </span>
                        </TableCell>
                        <TableCell className={workspaceTableLayoutBodyCellClass}>
                          <span
                            className={cn(
                              workspaceTableLayoutCellPrimaryTextClass,
                              workspaceTableNatureTextPrimaryClass,
                              "tabular-nums",
                            )}
                          >
                            {row.entryNumber}
                          </span>
                        </TableCell>
                        <TableCell className={workspaceTableLayoutBodyCellClass}>
                          <span
                            className={cn(
                              workspaceTableLayoutCellPrimaryTextClass,
                              workspaceTableNatureTextSecondaryClass,
                              "line-clamp-2",
                            )}
                            title={row.entryDescription}
                          >
                            {row.entryDescription}
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
                            {row.debitAmount > 0
                              ? formatReportMoneyAr(row.debitAmount)
                              : "—"}
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
                            {row.creditAmount > 0
                              ? formatReportMoneyAr(row.creditAmount)
                              : "—"}
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
                            {formatReportMoneyAr(row.runningBalance)}
                          </span>
                        </TableCell>
                      </WorkspaceTableBodyRow>
                    ))}
                  </TableBody>
                </Table>
                <div ref={sentinelRef} className="h-px w-full" aria-hidden />
                {hasMore ? (
                  <div className={workspaceTableLayoutListLoadingMoreClass}>
                    <RootsSpinner size="xs" aria-hidden className="shrink-0" />
                    Cargando más movimientos…
                  </div>
                ) : rows.length > 0 ? (
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
                ) : null}
              </div>
            )}
          </ReportTableScrollArea>
        </section>
      </div>
    </div>
  )
}
