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

const DEFAULT_LOCALE = "es-AR"

/** Opciones Intl para hora en 24 h (HH:mm). */
export function popTimeIntlOptions(
  timeZone?: string,
): Intl.DateTimeFormatOptions {
  return {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...(timeZone ? { timeZone } : {}),
  }
}

/** Opciones Intl para fecha + hora en 24 h. */
export function popDateTimeIntlOptions(
  timeZone?: string,
): Intl.DateTimeFormatOptions {
  return {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...(timeZone ? { timeZone } : {}),
  }
}

function parseInstant(value: string): Date | null {
  if (!value.trim()) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Fecha+hora en 24 h usando la zona del POP. */
export function formatPopDateTime(
  value: string,
  timeZone: string,
  locale = DEFAULT_LOCALE,
): string {
  const d = parseInstant(value)
  if (!d) return value.trim() ? value : "—"
  return new Intl.DateTimeFormat(locale, popDateTimeIntlOptions(timeZone)).format(
    d,
  )
}

/** Fecha+hora en 24 h en la zona local del navegador. */
export function formatLocaleDateTime(
  value: string,
  locale = DEFAULT_LOCALE,
): string {
  const d = parseInstant(value)
  if (!d) return value.trim() ? value : "—"
  return new Intl.DateTimeFormat(locale, popDateTimeIntlOptions()).format(d)
}

/** Hora HH:mm en la zona local del navegador. */
export function formatLocaleTime(
  date: Date,
  locale = DEFAULT_LOCALE,
): string {
  return new Intl.DateTimeFormat(locale, popTimeIntlOptions()).format(date)
}

/** Hora HH:mm en la zona del POP; vacío si el valor es solo fecha calendario. */
export function formatPopTime(
  value: string,
  timeZone: string,
  locale = DEFAULT_LOCALE,
): string {
  if (!value.trim() || isCalendarDateOnly(value)) return ""
  const d = parseInstant(value)
  if (!d) return ""
  return new Intl.DateTimeFormat(locale, popTimeIntlOptions(timeZone)).format(d)
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
