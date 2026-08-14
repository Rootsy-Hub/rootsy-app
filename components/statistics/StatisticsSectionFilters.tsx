"use client"

import { SummaryPeriodToolbar } from "@/components/summary/SummaryPeriodToolbar"
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
        "flex shrink-0 flex-wrap items-start justify-end gap-2",
        className,
      )}
    >
      <SummaryPeriodToolbar
        embedded
        preset={preset}
        customRange={customRange}
        bounds={bounds}
        onPresetChange={onPresetChange}
        onCustomRangeChange={onCustomRangeChange}
      />

      {showChannel ? (
        <div className="w-42 shrink-0">
          <RootsFormSelectField
            label="Canal de venta"
            value={filters.channel ?? "all"}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                channel: value === "all" ? null : value,
              })
            }
            className={dataWorkspaceListFiltersFieldClass(true)}
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
    </div>
  )
}
