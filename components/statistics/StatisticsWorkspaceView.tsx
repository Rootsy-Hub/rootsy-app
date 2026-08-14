"use client"

import {
  getStatisticsSectionData,
  type StatisticsFilters,
  type StatisticsSectionData,
} from "@/app/[siteId]/[popId]/statistics/actions"
import { StatisticsFiltersToolbar } from "@/components/statistics/StatisticsFiltersToolbar"
import { StatisticsSectionNav } from "@/components/statistics/StatisticsSectionNav"
import { StatisticsSectionPanel } from "@/components/statistics/StatisticsSectionPanel"
import {
  visibleStatisticsSections,
  type StatisticsSectionId,
} from "@/lib/statisticsCatalog"
import {
  computeSummaryDateBounds,
  type SummaryDatePreset,
} from "@/lib/summaryDateFilter"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { DateRange } from "react-day-picker"

const EMPTY_FILTERS: StatisticsFilters = {
  channel: null,
  seller: null,
  client: null,
  supplier: null,
  product: null,
  category: null,
  paymentMethod: null,
}

type Props = {
  popId: string
  enabledModuleKeys: string[]
}

export function StatisticsWorkspaceView({ popId, enabledModuleKeys }: Props) {
  const sections = useMemo(
    () => visibleStatisticsSections(enabledModuleKeys),
    [enabledModuleKeys],
  )

  const [activeSectionId, setActiveSectionId] = useState<StatisticsSectionId>(
    sections[0]?.id ?? "sales",
  )
  const [preset, setPreset] = useState<SummaryDatePreset>("this_month")
  const [customRange, setCustomRange] = useState<DateRange | undefined>(
    undefined,
  )
  const [compareEnabled, setCompareEnabled] = useState(true)
  const [filters, setFilters] = useState<StatisticsFilters>(EMPTY_FILTERS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<StatisticsSectionData | null>(null)

  const bounds = useMemo(
    () => computeSummaryDateBounds(preset, customRange),
    [preset, customRange],
  )

  useEffect(() => {
    if (!sections.some((s) => s.id === activeSectionId) && sections[0]) {
      setActiveSectionId(sections[0].id)
    }
  }, [sections, activeSectionId])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await getStatisticsSectionData({
      popId,
      sectionId: activeSectionId,
      preset,
      from: bounds.from,
      to: bounds.to,
      compareEnabled,
      filters,
    })
    if (!res.success) {
      setError(res.error)
      setData(null)
    } else {
      setData(res.data)
    }
    setLoading(false)
  }, [
    popId,
    activeSectionId,
    preset,
    bounds.from,
    bounds.to,
    compareEnabled,
    filters,
  ])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="flex flex-col gap-6">
      <StatisticsFiltersToolbar
        preset={preset}
        customRange={customRange}
        bounds={bounds}
        compareEnabled={compareEnabled}
        filters={filters}
        onPresetChange={setPreset}
        onCustomRangeChange={setCustomRange}
        onCompareEnabledChange={setCompareEnabled}
        onFiltersChange={setFilters}
      />

      {error ? (
        <p className="rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <StatisticsSectionNav
          sections={sections}
          activeSectionId={activeSectionId}
          onSelect={(id) => setActiveSectionId(id as StatisticsSectionId)}
        />
        <StatisticsSectionPanel
          data={data}
          loading={loading}
          compareEnabled={compareEnabled}
        />
      </div>
    </div>
  )
}
