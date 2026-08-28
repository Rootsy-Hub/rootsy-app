"use client"

import { ComandasBoard } from "@/app/[siteId]/[popId]/comandas/components/ComandasBoard"
import type { useComandasState } from "@/app/[siteId]/[popId]/comandas/useComandasState"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import { ChefHat } from "lucide-react"

type Props = {
  state: ReturnType<typeof useComandasState>
  canUpdate: boolean
}

export function ComandasWorkspace({ state, canUpdate }: Props) {
  const {
    stations,
    stationId,
    tickets,
    loading,
    error,
    moveTicket,
  } = state

  const stationName =
    stations.find((station) => station.id === stationId)?.name.trim() ?? ""

  return (
    <div className="relative z-1 flex h-full min-h-0 w-full flex-col overflow-hidden">
      {stations.length === 0 && !loading ? (
        <DataWorkspaceDetailEmptyState
          icon={ChefHat}
          title="Todavía no hay estaciones"
          description="Creá Cocina, Barra u otra desde Recetas → Estaciones y asignalas a las categorías."
        />
      ) : (
        <ComandasBoard
          tickets={tickets}
          loading={loading}
          error={error}
          canUpdate={canUpdate}
          stationName={stationName}
          onMoveTicket={moveTicket}
        />
      )}
    </div>
  )
}
