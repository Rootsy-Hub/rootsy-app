"use client"

import { SummaryDashboardView } from "@/components/summary/SummaryDashboardView"
import {
  dataWorkspaceBlocksContentInnerClass,
  dataWorkspaceBlocksPageMainClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { usePopMenuCache } from "@/hooks/usePopMenuCache"
import withAuth from "@/hoc/withAuth"
import { cn } from "@/lib/utils"
import { useParams } from "next/navigation"
import { useMemo } from "react"

function SummaryPage() {
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
    <DataWorkspaceModuleLayout
      siteId={siteId}
      popId={popId}
      popName={bootstrap?.popName ?? ""}
      title="Resumen"
      headerVariant={dataWorkspaceModuleHeaderVariant}
      loading={bootstrapLoading}
      userName={bootstrap?.userFullName}
      userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
      userRoleLabel={bootstrap?.roleLabel}
      contentFlush
      mainMaxWidthClass="max-w-[88rem]"
      mainClassName={dataWorkspaceBlocksPageMainClass}
    >
      <div className={dataWorkspaceBlocksContentInnerClass}>
        {bootstrapError ? (
          <div
            role="alert"
            className={cn(
              "rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive",
            )}
          >
            Cabecera: {bootstrapError}
          </div>
        ) : null}
        <SummaryDashboardView
          popId={popId}
          enabledModuleKeys={enabledModuleKeys}
        />
      </div>
    </DataWorkspaceModuleLayout>
  )
}

export default withAuth(SummaryPage)
