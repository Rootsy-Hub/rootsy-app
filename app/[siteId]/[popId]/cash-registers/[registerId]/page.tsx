"use client"

import { CashRegisterDetailView } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterDetailView"
import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import withAuth from "@/hoc/withAuth"
import { useParams } from "next/navigation"

function CashRegisterDetailPage() {
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : ""
  const registerId =
    typeof params?.registerId === "string" ? params.registerId : ""

  const { bootstrap, loading: bootstrapLoading, error: bootstrapError } =
    usePopWorkspace()

  if (!popId || !siteId || !registerId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">No se encontró la caja.</p>
      </div>
    )
  }

  return (
    <DataWorkspaceLayout
      siteId={siteId}
      popId={popId}
      popName={bootstrap?.popName ?? ""}
      title="Cajas"
      headerVariant="dark"
      loading={bootstrapLoading}
      userName={bootstrap?.userFullName}
      userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
      userRoleLabel={bootstrap?.roleLabel}
      contentFlush
      mainMaxWidthClass="max-w-none"
      mainClassName="min-h-0 flex-1 overflow-y-auto"
    >
      {bootstrapError ? (
        <div
          role="alert"
          className="mx-4 mt-4 rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:mx-6 lg:px-8"
        >
          Cabecera: {bootstrapError}
        </div>
      ) : null}
      <div className="relative flex w-full min-h-full flex-1 flex-col">
        <CashRegisterDetailView
          siteId={siteId}
          popId={popId}
          registerId={registerId}
        />
      </div>
    </DataWorkspaceLayout>
  )
}

export default withAuth(CashRegisterDetailPage)
