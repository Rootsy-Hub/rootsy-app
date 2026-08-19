"use client"

import { MostradorCartPromoBanner } from "@/components/sale-operation/MostradorCartPromoBanner"
import type { MostradorCartDisplayGroup } from "@/lib/mostradorCartDisplay"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  group: MostradorCartDisplayGroup
  renderRow: (row: MostradorCartDisplayGroup["rows"][number]) => ReactNode
  compactLayout?: boolean
  importeClassName?: string
  discountBadgeClassName?: string
  variant?: "legacy" | "operar"
}

export function MostradorCartTicketGroup({
  group,
  renderRow,
  compactLayout = false,
  importeClassName,
  discountBadgeClassName,
  variant: lineVariant = "operar",
}: Props) {
  const hasPromoHeader = Boolean(group.promoLabel?.trim())
  const promoVariant = group.promoVariant ?? "promotion"
  const isDiscount = promoVariant === "discount"
  const hideOperarPromoBanner =
    lineVariant === "operar" &&
    (promoVariant === "discount" ||
      (group.rows.length > 0 &&
        group.rows.every((row) => Boolean(row.quantityDealApplicationId))))

  if (!hasPromoHeader || hideOperarPromoBanner) {
    return (
      <>
        {group.rows.map((row) => (
          <div key={row.rowKey}>{renderRow(row)}</div>
        ))}
      </>
    )
  }

  return (
    <section
      className={cn(
        lineVariant === "legacy" &&
          (isDiscount
            ? "border-l-[3px] border-l-emerald-400"
            : "border-l-[3px] border-l-violet-400"),
      )}
      aria-label={`Grupo: ${group.promoLabel}`}
    >
      <MostradorCartPromoBanner
        label={group.promoLabel!}
        promoVariant={promoVariant}
        discountMode={group.promoDiscountMode}
        pricing={group.groupPricing}
        compactLayout={compactLayout}
        importeClassName={importeClassName}
        discountBadgeClassName={discountBadgeClassName}
        lineVariant={lineVariant}
      />
      {group.rows.map((row) => (
        <div key={row.rowKey}>{renderRow(row)}</div>
      ))}
    </section>
  )
}
