"use client"

import { ReportStatValue } from "@/components/reports/ReportStatValue"
import {
  dataWorkspaceEntityCardStatLabelClass,
  dataWorkspaceShellCard,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import type { StatisticsCompareMetric } from "@/app/[siteId]/[popId]/statistics/actions"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import { cn } from "@/lib/utils"

function formatValue(
  value: number,
  format: StatisticsCompareMetric["format"],
): string {
  if (format === "money") return formatReportMoneyAr(value)
  if (format === "percent") {
    return `${value.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`
  }
  return value.toLocaleString("es-AR")
}

function formatDelta(metric: StatisticsCompareMetric): string | null {
  if (metric.format === "percent" && metric.deltaPoints != null) {
    const sign = metric.deltaPoints > 0 ? "+" : ""
    return `${sign}${metric.deltaPoints.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} pp`
  }
  if (metric.deltaPercent == null) return null
  const sign = metric.deltaPercent > 0 ? "+" : ""
  return `${sign}${metric.deltaPercent.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}

export function StatisticsCompareKpiRow({
  metrics,
  loading,
  compareEnabled,
}: {
  metrics: StatisticsCompareMetric[]
  loading?: boolean
  compareEnabled: boolean
}) {
  if (!metrics.length && !loading) return null

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {(loading
        ? Array.from({ length: 4 }).map((_, i) => ({
            id: `sk-${i}`,
            label: "—",
            value: 0,
            previousValue: 0,
            deltaPercent: null,
            deltaPoints: null,
            format: "number" as const,
          }))
        : metrics
      ).map((metric) => {
        const deltaText = compareEnabled ? formatDelta(metric) : null
        const deltaUp =
          metric.format === "percent"
            ? (metric.deltaPoints ?? 0) >= 0
            : (metric.deltaPercent ?? 0) >= 0

        return (
          <div key={metric.id} className={cn(dataWorkspaceShellCard, "px-5 py-4")}>
            <p className={dataWorkspaceEntityCardStatLabelClass}>{metric.label}</p>
            <ReportStatValue loading={loading}>
              {formatValue(metric.value, metric.format)}
            </ReportStatValue>
            {compareEnabled ? (
              deltaText != null ? (
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
              )
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
