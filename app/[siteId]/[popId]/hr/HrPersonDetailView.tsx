"use client"

import {
  clockEmployeeIn,
  clockEmployeeOut,
  fetchHrEmployeeDetail,
  fetchHrPaymentContext,
  markEmployeeFranco,
  recordEmployeePayment,
  removeEmployeeFranco,
  rotateEmployeeClockPin,
  upsertPopEmployee,
} from "@/lib/rootsyApi/hrClient"
import { HrFrancoDialog } from "@/app/[siteId]/[popId]/hr/HrFrancoDialog"
import { HrPayDialog } from "@/app/[siteId]/[popId]/hr/HrPayDialog"
import { HrPersonDialog } from "@/app/[siteId]/[popId]/hr/HrPersonDialog"
import { HrPersonPaymentsPanel } from "@/app/[siteId]/[popId]/hr/HrPersonPaymentsPanel"
import {
  formatAttendanceDuration,
  HrPersonAttendancePanel,
  punchDurationMs,
} from "@/app/[siteId]/[popId]/hr/HrPersonAttendancePanel"
import type {
  AttendancePunchRow,
  DayMarkKind,
  EmployeePaymentRow,
  EmployeeRow,
  FrancoRow,
  UpsertEmployeeInput,
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
import { WorkspaceTableStatusBadge } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  RootsDefaultButton,
  RootsIconButton,
  rootsButtonCompactSizeClass,
} from "@/components/rootsy-button"
import { RootsConfirmDialog } from "@/components/rootsy-dialog"
import {
  computeDataWorkspaceDateBounds,
  type DataWorkspaceDatePreset,
} from "@/lib/dataWorkspaceDateFilter"
import { formatMoneyInputForField } from "@/lib/moneyInput"
import { isoTimestampInDateBounds, todayPopCalendarDate } from "@/lib/popTimezone"
import {
  buildPayPaymentOptions,
  type TreasuryPaymentOption,
} from "@/lib/treasuryPaymentOptions"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  DoorClosed,
  DoorOpen,
  Pencil,
  RefreshCw,
  UserRound,
} from "lucide-react"
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
  const [francos, setFrancos] = useState<FrancoRow[]>([])
  const [payments, setPayments] = useState<EmployeePaymentRow[]>([])
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [canManagePeople, setCanManagePeople] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clockBusy, setClockBusy] = useState(false)
  const [clockConfirmOpen, setClockConfirmOpen] = useState(false)
  const [pinBusy, setPinBusy] = useState(false)
  const [dayMarkKind, setDayMarkKind] = useState<DayMarkKind>("franco")
  const [francoOpen, setFrancoOpen] = useState(false)
  const [francoSaving, setFrancoSaving] = useState(false)
  const [francoError, setFrancoError] = useState<string | null>(null)
  const [francoBusyId, setFrancoBusyId] = useState<string | null>(null)
  const [personOpen, setPersonOpen] = useState(false)
  const [personSaving, setPersonSaving] = useState(false)
  const [personError, setPersonError] = useState<string | null>(null)
  const [payOpen, setPayOpen] = useState(false)
  const [paySaving, setPaySaving] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)
  const [payOptions, setPayOptions] = useState<TreasuryPaymentOption[]>([])
  const [payOptionsLoading, setPayOptionsLoading] = useState(false)
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
    const res = await fetchHrEmployeeDetail(popId, employeeId)
    if (!opts?.silent) setLoading(false)
    if (!res.success) {
      if (!opts?.silent) {
        setEmployee(null)
        setPunches([])
        setFrancos([])
        setPayments([])
      }
      setError(res.error)
      return
    }
    setEmployee(res.employee)
    setPunches(res.punches)
    setFrancos(res.francos)
    setPayments(res.payments ?? [])
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

  const today = todayPopCalendarDate(timeZone)
  const todayMark = francos.find((franco) => franco.day === today)
  const todayIsFranco = todayMark?.kind === "franco"
  const todayIsFalta = todayMark?.kind === "falta"

  const periodPayments = useMemo(
    () =>
      payments.filter((payment) => {
        if (dateBounds.from && payment.paidAt < dateBounds.from) return false
        if (dateBounds.to && payment.paidAt > dateBounds.to) return false
        return true
      }),
    [payments, dateBounds.from, dateBounds.to],
  )

  const periodPaidLabel = useMemo(() => {
    if (periodPayments.length === 0) return "—"
    const total = periodPayments.reduce((sum, payment) => sum + payment.amount, 0)
    return salaryFmt.format(total)
  }, [periodPayments])

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
    setClockConfirmOpen(false)
    setError(null)
    await loadDetail({ silent: true })
  }

  async function handleRotatePin() {
    if (!employee || pinBusy || employee.leftAt) return
    setPinBusy(true)
    const res = await rotateEmployeeClockPin(popId, employee.id)
    setPinBusy(false)
    if (!res.success) {
      setError(res.error || "No se pudo generar un PIN.")
      return
    }
    setEmployee((current) =>
      current ? { ...current, clockPin: res.data.clockPin } : current,
    )
    setError(null)
  }

  async function handleMarkDay(day: string) {
    if (francoSaving) return
    setFrancoSaving(true)
    setFrancoError(null)
    const res = await markEmployeeFranco(popId, employeeId, day, dayMarkKind)
    setFrancoSaving(false)
    if (!res.success) {
      setFrancoError(
        res.error ||
          (dayMarkKind === "falta"
            ? "No se pudo marcar la falta."
            : "No se pudo marcar el franco."),
      )
      return
    }
    setFrancoOpen(false)
    await loadDetail({ silent: true })
  }

  async function handleSavePerson(input: UpsertEmployeeInput) {
    if (personSaving) return
    setPersonSaving(true)
    setPersonError(null)
    const res = await upsertPopEmployee(popId, { ...input, id: employeeId })
    setPersonSaving(false)
    if (!res.success) {
      setPersonError(res.error || "No se pudo guardar.")
      return
    }
    setPersonOpen(false)
    await loadDetail({ silent: true })
  }

  async function handleRemoveFranco(francoId: string) {
    if (francoBusyId) return
    setFrancoBusyId(francoId)
    const res = await removeEmployeeFranco(popId, employeeId, francoId)
    setFrancoBusyId(null)
    if (!res.success) {
      setError(res.error || "No se pudo sacar el franco.")
      return
    }
    await loadDetail({ silent: true })
  }

  async function openPayDialog() {
    setPayError(null)
    setPayOpen(true)
    setPayOptionsLoading(true)
    const res = await fetchHrPaymentContext(popId)
    setPayOptionsLoading(false)
    if (!res.success) {
      setPayOptions([])
      setPayError(res.error)
      return
    }
    setPayOptions(
      buildPayPaymentOptions(res.context).filter((option) => option.kind !== "check"),
    )
  }

  async function handlePay(input: {
    amount: number
    paidAt: string
    paymentKind: string
    treasuryAccountId: string
  }) {
    if (paySaving) return
    setPaySaving(true)
    setPayError(null)
    const res = await recordEmployeePayment(popId, employeeId, input)
    setPaySaving(false)
    if (!res.success) {
      setPayError(res.error || "No se pudo registrar el pago.")
      return
    }
    setPayOpen(false)
    await loadDetail({ silent: true })
  }

  const name = employee ? personDisplayName(employee) : ""
  const salary =
    employee?.monthlySalary == null
      ? "—"
      : salaryFmt.format(employee.monthlySalary)
  const showClock = Boolean(
    canManagePeople &&
      employee &&
      !employee.leftAt &&
      (employee.isClockedIn || !todayMark),
  )

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
                    ) : todayIsFranco ? (
                      <WorkspaceTableStatusBadge status="info">
                        Franco
                      </WorkspaceTableStatusBadge>
                    ) : todayIsFalta ? (
                      <WorkspaceTableStatusBadge status="vencido">
                        Falta
                      </WorkspaceTableStatusBadge>
                    ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                {canManagePeople && employee ? (
                  <RootsIconButton
                    theme="workspace"
                    emphasis="ghost"
                    size="default"
                    label="Editar datos"
                    onClick={() => {
                      setPersonError(null)
                      setPersonOpen(true)
                    }}
                  >
                    <Pencil aria-hidden />
                  </RootsIconButton>
                ) : null}
                {showClock ? (
                  <RootsDefaultButton
                    type="button"
                    size="compact"
                    disabled={clockBusy}
                    className={cn(
                      rootsButtonCompactSizeClass,
                      "shrink-0 gap-1.5 px-3 text-xs",
                    )}
                    onClick={() => {
                      setError(null)
                      setClockConfirmOpen(true)
                    }}
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
            </div>
            <div className={cn(dataWorkspaceDetailCardStatsClass, "sm:grid-cols-2 lg:grid-cols-4")}>
              {canManagePeople && employee && !employee.leftAt ? (
                <div className="min-w-[8.5rem]">
                  <p className={dataWorkspaceEntityCardStatLabelClass}>
                    PIN de fichaje
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <p
                      className={cn(
                        dataWorkspaceEntityCardStatValueLargeClass,
                        "font-numeric tracking-[0.18em]",
                      )}
                    >
                      {employee.clockPin || "—"}
                    </p>
                    <RootsIconButton
                      theme="workspace"
                      emphasis="ghost"
                      size="compact"
                      label="Nuevo PIN"
                      disabled={pinBusy}
                      onClick={() => void handleRotatePin()}
                    >
                      <RefreshCw aria-hidden />
                    </RootsIconButton>
                  </div>
                </div>
              ) : null}
              <HeaderKpi label="Sueldo" value={salary} />
              <HeaderKpi label="Pagado en el período" value={periodPaidLabel} />
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
          <HrPersonPaymentsPanel
            payments={payments}
            dateBounds={dateBounds}
            canManagePeople={canManagePeople}
            onPay={() => void openPayDialog()}
          />
        ) : null}

        {employee ? (
          <HrPersonAttendancePanel
            punches={punches}
            francos={francos}
            datePreset={datePreset}
            customDateRange={customDateRange}
            dateBounds={dateBounds}
            canManagePeople={canManagePeople && !employee.leftAt}
            francoBusyId={francoBusyId}
            onPresetChange={setDatePreset}
            onCustomRangeChange={setCustomDateRange}
            onMarkFranco={() => {
              setDayMarkKind("franco")
              setFrancoError(null)
              setFrancoOpen(true)
            }}
            onMarkFalta={() => {
              setDayMarkKind("falta")
              setFrancoError(null)
              setFrancoOpen(true)
            }}
            onRemoveFranco={(francoId) => void handleRemoveFranco(francoId)}
          />
        ) : null}

        <HrPersonDialog
          open={personOpen}
          person={employee}
          readOnly={!canManagePeople}
          saving={personSaving}
          error={personError}
          onOpenChange={(open) => {
            if (!open && personSaving) return
            setPersonOpen(open)
            if (!open) setPersonError(null)
          }}
          onSubmit={(input) => void handleSavePerson(input)}
        />

        <HrFrancoDialog
          open={francoOpen}
          kind={dayMarkKind}
          defaultDay={today}
          saving={francoSaving}
          error={francoError}
          onOpenChange={(open) => {
            if (!open && francoSaving) return
            setFrancoOpen(open)
            if (!open) setFrancoError(null)
          }}
          onSubmit={(day) => void handleMarkDay(day)}
        />

        <HrPayDialog
          open={payOpen}
          defaultDay={today}
          defaultAmount={
            employee?.monthlySalary == null
              ? ""
              : formatMoneyInputForField(employee.monthlySalary)
          }
          options={payOptions}
          loadingOptions={payOptionsLoading}
          saving={paySaving}
          error={payError}
          onOpenChange={(open) => {
            if (!open && paySaving) return
            setPayOpen(open)
            if (!open) setPayError(null)
          }}
          onSubmit={(input) => void handlePay(input)}
        />

        <RootsConfirmDialog
          open={clockConfirmOpen}
          onOpenChange={(open) => {
            if (!open && clockBusy) return
            setClockConfirmOpen(open)
          }}
          title={
            employee?.isClockedIn ? "Marcar salida" : "Marcar llegada"
          }
          description={
            employee
              ? employee.isClockedIn
                ? `¿${personDisplayName(employee)} sale del local ahora?`
                : `¿${personDisplayName(employee)} entra al local ahora?`
              : undefined
          }
          confirmLabel={employee?.isClockedIn ? "Salió" : "Llegó"}
          busy={clockBusy}
          busyConfirmLabel={
            employee?.isClockedIn ? "Marcando salida…" : "Marcando llegada…"
          }
          onConfirm={() => void handleClock()}
        />
      </div>
    </div>
  )
}
