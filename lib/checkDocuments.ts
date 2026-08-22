export type CheckDirection = "received" | "issued"

export type CheckStatus =
  | "in_portfolio"
  | "deposited"
  | "cleared"
  | "rejected"
  | "voided"

export type CheckSourceKind =
  | "sale"
  | "purchase"
  | "expense"
  | "service_charge"
  | "manual"

export const CHECK_DIRECTIONS: {
  value: CheckDirection
  label: string
}[] = [
  { value: "received", label: "Recibido" },
  { value: "issued", label: "Emitido" },
]

export const CHECK_STATUSES: {
  value: CheckStatus
  label: string
}[] = [
  { value: "in_portfolio", label: "En cartera" },
  { value: "deposited", label: "Depositado" },
  { value: "cleared", label: "Acreditado" },
  { value: "rejected", label: "Rechazado" },
  { value: "voided", label: "Anulado" },
]

export const CHECK_SOURCE_KINDS: {
  value: CheckSourceKind
  label: string
}[] = [
  { value: "sale", label: "Venta" },
  { value: "purchase", label: "Compra" },
  { value: "expense", label: "Gasto" },
  { value: "service_charge", label: "Servicio" },
  { value: "manual", label: "Alta manual" },
]

export function checkDirectionLabel(direction: CheckDirection | string): string {
  return (
    CHECK_DIRECTIONS.find((item) => item.value === direction)?.label ??
    String(direction || "—")
  )
}

export function checkStatusLabel(status: CheckStatus | string): string {
  return (
    CHECK_STATUSES.find((item) => item.value === status)?.label ??
    String(status || "—")
  )
}

export function isCheckDirection(value: string): value is CheckDirection {
  return CHECK_DIRECTIONS.some((item) => item.value === value)
}

export function isCheckStatus(value: string): value is CheckStatus {
  return CHECK_STATUSES.some((item) => item.value === value)
}

export function isCheckSourceKind(value: string): value is CheckSourceKind {
  return CHECK_SOURCE_KINDS.some((item) => item.value === value)
}

export function checkStatusPillVariant(
  status: CheckStatus | string,
): "savia" | "bruma" | "brumaMuted" | "warning" | "danger" {
  if (status === "cleared") return "savia"
  if (status === "deposited") return "warning"
  if (status === "rejected") return "danger"
  if (status === "voided") return "brumaMuted"
  return "bruma"
}

export function checkDirectionPillVariant(
  direction: CheckDirection | string,
): "savia" | "bruma" {
  return direction === "issued" ? "bruma" : "savia"
}

export type CheckLifecycleAction = "deposit" | "clear" | "reject" | "void"

export function checkLifecycleActionLabel(
  action: CheckLifecycleAction,
  direction: CheckDirection,
): string {
  if (action === "deposit") {
    return direction === "issued" ? "Debitar" : "Depositar"
  }
  if (action === "clear") return "Acreditar"
  if (action === "reject") return "Rechazar"
  return "Anular"
}

export function canApplyCheckLifecycleAction(
  status: CheckStatus,
  action: CheckLifecycleAction,
): boolean {
  if (action === "deposit") return status === "in_portfolio"
  if (action === "clear") return status === "deposited"
  if (action === "reject") {
    return status === "in_portfolio" || status === "deposited"
  }
  if (action === "void") return status === "in_portfolio"
  return false
}

export function checkLifecycleActions(
  status: CheckStatus,
  direction: CheckDirection,
): { id: CheckLifecycleAction; label: string; destructive: boolean }[] {
  const actions: CheckLifecycleAction[] = []
  if (canApplyCheckLifecycleAction(status, "deposit")) actions.push("deposit")
  if (canApplyCheckLifecycleAction(status, "clear")) actions.push("clear")
  if (canApplyCheckLifecycleAction(status, "reject")) actions.push("reject")
  if (canApplyCheckLifecycleAction(status, "void")) actions.push("void")
  return actions.map((id) => ({
    id,
    label: checkLifecycleActionLabel(id, direction),
    destructive: id === "reject" || id === "void",
  }))
}
