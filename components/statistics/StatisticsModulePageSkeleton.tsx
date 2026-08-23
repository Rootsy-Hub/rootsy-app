"use client"

import type { StatisticsFilters } from "@/app/[siteId]/[popId]/statistics/actions"
import {
  BlocksModulePageSkeleton,
  type PopModuleSkeletonLayout,
} from "@/components/pop-workspace/popModuleSkeletonShell"
import { StatisticsSectionNav } from "@/components/statistics/StatisticsSectionNav"
import { StatisticsSectionPanel } from "@/components/statistics/StatisticsSectionPanel"
import {
  statisticsMainContentClass,
  statisticsNavAsideClass,
  statisticsNavScrollClass,
} from "@/components/statistics/statisticsWorkspaceStyles"
import {
  STATISTICS_SECTIONS,
  statisticsSectionById,
} from "@/lib/statisticsCatalog"
import {
  resolveStatisticsSectionId,
  STATISTICS_SECTION_QUERY_PARAM,
  statisticsSectionHref,
} from "@/lib/statisticsUrl"
import { useSearchParams } from "next/navigation"

const EMPTY_FILTERS: StatisticsFilters = {
  channel: null,
  seller: null,
  client: null,
  supplier: null,
  product: null,
  category: null,
  paymentMethod: null,
}

const SECTION_IDS = STATISTICS_SECTIONS.map((section) => section.id)

export function StatisticsModulePageSkeleton(layout: PopModuleSkeletonLayout) {
  const searchParams = useSearchParams()
  const sectionFromWindow =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get(
          STATISTICS_SECTION_QUERY_PARAM,
        )
      : null
  const sectionId = resolveStatisticsSectionId(
    searchParams.get(STATISTICS_SECTION_QUERY_PARAM) ?? sectionFromWindow,
    SECTION_IDS,
  )
  const section = statisticsSectionById(sectionId)

  return (
    <BlocksModulePageSkeleton
      layout={layout}
      title="Estadísticas"
      mainClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
      mainMaxWidthClass="max-w-[88rem]"
      contentClassName={null}
    >
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:overflow-hidden">
        <aside className={statisticsNavAsideClass}>
          <div className={statisticsNavScrollClass}>
            <StatisticsSectionNav
              sections={STATISTICS_SECTIONS}
              activeSectionId={sectionId}
              getSectionHref={(id) =>
                statisticsSectionHref(layout.siteId, layout.popId, id)
              }
            />
          </div>
        </aside>
        <div className={statisticsMainContentClass}>
          <StatisticsSectionPanel
            section={section}
            data={null}
            loading
            detailsLoading
            preset="this_month"
            customRange={undefined}
            bounds={{ from: null, to: null }}
            filters={EMPTY_FILTERS}
            showChannel={Boolean(section?.filterKeys?.includes("channel"))}
            onPresetChange={() => {}}
            onCustomRangeChange={() => {}}
            onFiltersChange={() => {}}
          />
        </div>
      </div>
    </BlocksModulePageSkeleton>
  )
}
