"use client"

import { DataWorkspacePeriodFilter } from "@/components/data-workspace/DataWorkspacePeriodFilter"
import {
  computeDataWorkspaceDateBounds,
  type DataWorkspaceDatePreset,
} from "@/lib/dataWorkspaceDateFilter"
import { useMemo, useState } from "react"
import type { DateRange } from "react-day-picker"

type Variant = "layout" | "compact" | "panel"

type Props = {
  variant: Variant
  initialPreset?: DataWorkspaceDatePreset
  initialCustomRange?: DateRange
}

export function FormsPeriodFilterLiveDemo({
  variant,
  initialPreset = "this_month",
  initialCustomRange,
}: Props) {
  const [preset, setPreset] = useState<DataWorkspaceDatePreset>(initialPreset)
  const [customRange, setCustomRange] = useState<DateRange | undefined>(initialCustomRange)
  const bounds = useMemo(
    () => computeDataWorkspaceDateBounds(preset, customRange),
    [preset, customRange],
  )

  return (
    <DataWorkspacePeriodFilter
      variant={variant}
      preset={preset}
      customRange={customRange}
      onPresetChange={setPreset}
      onCustomRangeChange={setCustomRange}
      bounds={bounds}
    />
  )
}
