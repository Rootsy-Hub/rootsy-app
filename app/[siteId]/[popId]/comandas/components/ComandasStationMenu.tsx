"use client"

import type { ComandaStation } from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
  type RootsFormTone,
} from "@/components/rootsy-form"
import { ChefHat } from "lucide-react"

type Props = {
  stations: ComandaStation[]
  stationId: string | null
  onChange: (stationId: string) => void
  /** `eter` en header de módulo; `light` en diálogo. */
  tone?: RootsFormTone
}

export function ComandasStationMenu({
  stations,
  stationId,
  onChange,
  tone = "eter",
}: Props) {
  if (stations.length === 0) return null

  return (
    <div className="w-50 shrink-0">
      <RootsFormSelectField
        label="Estación"
        tone={tone}
        value={stationId ?? stations[0]?.id ?? ""}
        onValueChange={onChange}
        prefix={<ChefHat className="size-4" aria-hidden />}
        prefixVariant="inline"
        className="[&_label]:sr-only"
      >
        {stations.map((station) => (
          <RootsFormSelectItem key={station.id} value={station.id} tone={tone}>
            {station.name}
          </RootsFormSelectItem>
        ))}
      </RootsFormSelectField>
    </div>
  )
}
