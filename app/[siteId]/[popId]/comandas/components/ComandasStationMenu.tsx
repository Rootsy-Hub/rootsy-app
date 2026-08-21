"use client"

import type { ComandaStation } from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import { DataWorkspaceSectionMenu } from "@/components/layouts/DataWorkspaceSectionMenu"
import { dataWorkspaceModuleHeaderVariant } from "@/components/layouts-module/DataWorkspaceModuleLayout"
import type { DataWorkspaceHeaderVariant } from "@/components/layouts/dataWorkspaceHeaderStyles"
import { ChefHat } from "lucide-react"

type Props = {
  stations: ComandaStation[]
  stationId: string | null
  onChange: (stationId: string) => void
  headerVariant?: DataWorkspaceHeaderVariant
}

export function ComandasStationMenu({
  stations,
  stationId,
  onChange,
  headerVariant = dataWorkspaceModuleHeaderVariant,
}: Props) {
  if (stations.length === 0) return null

  return (
    <DataWorkspaceSectionMenu
      viewItems={stations.map((station) => ({
        id: station.id,
        label: station.name,
        icon: ChefHat,
      }))}
      activeId={stationId ?? stations[0]?.id ?? ""}
      onSelect={onChange}
      viewsSectionLabel="Estación"
      headerVariant={headerVariant}
    />
  )
}
