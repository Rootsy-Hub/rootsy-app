"use client"

import type {
  StatisticsFilters,
  StatisticsSectionData,
} from "@/app/[siteId]/[popId]/statistics/actions"
import {
  dataWorkspaceBlocksPageMainClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  statisticsMainContentClass,
  statisticsNavAsideClass,
  statisticsNavScrollClass,
} from "@/components/statistics/statisticsWorkspaceStyles"
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
  mergeStatisticsSectionQuery,
  resolveStatisticsSectionId,
  STATISTICS_SECTION_QUERY_PARAM,
  statisticsSectionHref,
} from "@/lib/statisticsUrl"
import {
  computePreviousSummaryDateBounds,
  computeSummaryDateBounds,
  type SummaryDatePreset,
} from "@/lib/summaryDateFilter"
import {
  buildComingSoonStatisticsSection,
  fetchStatisticsSectionDetails,
  fetchStatisticsSectionSummary,
  isComingSoonStatisticsSection,
  mergeStatisticsSectionData,
} from "@/lib/rootsyApi/statisticsClient"
import { useIsHydrated } from "@/hooks/useIsHydrated"
import { cn } from "@/lib/utils"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const hydrated = useIsHydrated()

  const sections = useMemo(
    () =>
      visibleStatisticsSections(hydrated ? enabledModuleKeys : []),
    [enabledModuleKeys, hydrated],
  )

  const visibleSectionIds = useMemo(
    () => sections.map((section) => section.id),
    [sections],
  )

  const requestedSectionId = searchParams.get(STATISTICS_SECTION_QUERY_PARAM)

  const activeSectionId = useMemo(
    () => resolveStatisticsSectionId(requestedSectionId, visibleSectionIds),
    [requestedSectionId, visibleSectionIds],
  )

  const [preset, setPreset] = useState<SummaryDatePreset>("this_month")
  const [customRange, setCustomRange] = useState<DateRange | undefined>(
    undefined,
  )
  const [filters, setFilters] = useState<StatisticsFilters>(EMPTY_FILTERS)
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
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

  const getSectionHref = useCallback(
    (sectionId: StatisticsSectionId) =>
      statisticsSectionHref(siteId, popId, sectionId),
    [siteId, popId],
  )

  useEffect(() => {
    if (!visibleSectionIds.length) return
    if (requestedSectionId !== activeSectionId) {
      router.replace(
        mergeStatisticsSectionQuery(pathname, searchParams, activeSectionId),
        { scroll: false },
      )
    }
  }, [
    activeSectionId,
    pathname,
    requestedSectionId,
    router,
    searchParams,
    visibleSectionIds.length,
  ])

  useEffect(() => {
    setFilters(EMPTY_FILTERS)
  }, [activeSectionId])

  useEffect(() => {
    const requestedSectionId = activeSectionId
    if (isComingSoonStatisticsSection(requestedSectionId)) {
      setLoading(false)
      setDetailsLoading(false)
      setError(null)
      setData(buildComingSoonStatisticsSection(requestedSectionId))
      return
    }

    const controller = new AbortController()
    const prevBounds = computePreviousSummaryDateBounds(preset, bounds)
    const query = {
      from: bounds.from,
      to: bounds.to,
      prevFrom: prevBounds.from,
      prevTo: prevBounds.to,
      channel: filters.channel,
      supplier: filters.supplier,
    }

    async function loadSection() {
      setLoading(true)
      setDetailsLoading(true)
      setError(null)

      try {
        const summaryRes = await fetchStatisticsSectionSummary(
          popId,
          requestedSectionId,
          query,
          controller.signal,
        )
        if (controller.signal.aborted) return

        if (!summaryRes.success) {
          setError(summaryRes.error)
          setData(null)
          setLoading(false)
          setDetailsLoading(false)
          return
        }
        if (summaryRes.data.sectionId !== requestedSectionId) return

        setData(summaryRes.data)
        setLoading(false)

        const detailsRes = await fetchStatisticsSectionDetails(
          popId,
          requestedSectionId,
          query,
          controller.signal,
        )
        if (controller.signal.aborted) return

        if (!detailsRes.success) {
          setError(detailsRes.error)
          setDetailsLoading(false)
          return
        }
        if (detailsRes.data.sectionId !== requestedSectionId) return

        setData(mergeStatisticsSectionData(summaryRes.data, detailsRes.data))
        setDetailsLoading(false)
      } catch (err) {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : "Error desconocido")
        setLoading(false)
        setDetailsLoading(false)
      }
    }

    void loadSection()

    return () => {
      controller.abort()
    }
  }, [
    popId,
    activeSectionId,
    preset,
    bounds,
    filters.channel,
    filters.supplier,
  ])

  const handleSectionClick = useCallback(
    (sectionId: StatisticsSectionId) => {
      if (sectionId === activeSectionId) return
      setLoading(true)
      setDetailsLoading(true)
      setData(null)
      setError(null)
    },
    [activeSectionId],
  )

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
      mainClassName={cn(
        dataWorkspaceBlocksPageMainClass,
        "flex min-h-0 flex-1 flex-col overflow-hidden",
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:overflow-hidden">
        <aside className={statisticsNavAsideClass}>
          <div className={statisticsNavScrollClass}>
            <StatisticsSectionNav
              sections={sections}
              activeSectionId={activeSectionId}
              getSectionHref={getSectionHref}
              onSectionClick={handleSectionClick}
            />
          </div>
        </aside>

        <div className={statisticsMainContentClass}>
          {bootstrapError ? (
            <div
              role="alert"
              className={cn(
                "mb-6 rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive",
              )}
            >
              Cabecera: {bootstrapError}
            </div>
          ) : null}

          {error ? (
            <p className="mb-6 rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {error}
            </p>
          ) : null}

          <StatisticsSectionPanel
            section={activeSection}
            data={data}
            loading={loading}
            detailsLoading={detailsLoading}
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
