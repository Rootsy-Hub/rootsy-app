"use client"

import { RootsIconButton } from "@/components/rootsy-button"
import { Percent } from "lucide-react"

export type SaleOperationDiscountHeaderControl = {
  disabled: boolean
  active: boolean
  title?: string
  onClick: () => void
}

export function SaleOperationDiscountHeaderButton({
  disabled = false,
  active = false,
  title,
  onClick,
}: {
  disabled?: boolean
  active?: boolean
  title?: string
  onClick: () => void
}) {
  const hasValue = Boolean(active && title && title !== "Sin descuento")
  const label = hasValue ? `Descuento general · ${title}` : "Descuento general"

  return (
    <RootsIconButton
      label={label}
      semantic={active ? "primary" : "tertiary"}
      atmosphere="eter"
      size="default"
      disabled={disabled}
      title={label}
      onClick={onClick}
    >
      <Percent className="size-5" aria-hidden />
    </RootsIconButton>
  )
}
