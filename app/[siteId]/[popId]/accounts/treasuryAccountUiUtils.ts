import type {
  BankStatementLineRow,
  PaymentMethodMovementRow,
} from "@/app/[siteId]/[popId]/accounts/treasuryDetailActions"
import { buildCsv, downloadCsv } from "@/lib/exportCsv"
import { operationPaymentKindLabel } from "@/lib/operationPaymentKinds"

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
    case "card_settlement":
      return "Liquidación tarjeta"
    default:
      return "Movimiento"
  }
}

export function treasuryMovementTypeLabel(
  movement: PaymentMethodMovementRow,
): string {
  if (movement.kind === "sale") {
    switch (movement.saleChannel) {
      case "table":
        return "Venta mesa"
      case "counter":
        return "Venta mostrador"
      case "pos":
        return "Venta POS"
      default:
        return "Venta"
    }
  }
  return treasuryMovementKindLabel(movement.kind)
}

export function treasuryMovementCounterpartyLabel(
  movement: PaymentMethodMovementRow,
): string {
  const label = movement.label.trim()
  if (!label) return "—"
  if (
    movement.kind === "sale" &&
    (label === "Venta" || label.toLowerCase() === "venta")
  ) {
    return "—"
  }
  if (movement.kind === "funding_out") return "—"
  return label
}

export function treasuryMovementTreasuryAccountLabel(
  movement: PaymentMethodMovementRow,
): string {
  const label = movement.treasuryAccountLabel?.trim()
  if (label) return label
  const legacy = movement.sourceAccountName?.trim()
  if (legacy) return legacy
  return "—"
}

export function treasuryMovementPaymentKindLabel(
  movement: PaymentMethodMovementRow,
): string {
  if (movement.paymentKind) {
    return operationPaymentKindLabel(movement.paymentKind)
  }
  if (movement.kind === "funding_out") return operationPaymentKindLabel("transfer")
  return "—"
}

export function exportTreasuryAccountPeriodCsv(options: {
  accountName: string
  dateFrom: string
  dateTo: string
  movements: PaymentMethodMovementRow[]
  totals: { in: number; out: number; net: number }
  includeTreasuryDetails?: boolean
}): void {
  const {
    accountName,
    dateFrom,
    dateTo,
    movements,
    totals,
    includeTreasuryDetails = false,
  } = options
  const periodLabel =
    dateFrom && dateTo
      ? `${dateFrom}_${dateTo}`
      : new Date().toISOString().slice(0, 10)
  const filename = `cuenta-${accountName.replace(/[^\w\-]+/g, "-").slice(0, 40)}-${periodLabel}.csv`

  const headers = includeTreasuryDetails
    ? ([
        "Fecha",
        "Tipo",
        "Cliente o proveedor",
        "Cuenta",
        "Forma de pago",
        "Entrada",
        "Salida",
      ] as const)
    : ([
        "Fecha",
        "Tipo",
        "Cliente o proveedor",
        "Entrada",
        "Salida",
        "Cuenta origen",
      ] as const)

  const rows = movements.map((m) =>
    includeTreasuryDetails
      ? [
          m.date.slice(0, 10),
          treasuryMovementTypeLabel(m),
          treasuryMovementCounterpartyLabel(m),
          treasuryMovementTreasuryAccountLabel(m),
          treasuryMovementPaymentKindLabel(m),
          m.direction === "in" ? m.amount.toFixed(2) : "",
          m.direction === "out" ? m.amount.toFixed(2) : "",
        ]
      : [
          m.date.slice(0, 10),
          treasuryMovementTypeLabel(m),
          treasuryMovementCounterpartyLabel(m),
          m.direction === "in" ? m.amount.toFixed(2) : "",
          m.direction === "out" ? m.amount.toFixed(2) : "",
          m.sourceAccountName ?? "",
        ],
  )

  rows.push([])
  if (includeTreasuryDetails) {
    rows.push(["", "Entradas del período", "", "", "", totals.in.toFixed(2), ""])
    rows.push(["", "Salidas del período", "", "", "", "", totals.out.toFixed(2)])
    rows.push(["", "Neto del período", "", "", String(totals.net), "", ""])
  } else {
    rows.push(["", "Entradas del período", "", totals.in.toFixed(2), "", ""])
    rows.push(["", "Salidas del período", "", "", totals.out.toFixed(2), ""])
    rows.push(["", "Neto del período", String(totals.net), "", "", ""])
  }

  downloadCsv(filename, buildCsv([...headers], rows))
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

export const TREASURY_RECONCILE_COMMISSIONS_LABEL = "Comisiones e impuestos"

/** Texto de ayuda al registrar comisiones en conciliación. */
export const TREASURY_RECONCILE_COMMISSIONS_ACCOUNT_HINT =
  "Se contabiliza en Comisiones y gastos comerciales."

export function parseTreasuryMoneyInput(value: string): number {
  let s = String(value).trim().replace(/\s/g, "")
  if (!s) return NaN

  const hasComma = s.includes(",")
  const hasDot = s.includes(".")

  if (hasComma && hasDot) {
    const lastComma = s.lastIndexOf(",")
    const lastDot = s.lastIndexOf(".")
    if (lastComma > lastDot) {
      s = s.replace(/\./g, "").replace(",", ".")
    } else {
      s = s.replace(/,/g, "")
    }
  } else if (hasComma) {
    s = s.replace(",", ".")
  } else if (hasDot) {
    const parts = s.split(".")
    const lastPart = parts[parts.length - 1] ?? ""
    const isDecimal = parts.length === 2 && lastPart.length <= 2
    if (!isDecimal) {
      s = s.replace(/\./g, "")
    }
  }

  const n = Number(s)
  if (!Number.isFinite(n)) return NaN
  return roundMoney(n)
}

export function formatTreasuryMoneyInputValue(amount: number): string {
  if (!Number.isFinite(amount)) return ""
  return amount.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
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
