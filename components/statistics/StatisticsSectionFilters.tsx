"use client"

import { StatisticsPeriodToolbar } from "@/components/statistics/StatisticsPeriodToolbar"
import type { StatisticsFilters } from "@/app/[siteId]/[popId]/statistics/actions"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
} from "@/components/rootsy-form"
import { dataWorkspaceListFiltersFieldClass } from "@/components/data-workspace/dataWorkspaceTablesLayout"
import type { SummaryDatePreset } from "@/lib/summaryDateFilter"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"

const CHANNEL_OPTIONS = ["POS", "Mostrador", "Mesas"] as const

export function StatisticsSectionFilters({
  preset,
  customRange,
  bounds,
  filters,
  showChannel,
  onPresetChange,
  onCustomRangeChange,
  onFiltersChange,
  className,
}: {
  preset: SummaryDatePreset
  customRange: DateRange | undefined
  bounds: { from: string | null; to: string | null }
  filters: StatisticsFilters
  showChannel: boolean
  onPresetChange: (preset: SummaryDatePreset) => void
  onCustomRangeChange: (range: DateRange | undefined) => void
  onFiltersChange: (filters: StatisticsFilters) => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex w-full shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-end lg:w-auto",
        className,
      )}
    >
      {showChannel ? (
        <div className="w-full min-w-0 sm:w-40 sm:shrink-0">
          <RootsFormSelectField
            label="Canal"
            value={filters.channel ?? "all"}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                channel: value === "all" ? null : value,
              })
            }
            className={dataWorkspaceListFiltersFieldClass()}
          >
            <RootsFormSelectItem value="all">Todos</RootsFormSelectItem>
            {CHANNEL_OPTIONS.map((option) => (
              <RootsFormSelectItem key={option} value={option}>
                {option}
              </RootsFormSelectItem>
            ))}
          </RootsFormSelectField>
        </div>
      ) : null}

      <StatisticsPeriodToolbar
        embedded
        showLabel
        preset={preset}
        customRange={customRange}
        bounds={bounds}
        onPresetChange={onPresetChange}
        onCustomRangeChange={onCustomRangeChange}
      />
    </div>
  )
}
