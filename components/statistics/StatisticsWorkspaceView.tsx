"use client"

import {
  getStatisticsSectionData,
  type StatisticsFilters,
  type StatisticsSectionData,
} from "@/app/[siteId]/[popId]/statistics/actions"
import {
  dataWorkspaceBlocksContentInnerClass,
  dataWorkspaceBlocksPageMainClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { StatisticsSectionNav } from "@/components/statistics/StatisticsSectionNav"
import { StatisticsSectionPanel } from "@/components/statistics/StatisticsSectionPanel"
import {
  statisticsSectionById,
  visibleStatisticsSections,
  type StatisticsSectionId,
} from "@/lib/statisticsCatalog"
import {
  computeSummaryDateBounds,
  type SummaryDatePreset,
} from "@/lib/summaryDateFilter"
import { cn } from "@/lib/utils"
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
  siteId: string
  popId: string
  popName: string
  enabledModuleKeys: string[]
  loading?: boolean
  userName?: string
  userAvatarSrc?: string
  userRoleLabel?: string
  bootstrapError?: string | null
}

export function StatisticsWorkspaceView({
  siteId,
  popId,
  popName,
  enabledModuleKeys,
  loading: bootstrapLoading,
  userName,
  userAvatarSrc,
  userRoleLabel,
  bootstrapError,
}: Props) {
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
  const [filters, setFilters] = useState<StatisticsFilters>(EMPTY_FILTERS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<StatisticsSectionData | null>(null)

  const activeSection = useMemo(
    () =>
      sections.find((s) => s.id === activeSectionId) ??
      statisticsSectionById(activeSectionId),
    [sections, activeSectionId],
  )

  const bounds = useMemo(
    () => computeSummaryDateBounds(preset, customRange),
    [preset, customRange],
  )

  const showChannel = activeSection?.filterKeys?.includes("channel") ?? false

  useEffect(() => {
    if (!sections.some((s) => s.id === activeSectionId) && sections[0]) {
      setActiveSectionId(sections[0].id)
    }
  }, [sections, activeSectionId])

  useEffect(() => {
    setFilters(EMPTY_FILTERS)
  }, [activeSectionId])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await getStatisticsSectionData({
      popId,
      sectionId: activeSectionId,
      preset,
      from: bounds.from,
      to: bounds.to,
      compareEnabled: true,
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
    filters,
  ])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <DataWorkspaceModuleLayout
      siteId={siteId}
      popId={popId}
      popName={popName}
      title="Estadísticas"
      headerVariant={dataWorkspaceModuleHeaderVariant}
      loading={bootstrapLoading}
      userName={userName}
      userAvatarSrc={userAvatarSrc}
      userRoleLabel={userRoleLabel}
      contentFlush
      mainMaxWidthClass="max-w-[88rem]"
      mainClassName={dataWorkspaceBlocksPageMainClass}
    >
      <div className={dataWorkspaceBlocksContentInnerClass}>
        {bootstrapError ? (
          <div
            role="alert"
            className={cn(
              "rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive",
            )}
          >
            Cabecera: {bootstrapError}
          </div>
        ) : null}

        {error ? (
          <p className="rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}
          </p>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[13rem_minmax(0,1fr)]">
          <StatisticsSectionNav
            sections={sections}
            activeSectionId={activeSectionId}
            onSelect={(id) => setActiveSectionId(id as StatisticsSectionId)}
          />
          <StatisticsSectionPanel
            section={activeSection}
            data={data}
            loading={loading}
            preset={preset}
            customRange={customRange}
            bounds={bounds}
            filters={filters}
            showChannel={showChannel}
            onPresetChange={setPreset}
            onCustomRangeChange={setCustomRange}
            onFiltersChange={setFilters}
          />
        </div>
      </div>
    </DataWorkspaceModuleLayout>
  )
}
