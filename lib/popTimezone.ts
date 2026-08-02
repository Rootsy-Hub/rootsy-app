/**
 * Zona horaria operativa del POP para fechas de negocio.
 *
 * **Dónde se configura:** Ajustes del POP → campo **País** (`pops.country`, ej. `AR`)
 * y el `site_id` del POP (ej. `arg`). Ver `timezoneForPopLedger`.
 *
 * **Convención:**
 * - Campos `timestamptz` (ej. `sales.sold_at`): guardar instante UTC (`new Date().toISOString()`).
 * - Para mostrar o filtrar por día calendario del local: usar `toPopCalendarDate`.
 * - Campos `DATE` (ej. `purchase_payments.paid_at`): ya son fecha calendario; usar slice directo.
 */

import {
  entryDateIsoInTimezone,
  timestampToLocalDateIso,
  timezoneForPopLedger,
} from "@/lib/entryDateTimezone"

export {
  addCalendarDays,
  entryDateIsoInTimezone,
  localDateExclusiveEndTimestamp,
  localDateStartTimestamp,
  timestampToLocalDateIso,
  timezoneForPopLedger,
} from "@/lib/entryDateTimezone"

const CALENDAR_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** Zona horaria a partir del segmento `[siteId]` de la ruta (cliente). */
export function timezoneForSiteId(siteId: string): string {
  return timezoneForPopLedger(null, siteId)
}

export function resolvePopTimeZone(options: {
  country?: string | null
  siteId?: string | null
}): string {
  return timezoneForPopLedger(options.country, String(options.siteId ?? ""))
}

export function isCalendarDateOnly(value: string): boolean {
  const raw = value.trim()
  return CALENDAR_DATE_RE.test(raw) && !/T/.test(raw)
}

export function isIsoTimestamp(value: string): boolean {
  return /T\d/.test(value.trim())
}

/** Fecha calendario YYYY-MM-DD del POP: convierte timestamptz o devuelve DATE tal cual. */
export function toPopCalendarDate(value: string, timeZone: string): string {
  const raw = value.trim()
  if (!raw) return ""
  if (isCalendarDateOnly(raw)) return raw.slice(0, 10)
  return timestampToLocalDateIso(raw, timeZone)
}

export function formatPopDateShort(
  value: string,
  timeZone: string,
  locale = "es-AR",
): string {
  const cal = toPopCalendarDate(value, timeZone)
  if (!cal) return "—"
  const [y, m, d] = cal.split("-").map(Number)
  if (!y || !m || !d) return cal
  return new Intl.DateTimeFormat(locale, { dateStyle: "short" }).format(
    new Date(y, m - 1, d),
  )
}

export function formatPopDateTime(
  value: string,
  timeZone: string,
  locale = "es-AR",
): string {
  if (!value.trim()) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
    timeZone,
  }).format(d)
}

/** Hora HH:mm en la zona del POP; vacío si el valor es solo fecha calendario. */
export function formatPopTime(
  value: string,
  timeZone: string,
  locale = "es-AR",
): string {
  if (!value.trim() || isCalendarDateOnly(value)) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(d)
}

/** ¿El instante cae en el rango calendario [from, to] del POP? */
export function isoTimestampInDateBounds(
  isoTimestamp: string,
  from: string | null,
  to: string | null,
  timeZone: string,
): boolean {
  const d = toPopCalendarDate(isoTimestamp, timeZone)
  if (from && d < from) return false
  if (to && d > to) return false
  return true
}

/** Hoy calendario del POP (YYYY-MM-DD). */
export function todayPopCalendarDate(timeZone: string): string {
  return entryDateIsoInTimezone(timeZone)
}
