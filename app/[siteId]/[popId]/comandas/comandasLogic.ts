import type { ComandaStatus } from "@/app/[siteId]/[popId]/comandas/comandasTypes"

export function formatTableOriginLabel(labels: string[]): string {
  const clean = labels.map((label) => label.trim()).filter(Boolean)
  if (clean.length === 0) return "Mesa"
  if (clean.length === 1) return `Mesa ${clean[0]}`
  return `Mesas ${clean.join(" + ")}`
}

export function formatCounterOriginLabel(orderNumber: number): string {
  return `Pedido #${orderNumber}`
}

export function checkoutCustomerName(input: {
  selectedName?: string | null
  manualName?: string | null
}): string {
  const selected = input.selectedName?.trim() ?? ""
  if (selected) return selected
  return input.manualName?.trim() ?? ""
}

export function canDragComanda(status: ComandaStatus): boolean {
  return (
    status === "sent" ||
    status === "preparing" ||
    status === "ready" ||
    status === "delivered"
  )
}

export function canMoveComandaTo(
  from: ComandaStatus,
  to: ComandaStatus,
): boolean {
  if (from === to) return false
  return canDragComanda(from) && canDragComanda(to)
}

export function timestampsForStatusChange(
  current: {
    sentAt: string | null
    preparingAt: string | null
    readyAt: string | null
    deliveredAt: string | null
  },
  next: ComandaStatus,
  now: string,
): {
  status: ComandaStatus
  status_changed_at: string
  sent_at?: string
  preparing_at?: string
  ready_at?: string
  delivered_at?: string
} {
  const patch: {
    status: ComandaStatus
    status_changed_at: string
    sent_at?: string
    preparing_at?: string
    ready_at?: string
    delivered_at?: string
  } = {
    status: next,
    status_changed_at: now,
  }
  if (next === "sent" && !current.sentAt) patch.sent_at = now
  if (next === "preparing" && !current.preparingAt) patch.preparing_at = now
  if (next === "ready" && !current.readyAt) patch.ready_at = now
  if (next === "delivered" && !current.deliveredAt) patch.delivered_at = now
  return patch
}
