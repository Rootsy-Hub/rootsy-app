"use client"

import { useEffect } from "react"

export function useInfiniteScrollSentinel(
  root: HTMLElement | null,
  sentinel: HTMLElement | null,
  enabled: boolean,
  onIntersect: () => void,
) {
  useEffect(() => {
    if (!root || !sentinel || !enabled) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onIntersect()
        }
      },
      { root, rootMargin: "240px" },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [enabled, onIntersect, root, sentinel])
}
