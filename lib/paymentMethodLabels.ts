import {
  OPERATION_PAYMENT_KINDS,
  type OperationPaymentKind,
} from "@/lib/operationPaymentKinds"

export const PAYMENT_KIND_LABELS: Record<OperationPaymentKind, string> =
  Object.fromEntries(
    OPERATION_PAYMENT_KINDS.map((k) => [k.value, k.label]),
  ) as Record<OperationPaymentKind, string>

export function paymentKindLabel(kind: OperationPaymentKind | string): string {
  return PAYMENT_KIND_LABELS[kind as OperationPaymentKind] ?? String(kind || "—")
}
