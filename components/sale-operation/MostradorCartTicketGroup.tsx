"use client"

import { MostradorCartPromoBanner } from "@/components/sale-operation/MostradorCartPromoBanner"
import type { MostradorCartDisplayGroup } from "@/lib/mostradorCartDisplay"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  group: MostradorCartDisplayGroup
  renderRow: (row: MostradorCartDisplayGroup["rows"][number]) => ReactNode
  compactLayout?: boolean
}

export function MostradorCartTicketGroup({
  group,
  renderRow,
  compactLayout = false,
}: Props) {
  const hasPromoHeader = Boolean(group.promoLabel?.trim())
  const variant = group.promoVariant ?? "promotion"
  const isDiscount = variant === "discount"

  if (!hasPromoHeader) {
    return (
      <>
        {group.rows.map((row) => (
          <div key={row.rowKey} className="border-b border-slate-200/90">
            {renderRow(row)}
          </div>
        ))}
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
      aria-label={`Grupo: ${group.promoLabel}`}
    >
      {isDiscount ? (
        <>
          <MostradorCartPromoBanner
            label={group.promoLabel!}
            variant={variant}
            discountMode={group.promoDiscountMode}
            pricing={group.groupPricing}
            compactLayout={compactLayout}
          />
          <div className="bg-gradient-to-b from-emerald-50/35 to-white">
            {group.rows.map((row, index) => (
              <div
                key={row.rowKey}
                className={cn(
                  index > 0 && "border-t border-dashed border-emerald-200/70",
                )}
              >
                {renderRow(row)}
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <MostradorCartPromoBanner
            label={group.promoLabel!}
            variant={variant}
            discountMode={group.promoDiscountMode}
            pricing={group.groupPricing}
            compactLayout={compactLayout}
          />
          <div className="bg-gradient-to-b from-violet-50/35 to-white">
            {group.rows.map((row, index) => (
              <div
                key={row.rowKey}
                className={cn(
                  index > 0 && "border-t border-dashed border-violet-200/70",
                )}
              >
                {renderRow(row)}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
