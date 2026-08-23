"use client"

import { ReportStatValue } from "@/components/reports/ReportStatValue"
import {
  dataWorkspaceEntityCardStatLabelClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import type { StatisticsCompareMetric } from "@/app/[siteId]/[popId]/statistics/actions"
import type { StatisticsSectionId } from "@/lib/statisticsCatalog"
import {
  statisticsDeltaNegativeClass,
  statisticsDeltaNeutralClass,
  statisticsDeltaPositiveClass,
  statisticsLosetaCardBodyCompactClass,
  statisticsLosetaCardClass,
} from "@/components/statistics/statisticsWorkspaceStyles"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import { cn } from "@/lib/utils"
import { ArrowDown, ArrowUp, Info, Minus } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type KpiSkeletonDef = {
  id: string
  label: string
  format: StatisticsCompareMetric["format"]
  hint?: string
}

const SECTION_KPI_SKELETONS: Partial<
  Record<StatisticsSectionId, KpiSkeletonDef[]>
> = {
  sales: [
    { id: "total", label: "Ventas", format: "money" },
    { id: "count", label: "Cantidad", format: "number" },
    { id: "ticket", label: "Ticket promedio", format: "money" },
  ],
  profitability: [
    { id: "costs", label: "Costo de ventas", format: "money" },
    { id: "gross", label: "Ganancia bruta", format: "money" },
    { id: "expenses", label: "Gastos", format: "money" },
    { id: "result", label: "Resultado neto", format: "money" },
  ],
  products: [
    { id: "articles", label: "Artículos vendidos", format: "number" },
    { id: "promotions", label: "Promociones vendidas", format: "number" },
    { id: "recipes", label: "Recetas vendidas", format: "number" },
  ],
  purchases: [
    { id: "total", label: "Compras", format: "money" },
    { id: "count", label: "Cantidad", format: "number" },
    { id: "ticket", label: "Ticket promedio", format: "money" },
  ],
  inventory: [
    { id: "value", label: "Valor del inventario", format: "money" },
    { id: "units", label: "Unidades en stock", format: "number" },
    { id: "low", label: "Artículos con stock bajo", format: "number" },
    { id: "empty", label: "Artículos sin stock", format: "number" },
  ],
  clients: [
    { id: "clients", label: "Clientes en ventas", format: "number" },
    { id: "new", label: "Clientes nuevos", format: "number" },
    { id: "recurring", label: "Recurrentes", format: "number" },
    { id: "ticket", label: "Ticket promedio", format: "money" },
  ],
  suppliers: [
    { id: "suppliers", label: "Proveedores en compras", format: "number" },
    { id: "new", label: "Proveedores nuevos", format: "number" },
    { id: "recurring", label: "Recurrentes", format: "number" },
    { id: "ticket", label: "Ticket promedio", format: "money" },
  ],
  finance: [
    { id: "in", label: "Ingresos", format: "money" },
    { id: "out", label: "Egresos", format: "money" },
    { id: "net", label: "Neto", format: "money" },
    { id: "margin", label: "Margen neto", format: "percent" },
  ],
}

function skeletonMetrics(defs: KpiSkeletonDef[]): StatisticsCompareMetric[] {
  return defs.map((def) => ({
    ...def,
    value: 0,
    previousValue: 0,
    deltaPercent: null,
    deltaPoints: null,
  }))
}

export function StatisticsKpiLabel({ metric }: { metric: StatisticsCompareMetric }) {
  if (!metric.hint) {
    return <p className={dataWorkspaceEntityCardStatLabelClass}>{metric.label}</p>
  }

  return (
    <div className="flex items-center gap-1.5">
      <p className={dataWorkspaceEntityCardStatLabelClass}>{metric.label}</p>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex shrink-0 rounded-md text-rootsy-bruma-500 transition-colors hover:text-rootsy-bruma-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-600)_35%,white)]"
            aria-label={`Información sobre ${metric.label}`}
          >
            <Info className="size-3.5" aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          variant="dark"
          sideOffset={6}
          className="max-w-xs text-left leading-relaxed"
        >
          {metric.hint}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

function resolveDisplayMetrics({
  metrics,
  loading,
  sectionId,
  metricsSectionId,
}: {
  metrics: StatisticsCompareMetric[]
  loading?: boolean
  sectionId?: StatisticsSectionId
  metricsSectionId?: StatisticsSectionId
}): StatisticsCompareMetric[] {
  if (!loading) return metrics

  const metricsMatchSection =
    metrics.length > 0 &&
    (!sectionId || !metricsSectionId || metricsSectionId === sectionId)

  if (metricsMatchSection) return metrics

  if (sectionId && SECTION_KPI_SKELETONS[sectionId]) {
    return skeletonMetrics(SECTION_KPI_SKELETONS[sectionId]!)
  }

  return skeletonMetrics(
    Array.from({ length: Math.max(metrics.length, 3) }).map((_, i) => ({
      id: `sk-${i}`,
      label: "—",
      format: "number" as const,
    })),
  )
}

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
  if (metric.format === "percent") {
    if (metric.deltaPoints != null) {
      const sign = metric.deltaPoints > 0 ? "+" : ""
      return `${sign}${metric.deltaPoints.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} pp`
    }
    if (metric.previousValue === 0 && metric.value === 0) return "0,0 pp"
    return null
  }

  if (metric.deltaPercent != null) {
    const sign = metric.deltaPercent > 0 ? "+" : ""
    return `${sign}${metric.deltaPercent.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
  }
  if (metric.previousValue === 0 && metric.value === 0) return "0%"
  return null
}

function getDeltaDirection(metric: StatisticsCompareMetric): DeltaDirection {
  if (metric.format === "percent") {
    if (metric.deltaPoints != null) {
      if (metric.deltaPoints > 0) return "up"
      if (metric.deltaPoints < 0) return "down"
      return "flat"
    }
    return "unknown"
  }

  if (metric.deltaPercent != null) {
    if (metric.deltaPercent > 0) return "up"
    if (metric.deltaPercent < 0) return "down"
    return "flat"
  }

  if (metric.previousValue === 0 && metric.value === 0) return "flat"
  return "unknown"
}

function kpiGridClass(count: number) {
  if (count <= 1) return "grid-cols-1"
  if (count === 2) return "grid-cols-1 sm:grid-cols-2"
  if (count === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
  return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
}

export function StatisticsKpiDeltaIndicator({
  metric,
}: {
  metric: StatisticsCompareMetric
}) {
  const deltaText = formatDelta(metric)
  const direction = getDeltaDirection(metric)
  const hasDelta = deltaText != null

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
    <p className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-rootsy-bruma-500">
      {hasDelta ? (
        <span className="inline-flex min-w-0 items-center gap-1">
          <Icon className={iconClass} aria-hidden />
          <span className="sr-only">{trendLabel} </span>
          <span className={cn(deltaValueClass, "truncate")}>{deltaText}</span>
        </span>
      ) : (
        <span className="shrink-0">—</span>
      )}
      <span className="min-w-0">
        <span className="sm:hidden">vs. ant.</span>
        <span className="hidden sm:inline">vs. período anterior</span>
      </span>
    </p>
  )
}

/** Reserva altura de la fila de variación para que la card no salte al cargar. */
export const statisticsKpiDeltaSlotClass = "mt-2 flex min-h-5 items-center"

export function StatisticsCompareKpiRow({
  metrics,
  loading,
  sectionId,
  metricsSectionId,
}: {
  metrics: StatisticsCompareMetric[]
  loading?: boolean
  sectionId?: StatisticsSectionId
  metricsSectionId?: StatisticsSectionId
}) {
  const displayMetrics = resolveDisplayMetrics({
    metrics,
    loading,
    sectionId,
    metricsSectionId,
  })

  if (!displayMetrics.length && !loading) return null

  return (
    <div
      className={cn(
        "grid w-full gap-3",
        kpiGridClass(displayMetrics.length),
      )}
    >
      {displayMetrics.map((metric) => (
        <div
          key={metric.id}
          className={cn(
            statisticsLosetaCardClass,
            statisticsLosetaCardBodyCompactClass,
            "min-w-0",
          )}
        >
          <StatisticsKpiLabel metric={metric} />
          <ReportStatValue loading={loading} className="truncate">
            {formatValue(metric.value, metric.format)}
          </ReportStatValue>
          <div className={statisticsKpiDeltaSlotClass}>
            <StatisticsKpiDeltaIndicator metric={metric} />
          </div>
        </div>
      ))}
    </div>
  )
}
