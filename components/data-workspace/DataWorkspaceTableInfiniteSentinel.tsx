"use client"

import "@/components/data-workspace/dataWorkspaceTableInfinite.css"
import {
  dataWorkspaceTableInfiniteCopy,
  type DataWorkspaceTableInfiniteWorld,
} from "@/components/data-workspace/dataWorkspaceTableInfiniteCopy"
import { useEffect, useRef, useState } from "react"

export type DataWorkspaceTableListInfinite = {
  world: DataWorkspaceTableInfiniteWorld
  hasMore: boolean
  isFetchingMore: boolean
  onLoadMore: () => void
}

export function tableListInfiniteFromQuery(
  query: {
    hasNextPage: boolean
    isFetchingNextPage: boolean
    fetchNextPage: () => unknown
  },
  world: DataWorkspaceTableInfiniteWorld,
): DataWorkspaceTableListInfinite {
  return {
    world,
    hasMore: Boolean(query.hasNextPage),
    isFetchingMore: query.isFetchingNextPage,
    onLoadMore: () => {
      if (!query.hasNextPage || query.isFetchingNextPage) return
      void query.fetchNextPage()
    },
  }
}

export function DataWorkspaceTableInfiniteSentinel({
  world,
  hasMore,
  isFetchingMore,
  onLoadMore,
  root,
}: DataWorkspaceTableListInfinite & {
  root: Element | null
}) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [intersecting, setIntersecting] = useState(false)
  const onLoadMoreRef = useRef(onLoadMore)
  onLoadMoreRef.current = onLoadMore

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !root || !hasMore) {
      setIntersecting(false)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting)
        setIntersecting(isVisible)
        if (isVisible) onLoadMoreRef.current()
      },
      { root, rootMargin: "180px 0px", threshold: 0 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, root])

  const showCopy = hasMore && (isFetchingMore || intersecting)
  if (!hasMore && !isFetchingMore) return null

  const copy = dataWorkspaceTableInfiniteCopy(world)

  return (
    <div
      ref={sentinelRef}
      className="data-workspace-table-infinite"
      aria-hidden={!showCopy}
    >
      {showCopy ? (
        <div className="data-workspace-table-infinite__stage">
          <p
            className="data-workspace-table-infinite__copy"
            aria-live="polite"
            aria-atomic="true"
          >
            <span
              className="data-workspace-table-infinite__phrase"
              data-text={copy}
            >
              {copy}
            </span>
            <span className="data-workspace-table-infinite__dots" aria-hidden>
              <span />
              <span />
              <span />
            </span>
          </p>
        </div>
      ) : null}
    </div>
  )
}
