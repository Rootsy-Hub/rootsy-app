"use client"

import type { MesasRightPanelView } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { SaleOperationPanelTabs } from "@/components/sale-operation/SaleOperationPanelTabs"
import { CalendarDays, ShoppingBag, UtensilsCrossed } from "lucide-react"

type Props = {
  value: MesasRightPanelView
  onChange: (view: MesasRightPanelView) => void
  pedidoDisabled?: boolean
  tableLabel?: string | null
}

export function MesasRightPanelTabs({
  value,
  onChange,
  pedidoDisabled,
  tableLabel,
}: Props) {
  return (
    <SaleOperationPanelTabs
      value={value}
      onChange={onChange}
      ariaLabel="Mesa y pedido"
      variant="operar"
      tabs={[
        {
          id: "session",
          label: "Mesa",
          icon: UtensilsCrossed,
          suffix: tableLabel ?? undefined,
        },
        { id: "agenda", label: "Agenda", icon: CalendarDays },
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
