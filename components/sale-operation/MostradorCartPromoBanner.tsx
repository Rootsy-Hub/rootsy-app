"use client"

import {
  saleOpFmt,
  saleOpImporteCartClass,
  saleOpImporteCartMutedClass,
} from "@/components/sale-operation/saleOperationStyles"
import type { MostradorCartGroupPricing } from "@/lib/mostradorCartDisplay"
import { cn } from "@/lib/utils"
import { Banknote, Percent, Tag } from "lucide-react"

type Props = {
  label: string
  variant?: "promotion" | "discount"
  discountMode?: "porcentaje" | "fijo"
  pricing?: MostradorCartGroupPricing
}

export function MostradorCartPromoBanner({
  label,
  variant = "promotion",
  discountMode = "porcentaje",
  pricing,
}: Props) {
  const isDiscount = variant === "discount"
  const isFixedDiscount = isDiscount && discountMode === "fijo"
  const showPricing = pricing != null
  const hasDiscount =
    showPricing && pricing.finalTotal < pricing.listTotal

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 px-3 py-1.5",
        isDiscount
          ? "bg-gradient-to-r from-emerald-200/80 via-emerald-100/45 to-transparent text-emerald-950"
          : "bg-gradient-to-r from-violet-200/80 via-violet-100/45 to-transparent text-violet-950",
      )}
    >
      <div className="flex min-w-0 items-center gap-1.5 pt-0.5">
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
      </div>

      {showPricing ? (
        <div className="shrink-0 text-right">
          {hasDiscount ? (
            <span
              className={cn(
                saleOpImporteCartMutedClass,
                "block text-[10px] line-through",
              )}
            >
              {saleOpFmt.format(pricing.listTotal)}
            </span>
          ) : null}
          <span className={cn(saleOpImporteCartClass, "text-sm")}>
            {saleOpFmt.format(pricing.finalTotal)}
          </span>
        </div>
      ) : null}
    </div>
  )
}
