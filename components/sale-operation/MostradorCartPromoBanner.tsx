"use client"

import {
  layoutsOperarTicketProposalLineAmountClass,
  layoutsOperarTicketProposalPromoBadgeClass,
  layoutsOperarTicketProposalPromoBannerClass,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import { LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import {
  saleOpFmt,
  saleOpImporteCartClass,
} from "@/components/sale-operation/saleOperationStyles"
import { cartLineRowGridClass, cartLineRowGridCompactClass } from "@/components/sale-operation/CartLineQuantityLabel"
import type { MostradorCartGroupPricing } from "@/lib/mostradorCartDisplay"
import { cn } from "@/lib/utils"
import { Banknote, Percent, Tag } from "lucide-react"

type Props = {
  label: string
  promoVariant?: "promotion" | "discount"
  discountMode?: "porcentaje" | "fijo"
  pricing?: MostradorCartGroupPricing
  discountAmount?: number
  finalTotal?: number
  compactLayout?: boolean
  importeClassName?: string
  discountBadgeClassName?: string
  lineVariant?: "legacy" | "operar"
}

const TICKET_PROPOSAL = LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

function PromoDiscountBadge({
  amount,
  variant,
  className,
}: {
  amount: number
  variant: "promotion" | "discount"
  className?: string
}) {
  const formatted = saleOpFmt.format(Math.abs(amount))

  return (
    <span
      className={cn(
        "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold tabular-nums",
        className,
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
  promoVariant = "promotion",
  discountMode = "porcentaje",
  pricing,
  discountAmount,
  finalTotal,
  compactLayout = false,
  importeClassName = saleOpImporteCartClass,
  discountBadgeClassName,
  lineVariant = "operar",
}: Props) {
  const isDiscount = promoVariant === "discount"
  const isOperar = lineVariant === "operar"
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
        isOperar
          ? layoutsOperarTicketProposalPromoBannerClass(TICKET_PROPOSAL, promoVariant)
          : cn(
              compactLayout ? cartLineRowGridCompactClass : cartLineRowGridClass,
              "items-center py-2",
              isDiscount
                ? "bg-gradient-to-r from-emerald-200/80 via-emerald-100/45 to-transparent text-emerald-950"
                : "bg-gradient-to-r from-violet-200/80 via-violet-100/45 to-transparent text-violet-950",
            ),
      )}
    >
      <div
        className={cn(
          "flex min-w-0 items-center gap-1.5",
          !compactLayout && "col-span-2",
        )}
      >
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
          isOperar ? (
            <span
              className={layoutsOperarTicketProposalPromoBadgeClass(
                TICKET_PROPOSAL,
                promoVariant,
              )}
            >
              −{saleOpFmt.format(Math.abs(savings))}
            </span>
          ) : (
            <PromoDiscountBadge
              amount={savings}
              variant={promoVariant}
              className={discountBadgeClassName}
            />
          )
        ) : null}
      </div>

      {resolvedFinalTotal != null ? (
        <span
          className={cn(
            isOperar
              ? layoutsOperarTicketProposalLineAmountClass(TICKET_PROPOSAL)
              : importeClassName,
            "pt-0.5 text-right",
          )}
        >
          {saleOpFmt.format(resolvedFinalTotal)}
        </span>
      ) : (
        <span aria-hidden className="block" />
      )}
    </div>
  )
}
