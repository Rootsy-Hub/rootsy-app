"use client"

import { PopModuleLoading } from "@/app/[siteId]/[popId]/PopModuleLoading"
import { comandasBrisaPageMainClass } from "@/app/[siteId]/[popId]/comandas/comandasBrisaStyles"
import { ComandasStationMenu } from "@/app/[siteId]/[popId]/comandas/components/ComandasStationMenu"
import { ComandasWorkspace } from "@/app/[siteId]/[popId]/comandas/components/ComandasWorkspace"
import {
  useComandasBoardPending,
  useComandasState,
} from "@/app/[siteId]/[popId]/comandas/useComandasState"
import { useComandasRealtime } from "@/hooks/useComandasRealtime"
import { DataWorkspaceModuleLayout } from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { useAuth } from "@/context/AuthContextSupabase"
import { comandasAccessFromKeys } from "@/lib/popWorkspaceAccess"
import { useParams, useRouter } from "@/lib/pop-spa/navigation"
import { useEffect, useMemo } from "react"

function ComandasPage() {
  const params = useParams()
  const router = useRouter()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined
  const { user } = useAuth()
  const { bootstrap, loading: bootstrapLoading, error: bootstrapError } =
    usePopWorkspace()

  const access = useMemo(
    () => comandasAccessFromKeys(bootstrap?.permissionKeys ?? []),
    [bootstrap?.permissionKeys],
  )
  useComandasRealtime(popId)
  const boardPending = useComandasBoardPending(popId)
  const comandas = useComandasState(popId ?? "", siteId)

  useEffect(() => {
    if (bootstrapLoading || !bootstrap) return
    if (!access.canRead) {
      router.replace(`/${siteId}/${popId}/menu`)
    }
  }, [bootstrapLoading, bootstrap, access.canRead, router, siteId, popId])

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado.</p>
      </div>
    )
  }

  if (!bootstrapLoading && bootstrapError) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">{bootstrapError}</p>
      </div>
    )
  }

  if (!access.canRead && !bootstrapLoading) {
    return null
  }

  if (boardPending) {
    return <PopModuleLoading moduleKey="comandas" />
  }

  const popName = bootstrap?.popName ?? ""

  return (
    <DataWorkspaceModuleLayout
      siteId={siteId}
      popId={popId}
      popName={popName}
      title="Comandas"
      hideHeaderInFullscreen
      loading={!popName}
      userName={bootstrap?.userFullName || user?.email || ""}
      userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
      contentFlush
      mainMaxWidthClass="max-w-none"
      mainClassName={comandasBrisaPageMainClass}
      sectionMenu={
        <ComandasStationMenu
          stations={comandas.stations}
          stationId={comandas.stationId}
          onChange={comandas.setStationId}
        />
      }
    >
      <ComandasWorkspace state={comandas} canUpdate={access.canUpdate} />
    </DataWorkspaceModuleLayout>
  )
}

export default ComandasPage
