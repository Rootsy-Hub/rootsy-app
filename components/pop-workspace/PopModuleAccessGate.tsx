"use client"

import { PopModuleLoading } from "@/app/[siteId]/[popId]/PopModuleLoading"
import { showRootsyToast } from "@/components/rootsy-toast"
import { usePopMenuCache } from "@/hooks/usePopMenuCache"
import {
  canAccessMenuItemFromPopAccess,
  menuLinkFromPopPath,
} from "@/lib/menuPopAccess"
import { popMenuHref, popModuleKeyFromPath } from "@/lib/popRoutes"
import { useParams, usePathname, useRouter } from "@/lib/pop-spa/navigation"
import { useEffect, useRef, type ReactNode } from "react"

export function PopModuleAccessGate({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : ""
  const { popAccess, enabledModules, isLoading } = usePopMenuCache(popId)
  const menuLink = menuLinkFromPopPath(pathname)
  const warnedRef = useRef<string | null>(null)

  const allowed =
    !menuLink || canAccessMenuItemFromPopAccess(enabledModules, menuLink)

  useEffect(() => {
    if (!siteId || !popId || !menuLink || !popAccess || allowed) return
    const href = popMenuHref(siteId, popId)
    if (warnedRef.current !== pathname) {
      warnedRef.current = pathname
      showRootsyToast({
        title: "Sin permiso",
        description: "No tenés acceso a esa sección.",
        intent: "danger",
      })
    }
    router.replace(href)
  }, [allowed, menuLink, pathname, popAccess, popId, router, siteId])

  if (menuLink && isLoading && !popAccess) {
    return (
      <PopModuleLoading moduleKey={popModuleKeyFromPath(pathname)} />
    )
  }

  if (menuLink && popAccess && !allowed) {
    return <PopModuleLoading moduleKey={popModuleKeyFromPath(pathname)} />
  }

  return children
}
