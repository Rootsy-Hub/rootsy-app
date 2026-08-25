"use client"

import "@/app/library/color/rootsyNaturePalette.css"
import { TreasuryAccountDetailView } from "@/app/[siteId]/[popId]/accounts/TreasuryAccountDetailView"
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

function TreasuryAccountDetailPage() {
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : ""
  const accountId =
    typeof params?.accountId === "string" ? params.accountId : ""

  const { bootstrap, loading: bootstrapLoading, error: bootstrapError } =
    usePopWorkspace()

  if (!popId || !siteId || !accountId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">No se encontró la cuenta.</p>
      </div>
    )
  }

  return (
    <DataWorkspaceModuleLayout
      siteId={siteId}
      popId={popId}
      popName={bootstrap?.popName ?? ""}
      title="Dinero"
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
        <TreasuryAccountDetailView
          siteId={siteId}
          popId={popId}
          accountId={accountId}
        />
      </div>
    </DataWorkspaceModuleLayout>
  )
}

export default TreasuryAccountDetailPage
