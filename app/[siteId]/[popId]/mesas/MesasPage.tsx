"use client"

import { MesasLayoutAdmin } from "@/app/[siteId]/[popId]/mesas/components/MesasLayoutAdmin"
import { MesasWorkspace } from "@/app/[siteId]/[popId]/mesas/components/MesasWorkspace"
import { fetchMesasLayout } from "@/lib/rootsyApi/mesasClient"
import type { MesasLayoutData } from "@/app/[siteId]/[popId]/mesas/actions"
import type { MesaSalon } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import {
  DataWorkspaceOperationsLayout,
} from "@/components/layouts-module/DataWorkspaceOperationsLayout"
import { useDataWorkspaceSidebar } from "@/components/layouts/useDataWorkspaceSidebar"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { useAuth } from "@/context/AuthContextSupabase"
import { mesasAccessFromKeys } from "@/lib/popWorkspaceAccess"
import { useParams } from "@/lib/pop-spa/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

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

  const [layoutLoading, setLayoutLoading] = useState(true)
  const [salons, setSalons] = useState<MesaSalon[]>([])
  const reloadLayoutRef = useRef<() => Promise<void>>(async () => {})
  const layoutDataRef = useRef<() => MesasLayoutData | null>(() => null)

  const access = useMemo(
    () => mesasAccessFromKeys(bootstrap?.permissionKeys ?? []),
    [bootstrap?.permissionKeys],
  )

  const loadLayout = useCallback(async () => {
    if (!popId || !siteId) {
      setLayoutLoading(false)
      return
    }
    setLayoutLoading(true)
    const layoutRes = await fetchMesasLayout(popId)
    setLayoutLoading(false)

    if (layoutRes.success) {
      setSalons(
        layoutRes.data.salons
          .filter((s) => s.isActive)
          .map((s) => ({
            id: s.id,
            name: s.name,
            sortOrder: s.sortOrder,
            isActive: s.isActive,
          })),
      )
    }
  }, [popId, siteId])

  useEffect(() => {
    void loadLayout()
  }, [loadLayout])

  const handleLayoutChanged = useCallback(async () => {
    await loadLayout()
    await reloadLayoutRef.current()
  }, [loadLayout])

  const loading = bootstrapLoading || layoutLoading
  const popName = bootstrap?.popName ?? ""

  if (!popId || !siteId) {
    return (
      <div className="min-h-screen bg-[#070a09] p-10 text-sm text-slate-300">
        Punto de venta no encontrado
      </div>
    )
  }

  if (!loading && bootstrapError) {
    return (
      <div className="min-h-screen bg-[#070a09] p-10 text-sm text-slate-300">
        {bootstrapError}
      </div>
    )
  }

  if (!loading && !access.canRead) {
    return (
      <div className="min-h-screen bg-[#070a09] p-10 text-sm text-slate-300">
        No tenés permiso para acceder a Mesas en este punto de venta.
      </div>
    )
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
          loading={loading}
          userName={bootstrap?.userFullName || user?.email || ""}
          userAvatarSrc={bootstrap?.userImageUrl}
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
          />
        </DataWorkspaceOperationsLayout>
      )}
    </MesasLayoutAdmin>
  )
}

export default MesasPage
