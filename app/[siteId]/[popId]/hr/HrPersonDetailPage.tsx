"use client"

import "@/app/library/color/rootsyNaturePalette.css"
import { HrPersonDetailView } from "@/app/[siteId]/[popId]/hr/HrPersonDetailView"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import {
  dataWorkspaceBlocksPageMainClass,
  dataWorkspaceBlocksPageScopeClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { useParams } from "@/lib/pop-spa/navigation"

function HrPersonDetailPage() {
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : ""
  const employeeId =
    typeof params?.employeeId === "string" ? params.employeeId : ""

  const { bootstrap, loading: bootstrapLoading, error: bootstrapError } =
    usePopWorkspace()

  if (!popId || !siteId || !employeeId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">No se encontró a esa persona.</p>
      </div>
    )
  }

  return (
    <DataWorkspaceModuleLayout
      siteId={siteId}
      popId={popId}
      popName={bootstrap?.popName ?? ""}
      title="Personal"
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
        <HrPersonDetailView
          siteId={siteId}
          popId={popId}
          employeeId={employeeId}
        />
      </div>
    </DataWorkspaceModuleLayout>
  )
}

export default HrPersonDetailPage
