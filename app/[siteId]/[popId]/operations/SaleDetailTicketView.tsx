"use client"

import type { OperationSaleRow } from "@/app/[siteId]/[popId]/operations/actions"
import { MostradorCartLineDisplay } from "@/components/sale-operation/MostradorCartLineDisplay"
import { MostradorCartTicketGroup } from "@/components/sale-operation/MostradorCartTicketGroup"
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
  negative = false,
  monetary = true,
}: {
  label: string
  value: string
  emphasize?: boolean
  negative?: boolean
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
          "shrink-0 text-sm text-right",
          monetary && "tabular-nums",
          emphasize
            ? "text-base font-semibold text-primary"
            : monetary
              ? cn("font-medium text-foreground", tdMoneyClass)
              : "font-medium text-foreground",
          negative && !emphasize && monetary && "text-amber-800",
        )}
      >
        {value}
      </span>
    </div>
  )
}

function formatGeneralDiscountRowLabel(
  info: OperationSaleRow["discountInfo"],
): string {
  if (info.generalDiscountAmount <= 0) return "Descuento general"
  if (info.generalDiscountMode === "porcentaje" && info.generalDiscountValue != null) {
    const pct = Number.isInteger(info.generalDiscountValue)
      ? String(info.generalDiscountValue)
      : info.generalDiscountValue.toLocaleString("es-AR", {
          maximumFractionDigits: 2,
        })
    return `Descuento general (${pct} %)`
  }
  if (info.generalDiscountMode === "fijo" && info.generalDiscountValue != null) {
    return `Descuento general (${saleOpFmt.format(info.generalDiscountValue)})`
  }
  return "Descuento general"
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

export function SaleDetailTicketView({ sale }: { sale: OperationSaleRow }) {
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

  return (
    <>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Ticket
      </p>
      <div className="overflow-hidden rounded-lg border border-border bg-white">
        {cartDisplayGroups.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            Sin líneas registradas.
          </p>
        ) : (
          <div className="border-b border-slate-200/90 bg-white">
            {cartDisplayGroups.map((group) => (
              <MostradorCartTicketGroup
                key={group.key}
                group={group}
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
                    />
                  )
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-border bg-muted/20 px-4 py-3">
        <SaleDetailTotalsRow
          label="Subtotal lista"
          value={saleOpFmt.format(totals.listSubtotal)}
        />
        {totals.promoDiscount > 0 ? (
          <SaleDetailTotalsRow
            label={`Promociones aplicadas (${promocionesAplicadasCount})`}
            value={`−${saleOpFmt.format(totals.promoDiscount)}`}
            negative
          />
        ) : null}
        {totals.catalogDiscount > 0 ? (
          <SaleDetailTotalsRow
            label="Descuento catálogo"
            value={`−${saleOpFmt.format(totals.catalogDiscount)}`}
            negative
          />
        ) : null}
        {totals.manualDiscount > 0 ? (
          <SaleDetailTotalsRow
            label="Descuento manual"
            value={`−${saleOpFmt.format(totals.manualDiscount)}`}
            negative
          />
        ) : null}
        {itemDiscountTotal <= 0 && sale.discountInfo.itemDiscountTotal > 0 ? (
          <SaleDetailTotalsRow
            label="Descuento ítems"
            value={`−${saleOpFmt.format(sale.discountInfo.itemDiscountTotal)}`}
            negative
          />
        ) : null}
        {totals.generalDiscount > 0 ? (
          <SaleDetailTotalsRow
            label={formatGeneralDiscountRowLabel(sale.discountInfo)}
            value={`−${saleOpFmt.format(totals.generalDiscount)}`}
            negative
          />
        ) : null}
        <div className="my-2 border-t border-border/60" />
        <SaleDetailTotalsRow
          label="Total"
          value={saleOpFmt.format(totals.total)}
          emphasize
        />
        {sale.channelPaidTotal != null &&
        sale.channelOrderTotal != null &&
        sale.channelPaidTotal + 0.009 < sale.channelOrderTotal ? (
          <SaleDetailTotalsRow
            label="Pagado"
            value={saleOpFmt.format(sale.channelPaidTotal)}
          />
        ) : null}
        {sale.accruesOutputVat ? (
          <SaleDetailTotalsRow
            label="IVA"
            value={totals.taxTotal > 0 ? saleOpFmt.format(totals.taxTotal) : "—"}
          />
        ) : null}
        {sale.payments.length > 1 ? (
          <>
            <div className="my-2 border-t border-border/60" />
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
    </>
  )
}
