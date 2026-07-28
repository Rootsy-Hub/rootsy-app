"use client"

import { PopWorkspaceProvider } from "@/context/PopWorkspaceContext"
import { useParams } from "next/navigation"
import type { ReactNode } from "react"

export function PopWorkspaceShell({ children }: { children: ReactNode }) {
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : ""

  if (!siteId || !popId) {
    return <>{children}</>
  }

  return (
    <PopWorkspaceProvider siteId={siteId} popId={popId}>
      {children}
    </PopWorkspaceProvider>
  )
}
