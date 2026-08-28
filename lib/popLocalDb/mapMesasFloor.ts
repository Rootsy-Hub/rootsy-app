import type {
  MesasFloorDecorRow,
  MesasLayoutData,
  MesasSalonRow,
  MesasTableRow,
} from "@/app/[siteId]/[popId]/mesas/actions"
import type { MesasReservationSettingsCache } from "@/app/[siteId]/[popId]/mesas/mesasQueryCache"
import type { MesasReservationSettings } from "@/app/[siteId]/[popId]/mesas/mesasReservationLogic"
import type {
  MesaFloorDecorKind,
  MesaReservation,
  MesaReservationStatus,
  MesaSession,
  MesaTableShape,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { MESA_FLOOR_DECOR_KINDS } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import type { SqlParams } from "@/lib/popLocalDb/database"

export const MESAS_SETTINGS_ROW_ID = "current"

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : value == null ? fallback : String(value)
}

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function asBool(value: unknown, fallback = true): boolean {
  if (value == null) return fallback
  return value === 1 || value === true || value === "1"
}

function asNullableString(value: unknown): string | null {
  if (value == null) return null
  const text = String(value).trim()
  return text ? text : null
}

function asNullableInt(value: unknown): number | null {
  if (value == null || value === "") return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string" || !value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function parseStringArray(value: unknown): string[] {
  const parsed = parseJson<unknown>(value, [])
  if (!Array.isArray(parsed)) return []
  return parsed.filter((item): item is string => typeof item === "string")
}

function parseShape(value: unknown): MesaTableShape {
  const parsed = typeof value === "string" ? parseJson<unknown>(value, null) : value
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { kind: "round", size: "m" }
  }
  const row = parsed as { kind?: unknown; size?: unknown }
  const size = typeof row.size === "string" ? row.size : "m"
  if (row.kind === "square") {
    return {
      kind: "square",
      size: size === "s" || size === "l" ? size : "m",
    }
  }
  if (row.kind === "rect") {
    return {
      kind: "rect",
      size:
        size === "s" || size === "l" || size === "xl" ? size : "m",
    }
  }
  return {
    kind: "round",
    size: size === "s" || size === "l" || size === "xl" ? size : "m",
  }
}

function parseDecorKind(value: unknown): MesaFloorDecorKind {
  const kind = asString(value)
  return (MESA_FLOOR_DECOR_KINDS as readonly string[]).includes(kind)
    ? (kind as MesaFloorDecorKind)
    : "label"
}

function parseReservationStatus(value: unknown): MesaReservationStatus {
  const status = asString(value)
  if (
    status === "pending" ||
    status === "confirmed" ||
    status === "seated" ||
    status === "completed" ||
    status === "expired" ||
    status === "no_show" ||
    status === "cancelled"
  ) {
    return status
  }
  return "pending"
}

export function salonBindValues(row: MesasSalonRow): SqlParams {
  return [row.id, row.name, row.sortOrder, row.isActive ? 1 : 0]
}

function asRecord(row: object): Record<string, unknown> {
  return row as Record<string, unknown>
}

export function sqlSalonRowToSnapshot(row: object): MesasSalonRow {
  const data = asRecord(row)
  return {
    id: asString(data.id),
    name: asString(data.name),
    sortOrder: asNumber(data.sort_order),
    isActive: asBool(data.is_active),
  }
}

export function tableBindValues(row: MesasTableRow): SqlParams {
  return [
    row.id,
    row.salonId,
    row.label,
    JSON.stringify(row.shape),
    row.x,
    row.y,
    row.rotation,
    row.seats,
    row.sortOrder,
    row.isActive ? 1 : 0,
  ]
}

export function sqlTableRowToSnapshot(row: object): MesasTableRow {
  const data = row as Record<string, unknown>
  return {
    id: asString(data.id),
    salonId: asString(data.salon_id),
    label: asString(data.label),
    shape: parseShape(data.shape),
    x: asNumber(data.x),
    y: asNumber(data.y),
    rotation: asNumber(data.rotation),
    seats: asNumber(data.seats),
    sortOrder: asNumber(data.sort_order),
    isActive: asBool(data.is_active),
  }
}

export function decorBindValues(row: MesasFloorDecorRow): SqlParams {
  return [
    row.id,
    row.salonId,
    row.kind,
    row.x,
    row.y,
    row.width,
    row.height,
    row.rotation,
    row.label,
    row.sortOrder,
    row.isActive ? 1 : 0,
  ]
}

export function sqlDecorRowToSnapshot(row: object): MesasFloorDecorRow {
  const data = row as Record<string, unknown>
  return {
    id: asString(data.id),
    salonId: asString(data.salon_id),
    kind: parseDecorKind(data.kind),
    x: asNumber(data.x),
    y: asNumber(data.y),
    width: asNumber(data.width),
    height: asNumber(data.height),
    rotation: asNumber(data.rotation),
    label: asString(data.label),
    sortOrder: asNumber(data.sort_order),
    isActive: asBool(data.is_active),
  }
}

export function layoutFromRows(
  salons: MesasSalonRow[],
  tables: MesasTableRow[],
  decors: MesasFloorDecorRow[],
): MesasLayoutData {
  return { salons, tables, decors }
}

export function sessionSlimBindValues(session: MesaSession): SqlParams {
  return [
    session.id,
    JSON.stringify(session.tableIds),
    session.waiterId,
    session.guestCount,
    session.note,
    session.openedAt,
    session.updatedAt,
    session.floorStatus === "paying" ? "paying" : "open",
  ]
}

export function sqlSessionRowToSnapshot(row: object): MesaSession {
  const data = asRecord(row)
  return {
    id: asString(data.id),
    tableIds: parseStringArray(data.table_ids),
    waiterId: asString(data.waiter_id),
    guestCount: asNullableInt(data.guest_count),
    note: asString(data.note),
    openedAt: asString(data.opened_at),
    updatedAt: asString(data.updated_at),
    checkout: null,
    floorStatus: data.floor_status === "paying" ? "paying" : "open",
  }
}

export function reservationSlimBindValues(reservation: MesaReservation): SqlParams {
  return [
    reservation.id,
    reservation.tableId,
    JSON.stringify(reservation.tableIds),
    reservation.clientId,
    reservation.clientName,
    reservation.guestCount,
    reservation.arrivalAt,
    reservation.status,
    reservation.note,
    reservation.updatedAt,
  ]
}

export function sqlReservationRowToSnapshot(row: object): MesaReservation {
  const data = asRecord(row)
  return {
    id: asString(data.id),
    tableId: asNullableString(data.table_id),
    tableIds: parseStringArray(data.table_ids),
    clientId: asNullableString(data.client_id),
    clientName: asString(data.client_name),
    guestCount: asNullableInt(data.guest_count),
    arrivalAt: asString(data.arrival_at),
    status: parseReservationStatus(data.status),
    note: asString(data.note),
    updatedAt: asString(data.updated_at),
  }
}

export function settingsBindValues(
  settings: MesasReservationSettings,
  operationalDayCloseTime: string,
): SqlParams {
  return [
    MESAS_SETTINGS_ROW_ID,
    settings.floorBufferMinutes,
    settings.graceMinutes,
    operationalDayCloseTime,
  ]
}

export function sqlSettingsRowToSnapshot(
  row: object | undefined,
  fallback: MesasReservationSettingsCache,
): MesasReservationSettingsCache {
  if (!row) return fallback
  const data = asRecord(row)
  return {
    settings: {
      floorBufferMinutes: asNumber(
        data.floor_buffer_minutes,
        fallback.settings.floorBufferMinutes,
      ),
      graceMinutes: asNumber(data.grace_minutes, fallback.settings.graceMinutes),
    },
    operationalDayCloseTime: asString(
      data.operational_day_close_time,
      fallback.operationalDayCloseTime,
    ),
  }
}
