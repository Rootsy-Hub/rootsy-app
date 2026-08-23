"use client"

import "@/app/library/color/rootsyNaturePalette.css"
import { HrClockStationView } from "@/app/[siteId]/[popId]/hr/HrClockStationView"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import {
  dataWorkspaceBlocksPageMainClass,
  dataWorkspaceBlocksPageScopeClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

function HrClockStationPage() {
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : ""

  const { bootstrap, loading: bootstrapLoading, error: bootstrapError } =
    usePopWorkspace()
  const [stationLocked, setStationLocked] = useState(false)
  const [unlockOpen, setUnlockOpen] = useState(false)

  const enterStation = useCallback(() => {
    setUnlockOpen(false)
    setStationLocked(true)
    if (typeof document === "undefined") return
    if (document.fullscreenElement) return
    void document.documentElement.requestFullscreen().catch(() => undefined)
  }, [])

  const requestUnlock = useCallback(() => {
    setUnlockOpen(true)
  }, [])

  const cancelUnlock = useCallback(() => {
    setUnlockOpen(false)
  }, [])

  const handleUnlocked = useCallback(() => {
    setUnlockOpen(false)
    setStationLocked(false)
    if (typeof document === "undefined") return
    if (!document.fullscreenElement) return
    void document.exitFullscreen().catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!stationLocked) return
    const onPopState = () => {
      window.history.pushState(null, "", window.location.href)
      setUnlockOpen(true)
    }
    window.history.pushState(null, "", window.location.href)
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [stationLocked])

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">No se encontró el local.</p>
      </div>
    )
  }

  return (
    <DataWorkspaceModuleLayout
      siteId={siteId}
      popId={popId}
      popName={bootstrap?.popName ?? ""}
      title="Fichar"
      hideHeaderInFullscreen
      stationLocked={stationLocked}
      onEnterStation={enterStation}
      onRequestUnlockStation={requestUnlock}
      headerVariant={dataWorkspaceModuleHeaderVariant}
      loading={bootstrapLoading}
      userName={bootstrap?.userFullName}
      userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
      userRoleLabel={bootstrap?.roleLabel}
      contentFlush
      mainMaxWidthClass="max-w-none"
      mainClassName={dataWorkspaceBlocksPageMainClass}
    >
      <div className={dataWorkspaceBlocksPageScopeClass}>
        {bootstrapError ? (
          <div
            role="alert"
            className="mx-4 mt-4 rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:mx-6 lg:mx-8"
          >
            Cabecera: {bootstrapError}
          </div>
        ) : null}
        <HrClockStationView
          siteId={siteId}
          popId={popId}
          stationLocked={stationLocked}
          unlockOpen={unlockOpen}
          onUnlockCancel={cancelUnlock}
          onUnlocked={handleUnlocked}
        />
      </div>
    </DataWorkspaceModuleLayout>
  )
}

export default HrClockStationPage
