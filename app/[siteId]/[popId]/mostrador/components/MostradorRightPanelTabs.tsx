"use client"

import type { MostradorRightPanelView } from "@/app/[siteId]/[popId]/mostrador/mostradorTypes"
import { SaleOperationPanelTabs } from "@/components/sale-operation/SaleOperationPanelTabs"
import { ClipboardList, ShoppingBag } from "lucide-react"

type Props = {
  value: MostradorRightPanelView
  onChange: (view: MostradorRightPanelView) => void
  cartDisabled?: boolean
}

export function MostradorRightPanelTabs({
  value,
  onChange,
  cartDisabled,
}: Props) {
  return (
    <SaleOperationPanelTabs
      value={value}
      onChange={onChange}
      ariaLabel="Datos y carrito"
      tabs={[
        { id: "detail", label: "Datos", icon: ClipboardList },
        {
          id: "cart",
          label: "Carrito",
          icon: ShoppingBag,
          disabled: cartDisabled,
        },
      ]}
    />
  )
}
