import {
  supportsInlineReportDetail,
  type ReportHubCategoryFilter,
} from "@/lib/reportsCatalog"
import type { DataWorkspaceDatePreset } from "@/lib/dataWorkspaceDateFilter"
import type { DateRange } from "react-day-picker"

export type ReportsWorkspaceUrlState = {
  report: string | null
  category: ReportHubCategoryFilter
  datePreset: DataWorkspaceDatePreset
  customFrom: string | null
  customTo: string | null
}

const DATE_PRESETS = new Set<DataWorkspaceDatePreset>([
  "all",
  "today",
  "this_week",
  "this_month",
  "last_month",
  "last_7",
  "last_30",
  "custom",
])

const CATEGORIES = new Set<ReportHubCategoryFilter>([
  "all",
  "operativo",
  "fiscal",
  "gestion",
  "control",
  "config",
])

function parseDatePreset(raw: string | null): DataWorkspaceDatePreset {
  const value = raw?.trim() ?? ""
  return DATE_PRESETS.has(value as DataWorkspaceDatePreset)
    ? (value as DataWorkspaceDatePreset)
    : "this_month"
}

function parseIsoDate(raw: string | null): string | null {
  const value = raw?.trim() ?? ""
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
}

function parseReport(raw: string | null): string | null {
  const value = raw?.trim() ?? ""
  if (!value) return null
  return supportsInlineReportDetail(value) ? value : null
}

function parseCategory(raw: string | null): ReportHubCategoryFilter {
  const value = raw?.trim() ?? ""
  return CATEGORIES.has(value as ReportHubCategoryFilter)
    ? (value as ReportHubCategoryFilter)
    : "all"
}

export function parseReportsWorkspaceUrl(
  params: URLSearchParams,
): ReportsWorkspaceUrlState {
  const datePreset = parseDatePreset(params.get("dp"))
  return {
    report: parseReport(params.get("report")),
    category: parseCategory(params.get("cat")),
    datePreset,
    customFrom: datePreset === "custom" ? parseIsoDate(params.get("df")) : null,
    customTo: datePreset === "custom" ? parseIsoDate(params.get("dt")) : null,
  }
}

export function reportsCustomDateRange(
  state: ReportsWorkspaceUrlState,
): DateRange | undefined {
  if (state.datePreset !== "custom" || !state.customFrom || !state.customTo) {
    return undefined
  }
  return {
    from: new Date(`${state.customFrom}T12:00:00`),
    to: new Date(`${state.customTo}T12:00:00`),
  }
}

export function mergeReportsWorkspaceUrl(
  current: URLSearchParams,
  patch: Partial<ReportsWorkspaceUrlState>,
): URLSearchParams {
  const next = new URLSearchParams(current.toString())
  const merged: ReportsWorkspaceUrlState = {
    ...parseReportsWorkspaceUrl(current),
    ...patch,
  }

  if (merged.report) next.set("report", merged.report)
  else next.delete("report")

  if (merged.category !== "all") next.set("cat", merged.category)
  else next.delete("cat")

  if (merged.datePreset !== "this_month") next.set("dp", merged.datePreset)
  else next.delete("dp")

  if (merged.datePreset === "custom" && merged.customFrom) {
    next.set("df", merged.customFrom)
  } else {
    next.delete("df")
  }
  if (merged.datePreset === "custom" && merged.customTo) {
    next.set("dt", merged.customTo)
  } else {
    next.delete("dt")
  }

  next.delete("from")
  next.delete("to")
  return next
}
