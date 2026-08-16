"use client"

import {
  workspaceTableLayoutListEndFooterClass,
  workspaceTableLayoutListEndFooterDividerClass,
  workspaceTableLayoutListLoadingMoreClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { workspaceLayoutsTablesScopeClass } from "@/components/layouts-tables/rootsLayoutsTablesProductStyles"
import { cn } from "@/lib/utils"
import { RootsSpinner } from "@/components/rootsy-spinner"
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
  loadingLabel = "Cargando más…",
}: {
  hasMore: boolean
  totalCount: number
  sentinelRef: RefObject<HTMLDivElement | null>
  fullWidth?: boolean
  itemLabel?: string
  itemLabelPlural?: string
  loadingLabel?: string
}) {
  const paddingClass = fullWidth ? "px-4 lg:px-5" : "px-3"

  if (hasMore) {
    return (
      <div
        ref={sentinelRef}
        className={cn(
          workspaceLayoutsTablesScopeClass,
          workspaceTableLayoutListLoadingMoreClass,
          "py-4",
          paddingClass,
        )}
      >
        <RootsSpinner size="xs" aria-hidden className="shrink-0" />
        {loadingLabel}
      </div>
    )
  }

  if (totalCount <= 0) return null

  const countLabel =
    totalCount === 1 ? `1 ${itemLabel}` : `${totalCount} ${itemLabelPlural}`

  return (
    <div
      className={cn(
        workspaceLayoutsTablesScopeClass,
        workspaceTableLayoutListEndFooterClass,
        paddingClass,
      )}
    >
      <span className={workspaceTableLayoutListEndFooterDividerClass} aria-hidden />
      <span className="shrink-0 text-center">Fin del listado · {countLabel}</span>
      <span className={workspaceTableLayoutListEndFooterDividerClass} aria-hidden />
    </div>
  )
}
