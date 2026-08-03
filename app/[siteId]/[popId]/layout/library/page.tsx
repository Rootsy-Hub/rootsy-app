"use client"

import { LayoutWorkspaceShell } from "@/app/[siteId]/[popId]/layout/LayoutWorkspaceShell"
import { LayoutComponentLibrary } from "@/app/[siteId]/[popId]/layout/library/LayoutComponentLibrary"
import {
  layoutViewHref,
  type LayoutViewId,
} from "@/app/[siteId]/[popId]/layout/layoutWorkspaceNav"
import withAuth from "@/hoc/withAuth"
import { useParams, useRouter } from "next/navigation"

function LayoutLibraryPage() {
  const params = useParams()
  const router = useRouter()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const handleViewSelect = (viewId: LayoutViewId) => {
    if (!popId || !siteId) return
    router.push(layoutViewHref(siteId, popId, viewId))
  }

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado.</p>
      </div>
    )
  }

  return (
    <LayoutWorkspaceShell
      siteId={siteId}
      popId={popId}
      activeViewId="library"
      title="Librería UI"
      onViewSelect={handleViewSelect}
    >
      <LayoutComponentLibrary />
    </LayoutWorkspaceShell>
  )
}

export default withAuth(LayoutLibraryPage)
