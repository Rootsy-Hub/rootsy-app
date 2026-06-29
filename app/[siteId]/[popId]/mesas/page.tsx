"use client"

import { MesasWorkspace } from "@/app/[siteId]/[popId]/mesas/components/MesasWorkspace"
import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
import { useDataWorkspaceSidebar } from "@/components/layouts/useDataWorkspaceSidebar"
import { useAuth } from "@/context/AuthContextSupabase"
import withAuth from "@/hoc/withAuth"
import { getWorkspaceHeaderForPop } from "@/lib/workspaceHeaderServer"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

function MesasPage() {
  const params = useParams()
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

  const loadHeader = useCallback(async () => {
    if (!popId) {
      setLoading(false)
      return
    }
    setLoading(true)
    const res = await getWorkspaceHeaderForPop(popId)
    setLoading(false)
    if (res.success) {
      setPopName(res.popName)
      setHeaderUserName(res.userFullName)
      setUserAvatarSrc(res.userImageUrl)
    } else {
      setPopName("")
      setHeaderUserName("")
      setUserAvatarSrc(null)
    }
  }, [popId])

  useEffect(() => {
    void loadHeader()
  }, [loadHeader])

  if (!popId || !siteId) {
    return (
      <div className="min-h-screen bg-[#070a09] p-10 text-sm text-slate-300">
        Punto de venta no encontrado
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
      />
    </DataWorkspaceLayout>
  )
}

export default withAuth(MesasPage)
