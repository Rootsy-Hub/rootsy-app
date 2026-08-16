"use client"

import { ReportStatValue } from "@/components/reports/ReportStatValue"
import {
  dataWorkspaceEntityCardStatLabelClass,
  dataWorkspaceShellCard,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import type { SummaryMetricDelta } from "@/app/[siteId]/[popId]/summary/actions"
import { cn } from "@/lib/utils"

function formatDelta(delta: number | null): string | null {
  if (delta == null) return null
  const sign = delta > 0 ? "+" : ""
  return `${sign}${delta.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}

export function SummaryKpiCard({
  label,
  metric,
  loading,
  emphasize = false,
  formatAsMoney = true,
}: {
  label: string
  metric: SummaryMetricDelta
  loading?: boolean
  emphasize?: boolean
  formatAsMoney?: boolean
}) {
  const deltaText = formatDelta(metric.deltaPercent)
  const deltaUp = (metric.deltaPercent ?? 0) >= 0

  return (
    <div
      className={cn(
        dataWorkspaceShellCard,
        "flex flex-col px-5 py-4",
        emphasize && "ring-1 ring-[var(--rootsy-savia-400)]/30",
      )}
    >
      <p className={dataWorkspaceEntityCardStatLabelClass}>{label}</p>
      <ReportStatValue loading={loading} className={emphasize ? "text-3xl" : undefined}>
        {formatAsMoney
          ? formatReportMoneyAr(metric.value)
          : metric.value.toLocaleString("es-AR")}
      </ReportStatValue>
      {deltaText != null ? (
        <p className="mt-2 text-xs text-[var(--rootsy-bruma-500)]">
          <span
            className={cn(
              "font-numeric font-medium tabular-nums",
              deltaUp ? "text-emerald-600" : "text-amber-700",
            )}
          >
            {deltaText}
          </span>{" "}
          vs. período anterior
        </p>
      ) : (
        <p className="mt-2 text-xs text-[var(--rootsy-bruma-400)]">—</p>
      )}
    </div>
  )
}

export function SummaryMetricTile({
  label,
  value,
  loading,
  formatAsMoney = false,
}: {
  label: string
  value: string
  loading?: boolean
  formatAsMoney?: boolean
}) {
  const numeric = Number(value)
  const display =
    value === "—"
      ? "—"
      : formatAsMoney && Number.isFinite(numeric)
        ? formatReportMoneyAr(numeric)
        : value

  return (
    <div className={cn(dataWorkspaceShellCard, "px-4 py-3")}>
      <p className={dataWorkspaceEntityCardStatLabelClass}>{label}</p>
      <ReportStatValue loading={loading}>{display}</ReportStatValue>
    </div>
  )
}

export function SummarySectionHeading({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">
        {title}
      </h2>
      {description ? (
        <p className="mt-0.5 text-[11px] text-[var(--rootsy-bruma-500)]">
          {description}
        </p>
      ) : null}
    </div>
  )
}
