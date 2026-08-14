"use client"

import {
  getAccountingEntryLines,
  getAccountingJournalEntries,
  type JournalEntryLineRow,
  type JournalEntrySummaryRow,
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
  workspaceTableNatureTextTertiaryClass,
  workspaceTableLayoutClassName,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  workspaceTableLayoutActionsBodyCellClass,
  workspaceTableLayoutBodyCellClass,
  workspaceTableLayoutCellPrimaryTextClass,
  workspaceTableLayoutHeaderHeadClass,
  workspaceTableLayoutInsetTableShellClass,
  workspaceTableLayoutInsetTableClass,
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
import { RootsLinkButton } from "@/components/rootsy-button"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogErrorBanner,
  RootsDialogHeader,
  RootsDialogLoadingState,
} from "@/components/rootsy-dialog"
import { Dialog } from "@/components/ui/dialog"
import { Table, TableBody, TableCell } from "@/components/ui/table"
import { formatAccountingSourceType } from "@/lib/accountingSourceTypeLabels"
import { type DataWorkspaceDatePreset } from "@/lib/dataWorkspaceDateFilter"
import {
  formatRootsFormDisplayDateCompact,
  parseRootsFormIsoDate,
} from "@/lib/rootsFormDateFormat"
import {
  formatReportMoneyAr,
  formatReportPeriodSummary,
} from "@/lib/reportFormatters"
import { cn } from "@/lib/utils"
import { ScrollText } from "lucide-react"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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

const JOURNAL_PAGE_SIZE = 40

function formatJournalEntryDate(iso: string): string {
  const date = parseRootsFormIsoDate(iso)
  return date ? formatRootsFormDisplayDateCompact(date) : iso
}

function sumJournalTotals(entries: JournalEntrySummaryRow[]) {
  return entries.reduce(
    (acc, entry) => ({
      debit: acc.debit + entry.totalDebit,
      credit: acc.credit + entry.totalCredit,
    }),
    { debit: 0, credit: 0 },
  )
}

export function JournalReportView({
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
  const [entries, setEntries] = useState<JournalEntrySummaryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const scrollRootRef = useRef<HTMLDivElement | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const loadingMoreRef = useRef(false)

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailTitle, setDetailTitle] = useState("")
  const [detailLines, setDetailLines] = useState<JournalEntryLineRow[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  const periodSummary = useMemo(
    () => formatReportPeriodSummary(preset, { from, to }),
    [preset, from, to],
  )

  const load = useCallback(async () => {
    setLoading(true)
    setLoadingMore(false)
    loadingMoreRef.current = false
    setError(null)
    setHasMore(false)
    setTotalCount(null)
    const res = await getAccountingJournalEntries(popId, from, to, {
      limit: JOURNAL_PAGE_SIZE,
      offset: 0,
    })
    setLoading(false)
    if (res.success) {
      setEntries(res.entries)
      setHasMore(res.hasMore)
      setTotalCount(res.totalCount ?? res.entries.length)
      return
    }
    setEntries([])
    setError(res.error)
  }, [popId, from, to])

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore || loading) return
    loadingMoreRef.current = true
    setLoadingMore(true)
    const res = await getAccountingJournalEntries(popId, from, to, {
      limit: JOURNAL_PAGE_SIZE,
      offset: entries.length,
    })
    loadingMoreRef.current = false
    setLoadingMore(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    setEntries((prev) => [...prev, ...res.entries])
    setHasMore(res.hasMore)
  }, [popId, from, to, entries.length, hasMore, loading])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore || loading || loadingMore) return

    const observer = new IntersectionObserver(
      (observerEntries) => {
        if (observerEntries.some((entry) => entry.isIntersecting)) {
          void loadMore()
        }
      },
      { root: scrollRootRef.current, rootMargin: "160px" },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loadMore, loading, loadingMore])

  const totals = useMemo(() => sumJournalTotals(entries), [entries])

  const loadedCountLabel = useMemo(() => {
    const count = entries.length
    return count === 1 ? "1 asiento" : `${count.toLocaleString("es-AR")} asientos`
  }, [entries.length])

  const openEntryDetail = useCallback(
    async (entry: JournalEntrySummaryRow) => {
      setDetailOpen(true)
      setDetailTitle(
        `Asiento n.º ${entry.entryNumber} · ${formatJournalEntryDate(entry.entryDate)}`,
      )
      setDetailLoading(true)
      setDetailLines([])
      setDetailError(null)
      const res = await getAccountingEntryLines(popId, entry.id)
      setDetailLoading(false)
      if (res.success) {
        setDetailLines(res.lines)
        return
      }
      setDetailError(res.error)
    },
    [popId],
  )

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div className="flex min-h-full flex-1 flex-col gap-6 px-4 pt-6 pb-0 sm:px-6 lg:px-8">
        <ReportDetailHeaderCard
          eyebrow="Reporte de control"
          title="Libro diario"
          icon={ScrollText}
          onBack={onBack}
          preset={preset}
          customRange={customRange}
          bounds={bounds}
          onPresetChange={onPresetChange}
          onCustomRangeChange={onCustomRangeChange}
          stats={
            <>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Asientos</p>
                <p className={cn("mt-1.5", dataWorkspaceEntityCardStatValueLargeClass)}>
                  {loading
                    ? "…"
                    : totalCount != null
                      ? totalCount.toLocaleString("es-AR")
                      : entries.length.toLocaleString("es-AR")}
                </p>
              </div>
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

          <div ref={scrollRootRef} className="min-h-0 flex-1 overflow-auto">
            {loading ? (
              <div
                className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10"
                aria-busy="true"
              >
                <RootsSpinner size="default" label="Cargando libro diario" />
                <p className="text-sm text-rootsy-bruma-500">Cargando libro diario…</p>
              </div>
            ) : entries.length === 0 ? (
              <DataWorkspaceDetailEmptyState
                icon={ScrollText}
                title="Sin asientos en el período"
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
                        Descripción
                      </WorkspaceTableHead>
                      <WorkspaceTableHead className={workspaceTableLayoutHeaderHeadClass}>
                        Origen
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
                        className={cn(workspaceTableLayoutHeaderHeadClass, "w-[6.5rem]")}
                      />
                    </WorkspaceTableHeaderRow>
                  </WorkspaceTableHeader>
                  <TableBody>
                    {entries.map((entry, index) => (
                      <WorkspaceTableBodyRow key={entry.id} index={index}>
                        <TableCell className={workspaceTableLayoutBodyCellClass}>
                          <span
                            className={cn(
                              workspaceTableLayoutCellPrimaryTextClass,
                              workspaceTableNatureTextPrimaryClass,
                              "whitespace-nowrap",
                            )}
                          >
                            {formatJournalEntryDate(entry.entryDate)}
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
                            {entry.entryNumber}
                          </span>
                        </TableCell>
                        <TableCell className={workspaceTableLayoutBodyCellClass}>
                          <span
                            className={cn(
                              workspaceTableLayoutCellPrimaryTextClass,
                              workspaceTableNatureTextSecondaryClass,
                              "line-clamp-2",
                            )}
                            title={entry.description}
                          >
                            {entry.description}
                          </span>
                        </TableCell>
                        <TableCell className={workspaceTableLayoutBodyCellClass}>
                          <span
                            className={cn(
                              workspaceTableLayoutCellPrimaryTextClass,
                              workspaceTableNatureTextSecondaryClass,
                            )}
                          >
                            {formatAccountingSourceType(entry.sourceType)}
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
                            {formatReportMoneyAr(entry.totalDebit)}
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
                            {formatReportMoneyAr(entry.totalCredit)}
                          </span>
                        </TableCell>
                        <TableCell
                          className={cn(
                            workspaceTableLayoutActionsBodyCellClass,
                            "!pr-3",
                          )}
                        >
                          <div className="flex items-center justify-end">
                            <RootsLinkButton
                              type="button"
                              size="compact"
                              className="!h-auto !min-h-0 !justify-end !px-0"
                              onClick={() => void openEntryDetail(entry)}
                            >
                              Ver líneas
                            </RootsLinkButton>
                          </div>
                        </TableCell>
                      </WorkspaceTableBodyRow>
                    ))}
                  </TableBody>
                </Table>
                <div ref={sentinelRef} className="h-px w-full" aria-hidden />
                {loadingMore ? (
                  <div className={workspaceTableLayoutListLoadingMoreClass}>
                    <RootsSpinner size="xs" aria-hidden className="shrink-0" />
                    Cargando más asientos…
                  </div>
                ) : null}
                {!hasMore && !loading && entries.length > 0 ? (
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
          </div>
        </section>
      </div>

      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDetailOpen(false)
            setDetailError(null)
          }
        }}
      >
        <RootsDialogContent size="default" className="sm:max-w-lg">
          <RootsDialogHeader
            open={detailOpen}
            title="Líneas del asiento"
            description={detailTitle}
          />
          <RootsDialogBody>
            {detailError ? (
              <RootsDialogErrorBanner>{detailError}</RootsDialogErrorBanner>
            ) : null}
            {detailLoading ? (
              <RootsDialogLoadingState message="Cargando líneas del asiento" />
            ) : (
              <div
                className={cn(
                  workspaceLayoutsTablesScopeClass,
                  workspaceTableLayoutListBodyScopeClass,
                  workspaceTableLayoutInsetTableShellClass,
                )}
              >
                <table className={workspaceTableLayoutInsetTableClass}>
                  <WorkspaceTableHeader>
                    <WorkspaceTableHeaderRow>
                      <WorkspaceTableHead
                        tone="nature"
                        className={workspaceTableLayoutHeaderHeadClass}
                      >
                        Cuenta
                      </WorkspaceTableHead>
                      <WorkspaceTableHead
                        tone="nature"
                        className={cn(workspaceTableLayoutHeaderHeadClass, "text-right")}
                      >
                        Debe
                      </WorkspaceTableHead>
                      <WorkspaceTableHead
                        tone="nature"
                        className={cn(workspaceTableLayoutHeaderHeadClass, "text-right")}
                      >
                        Haber
                      </WorkspaceTableHead>
                    </WorkspaceTableHeaderRow>
                  </WorkspaceTableHeader>
                  <TableBody>
                    {detailLines.length === 0 && !detailError ? (
                      <WorkspaceTableBodyRow index={0} noHover>
                        <TableCell
                          colSpan={3}
                          className={cn(
                            workspaceTableLayoutBodyCellClass,
                            workspaceTableNatureTextSecondaryClass,
                          )}
                        >
                          Sin líneas.
                        </TableCell>
                      </WorkspaceTableBodyRow>
                    ) : (
                      detailLines.map((line, index) => (
                        <WorkspaceTableBodyRow
                          key={line.id}
                          index={index}
                          noHover={false}
                          className="!h-auto !max-h-none"
                        >
                          <TableCell
                            className={cn(
                              workspaceTableLayoutBodyCellClass,
                              "!h-auto !max-h-none whitespace-normal py-3",
                            )}
                          >
                            <span
                              className={cn(
                                "font-mono text-[11px]",
                                workspaceTableNatureTextTertiaryClass,
                              )}
                            >
                              {line.accountCode}
                            </span>{" "}
                            <span
                              className={cn(
                                workspaceTableLayoutCellPrimaryTextClass,
                                workspaceTableNatureTextPrimaryClass,
                              )}
                            >
                              {line.accountName}
                            </span>
                            {line.lineDescription ? (
                              <span
                                className={cn(
                                  "mt-0.5 block text-xs",
                                  workspaceTableNatureTextSecondaryClass,
                                )}
                              >
                                {line.lineDescription}
                              </span>
                            ) : null}
                          </TableCell>
                          <TableCell
                            className={cn(
                              workspaceTableLayoutBodyCellClass,
                              "!h-auto !max-h-none whitespace-normal py-3 text-right",
                            )}
                          >
                            <span
                              className={cn(
                                workspaceTableLayoutCellPrimaryTextClass,
                                workspaceTableNatureMoneyClass,
                              )}
                            >
                              {line.debitAmount > 0
                                ? formatReportMoneyAr(line.debitAmount)
                                : "—"}
                            </span>
                          </TableCell>
                          <TableCell
                            className={cn(
                              workspaceTableLayoutBodyCellClass,
                              "!h-auto !max-h-none whitespace-normal py-3 text-right",
                            )}
                          >
                            <span
                              className={cn(
                                workspaceTableLayoutCellPrimaryTextClass,
                                workspaceTableNatureMoneyClass,
                              )}
                            >
                              {line.creditAmount > 0
                                ? formatReportMoneyAr(line.creditAmount)
                                : "—"}
                            </span>
                          </TableCell>
                        </WorkspaceTableBodyRow>
                      ))
                    )}
                  </TableBody>
                </table>
              </div>
            )}
          </RootsDialogBody>
        </RootsDialogContent>
      </Dialog>
    </div>
  )
}
