"use client"

import type { OperationPurchaseRow } from "@/app/[siteId]/[popId]/operations/actions"
import { OperationPurchaseDetailDialog } from "@/app/[siteId]/[popId]/operations/OperationPurchaseDetailDialog"
import {
  purchaseHasComprobante,
  purchaseKindLabel,
  resolvePurchaseDisplayTaxTotal,
} from "@/app/[siteId]/[popId]/operations/operationPurchaseUi"
import {
  OperationTableMoneyCell,
  OperationTableStackCell,
  OperationTableVerMas,
  operationTablePrimaryClass,
  operationTableSecondaryClass,
} from "@/app/[siteId]/[popId]/operations/operationsTableCells"
import { formatOperationSaleDateInline } from "@/app/[siteId]/[popId]/operations/OperationsSalesTable"
import { OperationsPurchasesSkeletonRows } from "@/app/[siteId]/[popId]/operations/OperationsTableSkeleton"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import {
  workspaceTableBodyCellClass,
  selectColumnInnerClass,
  tableRowSelectCheckboxClass,
  tdClientLinkedClass,
  tdClientNamedClass,
  tdMoneyMutedClass,
  workspaceDataTableClassName,
  workspaceTableBodyRowClassNames,
  workspaceTableSelectBodyCellClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceListTableFrame } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
  WorkspaceTableSelectHead,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { popScopedHref } from "@/lib/popRoutes"
import { cn } from "@/lib/utils"
import Link from "next/link"
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
  const supplierLabel = purchase.supplierName.trim() || "—"
  const documentNumber = purchase.documentNumber?.trim() || null
  const hasComprobante = purchaseHasComprobante(purchase)
  const comprobanteTipo = purchase.documentKindLabel?.trim() || null
  const ivaAmount = resolvePurchaseDisplayTaxTotal(purchase)

  return (
    <>
      <TableCell className={workspaceTableSelectBodyCellClass}>
        <div className={selectColumnInnerClass}>
          <Checkbox
            className={tableRowSelectCheckboxClass}
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
      <OperationTableStackCell className="min-w-[10rem]">
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
      <OperationTableStackCell className="min-w-[14rem]">
        {purchase.supplierId && purchase.supplierName !== "—" ? (
          <Link
            href={suppliersSearchHref(siteId, popId, purchase.supplierName)}
            className={cn(tdClientLinkedClass, "text-xs leading-snug")}
            title={supplierLabel}
          >
            {supplierLabel}
          </Link>
        ) : purchase.supplierName !== "—" ? (
          <p className={cn(tdClientNamedClass, "text-xs leading-snug")} title={supplierLabel}>
            {supplierLabel}
          </p>
        ) : (
          <p className={cn(operationTableSecondaryClass, "text-xs leading-snug")}>
            {supplierLabel}
          </p>
        )}
        <p
          className={operationTablePrimaryClass}
          title={purchaseKindLabel(purchase.purchaseKind)}
        >
          {purchaseKindLabel(purchase.purchaseKind)}
        </p>
        <OperationTableVerMas
          label={` de la compra ${purchase.id}`}
          onClick={() => onOpenDetail(purchase)}
        />
      </OperationTableStackCell>
      {hasComprobante ? (
        <OperationTableStackCell className="min-w-[11rem]">
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
        <TableCell className={cn(workspaceTableBodyCellClass, "min-w-[11rem] align-middle")}>
          <span className={tdMoneyMutedClass}>—</span>
        </TableCell>
      )}
      <OperationTableMoneyCell amount={purchase.discountTotal} />
      <OperationTableMoneyCell amount={ivaAmount ?? 0} />
      <OperationTableMoneyCell amount={purchase.total} showDashWhenZero={false} />
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
}: {
  siteId: string
  popId: string
  rows: OperationPurchaseRow[]
  listFetching: boolean
  totalCount: number
  skeletonRowCount: number
  selected: Set<string>
  onSelectedChange: Dispatch<SetStateAction<Set<string>>>
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
      <DataWorkspaceListTableFrame>
        <table
          className={workspaceDataTableClassName}
          aria-busy={listFetching}
        >
          <WorkspaceTableHeader>
            <WorkspaceTableHeaderRow>
              <WorkspaceTableSelectHead
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
              />
              <WorkspaceTableHead className="min-w-[10rem]">Fecha</WorkspaceTableHead>
              <WorkspaceTableHead className="min-w-[14rem]">Detalle</WorkspaceTableHead>
              <WorkspaceTableHead className="min-w-[11rem]">Comprobante</WorkspaceTableHead>
              <WorkspaceTableHead align="right">Descuento</WorkspaceTableHead>
              <WorkspaceTableHead align="right">IVA</WorkspaceTableHead>
              <WorkspaceTableHead align="right">Total</WorkspaceTableHead>
            </WorkspaceTableHeaderRow>
          </WorkspaceTableHeader>
          <TableBody>
            {listFetching ? (
              <OperationsPurchasesSkeletonRows rowCount={skeletonRowCount} />
            ) : totalCount === 0 ? (
              null
            ) : (
              rows.map((purchase, i) => (
                <TableRow
                  key={purchase.id}
                  className={workspaceTableBodyRowClassNames(i)}
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
                </TableRow>
              ))
            )}
          </TableBody>
        </table>
        {!listFetching && totalCount === 0 ? (
          <div className="min-h-[12rem] flex-1" aria-hidden />
        ) : null}
      </DataWorkspaceListTableFrame>

      <OperationPurchaseDetailDialog
        purchase={detailPurchase}
        open={detailPurchase != null}
        onOpenChange={(open) => {
          if (!open) setDetailPurchase(null)
        }}
        timeZone={timeZone}
      />
    </>
  )
}
