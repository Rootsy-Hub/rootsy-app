"use client"

import type { OperationPurchaseRow } from "@/app/[siteId]/[popId]/operations/actions"
import { OperationPurchaseDetailDialog } from "@/app/[siteId]/[popId]/operations/OperationPurchaseDetailDialog"
import {
  purchaseHasComprobante,
  purchaseKindLabel,
  resolvePurchaseDisplayTaxTotal,
} from "@/app/[siteId]/[popId]/operations/operationPurchaseUi"
import {
  OperationTableClientLine,
  OperationTableEmptyComprobanteCell,
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
import { OperationsPurchasesSkeletonRows } from "@/app/[siteId]/[popId]/operations/OperationsTableSkeleton"
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
  WorkspaceTableHead,
  WorkspaceTableBodyRow,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
  WorkspaceTableSelectHead,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { WorkspaceTableSortHead } from "@/components/data-workspace/WorkspaceTableSortHead"
import type { WorkspaceTableSortDisplayDirection } from "@/lib/workspaceTableSort"
import { popScopedHref } from "@/lib/popRoutes"
import { cn } from "@/lib/utils"
import { PanelRightOpen } from "lucide-react"
import { useMemo, useState, type Dispatch, type SetStateAction } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"

function suppliersSearchHref(
  siteId: string,
  popId: string,
  query: string,
): string {
  const base = popScopedHref(siteId, popId, "suppliers")
  const q = query.trim()
  if (!q) return base
  return `${base}?${new URLSearchParams({ q }).toString()}`
}

function PurchasesTableRow({
  purchase,
  siteId,
  popId,
  timeZone,
  selected,
  onSelectedChange,
  onOpenDetail,
}: {
  purchase: OperationPurchaseRow
  siteId: string
  popId: string
  timeZone?: string
  selected: Set<string>
  onSelectedChange: Dispatch<SetStateAction<Set<string>>>
  onOpenDetail: (purchase: OperationPurchaseRow) => void
}) {
  const whenInline = formatOperationSaleDateInline(purchase.operationAt, timeZone)
  const supplierName =
    purchase.supplierName.trim() && purchase.supplierName !== "—"
      ? purchase.supplierName.trim()
      : null
  const documentNumber = purchase.documentNumber?.trim() || null
  const hasComprobante = purchaseHasComprobante(purchase)
  const comprobanteTipo = purchase.documentKindLabel?.trim() || null
  const ivaAmount = resolvePurchaseDisplayTaxTotal(purchase)

  return (
    <>
      <TableCell className={workspaceTableLayoutSelectBodyCellClass}>
        <div className={selectColumnInnerClass}>
          <Checkbox
            className={workspaceTableNatureCheckboxClass}
            checked={selected.has(purchase.id)}
            onCheckedChange={(checked) => {
              onSelectedChange((prev) => {
                const next = new Set(prev)
                if (checked === true) next.add(purchase.id)
                else next.delete(purchase.id)
                return next
              })
            }}
            aria-label={`Seleccionar compra ${purchase.id}`}
          />
        </div>
      </TableCell>
      <OperationTableStackCell className={operationsTableDateColumnClass}>
        <p className={cn(operationTablePrimaryClass, "tabular-nums")} title={whenInline}>
          {whenInline}
        </p>
        <p
          className={operationTableSecondaryClass}
          title={purchase.purchasedByName ?? undefined}
        >
          {purchase.purchasedByName ?? "—"}
        </p>
      </OperationTableStackCell>
      <OperationTableStackCell className={operationsTableDetailColumnClass}>
        {supplierName ? (
          <OperationTableClientLine
            name={supplierName}
            asPrimary
            href={
              purchase.supplierId && supplierName
                ? suppliersSearchHref(siteId, popId, supplierName)
                : null
            }
          />
        ) : (
          <p
            className={operationTablePrimaryClass}
            title={purchaseKindLabel(purchase.purchaseKind)}
          >
            {purchaseKindLabel(purchase.purchaseKind)}
          </p>
        )}
        <OperationTableVerMas
          label={` de la compra ${purchase.id}`}
          onClick={() => onOpenDetail(purchase)}
        />
      </OperationTableStackCell>
      {hasComprobante ? (
        <OperationTableStackCell className={operationsTableComprobanteColumnClass}>
          <p
            className={operationTablePrimaryClass}
            title={comprobanteTipo ?? documentNumber ?? undefined}
          >
            {comprobanteTipo ?? documentNumber ?? "—"}
          </p>
          <p
            className={operationTableSecondaryClass}
            title={
              comprobanteTipo && documentNumber
                ? documentNumber
                : purchase.supplierIvaConditionLabel
            }
          >
            {comprobanteTipo && documentNumber
              ? documentNumber
              : purchase.supplierIvaConditionLabel}
          </p>
        </OperationTableStackCell>
      ) : (
        <OperationTableEmptyComprobanteCell />
      )}
      <OperationTableMoneyCell amount={purchase.discountTotal} />
      <OperationTableMoneyCell amount={ivaAmount ?? 0} />
      <OperationTableMoneyCell amount={purchase.total} showDashWhenZero={false} />
      <OperationTableActionsCell>
        <OperationTableRowOptionsMenu
          rowLabel={`compra ${purchase.id}`}
          items={[
            {
              id: "detail",
              label: "Ver detalle",
              icon: PanelRightOpen,
              onSelect: () => onOpenDetail(purchase),
            },
          ]}
        />
      </OperationTableActionsCell>
    </>
  )
}

export function OperationsPurchasesTable({
  siteId,
  popId,
  rows,
  listFetching,
  totalCount,
  skeletonRowCount,
  selected,
  onSelectedChange,
  sortable = true,
  sortDirection,
  onSortColumn,
}: {
  siteId: string
  popId: string
  rows: OperationPurchaseRow[]
  listFetching: boolean
  totalCount: number
  skeletonRowCount: number
  selected: Set<string>
  onSelectedChange: Dispatch<SetStateAction<Set<string>>>
  sortable?: boolean
  sortDirection?: (
    column: "created_at" | "total",
  ) => WorkspaceTableSortDisplayDirection
  onSortColumn?: (column: "created_at" | "total") => void
}) {
  const timeZone = usePopTimeZone()
  const [detailPurchase, setDetailPurchase] =
    useState<OperationPurchaseRow | null>(null)

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
              {sortable ? (
                <WorkspaceTableSortHead
                  tone="nature"
                  label="Fecha"
                  direction={sortDirection?.("created_at") ?? "none"}
                  onSort={
                    onSortColumn ? () => onSortColumn("created_at") : undefined
                  }
                  className={operationsTableHeaderClass(operationsTableDateColumnClass)}
                />
              ) : (
                <WorkspaceTableHead
                  tone="nature"
                  className={operationsTableHeaderClass(operationsTableDateColumnClass)}
                >
                  Fecha
                </WorkspaceTableHead>
              )}
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
                Comprobante
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
              {sortable ? (
                <WorkspaceTableSortHead
                  tone="nature"
                  label="Total"
                  align="right"
                  direction={sortDirection?.("total") ?? "none"}
                  onSort={
                    onSortColumn ? () => onSortColumn("total") : undefined
                  }
                  className={operationsTableHeaderClass(
                    operationsTableMoneyColumnClass,
                  )}
                />
              ) : (
                <WorkspaceTableHead
                  tone="nature"
                  align="right"
                  className={operationsTableHeaderClass(operationsTableMoneyColumnClass)}
                >
                  Total
                </WorkspaceTableHead>
              )}
              <OperationTableActionsHead />
            </WorkspaceTableHeaderRow>
          </WorkspaceTableHeader>
          <TableBody>
            {listFetching ? (
              <OperationsPurchasesSkeletonRows rowCount={skeletonRowCount} />
            ) : totalCount === 0 ? (
              null
            ) : (
              rows.map((purchase, i) => (
                <WorkspaceTableBodyRow
                        key={purchase.id}
                        index={i}
                        selected={selected.has(purchase.id)}
                      >
                  <PurchasesTableRow
                    purchase={purchase}
                    siteId={siteId}
                    popId={popId}
                    timeZone={timeZone}
                    selected={selected}
                    onSelectedChange={onSelectedChange}
                    onOpenDetail={setDetailPurchase}
                  />
                </WorkspaceTableBodyRow>
              ))
            )}
          </TableBody>
        </table>
      </DataWorkspaceListTableFrame>

      <OperationPurchaseDetailDialog
        purchase={detailPurchase}
        open={detailPurchase != null}
        onOpenChange={(open) => {
          if (!open) setDetailPurchase(null)
        }}
        popId={popId}
        timeZone={timeZone}
      />
    </>
  )
}
