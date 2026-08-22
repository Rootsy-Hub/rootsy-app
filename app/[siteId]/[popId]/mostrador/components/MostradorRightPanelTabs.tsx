"use client"

import type { MostradorRightPanelView } from "@/app/[siteId]/[popId]/mostrador/mostradorTypes"
import { SaleOperationPanelTabs } from "@/components/sale-operation/SaleOperationPanelTabs"
import { ClipboardList, ShoppingBag } from "lucide-react"

type Props = {
  value: MostradorRightPanelView
  onChange: (view: MostradorRightPanelView) => void
  cartDisabled?: boolean
  orderLabel?: string | null
}

export function MostradorRightPanelTabs({
  value,
  onChange,
  cartDisabled,
  orderLabel,
}: Props) {
  return (
    <SaleOperationPanelTabs
      value={value}
      onChange={onChange}
      ariaLabel="Datos y pedido"
      variant="operar"
      tabs={[
        {
          id: "detail",
          label: "Datos",
          icon: ClipboardList,
          suffix: orderLabel ?? undefined,
        },
        {
          id: "cart",
          label: "Pedido",
          icon: ShoppingBag,
          disabled: cartDisabled,
        },
      ]}
    />
  )
}
