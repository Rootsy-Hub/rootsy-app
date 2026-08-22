"use client"

import {
  clockEmployeeIn,
  clockEmployeeOut,
  getPopEmployeeDetail,
} from "@/app/[siteId]/[popId]/hr/employeeActions"
import {
  formatAttendanceDuration,
  HrPersonAttendancePanel,
  punchDurationMs,
} from "@/app/[siteId]/[popId]/hr/HrPersonAttendancePanel"
import type {
  AttendancePunchRow,
  EmployeeRow,
} from "@/app/[siteId]/[popId]/hr/hrTypes"
import {
  dataWorkspaceDetailCardClass,
  dataWorkspaceDetailCardHeaderClass,
  dataWorkspaceDetailCardStatsClass,
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardIsotypeClass,
  dataWorkspaceEntityCardStatLabelClass,
  dataWorkspaceEntityCardStatValueLargeClass,
  dataWorkspaceEntityCardStatusClosedClass,
  dataWorkspaceEntityCardStatusOpenClass,
  dataWorkspaceEntityCardTitleClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  RootsDefaultButton,
  RootsIconButton,
  rootsButtonCompactSizeClass,
} from "@/components/rootsy-button"
import {
  computeDataWorkspaceDateBounds,
  type DataWorkspaceDatePreset,
} from "@/lib/dataWorkspaceDateFilter"
import { isoTimestampInDateBounds } from "@/lib/popTimezone"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { cn } from "@/lib/utils"
import { ArrowLeft, DoorClosed, DoorOpen, UserRound } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { DateRange } from "react-day-picker"

const salaryFmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function personDisplayName(person: EmployeeRow): string {
  return `${person.firstName} ${person.lastName}`.trim() || "Sin nombre"
}

function personInitials(person: EmployeeRow): string {
  const first = (person.firstName || person.lastName || "?").slice(0, 1).toUpperCase()
  const last = person.lastName ? person.lastName.slice(0, 1).toUpperCase() : ""
  return `${first}${last}`.slice(0, 2)
}

function HeaderKpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[8.5rem]">
      <p className={dataWorkspaceEntityCardStatLabelClass}>{label}</p>
      <p className={cn("mt-1.5", dataWorkspaceEntityCardStatValueLargeClass)}>
        {value}
      </p>
    </div>
  )
}

type Props = {
  siteId: string
  popId: string
  employeeId: string
}

export function HrPersonDetailView({ siteId, popId, employeeId }: Props) {
  const timeZone = usePopTimeZone()
  const hrBasePath = `/${siteId}/${popId}/hr`
  const [employee, setEmployee] = useState<EmployeeRow | null>(null)
  const [punches, setPunches] = useState<AttendancePunchRow[]>([])
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [canManagePeople, setCanManagePeople] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clockBusy, setClockBusy] = useState(false)
  const [datePreset, setDatePreset] =
    useState<DataWorkspaceDatePreset>("this_month")
  const [customDateRange, setCustomDateRange] = useState<
    DateRange | undefined
  >(undefined)

  const dateBounds = useMemo(
    () => computeDataWorkspaceDateBounds(datePreset, customDateRange),
    [datePreset, customDateRange],
  )

  const loadDetail = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setLoading(true)
      setError(null)
    }
    const res = await getPopEmployeeDetail(popId, employeeId)
    if (!opts?.silent) setLoading(false)
    if (!res.success) {
      if (!opts?.silent) {
        setEmployee(null)
        setPunches([])
      }
      setError(res.error)
      return
    }
    setEmployee(res.employee)
    setPunches(res.punches)
    setImageUrl(res.imageUrl)
    setCanManagePeople(res.canManagePeople)
    setError(null)
  }, [employeeId, popId])

  useEffect(() => {
    void loadDetail()
  }, [loadDetail])

  const periodPunches = useMemo(
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

  const periodHoursLabel = useMemo(() => {
    const nowMs = Date.now()
    const totalMs = periodPunches.reduce((sum, punch) => {
      return sum + (punchDurationMs(punch, nowMs) ?? 0)
    }, 0)
    return periodPunches.length === 0 ? "—" : formatAttendanceDuration(totalMs)
  }, [periodPunches])

  async function handleClock() {
    if (!employee || clockBusy) return
    setClockBusy(true)
    const res = employee.isClockedIn
      ? await clockEmployeeOut(popId, employee.id)
      : await clockEmployeeIn(popId, employee.id)
    setClockBusy(false)
    if (!res.success) {
      setError(res.error || "No se pudo marcar.")
      return
    }
    await loadDetail({ silent: true })
  }

  const name = employee ? personDisplayName(employee) : ""
  const salary =
    employee?.monthlySalary == null
      ? "—"
      : salaryFmt.format(employee.monthlySalary)
  const showClock = Boolean(canManagePeople && employee && !employee.leftAt)

  return (
    <div className="relative flex w-full min-h-full flex-1 flex-col">
      <div className="relative flex w-full min-h-full flex-1 flex-col gap-6 px-4 pt-6 pb-0 sm:px-6 lg:px-8">
        {error && !employee ? (
          <div className="rounded-[1.375rem] border border-[color-mix(in_srgb,var(--color-status-danger)_25%,var(--rootsy-bruma-200))] bg-[color-mix(in_srgb,var(--color-status-danger)_6%,white)] px-4 py-3 font-canopy text-sm text-[var(--color-status-danger)]">
            {error}
          </div>
        ) : (
          <article className={cn("shrink-0", dataWorkspaceDetailCardClass)}>
            <div className={dataWorkspaceDetailCardHeaderClass}>
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <RootsIconButton
                  theme="workspace"
                  emphasis="ghost"
                  size="default"
                  label="Volver a RRHH"
                  href={hrBasePath}
                  className="shrink-0"
                >
                  <ArrowLeft aria-hidden />
                </RootsIconButton>
                {loading && !employee ? (
                  <div className="size-11 shrink-0 animate-pulse rounded-xl bg-[var(--rootsy-bruma-100)]" />
                ) : imageUrl ? (
                  <img
                    src={imageUrl}
                    alt=""
                    className={cn(dataWorkspaceEntityCardIsotypeClass, "object-cover")}
                  />
                ) : (
                  <span className={dataWorkspaceEntityCardIsotypeClass} aria-hidden>
                    {employee && personInitials(employee) ? (
                      <span className="font-canopy text-xs font-semibold">
                        {personInitials(employee)}
                      </span>
                    ) : (
                      <UserRound className="size-5" strokeWidth={1.75} />
                    )}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className={cn(dataWorkspaceEntityCardEyebrowClass, "truncate")}>
                    {employee?.jobTitle || "En el local"}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                    <h2
                      className={cn(
                        dataWorkspaceEntityCardTitleClass,
                        "truncate text-lg sm:text-xl",
                      )}
                    >
                      {loading && !employee ? "Cargando…" : name}
                    </h2>
                    {employee?.leftAt ? (
                      <span className={dataWorkspaceEntityCardStatusClosedClass}>
                        Ya no trabaja
                      </span>
                    ) : employee?.isClockedIn ? (
                      <span className={dataWorkspaceEntityCardStatusOpenClass}>
                        <span
                          className="size-1.5 rounded-full bg-[var(--rootsy-savia-600)]"
                          aria-hidden
                        />
                        En el local
                      </span>
                    ) : null}
                  </div>
                </div>
                {showClock ? (
                  <RootsDefaultButton
                    type="button"
                    size="sm"
                    disabled={clockBusy}
                    className={cn(
                      rootsButtonCompactSizeClass,
                      "shrink-0 gap-1.5 px-3 text-xs",
                    )}
                    onClick={() => void handleClock()}
                  >
                    {employee?.isClockedIn ? (
                      <DoorClosed className="size-3.5" aria-hidden />
                    ) : (
                      <DoorOpen className="size-3.5" aria-hidden />
                    )}
                    {employee?.isClockedIn ? "Salió" : "Llegó"}
                  </RootsDefaultButton>
                ) : null}
              </div>
            </div>
            <div className={cn(dataWorkspaceDetailCardStatsClass, "sm:grid-cols-3")}>
              <HeaderKpi label="Sueldo" value={salary} />
              <HeaderKpi label="Horas del período" value={periodHoursLabel} />
              <HeaderKpi
                label="Jornadas"
                value={
                  loading && !employee
                    ? "—"
                    : String(periodPunches.length)
                }
              />
            </div>
          </article>
        )}

        {error && employee ? (
          <div className="rounded-[1.375rem] border border-[color-mix(in_srgb,var(--color-status-danger)_25%,var(--rootsy-bruma-200))] bg-[color-mix(in_srgb,var(--color-status-danger)_6%,white)] px-4 py-3 font-canopy text-sm text-[var(--color-status-danger)]">
            {error}
          </div>
        ) : null}

        {employee ? (
          <HrPersonAttendancePanel
            punches={punches}
            datePreset={datePreset}
            customDateRange={customDateRange}
            dateBounds={dateBounds}
            onPresetChange={setDatePreset}
            onCustomRangeChange={setCustomDateRange}
          />
        ) : null}
      </div>
    </div>
  )
}
