"use client"

import type { OperationPurchaseRow } from "@/app/[siteId]/[popId]/operations/actions"
import { resolvePurchaseDisplayTaxTotal } from "@/app/[siteId]/[popId]/operations/operationPurchaseUi"
import { MostradorCartLineDisplay } from "@/components/sale-operation/MostradorCartLineDisplay"
import { SaleReadonlyTicketPanel } from "@/components/sale-operation/SaleReadonlyTicketPanel"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"
import { tdMoneyClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  buildPurchaseDetailCartDisplayRows,
  resolvePurchaseTotals,
} from "@/lib/purchaseDetailCartDisplay"
import { groupMostradorCartDisplayRows, pricingForMostradorRow } from "@/lib/mostradorCartDisplay"
import { cn } from "@/lib/utils"
import { useMemo } from "react"

const EMPTY_CART_OVERRIDES = {
  itemDescuentoModo: {},
  itemDescuentoDraft: {},
  itemDescuentoSuprimido: {},
  itemComentarios: {},
}

function PurchaseDetailTotalsRow({
  label,
  value,
  emphasize = false,
}: {
  label: string
  value: string
  emphasize?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span
        className={cn(
          "text-sm text-muted-foreground",
          emphasize && "font-semibold text-foreground",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "shrink-0 tabular-nums text-sm text-foreground",
          emphasize ? "text-base font-semibold" : cn("font-medium", tdMoneyClass),
        )}
      >
        {value}
      </span>
    </div>
  )
}

export function PurchaseDetailTicketView({
  purchase,
  showHeading = true,
}: {
  purchase: OperationPurchaseRow
  showHeading?: boolean
}) {
  const cartDisplayRows = useMemo(
    () => buildPurchaseDetailCartDisplayRows(purchase),
    [purchase],
  )
  const cartDisplayGroups = useMemo(
    () => groupMostradorCartDisplayRows(cartDisplayRows),
    [cartDisplayRows],
  )
  const totals = useMemo(() => resolvePurchaseTotals(purchase), [purchase])
  const displayTaxTotal = resolvePurchaseDisplayTaxTotal(purchase)
  const lineCount = cartDisplayGroups.reduce(
    (sum, group) => sum + group.rows.length,
    0,
  )

  return (
    <>
      {showHeading ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Compra
        </p>
      ) : null}

      <SaleReadonlyTicketPanel
        groups={cartDisplayGroups}
        lineCount={lineCount}
        emptyTitle="Sin líneas registradas."
        listTitle="Tu compra"
        totalBarTone="modal"
        renderRow={(row) => {
          const pricing = pricingForMostradorRow(row, EMPTY_CART_OVERRIDES)
          return (
            <MostradorCartLineDisplay
              key={row.rowKey}
              row={row}
              pricing={{
                precioBase: pricing.precioBase,
                precioFinal: pricing.precioFinal,
              }}
              omitHiddenPricePlaceholder
            />
          )
        }}
        totalBar={{
          total: totals.total,
          subtotal: totals.listSubtotal,
          subtotalOriginal: totals.listSubtotal,
          descuentoItemsMonto: totals.itemDiscountTotal,
          hayDescuentoItems: totals.itemDiscountTotal > 0,
          descuentoMonto: totals.generalDiscount,
          hayDescuento: totals.generalDiscount > 0,
          totalLabel: "Total",
          flush: true,
        }}
      />

      {displayTaxTotal != null && displayTaxTotal > 0 ? (
        <div className="mt-4 rounded-lg border border-border bg-muted/20 px-4 py-3">
          <PurchaseDetailTotalsRow
            label="IVA"
            value={saleOpFmt.format(displayTaxTotal)}
          />
        </div>
      ) : null}
    </>
  )
}
