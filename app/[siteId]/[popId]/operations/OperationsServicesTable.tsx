"use client"

import type { OperationServiceChargeRow } from "@/app/[siteId]/[popId]/operations/actions"
import { OperationServiceChargeDetailDialog } from "@/app/[siteId]/[popId]/operations/OperationServiceChargeDetailDialog"
import { serviceChargeStatusLabel } from "@/app/[siteId]/[popId]/operations/operationServiceChargeUi"
import {
  OperationTableClientLine,
  OperationTableMoneyCell,
  OperationTableStackCell,
  OperationTableVerMas,
  operationTablePrimaryClass,
  operationTableSecondaryClass,
} from "@/app/[siteId]/[popId]/operations/operationsTableCells"
import {
  operationsTableComprobanteColumnClass,
  operationsTableDateColumnClass,
  operationsTableDetailColumnClass,
  operationsTableHeaderClass,
  operationsTableMoneyColumnClass,
} from "@/app/[siteId]/[popId]/operations/operationsTableLayout"
import {
  OperationTableActionsCell,
  OperationTableActionsHead,
  OperationTableRowOptionsMenu,
} from "@/app/[siteId]/[popId]/operations/operationsTableRowOptions"
import { formatOperationSaleDateInline } from "@/app/[siteId]/[popId]/operations/OperationsSalesTable"
import { OperationsExpensesSkeletonRows } from "@/app/[siteId]/[popId]/operations/OperationsTableSkeleton"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import {
  selectColumnInnerClass,
  workspaceTableLayoutClassName,
  workspaceTableNatureCheckboxClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  workspaceTableLayoutListSurfaceClass,
  workspaceTableLayoutSelectBodyCellClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { DataWorkspaceListTableFrame } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  WorkspaceTableBodyRow,
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
  WorkspaceTableSelectHead,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { WorkspaceTableSortHead } from "@/components/data-workspace/WorkspaceTableSortHead"
import { formatIsoDateShort } from "@/lib/dataWorkspaceDateFilter"
import { popScopedHref } from "@/lib/popRoutes"
import type { WorkspaceTableSortDisplayDirection } from "@/lib/workspaceTableSort"
import { cn } from "@/lib/utils"
import { PanelRightOpen } from "lucide-react"
import { useMemo, useState, type Dispatch, type SetStateAction } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { TableBody, TableCell } from "@/components/ui/table"

function clientsSearchHref(siteId: string, popId: string, query: string): string {
  const base = popScopedHref(siteId, popId, "clients")
  const q = query.trim()
  if (!q) return base
  return `${base}?${new URLSearchParams({ q }).toString()}`
}

function ServicesTableRow({
  charge,
  siteId,
  popId,
  timeZone,
  selected,
  onSelectedChange,
  onOpenDetail,
}: {
  charge: OperationServiceChargeRow
  siteId: string
  popId: string
  timeZone?: string
  selected: Set<string>
  onSelectedChange: Dispatch<SetStateAction<Set<string>>>
  onOpenDetail: (charge: OperationServiceChargeRow) => void
}) {
  const whenInline = formatOperationSaleDateInline(charge.createdAt, timeZone)
  return (
    <>
      <TableCell className={workspaceTableLayoutSelectBodyCellClass}>
        <div className={selectColumnInnerClass}>
          <Checkbox
            className={workspaceTableNatureCheckboxClass}
            checked={selected.has(charge.id)}
            onCheckedChange={(checked) => {
              onSelectedChange((prev) => {
                const next = new Set(prev)
                if (checked === true) next.add(charge.id)
                else next.delete(charge.id)
                return next
              })
            }}
            aria-label={`Seleccionar servicio ${charge.serviceName} de ${charge.clientName}`}
          />
        </div>
      </TableCell>
      <OperationTableStackCell className={operationsTableDateColumnClass}>
        <p
          className={cn(operationTablePrimaryClass, "tabular-nums")}
          title={whenInline}
        >
          {whenInline}
        </p>
        <p className={operationTableSecondaryClass}>
          Vence {formatIsoDateShort(charge.dueDate)}
        </p>
      </OperationTableStackCell>
      <OperationTableStackCell className={operationsTableDetailColumnClass}>
        <OperationTableClientLine
          name={charge.clientName}
          href={clientsSearchHref(siteId, popId, charge.clientName)}
          title={charge.clientName}
          asPrimary
        />
        <p
          className={operationTableSecondaryClass}
          title={charge.serviceName}
        >
          {charge.serviceName}
        </p>
        <OperationTableVerMas
          label={` del servicio ${charge.serviceName}`}
          onClick={() => onOpenDetail(charge)}
        />
      </OperationTableStackCell>
      <OperationTableStackCell className={operationsTableComprobanteColumnClass}>
        <p
          className={operationTablePrimaryClass}
          title={serviceChargeStatusLabel(charge)}
        >
          {serviceChargeStatusLabel(charge)}
        </p>
        <p className={operationTableSecondaryClass} title={charge.periodDisplay}>
          {charge.periodDisplay}
        </p>
      </OperationTableStackCell>
      <OperationTableMoneyCell amount={charge.discountAmount} />
      <OperationTableMoneyCell amount={0} />
      <OperationTableMoneyCell
        amount={charge.amount}
        showDashWhenZero={false}
      />
      <OperationTableActionsCell>
        <OperationTableRowOptionsMenu
          rowLabel={`servicio ${charge.serviceName}`}
          items={[
            {
              id: "detail",
              label: "Ver detalle",
              icon: PanelRightOpen,
              onSelect: () => onOpenDetail(charge),
            },
          ]}
        />
      </OperationTableActionsCell>
    </>
  )
}

export function OperationsServicesTable({
  siteId,
  popId,
  rows,
  listFetching,
  totalCount,
  skeletonRowCount,
  selected,
  onSelectedChange,
  sortDirection,
  onSortColumn,
}: {
  siteId: string
  popId: string
  rows: OperationServiceChargeRow[]
  listFetching: boolean
  totalCount: number
  skeletonRowCount: number
  selected: Set<string>
  onSelectedChange: Dispatch<SetStateAction<Set<string>>>
  sortDirection?: (
    column: "due_date" | "created_at" | "total",
  ) => WorkspaceTableSortDisplayDirection
  onSortColumn?: (column: "due_date" | "created_at" | "total") => void
}) {
  const timeZone = usePopTimeZone()
  const [detailCharge, setDetailCharge] =
    useState<OperationServiceChargeRow | null>(null)

  const visibleIds = useMemo(() => rows.map((row) => row.id), [rows])
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
  const someVisibleSelected = visibleIds.some((id) => selected.has(id))

  return (
    <>
      <DataWorkspaceListTableFrame className={workspaceTableLayoutListSurfaceClass}>
        <table
          className={cn(workspaceTableLayoutClassName, "min-w-[80rem]")}
          aria-busy={listFetching}
        >
          <WorkspaceTableHeader>
            <WorkspaceTableHeaderRow>
              <WorkspaceTableSelectHead
                tone="nature"
                className={operationsTableHeaderClass()}
                checked={
                  allVisibleSelected
                    ? true
                    : someVisibleSelected
                      ? "indeterminate"
                      : false
                }
                onCheckedChange={(checked) => {
                  onSelectedChange((prev) => {
                    const next = new Set(prev)
                    if (checked === true) {
                      visibleIds.forEach((id) => next.add(id))
                    } else {
                      visibleIds.forEach((id) => next.delete(id))
                    }
                    return next
                  })
                }}
                disabled={
                  listFetching || totalCount === 0 || rows.length === 0
                }
                ariaLabel="Seleccionar filas visibles"
              />
              <WorkspaceTableSortHead
                tone="nature"
                label="Fecha"
                direction={sortDirection?.("created_at") ?? "none"}
                onSort={
                  onSortColumn ? () => onSortColumn("created_at") : undefined
                }
                className={operationsTableHeaderClass(operationsTableDateColumnClass)}
              />
              <WorkspaceTableHead
                tone="nature"
                className={operationsTableHeaderClass(operationsTableDetailColumnClass)}
              >
                Detalle
              </WorkspaceTableHead>
              <WorkspaceTableHead
                tone="nature"
                className={operationsTableHeaderClass(operationsTableComprobanteColumnClass)}
              >
                Estado
              </WorkspaceTableHead>
              <WorkspaceTableHead
                tone="nature"
                align="right"
                className={operationsTableHeaderClass(operationsTableMoneyColumnClass)}
              >
                Descuento
              </WorkspaceTableHead>
              <WorkspaceTableHead
                tone="nature"
                align="right"
                className={operationsTableHeaderClass(operationsTableMoneyColumnClass)}
              >
                IVA
              </WorkspaceTableHead>
              <WorkspaceTableSortHead
                tone="nature"
                label="Total"
                align="right"
                direction={sortDirection?.("total") ?? "none"}
                onSort={onSortColumn ? () => onSortColumn("total") : undefined}
                className={operationsTableHeaderClass(operationsTableMoneyColumnClass)}
              />
              <OperationTableActionsHead />
            </WorkspaceTableHeaderRow>
          </WorkspaceTableHeader>
          <TableBody>
            {listFetching ? (
              <OperationsExpensesSkeletonRows rowCount={skeletonRowCount} />
            ) : totalCount === 0 ? null : (
              rows.map((charge, i) => (
                <WorkspaceTableBodyRow
                  key={charge.id}
                  index={i}
                  selected={selected.has(charge.id)}
                  inactive={charge.effectiveStatus === "cancelled"}
                >
                  <ServicesTableRow
                    charge={charge}
                    siteId={siteId}
                    popId={popId}
                    timeZone={timeZone}
                    selected={selected}
                    onSelectedChange={onSelectedChange}
                    onOpenDetail={setDetailCharge}
                  />
                </WorkspaceTableBodyRow>
              ))
            )}
          </TableBody>
        </table>
      </DataWorkspaceListTableFrame>

      <OperationServiceChargeDetailDialog
        charge={detailCharge}
        open={detailCharge != null}
        onOpenChange={(open) => {
          if (!open) setDetailCharge(null)
        }}
      />
    </>
  )
}
