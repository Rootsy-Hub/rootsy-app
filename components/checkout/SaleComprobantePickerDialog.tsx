"use client"

import { CheckoutOptionCard } from "@/components/checkout/CheckoutOptionCard"
import {
  SaleComprobanteTicketPreview,
  type SaleComprobantePreviewInput,
} from "@/components/checkout/SaleComprobanteTicketPreview"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSaleComprobanteEmitterContext } from "@/hooks/useSaleComprobanteEmitterContext"
import {
  type SaleComprobantePickerOption,
} from "@/lib/saleComprobantePicker"
import { cn } from "@/lib/utils"
import {
  saleOpDialogBody,
  saleOpDialogContentComprobante,
  saleOpDialogFooter,
  saleOpDialogHeader,
  saleOpDialogPrimaryBtn,
  saleOpDialogSecondaryBtn,
} from "@/components/sale-operation/saleOperationStyles"
import { FileText, Receipt, ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  context?: "venta" | "mesa" | "pedido"
  options: SaleComprobantePickerOption[]
  value: string | null
  onSelect: (value: string | null) => void
  previewInput?: SaleComprobantePreviewInput | null
  cashRegisterId?: string | null
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
  cashRegisterId = null,
}: Props) {
  const [draft, setDraft] = useState<string | null>(value)

  const { emitter, loading, error } = useSaleComprobanteEmitterContext(
    previewInput?.popId ?? "",
    open && previewInput != null,
    cashRegisterId,
  )

  useEffect(() => {
    if (!open) return
    setDraft(value)
  }, [open, value])

  const handleConfirm = () => {
    onSelect(draft)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={saleOpDialogContentComprobante}>
        <DialogHeader className={cn(saleOpDialogHeader, "shrink-0")}>
          <DialogTitle className="text-base font-semibold tracking-tight">
            Comprobante
          </DialogTitle>
        </DialogHeader>

        <div
          className={cn(
            saleOpDialogBody,
            "grid min-h-0 flex-1 gap-4 overflow-hidden lg:grid-cols-2",
          )}
        >
          <div className="min-h-0 min-w-0 overflow-y-auto overscroll-contain">
            <ul
              className="flex flex-col gap-2"
              role="listbox"
              aria-label="Tipos de comprobante"
            >
              {options.map((opt) => {
                const selected = isOptionSelected(opt, draft)
                return (
                  <li key={opt.label}>
                    <CheckoutOptionCard
                      title={opt.label}
                      selected={selected}
                      onClick={() => setDraft(optionValue(opt))}
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
            previewComprobanteLabel={draft}
            loading={loading}
            error={error}
            className="hidden min-w-0 lg:flex"
          />
        </div>

        <div className="px-6 pb-4 lg:hidden">
          <SaleComprobanteTicketPreview
            previewInput={previewInput}
            emitter={emitter}
            previewComprobanteLabel={draft}
            loading={loading}
            error={error}
            className="max-h-[280px]"
          />
        </div>

        <DialogFooter className={saleOpDialogFooter}>
          <Button
            type="button"
            variant="ghost-neutral"
            className={saleOpDialogSecondaryBtn}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className={saleOpDialogPrimaryBtn}
            onClick={handleConfirm}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
