"use client"

import { StatisticsWorkspaceView } from "@/components/statistics/StatisticsWorkspaceView"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { usePopMenuCache } from "@/hooks/usePopMenuCache"
import withAuth from "@/hoc/withAuth"
import { useParams } from "next/navigation"
import { useMemo } from "react"

function StatisticsPage() {
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : ""
  const { bootstrap, loading: bootstrapLoading, error: bootstrapError } =
    usePopWorkspace()
  const { enabledModules } = usePopMenuCache(popId)

  const enabledModuleKeys = useMemo(
    () => enabledModules.map((mod) => mod.key),
    [enabledModules],
  )

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado.</p>
      </div>
    )
  }

  return (
    <StatisticsWorkspaceView
      siteId={siteId}
      popId={popId}
      popName={bootstrap?.popName ?? ""}
      enabledModuleKeys={enabledModuleKeys}
      loading={bootstrapLoading}
      userName={bootstrap?.userFullName}
      userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
      userRoleLabel={bootstrap?.roleLabel}
      bootstrapError={bootstrapError}
    />
  )
}

export default withAuth(StatisticsPage)
