import type { CashRegisterSummaryData } from "@/app/[siteId]/[popId]/cash-registers/actions"
import { formatLocaleDateTime, formatPopDateTime } from "@/lib/popTimezone"

const moneyFmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

export function formatCashRegisterMoney(n: number) {
  return moneyFmt.format(n)
}

const MONEY_EPS = 0.005

export function formatArqueoDifferenceDisplay(diff: number | null): {
  text: string
  tone: "muted" | "positive" | "negative" | "neutral"
} {
  if (diff == null) {
    return { text: "—", tone: "muted" }
  }
  if (Math.abs(diff) < MONEY_EPS) {
    return { text: formatCashRegisterMoney(0), tone: "neutral" }
  }
  return {
    text: formatCashRegisterMoney(diff),
    tone: diff > 0 ? "positive" : "negative",
  }
}

export function formatCashRegisterDateTime(iso: string, timeZone?: string) {
  if (!iso) return "—"
  if (timeZone) return formatPopDateTime(iso, timeZone)
  return formatLocaleDateTime(iso)
}

export function shortCashRegisterUserId(id: string | null) {
  if (!id) return "—"
  return id.length > 14 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id
}

export function cashRegisterSessionOpenedLabel(
  sessionId: string,
  sessions: CashRegisterSummaryData["sessions"],
): string {
  const s = sessions.find((x) => x.id === sessionId)
  return s ? formatCashRegisterDateTime(s.openedAt) : shortCashRegisterUserId(sessionId)
}
