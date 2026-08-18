"use client"

import { MostradorWorkspace } from "@/app/[siteId]/[popId]/mostrador/components/MostradorWorkspace"
import { DataWorkspaceHeaderTooltipIconButton } from "@/components/layouts/DataWorkspaceHeaderTooltipIconButton"
import {
  DataWorkspaceOperationsLayout,
} from "@/components/layouts-module/DataWorkspaceOperationsLayout"
import { dataWorkspaceModuleHeaderVariant } from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { useDataWorkspaceSidebar } from "@/components/layouts/useDataWorkspaceSidebar"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { useAuth } from "@/context/AuthContextSupabase"
import { mostradorAccessFromKeys } from "@/lib/popWorkspaceAccess"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef } from "react"

function MostradorPage() {
  const params = useParams()
  const router = useRouter()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const {
    open: catalogSidebarOpen,
    setOpen: setCatalogSidebarOpen,
  } = useDataWorkspaceSidebar(siteId, popId ?? "", Boolean(popId))

  const { user } = useAuth()
  const { bootstrap, loading: bootstrapLoading, error: bootstrapError } =
    usePopWorkspace()

  const access = useMemo(
    () => mostradorAccessFromKeys(bootstrap?.permissionKeys ?? []),
    [bootstrap?.permissionKeys],
  )

  useEffect(() => {
    if (bootstrapLoading || !bootstrap) return
    if (!access.canRead) {
      router.replace(`/${siteId}/${popId}/menu`)
    }
  }, [bootstrapLoading, bootstrap, access.canRead, router, siteId, popId])

  const startCreateOrderRef = useRef<(() => void) | null>(null)

  const registerStartCreateOrder = useCallback((handler: (() => void) | null) => {
    startCreateOrderRef.current = handler
  }, [])

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

  return (
    <DataWorkspaceOperationsLayout
      siteId={siteId}
      popId={popId}
      popName={bootstrap?.popName ?? ""}
      title="Mostrador"
      loading={bootstrapLoading}
      userName={bootstrap?.userFullName || user?.email || ""}
      userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
      sidebarCollapsible
      sidebarEdgeToggle={false}
      sidebarOpen={catalogSidebarOpen}
      onSidebarOpenChange={setCatalogSidebarOpen}
      headerActions={
        access.canCreate ? (
          <DataWorkspaceHeaderTooltipIconButton
            label="Nuevo pedido"
            headerVariant={dataWorkspaceModuleHeaderVariant}
            primary
            onClick={() => startCreateOrderRef.current?.()}
          >
            <Plus className="size-5" aria-hidden />
          </DataWorkspaceHeaderTooltipIconButton>
        ) : null
      }
    >
      <MostradorWorkspace
        siteId={siteId}
        popId={popId}
        catalogSidebarOpen={catalogSidebarOpen}
        onRegisterStartCreateOrder={registerStartCreateOrder}
      />
    </DataWorkspaceOperationsLayout>
  )
}

export default MostradorPage
