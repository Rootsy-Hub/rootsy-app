"use client"

import { StatisticsWorkspaceView } from "@/components/statistics/StatisticsWorkspaceView"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { useParams } from "next/navigation"

function StatisticsPage() {
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : ""
  const { bootstrap, loading: bootstrapLoading, error: bootstrapError } =
    usePopWorkspace()

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
      loading={bootstrapLoading}
      userName={bootstrap?.userFullName}
      userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
      userRoleLabel={bootstrap?.roleLabel}
      bootstrapError={bootstrapError}
    />
  )
}

export default StatisticsPage
