import type { PaymentMethodKind, PaymentMethodUsage } from "@/app/[siteId]/[popId]/payment-methods/actions"

export const PAYMENT_KIND_LABELS: Record<PaymentMethodKind, string> = {
  cash: "Efectivo",
  card_debit: "Tarjeta débito",
  card_credit: "Tarjeta crédito",
  transfer: "Transferencia",
  other: "Otro",
}

export const PAYMENT_USAGE_LABELS: Record<PaymentMethodUsage, string> = {
  receive: "Solo cobrar",
  pay: "Solo pagar",
  both: "Cobrar y pagar",
}

export const PAYMENT_USAGE_OPTIONS: {
  value: PaymentMethodUsage
  label: string
  description: string
}[] = [
  {
    value: "receive",
    label: "Cobrar",
    description: "Aparece al vender (cobro a clientes).",
  },
  {
    value: "pay",
    label: "Pagar",
    description: "Aparece al comprar o registrar gastos.",
  },
  {
    value: "both",
    label: "Ambos",
    description: "Sirve para cobrar y para pagar.",
  },
]

export function paymentKindLabel(kind: PaymentMethodKind): string {
  return PAYMENT_KIND_LABELS[kind] ?? kind
}

export function paymentUsageLabel(usage: PaymentMethodUsage): string {
  return PAYMENT_USAGE_LABELS[usage] ?? usage
}
