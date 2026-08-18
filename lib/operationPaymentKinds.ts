export type OperationPaymentKind =
  | "cash"
  | "card_debit"
  | "card_credit"
  | "transfer"
  | "check"
  | "other"

export const OPERATION_PAYMENT_KINDS: {
  value: OperationPaymentKind
  label: string
}[] = [
  { value: "cash", label: "Efectivo" },
  { value: "card_debit", label: "Tarjeta débito" },
  { value: "card_credit", label: "Tarjeta crédito" },
  { value: "transfer", label: "Transferencia" },
  { value: "check", label: "Cheque" },
  { value: "other", label: "Otro" },
]

export function operationPaymentKindLabel(kind: OperationPaymentKind | string): string {
  return (
    OPERATION_PAYMENT_KINDS.find((k) => k.value === kind)?.label ??
    String(kind || "—")
  )
}

export function isValidOperationPaymentKind(
  kind: string,
): kind is OperationPaymentKind {
  return OPERATION_PAYMENT_KINDS.some((k) => k.value === kind)
}
