"use client"

import {
  cartListHeaderRowClass,
  saleOpFmt,
  saleOpImporteCartClass,
} from "@/components/sale-operation/saleOperationStyles"
import type { MostradorCartGroupPricing } from "@/lib/mostradorCartDisplay"
import { cn } from "@/lib/utils"
import { Banknote, Percent, Tag } from "lucide-react"

type Props = {
  label: string
  variant?: "promotion" | "discount"
  discountMode?: "porcentaje" | "fijo"
  pricing?: MostradorCartGroupPricing
  discountAmount?: number
  finalTotal?: number
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

function PromoDiscountBadge({
  amount,
  variant,
}: {
  amount: number
  variant: "promotion" | "discount"
}) {
  const formatted = saleOpFmt.format(Math.abs(amount))

  return (
    <span
      className={cn(
        "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold tabular-nums",
        variant === "discount"
          ? "bg-emerald-700/15 text-emerald-900"
          : "bg-violet-700/15 text-violet-900",
      )}
    >
      −{formatted}
    </span>
  )
}

export function MostradorCartPromoBanner({
  label,
  variant = "promotion",
  discountMode = "porcentaje",
  pricing,
  discountAmount,
  finalTotal,
}: Props) {
  const isDiscount = variant === "discount"
  const isFixedDiscount = isDiscount && discountMode === "fijo"

  const savingsFromPricing =
    pricing != null && pricing.finalTotal < pricing.listTotal
      ? roundMoney(pricing.listTotal - pricing.finalTotal)
      : 0

  const savings = roundMoney(
    discountAmount != null && discountAmount > 0
      ? discountAmount
      : savingsFromPricing,
  )

  const resolvedFinalTotal =
    finalTotal != null
      ? roundMoney(finalTotal)
      : pricing != null
        ? roundMoney(pricing.finalTotal)
        : null

  return (
    <div
      className={cn(
        cartListHeaderRowClass,
        isDiscount
          ? "bg-gradient-to-r from-emerald-200/80 via-emerald-100/45 to-transparent text-emerald-950"
          : "bg-gradient-to-r from-violet-200/80 via-violet-100/45 to-transparent text-violet-950",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        {isDiscount ? (
          isFixedDiscount ? (
            <Banknote className="size-3 shrink-0 opacity-80" aria-hidden />
          ) : (
            <Percent className="size-3 shrink-0 opacity-80" aria-hidden />
          )
        ) : (
          <Tag className="size-3 shrink-0 opacity-80" aria-hidden />
        )}
        <span className="truncate text-[10px] font-semibold uppercase tracking-[0.1em]">
          {label}
        </span>
        {savings > 0 ? (
          <PromoDiscountBadge amount={savings} variant={variant} />
        ) : null}
      </div>

      {resolvedFinalTotal != null ? (
        <span className={cn(saleOpImporteCartClass, "shrink-0")}>
          {saleOpFmt.format(resolvedFinalTotal)}
        </span>
      ) : null}
    </div>
  )
}
