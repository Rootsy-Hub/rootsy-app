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
import {
  quoteHasInlineDiscounts,
  quoteSubtotalSinDescuentos,
  resolveQuoteLineGroups,
} from "@/lib/saleQuoteDocumentLines"
import type { SaleQuoteMetadata } from "@/lib/saleQuoteTypes"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import { cn } from "@/lib/utils"
import { TableBody, TableCell } from "@/components/ui/table"

type Props = {
  metadata: SaleQuoteMetadata
  subtotal: number
  discountTotal: number
  total: number
  className?: string
}

function isPromoGroupCategory(category: string): boolean {
  const normalized = category.trim().toLowerCase()
  return normalized !== "general" && normalized !== "detalle"
}

export function SaleQuoteLinesBreakdown({
  metadata,
  subtotal,
  discountTotal,
  total,
  className,
}: Props) {
  const lineGroups = resolveQuoteLineGroups(metadata)
  const showListSubtotal = quoteHasInlineDiscounts(lineGroups)
  const subtotalSinDescuentos = quoteSubtotalSinDescuentos(lineGroups)

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
                Producto
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
                Precio unit.
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
            {lineGroups.length === 0 ? (
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
              lineGroups.map((group) => (
                <GroupRows key={group.id} group={group} />
              ))
            )}
          </TableBody>
        </table>
      </div>

      <div className="space-y-2 border-t border-[var(--rootsy-bruma-200)] pt-3">
        {showListSubtotal ? (
          <div className="flex justify-between gap-4 text-sm">
            <span className={dataWorkspaceEntityCardStatLabelClass}>
              Subtotal sin descuentos
            </span>
            <span className={workspaceTableNatureMoneyClass}>
              {formatReportMoneyAr(subtotalSinDescuentos)}
            </span>
          </div>
        ) : null}
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

function GroupRows({
  group,
}: {
  group: ReturnType<typeof resolveQuoteLineGroups>[number]
}) {
  const showHeader = isPromoGroupCategory(group.category)

  return (
    <>
      {showHeader ? (
        <WorkspaceTableBodyRow index={0} noHover>
          <TableCell
            colSpan={4}
            className={cn(
              workspaceTableLayoutBodyCellClass,
              "bg-[var(--rootsy-bruma-50)] py-2 text-xs font-semibold uppercase tracking-wide text-[var(--rootsy-bruma-700)]",
            )}
          >
            {group.category}
          </TableCell>
        </WorkspaceTableBodyRow>
      ) : null}
      {group.lines.map((line, index) => (
        <LineRows
          key={`${group.id}-${line.name}-${index}`}
          line={line}
          rowIndex={index}
        />
      ))}
      {group.promotionDiscount ? (
        <DiscountRow
          label={group.promotionDiscount.label}
          amount={group.promotionDiscount.amount}
        />
      ) : null}
    </>
  )
}

function LineRows({
  line,
  rowIndex,
}: {
  line: ReturnType<typeof resolveQuoteLineGroups>[number]["lines"][number]
  rowIndex: number
}) {
  return (
    <>
      <WorkspaceTableBodyRow index={rowIndex}>
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
          {formatReportMoneyAr(line.unitListPrice)}
        </TableCell>
        <TableCell
          className={cn(
            workspaceTableLayoutBodyCellClass,
            workspaceTableNatureMoneyClass,
            "text-right tabular-nums",
          )}
        >
          {formatReportMoneyAr(line.listLineTotal)}
        </TableCell>
      </WorkspaceTableBodyRow>
      {line.discounts.map((discount, index) => (
        <DiscountRow
          key={`${line.name}-discount-${index}`}
          label={discount.label}
          amount={discount.amount}
        />
      ))}
    </>
  )
}

function DiscountRow({ label, amount }: { label: string; amount: number }) {
  return (
    <WorkspaceTableBodyRow index={0} noHover>
      <TableCell
        className={cn(
          workspaceTableLayoutBodyCellClass,
          workspaceTableNatureTextSecondaryClass,
          "bg-[var(--rootsy-bruma-50)] py-1.5 pl-6 text-xs",
        )}
      >
        {label}
      </TableCell>
      <TableCell
        colSpan={2}
        className={cn(
          workspaceTableLayoutBodyCellClass,
          "bg-[var(--rootsy-bruma-50)] py-1.5",
        )}
      />
      <TableCell
        className={cn(
          workspaceTableLayoutBodyCellClass,
          workspaceTableNatureMoneyClass,
          "bg-[var(--rootsy-bruma-50)] py-1.5 text-right text-xs tabular-nums",
        )}
      >
        -{formatReportMoneyAr(amount)}
      </TableCell>
    </WorkspaceTableBodyRow>
  )
}
