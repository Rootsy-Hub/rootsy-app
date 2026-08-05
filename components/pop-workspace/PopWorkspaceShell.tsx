"use client"

import { PopWorkspaceProvider } from "@/context/PopWorkspaceContext"
import { isPopMenuPathname } from "@/lib/popRoutes"
import { useParams, usePathname } from "next/navigation"
import type { ReactNode } from "react"

export function PopWorkspaceShell({ children }: { children: ReactNode }) {
  const params = useParams()
  const pathname = usePathname()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : ""
  const bootstrapEnabled = Boolean(pathname) && !isPopMenuPathname(pathname)

  if (!siteId || !popId) {
    return <>{children}</>
  }

  return (
    <PopWorkspaceProvider
      siteId={siteId}
      popId={popId}
      bootstrapEnabled={bootstrapEnabled}
    >
      {children}
    </PopWorkspaceProvider>
  )
}
