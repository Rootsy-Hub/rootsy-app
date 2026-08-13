import type {
  MesaOpenSessionInput,
  MesaReservation,
  MesaReservationStatus,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"

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
  "seated",
  "no_show",
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

/** Texto para staff: cuándo la mesa se pinta reservada en el plano. */
export function describeReservationFloorWindow(
  arrivalAt: string,
  settings: MesasReservationSettings,
  options?: { hasAssignedTable?: boolean },
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
      ? `En el plano, la mesa se verá reservada de ${from} a ${to} (${timing}).`
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

export function reservationShowsOnFloor(
  reservation: Pick<MesaReservation, "arrivalAt" | "status" | "tableId">,
  settings: MesasReservationSettings,
  now = new Date(),
): boolean {
  if (!reservation.tableId) return false
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
        r.tableId != null &&
        r.tableId === tableId &&
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
): MesaReservation[] {
  return reservations
    .filter(
      (r) =>
        AGENDA_RESERVATION_STATUSES.has(r.status) &&
        isSameCalendarDay(new Date(r.arrivalAt), day),
    )
    .sort(
      (a, b) =>
        new Date(a.arrivalAt).getTime() - new Date(b.arrivalAt).getTime(),
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
        r.tableId != null &&
        r.tableId === tableId &&
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

export function mesaReservationStatusLabel(status: MesaReservationStatus): string {
  switch (status) {
    case "pending":
      return "Pendiente"
    case "confirmed":
      return "Confirmada"
    case "seated":
      return "Sentada"
    case "completed":
      return "Completada"
    case "no_show":
      return "No-show"
    case "cancelled":
      return "Cancelada"
  }
}

/** Valores iniciales para abrir mesa desde una reserva activa en el plano. */
export function mesaOpenInitialFromReservation(
  reservation: Pick<MesaReservation, "guestCount" | "note">,
  tableId: string,
): Partial<MesaOpenSessionInput> {
  return {
    tableIds: [tableId],
    guestCount: reservation.guestCount,
    note: reservation.note,
  }
}
