"use client"

import { MostradorWorkspace } from "@/app/[siteId]/[popId]/mostrador/components/MostradorWorkspace"
import {
  getMostradorAccessSnapshot,
  type MostradorAccessSnapshot,
} from "@/app/[siteId]/[popId]/mostrador/actions"
import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
import { useDataWorkspaceSidebar } from "@/components/layouts/useDataWorkspaceSidebar"
import { useAuth } from "@/context/AuthContextSupabase"
import withAuth from "@/hoc/withAuth"
import { getWorkspaceHeaderForPop } from "@/lib/workspaceHeaderServer"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

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

  const [popName, setPopName] = useState("")
  const [headerUserName, setHeaderUserName] = useState("")
  const [userAvatarSrc, setUserAvatarSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [access, setAccess] = useState<MostradorAccessSnapshot>({
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
  })

  const loadHeader = useCallback(async () => {
    if (!popId) {
      setLoading(false)
      return
    }
    setLoading(true)
    const [headerRes, accessRes] = await Promise.all([
      getWorkspaceHeaderForPop(popId),
      getMostradorAccessSnapshot(popId),
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

    if (!accessRes.canRead) {
      router.replace(`/${siteId}/${popId}/menu`)
    }
  }, [popId, siteId, router])

  useEffect(() => {
    void loadHeader()
  }, [loadHeader])

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado.</p>
      </div>
    )
  }

  if (!access.canRead && !loading) {
    return null
  }

  return (
    <DataWorkspaceLayout
      siteId={siteId}
      popId={popId}
      popName={popName}
      title="Mostrador"
      headerVariant="dark"
      contentFlush
      loading={loading}
      userName={headerUserName || user?.email || ""}
      userAvatarSrc={userAvatarSrc ?? undefined}
      userRoleLabel="Mostrador"
      sidebarCollapsible
      sidebarEdgeToggle={false}
      sidebarOpen={catalogSidebarOpen}
      onSidebarOpenChange={setCatalogSidebarOpen}
      mainClassName="bg-[#070a09] text-white min-h-0 overflow-hidden"
    >
      <MostradorWorkspace
        siteId={siteId}
        popId={popId}
        catalogSidebarOpen={catalogSidebarOpen}
      />
    </DataWorkspaceLayout>
  )
}

export default withAuth(MostradorPage)
