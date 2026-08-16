"use client"

import type { StatisticsSectionData } from "@/app/[siteId]/[popId]/statistics/actions"
import { StatisticsCostDistributionChart } from "@/components/statistics/StatisticsCostDistributionChart"
import { StatisticsEvolutionChart } from "@/components/statistics/StatisticsEvolutionChart"
import { StatisticsInventoryValueSunburstChart } from "@/components/statistics/StatisticsInventoryValueSunburstChart"

type Props = {
  data: StatisticsSectionData | null
  loading?: boolean
}

export function StatisticsInventorySectionBlock({ data, loading }: Props) {
  const sectionData = data?.sectionId === "inventory" ? data : null
  const evolutionPoints = sectionData?.evolution ?? []

  return (
    <>
      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        <section className="flex min-h-0 h-full">
          <StatisticsCostDistributionChart
            title="Artículos por nivel de stock"
            description="Proporción de artículos con stock según mínimo configurado"
            segments={sectionData?.stockLevelDistribution ?? []}
            loading={loading}
            emptyMessage="Sin artículos con stock en este período"
            externalLabelShowsAmount
            segmentValueFormat="number"
            preserveSegmentOrder
          />
        </section>
        <section className="flex min-h-0 h-full">
          <StatisticsInventoryValueSunburstChart
            title="Valor del inventario"
            description="Total, tipo de artículo, categoría y artículo"
            root={sectionData?.inventoryValueSunburst}
            loading={loading}
            emptyMessage="Sin artículos valorizados en este período"
          />
        </section>
      </div>

      <section>
        <StatisticsEvolutionChart
          title="Movimientos de stock por día"
          description="Unidades ingresadas y egresadas por día en el período"
          points={evolutionPoints}
          loading={loading}
          valueFormat="number"
          dualSeries={{
            primaryLabel: "Ingresos",
            secondaryLabel: "Egresos",
            secondaryFormat: "number",
          }}
          emptyMessage="Sin movimientos de stock en este período"
          axisLabelInterval={evolutionPoints.length > 14 ? 1 : 0}
        />
      </section>
    </>
  )
}
