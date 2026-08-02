"use client"

import type { PaymentMethodMovementRow } from "@/app/[siteId]/[popId]/accounts/treasuryDetailActions"
import { TreasuryGroupedMovementsList } from "@/app/[siteId]/[popId]/accounts/TreasuryGroupedMovementsList"
import {
  TreasuryInfiniteScrollFooter,
  useTreasuryInfiniteScroll,
} from "@/app/[siteId]/[popId]/accounts/treasuryInfiniteScroll"
import { cn } from "@/lib/utils"

export function TreasuryCashMovementsTable({
  movements,
  fullWidth = false,
  scrollRoot = null,
}: {
  movements: PaymentMethodMovementRow[]
  /** @deprecated Ya no se usan columnas extra; la descripción resume el movimiento. */
  showTreasuryDetails?: boolean
  fullWidth?: boolean
  scrollRoot?: HTMLElement | null
}) {
  const { visibleItems, hasMore, totalCount, sentinelRef } =
    useTreasuryInfiniteScroll(movements, scrollRoot)

  return (
    <div className={cn("overflow-hidden", fullWidth ? undefined : "rounded-lg")}>
      <TreasuryGroupedMovementsList
        movements={visibleItems}
        fullWidth={fullWidth}
      />
      <TreasuryInfiniteScrollFooter
        hasMore={hasMore}
        totalCount={totalCount}
        sentinelRef={sentinelRef}
        fullWidth={fullWidth}
      />
    </div>
  )
}
