"use client"

import { CheckoutOptionCard } from "@/components/checkout/CheckoutOptionCard"
import {
  SaleComprobanteTicketPreview,
  type SaleComprobantePreviewInput,
} from "@/components/checkout/SaleComprobanteTicketPreview"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { Dialog } from "@/components/ui/dialog"
import type { SaleComprobantePickerOption } from "@/lib/saleComprobantePicker"
import type { SaleComprobanteEmitterContext } from "@/lib/saleComprobantePreview"
import { FileText, Receipt, ShieldCheck } from "lucide-react"
import { useEffect } from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  context?: "venta" | "mesa" | "pedido"
  options: SaleComprobantePickerOption[]
  value: string | null
  onSelect: (value: string | null) => void
  previewInput?: SaleComprobantePreviewInput | null
  emitter?: SaleComprobanteEmitterContext | null
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

function optionValue(opt: SaleComprobantePickerOption): string | null {
  return opt.kind === "none" ? null : opt.label
}

function isOptionSelected(
  opt: SaleComprobantePickerOption,
  draft: string | null,
): boolean {
  return opt.kind === "none" ? draft == null : draft === opt.label
}

export function SaleComprobantePickerDialog({
  open,
  onOpenChange,
  options,
  value,
  onSelect,
  previewInput = null,
  emitter = null,
}: Props) {
  useEffect(() => {
    if (!open || value == null) return
    const allowed = options.some((opt) => opt.kind !== "none" && opt.label === value)
    if (!allowed) onSelect(null)
  }, [open, value, options, onSelect])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="twoCol" className="flex flex-col sm:!max-w-2xl">
        <RootsDialogHeader title="Comprobante" />

        <RootsDialogBody className="!overflow-hidden grid min-h-0 flex-1 gap-4 lg:min-h-[420px] lg:grid-cols-2">
          <div className="relative min-h-0 min-w-0 overflow-y-auto overscroll-contain">
            <ul
              className="flex flex-col gap-2"
              role="listbox"
              aria-label="Tipos de comprobante"
            >
              {options.map((opt) => {
                const selected = isOptionSelected(opt, value)
                return (
                  <li key={opt.label}>
                    <CheckoutOptionCard
                      title={opt.label}
                      selected={selected}
                      onClick={() => onSelect(optionValue(opt))}
                      icon={comprobanteIcon(opt.kind)}
                      trailing={selected ? "check" : "none"}
                    />
                  </li>
                )
              })}
            </ul>
          </div>

          <SaleComprobanteTicketPreview
            previewInput={previewInput}
            emitter={emitter}
            previewComprobanteLabel={value}
            className="hidden min-h-0 min-w-0 lg:flex lg:flex-col"
          />
        </RootsDialogBody>
      </RootsDialogContent>
    </Dialog>
  )
}
