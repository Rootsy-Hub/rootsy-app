import {
  formatRootsFormDisplayDateCompact,
  parseRootsFormIsoDate,
} from "@/lib/rootsFormDateFormat"

export const INVENTORY_LAYER_FEFO_SELECT =
  "id, quantity_remaining, unit_cost, received_at, expires_at"

export type InventoryExpiryAlert = "expired" | "d7" | "d15" | "d30"

export type InventoryExpiryGroup = InventoryExpiryAlert | "later" | "none"

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

export function parseInventoryExpiresAt(raw: unknown): string | null {
  if (raw == null) return null
  const iso = String(raw).trim().slice(0, 10)
  if (!iso) return null
  const match = ISO_DATE.exec(iso)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }
  return iso
}

export function applyInventoryFefoOrder<
  T extends {
    order: (
      column: string,
      options?: { ascending?: boolean; nullsFirst?: boolean },
    ) => T
  },
>(query: T): T {
  return query
    .order("expires_at", { ascending: true, nullsFirst: false })
    .order("received_at", { ascending: true })
}

export function compareInventoryLayersFefo(
  a: { expiresAt: string | null; receivedAt: string },
  b: { expiresAt: string | null; receivedAt: string },
): number {
  if (a.expiresAt && b.expiresAt) {
    const byExpiry = a.expiresAt.localeCompare(b.expiresAt)
    if (byExpiry !== 0) return byExpiry
  } else if (a.expiresAt) {
    return -1
  } else if (b.expiresAt) {
    return 1
  }
  return a.receivedAt.localeCompare(b.receivedAt)
}

export function calendarDaysUntilExpiry(
  expiresAt: string,
  todayIso: string,
): number | null {
  const expires = parseRootsFormIsoDate(expiresAt)
  const today = parseRootsFormIsoDate(todayIso)
  if (!expires || !today) return null
  return Math.round((expires.getTime() - today.getTime()) / 86_400_000)
}

export function inventoryExpiryGroup(
  expiresAt: string | null,
  todayIso: string,
): InventoryExpiryGroup {
  if (!expiresAt) return "none"
  const days = calendarDaysUntilExpiry(expiresAt, todayIso)
  if (days == null) return "none"
  if (days < 0) return "expired"
  if (days <= 7) return "d7"
  if (days <= 15) return "d15"
  if (days <= 30) return "d30"
  return "later"
}

export function inventoryExpiryAlert(
  expiresAt: string | null,
  todayIso: string,
): InventoryExpiryAlert | null {
  const group = inventoryExpiryGroup(expiresAt, todayIso)
  if (group === "later" || group === "none") return null
  return group
}

export function formatInventoryExpiryDate(iso: string): string {
  const date = parseRootsFormIsoDate(iso)
  if (!date) return iso
  return formatRootsFormDisplayDateCompact(date)
}

export function inventoryExpiryGroupLabel(group: InventoryExpiryGroup): string {
  if (group === "expired") return "Vencido"
  if (group === "d7") return "En 7 días"
  if (group === "d15") return "En 15 días"
  if (group === "d30") return "En 30 días"
  if (group === "later") return "Más adelante"
  return "Sin fecha"
}
