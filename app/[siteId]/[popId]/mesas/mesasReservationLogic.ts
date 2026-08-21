import type {
  MesaOpenSessionInput,
  MesaReservation,
  MesaReservationStatus,
  MesaTable,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import {
  DEFAULT_OPERATIONAL_DAY_CLOSE_TIME,
  operationalDayKey,
} from "@/lib/popOperationalDay"

export const DEFAULT_MESAS_RESERVATION_FLOOR_BUFFER_MINUTES = 45
export const DEFAULT_MESAS_RESERVATION_GRACE_MINUTES = 20
/** Aviso en mesa abierta si la reserva entra en ventana dentro de este margen (ms). */
export const MESAS_RESERVATION_APPROACHING_LEAD_MS = 60 * 60_000

export type MesasReservationSettings = {
  floorBufferMinutes: number
  graceMinutes: number
}

export const ACTIVE_FLOOR_RESERVATION_STATUSES = new Set<MesaReservationStatus>([
  "pending",
  "confirmed",
])

export const AGENDA_RESERVATION_STATUSES = new Set<MesaReservationStatus>([
  "pending",
  "confirmed",
])

export function readMesasReservationSettings(
  popSettings?: Record<string, unknown> | null,
): MesasReservationSettings {
  const mesas =
    popSettings?.mesas &&
    typeof popSettings.mesas === "object" &&
    !Array.isArray(popSettings.mesas)
      ? (popSettings.mesas as Record<string, unknown>)
      : null

  const buffer = Number(mesas?.reservationFloorBufferMinutes)
  const grace = Number(mesas?.reservationGraceMinutes)

  return {
    floorBufferMinutes:
      Number.isFinite(buffer) && buffer >= 0
        ? Math.min(240, Math.round(buffer))
        : DEFAULT_MESAS_RESERVATION_FLOOR_BUFFER_MINUTES,
    graceMinutes:
      Number.isFinite(grace) && grace >= 0
        ? Math.min(120, Math.round(grace))
        : DEFAULT_MESAS_RESERVATION_GRACE_MINUTES,
  }
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function reservationFloorWindow(
  arrivalAt: string,
  settings: MesasReservationSettings,
): { start: Date; end: Date; arrival: Date } {
  const arrival = new Date(arrivalAt)
  return {
    arrival,
    start: new Date(
      arrival.getTime() - settings.floorBufferMinutes * 60_000,
    ),
    end: new Date(arrival.getTime() + settings.graceMinutes * 60_000),
  }
}

function formatFloorWindowInstant(instant: Date, referenceDay: Date): string {
  const includeDate = !isSameCalendarDay(instant, referenceDay)
  const day = instant.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
  const time = instant.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  return includeDate ? `${day} · ${time}` : time
}

function formatReservationCountdownDuration(ms: number): string {
  const mins = Math.floor(Math.max(0, ms) / 60_000)
  if (mins < 1) return "<1m"
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  const remMins = mins % 60
  return remMins > 0 ? `${hours}h ${remMins}m` : `${hours}h`
}

export type ReservationFloorCountdown = {
  kind: "until_arrival" | "until_expire"
  label: string
}

/** Cuenta regresiva en el plano: falta para llegar, o para que venza la gracia. */
export function reservationFloorCountdown(
  arrivalAt: string,
  settings: MesasReservationSettings,
  now = new Date(),
): ReservationFloorCountdown | null {
  const { arrival, end } = reservationFloorWindow(arrivalAt, settings)
  const nowMs = now.getTime()
  if (nowMs > end.getTime()) return null

  if (nowMs < arrival.getTime()) {
    return {
      kind: "until_arrival",
      label: `en ${formatReservationCountdownDuration(arrival.getTime() - nowMs)}`,
    }
  }

  return {
    kind: "until_expire",
    label: `vence ${formatReservationCountdownDuration(end.getTime() - nowMs)}`,
  }
}

/** Texto para staff: cuándo la mesa se pinta reservada en el plano. */
export function describeReservationFloorWindow(
  arrivalAt: string,
  settings: MesasReservationSettings,
  options?: { hasAssignedTable?: boolean; tableCount?: number },
): { start: Date; end: Date; summary: string } {
  const { start, end, arrival } = reservationFloorWindow(arrivalAt, settings)
  const from = formatFloorWindowInstant(start, arrival)
  const to = formatFloorWindowInstant(end, arrival)
  const timing = `${settings.floorBufferMinutes} min antes · ${settings.graceMinutes} min de gracia si no llegan`
  const hasAssignedTable = options?.hasAssignedTable !== false

  return {
    start,
    end,
    summary: hasAssignedTable
      ? `En el plano, ${options?.tableCount && options.tableCount > 1 ? "las mesas se verán reservadas" : "la mesa se verá reservada"} de ${from} a ${to} (${timing}).`
      : `Sin mesa asignada: no se pinta en el plano. Ventana operativa de ${from} a ${to} (${timing}).`,
  }
}

export function mesasReservationSettingsFromDraft(input: {
  floorBufferMinutes: number | string
  graceMinutes: number | string
}): MesasReservationSettings {
  return readMesasReservationSettings({
    mesas: {
      reservationFloorBufferMinutes: input.floorBufferMinutes,
      reservationGraceMinutes: input.graceMinutes,
    },
  })
}

export function reservationTableIds(
  reservation: Pick<MesaReservation, "tableId" | "tableIds">,
): string[] {
  if (reservation.tableIds?.length) return reservation.tableIds
  return reservation.tableId ? [reservation.tableId] : []
}

export function reservationIncludesTable(
  reservation: Pick<MesaReservation, "tableId" | "tableIds">,
  tableId: string,
): boolean {
  return reservationTableIds(reservation).includes(tableId)
}

function reservationWindowsOverlap(
  a: { start: Date; end: Date },
  b: { start: Date; end: Date },
): boolean {
  return a.start.getTime() < b.end.getTime() && b.start.getTime() < a.end.getTime()
}

export type ReservationTableConflict = {
  reservation: MesaReservation
  tableIds: string[]
}

/** Choque de ventana en plano: misma mesa y horarios que se pisan. */
export function findReservationTableConflict(input: {
  tableIds: string[]
  arrivalAt: string
  settings: MesasReservationSettings
  reservations: MesaReservation[]
  excludeReservationId?: string | null
}): ReservationTableConflict | null {
  const wanted = new Set(input.tableIds.filter(Boolean))
  if (wanted.size === 0) return null

  const draftWindow = reservationFloorWindow(input.arrivalAt, input.settings)

  const conflicts = input.reservations
    .filter((reservation) => {
      if (
        input.excludeReservationId &&
        reservation.id === input.excludeReservationId
      ) {
        return false
      }
      if (!ACTIVE_FLOOR_RESERVATION_STATUSES.has(reservation.status)) {
        return false
      }
      const shared = reservationTableIds(reservation).filter((id) =>
        wanted.has(id),
      )
      if (shared.length === 0) return false
      const other = reservationFloorWindow(reservation.arrivalAt, input.settings)
      return reservationWindowsOverlap(draftWindow, other)
    })
    .sort(
      (a, b) =>
        new Date(a.arrivalAt).getTime() - new Date(b.arrivalAt).getTime(),
    )

  const reservation = conflicts[0]
  if (!reservation) return null

  return {
    reservation,
    tableIds: reservationTableIds(reservation).filter((id) => wanted.has(id)),
  }
}

export function reservationShowsOnFloor(
  reservation: Pick<MesaReservation, "arrivalAt" | "status" | "tableId" | "tableIds">,
  settings: MesasReservationSettings,
  now = new Date(),
): boolean {
  if (reservationTableIds(reservation).length === 0) return false
  if (!ACTIVE_FLOOR_RESERVATION_STATUSES.has(reservation.status)) {
    return false
  }
  const { start, end } = reservationFloorWindow(reservation.arrivalAt, settings)
  const t = now.getTime()
  return t >= start.getTime() && t <= end.getTime()
}

export function pickFloorReservation(
  tableId: string,
  reservations: MesaReservation[],
  settings: MesasReservationSettings,
  now = new Date(),
): MesaReservation | null {
  const candidates = reservations
    .filter(
      (r) =>
        reservationIncludesTable(r, tableId) &&
        reservationShowsOnFloor(r, settings, now),
    )
    .sort(
      (a, b) =>
        new Date(a.arrivalAt).getTime() - new Date(b.arrivalAt).getTime(),
    )
  return candidates[0] ?? null
}

export function reservationsForAgendaDay(
  reservations: MesaReservation[],
  day = new Date(),
  options?: {
    timeZone?: string
    operationalDayCloseTime?: string
  },
): MesaReservation[] {
  const timeZone = options?.timeZone?.trim() ?? ""
  const closeTime =
    options?.operationalDayCloseTime ?? DEFAULT_OPERATIONAL_DAY_CLOSE_TIME
  const todayKey = timeZone
    ? operationalDayKey(day.toISOString(), timeZone, closeTime)
    : ""

  return reservations
    .filter((r) => {
      if (!AGENDA_RESERVATION_STATUSES.has(r.status)) return false
      if (todayKey) {
        return (
          operationalDayKey(r.arrivalAt, timeZone, closeTime) === todayKey
        )
      }
      return isSameCalendarDay(new Date(r.arrivalAt), day)
    })
    .sort(
      (a, b) =>
        new Date(a.arrivalAt).getTime() - new Date(b.arrivalAt).getTime(),
    )
}

function reservationArrivalDay(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/** Historial: todas las reservas del período, filtradas por cliente. */
export function reservationsForHistory(input: {
  reservations: MesaReservation[]
  from: string | null
  to: string | null
  clientQuery: string
}): MesaReservation[] {
  const query = input.clientQuery.trim().toLowerCase()

  return input.reservations
    .filter((reservation) => {
      const day = reservationArrivalDay(reservation.arrivalAt)
      if (input.from && day < input.from) return false
      if (input.to && day > input.to) return false
      if (!query) return true
      return reservation.clientName.toLowerCase().includes(query)
    })
    .sort(
      (a, b) =>
        new Date(b.arrivalAt).getTime() - new Date(a.arrivalAt).getTime(),
    )
}

export type MesaReservationWarning =
  | { kind: "overlap"; reservation: MesaReservation }
  | { kind: "approaching"; reservation: MesaReservation; minutesUntilBuffer: number }

export function upcomingReservationWarning(
  tableId: string,
  reservations: MesaReservation[],
  settings: MesasReservationSettings,
  now = new Date(),
): MesaReservationWarning | null {
  const todayActive = reservations
    .filter(
      (r) =>
        reservationIncludesTable(r, tableId) &&
        ACTIVE_FLOOR_RESERVATION_STATUSES.has(r.status) &&
        isSameCalendarDay(new Date(r.arrivalAt), now),
    )
    .sort(
      (a, b) =>
        new Date(a.arrivalAt).getTime() - new Date(b.arrivalAt).getTime(),
    )

  for (const reservation of todayActive) {
    if (reservationShowsOnFloor(reservation, settings, now)) {
      return { kind: "overlap", reservation }
    }

    const { start } = reservationFloorWindow(reservation.arrivalAt, settings)
    const msUntilBuffer = start.getTime() - now.getTime()
    if (msUntilBuffer > 0 && msUntilBuffer <= MESAS_RESERVATION_APPROACHING_LEAD_MS) {
      return {
        kind: "approaching",
        reservation,
        minutesUntilBuffer: Math.max(1, Math.ceil(msUntilBuffer / 60_000)),
      }
    }
  }

  return null
}

export function reservationWindowHasEnded(
  arrivalAt: string,
  settings: MesasReservationSettings,
  now = new Date(),
): boolean {
  return now.getTime() > reservationFloorWindow(arrivalAt, settings).end.getTime()
}

/** Confirmada/pendiente cuya ventana ya pasó, sin sentar ni cancelar. */
export function resolveReservationStatus(
  reservation: Pick<MesaReservation, "arrivalAt" | "status">,
  settings: MesasReservationSettings,
  now = new Date(),
): MesaReservationStatus {
  if (
    ACTIVE_FLOOR_RESERVATION_STATUSES.has(reservation.status) &&
    reservationWindowHasEnded(reservation.arrivalAt, settings, now)
  ) {
    return "expired"
  }
  return reservation.status
}

export function mesaReservationStatusLabel(status: MesaReservationStatus): string {
  switch (status) {
    case "pending":
      return "Pendiente"
    case "confirmed":
      return "Confirmada"
    case "seated":
      return "Sentada"
    case "completed":
      return "Terminada"
    case "expired":
      return "Vencida"
    case "no_show":
      return "No vino"
    case "cancelled":
      return "Cancelada"
  }
}

export function isMesaOccupiedNow(
  status: MesaTable["status"] | undefined,
): boolean {
  return status === "open" || status === "paying"
}

/** Mesas de la reserva que no se pueden juntar ahora porque ya tienen cuenta. */
export function reservationOccupiedTablesForOpen(
  reservation: Pick<MesaReservation, "tableId" | "tableIds">,
  tables: MesaTable[],
  primaryTableId: string,
): MesaTable[] {
  return reservationTableIds(reservation)
    .filter((id) => id !== primaryTableId)
    .map((id) => tables.find((table) => table.id === id))
    .filter(
      (table): table is MesaTable =>
        table != null && isMesaOccupiedNow(table.status),
    )
}

export function reservationOccupiedOpenWarning(
  occupied: Pick<MesaTable, "label" | "status">[],
): string | null {
  if (occupied.length === 0) return null
  const names = occupied.map((table) => table.label).join(", ")
  if (occupied.length === 1) {
    const estado = occupied[0].status === "paying" ? "cobrando" : "abierta"
    return `La mesa ${names} está ${estado} con otra cuenta. No se va a juntar. Liberála primero o sentá sin esa mesa.`
  }
  return `Las mesas ${names} están ocupadas con otra cuenta. No se van a juntar. Liberálas primero o sentá sin esas mesas.`
}

function reservationTableIdsAvailableToOpen(
  reservedIds: string[],
  primaryTableId: string,
  tables?: MesaTable[],
): string[] {
  if (!tables) return reservedIds
  return reservedIds.filter((id) => {
    if (id === primaryTableId) return true
    const table = tables.find((item) => item.id === id)
    return table != null && !isMesaOccupiedNow(table.status)
  })
}

/** Valores iniciales para abrir mesa desde una reserva activa en el plano. */
export function mesaOpenInitialFromReservation(
  reservation: Pick<MesaReservation, "guestCount" | "note" | "tableId" | "tableIds">,
  tableId: string,
  tables?: MesaTable[],
): Partial<MesaOpenSessionInput> {
  const reservedIds = reservationTableIdsAvailableToOpen(
    reservationTableIds(reservation),
    tableId,
    tables,
  )
  const tableIds = reservedIds.includes(tableId)
    ? [tableId, ...reservedIds.filter((id) => id !== tableId)]
    : [tableId, ...reservedIds]
  return {
    tableIds,
    guestCount: reservation.guestCount,
    note: reservation.note,
  }
}
