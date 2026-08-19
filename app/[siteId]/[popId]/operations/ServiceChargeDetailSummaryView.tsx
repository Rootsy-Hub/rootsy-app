"use client"

import type { OperationServiceChargeRow } from "@/app/[siteId]/[popId]/operations/actions"
import { serviceChargeStatusLabel } from "@/app/[siteId]/[popId]/operations/operationServiceChargeUi"
import { operationTableFmt } from "@/app/[siteId]/[popId]/operations/operationsTableCells"
import { SaleOperationCartList } from "@/components/sale-operation/SaleOperationCartList"
import { SaleOperationTotalBar } from "@/components/sale-operation/SaleOperationTotalBar"
import { SALE_TICKET_PANEL_WIDTH_CLASS } from "@/components/sale-operation/SaleReadonlyTicketPanel"
import { tdMoneyMutedClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import { formatIsoDateShort } from "@/lib/dataWorkspaceDateFilter"
import { cn } from "@/lib/utils"

const fmt = operationTableFmt

function BreakdownRow({
  label,
  value,
  muted = false,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-3 py-1.5">
      <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "shrink-0 tabular-nums text-sm font-medium text-foreground",
          muted && tdMoneyMutedClass,
        )}
      >
        {value}
      </span>
    </div>
  )
}

export function ServiceChargeDetailSummaryView({
  charge,
  showHeading = true,
}: {
  charge: OperationServiceChargeRow
  showHeading?: boolean
}) {
  return (
    <>
      {showHeading ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Servicio
        </p>
      ) : null}

      <div
        className={cn(
          "flex flex-col overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm",
          SALE_TICKET_PANEL_WIDTH_CLASS,
        )}
      >
        <SaleOperationCartList
          title={charge.serviceName}
          lineCount={1}
          emptyTitle="Sin detalle."
          flush
        >
          <div className="border-b border-slate-200/90 bg-white px-3 py-3">
            <p className="text-sm font-semibold leading-snug text-slate-900">
              {charge.serviceName}
            </p>
            <p className="mt-1 text-xs leading-snug text-muted-foreground">
              {charge.clientName}
            </p>
            <p className="mt-1 text-xs leading-snug text-muted-foreground">
              {charge.periodDisplay} · vence {formatIsoDateShort(charge.dueDate)}
            </p>
          </div>
        </SaleOperationCartList>

        <div className="border-t border-border/60 bg-muted/10 py-1">
          <BreakdownRow label="Estado" value={serviceChargeStatusLabel(charge)} />
          <BreakdownRow label="Precio" value={fmt.format(charge.unitPrice)} />
          {charge.discountAmount > 0 ? (
            <BreakdownRow
              label="Descuento"
              value={fmt.format(charge.discountAmount)}
              muted
            />
          ) : null}
          {charge.paidTotal > 0 ? (
            <BreakdownRow
              label="Cobrado"
              value={fmt.format(charge.paidTotal)}
            />
          ) : null}
          {charge.balance > 0 && charge.effectiveStatus !== "cancelled" ? (
            <BreakdownRow label="Saldo" value={fmt.format(charge.balance)} />
          ) : null}
        </div>

        <div className="shrink-0 border-t border-slate-200/90">
          <SaleOperationTotalBar
            tone="modal"
            flush
            total={charge.amount}
            subtotal={charge.unitPrice}
            descuentoMonto={charge.discountAmount}
            hayDescuento={charge.discountAmount > 0}
            totalLabel="Importe"
            totalAriaLabel="Importe del servicio"
          />
        </div>
      </div>
    </>
  )
}
