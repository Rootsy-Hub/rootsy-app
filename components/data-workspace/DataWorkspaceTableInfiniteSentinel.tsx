"use client"

import { useEffect, useRef } from "react"
import type { DataWorkspaceTableInfiniteWorld } from "@/components/data-workspace/dataWorkspaceTableInfiniteCopy"

export type DataWorkspaceTableListInfinite = {
  world: DataWorkspaceTableInfiniteWorld
  hasMore: boolean
  isFetchingMore: boolean
  onLoadMore: () => void
  hasItems?: boolean
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
  return {
    world,
    hasMore: Boolean(query.hasNextPage),
    isFetchingMore: query.isFetchingNextPage,
    hasItems: (query.data?.totalCount ?? 0) > 0,
    onLoadMore: () => {
      if (!query.hasNextPage || query.isFetchingNextPage) return
      void query.fetchNextPage()
    },
  }
}

export function DataWorkspaceTableInfiniteSentinel({
  hasMore,
  isFetchingMore,
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

  if (!hasMore && !isFetchingMore) return null

  return (
    <div ref={sentinelRef} className="h-px w-full shrink-0" aria-hidden />
  )
}
