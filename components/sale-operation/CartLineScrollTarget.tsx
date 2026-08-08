"use client"

import { useCartLineScrollHighlight } from "@/hooks/useCartListScrollHighlight"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  lineId: string
  children: ReactNode
  className?: string
}

/** Ancla de scroll + pulso al agregar ítems al pedido. */
export function CartLineScrollTarget({ lineId, children, className }: Props) {
  const { highlighted, highlightTick } = useCartLineScrollHighlight(lineId)

  return (
    <div
      data-cart-line-id={lineId}
      className={cn("relative", className)}
    >
      {highlighted ? (
        <div
          key={highlightTick}
          className="cart-line-added-pulse pointer-events-none absolute inset-0 z-[1]"
          aria-hidden
        />
      ) : null}
      {children}
    </div>
  )
}
