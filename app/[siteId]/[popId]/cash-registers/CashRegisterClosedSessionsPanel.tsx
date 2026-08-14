"use client"

import type { CashRegisterSummarySession } from "@/app/[siteId]/[popId]/cash-registers/actions"
import { filterSessionsForArqueoTable } from "@/app/[siteId]/[popId]/cash-registers/cashRegisterDetailUtils"
import {
  arqueoDifferenceToneClass,
  formatArqueoDifferenceDisplay,
  formatCashRegisterDateTime,
  formatCashRegisterMoney,
  type ArqueoDifferenceTone,
} from "@/app/[siteId]/[popId]/cash-registers/cashRegisterFormatters"
import { DataWorkspacePeriodFilter } from "@/components/data-workspace/DataWorkspacePeriodFilter"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import {
  dataWorkspaceDetailFlushBottomCardClass,
  dataWorkspaceDetailToolbarClass,
  dataWorkspaceEntityCardStatusOpenClass,
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
  workspaceTableLayoutListSurfaceClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { workspaceLayoutsTablesScopeClass } from "@/components/layouts-tables/rootsLayoutsTablesProductStyles"
import {
  WorkspaceTableBodyRow,
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { Table, TableBody, TableCell } from "@/components/ui/table"
import type { DataWorkspaceDatePreset } from "@/lib/dataWorkspaceDateFilter"
import { cn } from "@/lib/utils"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { History } from "lucide-react"
import { useMemo, type ReactNode } from "react"
import type { DateRange } from "react-day-picker"
import "@/components/layouts-tables/rootsLayoutsTablesScope.css"

type Props = {
  sessions: CashRegisterSummarySession[]
  datePreset: DataWorkspaceDatePreset
  customDateRange: DateRange | undefined
  dateBounds: { from: string | null; to: string | null }
  operationalDayCloseTime?: string
  onPresetChange: (preset: DataWorkspaceDatePreset) => void
  onCustomRangeChange: (range: DateRange | undefined) => void
  onViewArqueo: (sessionId: string) => void
}

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

export function CashRegisterClosedSessionsPanel({
  sessions,
  datePreset,
  customDateRange,
  dateBounds,
  operationalDayCloseTime,
  onPresetChange,
  onCustomRangeChange,
  onViewArqueo,
}: Props) {
  const timeZone = usePopTimeZone()
  const filteredSessions = useMemo(
    () =>
      filterSessionsForArqueoTable(
        sessions,
        dateBounds.from,
        dateBounds.to,
        timeZone,
        operationalDayCloseTime,
      ),
    [
      sessions,
      dateBounds.from,
      dateBounds.to,
      timeZone,
      operationalDayCloseTime,
    ],
  )

  return (
    <article className={dataWorkspaceDetailFlushBottomCardClass}>
      <div className={dataWorkspaceDetailToolbarClass}>
        <DataWorkspacePeriodFilter
          variant="compact"
          showActiveState={false}
          preset={datePreset}
          customRange={customDateRange}
          onPresetChange={onPresetChange}
          onCustomRangeChange={onCustomRangeChange}
          bounds={dateBounds}
        />
        <p className={cn("text-xs lg:text-right", workspaceTableNatureTextSecondaryClass)}>
          {filteredSessions.length}{" "}
          {filteredSessions.length === 1 ? "arqueo" : "arqueos"} en el período
        </p>
      </div>

      {filteredSessions.length === 0 ? (
        <DataWorkspaceDetailEmptyState
          icon={History}
          title="Sin arqueos en este período"
        />
      ) : (
        <div
          className={cn(
            "min-h-0 flex-1 overflow-x-auto",
            workspaceLayoutsTablesScopeClass,
            workspaceTableLayoutListSurfaceClass,
            workspaceTableLayoutListBodyScopeClass,
          )}
        >
          <Table className={cn(workspaceTableLayoutClassName, "min-w-[45rem]")}>
                <WorkspaceTableHeader>
                  <WorkspaceTableHeaderRow>
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
                  {filteredSessions.map((session, index) => {
                    const isOpenSession = session.status === "open"
                    const difference = formatArqueoDifferenceDisplay(
                      session.cashArqueoDifference,
                    )
                    const arqueoLabel =
                      session.arqueoNumber > 0
                        ? `#${session.arqueoNumber}`
                        : "—"

                    return (
                      <WorkspaceTableBodyRow
                        key={session.id}
                        index={index}
                        noHover={false}
                        role="button"
                        tabIndex={0}
                        aria-label={`Ver arqueo ${arqueoLabel}`}
                        onClick={() => onViewArqueo(session.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault()
                            onViewArqueo(session.id)
                          }
                        }}
                        className={cn(
                          "cursor-pointer",
                          isOpenSession &&
                            "sticky top-0 z-10 !bg-[color-mix(in_srgb,var(--rootsy-savia-600)_10%,white)] shadow-[0_1px_0_0_var(--wt-border)] hover:!bg-[color-mix(in_srgb,var(--rootsy-savia-600)_14%,white)]",
                        )}
                      >
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
                              session.openedAt,
                              timeZone,
                            )}
                            secondary={session.openedByName ?? "—"}
                          />
                        </TableCell>
                        <TableCell className={workspaceTableLayoutBodyCellClass}>
                          <SessionMomentCell
                            primary={
                              isOpenSession ? (
                                <span
                                  className={cn(
                                    dataWorkspaceEntityCardStatusOpenClass,
                                    "px-2 py-0.5",
                                  )}
                                >
                                  <span
                                    className="size-1.5 rounded-full bg-[var(--rootsy-savia-600)]"
                                    aria-hidden
                                  />
                                  En curso
                                </span>
                              ) : session.closedAt ? (
                                formatCashRegisterDateTime(
                                  session.closedAt,
                                  timeZone,
                                )
                              ) : (
                                "—"
                              )
                            }
                            secondary={
                              isOpenSession ? "—" : (session.closedByName ?? "—")
                            }
                          />
                        </TableCell>
                        <ArqueoTableMoneyCell columnClass={arqueoTableTotalColumnClass}>
                          {formatCashRegisterMoney(session.totalCobrado)}
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
        </div>
      )}
    </article>
  )
}
