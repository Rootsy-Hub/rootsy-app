import type { CheckoutCheckDetails } from "@/lib/checkoutCheck"
import {
  operationPaymentKindLabel,
  type OperationPaymentKind,
} from "@/lib/operationPaymentKinds"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"

export type ServiceChargeCheckoutPaymentSelection = {
  kind: OperationPaymentKind
  treasuryAccountId: string
  label: string
  checkDetails?: CheckoutCheckDetails
}

/** Tipos visibles al cobrar un servicio (sin caja abierta obligatoria). */
export const SERVICE_CHARGE_CHECKOUT_KINDS: OperationPaymentKind[] = [
  "cash",
  "card_debit",
  "card_credit",
  "transfer",
  "check",
]

function findTreasuryName(
  context: TreasuryPaymentContext,
  treasuryAccountId: string,
): string | null {
  const all = [
    ...context.cashTreasuryAccounts,
    ...context.bankTreasuryAccounts,
    ...context.posTreasuryAccounts,
  ]
  return all.find((a) => a.id === treasuryAccountId)?.name ?? null
}

export function serviceChargeCheckoutKindHasDestinationStep(
  kind: OperationPaymentKind,
  context: TreasuryPaymentContext,
): boolean {
  if (kind === "cash") {
    return context.cashTreasuryAccounts.length > 1
  }
  if (kind === "card_debit" || kind === "card_credit") {
    return context.posTreasuryAccounts.length > 1
  }
  if (kind === "transfer") {
    return context.bankTreasuryAccounts.length > 1
  }
  return false
}

export function getServiceChargeCheckoutDestinations(
  kind: OperationPaymentKind,
  context: TreasuryPaymentContext,
): { id: string; name: string }[] {
  if (kind === "cash") {
    return context.cashTreasuryAccounts
  }
  if (kind === "card_debit" || kind === "card_credit") {
    return context.posTreasuryAccounts
  }
  if (kind === "transfer") {
    return context.bankTreasuryAccounts
  }
  return []
}

export function buildServiceChargeCheckoutPaymentSelection(
  kind: OperationPaymentKind,
  treasuryAccountId: string,
  context: TreasuryPaymentContext,
  destinationName?: string,
): ServiceChargeCheckoutPaymentSelection {
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

export function serviceChargeCheckoutKindAvailabilityError(
  kind: OperationPaymentKind,
  context: TreasuryPaymentContext,
): string | null {
  if (kind === "cash") {
    if (context.cashTreasuryAccounts.length === 0) {
      return "Configurá una caja de efectivo en Cuentas."
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
  if (kind === "check") {
    if (!context.checkReceivableTreasuryAccountId) {
      return "Faltan las cuentas de cheques. Recargá la página o contactá a soporte."
    }
    return null
  }
  return null
}

export function resolveServiceChargePaymentKindSelection(
  kind: OperationPaymentKind,
  context: TreasuryPaymentContext,
):
  | { action: "select"; selection: ServiceChargeCheckoutPaymentSelection }
  | { action: "destination"; kind: OperationPaymentKind }
  | { action: "error"; message: string } {
  const availabilityError = serviceChargeCheckoutKindAvailabilityError(
    kind,
    context,
  )
  if (availabilityError) {
    return { action: "error", message: availabilityError }
  }

  if (kind === "check" && context.checkReceivableTreasuryAccountId) {
    return {
      action: "select",
      selection: buildServiceChargeCheckoutPaymentSelection(
        "check",
        context.checkReceivableTreasuryAccountId,
        context,
      ),
    }
  }

  const destinations = getServiceChargeCheckoutDestinations(kind, context)
  if (destinations.length === 1) {
    const dest = destinations[0]!
    return {
      action: "select",
      selection: buildServiceChargeCheckoutPaymentSelection(
        kind,
        dest.id,
        context,
        dest.name,
      ),
    }
  }

  if (serviceChargeCheckoutKindHasDestinationStep(kind, context)) {
    return { action: "destination", kind }
  }

  const dest = destinations[0]
  if (!dest) {
    return { action: "error", message: "No hay cuentas disponibles para este medio." }
  }

  return {
    action: "select",
    selection: buildServiceChargeCheckoutPaymentSelection(
      kind,
      dest.id,
      context,
      dest.name,
    ),
  }
}
