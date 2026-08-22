"use client"

import { PopModuleLoading } from "@/app/[siteId]/[popId]/PopModuleLoading"
import { hasPopTableListSessionCache } from "@/lib/popTableListSessionCache"
import { popModuleKeyFromPath } from "@/lib/popRoutes"
import {
  HydrationBoundary,
  useQueryClient,
  type DehydratedState,
} from "@tanstack/react-query"
import { useParams, usePathname } from "next/navigation"
import { Suspense, use, type ReactNode } from "react"

export function PopListHydrationPage({
  state,
  children,
}: {
  state: DehydratedState | null | Promise<DehydratedState | null>
  children: ReactNode
}) {
  const params = useParams()
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const popId = typeof params?.popId === "string" ? params.popId : ""
  const moduleKey = popModuleKeyFromPath(pathname)
  const hasSessionCache = hasPopTableListSessionCache(
    queryClient,
    popId,
    moduleKey,
  )

  if (hasSessionCache) {
    return children
  }

  return (
    <Suspense
      fallback={<PopModuleLoading moduleKey={moduleKey} />}
    >
      <PopListHydrationFromState state={state}>{children}</PopListHydrationFromState>
    </Suspense>
  )
}

function PopListHydrationFromState({
  state,
  children,
}: {
  state: DehydratedState | null | Promise<DehydratedState | null>
  children: ReactNode
}) {
  const resolved = state instanceof Promise ? use(state) : state

  return (
    <HydrationBoundary state={resolved ?? undefined}>
      {children}
    </HydrationBoundary>
  )
}
