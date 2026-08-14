"use client"

import type { OperationSaleRow } from "@/app/[siteId]/[popId]/operations/actions"
import { formatOperationSaleDateInline } from "@/app/[siteId]/[popId]/operations/OperationsSalesTable"
import {
  workspaceTableLayoutBodyCellClass,
  workspaceTableLayoutCellPrimaryTextClass,
  workspaceTableLayoutCellSecondaryTextClass,
  workspaceTableLayoutCellStackClass,
  workspaceTableLayoutHeaderHeadClass,
  workspaceTableLayoutListBodyScopeClass,
  workspaceTableLayoutListSurfaceClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { workspaceLayoutsTablesScopeClass } from "@/components/layouts-tables/rootsLayoutsTablesProductStyles"
import {
  WorkspaceTableBodyRow,
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
} from "@/components/data-workspace/WorkspaceTableHeader"
import {
  workspaceTableLayoutClassName,
  workspaceTableNatureMoneyClass,
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { displayOperationSaleTotal } from "@/lib/channelOperationSales"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import {
  saleReportChannelLabel,
  saleReportChannelSecondary,
  saleReportComprobantePrimary,
  saleReportComprobanteSecondary,
  saleReportCustomerPrimary,
  saleReportCustomerSecondary,
  saleReportDateSecondary,
  saleReportPaymentLabel,
} from "@/lib/salesReportFormatters"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell } from "@/components/ui/table"

type Props = {
  rows: OperationSaleRow[]
}

const COLUMN_COUNT = 8

function formatMoneyCell(amount: number, showDashWhenZero = true) {
  if (showDashWhenZero && amount === 0) return "—"
  return formatReportMoneyAr(amount)
}

function ReportStackCell({
  primary,
  secondary,
  className,
  primaryClassName,
}: {
  primary: string
  secondary?: string | null
  className?: string
  primaryClassName?: string
}) {
  return (
    <TableCell className={cn(workspaceTableLayoutBodyCellClass, className)}>
      <div className={workspaceTableLayoutCellStackClass}>
        <span
          className={cn(
            workspaceTableLayoutCellPrimaryTextClass,
            workspaceTableNatureTextPrimaryClass,
            primaryClassName,
          )}
          title={primary}
        >
          {primary}
        </span>
        {secondary ? (
          <span
            className={cn(
              workspaceTableLayoutCellSecondaryTextClass,
              workspaceTableNatureTextSecondaryClass,
            )}
            title={secondary}
          >
            {secondary}
          </span>
        ) : null}
      </div>
    </TableCell>
  )
}

export function SalesReportTable({ rows }: Props) {
  const timeZone = usePopTimeZone()

  return (
    <div
      className={cn(
        workspaceLayoutsTablesScopeClass,
        workspaceTableLayoutListSurfaceClass,
        workspaceTableLayoutListBodyScopeClass,
      )}
    >
      <Table className={workspaceTableLayoutClassName}>
        <WorkspaceTableHeader>
          <WorkspaceTableHeaderRow>
            <WorkspaceTableHead className={workspaceTableLayoutHeaderHeadClass}>
              Fecha
            </WorkspaceTableHead>
            <WorkspaceTableHead className={workspaceTableLayoutHeaderHeadClass}>
              Canal
            </WorkspaceTableHead>
            <WorkspaceTableHead className={workspaceTableLayoutHeaderHeadClass}>
              Cliente
            </WorkspaceTableHead>
            <WorkspaceTableHead className={workspaceTableLayoutHeaderHeadClass}>
              Comprobante
            </WorkspaceTableHead>
            <WorkspaceTableHead className={workspaceTableLayoutHeaderHeadClass}>
              Cobro
            </WorkspaceTableHead>
            <WorkspaceTableHead
              className={cn(workspaceTableLayoutHeaderHeadClass, "text-right")}
            >
              Descuento
            </WorkspaceTableHead>
            <WorkspaceTableHead
              className={cn(workspaceTableLayoutHeaderHeadClass, "text-right")}
            >
              IVA
            </WorkspaceTableHead>
            <WorkspaceTableHead
              className={cn(workspaceTableLayoutHeaderHeadClass, "text-right")}
            >
              Total
            </WorkspaceTableHead>
          </WorkspaceTableHeaderRow>
        </WorkspaceTableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <WorkspaceTableBodyRow index={0} noHover>
              <TableCell
                colSpan={COLUMN_COUNT}
                className={cn(
                  workspaceTableLayoutBodyCellClass,
                  "text-rootsy-bruma-500",
                )}
              >
                Sin ventas en el período.
              </TableCell>
            </WorkspaceTableBodyRow>
          ) : (
            rows.map((sale, index) => {
              const when = formatOperationSaleDateInline(sale.soldAt, timeZone)
              const ivaAmount =
                sale.accruesOutputVat && sale.taxTotal > 0 ? sale.taxTotal : 0

              return (
                <WorkspaceTableBodyRow key={sale.id} index={index} noHover>
                  <ReportStackCell
                    primary={when}
                    secondary={saleReportDateSecondary(sale)}
                    primaryClassName="tabular-nums"
                  />
                  <ReportStackCell
                    primary={saleReportChannelLabel(sale)}
                    secondary={saleReportChannelSecondary(sale)}
                  />
                  <ReportStackCell
                    primary={saleReportCustomerPrimary(sale)}
                    secondary={saleReportCustomerSecondary(sale)}
                  />
                  <ReportStackCell
                    primary={saleReportComprobantePrimary(sale)}
                    secondary={saleReportComprobanteSecondary(sale)}
                  />
                  <TableCell className={workspaceTableLayoutBodyCellClass}>
                    <span
                      className={cn(
                        workspaceTableLayoutCellPrimaryTextClass,
                        workspaceTableNatureTextSecondaryClass,
                      )}
                      title={saleReportPaymentLabel(sale)}
                    >
                      {saleReportPaymentLabel(sale)}
                    </span>
                  </TableCell>
                  <TableCell
                    className={cn(workspaceTableLayoutBodyCellClass, "text-right")}
                  >
                    <span
                      className={cn(
                        workspaceTableLayoutCellPrimaryTextClass,
                        workspaceTableNatureMoneyClass,
                      )}
                    >
                      {formatMoneyCell(sale.discountTotal)}
                    </span>
                  </TableCell>
                  <TableCell
                    className={cn(workspaceTableLayoutBodyCellClass, "text-right")}
                  >
                    <span
                      className={cn(
                        workspaceTableLayoutCellPrimaryTextClass,
                        workspaceTableNatureMoneyClass,
                      )}
                    >
                      {formatMoneyCell(ivaAmount)}
                    </span>
                  </TableCell>
                  <TableCell
                    className={cn(workspaceTableLayoutBodyCellClass, "text-right")}
                  >
                    <span
                      className={cn(
                        workspaceTableLayoutCellPrimaryTextClass,
                        workspaceTableNatureMoneyClass,
                      )}
                    >
                      {formatReportMoneyAr(displayOperationSaleTotal(sale))}
                    </span>
                  </TableCell>
                </WorkspaceTableBodyRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
