"use client"

import { WorkspaceTableSkeletonRows } from "@/components/data-workspace/WorkspaceTableSkeleton"
import {
  operationsExpensesSkeletonColumns,
  operationsPurchasesSkeletonColumns,
  operationsSalesSkeletonColumns,
} from "@/components/data-workspace/workspaceTableSkeletonPresets"

export function OperationsSalesSkeletonRows({
  rowCount,
  showTableColumn = false,
  showOrderColumn = false,
  ventasLayout = false,
}: {
  rowCount: number
  showTableColumn?: boolean
  showOrderColumn?: boolean
  ventasLayout?: boolean
}) {
  return (
    <WorkspaceTableSkeletonRows
      rowCount={rowCount}
      rowKeyPrefix="ops-sales-sk"
      columns={operationsSalesSkeletonColumns({
        showTableColumn,
        showOrderColumn,
        ventasLayout,
      })}
    />
  )
}

export function OperationsPurchasesSkeletonRows({
  rowCount,
}: {
  rowCount: number
}) {
  return (
    <WorkspaceTableSkeletonRows
      rowCount={rowCount}
      rowKeyPrefix="ops-purch-sk"
      columns={operationsPurchasesSkeletonColumns()}
    />
  )
}

export function OperationsExpensesSkeletonRows({
  rowCount,
}: {
  rowCount: number
}) {
  return (
    <WorkspaceTableSkeletonRows
      rowCount={rowCount}
      rowKeyPrefix="ops-exp-sk"
      columns={operationsExpensesSkeletonColumns()}
    />
  )
}
