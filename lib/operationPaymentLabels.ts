export const CLIENT_ACCOUNT_PAYMENT_LABEL = "Cuenta corriente del cliente"
export const SUPPLIER_ACCOUNT_PAYMENT_LABEL = "Cuenta corriente del proveedor"

const PAYMENT_ACCOUNT_SEPARATORS = [" — ", " – ", " - "] as const

function stripInternalAccountFromPaymentPart(part: string): string | null {
  const label = part.trim()
  if (!label || label === "—") return null

  for (const separator of PAYMENT_ACCOUNT_SEPARATORS) {
    const idx = label.indexOf(separator)
    if (idx > 0) {
      const method = label.slice(0, idx).trim()
      return method || null
    }
  }

  return label
}

/** Medio de pago para el cliente: sin el nombre de la cuenta de tesorería. */
export function toCustomerFacingPaymentMethodLabel(
  label: string | null | undefined,
): string | null {
  const raw = label?.trim()
  if (!raw || raw === "—") return null

  const methods = raw
    .split(" · ")
    .map((part) => stripInternalAccountFromPaymentPart(part))
    .filter((part): part is string => Boolean(part))

  if (methods.length === 0) return null
  return [...new Set(methods)].join(" · ")
}

export function formatOperationPaymentMethods(
  payments: ReadonlyArray<{ methodName: string }>,
): string {
  const names = payments
    .map((p) => p.methodName.trim())
    .filter((name) => name.length > 0 && name !== "—")
  if (names.length === 0) return "—"
  return [...new Set(names)].join(" · ")
}

export function resolveOperationPaymentMethodLabel(args: {
  payments: ReadonlyArray<{ methodName: string }>
  onClientAccount?: boolean
  onSupplierAccount?: boolean
}): string {
  const fromPayments = formatOperationPaymentMethods(args.payments)
  if (fromPayments !== "—") return fromPayments
  if (args.onClientAccount) return CLIENT_ACCOUNT_PAYMENT_LABEL
  if (args.onSupplierAccount) return SUPPLIER_ACCOUNT_PAYMENT_LABEL
  return "—"
}
