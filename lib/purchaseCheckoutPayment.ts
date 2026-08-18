import type { CheckoutCheckDetails } from "@/lib/checkoutCheck"
import {
  operationPaymentKindLabel,
  type OperationPaymentKind,
} from "@/lib/operationPaymentKinds"
import { SUPPLIER_ACCOUNT_PAYMENT_LABEL } from "@/lib/operationPaymentLabels"
import { paymentCheckoutKindIcon } from "@/lib/paymentMethodCheckout"
import type { SaleToolboxPaymentDisplay } from "@/lib/saleCheckoutPayment"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"
import type { LucideIcon } from "lucide-react"
import { BookOpen } from "lucide-react"

export type PurchaseCheckoutPaymentSelection = {
  kind: OperationPaymentKind
  treasuryAccountId: string
  label: string
  checkDetails?: CheckoutCheckDetails
}

/** Tipos visibles en el paso 1 del checkout de compra. */
export const PURCHASE_CHECKOUT_KINDS: OperationPaymentKind[] = [
  "cash",
  "transfer",
  "card_credit",
  "check",
]

export function purchaseCheckoutKindLabel(kind: OperationPaymentKind): string {
  return operationPaymentKindLabel(kind)
}

export function purchaseCheckoutKindHasDestinationStep(
  kind: OperationPaymentKind,
  context: TreasuryPaymentContext,
): boolean {
  if (kind === "cash") {
    return context.cashTreasuryAccounts.length > 1
  }
  if (kind === "card_credit") {
    return context.payTreasuryAccounts.length > 1
  }
  if (kind === "transfer") {
    return context.bankTreasuryAccounts.length > 1
  }
  return false
}

export function getPurchaseCheckoutDestinations(
  kind: OperationPaymentKind,
  context: TreasuryPaymentContext,
): { id: string; name: string }[] {
  if (kind === "cash") {
    return context.cashTreasuryAccounts
  }
  if (kind === "card_credit") {
    return context.payTreasuryAccounts
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
    ...context.cashTreasuryAccounts,
    ...context.bankTreasuryAccounts,
    ...context.payTreasuryAccounts,
  ]
  return all.find((a) => a.id === treasuryAccountId)?.name ?? null
}

export function buildPurchaseCheckoutPaymentSelection(
  kind: OperationPaymentKind,
  treasuryAccountId: string,
  context: TreasuryPaymentContext,
  destinationName?: string,
): PurchaseCheckoutPaymentSelection {
  if (kind === "cash") {
    const cashCount = context.cashTreasuryAccounts.length
    const name =
      destinationName?.trim() ||
      findTreasuryName(context, treasuryAccountId) ||
      operationPaymentKindLabel("cash")
    return {
      kind: "cash",
      treasuryAccountId,
      label: cashCount > 1 ? name : operationPaymentKindLabel("cash"),
    }
  }
  const name =
    destinationName?.trim() ||
    findTreasuryName(context, treasuryAccountId) ||
    "—"
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

export function defaultPurchaseCheckoutPaymentSelection(
  context: TreasuryPaymentContext,
): PurchaseCheckoutPaymentSelection | null {
  if (context.cashTreasuryAccounts.length !== 1) return null
  const cash = context.cashTreasuryAccounts[0]!
  return buildPurchaseCheckoutPaymentSelection("cash", cash.id, context, cash.name)
}

export function purchaseCheckoutKindAvailabilityError(
  kind: OperationPaymentKind,
  context: TreasuryPaymentContext,
): string | null {
  if (kind === "cash") {
    if (context.cashTreasuryAccounts.length === 0) {
      return "Configurá una caja de efectivo en Cuentas."
    }
    return null
  }
  if (kind === "card_credit") {
    if (context.payTreasuryAccounts.length === 0) {
      return "Agregá una tarjeta corporativa desde Cuentas para pagar con crédito."
    }
    return null
  }
  if (kind === "transfer") {
    if (context.bankTreasuryAccounts.length === 0) {
      return "Configurá una cuenta banco o billetera en Cuentas."
    }
    return null
  }
  if (kind === "check") {
    if (!context.checkPayableTreasuryAccountId) {
      return "Faltan las cuentas de cheques. Recargá la página o contactá a soporte."
    }
    return null
  }
  return null
}

export function isPurchasePaymentSelectionValid(
  selection: PurchaseCheckoutPaymentSelection,
  context: TreasuryPaymentContext,
): boolean {
  if (selection.kind === "check") {
    return (
      Boolean(context.checkPayableTreasuryAccountId) &&
      selection.treasuryAccountId === context.checkPayableTreasuryAccountId &&
      Boolean(selection.checkDetails)
    )
  }
  const destinations = getPurchaseCheckoutDestinations(selection.kind, context)
  return destinations.some((d) => d.id === selection.treasuryAccountId)
}

/** Etiquetas del slot Pago en toolbox operar — mismo criterio que Vender / Cobrar servicios. */
export function resolvePurchaseToolboxPaymentDisplay(input: {
  payOnSupplierAccount: boolean
  metodoPagoSeleccionado: PurchaseCheckoutPaymentSelection | null
  treasuryPaymentContext: TreasuryPaymentContext | null
  emptyLabel?: string
}): SaleToolboxPaymentDisplay {
  const emptyLabel = input.emptyLabel ?? "Elegir forma de pago"

  if (input.payOnSupplierAccount) {
    return {
      pagoLabel: SUPPLIER_ACCOUNT_PAYMENT_LABEL,
      pagoSubLabel: null,
      pagoIcon: BookOpen,
    }
  }

  const selection = input.metodoPagoSeleccionado
  if (!selection) {
    return { pagoLabel: emptyLabel, pagoSubLabel: null, pagoIcon: undefined }
  }

  const kindLabel = operationPaymentKindLabel(selection.kind)
  const pagoIcon: LucideIcon = paymentCheckoutKindIcon(selection.kind)
  const context = input.treasuryPaymentContext

  if (selection.kind === "check") {
    return {
      pagoLabel: selection.label,
      pagoSubLabel: kindLabel,
      pagoIcon,
    }
  }

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
    ...context.payTreasuryAccounts,
  ].find((account) => account.id === selection.treasuryAccountId)?.name ?? null

  if (selection.kind === "cash" && context.cashTreasuryAccounts.length <= 1) {
    return { pagoLabel: kindLabel, pagoSubLabel: null, pagoIcon }
  }

  if (destinationName) {
    return { pagoLabel: destinationName, pagoSubLabel: kindLabel, pagoIcon }
  }

  return { pagoLabel: selection.label, pagoSubLabel: kindLabel, pagoIcon }
}
