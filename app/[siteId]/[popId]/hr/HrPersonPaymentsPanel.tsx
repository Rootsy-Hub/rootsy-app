"use client"

import type { EmployeePaymentRow } from "@/app/[siteId]/[popId]/hr/hrTypes"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import {
  dataWorkspaceDetailCardClass,
  dataWorkspaceDetailToolbarClass,
  workspaceTableLayoutClassName,
  workspaceTableNatureMoneyClass,
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  workspaceTableLayoutBodyCellClass,
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
import { RootsDefaultButton, rootsButtonCompactSizeClass } from "@/components/rootsy-button"
import { Table, TableBody, TableCell } from "@/components/ui/table"
import { formatIsoDateShort } from "@/lib/dataWorkspaceDateFilter"
import { operationPaymentKindLabel } from "@/lib/operationPaymentKinds"
import { cn } from "@/lib/utils"
import { Banknote } from "lucide-react"
import { useMemo } from "react"
import "@/components/layouts-tables/rootsLayoutsTablesScope.css"

const moneyFmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

type Props = {
  payments: EmployeePaymentRow[]
  dateBounds: { from: string | null; to: string | null }
  canManagePeople: boolean
  onPay?: () => void
}

function paymentInBounds(
  paidAt: string,
  from: string | null,
  to: string | null,
): boolean {
  if (from && paidAt < from) return false
  if (to && paidAt > to) return false
  return true
}

export function HrPersonPaymentsPanel({
  payments,
  dateBounds,
  canManagePeople,
  onPay,
}: Props) {
  const rows = useMemo(
    () =>
      payments.filter((payment) =>
        paymentInBounds(payment.paidAt, dateBounds.from, dateBounds.to),
      ),
    [payments, dateBounds.from, dateBounds.to],
  )

  return (
    <article className={cn("shrink-0", dataWorkspaceDetailCardClass)}>
      <div className={dataWorkspaceDetailToolbarClass}>
        <p className={cn("text-sm font-semibold", workspaceTableNatureTextPrimaryClass)}>
          Pagos
        </p>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <p className={cn("text-xs", workspaceTableNatureTextSecondaryClass)}>
            {rows.length} {rows.length === 1 ? "pago" : "pagos"} en el período
          </p>
          {canManagePeople && onPay ? (
            <RootsDefaultButton
              type="button"
              size="sm"
              className={cn(rootsButtonCompactSizeClass, "shrink-0 gap-1.5 px-3 text-xs")}
              onClick={onPay}
            >
              <Banknote className="size-3.5" aria-hidden />
              Le pagué
            </RootsDefaultButton>
          ) : null}
        </div>
      </div>

      {rows.length === 0 ? (
        <DataWorkspaceDetailEmptyState
          icon={Banknote}
          title="Sin pagos en este período"
        />
      ) : (
        <div
          className={cn(
            "overflow-x-auto",
            workspaceLayoutsTablesScopeClass,
            workspaceTableLayoutListSurfaceClass,
            workspaceTableLayoutListBodyScopeClass,
          )}
        >
          <Table className={cn(workspaceTableLayoutClassName, "min-w-[32rem]")}>
            <WorkspaceTableHeader>
              <WorkspaceTableHeaderRow>
                <WorkspaceTableHead
                  tone="nature"
                  className={cn("min-w-36", workspaceTableLayoutHeaderHeadClass)}
                >
                  Día
                </WorkspaceTableHead>
                <WorkspaceTableHead
                  tone="nature"
                  className={cn("min-w-40", workspaceTableLayoutHeaderHeadClass)}
                >
                  De
                </WorkspaceTableHead>
                <WorkspaceTableHead
                  tone="nature"
                  align="right"
                  className={cn("w-32", workspaceTableLayoutHeaderHeadClass)}
                >
                  Importe
                </WorkspaceTableHead>
              </WorkspaceTableHeaderRow>
            </WorkspaceTableHeader>
            <TableBody>
              {rows.map((payment, index) => (
                <WorkspaceTableBodyRow key={payment.id} index={index} noHover>
                  <TableCell className={workspaceTableLayoutBodyCellClass}>
                    <span className={workspaceTableNatureTextPrimaryClass}>
                      {formatIsoDateShort(payment.paidAt)}
                    </span>
                  </TableCell>
                  <TableCell className={workspaceTableLayoutBodyCellClass}>
                    <span className={workspaceTableNatureTextPrimaryClass}>
                      {payment.treasuryAccountName
                        || operationPaymentKindLabel(payment.paymentKind)}
                    </span>
                  </TableCell>
                  <TableCell
                    className={cn(workspaceTableLayoutBodyCellClass, "text-right")}
                  >
                    <span className={cn("tabular-nums", workspaceTableNatureMoneyClass)}>
                      {moneyFmt.format(payment.amount)}
                    </span>
                  </TableCell>
                </WorkspaceTableBodyRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </article>
  )
}
