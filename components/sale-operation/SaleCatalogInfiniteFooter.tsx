"use client"

import { RootsSpinner } from "@/components/rootsy-spinner"
import { cn } from "@/lib/utils"
import type { Ref } from "react"

export function SaleCatalogInfiniteFooter({
  hasMore,
  loadingMore,
  sentinelRef,
}: {
  hasMore: boolean
  loadingMore: boolean
  sentinelRef: Ref<HTMLDivElement | null>
}) {
  if (!hasMore && !loadingMore) return null

  return (
    <div className="col-span-full">
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />
      {loadingMore ? (
        <div
          className={cn(
            "flex items-center justify-center gap-2 py-4",
            "text-sm text-[color-mix(in_srgb,var(--rootsy-bruma-200)_70%,transparent)]",
          )}
        >
          <RootsSpinner size="xs" tone="dark" aria-hidden className="shrink-0" />
          Cargando más…
        </div>
      ) : null}
    </div>
  )
}
