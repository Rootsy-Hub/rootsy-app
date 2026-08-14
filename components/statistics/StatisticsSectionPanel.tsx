"use client"

import type { StatisticsSectionData } from "@/app/[siteId]/[popId]/statistics/actions"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import { StatisticsCompareKpiRow } from "@/components/statistics/StatisticsCompareKpiRow"
import { StatisticsEvolutionChart } from "@/components/statistics/StatisticsEvolutionChart"
import { StatisticsHourlyHeatmap } from "@/components/statistics/StatisticsHourlyHeatmap"
import { StatisticsRankTable } from "@/components/statistics/StatisticsRankTable"
import { StatisticsSegmentList } from "@/components/statistics/StatisticsSegmentList"
import {
  statisticsLosetaCardBodyClass,
  statisticsLosetaCardClass,
  statisticsSectionHeadingClassNames,
  statisticsSectionPageTitleClass,
  statisticsUpcomingItemClass,
} from "@/components/statistics/statisticsWorkspaceStyles"
import { StatisticsSectionFilters } from "@/components/statistics/StatisticsSectionFilters"
import type { StatisticsFilters } from "@/app/[siteId]/[popId]/statistics/actions"
import type { SummaryDatePreset } from "@/lib/summaryDateFilter"
import type { StatisticsSectionDef } from "@/lib/statisticsCatalog"
import { cn } from "@/lib/utils"
import { Clock, Info } from "lucide-react"
import type { DateRange } from "react-day-picker"
import type { ReactNode } from "react"

const STATISTICS_HOURLY_SECTIONS = new Set<StatisticsSectionData["sectionId"]>([
  "sales",
  "channels",
  "clients",
  "finance",
])

function StatisticsSectionHeading({
  title,
  description,
  className,
  prominent = false,
}: {
  title: string
  description?: string
  className?: string
  prominent?: boolean
}) {
  const { title: blockTitleClass, description: descriptionClass } =
    statisticsSectionHeadingClassNames()

  return (
    <div className={cn("mb-3 space-y-1", className)}>
      <h2
        className={prominent ? statisticsSectionPageTitleClass : blockTitleClass}
      >
        {title}
      </h2>
      {description ? <p className={descriptionClass}>{description}</p> : null}
    </div>
  )
}

function StatisticsSectionTitleRow({
  title,
  description,
  filters,
}: {
  title: string
  description?: string
  filters?: ReactNode
}) {
  return (
    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
      <StatisticsSectionHeading
        title={title}
        description={description}
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
        description="Rootsy aún no expone métricas analíticas para este módulo. Podés ver el resumen operativo en Resumen o los reportes detallados en Reportes."
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

  const comingSoon = isComingSoonSection(data, section)
  const showHourlyChart =
    section?.id != null && STATISTICS_HOURLY_SECTIONS.has(section.id)
  const showParticipation = !filters.channel

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
        title={data?.title ?? section?.label ?? "—"}
        description={data?.description ?? section?.description}
        filters={sectionFilters}
      />

      <section>
        <StatisticsCompareKpiRow
          metrics={data?.comparison ?? []}
          loading={loading}
        />
      </section>

      <div className="grid items-stretch gap-6 lg:grid-cols-12">
        <section
          className={cn(
            "flex min-h-0 h-full",
            showParticipation ? "lg:col-span-8" : "lg:col-span-12",
          )}
        >
          <StatisticsEvolutionChart
            title="Evolución diaria"
            description="Comportamiento en el tiempo dentro del período"
            points={data?.evolution ?? []}
            loading={loading}
            valueFormat={rankFormat}
          />
        </section>
        {showParticipation ? (
          <section className="flex min-h-0 h-full lg:col-span-4">
            <StatisticsSegmentList
              title="Participación"
              description="Distribución por segmento dentro del total"
              segments={data?.segments ?? []}
              loading={loading}
              valueFormat={rankFormat}
            />
          </section>
        ) : null}
      </div>

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
            loading={loading}
            valueFormat={rankFormat}
            emptyMessage="Sin ventas por hora en este período"
          />
        </section>
      ) : null}

      <section>
        <StatisticsRankTable
          title={
            data?.sectionId === "sales"
              ? "Ranking de vendedores"
              : "Ranking"
          }
          description={
            data?.sectionId === "sales"
              ? "Top vendedores del período"
              : "Top 10 del período"
          }
          rows={data?.rankings ?? []}
          loading={loading}
          valueFormat={rankFormat}
        />
      </section>

      <StatisticsUpcomingMetrics items={data?.unavailable ?? []} />
    </div>
  )
}
