"use client"

import type { AttendancePunchRow } from "@/app/[siteId]/[popId]/hr/hrTypes"
import { DataWorkspacePeriodFilter } from "@/components/data-workspace/DataWorkspacePeriodFilter"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import {
  dataWorkspaceDetailFlushBottomCardClass,
  dataWorkspaceDetailToolbarClass,
  dataWorkspaceEntityCardStatusOpenClass,
  workspaceTableLayoutClassName,
  workspaceTableNatureMoneyClass,
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  workspaceTableLayoutBodyCellClass,
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
import {
  formatPopTime,
  isoTimestampInDateBounds,
} from "@/lib/popTimezone"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { cn } from "@/lib/utils"
import { History } from "lucide-react"
import { useMemo } from "react"
import type { DateRange } from "react-day-picker"
import "@/components/layouts-tables/rootsLayoutsTablesScope.css"

type Props = {
  punches: AttendancePunchRow[]
  datePreset: DataWorkspaceDatePreset
  customDateRange: DateRange | undefined
  dateBounds: { from: string | null; to: string | null }
  onPresetChange: (preset: DataWorkspaceDatePreset) => void
  onCustomRangeChange: (range: DateRange | undefined) => void
}

export function formatAttendanceDuration(ms: number): string {
  const safe = Math.max(0, ms)
  const totalMin = Math.round(safe / 60_000)
  const hours = Math.floor(totalMin / 60)
  const minutes = totalMin % 60
  if (hours === 0 && minutes === 0) return "0 m"
  if (hours === 0) return `${minutes} m`
  if (minutes === 0) return `${hours} h`
  return `${hours} h ${minutes} m`
}

export function punchDurationMs(
  punch: AttendancePunchRow,
  nowMs = Date.now(),
): number | null {
  const start = new Date(punch.clockedInAt).getTime()
  if (!Number.isFinite(start)) return null
  const end = punch.clockedOutAt
    ? new Date(punch.clockedOutAt).getTime()
    : nowMs
  if (!Number.isFinite(end)) return null
  return Math.max(0, end - start)
}

function formatPunchDay(iso: string, timeZone: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone,
  }).format(date)
}

export function HrPersonAttendancePanel({
  punches,
  datePreset,
  customDateRange,
  dateBounds,
  onPresetChange,
  onCustomRangeChange,
}: Props) {
  const timeZone = usePopTimeZone()
  const nowMs = Date.now()
  const filtered = useMemo(
    () =>
      punches.filter((punch) =>
        isoTimestampInDateBounds(
          punch.clockedInAt,
          dateBounds.from,
          dateBounds.to,
          timeZone,
        ),
      ),
    [punches, dateBounds.from, dateBounds.to, timeZone],
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
          {filtered.length}{" "}
          {filtered.length === 1 ? "jornada" : "jornadas"} en el período
        </p>
      </div>

      {filtered.length === 0 ? (
        <DataWorkspaceDetailEmptyState
          icon={History}
          title="Sin marcas en este período"
          description="Cuando marquen llegada y salida, van a aparecer acá."
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
          <Table className={cn(workspaceTableLayoutClassName, "min-w-[36rem]")}>
            <WorkspaceTableHeader>
              <WorkspaceTableHeaderRow>
                <WorkspaceTableHead
                  tone="nature"
                  className={cn("min-w-40", workspaceTableLayoutHeaderHeadClass)}
                >
                  Día
                </WorkspaceTableHead>
                <WorkspaceTableHead
                  tone="nature"
                  className={cn("w-28", workspaceTableLayoutHeaderHeadClass)}
                >
                  Llegó
                </WorkspaceTableHead>
                <WorkspaceTableHead
                  tone="nature"
                  className={cn("w-36", workspaceTableLayoutHeaderHeadClass)}
                >
                  Salió
                </WorkspaceTableHead>
                <WorkspaceTableHead
                  tone="nature"
                  align="right"
                  className={cn("w-28", workspaceTableLayoutHeaderHeadClass)}
                >
                  Horas
                </WorkspaceTableHead>
              </WorkspaceTableHeaderRow>
            </WorkspaceTableHeader>
            <TableBody>
              {filtered.map((punch, index) => {
                const open = punch.clockedOutAt == null
                const duration = punchDurationMs(punch, nowMs)
                return (
                  <WorkspaceTableBodyRow
                    key={punch.id}
                    index={index}
                    noHover
                    className={
                      open
                        ? "sticky top-0 z-10 !bg-[color-mix(in_srgb,var(--rootsy-savia-600)_10%,white)] shadow-[0_1px_0_0_var(--wt-border)]"
                        : undefined
                    }
                  >
                    <TableCell className={workspaceTableLayoutBodyCellClass}>
                      <span
                        className={cn(
                          "capitalize",
                          workspaceTableNatureTextPrimaryClass,
                        )}
                      >
                        {formatPunchDay(punch.clockedInAt, timeZone)}
                      </span>
                    </TableCell>
                    <TableCell className={workspaceTableLayoutBodyCellClass}>
                      <span className={cn("tabular-nums", workspaceTableNatureMoneyClass)}>
                        {formatPopTime(punch.clockedInAt, timeZone) || "—"}
                      </span>
                    </TableCell>
                    <TableCell className={workspaceTableLayoutBodyCellClass}>
                      {open ? (
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
                          En el local
                        </span>
                      ) : (
                        <span className={cn("tabular-nums", workspaceTableNatureMoneyClass)}>
                          {formatPopTime(punch.clockedOutAt ?? "", timeZone) || "—"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell
                      className={cn(workspaceTableLayoutBodyCellClass, "text-right")}
                    >
                      <span
                        className={cn(
                          "tabular-nums",
                          open
                            ? workspaceTableNatureTextSecondaryClass
                            : workspaceTableNatureMoneyClass,
                        )}
                      >
                        {duration == null ? "—" : formatAttendanceDuration(duration)}
                      </span>
                    </TableCell>
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
