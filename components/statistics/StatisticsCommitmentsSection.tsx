"use client"

import { ReportStatValue } from "@/components/reports/ReportStatValue"
import type { StatisticsCompareMetric } from "@/app/[siteId]/[popId]/statistics/actions"
import { StatisticsKpiLabel } from "@/components/statistics/StatisticsCompareKpiRow"
import {
  statisticsLosetaCardBodyCompactClass,
  statisticsLosetaCardClass,
  statisticsSectionHeadingClassNames,
} from "@/components/statistics/statisticsWorkspaceStyles"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import { cn } from "@/lib/utils"

const COMMITMENT_SKELETON: Pick<StatisticsCompareMetric, "id" | "label">[] = [
  { id: "cc-receivable", label: "Cuentas corrientes por cobrar" },
  { id: "cc-payable", label: "Cuentas corrientes por pagar" },
  { id: "card-receivable", label: "Terminales POS por liquidar" },
  { id: "card-payable", label: "Tarjetas por pagar" },
  { id: "check-receivable", label: "Cheques por cobrar" },
  { id: "check-payable", label: "Cheques por pagar" },
]

function skeletonMetrics(): StatisticsCompareMetric[] {
  return COMMITMENT_SKELETON.map((item) => ({
    ...item,
    value: 0,
    previousValue: 0,
    deltaPercent: null,
    deltaPoints: null,
    format: "money" as const,
  }))
}

function resolveDisplayMetrics(
  metrics: StatisticsCompareMetric[],
  loading?: boolean,
): StatisticsCompareMetric[] {
  if (!loading) return metrics.length > 0 ? metrics : skeletonMetrics()
  return metrics.length > 0 ? metrics : skeletonMetrics()
}

export function StatisticsCommitmentsSection({
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
        <h3 className={titleClass}>Compromisos futuros</h3>
        <p className={descriptionClass}>
          Saldos pendientes de cobro y pago al cierre del período
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
            <ReportStatValue loading={loading}>
              {formatReportMoneyAr(metric.value)}
            </ReportStatValue>
          </div>
        ))}
      </div>
    </section>
  )
}
