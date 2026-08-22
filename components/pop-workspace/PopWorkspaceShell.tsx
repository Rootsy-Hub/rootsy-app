"use client"

import { PopModuleLoading } from "@/app/[siteId]/[popId]/PopModuleLoading"
import {
  PopOptimisticNavProvider,
  navigationArrived,
  usePopOptimisticNav,
} from "@/context/PopOptimisticNavContext"
import { PopWorkspaceProvider } from "@/context/PopWorkspaceContext"
import { hasPopTableListSessionCache } from "@/lib/popTableListSessionCache"
import {
  isPopMenuPathname,
  popModuleKeyFromPath,
  popPathFromHref,
} from "@/lib/popRoutes"
import { useQueryClient } from "@tanstack/react-query"
import { useParams, usePathname } from "next/navigation"
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
      <PopOptimisticNavProvider>
        <PopOptimisticNavGate>{children}</PopOptimisticNavGate>
      </PopOptimisticNavProvider>
    </PopWorkspaceProvider>
  )
}

function PopOptimisticNavGate({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const params = useParams()
  const queryClient = useQueryClient()
  const popId = typeof params?.popId === "string" ? params.popId : ""
  const { pending } = usePopOptimisticNav()
  const showOptimistic =
    pending != null && !navigationArrived(pathname, pending.href)

  if (showOptimistic && pending) {
    const targetPath = popPathFromHref(pending.href)
    const moduleKey = popModuleKeyFromPath(targetPath)

    if (
      moduleKey === "articles" ||
      hasPopTableListSessionCache(queryClient, popId, moduleKey)
    ) {
      return children
    }

    return (
      <PopModuleLoading
        title={pending.title}
        moduleKey={moduleKey}
      />
    )
  }

  return children
}
