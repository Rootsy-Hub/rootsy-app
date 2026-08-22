"use client"

import { useEffect, useState } from "react"

export function InventoryListStatus({
  hasItems,
  hasMore,
  fetchingMore,
}: {
  hasItems: boolean
  hasMore: boolean
  fetchingMore: boolean
}) {
  if (!hasItems || (!fetchingMore && hasMore)) return null
  return (
    <p className="px-4 py-3 text-center font-canopy text-xs text-[var(--rootsy-bruma-500)]">
      {fetchingMore ? "Cargando más…" : "Fin del listado"}
    </p>
  )
}

export function useInventoryInfiniteSentinel(
  enabled: boolean,
  onLoadMore: () => void,
) {
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!sentinel || !enabled) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMore()
        }
      },
      { root: null, rootMargin: "240px" },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [enabled, onLoadMore, sentinel])
  return setSentinel
}
