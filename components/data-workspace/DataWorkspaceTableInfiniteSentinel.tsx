"use client"

import type { DataWorkspaceTableInfiniteWorld } from "@/components/data-workspace/dataWorkspaceTableInfiniteCopy"
import { useEffect, useRef } from "react"

export type DataWorkspaceTableListInfinite = {
  world: DataWorkspaceTableInfiniteWorld
  hasMore: boolean
  isFetchingMore: boolean
  onLoadMore: () => void
  hasItems?: boolean
}

function loadedTableRowCount(data: unknown): number {
  if (!data || typeof data !== "object") return 0
  for (const value of Object.values(data as Record<string, unknown>)) {
    if (
      Array.isArray(value) &&
      value.some(
        (row) =>
          row != null &&
          typeof row === "object" &&
          "id" in row &&
          typeof (row as { id: unknown }).id === "string",
      )
    ) {
      return value.length
    }
  }
  return 0
}

export function tableListInfiniteFromQuery(
  query: {
    hasNextPage: boolean
    isFetchingNextPage: boolean
    fetchNextPage: () => unknown
    data?: { totalCount?: number } | null
  },
  world: DataWorkspaceTableInfiniteWorld,
): DataWorkspaceTableListInfinite {
  const totalCount = query.data?.totalCount ?? 0
  const loaded = loadedTableRowCount(query.data)
  const hasItems = totalCount > 0 || loaded > 0
  const loadedAll = totalCount > 0 && loaded >= totalCount
  const hasMore = Boolean(query.hasNextPage) && !loadedAll

  return {
    world,
    hasMore,
    isFetchingMore: query.isFetchingNextPage,
    hasItems,
    onLoadMore: () => {
      if (!hasMore || query.isFetchingNextPage) return
      void query.fetchNextPage()
    },
  }
}

export function DataWorkspaceTableInfiniteSentinel({
  hasMore,
  onLoadMore,
  root,
}: DataWorkspaceTableListInfinite & {
  root: Element | null
}) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const onLoadMoreRef = useRef(onLoadMore)
  onLoadMoreRef.current = onLoadMore

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !root || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMoreRef.current()
        }
      },
      { root, rootMargin: "180px 0px", threshold: 0 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, root])

  return <div ref={sentinelRef} className="h-px w-full shrink-0" aria-hidden />
}
