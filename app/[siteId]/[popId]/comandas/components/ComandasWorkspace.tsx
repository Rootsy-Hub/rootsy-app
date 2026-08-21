"use client"

import { ComandasBoard } from "@/app/[siteId]/[popId]/comandas/components/ComandasBoard"
import type { useComandasState } from "@/app/[siteId]/[popId]/comandas/useComandasState"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import { RootsBanner } from "@/components/rootsy-banner"
import { ChefHat } from "lucide-react"

type Props = {
  state: ReturnType<typeof useComandasState>
  canUpdate: boolean
}

export function ComandasWorkspace({ state, canUpdate }: Props) {
  const {
    stations,
    tickets,
    loading,
    error,
    realtimeStatus,
    moveTicket,
  } = state

  return (
    <div className="relative z-1 flex h-full min-h-0 w-full flex-col overflow-hidden">
      {realtimeStatus === "disconnected" ? (
        <div className="shrink-0 px-4 pt-3 sm:px-6">
          <RootsBanner
            intent="warning"
            layout="message"
            message="Conexión en vivo interrumpida. Reconectando… los cambios pueden demorar unos segundos."
          />
        </div>
      ) : null}

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
          onMoveTicket={moveTicket}
        />
      )}
    </div>
  )
}
