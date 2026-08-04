"use client"

import { LayoutWorkspaceShell } from "@/app/[siteId]/[popId]/layout/LayoutWorkspaceShell"
import {
  layoutViewHref,
  type LayoutViewId,
} from "@/app/[siteId]/[popId]/layout/layoutWorkspaceNav"
import { LayoutPreviewListTable } from "./LayoutPreviewListTable"
import {
  LayoutPreviewReportsDashboard,
  LayoutPreviewSummaryDashboard,
} from "./layoutPreviewDashboards"
import { cn } from "@/lib/utils"
import withAuth from "@/hoc/withAuth"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

function LayoutPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const [activeId, setActiveId] = useState<LayoutViewId>("list")

  const handleViewSelect = (viewId: LayoutViewId) => {
    if (!popId || !siteId) return
    if (viewId === "library") {
      router.push(layoutViewHref(siteId, popId, "library"))
      return
    }
    setActiveId(viewId)
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
      activeViewId={activeId}
      title="Layout tablas"
      onViewSelect={handleViewSelect}
    >
      {activeId === "list" ? (
        <LayoutPreviewListTable
          siteId={siteId}
          popId={popId}
          listFetching={false}
        />
      ) : activeId === "reports" ? (
        <div className="relative flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <LayoutPreviewReportsDashboard />
        </div>
      ) : activeId === "summary" ? (
        <div className="relative flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <LayoutPreviewSummaryDashboard />
        </div>
      ) : (
        <div
          className={cn(
            "mx-4 my-6 rounded-2xl border border-dashed border-primary/15 bg-muted/20 sm:mx-6 lg:mx-8",
            "px-6 py-12 text-center text-sm text-muted-foreground",
          )}
        >
          Contenido de demostración para la pestaña seleccionada.
        </div>
      )}
    </LayoutWorkspaceShell>
  )
}

export default withAuth(LayoutPreviewPage)
