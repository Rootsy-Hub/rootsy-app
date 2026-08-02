"use client"

import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { useEffect, useRef, useState, type RefObject } from "react"

export const TREASURY_MOVEMENTS_PAGE_SIZE = 20

export function useTreasuryInfiniteScroll<T>(
  items: T[],
  scrollRoot: HTMLElement | null,
  pageSize = TREASURY_MOVEMENTS_PAGE_SIZE,
) {
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setVisibleCount(pageSize)
  }, [items, pageSize])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    if (visibleCount >= items.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((prev) => Math.min(prev + pageSize, items.length))
        }
      },
      { root: scrollRoot, rootMargin: "160px" },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [items.length, pageSize, scrollRoot, visibleCount])

  return {
    visibleItems: items.slice(0, visibleCount),
    hasMore: visibleCount < items.length,
    totalCount: items.length,
    sentinelRef,
  }
}

export function TreasuryInfiniteScrollFooter({
  hasMore,
  totalCount,
  sentinelRef,
  fullWidth = true,
  itemLabel = "movimiento",
  itemLabelPlural = "movimientos",
}: {
  hasMore: boolean
  totalCount: number
  sentinelRef: RefObject<HTMLDivElement | null>
  fullWidth?: boolean
  itemLabel?: string
  itemLabelPlural?: string
}) {
  const paddingClass = fullWidth ? "px-4 lg:px-5" : "px-3"

  if (hasMore) {
    return (
      <div
        ref={sentinelRef}
        className={cn(
          "flex items-center justify-center gap-2 border-t border-border/50 py-4 text-xs text-muted-foreground",
          paddingClass,
        )}
      >
        <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden />
        Cargando más…
      </div>
    )
  }

  if (totalCount <= 0) return null

  const countLabel =
    totalCount === 1 ? `1 ${itemLabel}` : `${totalCount} ${itemLabelPlural}`

  return (
    <div
      className={cn(
        "flex items-center gap-3 py-6 text-xs text-muted-foreground",
        paddingClass,
      )}
    >
      <span className="h-px flex-1 bg-border/60" aria-hidden />
      <span className="shrink-0 text-center">Fin del listado · {countLabel}</span>
      <span className="h-px flex-1 bg-border/60" aria-hidden />
    </div>
  )
}
