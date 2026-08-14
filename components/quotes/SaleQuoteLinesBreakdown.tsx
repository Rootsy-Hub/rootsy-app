"use client"

import {
  quoteHasInlineDiscounts,
  quoteSubtotalSinDescuentos,
  resolveQuoteLineGroups,
} from "@/lib/saleQuoteDocumentLines"
import type { SaleQuoteMetadata } from "@/lib/saleQuoteTypes"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import { cn } from "@/lib/utils"

type Props = {
  metadata: SaleQuoteMetadata
  subtotal: number
  discountTotal: number
  total: number
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
  className,
}: Props) {
  const lineGroups = resolveQuoteLineGroups(metadata)
  const showListSubtotal = quoteHasInlineDiscounts(lineGroups)
  const subtotalSinDescuentos = quoteSubtotalSinDescuentos(lineGroups)

  return (
    <div className={cn("space-y-4", className)}>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Producto</th>
              <th className="px-3 py-2 text-right font-medium">Cant.</th>
              <th className="px-3 py-2 text-right font-medium">Precio unit.</th>
              <th className="px-3 py-2 text-right font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {lineGroups.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-6 text-center text-muted-foreground"
                >
                  Sin ítems
                </td>
              </tr>
            ) : (
              lineGroups.map((group) => (
                <GroupRows key={group.id} group={group} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-1 border-t pt-3">
        {showListSubtotal ? (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal sin descuentos</span>
            <span>{formatReportMoneyAr(subtotalSinDescuentos)}</span>
          </div>
        ) : null}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatReportMoneyAr(subtotal)}</span>
        </div>
        {discountTotal > 0 ? (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Descuento{metadata.discountLabel ? ` (${metadata.discountLabel})` : ""}
            </span>
            <span>-{formatReportMoneyAr(discountTotal)}</span>
          </div>
        ) : null}
        <div className="flex justify-between text-base font-semibold">
          <span>Total</span>
          <span>{formatReportMoneyAr(total)}</span>
        </div>
      </div>
    </div>
  )
}

function GroupRows({
  group,
}: {
  group: ReturnType<typeof resolveQuoteLineGroups>[number]
}) {
  const showHeader = isPromoGroupCategory(group.category)

  return (
    <>
      {showHeader ? (
        <tr className="border-t bg-muted/30">
          <td colSpan={4} className="px-3 py-2 text-xs font-semibold uppercase tracking-wide">
            {group.category}
          </td>
        </tr>
      ) : null}
      {group.lines.map((line, index) => (
        <LineRows
          key={`${group.id}-${line.name}-${index}`}
          line={line}
          withBorder={!showHeader || index > 0}
        />
      ))}
      {group.promotionDiscount ? (
        <DiscountRow
          label={group.promotionDiscount.label}
          amount={group.promotionDiscount.amount}
        />
      ) : null}
    </>
  )
}

function LineRows({
  line,
  withBorder,
}: {
  line: ReturnType<typeof resolveQuoteLineGroups>[number]["lines"][number]
  withBorder: boolean
}) {
  return (
    <>
      <tr className={withBorder ? "border-t" : undefined}>
        <td className="px-3 py-2">{line.name}</td>
        <td className="px-3 py-2 text-right tabular-nums">{line.quantity}</td>
        <td className="px-3 py-2 text-right tabular-nums">
          {formatReportMoneyAr(line.unitListPrice)}
        </td>
        <td className="px-3 py-2 text-right tabular-nums">
          {formatReportMoneyAr(line.listLineTotal)}
        </td>
      </tr>
      {line.discounts.map((discount, index) => (
        <DiscountRow
          key={`${line.name}-discount-${index}`}
          label={discount.label}
          amount={discount.amount}
        />
      ))}
    </>
  )
}

function DiscountRow({ label, amount }: { label: string; amount: number }) {
  return (
    <tr className="border-t bg-muted/10 text-muted-foreground">
      <td className="px-3 py-1.5 pl-6 text-xs">{label}</td>
      <td className="px-3 py-1.5" colSpan={2} />
      <td className="px-3 py-1.5 text-right tabular-nums text-xs">
        -{formatReportMoneyAr(amount)}
      </td>
    </tr>
  )
}
