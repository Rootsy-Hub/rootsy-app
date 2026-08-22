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
import type { UnresolvedQuoteCartItem } from "@/lib/saleQuoteViewGaps"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import { roundSaleMoney } from "@/lib/saleLineDiscount"
import { cn } from "@/lib/utils"
import { TableBody, TableCell } from "@/components/ui/table"

type Props = {
  metadata: SaleQuoteMetadata
  subtotal: number
  discountTotal: number
  total: number
  unresolvedItems?: UnresolvedQuoteCartItem[]
  storedSubtotalGap?: number
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
  unresolvedItems = [],
  storedSubtotalGap = 0,
  className,
}: Props) {
  const lineGroups = resolveQuoteLineGroups(metadata)
  const showListSubtotal = quoteHasInlineDiscounts(lineGroups)
  const subtotalSinDescuentos = quoteSubtotalSinDescuentos(lineGroups)
  const unresolvedAmount = unresolvedItems.reduce(
    (sum, item) => sum + (item.amount ?? 0),
    0,
  )
  const remainderGap = Math.max(0, storedSubtotalGap - unresolvedAmount)
  const showRemainder = remainderGap > 0.009
  const empty =
    lineGroups.length === 0 &&
    unresolvedItems.length === 0 &&
    !showRemainder

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
            {empty ? (
              <WorkspaceTableBodyRow index={0} noHover>
                <TableCell
                  colSpan={4}
                  className={cn(
                    workspaceTableLayoutBodyCellClass,
                    workspaceTableNatureTextSecondaryClass,
                    "py-6 text-center",
                  )}
                >
                  Sin ítems para listar
                </TableCell>
              </WorkspaceTableBodyRow>
            ) : (
              <>
                {lineGroups.map((group) => (
                  <GroupRows key={group.id} group={group} />
                ))}
                {unresolvedItems.map((item, index) => (
                  <UnresolvedRow
                    key={`unresolved-${item.name}-${index}`}
                    item={item}
                    rowIndex={lineGroups.length + index}
                  />
                ))}
                {showRemainder ? (
                  <UnresolvedRow
                    item={{
                      name: "Ítems que ya no se pueden detallar",
                      quantity: 0,
                      amount: remainderGap,
                    }}
                    rowIndex={lineGroups.length + unresolvedItems.length}
                    hideQuantity
                  />
                ) : null}
              </>
            )}
          </TableBody>
        </table>
      </div>

      <div className="space-y-2 border-t border-[var(--rootsy-bruma-200)] pt-3">
        <p className={dataWorkspaceEntityCardStatLabelClass}>
          Importes guardados
        </p>
        {showListSubtotal ? (
          <div className="flex justify-between gap-4 text-sm">
            <span className={workspaceTableNatureTextSecondaryClass}>
              Suma de ítems visibles, sin descuentos
            </span>
            <span className={workspaceTableNatureMoneyClass}>
              {formatReportMoneyAr(subtotalSinDescuentos)}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between gap-4 text-sm">
          <span className={workspaceTableNatureTextSecondaryClass}>
            Subtotal
          </span>
          <span className={workspaceTableNatureMoneyClass}>
            {formatReportMoneyAr(subtotal)}
          </span>
        </div>
        {discountTotal > 0 ? (
          <div className="flex justify-between gap-4 text-sm">
            <span className={workspaceTableNatureTextSecondaryClass}>
              Descuento
              {metadata.discountLabel ? ` (${metadata.discountLabel})` : ""}
            </span>
            <span className={workspaceTableNatureMoneyClass}>
              -{formatReportMoneyAr(discountTotal)}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between gap-4">
          <span className={cn(workspaceTableNatureTextPrimaryClass, "font-medium")}>
            Total
          </span>
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

function allocatedGroupPromo(
  line: ReturnType<typeof resolveQuoteLineGroups>[number]["lines"][number],
  group: ReturnType<typeof resolveQuoteLineGroups>[number],
): number {
  const promo = group.promotionDiscount?.amount ?? 0
  if (promo <= 0) return 0
  if (group.lines.length === 1) return promo
  const listSum = group.lines.reduce((sum, item) => sum + item.listLineTotal, 0)
  if (listSum <= 0) return roundSaleMoney(promo / group.lines.length)
  return roundSaleMoney(promo * (line.listLineTotal / listSum))
}

function GroupRows({
  group,
}: {
  group: ReturnType<typeof resolveQuoteLineGroups>[number]
}) {
  const isDeal = (group.promotionDiscount?.amount ?? 0) > 0
  const showHeader =
    isPromoGroupCategory(group.category) && group.lines.length > 1

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
      {group.lines.map((line, index) => {
        const displayNet = Math.max(
          0,
          roundSaleMoney(line.lineTotal - allocatedGroupPromo(line, group)),
        )
        return (
          <LineRows
            key={`${group.id}-${line.name}-${index}`}
            line={line}
            rowIndex={index}
            promoLabel={isDeal ? group.promotionDiscount?.label : undefined}
            displayNet={displayNet}
          />
        )
      })}
    </>
  )
}

function LineRows({
  line,
  rowIndex,
  promoLabel,
  displayNet,
}: {
  line: ReturnType<typeof resolveQuoteLineGroups>[number]["lines"][number]
  rowIndex: number
  promoLabel?: string
  displayNet: number
}) {
  const showStrike = line.listLineTotal - displayNet > 0.009

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
          <span className="block font-medium">{line.name}</span>
          {promoLabel ? (
            <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
              {promoLabel}
            </span>
          ) : null}
        </TableCell>
        <TableCell
          className={cn(
            workspaceTableLayoutBodyCellClass,
            workspaceTableNatureTextPrimaryClass,
            "text-right tabular-nums",
          )}
        >
          {line.quantity}x
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
          {showStrike ? (
            <span className="flex flex-col items-end gap-0.5">
              <span>{formatReportMoneyAr(displayNet)}</span>
              <span
                className={cn(
                  workspaceTableNatureTextSecondaryClass,
                  "text-xs line-through",
                )}
              >
                {formatReportMoneyAr(line.listLineTotal)}
              </span>
            </span>
          ) : (
            formatReportMoneyAr(line.listLineTotal)
          )}
        </TableCell>
      </WorkspaceTableBodyRow>
      {!showStrike
        ? line.discounts.map((discount, index) => (
            <DiscountRow
              key={`${line.name}-discount-${index}`}
              label={discount.label}
              amount={discount.amount}
            />
          ))
        : null}
    </>
  )
}

function UnresolvedRow({
  item,
  rowIndex,
  hideQuantity = false,
}: {
  item: UnresolvedQuoteCartItem
  rowIndex: number
  hideQuantity?: boolean
}) {
  return (
    <WorkspaceTableBodyRow index={rowIndex} noHover>
      <TableCell
        className={cn(
          workspaceTableLayoutBodyCellClass,
          workspaceTableNatureTextSecondaryClass,
          "!h-auto !max-h-none whitespace-normal py-3 italic",
        )}
      >
        {item.name}
      </TableCell>
      <TableCell
        className={cn(
          workspaceTableLayoutBodyCellClass,
          workspaceTableNatureTextSecondaryClass,
          "text-right tabular-nums",
        )}
      >
        {hideQuantity || item.quantity <= 0 ? "—" : item.quantity}
      </TableCell>
      <TableCell
        className={cn(
          workspaceTableLayoutBodyCellClass,
          workspaceTableNatureTextSecondaryClass,
          "text-right tabular-nums",
        )}
      >
        —
      </TableCell>
      <TableCell
        className={cn(
          workspaceTableLayoutBodyCellClass,
          workspaceTableNatureMoneyClass,
          "text-right tabular-nums",
        )}
      >
        {item.amount != null ? formatReportMoneyAr(item.amount) : "—"}
      </TableCell>
    </WorkspaceTableBodyRow>
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
