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
}

export function MostradorCartTicketGroup({
  group,
  renderRow,
  compactLayout = false,
  importeClassName,
  discountBadgeClassName,
}: Props) {
  const hasPromoHeader = Boolean(group.promoLabel?.trim())
  const variant = group.promoVariant ?? "promotion"
  const isDiscount = variant === "discount"

  if (!hasPromoHeader) {
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
        isDiscount
          ? "border-l-[3px] border-l-emerald-400"
          : "border-l-[3px] border-l-violet-400",
      )}
      aria-label={`Grupo: ${group.promoLabel}`}
    >
      <MostradorCartPromoBanner
        label={group.promoLabel!}
        variant={variant}
        discountMode={group.promoDiscountMode}
        pricing={group.groupPricing}
        compactLayout={compactLayout}
        importeClassName={importeClassName}
        discountBadgeClassName={discountBadgeClassName}
      />
      {group.rows.map((row) => (
        <div key={row.rowKey}>{renderRow(row)}</div>
      ))}
    </section>
  )
}
