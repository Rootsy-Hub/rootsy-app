import {
  operationPaymentKindLabel,
  type OperationPaymentKind,
} from "@/lib/operationPaymentKinds"
import {
  buildCheckoutPaymentSelection,
  checkoutKindAvailabilityError,
  checkoutKindHasDestinationStep,
  getCheckoutDestinations,
  SALE_CHECKOUT_KINDS,
} from "@/lib/saleCheckoutPayment"
import {
  buildPurchaseCheckoutPaymentSelection,
  getPurchaseCheckoutDestinations,
  purchaseCheckoutKindAvailabilityError,
  purchaseCheckoutKindHasDestinationStep,
  PURCHASE_CHECKOUT_KINDS,
} from "@/lib/purchaseCheckoutPayment"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"

export type PaymentFlow = "sale" | "purchase"

export type PaymentMethodSelection = {
  kind: OperationPaymentKind
  treasuryAccountId: string
  label: string
}

export type PaymentCheckoutStep = "menu" | "destination" | "installments"

export function getPaymentCheckoutKinds(flow: PaymentFlow): OperationPaymentKind[] {
  return flow === "sale" ? SALE_CHECKOUT_KINDS : PURCHASE_CHECKOUT_KINDS
}

export function paymentCheckoutKindLabel(
  flow: PaymentFlow,
  kind: OperationPaymentKind,
): string {
  return operationPaymentKindLabel(kind)
}

export function getPaymentCheckoutDestinations(
  flow: PaymentFlow,
  kind: OperationPaymentKind,
  context: TreasuryPaymentContext,
): { id: string; name: string }[] {
  if (flow === "sale") {
    return getCheckoutDestinations(kind, context)
  }
  return getPurchaseCheckoutDestinations(kind, context)
}

export function paymentCheckoutKindHasDestinationStep(
  flow: PaymentFlow,
  kind: OperationPaymentKind,
  context: TreasuryPaymentContext,
): boolean {
  if (flow === "sale") {
    return checkoutKindHasDestinationStep(kind, context)
  }
  return purchaseCheckoutKindHasDestinationStep(kind, context)
}

export function paymentCheckoutKindAvailabilityError(
  flow: PaymentFlow,
  kind: OperationPaymentKind,
  context: TreasuryPaymentContext,
  cashTreasuryAccountId?: string | null,
): string | null {
  if (flow === "sale") {
    return checkoutKindAvailabilityError(kind, context, cashTreasuryAccountId ?? null)
  }
  return purchaseCheckoutKindAvailabilityError(kind, context)
}

export function buildPaymentCheckoutSelection(
  flow: PaymentFlow,
  kind: OperationPaymentKind,
  treasuryAccountId: string,
  context: TreasuryPaymentContext,
  destinationName?: string,
): PaymentMethodSelection {
  if (flow === "sale") {
    return buildCheckoutPaymentSelection(
      kind,
      treasuryAccountId,
      context,
      destinationName,
    )
  }
  return buildPurchaseCheckoutPaymentSelection(
    kind,
    treasuryAccountId,
    context,
    destinationName,
  )
}

function pluralCuenta(n: number): string {
  return n === 1 ? "1 cuenta" : `${n} cuentas`
}

function pluralTerminal(n: number): string {
  return n === 1 ? "1 terminal" : `${n} terminales`
}

function pluralCaja(n: number): string {
  return n === 1 ? "1 caja" : `${n} cajas`
}

/** Subtítulo bajo cada tipo de pago en el menú principal. */
export function paymentCheckoutKindSubtitle(
  flow: PaymentFlow,
  kind: OperationPaymentKind,
  context: TreasuryPaymentContext,
  options?: {
    cashTreasuryAccountId?: string | null
    cashRegisterName?: string | null
  },
): string {
  if (kind === "cash") {
    if (flow === "sale") {
      if (options?.cashRegisterName?.trim()) {
        return `Caja abierta · ${options.cashRegisterName.trim()}`
      }
      return "Desde la caja abierta"
    }
    const count = context.cashTreasuryAccounts.length
    if (count === 0) return "Sin cajas configuradas"
    if (count === 1) {
      return context.cashTreasuryAccounts[0]?.name ?? "Caja de efectivo"
    }
    return `${pluralCaja(count)} · elegí destino`
  }

  if (kind === "transfer") {
    const count = context.bankTreasuryAccounts.length
    if (count === 0) return "Sin bancos ni billeteras"
    if (count === 1) {
      return context.bankTreasuryAccounts[0]?.name ?? "Cuenta bancaria"
    }
    return `${pluralCuenta(count)} · elegí origen`
  }

  if (kind === "card_debit" || kind === "card_credit") {
    if (flow === "purchase") {
      const count = context.payTreasuryAccounts.length
      if (count === 0) return "Sin tarjetas corporativas"
      if (count === 1) {
        return context.payTreasuryAccounts[0]?.name ?? "Tarjeta corporativa"
      }
      return `${pluralCuenta(count)} · elegí tarjeta`
    }
    const count = context.posTreasuryAccounts.length
    if (count === 0) return "Sin terminales POS"
    if (count === 1) {
      return context.posTreasuryAccounts[0]?.name ?? "Terminal POS"
    }
    return `${pluralTerminal(count)} · elegí destino`
  }

  return operationPaymentKindLabel(kind)
}

export function paymentCheckoutDestinationHint(
  flow: PaymentFlow,
  kind: OperationPaymentKind,
): string {
  if (kind === "cash") {
    return flow === "purchase"
      ? "El efectivo se registrará en la caja que elijas."
      : "El cobro se imputa a la caja abierta."
  }
  if (kind === "transfer") {
    return flow === "purchase"
      ? "Elegí desde qué banco o billetera salió el pago."
      : "Elegí dónde se acreditará la transferencia."
  }
  if (kind === "card_debit") {
    return "Elegí el terminal donde se procesó el débito."
  }
  if (kind === "card_credit") {
    return flow === "purchase"
      ? "Elegí la tarjeta corporativa con la que pagás."
      : "Elegí el terminal donde se procesó el crédito."
  }
  return "Elegí la cuenta destino."
}

export function resolvePaymentKindSelection(
  flow: PaymentFlow,
  kind: OperationPaymentKind,
  context: TreasuryPaymentContext,
  cashTreasuryAccountId?: string | null,
):
  | { action: "select"; selection: PaymentMethodSelection }
  | { action: "destination"; kind: OperationPaymentKind }
  | { action: "error"; message: string } {
  const availabilityError = paymentCheckoutKindAvailabilityError(
    flow,
    kind,
    context,
    cashTreasuryAccountId,
  )
  if (availabilityError) {
    return { action: "error", message: availabilityError }
  }

  if (flow === "sale" && kind === "cash" && cashTreasuryAccountId) {
    return {
      action: "select",
      selection: buildPaymentCheckoutSelection(
        flow,
        "cash",
        cashTreasuryAccountId,
        context,
      ),
    }
  }

  const destinations = getPaymentCheckoutDestinations(flow, kind, context)
  if (destinations.length === 1) {
    const dest = destinations[0]!
    return {
      action: "select",
      selection: buildPaymentCheckoutSelection(
        flow,
        kind,
        dest.id,
        context,
        dest.name,
      ),
    }
  }

  if (paymentCheckoutKindHasDestinationStep(flow, kind, context)) {
    return { action: "destination", kind }
  }

  const dest = destinations[0]
  if (!dest) {
    return { action: "error", message: "No hay cuentas disponibles para este medio." }
  }

  return {
    action: "select",
    selection: buildPaymentCheckoutSelection(
      flow,
      kind,
      dest.id,
      context,
      dest.name,
    ),
  }
}

export function shouldStayOpenAfterSelection(
  flow: PaymentFlow,
  selection: PaymentMethodSelection,
): boolean {
  return flow === "purchase" && selection.kind === "card_credit"
}
