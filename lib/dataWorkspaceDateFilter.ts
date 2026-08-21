import {
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns"
import { toPopCalendarDate } from "@/lib/popTimezone"
import type { DateRange } from "react-day-picker"

export type DataWorkspaceDatePreset =
  | "all"
  | "today"
  | "this_week"
  | "this_month"
  | "last_month"
  | "last_7"
  | "last_30"
  | "custom"

export type DataWorkspaceDateQuickPreset = {
  id: Exclude<DataWorkspaceDatePreset, "all" | "custom">
  label: string
}

export const DATA_WORKSPACE_DATE_QUICK_PRESETS: DataWorkspaceDateQuickPreset[] = [
  { id: "this_week", label: "Esta semana" },
  { id: "this_month", label: "Este mes" },
  { id: "last_month", label: "Mes anterior" },
  { id: "last_7", label: "Últimos 7 días" },
  { id: "last_30", label: "Últimos 30 días" },
]

export const RESERVATION_HISTORY_DATE_PRESETS: DataWorkspaceDateQuickPreset[] = [
  { id: "today", label: "Hoy" },
  { id: "this_week", label: "Esta semana" },
  { id: "this_month", label: "Este mes" },
]

export function isCompleteDateRange(
  range: DateRange | undefined,
): range is { from: Date; to: Date } {
  return Boolean(range?.from && range?.to)
}

export function toISODateLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function computeDataWorkspaceDateBounds(
  preset: DataWorkspaceDatePreset,
  custom: DateRange | undefined,
): { from: string | null; to: string | null } {
  const today = new Date()
  switch (preset) {
    case "all":
      return { from: null, to: null }
    case "today": {
      const day = toISODateLocal(today)
      return { from: day, to: day }
    }
    case "this_week": {
      const from = startOfWeek(today, { weekStartsOn: 1 })
      const to = endOfWeek(today, { weekStartsOn: 1 })
      return { from: toISODateLocal(from), to: toISODateLocal(to) }
    }
    case "this_month": {
      const from = startOfMonth(today)
      const to = endOfMonth(today)
      return { from: toISODateLocal(from), to: toISODateLocal(to) }
    }
    case "last_month": {
      const prev = subMonths(today, 1)
      const from = startOfMonth(prev)
      const to = endOfMonth(prev)
      return { from: toISODateLocal(from), to: toISODateLocal(to) }
    }
    case "last_7": {
      const from = subDays(today, 6)
      return { from: toISODateLocal(from), to: toISODateLocal(today) }
    }
    case "last_30": {
      const from = subDays(today, 29)
      return { from: toISODateLocal(from), to: toISODateLocal(today) }
    }
    case "custom": {
      if (!isCompleteDateRange(custom)) return { from: null, to: null }
      let a = custom.from
      let b = custom.to
      if (a > b) [a, b] = [b, a]
      return { from: toISODateLocal(a), to: toISODateLocal(b) }
    }
  }
}

export function formatIsoDateShort(iso: string): string {
  const y = Number(iso.slice(0, 4))
  const m = Number(iso.slice(5, 7))
  const d = Number(iso.slice(8, 10))
  if (!y || !m || !d) return iso
  return new Date(y, m - 1, d).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

/** Fecha compacta para triggers — dd/MM/yy (p. ej. 01/07/26). */
export function formatIsoDateCompact(iso: string): string {
  const y = Number(iso.slice(0, 4))
  const m = Number(iso.slice(5, 7))
  const d = Number(iso.slice(8, 10))
  if (!y || !m || !d) return iso
  const yy = String(y % 100).padStart(2, "0")
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${yy}`
}

export function formatIsoDateRangeCompact(
  from: string,
  to: string,
): string {
  return `${formatIsoDateCompact(from)} - ${formatIsoDateCompact(to)}`
}

export function dataWorkspaceDateFilterSummary(
  preset: DataWorkspaceDatePreset,
  bounds: { from: string | null; to: string | null },
): string {
  if (preset === "all") return "Todas las fechas"
  if (preset === "today") return "Hoy"
  if (preset === "this_week") return "Esta semana"
  if (preset === "this_month") return "Este mes"
  if (preset === "last_month") return "Mes anterior"
  if (preset === "last_7") return "Últimos 7 días"
  if (preset === "last_30") return "Últimos 30 días"
  if (preset === "custom" && bounds.from && bounds.to) {
    return formatIsoDateRangeCompact(bounds.from, bounds.to)
  }
  return "Rango personalizado (elegí inicio y fin)"
}

export function dataWorkspacePresetLabel(
  preset: DataWorkspaceDatePreset,
): string {
  if (preset === "all") return "Todas las fechas"
  if (preset === "today") return "Hoy"
  if (preset === "custom") return "Rango personalizado"
  const match = DATA_WORKSPACE_DATE_QUICK_PRESETS.find((item) => item.id === preset)
  return match?.label ?? "Período"
}

/** Rango legible para UI (siempre con fechas cuando hay from/to). */
export function formatDataWorkspaceDateRangeLabel(bounds: {
  from: string | null
  to: string | null
}): string {
  if (!bounds.from && !bounds.to) return "Sin límite de fechas"
  if (bounds.from && bounds.to) {
    return `${formatIsoDateShort(bounds.from)} – ${formatIsoDateShort(bounds.to)}`
  }
  if (bounds.from) return `Desde ${formatIsoDateShort(bounds.from)}`
  if (bounds.to) return `Hasta ${formatIsoDateShort(bounds.to)}`
  return "—"
}

export function isoDateInBounds(
  isoOrDate: string,
  from: string | null,
  to: string | null,
  timeZone?: string,
): boolean {
  if (!from && !to) return true
  const d =
    timeZone != null && timeZone.length > 0
      ? toPopCalendarDate(isoOrDate, timeZone)
      : isoOrDate.slice(0, 10)
  if (from && d < from) return false
  if (to && d > to) return false
  return true
}
