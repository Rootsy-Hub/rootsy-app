"use client"

import {
  dataWorkspaceEntityCardStatLabelClass,
  workspaceTableNatureMoneyClass,
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  workspaceTableLayoutBodyCellClass,
  workspaceTableLayoutInsetHeaderHeadClass,
  workspaceTableLayoutInsetTableClass,
  workspaceTableLayoutInsetTableShellClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import {
  WorkspaceTableBodyRow,
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { workspaceLayoutsTablesScopeClass } from "@/components/layouts-tables/rootsLayoutsTablesProductStyles"
import { resolvePurchaseOrderLineSummaries } from "@/lib/purchaseOrderDocumentLines"
import type { PurchaseOrderMetadata } from "@/lib/purchaseOrderTypes"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import { cn } from "@/lib/utils"
import { TableBody, TableCell } from "@/components/ui/table"

type Props = {
  metadata: PurchaseOrderMetadata
  subtotal: number
  discountTotal: number
  total: number
  className?: string
}

export function PurchaseOrderLinesBreakdown({
  metadata,
  subtotal,
  discountTotal,
  total,
  className,
}: Props) {
  const lineSummaries = resolvePurchaseOrderLineSummaries(metadata)

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          workspaceLayoutsTablesScopeClass,
          workspaceTableLayoutInsetTableShellClass,
        )}
      >
        <table className={workspaceTableLayoutInsetTableClass}>
          <WorkspaceTableHeader>
            <WorkspaceTableHeaderRow>
              <WorkspaceTableHead
                tone="nature"
                className={workspaceTableLayoutInsetHeaderHeadClass}
              >
                Artículo
              </WorkspaceTableHead>
              <WorkspaceTableHead
                tone="nature"
                className={cn(workspaceTableLayoutInsetHeaderHeadClass, "text-right")}
              >
                Cant.
              </WorkspaceTableHead>
              <WorkspaceTableHead
                tone="nature"
                className={cn(workspaceTableLayoutInsetHeaderHeadClass, "text-right")}
              >
                Costo unit.
              </WorkspaceTableHead>
              <WorkspaceTableHead
                tone="nature"
                className={cn(workspaceTableLayoutInsetHeaderHeadClass, "text-right")}
              >
                Subtotal
              </WorkspaceTableHead>
            </WorkspaceTableHeaderRow>
          </WorkspaceTableHeader>
          <TableBody>
            {lineSummaries.length === 0 ? (
              <WorkspaceTableBodyRow index={0} noHover>
                <TableCell
                  colSpan={4}
                  className={cn(
                    workspaceTableLayoutBodyCellClass,
                    workspaceTableNatureTextSecondaryClass,
                    "py-6 text-center",
                  )}
                >
                  Sin ítems
                </TableCell>
              </WorkspaceTableBodyRow>
            ) : (
              lineSummaries.map((line, index) => (
                <WorkspaceTableBodyRow key={`${line.name}-${index}`} index={index}>
                  <TableCell
                    className={cn(
                      workspaceTableLayoutBodyCellClass,
                      workspaceTableNatureTextPrimaryClass,
                      "!h-auto !max-h-none whitespace-normal py-3",
                    )}
                  >
                    {line.name}
                  </TableCell>
                  <TableCell
                    className={cn(
                      workspaceTableLayoutBodyCellClass,
                      workspaceTableNatureTextPrimaryClass,
                      "text-right tabular-nums",
                    )}
                  >
                    {line.quantity}
                  </TableCell>
                  <TableCell
                    className={cn(
                      workspaceTableLayoutBodyCellClass,
                      workspaceTableNatureMoneyClass,
                      "text-right tabular-nums",
                    )}
                  >
                    {formatReportMoneyAr(line.unitPrice)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      workspaceTableLayoutBodyCellClass,
                      workspaceTableNatureMoneyClass,
                      "text-right tabular-nums",
                    )}
                  >
                    {formatReportMoneyAr(line.lineTotal)}
                  </TableCell>
                </WorkspaceTableBodyRow>
              ))
            )}
          </TableBody>
        </table>
      </div>

      <div className="space-y-2 border-t border-[var(--rootsy-bruma-200)] pt-3">
        <div className="flex justify-between gap-4 text-sm">
          <span className={dataWorkspaceEntityCardStatLabelClass}>Subtotal</span>
          <span className={workspaceTableNatureMoneyClass}>
            {formatReportMoneyAr(subtotal)}
          </span>
        </div>
        {discountTotal > 0 ? (
          <div className="flex justify-between gap-4 text-sm">
            <span className={dataWorkspaceEntityCardStatLabelClass}>
              Descuento
              {metadata.discountLabel ? ` (${metadata.discountLabel})` : ""}
            </span>
            <span className={workspaceTableNatureMoneyClass}>
              -{formatReportMoneyAr(discountTotal)}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between gap-4">
          <span className={dataWorkspaceEntityCardStatLabelClass}>Total</span>
          <span
            className={cn(
              workspaceTableNatureMoneyClass,
              "font-canopy text-base font-semibold",
            )}
          >
            {formatReportMoneyAr(total)}
          </span>
        </div>
      </div>
    </div>
  )
}
