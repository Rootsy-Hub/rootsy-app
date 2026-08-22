"use client"

import type {
  AttendancePunchRow,
  DayMarkKind,
  FrancoRow,
} from "@/app/[siteId]/[popId]/hr/hrTypes"
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
import { WorkspaceTableStatusBadge } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { RootsDefaultButton, rootsButtonCompactSizeClass } from "@/components/rootsy-button"
import { Table, TableBody, TableCell } from "@/components/ui/table"
import type { DataWorkspaceDatePreset } from "@/lib/dataWorkspaceDateFilter"
import {
  formatPopTime,
  isoTimestampInDateBounds,
  toPopCalendarDate,
} from "@/lib/popTimezone"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { cn } from "@/lib/utils"
import { CalendarOff, History, UserX } from "lucide-react"
import { useMemo } from "react"
import type { DateRange } from "react-day-picker"
import "@/components/layouts-tables/rootsLayoutsTablesScope.css"

type Props = {
  punches: AttendancePunchRow[]
  francos: FrancoRow[]
  datePreset: DataWorkspaceDatePreset
  customDateRange: DateRange | undefined
  dateBounds: { from: string | null; to: string | null }
  canManagePeople: boolean
  francoBusyId?: string | null
  onPresetChange: (preset: DataWorkspaceDatePreset) => void
  onCustomRangeChange: (range: DateRange | undefined) => void
  onMarkFranco?: () => void
  onMarkFalta?: () => void
  onRemoveFranco?: (francoId: string) => void
}

type HistoryRow =
  | { kind: "punch"; id: string; day: string; punch: AttendancePunchRow }
  | { kind: "mark"; id: string; day: string; mark: FrancoRow }

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

function calendarDateInBounds(
  day: string,
  from: string | null,
  to: string | null,
): boolean {
  if (from && day < from) return false
  if (to && day > to) return false
  return true
}

function formatCalendarDay(isoDate: string, timeZone?: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    const [year, month, day] = isoDate.split("-").map(Number)
    if (!year || !month || !day) return isoDate
    return new Intl.DateTimeFormat("es-AR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(new Date(year, month - 1, day))
  }
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(timeZone ? { timeZone } : {}),
  }).format(date)
}

export function HrPersonAttendancePanel({
  punches,
  francos,
  datePreset,
  customDateRange,
  dateBounds,
  canManagePeople,
  francoBusyId = null,
  onPresetChange,
  onCustomRangeChange,
  onMarkFranco,
  onMarkFalta,
  onRemoveFranco,
}: Props) {
  const timeZone = usePopTimeZone()
  const nowMs = Date.now()

  const rows = useMemo(() => {
    const punchRows: HistoryRow[] = punches
      .filter((punch) =>
        isoTimestampInDateBounds(
          punch.clockedInAt,
          dateBounds.from,
          dateBounds.to,
          timeZone,
        ),
      )
      .map((punch) => ({
        kind: "punch" as const,
        id: punch.id,
        day: toPopCalendarDate(punch.clockedInAt, timeZone),
        punch,
      }))

    const markRows: HistoryRow[] = francos
      .filter((franco) =>
        calendarDateInBounds(franco.day, dateBounds.from, dateBounds.to),
      )
      .map((franco) => ({
        kind: "mark" as const,
        id: franco.id,
        day: franco.day,
        mark: franco,
      }))

    return [...punchRows, ...markRows].sort((a, b) => {
      if (a.day !== b.day) return a.day < b.day ? 1 : -1
      if (a.kind === b.kind) return 0
      return a.kind === "punch" ? -1 : 1
    })
  }, [punches, francos, dateBounds.from, dateBounds.to, timeZone])

  const jornadaCount = rows.filter((row) => row.kind === "punch").length
  const francoCount = rows.filter(
    (row) => row.kind === "mark" && row.mark.kind === "franco",
  ).length
  const faltaCount = rows.filter(
    (row) => row.kind === "mark" && row.mark.kind === "falta",
  ).length
  const showActions = canManagePeople && Boolean(onRemoveFranco)

  const summary = [
    `${jornadaCount} ${jornadaCount === 1 ? "jornada" : "jornadas"}`,
    `${francoCount} ${francoCount === 1 ? "franco" : "francos"}`,
    `${faltaCount} ${faltaCount === 1 ? "falta" : "faltas"}`,
  ].join(" · ")

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
        <div className="flex flex-wrap items-center justify-end gap-3">
          <p className={cn("text-xs", workspaceTableNatureTextSecondaryClass)}>
            {summary}
          </p>
          {canManagePeople && onMarkFranco ? (
            <RootsDefaultButton
              type="button"
              size="sm"
              className={cn(rootsButtonCompactSizeClass, "shrink-0 gap-1.5 px-3 text-xs")}
              onClick={onMarkFranco}
            >
              <CalendarOff className="size-3.5" aria-hidden />
              Franco
            </RootsDefaultButton>
          ) : null}
          {canManagePeople && onMarkFalta ? (
            <RootsDefaultButton
              type="button"
              size="sm"
              className={cn(rootsButtonCompactSizeClass, "shrink-0 gap-1.5 px-3 text-xs")}
              onClick={onMarkFalta}
            >
              <UserX className="size-3.5" aria-hidden />
              Falta
            </RootsDefaultButton>
          ) : null}
        </div>
      </div>

      {rows.length === 0 ? (
        <DataWorkspaceDetailEmptyState
          icon={History}
          title="Sin marcas en este período"
          description="Cuando marquen llegada, un franco o una falta, van a aparecer acá."
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
                {showActions ? (
                  <WorkspaceTableHead
                    tone="nature"
                    align="right"
                    className={cn("w-24", workspaceTableLayoutHeaderHeadClass)}
                  >
                    <span className="sr-only">Acciones</span>
                  </WorkspaceTableHead>
                ) : null}
              </WorkspaceTableHeaderRow>
            </WorkspaceTableHeader>
            <TableBody>
              {rows.map((row, index) => {
                if (row.kind === "mark") {
                  const markKind: DayMarkKind =
                    row.mark.kind === "falta" ? "falta" : "franco"
                  return (
                    <WorkspaceTableBodyRow key={row.id} index={index} noHover>
                      <TableCell className={workspaceTableLayoutBodyCellClass}>
                        <span
                          className={cn(
                            "capitalize",
                            workspaceTableNatureTextPrimaryClass,
                          )}
                        >
                          {formatCalendarDay(row.day)}
                        </span>
                      </TableCell>
                      <TableCell className={workspaceTableLayoutBodyCellClass}>
                        <WorkspaceTableStatusBadge
                          status={markKind === "falta" ? "vencido" : "info"}
                        >
                          {markKind === "falta" ? "Falta" : "Franco"}
                        </WorkspaceTableStatusBadge>
                      </TableCell>
                      <TableCell className={workspaceTableLayoutBodyCellClass}>
                        <span className={workspaceTableNatureTextSecondaryClass}>
                          —
                        </span>
                      </TableCell>
                      <TableCell
                        className={cn(workspaceTableLayoutBodyCellClass, "text-right")}
                      >
                        <span className={workspaceTableNatureTextSecondaryClass}>
                          —
                        </span>
                      </TableCell>
                      {showActions ? (
                        <TableCell
                          className={cn(workspaceTableLayoutBodyCellClass, "text-right")}
                        >
                          <button
                            type="button"
                            disabled={francoBusyId === row.id}
                            onClick={() => onRemoveFranco?.(row.id)}
                            className="font-canopy text-xs text-[var(--rootsy-bruma-500)] underline-offset-2 outline-none hover:text-[var(--rootsy-bruma-900)] hover:underline focus-visible:underline"
                          >
                            {francoBusyId === row.id ? "Sacando…" : "Quitar"}
                          </button>
                        </TableCell>
                      ) : null}
                    </WorkspaceTableBodyRow>
                  )
                }

                const open = row.punch.clockedOutAt == null
                const duration = punchDurationMs(row.punch, nowMs)
                return (
                  <WorkspaceTableBodyRow
                    key={row.id}
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
                        {formatCalendarDay(row.day, timeZone)}
                      </span>
                    </TableCell>
                    <TableCell className={workspaceTableLayoutBodyCellClass}>
                      <span className={cn("tabular-nums", workspaceTableNatureMoneyClass)}>
                        {formatPopTime(row.punch.clockedInAt, timeZone) || "—"}
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
                          {formatPopTime(row.punch.clockedOutAt ?? "", timeZone) || "—"}
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
                    {showActions ? (
                      <TableCell className={workspaceTableLayoutBodyCellClass} />
                    ) : null}
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
