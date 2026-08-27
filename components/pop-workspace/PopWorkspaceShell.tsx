"use client"

import { PopModuleAccessGate } from "@/components/pop-workspace/PopModuleAccessGate"
import { PopRealtimeProvider } from "@/context/PopRealtimeContext"
import { PopWorkspaceProvider } from "@/context/PopWorkspaceContext"
import { usePopCatalogRealtime } from "@/hooks/usePopCatalogRealtime"
import { isPopMenuPathname } from "@/lib/popRoutes"
import { PopSpaGate } from "@/lib/pop-spa/PopSpaGate"
import { useParams, usePathname } from "@/lib/pop-spa/navigation"
import type { ReactNode } from "react"

export function PopWorkspaceShell({ children }: { children: ReactNode }) {
  const params = useParams()
  const pathname = usePathname()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : ""

  if (!siteId || !popId) {
    return <>{children}</>
  }

  return (
    <PopWorkspaceProvider
      siteId={siteId}
      popId={popId}
      accessEnabled={!isPopMenuPathname(pathname)}
    >
      <PopRealtimeProvider>
        <PopCatalogRealtimeBridge popId={popId} />
        <PopModuleAccessGate>
          <PopSpaGate>{children}</PopSpaGate>
        </PopModuleAccessGate>
      </PopRealtimeProvider>
    </PopWorkspaceProvider>
  )
}

function PopCatalogRealtimeBridge({ popId }: { popId: string }) {
  usePopCatalogRealtime(popId)
  return null
}
