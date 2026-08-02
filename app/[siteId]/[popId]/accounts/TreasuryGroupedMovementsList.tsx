"use client"

import type { PaymentMethodMovementRow } from "@/app/[siteId]/[popId]/accounts/treasuryDetailActions"
import { TreasuryYearGroupedMovementsView } from "@/app/[siteId]/[popId]/accounts/TreasuryYearGroupedMovementsView"
import {
  expandTreasuryPaymentMethodMovementRows,
  formatTreasuryInlineMovementDescription,
  groupItemsByYearAndDate,
} from "@/app/[siteId]/[popId]/accounts/treasuryAccountUiUtils"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { useMemo, type ReactNode } from "react"

type Props = {
  movements: PaymentMethodMovementRow[]
  fullWidth?: boolean
  className?: string
  rowClassName?: string
  renderRowTrailing?: (movement: PaymentMethodMovementRow) => ReactNode
}

export function TreasuryGroupedMovementsList({
  movements,
  fullWidth = false,
  className,
  rowClassName,
  renderRowTrailing,
}: Props) {
  const timeZone = usePopTimeZone()
  const displayRows = useMemo(
    () =>
      expandTreasuryPaymentMethodMovementRows(movements, {
        timeZone,
        netAccountImpact: true,
      }),
    [movements, timeZone],
  )
  const yearGroups = useMemo(
    () => groupItemsByYearAndDate(displayRows, timeZone),
    [displayRows, timeZone],
  )

  return (
    <TreasuryYearGroupedMovementsView
      yearGroups={yearGroups}
      emptyMessage="No hay movimientos en el período seleccionado."
      fullWidth={fullWidth}
      className={className}
      rowClassName={rowClassName}
      getRowKey={(row) => row.rowKey}
      renderRow={(row) => ({
        description: formatTreasuryInlineMovementDescription(
          row.description,
          row.timeLabel,
        ),
        amount: row.amount,
        descriptionClassName: row.descriptionClassName,
        amountClassName: row.amountClassName,
        trailing:
          row.sourceMovement && renderRowTrailing
            ? renderRowTrailing(row.sourceMovement)
            : undefined,
      })}
    />
  )
}
