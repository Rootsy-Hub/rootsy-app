"use client"

import { ReportStatValue } from "@/components/reports/ReportStatValue"
import {
  dataWorkspaceEntityCardStatLabelClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import type { StatisticsCompareMetric } from "@/app/[siteId]/[popId]/statistics/actions"
import {
  statisticsDeltaNegativeClass,
  statisticsDeltaNeutralClass,
  statisticsDeltaPositiveClass,
  statisticsLosetaCardBodyCompactClass,
  statisticsLosetaCardClass,
} from "@/components/statistics/statisticsWorkspaceStyles"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import { cn } from "@/lib/utils"
import { ArrowDown, ArrowUp, Minus } from "lucide-react"

type DeltaDirection = "up" | "down" | "flat" | "unknown"

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

function getDeltaDirection(metric: StatisticsCompareMetric): DeltaDirection {
  const delta =
    metric.format === "percent" ? metric.deltaPoints : metric.deltaPercent
  if (delta == null) return "unknown"
  if (delta > 0) return "up"
  if (delta < 0) return "down"
  return "flat"
}

function kpiGridClass(count: number) {
  if (count <= 1) return "grid-cols-1"
  if (count === 2) return "grid-cols-1 sm:grid-cols-2"
  if (count === 3) return "grid-cols-1 sm:grid-cols-3"
  return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
}

function StatisticsDeltaIndicator({
  metric,
}: {
  metric: StatisticsCompareMetric
}) {
  const deltaText = formatDelta(metric)
  const direction = getDeltaDirection(metric)

  if (deltaText == null) {
    return <p className="mt-2 text-xs text-rootsy-bruma-500">—</p>
  }

  const Icon =
    direction === "up" ? ArrowUp : direction === "down" ? ArrowDown : Minus

  const deltaValueClass = cn(
    "font-numeric font-medium tabular-nums",
    direction === "up" && statisticsDeltaPositiveClass,
    direction === "down" && statisticsDeltaNegativeClass,
    (direction === "flat" || direction === "unknown") &&
      statisticsDeltaNeutralClass,
  )

  const iconClass = cn(
    "size-3.5 shrink-0",
    direction === "up" && statisticsDeltaPositiveClass,
    direction === "down" && statisticsDeltaNegativeClass,
    (direction === "flat" || direction === "unknown") &&
      statisticsDeltaNeutralClass,
  )

  const trendLabel =
    direction === "up"
      ? "Aumentó"
      : direction === "down"
        ? "Disminuyó"
        : "Sin cambio"

  return (
    <p className="mt-2 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-rootsy-bruma-500">
      <span className="inline-flex items-center gap-1">
        <Icon className={iconClass} aria-hidden />
        <span className="sr-only">{trendLabel} </span>
        <span className={deltaValueClass}>{deltaText}</span>
      </span>
      <span>vs. período anterior</span>
    </p>
  )
}

export function StatisticsCompareKpiRow({
  metrics,
  loading,
}: {
  metrics: StatisticsCompareMetric[]
  loading?: boolean
}) {
  if (!metrics.length && !loading) return null

  const displayCount = loading ? Math.max(metrics.length, 3) : metrics.length
  const displayMetrics = (
    loading
      ? Array.from({ length: displayCount }).map((_, i) => ({
          id: `sk-${i}`,
          label: "—",
          value: 0,
          previousValue: 0,
          deltaPercent: null,
          deltaPoints: null,
          format: "number" as const,
        }))
      : metrics
  ) as StatisticsCompareMetric[]

  return (
    <div className={cn("grid w-full gap-3", kpiGridClass(displayCount))}>
      {displayMetrics.map((metric) => (
        <div
          key={metric.id}
          className={cn(
            statisticsLosetaCardClass,
            statisticsLosetaCardBodyCompactClass,
            "min-w-0",
          )}
        >
          <p className={dataWorkspaceEntityCardStatLabelClass}>{metric.label}</p>
          <ReportStatValue loading={loading}>
            {formatValue(metric.value, metric.format)}
          </ReportStatValue>
          {!loading ? (
            <StatisticsDeltaIndicator metric={metric} />
          ) : (
            <p className="mt-2 text-xs text-rootsy-bruma-500">—</p>
          )}
        </div>
      ))}
    </div>
  )
}
