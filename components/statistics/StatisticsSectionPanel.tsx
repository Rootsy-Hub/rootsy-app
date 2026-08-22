"use client"

import type { StatisticsSectionData } from "@/app/[siteId]/[popId]/statistics/actions"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import { StatisticsCompareKpiRow } from "@/components/statistics/StatisticsCompareKpiRow"
import { StatisticsEvolutionChart } from "@/components/statistics/StatisticsEvolutionChart"
import { StatisticsCostDistributionChart } from "@/components/statistics/StatisticsCostDistributionChart"
import { StatisticsInventorySectionBlock } from "@/components/statistics/StatisticsInventorySectionBlock"
import { StatisticsClientsSectionBlock } from "@/components/statistics/StatisticsClientsSectionBlock"
import { StatisticsSuppliersSectionBlock } from "@/components/statistics/StatisticsSuppliersSectionBlock"
import { StatisticsProductsSectionBlock } from "@/components/statistics/StatisticsProductsSectionBlock"
import { StatisticsEfficiencyIndicators } from "@/components/statistics/StatisticsEfficiencyIndicators"
import { StatisticsCommitmentsSection } from "@/components/statistics/StatisticsCommitmentsSection"
import { StatisticsProfitabilityFormulaSubtitle } from "@/components/statistics/StatisticsProfitabilityFormulaSubtitle"
import { StatisticsHourlyHeatmap } from "@/components/statistics/StatisticsHourlyHeatmap"
import { StatisticsRankTable } from "@/components/statistics/StatisticsRankTable"
import { StatisticsSegmentList } from "@/components/statistics/StatisticsSegmentList"
import {
  statisticsLosetaCardBodyClass,
  statisticsLosetaCardClass,
  statisticsSectionHeadingClassNames,
  statisticsSectionOperationalDayMetaClass,
  statisticsSectionPageSubtitleClass,
  statisticsSectionPageTitleClass,
  statisticsUpcomingItemClass,
} from "@/components/statistics/statisticsWorkspaceStyles"
import { StatisticsSectionFilters } from "@/components/statistics/StatisticsSectionFilters"
import { RootsSpinner } from "@/components/rootsy-spinner"
import type { StatisticsFilters } from "@/app/[siteId]/[popId]/statistics/actions"
import type { SummaryDatePreset } from "@/lib/summaryDateFilter"
import type { StatisticsSectionDef } from "@/lib/statisticsCatalog"
import { cn } from "@/lib/utils"
import { Clock, Info } from "lucide-react"
import type { DateRange } from "react-day-picker"
import type { ReactNode } from "react"

const STATISTICS_HOURLY_SECTIONS = new Set<StatisticsSectionData["sectionId"]>([
  "sales",
])

const STATISTICS_OPERATIONAL_DAY_SECTIONS = new Set<
  StatisticsSectionData["sectionId"]
>(["sales", "products", "clients", "purchases", "suppliers", "finance"])

function StatisticsSectionHeading({
  title,
  description,
  meta,
  className,
  prominent = false,
}: {
  title: string
  description?: ReactNode
  meta?: ReactNode
  className?: string
  prominent?: boolean
}) {
  const { title: blockTitleClass, description: descriptionClass } =
    statisticsSectionHeadingClassNames()

  const pageDescriptionClass = prominent
    ? statisticsSectionPageSubtitleClass
    : descriptionClass

  return (
    <div className={cn("mb-3 space-y-1", className)}>
      <h2
        className={prominent ? statisticsSectionPageTitleClass : blockTitleClass}
      >
        {title}
      </h2>
      {description ? (
        typeof description === "string" ? (
          <p className={pageDescriptionClass}>{description}</p>
        ) : (
          <div className={pageDescriptionClass}>{description}</div>
        )
      ) : null}
      {meta ? (
        <div className={statisticsSectionOperationalDayMetaClass}>{meta}</div>
      ) : null}
    </div>
  )
}

function StatisticsSectionTitleRow({
  title,
  description,
  meta,
  filters,
}: {
  title: string
  description?: ReactNode
  meta?: ReactNode
  filters?: ReactNode
}) {
  return (
    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
      <StatisticsSectionHeading
        title={title}
        description={description}
        meta={meta}
        className="mb-0 min-w-0 flex-1"
        prominent
      />
      {filters}
    </div>
  )
}

function isComingSoonSection(
  data: StatisticsSectionData | null,
  section: StatisticsSectionDef | undefined,
): boolean {
  if (section?.comingSoon) return true
  if (!data) return false
  return (
    data.comparison.length === 0 &&
    data.evolution.length === 0 &&
    data.segments.length === 0 &&
    data.rankings.length === 0 &&
    data.unavailable.length > 0
  )
}

function StatisticsComingSoonPanel({
  section,
  unavailable,
}: {
  section: StatisticsSectionDef
  unavailable: string[]
}) {
  return (
    <div className={cn(statisticsLosetaCardClass, "overflow-hidden p-2 sm:p-4")}>
      <DataWorkspaceDetailEmptyState
        icon={Clock}
        title={`${section.label} · próximamente`}
        description="Rootsy aún no expone métricas analíticas para este módulo. Podés ver los reportes detallados en Reportes."
        className="py-12"
      />
      {unavailable.length > 0 ? (
        <ul className="mx-auto grid max-w-lg gap-2 pb-4 sm:grid-cols-2">
          {unavailable.map((item) => (
            <li key={item} className={statisticsUpcomingItemClass}>
              <Info className="size-4 shrink-0 text-rootsy-bruma-500" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function StatisticsUpcomingMetrics({ items }: { items: string[] }) {
  if (!items.length) return null

  return (
    <div className={cn(statisticsLosetaCardClass, statisticsLosetaCardBodyClass)}>
      <StatisticsSectionHeading
        title="Próximamente en esta sección"
        description="Métricas planificadas que aún no están disponibles"
      />
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className={statisticsUpcomingItemClass}>
            <Info className="size-4 shrink-0 text-rootsy-bruma-500" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function StatisticsSectionPanel({
  section,
  data,
  loading,
  detailsLoading,
  preset,
  customRange,
  bounds,
  filters,
  showChannel,
  onPresetChange,
  onCustomRangeChange,
  onFiltersChange,
}: {
  section: StatisticsSectionDef | undefined
  data: StatisticsSectionData | null
  loading?: boolean
  detailsLoading?: boolean
  preset: SummaryDatePreset
  customRange: DateRange | undefined
  bounds: { from: string | null; to: string | null }
  filters: StatisticsFilters
  showChannel: boolean
  onPresetChange: (preset: SummaryDatePreset) => void
  onCustomRangeChange: (range: DateRange | undefined) => void
  onFiltersChange: (filters: StatisticsFilters) => void
}) {
  const rankFormat =
    data?.sectionId === "inventory" ? ("number" as const) : ("money" as const)

  const chartsLoading = Boolean(loading || detailsLoading)
  const sectionDataReady =
    Boolean(data) && data!.sectionId === section?.id && !loading

  const comingSoon = isComingSoonSection(data, section)
  const showHourlyChart =
    section?.id != null && STATISTICS_HOURLY_SECTIONS.has(section.id)
  const isProfitabilitySection = section?.id === "profitability"
  const isPurchasesSection = section?.id === "purchases"
  const isFinanceSection = section?.id === "finance"
  const isProductsSection = section?.id === "products"
  const isInventorySection = section?.id === "inventory"
  const isClientsSection = section?.id === "clients"
  const isSuppliersSection = section?.id === "suppliers"
  const showSidePanel = !filters.channel
  const usesOperationalDay =
    section?.id != null && STATISTICS_OPERATIONAL_DAY_SECTIONS.has(section.id)

  const operationalDayCloseMeta = usesOperationalDay ? (
    <>
      <span>Hora de cierre del día operativo:</span>
      <span className="inline-flex items-center gap-1 font-numeric tabular-nums">
        <Clock className="size-3.5 shrink-0" aria-hidden />
        {data?.operationalDayCloseTime ? (
          data.operationalDayCloseTime
        ) : (
          <RootsSpinner
            size="sm"
            label="Cargando hora de cierre"
            aria-hidden
            className="shrink-0"
          />
        )}
      </span>
    </>
  ) : undefined

  const sectionFilters = (
    <StatisticsSectionFilters
      preset={preset}
      customRange={customRange}
      bounds={bounds}
      filters={filters}
      showChannel={showChannel}
      onPresetChange={onPresetChange}
      onCustomRangeChange={onCustomRangeChange}
      onFiltersChange={onFiltersChange}
    />
  )

  if (comingSoon && section) {
    return (
      <div className="flex flex-col gap-6">
        <StatisticsSectionTitleRow
          title={section.label}
          description={section.description}
          filters={sectionFilters}
        />
        <StatisticsComingSoonPanel
          section={section}
          unavailable={data?.unavailable ?? []}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <StatisticsSectionTitleRow
        title={
          sectionDataReady && data?.title
            ? data.title
            : section?.label ?? "—"
        }
        description={
          usesOperationalDay ? undefined : isProfitabilitySection ? (
            <StatisticsProfitabilityFormulaSubtitle />
          ) : sectionDataReady ? (
            data?.description
          ) : (
            section?.description
          )
        }
        meta={operationalDayCloseMeta}
        filters={sectionFilters}
      />

      <section>
        <StatisticsCompareKpiRow
          metrics={data?.comparison ?? []}
          loading={loading}
          sectionId={section?.id}
          metricsSectionId={data?.sectionId}
        />
      </section>

      {isProductsSection ? (
        <StatisticsProductsSectionBlock data={data} loading={chartsLoading} />
      ) : isInventorySection ? (
        <StatisticsInventorySectionBlock data={data} loading={chartsLoading} />
      ) : isClientsSection ? (
        <StatisticsClientsSectionBlock data={data} loading={chartsLoading} />
      ) : isSuppliersSection ? (
        <StatisticsSuppliersSectionBlock data={data} loading={chartsLoading} />
      ) : (
        <>
      <div className="grid items-stretch gap-6 lg:grid-cols-12">
        <section
          className={cn(
            "flex min-h-0 h-full",
            showSidePanel ? "lg:col-span-8" : "lg:col-span-12",
          )}
        >
          <StatisticsEvolutionChart
            title="Evolución diaria"
            description={
              data?.sectionId === "sales"
                ? "Ventas por día operativo"
                : data?.sectionId === "purchases"
                  ? "Importe y operaciones por día operativo"
                : data?.sectionId === "profitability"
                  ? "Ganancia bruta y margen por día"
                : data?.sectionId === "finance"
                  ? "Ingresos y egresos por día operativo en tesorería"
                  : "Comportamiento en el tiempo dentro del período"
            }
            points={data?.evolution ?? []}
            loading={chartsLoading}
            valueFormat={rankFormat}
            dualSeries={
              data?.sectionId === "sales"
                ? {
                    primaryLabel: "Total vendido",
                    secondaryLabel: "Cantidad de ventas",
                    secondaryFormat: "number",
                  }
                : data?.sectionId === "purchases"
                  ? {
                      primaryLabel: "Total comprado",
                      secondaryLabel: "Cantidad de operaciones",
                      secondaryFormat: "number",
                    }
                : data?.sectionId === "profitability"
                  ? {
                      primaryLabel: "Ganancia bruta",
                      secondaryLabel: "Margen",
                      secondaryFormat: "percent",
                    }
                : data?.sectionId === "finance"
                  ? {
                      primaryLabel: "Ingresos",
                      secondaryLabel: "Egresos",
                      secondaryFormat: "money",
                    }
                  : undefined
            }
          />
        </section>
        {showSidePanel ? (
          <section className="flex min-h-0 h-full lg:col-span-4">
            {isProfitabilitySection ? (
              <StatisticsCostDistributionChart
                title="Distribución de costos"
                description="Costo de ventas agrupado por tipo de artículo"
                segments={
                  data?.sectionId === "profitability"
                    ? data.costDistribution ?? []
                    : []
                }
                loading={chartsLoading}
              />
            ) : isPurchasesSection ? (
              <StatisticsCostDistributionChart
                title="Distribución de compras"
                description="Compras agrupadas por tipo de artículo"
                segments={
                  data?.sectionId === "purchases"
                    ? data.purchaseDistribution ?? []
                    : []
                }
                loading={chartsLoading}
                emptyMessage="Sin compras clasificadas por tipo en este período"
              />
            ) : (
              <StatisticsSegmentList
                title={isFinanceSection ? "Participación por cuenta" : "Participación"}
                description={
                  isFinanceSection
                    ? "Ingresos por cuenta de tesorería en el período"
                    : "Distribución por segmento dentro del total"
                }
                segments={data?.segments ?? []}
                loading={chartsLoading}
                valueFormat={rankFormat}
              />
            )}
          </section>
        ) : null}
      </div>
        </>
      )}

      {isProfitabilitySection ? (
        <StatisticsEfficiencyIndicators
          metrics={
            data?.sectionId === "profitability"
              ? data.efficiencyRatios ?? []
              : []
          }
          loading={loading}
        />
      ) : null}

      {isFinanceSection ? (
        <StatisticsCommitmentsSection
          metrics={
            data?.sectionId === "finance" ? data.commitmentMetrics ?? [] : []
          }
          loading={loading}
        />
      ) : null}

      {showHourlyChart ? (
        <section>
          <StatisticsHourlyHeatmap
            title="Mapa horario"
            description="Promedio de ventas por día de la semana y hora del día operativo"
            heatmap={
              data?.hourlyHeatmap ?? {
                days: [],
                hours: [],
                cells: [],
                maxValue: 0,
              }
            }
            loading={chartsLoading}
            valueFormat={rankFormat}
            emptyMessage="Sin ventas por hora en este período"
          />
        </section>
      ) : null}

      {!isProfitabilitySection &&
      !isProductsSection &&
      !isInventorySection &&
      !isClientsSection &&
      !isSuppliersSection &&
      !isFinanceSection ? (
        <section>
          <StatisticsRankTable
            title={
              data?.sectionId === "sales"
                ? "Ranking de vendedores"
                : data?.sectionId === "purchases"
                  ? "Ranking de compradores"
                  : "Ranking"
            }
            description={
              data?.sectionId === "sales"
                ? "Top vendedores del período"
                : data?.sectionId === "purchases"
                  ? "Usuarios que más compraron en el período"
                  : "Top 10 del período"
            }
            rows={data?.rankings ?? []}
            loading={chartsLoading}
            valueFormat={rankFormat}
          />
        </section>
      ) : null}

      <StatisticsUpcomingMetrics items={data?.unavailable ?? []} />
    </div>
  )
}
