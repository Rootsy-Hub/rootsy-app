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
import { displayOperationSaleCollected } from "@/lib/channelOperationSales"
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

const salesReportTableBodyScopeClass = cn(
  workspaceTableLayoutListBodyScopeClass,
  "[&_[data-slot=table-body]_[data-slot=table-row]]:!h-auto [&_[data-slot=table-body]_[data-slot=table-row]]:!max-h-none",
  "[&_[data-slot=table-body]_[data-slot=table-cell]]:!h-auto [&_[data-slot=table-body]_[data-slot=table-cell]]:!max-h-none [&_[data-slot=table-body]_[data-slot=table-cell]]:align-top [&_[data-slot=table-body]_[data-slot=table-cell]]:!py-2",
)

const salesReportPaymentCellClass =
  "min-w-[6.5rem] max-w-[9.5rem] whitespace-normal break-words text-sm font-medium leading-snug"

const salesReportMobileLabelClass =
  "text-[10px] font-medium uppercase tracking-[0.08em] text-rootsy-bruma-500"

const salesReportMobileValueClass =
  "text-sm leading-snug text-rootsy-bruma-900"

type SaleReportRowModel = {
  when: string
  dateSecondary: string | null
  channel: string
  channelSecondary: string | null
  customer: string
  customerSecondary: string | null
  comprobante: string
  comprobanteSecondary: string | null
  payment: string
  discount: number
  iva: number
  collected: number
}

function formatMoneyCell(amount: number, showDashWhenZero = true) {
  if (showDashWhenZero && amount === 0) return "—"
  return formatReportMoneyAr(amount)
}

function buildSaleReportRowModel(
  sale: OperationSaleRow,
  timeZone?: string,
): SaleReportRowModel {
  return {
    when: formatOperationSaleDateInline(sale.soldAt, timeZone),
    dateSecondary: saleReportDateSecondary(sale),
    channel: saleReportChannelLabel(sale),
    channelSecondary: saleReportChannelSecondary(sale),
    customer: saleReportCustomerPrimary(sale),
    customerSecondary: saleReportCustomerSecondary(sale),
    comprobante: saleReportComprobantePrimary(sale),
    comprobanteSecondary: saleReportComprobanteSecondary(sale),
    payment: saleReportPaymentLabel(sale),
    discount: sale.discountTotal,
    iva: sale.accruesOutputVat && sale.taxTotal > 0 ? sale.taxTotal : 0,
    collected: displayOperationSaleCollected(sale),
  }
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
    <TableCell className={cn(workspaceTableLayoutBodyCellClass, className, "!h-auto !max-h-none align-top !py-2")}>
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

function SalesReportMobileRow({ row }: { row: SaleReportRowModel }) {
  const channelLine = row.channelSecondary
    ? `${row.channel} · ${row.channelSecondary}`
    : row.channel

  return (
    <article className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium tabular-nums text-rootsy-bruma-900">
            {row.when}
          </p>
          {row.dateSecondary ? (
            <p className="mt-0.5 text-xs text-rootsy-bruma-500">{row.dateSecondary}</p>
          ) : null}
        </div>
        <p
          className={cn(
            "shrink-0 text-sm font-semibold tabular-nums",
            workspaceTableNatureMoneyClass,
          )}
        >
          {formatReportMoneyAr(row.collected)}
        </p>
      </div>

      <dl className="mt-3 space-y-2.5">
        <div>
          <dt className={salesReportMobileLabelClass}>Cliente</dt>
          <dd className={cn("mt-0.5", salesReportMobileValueClass)}>{row.customer}</dd>
          {row.customerSecondary ? (
            <dd className="mt-0.5 text-xs text-rootsy-bruma-500">{row.customerSecondary}</dd>
          ) : null}
        </div>
        <div>
          <dt className={salesReportMobileLabelClass}>Canal</dt>
          <dd className={cn("mt-0.5", salesReportMobileValueClass)}>{channelLine}</dd>
        </div>
        <div>
          <dt className={salesReportMobileLabelClass}>Cobro</dt>
          <dd className={cn("mt-0.5 break-words", salesReportMobileValueClass)}>
            {row.payment}
          </dd>
        </div>
        <div>
          <dt className={salesReportMobileLabelClass}>Comprobante</dt>
          <dd className={cn("mt-0.5 break-words", salesReportMobileValueClass)}>
            {row.comprobante}
          </dd>
          {row.comprobanteSecondary ? (
            <dd className="mt-0.5 text-xs text-rootsy-bruma-500">
              {row.comprobanteSecondary}
            </dd>
          ) : null}
        </div>
        {row.discount > 0 || row.iva > 0 ? (
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-0.5">
            {row.discount > 0 ? (
              <div>
                <dt className={salesReportMobileLabelClass}>Descuento</dt>
                <dd className={cn("mt-0.5", salesReportMobileValueClass, workspaceTableNatureMoneyClass)}>
                  {formatReportMoneyAr(row.discount)}
                </dd>
              </div>
            ) : null}
            {row.iva > 0 ? (
              <div>
                <dt className={salesReportMobileLabelClass}>IVA</dt>
                <dd className={cn("mt-0.5", salesReportMobileValueClass, workspaceTableNatureMoneyClass)}>
                  {formatReportMoneyAr(row.iva)}
                </dd>
              </div>
            ) : null}
          </div>
        ) : null}
      </dl>
    </article>
  )
}

export function SalesReportTable({ rows }: Props) {
  const timeZone = usePopTimeZone()
  const rowModels = rows.map((sale) => buildSaleReportRowModel(sale, timeZone))

  return (
    <div className={cn(workspaceLayoutsTablesScopeClass, workspaceTableLayoutListSurfaceClass)}>
      <div className="divide-y divide-rootsy-bruma-200 md:hidden">
        {rows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-rootsy-bruma-500">
            Sin ventas en el período.
          </p>
        ) : (
          rowModels.map((row, index) => (
            <SalesReportMobileRow key={rows[index]!.id} row={row} />
          ))
        )}
      </div>

      <div
        className={cn(
          "hidden overflow-x-auto md:block",
          salesReportTableBodyScopeClass,
        )}
      >
        <Table className={cn(workspaceTableLayoutClassName, "min-w-[56rem]")}>
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
              <WorkspaceTableHead
                className={cn(workspaceTableLayoutHeaderHeadClass, "w-[9.5rem]")}
              >
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
              rowModels.map((row, index) => (
                <WorkspaceTableBodyRow key={rows[index]!.id} index={index} noHover>
                  <ReportStackCell
                    primary={row.when}
                    secondary={row.dateSecondary}
                    primaryClassName="tabular-nums"
                  />
                  <ReportStackCell
                    primary={row.channel}
                    secondary={row.channelSecondary}
                  />
                  <ReportStackCell
                    primary={row.customer}
                    secondary={row.customerSecondary}
                  />
                  <ReportStackCell
                    primary={row.comprobante}
                    secondary={row.comprobanteSecondary}
                  />
                  <TableCell
                    className={cn(
                      workspaceTableLayoutBodyCellClass,
                      "!h-auto !max-h-none align-top !py-2",
                    )}
                  >
                    <span
                      className={cn(
                        salesReportPaymentCellClass,
                        workspaceTableNatureTextSecondaryClass,
                      )}
                      title={row.payment}
                    >
                      {row.payment}
                    </span>
                  </TableCell>
                  <TableCell
                    className={cn(
                      workspaceTableLayoutBodyCellClass,
                      "text-right !h-auto !max-h-none align-top !py-2",
                    )}
                  >
                    <span
                      className={cn(
                        workspaceTableLayoutCellPrimaryTextClass,
                        workspaceTableNatureMoneyClass,
                      )}
                    >
                      {formatMoneyCell(row.discount)}
                    </span>
                  </TableCell>
                  <TableCell
                    className={cn(
                      workspaceTableLayoutBodyCellClass,
                      "text-right !h-auto !max-h-none align-top !py-2",
                    )}
                  >
                    <span
                      className={cn(
                        workspaceTableLayoutCellPrimaryTextClass,
                        workspaceTableNatureMoneyClass,
                      )}
                    >
                      {formatMoneyCell(row.iva)}
                    </span>
                  </TableCell>
                  <TableCell
                    className={cn(
                      workspaceTableLayoutBodyCellClass,
                      "text-right !h-auto !max-h-none align-top !py-2",
                    )}
                  >
                    <span
                      className={cn(
                        workspaceTableLayoutCellPrimaryTextClass,
                        workspaceTableNatureMoneyClass,
                      )}
                    >
                      {formatReportMoneyAr(row.collected)}
                    </span>
                  </TableCell>
                </WorkspaceTableBodyRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
