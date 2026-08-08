"use client"

import { CheckoutOptionCard } from "@/components/checkout/CheckoutOptionCard"
import {
  SaleComprobanteTicketPreview,
  type SaleComprobantePreviewInput,
} from "@/components/checkout/SaleComprobanteTicketPreview"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { Dialog } from "@/components/ui/dialog"
import { useSaleComprobanteEmitterContext } from "@/hooks/useSaleComprobanteEmitterContext"
import {
  getSaleComprobantePickerOptions,
  type SaleComprobantePickerOption,
} from "@/lib/saleComprobantePicker"
import { isSaleComprobanteAllowed } from "@/lib/saleComprobanteRules"
import { FileText, Receipt, ShieldCheck } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

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

  const isLoadingFiscal = open && previewInput != null && loading

  const visibleOptions = useMemo((): SaleComprobantePickerOption[] => {
    const siteId = previewInput?.siteId
    const nonLegal = options.filter(
      (opt) => opt.kind === "none" || opt.kind === "internal",
    )

    if (!siteId) {
      if (loading) return nonLegal
      if (!emitter) return options
      return options.filter((opt) => {
        if (opt.kind === "none" || opt.kind === "internal") return true
        return isSaleComprobanteAllowed(
          opt.label,
          emitter.ivaCondition,
          emitter.hasValidFiscalCuit,
        )
      })
    }

    if (loading) return nonLegal

    if (emitter) {
      return getSaleComprobantePickerOptions(
        siteId,
        emitter.ivaCondition,
        emitter.hasValidFiscalCuit,
      )
    }

    return options
  }, [options, emitter, loading, previewInput?.siteId])

  useEffect(() => {
    if (!open) return
    setDraft(value)
  }, [open, value])

  useEffect(() => {
    if (!open || loading || !emitter) return
    if (
      draft != null &&
      !isSaleComprobanteAllowed(
        draft,
        emitter.ivaCondition,
        emitter.hasValidFiscalCuit,
      )
    ) {
      setDraft(null)
    }
  }, [open, draft, emitter, loading])

  const handleConfirm = () => {
    onSelect(draft)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="twoCol" className="flex flex-col sm:!max-w-2xl">
        <RootsDialogHeader title="Comprobante" />

        <RootsDialogBody className="!overflow-hidden grid min-h-0 flex-1 gap-4 lg:min-h-[420px] lg:grid-cols-2">
          <div className="relative min-h-0 min-w-0 overflow-y-auto overscroll-contain">
            {isLoadingFiscal ? (
              <div
                className="flex min-h-[200px] flex-col items-center justify-center gap-3 py-8"
                aria-live="polite"
                aria-busy="true"
              >
                <RootsSpinner size="default" label="Cargando comprobantes" />
                <span className="text-sm text-[var(--rootsy-bruma-500)]">
                  Cargando comprobantes…
                </span>
              </div>
            ) : (
              <ul
                className="flex flex-col gap-2"
                role="listbox"
                aria-label="Tipos de comprobante"
              >
                {visibleOptions.map((opt) => {
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
            )}
          </div>

          <SaleComprobanteTicketPreview
            previewInput={previewInput}
            emitter={emitter}
            previewComprobanteLabel={draft}
            loading={loading}
            error={error}
            className="hidden min-h-0 min-w-0 lg:flex lg:flex-col"
          />
        </RootsDialogBody>

        <div className="border-t border-[var(--rootsy-bruma-200)] px-[var(--rootsy-space-400)] pb-[var(--rootsy-space-200)] pt-[var(--rootsy-space-200)] lg:hidden">
          <SaleComprobanteTicketPreview
            previewInput={previewInput}
            emitter={emitter}
            previewComprobanteLabel={draft}
            loading={loading}
            error={error}
            className="max-h-[280px]"
          />
        </div>

        <RootsDialogDualActionFooter
          onCancel={() => onOpenChange(false)}
          cancelLabel="Cancelar"
          onConfirm={handleConfirm}
          confirmLabel="Confirmar"
        />
      </RootsDialogContent>
    </Dialog>
  )
}
