"use client"

import { cn } from "@/lib/utils"
import {
  treasuryMovementListTokensFor,
  type TreasuryMovementListTokensVariant,
} from "@/app/[siteId]/[popId]/accounts/treasuryMovementListStyles"
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
  tokensVariant = "default",
  itemLabel = "movimiento",
  itemLabelPlural = "movimientos",
}: {
  hasMore: boolean
  totalCount: number
  sentinelRef: RefObject<HTMLDivElement | null>
  fullWidth?: boolean
  tokensVariant?: TreasuryMovementListTokensVariant
  itemLabel?: string
  itemLabelPlural?: string
}) {
  const tokens = treasuryMovementListTokensFor(tokensVariant)
  const paddingClass = fullWidth ? "px-4 lg:px-5" : "px-3"

  if (hasMore) {
    return (
      <div
        ref={sentinelRef}
        className={cn(
          "flex items-center justify-center gap-2 border-t py-4",
          tokens.footer,
          tokens.footerLoadingBorder,
          paddingClass,
        )}
      >
        <RootsSpinner size="xs" aria-hidden className="shrink-0" />
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
        "flex items-center gap-3 py-6",
        tokens.footer,
        paddingClass,
      )}
    >
      <span className={cn("h-px flex-1", tokens.footerDivider)} aria-hidden />
      <span className="shrink-0 text-center">Fin del listado · {countLabel}</span>
      <span className={cn("h-px flex-1", tokens.footerDivider)} aria-hidden />
    </div>
  )
}
