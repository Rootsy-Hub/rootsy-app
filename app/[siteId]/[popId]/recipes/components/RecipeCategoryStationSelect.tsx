"use client"

import type { ComandaStationOption } from "@/app/[siteId]/[popId]/recipes/actions"
import {
  RootsFormSelectContent,
  RootsFormSelectItem,
  RootsFormSelectTrigger,
  RootsFormSelectValue,
} from "@/components/rootsy-form"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const NONE_VALUE = "__none__"

type Props = {
  id: string
  label: string
  value: string | null
  stations: ComandaStationOption[]
  disabled?: boolean
  onChange: (stationId: string | null) => void
}

export function RecipeCategoryStationSelect({
  id,
  label,
  value,
  stations,
  disabled = false,
  onChange,
}: Props) {
  return (
    <div
      className="w-40 shrink-0"
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Select
        value={value ?? NONE_VALUE}
        onValueChange={(next) => onChange(next === NONE_VALUE ? null : next)}
        disabled={disabled}
      >
        <RootsFormSelectTrigger
          id={id}
          aria-label={label}
          className={cn("h-10 min-h-10 px-2.5")}
        >
          <RootsFormSelectValue placeholder="Sin comanda" />
        </RootsFormSelectTrigger>
        <RootsFormSelectContent>
          <RootsFormSelectItem value={NONE_VALUE}>Sin comanda</RootsFormSelectItem>
          {stations.map((station) => (
            <RootsFormSelectItem key={station.id} value={station.id}>
              {station.name || "—"}
            </RootsFormSelectItem>
          ))}
        </RootsFormSelectContent>
      </Select>
    </div>
  )
}
