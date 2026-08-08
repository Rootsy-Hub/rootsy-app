"use client"

import type { MesasRightPanelView } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { SaleOperationPanelTabs } from "@/components/sale-operation/SaleOperationPanelTabs"
import { ShoppingBag, UtensilsCrossed } from "lucide-react"

type Props = {
  value: MesasRightPanelView
  onChange: (view: MesasRightPanelView) => void
  pedidoDisabled?: boolean
}

export function MesasRightPanelTabs({
  value,
  onChange,
  pedidoDisabled,
}: Props) {
  return (
    <SaleOperationPanelTabs
      value={value}
      onChange={onChange}
      ariaLabel="Mesa y pedido"
      tabs={[
        { id: "session", label: "Mesa", icon: UtensilsCrossed },
        {
          id: "cart",
          label: "Pedido",
          icon: ShoppingBag,
          disabled: pedidoDisabled,
        },
      ]}
    />
  )
}
