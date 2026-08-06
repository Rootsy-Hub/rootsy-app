"use client"

import type { TreasuryPosSummaryMovementRow } from "@/app/[siteId]/[popId]/accounts/treasuryDetailActions"
import {
  TreasuryInfiniteScrollFooter,
  useTreasuryInfiniteScroll,
} from "@/app/[siteId]/[popId]/accounts/treasuryInfiniteScroll"
import type { DataWorkspaceDetailEmptyStateContent } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import { TreasuryYearGroupedMovementsView } from "@/app/[siteId]/[popId]/accounts/TreasuryYearGroupedMovementsView"
import {
  formatTreasuryMovementAmount,
  formatTreasuryExpensePaymentLabel,
  formatTreasuryPosSaleLabel,
  formatTreasuryPurchasePaymentLabel,
  groupItemsByYearAndDate,
  treasuryMoneyFmt,
} from "@/app/[siteId]/[popId]/accounts/treasuryAccountUiUtils"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { useMemo } from "react"

function summaryMovementDescription(
  movement: TreasuryPosSummaryMovementRow,
): string {
  const label = movement.label.trim()
  if (label) return label

  switch (movement.kind) {
    case "pos_sale":
      return formatTreasuryPosSaleLabel({ saleChannel: "pos" })
    case "cash_register_close":
      return "Cierre de caja"
    case "purchase_payment":
      return formatTreasuryPurchasePaymentLabel({})
    case "expense_payment":
      return formatTreasuryExpensePaymentLabel({})
    default:
      return "Movimiento"
  }
}

export function TreasuryGroupedSummaryMovementsList({
  movements,
  emptyState,
  positiveAmounts = false,
  scrollRoot = null,
}: {
  movements: TreasuryPosSummaryMovementRow[]
  emptyState: DataWorkspaceDetailEmptyStateContent
  positiveAmounts?: boolean
  scrollRoot?: HTMLElement | null
}) {
  const timeZone = usePopTimeZone()
  const { visibleItems, hasMore, totalCount, sentinelRef } =
    useTreasuryInfiniteScroll(movements, scrollRoot)
  const yearGroups = useMemo(
    () => groupItemsByYearAndDate(visibleItems, timeZone),
    [visibleItems, timeZone],
  )

  return (
    <div className="overflow-hidden">
      <TreasuryYearGroupedMovementsView
        yearGroups={yearGroups}
        emptyState={emptyState}
        fullWidth
        getRowKey={(movement) => `${movement.kind}-${movement.id}`}
        renderRow={(movement) => ({
          description: summaryMovementDescription(movement),
          amount: positiveAmounts
            ? treasuryMoneyFmt.format(movement.amount)
            : formatTreasuryMovementAmount(movement.direction, movement.amount),
        })}
      />
      <TreasuryInfiniteScrollFooter
        hasMore={hasMore}
        totalCount={totalCount}
        sentinelRef={sentinelRef}
        fullWidth
      />
    </div>
  )
}
