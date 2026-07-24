import type {
  BankStatementLineRow,
  PaymentMethodMovementRow,
} from "@/app/[siteId]/[popId]/accounts/treasuryDetailActions"

export const treasuryMoneyFmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

export function formatTreasuryShortDate(iso: string) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso || "—"
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "short" }).format(d)
}

export function treasuryMovementKindLabel(
  kind: PaymentMethodMovementRow["kind"],
): string {
  switch (kind) {
    case "sale":
      return "Venta"
    case "purchase":
      return "Compra"
    case "expense":
      return "Gasto"
    case "funding_out":
      return "Resumen tarjeta"
    default:
      return "Movimiento"
  }
}

export function findMatchingBankStatementLine(
  movement: PaymentMethodMovementRow,
  lines: BankStatementLineRow[],
): BankStatementLineRow | null {
  const candidates = lines.filter(
    (l) =>
      !l.reconciled &&
      l.direction === movement.direction &&
      Math.abs(l.amount - movement.amount) < 0.01,
  )
  if (candidates.length === 1) return candidates[0]
  const sameDate = candidates.filter((l) => l.lineDate === movement.date)
  if (sameDate.length === 1) return sameDate[0]
  return null
}

export function defaultTreasuryPeriodEnd(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
}

export function defaultTreasuryPeriodStart(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`
}

export function filterMovementsByDateRange(
  movements: PaymentMethodMovementRow[],
  dateFrom: string,
  dateTo: string,
): PaymentMethodMovementRow[] {
  const from = dateFrom.trim()
  const to = dateTo.trim()
  if (!from && !to) return movements
  return movements.filter((m) => {
    const d = m.date.slice(0, 10)
    if (from && d < from) return false
    if (to && d > to) return false
    return true
  })
}

export function computeMovementTotals(movements: PaymentMethodMovementRow[]) {
  let totalIn = 0
  let totalOut = 0
  for (const m of movements) {
    if (m.direction === "in") totalIn = roundMoney(totalIn + m.amount)
    else totalOut = roundMoney(totalOut + m.amount)
  }
  return {
    in: totalIn,
    out: totalOut,
    net: roundMoney(totalIn - totalOut),
  }
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}
