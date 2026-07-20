"use client"

import { MesasLayoutAdminButtons } from "@/app/[siteId]/[popId]/mesas/components/MesasLayoutAdmin"
import { MesasWorkspace } from "@/app/[siteId]/[popId]/mesas/components/MesasWorkspace"
import {
  getMesasAccessSnapshot,
  getMesasLayout,
  type MesasAccessSnapshot,
  type MesasLayoutData,
} from "@/app/[siteId]/[popId]/mesas/actions"
import type { MesaSalon } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
import { useDataWorkspaceSidebar } from "@/components/layouts/useDataWorkspaceSidebar"
import { useAuth } from "@/context/AuthContextSupabase"
import withAuth from "@/hoc/withAuth"
import { getWorkspaceHeaderForPop } from "@/lib/workspaceHeaderServer"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

function MesasPage() {
  const params = useParams()
  const router = useRouter()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined
  const { user } = useAuth()

  const {
    open: catalogSidebarOpen,
    setOpen: setCatalogSidebarOpen,
  } = useDataWorkspaceSidebar(siteId, popId ?? "", Boolean(popId))

  const [popName, setPopName] = useState("")
  const [headerUserName, setHeaderUserName] = useState("")
  const [userAvatarSrc, setUserAvatarSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [access, setAccess] = useState<MesasAccessSnapshot>({
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
  })
  const [salons, setSalons] = useState<MesaSalon[]>([])
  const reloadLayoutRef = useRef<() => Promise<void>>(async () => {})
  const layoutDataRef = useRef<() => MesasLayoutData | null>(() => null)

  const loadHeader = useCallback(async () => {
    if (!popId) {
      setLoading(false)
      return
    }
    setLoading(true)
    const [headerRes, accessRes, layoutRes] = await Promise.all([
      getWorkspaceHeaderForPop(popId),
      getMesasAccessSnapshot(popId),
      getMesasLayout(popId, siteId),
    ])
    setLoading(false)

    if (headerRes.success) {
      setPopName(headerRes.popName)
      setHeaderUserName(headerRes.userFullName)
      setUserAvatarSrc(headerRes.userImageUrl)
    } else {
      setPopName("")
      setHeaderUserName("")
      setUserAvatarSrc(null)
    }

    setAccess(accessRes)

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
    } else if (layoutRes.redirect) {
      router.replace(layoutRes.redirect)
    }
  }, [popId, siteId, router])

  useEffect(() => {
    void loadHeader()
  }, [loadHeader])

  const handleLayoutChanged = useCallback(async () => {
    if (!popId) return
    const layoutRes = await getMesasLayout(popId, siteId)
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
    await reloadLayoutRef.current()
  }, [popId, siteId])

  if (!popId || !siteId) {
    return (
      <div className="min-h-screen bg-[#070a09] p-10 text-sm text-slate-300">
        Punto de venta no encontrado
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
    <DataWorkspaceLayout
      siteId={siteId}
      popId={popId}
      popName={popName}
      title="Mesas"
      headerVariant="dark"
      contentFlush
      loading={loading}
      userName={headerUserName || user?.email || ""}
      userAvatarSrc={userAvatarSrc}
      userRoleLabel="Salón"
      headerActions={
        <MesasLayoutAdminButtons
          popId={popId}
          siteId={siteId}
          salons={salons}
          canUpdate={access.canUpdate}
          getLayoutData={() => layoutDataRef.current()}
          onLayoutChanged={handleLayoutChanged}
        />
      }
      sidebarCollapsible
      sidebarEdgeToggle={false}
      sidebarOpen={catalogSidebarOpen}
      onSidebarOpenChange={setCatalogSidebarOpen}
      mainClassName="bg-[#070a09] text-white"
    >
      <MesasWorkspace
        siteId={siteId}
        popId={popId}
        catalogSidebarOpen={catalogSidebarOpen}
        canUpdateLayout={access.canUpdate}
        onRegisterReload={(reload) => {
          reloadLayoutRef.current = reload
        }}
        onRegisterLayoutData={(getter) => {
          layoutDataRef.current = getter
        }}
      />
    </DataWorkspaceLayout>
  )
}

export default withAuth(MesasPage)
