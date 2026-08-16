import {
  operationPaymentKindLabel,
  type OperationPaymentKind,
} from "@/lib/operationPaymentKinds"
import { CLIENT_ACCOUNT_PAYMENT_LABEL } from "@/lib/operationPaymentLabels"
import { paymentCheckoutKindIcon } from "@/lib/paymentMethodCheckout"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"
import type { LucideIcon } from "lucide-react"
import { BookOpen } from "lucide-react"

export type SaleCheckoutPaymentSelection = {
  kind: OperationPaymentKind
  treasuryAccountId: string
  label: string
}

/** Tipos visibles en el paso 1 del checkout de venta. */
export const SALE_CHECKOUT_KINDS: OperationPaymentKind[] = [
  "cash",
  "card_debit",
  "card_credit",
  "transfer",
]

export function checkoutKindLabel(kind: OperationPaymentKind): string {
  return operationPaymentKindLabel(kind)
}

export function checkoutKindHasDestinationStep(
  kind: OperationPaymentKind,
  context: TreasuryPaymentContext,
): boolean {
  if (kind === "cash") return false
  if (kind === "card_debit" || kind === "card_credit") {
    return context.posTreasuryAccounts.length > 1
  }
  if (kind === "transfer") {
    return context.bankTreasuryAccounts.length > 1
  }
  return false
}

export function getCheckoutDestinations(
  kind: OperationPaymentKind,
  context: TreasuryPaymentContext,
): { id: string; name: string }[] {
  if (kind === "card_debit" || kind === "card_credit") {
    return context.posTreasuryAccounts
  }
  if (kind === "transfer") {
    return context.bankTreasuryAccounts
  }
  return []
}

function findTreasuryName(
  context: TreasuryPaymentContext,
  treasuryAccountId: string,
): string | null {
  const all = [
    ...context.bankTreasuryAccounts,
    ...context.posTreasuryAccounts,
  ]
  return all.find((a) => a.id === treasuryAccountId)?.name ?? null
}

export function buildCheckoutPaymentSelection(
  kind: OperationPaymentKind,
  treasuryAccountId: string,
  context: TreasuryPaymentContext,
  destinationName?: string,
): SaleCheckoutPaymentSelection {
  if (kind === "cash") {
    return {
      kind: "cash",
      treasuryAccountId,
      label: operationPaymentKindLabel("cash"),
    }
  }
  const name =
    destinationName?.trim() ||
    findTreasuryName(context, treasuryAccountId) ||
    "—"
  if (kind === "card_debit") {
    return {
      kind,
      treasuryAccountId,
      label: `${name} · Débito`,
    }
  }
  if (kind === "card_credit") {
    return {
      kind,
      treasuryAccountId,
      label: `${name} · Crédito`,
    }
  }
  if (kind === "transfer") {
    return {
      kind,
      treasuryAccountId,
      label: name,
    }
  }
  return {
    kind,
    treasuryAccountId,
    label: operationPaymentKindLabel(kind),
  }
}

export function defaultCheckoutPaymentSelection(
  cashTreasuryAccountId: string | null,
): SaleCheckoutPaymentSelection | null {
  if (!cashTreasuryAccountId) return null
  return {
    kind: "cash",
    treasuryAccountId: cashTreasuryAccountId,
    label: operationPaymentKindLabel("cash"),
  }
}

export function checkoutKindAvailabilityError(
  kind: OperationPaymentKind,
  context: TreasuryPaymentContext,
  cashTreasuryAccountId: string | null,
): string | null {
  if (kind === "cash") {
    if (!cashTreasuryAccountId) {
      return "La caja abierta no tiene cuenta de efectivo configurada."
    }
    return null
  }
  if (kind === "card_debit" || kind === "card_credit") {
    if (context.posTreasuryAccounts.length === 0) {
      return "Agregá un terminal POS desde Cuentas para cobrar con tarjeta."
    }
    return null
  }
  if (kind === "transfer") {
    if (context.bankTreasuryAccounts.length === 0) {
      return "Configurá una cuenta banco o billetera en Cuentas."
    }
    return null
  }
  return null
}

export type SaleToolboxPaymentDisplay = {
  pagoLabel: string
  pagoSubLabel: string | null
  pagoIcon?: LucideIcon
}

type SaleToolboxPaymentSelection = {
  kind: OperationPaymentKind
  treasuryAccountId: string
  label: string
}

/** Etiquetas del slot Pago en toolbox operar — mismo criterio que Cobrar servicios. */
export function resolveSaleToolboxPaymentDisplay(input: {
  payOnClientAccount: boolean
  metodoPagoSeleccionado: SaleToolboxPaymentSelection | null
  treasuryPaymentContext: TreasuryPaymentContext | null
  emptyLabel?: string
}): SaleToolboxPaymentDisplay {
  const emptyLabel = input.emptyLabel ?? "Elegir forma de pago"

  if (input.payOnClientAccount) {
    return {
      pagoLabel: CLIENT_ACCOUNT_PAYMENT_LABEL,
      pagoSubLabel: null,
      pagoIcon: BookOpen,
    }
  }

  const selection = input.metodoPagoSeleccionado
  if (!selection) {
    return { pagoLabel: emptyLabel, pagoSubLabel: null, pagoIcon: undefined }
  }

  const kindLabel = operationPaymentKindLabel(selection.kind)
  const pagoIcon = paymentCheckoutKindIcon(selection.kind)
  const context = input.treasuryPaymentContext

  if (!context) {
    return {
      pagoLabel: selection.label,
      pagoSubLabel: kindLabel,
      pagoIcon,
    }
  }

  const destinationName = [
    ...context.cashTreasuryAccounts,
    ...context.bankTreasuryAccounts,
    ...context.posTreasuryAccounts,
  ].find((account) => account.id === selection.treasuryAccountId)?.name ?? null

  if (selection.kind === "cash" && context.cashTreasuryAccounts.length <= 1) {
    return { pagoLabel: kindLabel, pagoSubLabel: null, pagoIcon }
  }

  if (destinationName) {
    return { pagoLabel: destinationName, pagoSubLabel: kindLabel, pagoIcon }
  }

  return { pagoLabel: selection.label, pagoSubLabel: kindLabel, pagoIcon }
}
