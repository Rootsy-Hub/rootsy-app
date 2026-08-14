"use client"

import { ReportStatValue } from "@/components/reports/ReportStatValue"
import { dataWorkspaceEntityCardStatLabelClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  StatisticsKpiDeltaIndicator,
  statisticsKpiDeltaSlotClass,
} from "@/components/statistics/StatisticsCompareKpiRow"
import type { StatisticsCompareMetric } from "@/app/[siteId]/[popId]/statistics/actions"
import {
  statisticsLosetaCardBodyCompactClass,
  statisticsLosetaCardClass,
  statisticsSectionHeadingClassNames,
} from "@/components/statistics/statisticsWorkspaceStyles"
import { cn } from "@/lib/utils"

const EFFICIENCY_SKELETON: Pick<StatisticsCompareMetric, "id" | "label">[] = [
  { id: "margin-on-sales", label: "Margen sobre ventas" },
  { id: "costs-on-sales", label: "Costos sobre ventas" },
  { id: "expenses-on-sales", label: "Gastos sobre ventas" },
  { id: "result-on-sales", label: "Resultado sobre ventas" },
]

function skeletonMetrics(): StatisticsCompareMetric[] {
  return EFFICIENCY_SKELETON.map((item) => ({
    ...item,
    value: 0,
    previousValue: 0,
    deltaPercent: null,
    deltaPoints: null,
    format: "percent" as const,
  }))
}

function formatPercent(value: number): string {
  return `${value.toLocaleString("es-AR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} %`
}

function resolveDisplayMetrics(
  metrics: StatisticsCompareMetric[],
  loading?: boolean,
): StatisticsCompareMetric[] {
  if (!loading) return metrics.length > 0 ? metrics : skeletonMetrics()
  return metrics.length > 0 ? metrics : skeletonMetrics()
}

export function StatisticsEfficiencyIndicators({
  metrics,
  loading,
}: {
  metrics: StatisticsCompareMetric[]
  loading?: boolean
}) {
  const displayMetrics = resolveDisplayMetrics(metrics, loading)

  if (!displayMetrics.length && !loading) return null

  const { title: titleClass, description: descriptionClass } =
    statisticsSectionHeadingClassNames()

  return (
    <section>
      <div className="mb-3">
        <h3 className={titleClass}>Indicadores de eficiencia</h3>
        <p className={descriptionClass}>
          Porcentaje de cada concepto sobre las ventas del período
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
              {formatPercent(metric.value)}
            </ReportStatValue>
            <div className={statisticsKpiDeltaSlotClass}>
              <StatisticsKpiDeltaIndicator metric={metric} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
