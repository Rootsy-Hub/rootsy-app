"use client"

import { PopModuleLoading } from "@/app/[siteId]/[popId]/PopModuleLoading"
import { DataWorkspaceBlocksEmptyState } from "@/components/data-workspace/DataWorkspaceBlocksEmptyState"
import { MesasLayoutAdmin } from "@/app/[siteId]/[popId]/mesas/components/MesasLayoutAdmin"
import { MesasWorkspace } from "@/app/[siteId]/[popId]/mesas/components/MesasWorkspace"
import { useMesasFloorHydrate } from "@/hooks/useMesasFloorHydrate"
import { useMesasFloorPending } from "@/app/[siteId]/[popId]/mesas/useMesasState"
import type { MesasLayoutData } from "@/app/[siteId]/[popId]/mesas/actions"
import type { MesaSalon } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import {
  DataWorkspaceOperationsLayout,
} from "@/components/layouts-module/DataWorkspaceOperationsLayout"
import { useDataWorkspaceSidebar } from "@/components/layouts/useDataWorkspaceSidebar"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { useAuth } from "@/context/AuthContextSupabase"
import { OperateQueryDevtoolsPanel } from "@/components/sale-operation/SaleDevtoolsPanel"
import { isDevModeEnabled } from "@/lib/devmode"
import { MESAS_QUERY_SPEC } from "@/lib/devmode/mesasQuerySpec"
import { mesasLayoutQueryOptions } from "@/lib/mesasWorkspaceQuery"
import { mesasAccessFromKeys } from "@/lib/popWorkspaceAccess"
import { useParams } from "@/lib/pop-spa/navigation"
import { useQuery } from "@tanstack/react-query"
import {
  SaleOperationDiscountHeaderButton,
  type SaleOperationDiscountHeaderControl,
} from "@/components/sale-operation/SaleOperationDiscountHeaderButton"
import { useCallback, useMemo, useRef, useState } from "react"

function MesasPage() {
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined
  const { user } = useAuth()
  const { bootstrap, loading: bootstrapLoading, error: bootstrapError } =
    usePopWorkspace()

  const {
    open: catalogSidebarOpen,
    setOpen: setCatalogSidebarOpen,
  } = useDataWorkspaceSidebar(siteId, popId ?? "", Boolean(popId))

  const reloadLayoutRef = useRef<() => Promise<void>>(async () => {})
  const layoutDataRef = useRef<() => MesasLayoutData | null>(() => null)
  const [discountHeader, setDiscountHeader] =
    useState<SaleOperationDiscountHeaderControl | null>(null)

  const access = useMemo(
    () => mesasAccessFromKeys(bootstrap?.permissionKeys ?? []),
    [bootstrap?.permissionKeys],
  )

  const floorPending = useMesasFloorPending(popId)
  const floorHydrate = useMesasFloorHydrate(popId)
  const layoutQuery = useQuery({
    ...mesasLayoutQueryOptions(popId ?? ""),
    enabled: Boolean(popId && siteId) && floorHydrate.canReadFloor,
  })

  const salons = useMemo<MesaSalon[]>(
    () =>
      (layoutQuery.data?.salons ?? [])
        .filter((s) => s.isActive)
        .map((s) => ({
          id: s.id,
          name: s.name,
          sortOrder: s.sortOrder,
          isActive: s.isActive,
        })),
    [layoutQuery.data?.salons],
  )

  const handleLayoutChanged = useCallback(async () => {
    await reloadLayoutRef.current()
  }, [])

  const popName = bootstrap?.popName ?? ""

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <DataWorkspaceBlocksEmptyState title="Punto de venta no encontrado" />
      </div>
    )
  }

  if (!bootstrapLoading && bootstrapError) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <DataWorkspaceBlocksEmptyState title={bootstrapError} />
      </div>
    )
  }

  if (!bootstrapLoading && !access.canRead) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <DataWorkspaceBlocksEmptyState title="No tenés permiso para acceder a Mesas en este punto de venta." />
      </div>
    )
  }

  if (floorPending) {
    return <PopModuleLoading moduleKey="mesas" />
  }

  return (
    <MesasLayoutAdmin
      popId={popId}
      siteId={siteId}
      salons={salons}
      canUpdate={access.canUpdate}
      getLayoutData={() => layoutDataRef.current()}
      onLayoutChanged={handleLayoutChanged}
    >
      {({ moreActions }) => (
        <DataWorkspaceOperationsLayout
          siteId={siteId}
          popId={popId}
          popName={popName}
          title="Mesas"
          loading={!popName}
          userName={bootstrap?.userFullName || user?.email || ""}
          userAvatarSrc={bootstrap?.userImageUrl}
          headerActions={
            <>
              {isDevModeEnabled() ? (
                <OperateQueryDevtoolsPanel
                  title="Mesas"
                  spec={MESAS_QUERY_SPEC}
                />
              ) : null}
              <div className="md:hidden">
                <SaleOperationDiscountHeaderButton
                  disabled={discountHeader?.disabled ?? true}
                  active={discountHeader?.active ?? false}
                  title={discountHeader?.title}
                  onClick={() => discountHeader?.onClick()}
                />
              </div>
            </>
          }
          headerMoreActions={moreActions}
          sidebarCollapsible
          sidebarEdgeToggle={false}
          sidebarOpen={catalogSidebarOpen}
          onSidebarOpenChange={setCatalogSidebarOpen}
        >
          <MesasWorkspace
            siteId={siteId}
            popId={popId}
            catalogSidebarOpen={catalogSidebarOpen}
            onCatalogSidebarOpenChange={setCatalogSidebarOpen}
            canUpdateLayout={access.canUpdate}
            onRegisterReload={(reload) => {
              reloadLayoutRef.current = reload
            }}
            onRegisterLayoutData={(getter) => {
              layoutDataRef.current = getter
            }}
            onRegisterDiscountHeader={setDiscountHeader}
          />
        </DataWorkspaceOperationsLayout>
      )}
    </MesasLayoutAdmin>
  )
}

export default MesasPage
