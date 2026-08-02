"use client"

import type { CashRegisterSessionOperationRow } from "@/app/[siteId]/[popId]/cash-registers/actions"
import {
  TreasuryInfiniteScrollFooter,
  useTreasuryInfiniteScroll,
} from "@/app/[siteId]/[popId]/accounts/treasuryInfiniteScroll"
import { TreasuryYearGroupedMovementsView } from "@/app/[siteId]/[popId]/accounts/TreasuryYearGroupedMovementsView"
import {
  formatTreasuryInlineMovementDescription,
  formatTreasuryMovementTime,
  groupItemsByYearAndDate,
} from "@/app/[siteId]/[popId]/accounts/treasuryAccountUiUtils"
import {
  formatCashRegisterMoney,
} from "@/app/[siteId]/[popId]/cash-registers/cashRegisterFormatters"
import { OperationSaleDetailDialog } from "@/app/[siteId]/[popId]/operations/OperationSaleDetailDialog"
import { getOperationSaleById } from "@/app/[siteId]/[popId]/operations/actions"
import type {
  OperationSaleDetailContext,
  OperationSaleRow,
} from "@/app/[siteId]/[popId]/operations/actions"
import { tdMoneyClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import { useDataWorkspaceMainScrollRoot } from "@/hooks/useDataWorkspaceMainScrollRoot"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { toPopCalendarDate } from "@/lib/popTimezone"
import { cn } from "@/lib/utils"
import { useCallback, useMemo, useState } from "react"

type Props = {
  siteId: string
  popId: string
  operations: CashRegisterSessionOperationRow[]
  fullWidth?: boolean
}

type CashRegisterOperationDisplayRow = CashRegisterSessionOperationRow & {
  date: string
  sortAt: string
  timeLabel: string
}

function formatOperationMainLine(row: CashRegisterSessionOperationRow): string {
  const description =
    row.kind === "sale"
      ? `${row.operationLabel} · ${row.customerLabel}`
      : row.operationLabel
  return description
}

function formatOperationAmount(row: CashRegisterSessionOperationRow): string {
  const isInflow = row.kind === "sale" || row.kind === "deposit"
  const formatted = formatCashRegisterMoney(row.amount)
  return isInflow ? formatted : `−${formatted}`
}

function toDisplayRows(
  operations: CashRegisterSessionOperationRow[],
  timeZone?: string,
): CashRegisterOperationDisplayRow[] {
  return operations.map((operation) => ({
    ...operation,
    date: timeZone
      ? toPopCalendarDate(operation.occurredAt, timeZone)
      : operation.occurredAt.slice(0, 10),
    sortAt: operation.occurredAt,
    timeLabel: formatTreasuryMovementTime(operation.occurredAt, timeZone),
  }))
}

export function CashRegisterSessionOperationsTable({
  siteId,
  popId,
  operations,
  fullWidth = true,
}: Props) {
  const timeZone = usePopTimeZone()
  const scrollRoot = useDataWorkspaceMainScrollRoot()
  const { visibleItems, hasMore, totalCount, sentinelRef } =
    useTreasuryInfiniteScroll(operations, scrollRoot)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailSale, setDetailSale] = useState<OperationSaleRow | null>(null)
  const [detailContext, setDetailContext] =
    useState<OperationSaleDetailContext | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  const displayRows = useMemo(
    () => toDisplayRows(visibleItems, timeZone),
    [visibleItems, timeZone],
  )

  const yearGroups = useMemo(
    () => groupItemsByYearAndDate(displayRows, timeZone),
    [displayRows, timeZone],
  )

  const openSaleDetail = useCallback(
    async (saleId: string) => {
      setDetailOpen(true)
      setDetailSale(null)
      setDetailContext(null)
      setDetailError(null)
      setDetailLoading(true)

      const res = await getOperationSaleById(popId, saleId)
      setDetailLoading(false)
      if (!res.success) {
        setDetailError(res.error)
        return
      }
      setDetailSale(res.sale)
      setDetailContext(res.context)
    },
    [popId],
  )

  const handleDetailOpenChange = useCallback((open: boolean) => {
    setDetailOpen(open)
    if (!open) {
      setDetailSale(null)
      setDetailContext(null)
      setDetailError(null)
      setDetailLoading(false)
    }
  }, [])

  if (operations.length === 0) {
    return (
      <>
        <div
          className={cn(
            "flex min-h-48 items-center justify-center px-4 py-10 text-center text-sm text-muted-foreground lg:px-5",
            !fullWidth && "rounded-lg border border-border/60",
          )}
        >
          No hay operaciones en este arqueo.
        </div>
        <OperationSaleDetailDialog
          sale={detailSale}
          context={detailContext}
          open={detailOpen}
          onOpenChange={handleDetailOpenChange}
          siteId={siteId}
          popId={popId}
          timeZone={timeZone}
          loading={detailLoading}
          error={detailError}
        />
      </>
    )
  }

  return (
    <>
      <div
        className={cn(
          "relative w-full",
          !fullWidth && "rounded-lg border border-border/60",
        )}
      >
        <TreasuryYearGroupedMovementsView
          yearGroups={yearGroups}
          emptyMessage="No hay operaciones en este arqueo."
          fullWidth={fullWidth}
          getRowKey={(row) => row.id}
          renderRow={(row) => ({
            description: formatTreasuryInlineMovementDescription(
              formatOperationMainLine(row),
              row.timeLabel,
            ),
            subtitle: row.paymentMethodLabel,
            amount: formatOperationAmount(row),
            amountClassName: tdMoneyClass,
            onClick:
              row.kind === "sale" && row.saleId
                ? () => void openSaleDetail(row.saleId!)
                : undefined,
          })}
        />

        <TreasuryInfiniteScrollFooter
          hasMore={hasMore}
          totalCount={totalCount}
          sentinelRef={sentinelRef}
          fullWidth={fullWidth}
          itemLabel="operación"
          itemLabelPlural="operaciones"
        />
      </div>

      <OperationSaleDetailDialog
        sale={detailSale}
        context={detailContext}
        open={detailOpen}
        onOpenChange={handleDetailOpenChange}
        siteId={siteId}
        popId={popId}
        timeZone={timeZone}
        loading={detailLoading}
        error={detailError}
      />
    </>
  )
}
