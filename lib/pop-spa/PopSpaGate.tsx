"use client"

import { PopModuleLoading } from "@/app/[siteId]/[popId]/PopModuleLoading"
import { matchPopRoute } from "@/lib/pop-spa/matchPopRoute"
import {
  ensurePopSpaPreloadBound,
  preloadPopIdleViews,
} from "@/lib/pop-spa/preload"
import { usePopRouterOptional } from "@/lib/pop-spa/PopRouter"
import { useEffect, useState, type ComponentType, type ReactNode } from "react"

let cachedOutlet: ComponentType | null = null
let outletLoad: Promise<ComponentType> | null = null

function loadPopSpaOutlet() {
  if (!outletLoad) {
    outletLoad = import("@/lib/pop-spa/PopSpaOutlet").then((mod) => {
      cachedOutlet = mod.PopSpaOutlet
      return mod.PopSpaOutlet
    })
  }
  return outletLoad
}

export function PopSpaGate({ children }: { children: ReactNode }) {
  const pop = usePopRouterOptional()
  const [Outlet, setOutlet] = useState<ComponentType | null>(
    () => cachedOutlet,
  )

  useEffect(() => {
    ensurePopSpaPreloadBound()
    let cancelled = false
    void loadPopSpaOutlet().then((Comp) => {
      if (!cancelled) setOutlet(() => Comp)
    })
    const runIdle = () => preloadPopIdleViews()
    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(runIdle, { timeout: 4000 })
      return () => {
        cancelled = true
        window.cancelIdleCallback(idleId)
      }
    }
    const timeoutId = window.setTimeout(runIdle, 1500)
    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [])

  const spaActive = pop?.spaActive ?? false
  const View = Outlet ?? cachedOutlet

  if (spaActive && View) return <View />
  if (spaActive && pop) {
    const match = matchPopRoute(pop.pathname)
    return <PopModuleLoading moduleKey={match.moduleKey} />
  }
  return <>{children}</>
}
