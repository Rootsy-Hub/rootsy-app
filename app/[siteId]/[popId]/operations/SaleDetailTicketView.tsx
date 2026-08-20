"use client"

import type { OperationSaleRow } from "@/app/[siteId]/[popId]/operations/actions"
import { MostradorCartLineDisplay } from "@/components/sale-operation/MostradorCartLineDisplay"
import { SaleReadonlyTicketPanel } from "@/components/sale-operation/SaleReadonlyTicketPanel"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"
import { tdMoneyClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import { buildSaleDetailCartDisplayRows } from "@/lib/saleDetailCartDisplay"
import {
  groupMostradorCartDisplayRows,
  pricingForMostradorRow,
} from "@/lib/mostradorCartDisplay"
import type { SaleDiscountSource } from "@/lib/saleSnapshot"
import {
  countSaleAppliedPromotions,
  resolvePersistedListLineTotal,
} from "@/lib/saleSnapshot"
import { cn } from "@/lib/utils"
import { useMemo } from "react"

const EMPTY_CART_OVERRIDES = {
  itemDescuentoModo: {},
  itemDescuentoDraft: {},
  itemDescuentoSuprimido: {},
  itemComentarios: {},
}

function roundMoney(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 100) / 100
}

function resolveListLineTotal(line: OperationSaleRow["lineItems"][number]): number {
  return resolvePersistedListLineTotal({
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    listLineTotal: line.listLineTotal,
    discountSource: line.discountSource,
    promotionListTotal: line.promotionSnapshot?.listTotal,
  })
}

function resolveLineSubtotal(
  line: OperationSaleRow["lineItems"][number],
  sale: OperationSaleRow,
): number {
  if (line.lineSubtotal != null && line.lineSubtotal > 0) {
    return line.lineSubtotal
  }
  const subBeforeGeneral = sale.discountInfo.subtotalBeforeGeneralDiscount
  if (
    subBeforeGeneral != null &&
    subBeforeGeneral > 0 &&
    sale.total > 0 &&
    line.lineTotal > 0
  ) {
    return roundMoney((line.lineTotal * subBeforeGeneral) / sale.total)
  }
  return line.lineTotal
}

function resolveItemDiscountAmount(
  line: OperationSaleRow["lineItems"][number],
  sale: OperationSaleRow,
): number {
  if (line.itemDiscountAmount > 0) return line.itemDiscountAmount
  const gross = roundMoney(line.quantity * line.unitPrice)
  const lineSub = resolveLineSubtotal(line, sale)
  const guess = roundMoney(gross - lineSub)
  return guess > 0 ? guess : 0
}

function SaleDetailTotalsRow({
  label,
  value,
  emphasize = false,
  monetary = true,
}: {
  label: string
  value: string
  emphasize?: boolean
  monetary?: boolean
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
          "shrink-0 text-sm text-foreground",
          monetary && "tabular-nums",
          emphasize
            ? "text-base font-semibold"
            : monetary
              ? cn("font-medium", tdMoneyClass)
              : "font-medium",
        )}
      >
        {value}
      </span>
    </div>
  )
}

function resolveTotalsFromSale(sale: OperationSaleRow) {
  const listSubtotal = roundMoney(
    sale.lineItems.reduce((sum, line) => sum + resolveListLineTotal(line), 0),
  )

  const channelTotal = sale.channelOrderTotal ?? null
  const useChannelTotals =
    channelTotal != null &&
    (sale.isChannelGrouped || sale.status === "partial")

  if (useChannelTotals) {
    return {
      listSubtotal,
      promoDiscount: sale.discountInfo.quantityDealApplications.reduce(
        (sum, d) => sum + d.discountAmount,
        0,
      ),
      catalogDiscount: 0,
      manualDiscount: sale.discountInfo.itemDiscountTotal,
      generalDiscount: sale.discountInfo.generalDiscountAmount,
      taxTotal: sale.taxTotal,
      total: channelTotal,
    }
  }

  const snapshot = sale.snapshotInfo.totals
  if (snapshot) {
    return {
      listSubtotal,
      promoDiscount: snapshot.discountPromotionsAmount,
      catalogDiscount: snapshot.discountItemsCatalogAmount,
      manualDiscount: snapshot.discountItemsManualAmount,
      generalDiscount: snapshot.discountGeneralAmount,
      taxTotal: snapshot.taxTotal,
      total: snapshot.total,
    }
  }

  const generalDiscount = sale.discountInfo.generalDiscountAmount
  let promoDiscount = 0
  let catalogDiscount = 0
  let manualDiscount = 0

  for (const line of sale.lineItems) {
    const amount = resolveItemDiscountAmount(line, sale)
    const source = line.discountSource as SaleDiscountSource | null
    if (source === "quantity_deal" || source === "combo") {
      promoDiscount += amount
    } else if (source === "catalog") {
      catalogDiscount += amount
    } else if (source === "manual") {
      manualDiscount += amount
    }
  }

  const promoFromMeta = sale.discountInfo.quantityDealApplications.reduce(
    (sum, d) => sum + d.discountAmount,
    0,
  )
  promoDiscount = Math.max(promoDiscount, promoFromMeta)

  return {
    listSubtotal,
    promoDiscount,
    catalogDiscount,
    manualDiscount,
    generalDiscount,
    taxTotal: sale.taxTotal,
    total: sale.total,
  }
}

export function SaleDetailTicketView({
  sale,
  showPaymentDetails = true,
  showHeading = true,
  ticketTone = "modal",
  className,
  ticketScrollClassName,
}: {
  sale: OperationSaleRow
  showPaymentDetails?: boolean
  showHeading?: boolean
  ticketTone?: "pos" | "modal" | "operar"
  className?: string
  ticketScrollClassName?: string
}) {
  const cartDisplayRows = useMemo(
    () => buildSaleDetailCartDisplayRows(sale.lineItems),
    [sale.lineItems],
  )
  const cartDisplayGroups = useMemo(
    () => groupMostradorCartDisplayRows(cartDisplayRows),
    [cartDisplayRows],
  )
  const totals = resolveTotalsFromSale(sale)
  const promocionesAplicadasCount = countSaleAppliedPromotions({
    quantityDealApplicationCount:
      sale.discountInfo.quantityDealApplications.length,
    lineItems: sale.lineItems,
  })
  const itemDiscountTotal = roundMoney(
    totals.promoDiscount + totals.catalogDiscount + totals.manualDiscount,
  )
  const lineCount = cartDisplayGroups.reduce(
    (sum, group) => sum + group.rows.length,
    0,
  )
  const catalogManualDiscount = roundMoney(
    totals.catalogDiscount + totals.manualDiscount,
  )
  const itemsDiscountAmount =
    catalogManualDiscount > 0
      ? catalogManualDiscount
      : itemDiscountTotal <= 0
        ? sale.discountInfo.itemDiscountTotal
        : 0
  const channelPaidTotal = sale.channelPaidTotal
  const isPartialChannel =
    sale.channelOrderTotal != null &&
    channelPaidTotal != null &&
    channelPaidTotal + 0.009 < sale.channelOrderTotal

  return (
    <>
      {showHeading ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Ticket
        </p>
      ) : null}

      <SaleReadonlyTicketPanel
        groups={cartDisplayGroups}
        lineCount={lineCount}
        emptyTitle="Sin líneas registradas."
        totalBarTone={ticketTone}
        className={className}
        ticketScrollClassName={ticketScrollClassName}
        renderRow={(row) => {
          const pricing = pricingForMostradorRow(row, EMPTY_CART_OVERRIDES)
          return (
            <MostradorCartLineDisplay
              key={row.rowKey}
              row={row}
              variant={ticketTone === "operar" ? "operar" : "legacy"}
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
          promocionesAplicadasMonto: totals.promoDiscount,
          promocionesAplicadasCount,
          descuentoItemsMonto: itemsDiscountAmount,
          hayDescuentoItems: itemsDiscountAmount > 0,
          descuentoMonto: totals.generalDiscount,
          hayDescuento: totals.generalDiscount > 0,
          totalPagado:
            showPaymentDetails && isPartialChannel ? channelPaidTotal : 0,
          totalLabel: "Total",
          flush: true,
        }}
      />

      {showPaymentDetails ? (
        <div className="mt-4 rounded-lg border border-border bg-muted/20 px-4 py-3">
          {sale.payments.length > 1 ? (
            <>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Cobros
              </p>
              {sale.payments.map((payment, index) => (
                <SaleDetailTotalsRow
                  key={`${payment.methodName}-${index}`}
                  label={payment.methodName}
                  value={saleOpFmt.format(payment.amount)}
                />
              ))}
            </>
          ) : (
            <SaleDetailTotalsRow
              label="Forma de pago"
              value={sale.paymentMethodLabel}
              monetary={false}
            />
          )}
        </div>
      ) : null}
    </>
  )
}
