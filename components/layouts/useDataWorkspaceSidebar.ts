"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

export function dataWorkspaceSidebarStorageKey(siteId: string, popId: string) {
  return `rootsy:data-workspace-sidebar:${siteId}:${popId}`
}

export function useDataWorkspaceSidebar(
  siteId: string,
  popId: string,
  enabled = true,
) {
  const storageKey = useMemo(
    () => dataWorkspaceSidebarStorageKey(siteId, popId),
    [siteId, popId],
  )
  const [open, setOpen] = useState(true)

  useEffect(() => {
    if (!enabled) return
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored === "0") setOpen(false)
      else if (stored === "1") setOpen(true)
    } catch {
      /* storage no disponible */
    }
  }, [enabled, storageKey])

  useEffect(() => {
    if (!enabled) return
    try {
      localStorage.setItem(storageKey, open ? "1" : "0")
    } catch {
      /* storage no disponible */
    }
  }, [enabled, open, storageKey])

  const toggle = useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  return { open, setOpen, toggle, storageKey }
}
