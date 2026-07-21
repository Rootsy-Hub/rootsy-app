"use client"

import type {
  OperationSaleLineItem,
  OperationSaleRow,
} from "@/app/[siteId]/[popId]/operations/actions"
import { MostradorCartPromoBanner } from "@/components/sale-operation/MostradorCartPromoBanner"
import {
  saleOpFmt,
  saleOpImporteCartClass,
  saleOpImporteCartMutedClass,
} from "@/components/sale-operation/saleOperationStyles"
import { tdMoneyClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  groupSaleDetailLines,
  type SaleDetailDisplayGroup,
  type SaleDiscountSource,
} from "@/lib/saleSnapshot"
import { cn } from "@/lib/utils"

function roundMoney(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 100) / 100
}

function resolveLineSubtotal(
  line: OperationSaleLineItem,
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
  line: OperationSaleLineItem,
  sale: OperationSaleRow,
): number {
  if (line.itemDiscountAmount > 0) return line.itemDiscountAmount
  const gross = roundMoney(line.quantity * line.unitPrice)
  const lineSub = resolveLineSubtotal(line, sale)
  const guess = roundMoney(gross - lineSub)
  return guess > 0 ? guess : 0
}

function resolveListLineTotal(line: OperationSaleLineItem): number {
  if (line.listLineTotal != null && line.listLineTotal > 0) {
    return line.listLineTotal
  }
  return roundMoney(line.quantity * line.unitPrice)
}

function formatQty(n: number) {
  const t = Math.round(n * 1e6) / 1e6
  if (Number.isInteger(t)) return String(t)
  return t.toLocaleString("es-AR", { maximumFractionDigits: 6 })
}

function SaleDetailTicketRow({
  name,
  quantity,
  listTotal,
  finalTotal,
  comment,
  components,
}: {
  name: string
  quantity: number
  listTotal: number
  finalTotal: number
  comment?: string | null
  components?: Array<{ name: string; quantity: number }>
}) {
  const hasDiscount = listTotal > finalTotal + 0.004

  return (
    <div className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-start gap-x-3 px-3 py-2.5">
      <span className="pt-0.5 text-sm font-bold tabular-nums text-slate-900">
        {formatQty(quantity)}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-snug text-slate-900">
          {name}
        </span>
        {components?.length ? (
          <ul className="mt-1 space-y-0.5">
            {components.map((component, index) => (
              <li
                key={`${name}-component-${index}`}
                className="text-xs leading-snug text-slate-500"
              >
                {component.quantity > 1 ? `${formatQty(component.quantity)}× ` : ""}
                {component.name}
              </li>
            ))}
          </ul>
        ) : null}
        {comment ? (
          <span className="mt-1 block text-xs leading-snug text-slate-500">
            {comment}
          </span>
        ) : null}
      </span>
      <span className="pt-0.5 text-right">
        {hasDiscount ? (
          <span
            className={cn(
              saleOpImporteCartMutedClass,
              "block text-[10px] line-through",
            )}
          >
            {saleOpFmt.format(listTotal)}
          </span>
        ) : null}
        <span className={saleOpImporteCartClass}>
          {saleOpFmt.format(finalTotal)}
        </span>
      </span>
    </div>
  )
}

function SaleDetailTicketGroup({
  group,
  sale,
}: {
  group: SaleDetailDisplayGroup
  sale: OperationSaleRow
}) {
  const hasPromoHeader = Boolean(group.groupLabel?.trim())
  const isDiscount = group.groupType === "discount"
  const groupPricing =
    group.listTotal > 0
      ? { listTotal: group.listTotal, finalTotal: group.finalTotal }
      : undefined

  if (!hasPromoHeader) {
    return (
      <>
        {group.rows.map((row) => {
          const line = sale.lineItems[row.lineIndex]
          if (!line) return null
          return (
            <div
              key={`${group.key}-${row.lineIndex}`}
              className="border-b border-slate-200/90"
            >
              <SaleDetailTicketRow
                name={row.name}
                quantity={row.quantity}
                listTotal={resolveListLineTotal(line)}
                finalTotal={resolveLineSubtotal(line, sale)}
                comment={line.comment}
              />
            </div>
          )
        })}
      </>
    )
  }

  return (
    <section
      className={cn(
        "border-b border-slate-200/90",
        isDiscount
          ? "border-l-[3px] border-l-emerald-400"
          : "border-l-[3px] border-l-violet-400",
      )}
      aria-label={`Grupo: ${group.groupLabel}`}
    >
      <MostradorCartPromoBanner
        label={group.groupLabel!}
        variant={isDiscount ? "discount" : "promotion"}
        discountMode={
          group.rows[0]
            ? sale.lineItems[group.rows[0].lineIndex]?.itemDiscountMode ?? "porcentaje"
            : "porcentaje"
        }
        pricing={groupPricing}
      />
      <div
        className={cn(
          "bg-gradient-to-b to-white",
          isDiscount ? "from-emerald-50/35" : "from-violet-50/35",
        )}
      >
        {group.rows.map((row, index) => {
          const line = sale.lineItems[row.lineIndex]
          if (!line) return null
          const isCombo =
            line.lineKind === "promotion" && Boolean(row.components?.length)
          return (
            <div
              key={`${group.key}-${row.lineIndex}`}
              className={cn(
                index > 0 &&
                  cn(
                    "border-t border-dashed",
                    isDiscount ? "border-emerald-200/70" : "border-violet-200/70",
                  ),
              )}
            >
              <SaleDetailTicketRow
                name={row.name}
                quantity={row.quantity}
                listTotal={resolveListLineTotal(line)}
                finalTotal={resolveLineSubtotal(line, sale)}
                comment={line.comment}
                components={isCombo ? row.components : undefined}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}

function SaleDetailTotalsRow({
  label,
  value,
  emphasize = false,
  negative = false,
}: {
  label: string
  value: string
  emphasize?: boolean
  negative?: boolean
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
          "shrink-0 text-sm tabular-nums",
          emphasize ? "text-base font-semibold text-primary" : "font-medium text-foreground",
          negative && !emphasize && "text-amber-800",
          tdMoneyClass,
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
  const snapshot = sale.snapshotInfo.totals
  if (snapshot) {
    return {
      listSubtotal: snapshot.listSubtotal,
      promoDiscount: snapshot.discountPromotionsAmount,
      catalogDiscount: snapshot.discountItemsCatalogAmount,
      manualDiscount: snapshot.discountItemsManualAmount,
      generalDiscount: snapshot.discountGeneralAmount,
      taxTotal: snapshot.taxTotal,
      total: snapshot.total,
    }
  }

  const listSubtotal = roundMoney(
    sale.lineItems.reduce((sum, line) => sum + resolveListLineTotal(line), 0),
  )
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
  const detailLines = sale.lineItems.map((line) => ({
    nameSnapshot: line.nameSnapshot,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    lineSubtotal: resolveLineSubtotal(line, sale),
    lineTotal: line.lineTotal,
    listLineTotal: resolveListLineTotal(line),
    itemDiscountAmount: resolveItemDiscountAmount(line, sale),
    discountSource: line.discountSource,
    lineKind: line.lineKind,
    display: line.display,
    promotionSnapshot: line.promotionSnapshot,
  }))

  const groups = groupSaleDetailLines(detailLines)
  const totals = resolveTotalsFromSale(sale)
  const itemDiscountTotal = roundMoney(
    totals.promoDiscount + totals.catalogDiscount + totals.manualDiscount,
  )

  return (
    <>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Ticket
      </p>
      <div className="overflow-hidden rounded-lg border border-border bg-white">
        {groups.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            Sin líneas registradas.
          </p>
        ) : (
          groups.map((group) => (
            <SaleDetailTicketGroup key={group.key} group={group} sale={sale} />
          ))
        )}
      </div>

      <div className="mt-4 rounded-lg border border-border bg-muted/20 px-4 py-3">
        <SaleDetailTotalsRow
          label="Subtotal lista"
          value={saleOpFmt.format(totals.listSubtotal)}
        />
        {totals.promoDiscount > 0 ? (
          <SaleDetailTotalsRow
            label={`Promociones${
              sale.discountInfo.quantityDealApplications.length > 0
                ? ` (${sale.discountInfo.quantityDealApplications.length})`
                : ""
            }`}
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
        {sale.accruesOutputVat ? (
          <SaleDetailTotalsRow
            label="IVA"
            value={totals.taxTotal > 0 ? saleOpFmt.format(totals.taxTotal) : "—"}
          />
        ) : null}
        <SaleDetailTotalsRow
          label="Forma de pago"
          value={sale.paymentMethodLabel}
        />
      </div>
    </>
  )
}
