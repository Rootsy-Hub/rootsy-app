"use client"

import type { InvoiceArcaTableRow } from "@/app/[siteId]/[popId]/invoices/actions"
import {
  formatInvoiceCbteFch,
  invoiceStatusLabel,
  invoiceStatusPillVariant,
} from "@/app/[siteId]/[popId]/invoices/invoiceConstants"
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
import { RootsNaturePill } from "@/components/rootsy-pill"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import { cn } from "@/lib/utils"
import { Table, TableCell } from "@/components/ui/table"

type Props = {
  rows: InvoiceArcaTableRow[]
}

const COLUMN_COUNT = 7

const tableBodyScopeClass = cn(
  workspaceTableLayoutListBodyScopeClass,
  "[&_[data-slot=table-body]_[data-slot=table-row]]:!h-auto [&_[data-slot=table-body]_[data-slot=table-row]]:!max-h-none",
  "[&_[data-slot=table-body]_[data-slot=table-cell]]:!h-auto [&_[data-slot=table-body]_[data-slot=table-cell]]:!max-h-none [&_[data-slot=table-body]_[data-slot=table-cell]]:align-top [&_[data-slot=table-body]_[data-slot=table-cell]]:!py-2",
)

const mobileLabelClass =
  "text-[10px] font-medium uppercase tracking-[0.08em] text-rootsy-bruma-500"

const mobileValueClass = "text-sm leading-snug text-rootsy-bruma-900"

type InvoiceReportRowModel = {
  date: string
  comprobante: string
  comprobanteSecondary: string | null
  receptor: string
  receptorSecondary: string | null
  neto: number
  iva: number
  total: number
  status: string
}

function formatMoneyCell(amount: number) {
  if (amount === 0) return "—"
  return formatReportMoneyAr(amount)
}

function buildInvoiceReportRowModel(row: InvoiceArcaTableRow): InvoiceReportRowModel {
  const doc = row.docNro.trim()
  return {
    date: formatInvoiceCbteFch(row.cbteFch),
    comprobante: row.tipoLabel,
    comprobanteSecondary: `${row.ptoVta} — ${row.cbteNro}`,
    receptor: row.receptorRazonSocial.trim() || "—",
    receptorSecondary: doc && doc !== "0" ? doc : null,
    neto: row.impNeto,
    iva: row.impIva,
    total: row.impTotal,
    status: invoiceStatusLabel(row.status),
  }
}

function ReportStackCell({
  primary,
  secondary,
  className,
  alignRight = false,
}: {
  primary: string
  secondary?: string | null
  className?: string
  alignRight?: boolean
}) {
  return (
    <TableCell
      className={cn(
        workspaceTableLayoutBodyCellClass,
        className,
        "!h-auto !max-h-none align-top !py-2",
        alignRight && "text-right",
      )}
    >
      <div className={workspaceTableLayoutCellStackClass}>
        <span
          className={cn(
            workspaceTableLayoutCellPrimaryTextClass,
            workspaceTableNatureTextPrimaryClass,
            alignRight && "tabular-nums",
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
              alignRight && "tabular-nums",
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

function IssuedInvoicesReportMobileRow({
  row,
  source,
}: {
  row: InvoiceReportRowModel
  source: InvoiceArcaTableRow
}) {
  return (
    <article className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium tabular-nums text-rootsy-bruma-900">
            {row.date}
          </p>
          <p className="mt-0.5 text-xs text-rootsy-bruma-500">
            {row.comprobanteSecondary}
          </p>
        </div>
        <p
          className={cn(
            "shrink-0 text-sm font-semibold tabular-nums",
            workspaceTableNatureMoneyClass,
          )}
        >
          {formatReportMoneyAr(row.total)}
        </p>
      </div>

      <dl className="mt-3 space-y-2.5">
        <div>
          <dt className={mobileLabelClass}>Receptor</dt>
          <dd className={cn("mt-0.5", mobileValueClass)}>{row.receptor}</dd>
          {row.receptorSecondary ? (
            <dd className="mt-0.5 text-xs text-rootsy-bruma-500">
              {row.receptorSecondary}
            </dd>
          ) : null}
        </div>
        <div>
          <dt className={mobileLabelClass}>Comprobante</dt>
          <dd className={cn("mt-0.5", mobileValueClass)}>{row.comprobante}</dd>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div>
            <dt className={mobileLabelClass}>Neto</dt>
            <dd className={cn("mt-0.5 tabular-nums", mobileValueClass, workspaceTableNatureMoneyClass)}>
              {formatMoneyCell(row.neto)}
            </dd>
          </div>
          <div>
            <dt className={mobileLabelClass}>IVA</dt>
            <dd className={cn("mt-0.5 tabular-nums", mobileValueClass, workspaceTableNatureMoneyClass)}>
              {formatMoneyCell(row.iva)}
            </dd>
          </div>
          <div>
            <dt className={mobileLabelClass}>Estado</dt>
            <dd className="mt-1">
              <RootsNaturePill variant={invoiceStatusPillVariant(source.status)}>
                {row.status}
              </RootsNaturePill>
            </dd>
          </div>
        </div>
        {source.cae ? (
          <div>
            <dt className={mobileLabelClass}>CAE</dt>
            <dd className="mt-0.5 break-all font-mono text-xs text-rootsy-bruma-700">
              {source.cae}
            </dd>
          </div>
        ) : null}
      </dl>
    </article>
  )
}

export function IssuedInvoicesReportTable({ rows }: Props) {
  const rowModels = rows.map(buildInvoiceReportRowModel)

  return (
    <div className={cn(workspaceLayoutsTablesScopeClass, workspaceTableLayoutListSurfaceClass)}>
      <div className="divide-y divide-rootsy-bruma-200 md:hidden">
        {rows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-rootsy-bruma-500">
            Sin facturas en el período.
          </p>
        ) : (
          rowModels.map((row, index) => (
            <IssuedInvoicesReportMobileRow
              key={rows[index]!.id}
              row={row}
              source={rows[index]!}
            />
          ))
        )}
      </div>

      <div className={cn("hidden overflow-x-auto md:block", tableBodyScopeClass)}>
        <Table className={cn(workspaceTableLayoutClassName, "min-w-[52rem]")}>
          <WorkspaceTableHeader>
            <WorkspaceTableHeaderRow>
              <WorkspaceTableHead className={workspaceTableLayoutHeaderHeadClass}>
                Fecha
              </WorkspaceTableHead>
              <WorkspaceTableHead className={workspaceTableLayoutHeaderHeadClass}>
                Comprobante
              </WorkspaceTableHead>
              <WorkspaceTableHead className={workspaceTableLayoutHeaderHeadClass}>
                Receptor
              </WorkspaceTableHead>
              <WorkspaceTableHead
                className={cn(workspaceTableLayoutHeaderHeadClass, "text-right")}
              >
                Neto
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
              <WorkspaceTableHead className={workspaceTableLayoutHeaderHeadClass}>
                Estado
              </WorkspaceTableHead>
            </WorkspaceTableHeaderRow>
          </WorkspaceTableHeader>
          <tbody data-slot="table-body">
            {rowModels.map((row, index) => {
              const source = rows[index]!
              return (
                <WorkspaceTableBodyRow key={source.id} index={index} noHover>
                  <ReportStackCell primary={row.date} />
                  <ReportStackCell
                    primary={row.comprobante}
                    secondary={row.comprobanteSecondary}
                  />
                  <ReportStackCell
                    primary={row.receptor}
                    secondary={row.receptorSecondary}
                    className="min-w-[10rem] max-w-[16rem]"
                  />
                  <ReportStackCell
                    primary={formatMoneyCell(row.neto)}
                    alignRight
                    className="whitespace-nowrap"
                  />
                  <ReportStackCell
                    primary={formatMoneyCell(row.iva)}
                    alignRight
                    className="whitespace-nowrap"
                  />
                  <TableCell
                    className={cn(
                      workspaceTableLayoutBodyCellClass,
                      "!h-auto !max-h-none align-top !py-2 text-right whitespace-nowrap",
                    )}
                  >
                    <span
                      className={cn(
                        workspaceTableLayoutCellPrimaryTextClass,
                        workspaceTableNatureMoneyClass,
                        "tabular-nums",
                      )}
                    >
                      {formatReportMoneyAr(row.total)}
                    </span>
                  </TableCell>
                  <TableCell
                    className={cn(
                      workspaceTableLayoutBodyCellClass,
                      "!h-auto !max-h-none align-top !py-2",
                    )}
                  >
                    <RootsNaturePill variant={invoiceStatusPillVariant(source.status)}>
                      {row.status}
                    </RootsNaturePill>
                  </TableCell>
                </WorkspaceTableBodyRow>
              )
            })}
            {rows.length === 0 ? (
              <WorkspaceTableBodyRow index={0} noHover>
                <TableCell
                  colSpan={COLUMN_COUNT}
                  className={cn(workspaceTableLayoutBodyCellClass, "py-8 text-center")}
                >
                  <span className="text-sm text-rootsy-bruma-500">
                    Sin facturas en el período.
                  </span>
                </TableCell>
              </WorkspaceTableBodyRow>
            ) : null}
          </tbody>
        </Table>
      </div>
    </div>
  )
}
