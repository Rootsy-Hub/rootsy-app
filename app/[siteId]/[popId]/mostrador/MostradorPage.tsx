"use client"

import { RootsIconButton } from "@/components/rootsy-button"
import { PopModuleLoading } from "@/app/[siteId]/[popId]/PopModuleLoading"
import { MostradorWorkspace } from "@/app/[siteId]/[popId]/mostrador/components/MostradorWorkspace"
import { useMostradorBoardPending } from "@/app/[siteId]/[popId]/mostrador/useMostradorState"
import {
  DataWorkspaceOperationsLayout,
} from "@/components/layouts-module/DataWorkspaceOperationsLayout"
import { useDataWorkspaceSidebar } from "@/components/layouts/useDataWorkspaceSidebar"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { useAuth } from "@/context/AuthContextSupabase"
import { OperateQueryDevtoolsPanel } from "@/components/sale-operation/SaleDevtoolsPanel"
import { isDevModeEnabled } from "@/lib/devmode"
import { MOSTRADOR_QUERY_SPEC } from "@/lib/devmode/mostradorQuerySpec"
import { mostradorAccessFromKeys } from "@/lib/popWorkspaceAccess"
import { useAfterHydration } from "@/hooks/useIsHydrated"
import {
  SaleOperationDiscountHeaderButton,
  type SaleOperationDiscountHeaderControl,
} from "@/components/sale-operation/SaleOperationDiscountHeaderButton"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "@/lib/pop-spa/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

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
  const afterHydration = useAfterHydration()
  const boardPending = useMostradorBoardPending(popId)

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
  const [discountHeader, setDiscountHeader] =
    useState<SaleOperationDiscountHeaderControl | null>(null)

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

  if (boardPending) {
    return <PopModuleLoading moduleKey="mostrador" />
  }

  return (
    <DataWorkspaceOperationsLayout
      siteId={siteId}
      popId={popId}
      popName={bootstrap?.popName ?? ""}
      title="Mostrador"
      loading={!bootstrap?.popName}
      userName={bootstrap?.userFullName || user?.email || ""}
      userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
      sidebarCollapsible
      sidebarEdgeToggle={false}
      sidebarOpen={catalogSidebarOpen}
      onSidebarOpenChange={setCatalogSidebarOpen}
      headerActions={
        <>
          {isDevModeEnabled() ? (
            <OperateQueryDevtoolsPanel
              title="Mostrador"
              spec={MOSTRADOR_QUERY_SPEC}
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
          {!afterHydration || access.canCreate ? (
            <RootsIconButton
              label="Nuevo pedido"
              semantic="primary"
              atmosphere="eter"
              size="default"
              disabled={!access.canCreate}
              onClick={() => startCreateOrderRef.current?.()}
            >
              <Plus className="size-5" aria-hidden />
            </RootsIconButton>
          ) : null}
        </>
      }
    >
      <MostradorWorkspace
        siteId={siteId}
        popId={popId}
        catalogSidebarOpen={catalogSidebarOpen}
        onCatalogSidebarOpenChange={setCatalogSidebarOpen}
        onRegisterStartCreateOrder={registerStartCreateOrder}
        onRegisterDiscountHeader={setDiscountHeader}
      />
    </DataWorkspaceOperationsLayout>
  )
}

export default MostradorPage
