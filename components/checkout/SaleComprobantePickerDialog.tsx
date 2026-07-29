"use client"

import { CheckoutOptionCard } from "@/components/checkout/CheckoutOptionCard"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  type SaleComprobantePickerOption,
} from "@/lib/saleComprobantePicker"
import { cn } from "@/lib/utils"
import {
  saleOpDialogBody,
  saleOpDialogContentMd,
  saleOpDialogHeader,
} from "@/components/sale-operation/saleOperationStyles"
import { FileText, Receipt, ShieldCheck } from "lucide-react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  context?: "venta" | "mesa" | "pedido"
  options: SaleComprobantePickerOption[]
  value: string | null
  onSelect: (value: string | null) => void
}

function comprobanteIcon(kind: SaleComprobantePickerOption["kind"]) {
  switch (kind) {
    case "none":
      return Receipt
    case "internal":
      return FileText
    default:
      return ShieldCheck
  }
}

export function SaleComprobantePickerDialog({
  open,
  onOpenChange,
  context = "venta",
  options,
  value,
  onSelect,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={saleOpDialogContentMd}>
        <DialogHeader className={cn(saleOpDialogHeader, "shrink-0")}>
          <DialogTitle className="text-base font-semibold tracking-tight">
            Comprobante
          </DialogTitle>
        </DialogHeader>

        <div
          className={cn(
            saleOpDialogBody,
            "min-h-0 flex-1 overflow-y-auto overscroll-contain",
          )}
        >
          <ul className="flex flex-col gap-2" role="listbox" aria-label="Tipos de comprobante">
            {options.map((opt) => {
              const selected =
                opt.kind === "none" ? value == null : value === opt.label
              return (
                <li key={opt.label}>
                  <CheckoutOptionCard
                    title={opt.label}
                    selected={selected}
                    onClick={() => {
                      onSelect(opt.kind === "none" ? null : opt.label)
                      onOpenChange(false)
                    }}
                    icon={comprobanteIcon(opt.kind)}
                    trailing={selected ? "check" : "none"}
                  />
                </li>
              )
            })}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
