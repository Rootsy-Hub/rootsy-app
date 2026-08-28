"use client"

import { DATA_WORKSPACE_TABLE_PAGE_SIZE } from "@/lib/dataWorkspaceTableInfinite"
import { useCallback, useEffect, useMemo, useState } from "react"

export function useDataWorkspaceClientInfiniteSlice<T>(
  items: T[],
  resetKey: string,
) {
  const [visibleCount, setVisibleCount] = useState(DATA_WORKSPACE_TABLE_PAGE_SIZE)

  useEffect(() => {
    setVisibleCount(DATA_WORKSPACE_TABLE_PAGE_SIZE)
  }, [resetKey])

  const visible = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  )
  const hasMore = visibleCount < items.length

  const loadMore = useCallback(() => {
    setVisibleCount((count) =>
      Math.min(count + DATA_WORKSPACE_TABLE_PAGE_SIZE, items.length),
    )
  }, [items.length])

  const revealUpToPage = useCallback(
    (page: number) => {
      const nextPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
      setVisibleCount(
        Math.min(nextPage * DATA_WORKSPACE_TABLE_PAGE_SIZE, items.length),
      )
    },
    [items.length],
  )

  return { visible, hasMore, loadMore, revealUpToPage }
}
