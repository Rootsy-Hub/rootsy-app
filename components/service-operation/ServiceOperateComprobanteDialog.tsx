"use client"

import {
  SERVICE_CHARGE_COMPROBANTE_AUTO,
} from "@/app/[siteId]/[popId]/active-services/serviceChargeCreateFormState"
import { CheckoutOptionCard } from "@/components/checkout/CheckoutOptionCard"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { Dialog } from "@/components/ui/dialog"
import {
  getSaleComprobanteOptionHint,
  SALE_COMPROBANTE_SIN_LABEL,
  type SaleComprobantePickerOption,
} from "@/lib/saleComprobantePicker"
import { FileText, Receipt, ShieldCheck } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  options: SaleComprobantePickerOption[]
  suggestedComprobante: string | null
  value: string
  onChange: (comprobanteLabel: string) => void
}

function comprobanteIcon(kind: SaleComprobantePickerOption["kind"]): LucideIcon {
  switch (kind) {
    case "none":
      return Receipt
    case "internal":
      return FileText
    default:
      return ShieldCheck
  }
}

function isSelected(
  comprobanteLabel: string,
  optionValue: string,
): boolean {
  if (optionValue === SALE_COMPROBANTE_SIN_LABEL) {
    return !comprobanteLabel.trim()
  }
  if (optionValue === SERVICE_CHARGE_COMPROBANTE_AUTO) {
    return comprobanteLabel === SERVICE_CHARGE_COMPROBANTE_AUTO
  }
  return comprobanteLabel.trim() === optionValue
}

export function ServiceOperateComprobanteDialog({
  open,
  onOpenChange,
  options,
  suggestedComprobante,
  value,
  onChange,
}: Props) {
  const pickerOptions: Array<{ value: string; title: string; subtitle?: string; icon: LucideIcon }> =
    [
      {
        value: SALE_COMPROBANTE_SIN_LABEL,
        title: SALE_COMPROBANTE_SIN_LABEL,
        subtitle: "No se emite comprobante fiscal",
        icon: Receipt,
      },
      ...(suggestedComprobante
        ? [
            {
              value: SERVICE_CHARGE_COMPROBANTE_AUTO,
              title: `Según condición IVA (${suggestedComprobante})`,
              subtitle: "Se ajusta al cliente del cargo",
              icon: ShieldCheck,
            },
          ]
        : []),
      ...options
        .filter((option) => option.kind !== "none")
        .map((option) => ({
          value: option.label,
          title: option.label,
          subtitle: getSaleComprobanteOptionHint(option.kind),
          icon: comprobanteIcon(option.kind),
        })),
    ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="default">
        <RootsDialogHeader
          title="Comprobante"
          description="Elegí el tipo de comprobante para este cargo."
        />
        <RootsDialogBody>
          <ul className="flex flex-col gap-2" role="listbox" aria-label="Comprobantes">
            {pickerOptions.map((option) => (
              <li key={option.value}>
                <CheckoutOptionCard
                  title={option.title}
                  subtitle={option.subtitle}
                  selected={isSelected(value, option.value)}
                  onClick={() => {
                    if (option.value === SALE_COMPROBANTE_SIN_LABEL) {
                      onChange("")
                    } else if (option.value === SERVICE_CHARGE_COMPROBANTE_AUTO) {
                      onChange(SERVICE_CHARGE_COMPROBANTE_AUTO)
                    } else {
                      onChange(option.value)
                    }
                    onOpenChange(false)
                  }}
                  icon={option.icon}
                  trailing="none"
                />
              </li>
            ))}
          </ul>
        </RootsDialogBody>
      </RootsDialogContent>
    </Dialog>
  )
}
