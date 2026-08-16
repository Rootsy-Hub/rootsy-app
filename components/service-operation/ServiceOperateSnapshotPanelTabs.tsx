"use client"

import { SaleOperationPanelTabs } from "@/components/sale-operation/SaleOperationPanelTabs"
import { ClipboardList, Receipt } from "lucide-react"

export type ServiceOperateSnapshotPanelView = "config" | "cargo"

type Props = {
  value: ServiceOperateSnapshotPanelView
  onChange: (view: ServiceOperateSnapshotPanelView) => void
  cargoDisabled?: boolean
}

export function ServiceOperateSnapshotPanelTabs({
  value,
  onChange,
  cargoDisabled,
}: Props) {
  return (
    <SaleOperationPanelTabs
      value={value}
      onChange={onChange}
      ariaLabel="Configuración y resumen"
      variant="operar"
      tabs={[
        { id: "config", label: "Configuración", icon: ClipboardList },
        {
          id: "cargo",
          label: "Resumen",
          icon: Receipt,
          disabled: cargoDisabled,
        },
      ]}
    />
  )
}
