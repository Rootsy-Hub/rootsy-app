import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns"
import {
  formatIsoDateCompact,
  formatIsoDateShort,
  isCompleteDateRange,
  toISODateLocal,
} from "@/lib/dataWorkspaceDateFilter"
import type { DateRange } from "react-day-picker"

export type SummaryDatePreset =
  | "today"
  | "yesterday"
  | "this_week"
  | "this_month"
  | "this_year"
  | "custom"

export const SUMMARY_DATE_PRESETS: {
  id: SummaryDatePreset
  label: string
}[] = [
  { id: "today", label: "Hoy" },
  { id: "yesterday", label: "Ayer" },
  { id: "this_week", label: "Esta semana" },
  { id: "this_month", label: "Este mes" },
  { id: "this_year", label: "Este año" },
  { id: "custom", label: "Personalizado" },
]

export function computeSummaryDateBounds(
  preset: SummaryDatePreset,
  custom: DateRange | undefined,
): { from: string | null; to: string | null } {
  const today = new Date()
  switch (preset) {
    case "today":
      return {
        from: toISODateLocal(today),
        to: toISODateLocal(today),
      }
    case "yesterday": {
      const y = subDays(today, 1)
      const iso = toISODateLocal(y)
      return { from: iso, to: iso }
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
    case "this_year": {
      const from = startOfYear(today)
      const to = endOfYear(today)
      return { from: toISODateLocal(from), to: toISODateLocal(to) }
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

/** Período anterior equivalente para comparación de variación. */
export function computePreviousSummaryDateBounds(
  preset: SummaryDatePreset,
  bounds: { from: string | null; to: string | null },
): { from: string | null; to: string | null } {
  const today = new Date()
  switch (preset) {
    case "today": {
      const y = subDays(today, 1)
      const iso = toISODateLocal(y)
      return { from: iso, to: iso }
    }
    case "yesterday": {
      const d = subDays(today, 2)
      const iso = toISODateLocal(d)
      return { from: iso, to: iso }
    }
    case "this_week": {
      const prevWeek = subDays(today, 7)
      const from = startOfWeek(prevWeek, { weekStartsOn: 1 })
      const to = endOfWeek(prevWeek, { weekStartsOn: 1 })
      return { from: toISODateLocal(from), to: toISODateLocal(to) }
    }
    case "this_month": {
      const prev = subMonths(today, 1)
      const from = startOfMonth(prev)
      const to = endOfMonth(prev)
      return { from: toISODateLocal(from), to: toISODateLocal(to) }
    }
    case "this_year": {
      const prev = subYears(today, 1)
      const from = startOfYear(prev)
      const to = endOfYear(prev)
      return { from: toISODateLocal(from), to: toISODateLocal(to) }
    }
    case "custom": {
      if (!bounds.from || !bounds.to) return { from: null, to: null }
      const fromDate = new Date(
        Number(bounds.from.slice(0, 4)),
        Number(bounds.from.slice(5, 7)) - 1,
        Number(bounds.from.slice(8, 10)),
      )
      const toDate = new Date(
        Number(bounds.to.slice(0, 4)),
        Number(bounds.to.slice(5, 7)) - 1,
        Number(bounds.to.slice(8, 10)),
      )
      const days =
        Math.round((toDate.getTime() - fromDate.getTime()) / 86_400_000) + 1
      const prevTo = subDays(fromDate, 1)
      const prevFrom = subDays(prevTo, days - 1)
      return {
        from: toISODateLocal(prevFrom),
        to: toISODateLocal(prevTo),
      }
    }
  }
}

export function summaryDateFilterSummary(
  preset: SummaryDatePreset,
  bounds: { from: string | null; to: string | null },
): string {
  const match = SUMMARY_DATE_PRESETS.find((item) => item.id === preset)
  if (preset !== "custom") return match?.label ?? "Período"
  if (bounds.from && bounds.to) {
    return `${formatIsoDateCompact(bounds.from)} - ${formatIsoDateCompact(bounds.to)}`
  }
  return "Rango personalizado (elegí inicio y fin)"
}

export function formatSummaryDateRangeLabel(bounds: {
  from: string | null
  to: string | null
}): string {
  if (!bounds.from && !bounds.to) return "Sin límite de fechas"
  if (bounds.from && bounds.to) {
    if (bounds.from === bounds.to) return formatIsoDateShort(bounds.from)
    return `${formatIsoDateShort(bounds.from)} – ${formatIsoDateShort(bounds.to)}`
  }
  if (bounds.from) return `Desde ${formatIsoDateShort(bounds.from)}`
  if (bounds.to) return `Hasta ${formatIsoDateShort(bounds.to)}`
  return "—"
}

export function summaryDeltaPercent(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) {
    if (current === 0) return 0
    return null
  }
  return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10
}
