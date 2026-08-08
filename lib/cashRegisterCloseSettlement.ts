import { operationPaymentKindLabel } from "@/lib/operationPaymentKinds"

export function treasuryCloseAccountKey(treasuryAccountId: string): string {
  return `ta:${treasuryAccountId}`
}

export function parseCloseTreasuryLineKey(key: string): {
  mode: "account" | "legacy" | "unassigned"
  treasuryAccountId: string | null
  paymentKind: string | null
} {
  if (key.startsWith("ta:")) {
    return {
      mode: "account",
      treasuryAccountId: key.slice(3),
      paymentKind: null,
    }
  }
  const legacy = parseTreasuryCloseLineKey(key)
  if (legacy.treasuryAccountId === null) {
    return {
      mode: "unassigned",
      treasuryAccountId: null,
      paymentKind: legacy.paymentKind,
    }
  }
  return {
    mode: "legacy",
    treasuryAccountId: legacy.treasuryAccountId,
    paymentKind: legacy.paymentKind,
  }
}

export function treasuryCloseLineKey(
  treasuryAccountId: string | null,
  paymentKind: string,
): string {
  return `${treasuryAccountId ?? "__none"}|${paymentKind}`
}

export function parseTreasuryCloseLineKey(key: string): {
  treasuryAccountId: string | null
  paymentKind: string
} {
  const pipe = key.indexOf("|")
  if (pipe < 0) {
    return { treasuryAccountId: null, paymentKind: key }
  }
  const prefix = key.slice(0, pipe)
  return {
    treasuryAccountId: prefix === "__none" ? null : prefix,
    paymentKind: key.slice(pipe + 1),
  }
}

export function formatTreasuryCloseLineLabel(
  accountName: string | null,
  paymentKind: string,
): string {
  const kindLabel = operationPaymentKindLabel(paymentKind)
  const name = accountName?.trim()
  if (name && kindLabel) return `${name} · ${kindLabel}`
  return name || kindLabel || "—"
}

export type CashRegisterClosingComparisonLine = {
  /** Identificador único de fila (`cash`, `uuid|debit_card`, …). */
  key: string
  paymentKind: string
  treasuryAccountId?: string | null
  label: string
  cobrado: number
  /** Monto cargado al cierre; 0 con cobrado > 0 implica “coincide con ventas”. */
  informadoRaw: number
  informado: number
  difference: number
  assumedFromSales: boolean
}

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

export function closingPaymentDifference(
  countedAmount: number,
  expectedAmount: number,
): number {
  return roundMoney(countedAmount - expectedAmount)
}

/** Solo para snapshots históricos donde informado quedó en 0. */
export function effectiveClosingPaymentAmount(
  countedAmount: number,
  expectedAmount: number,
): number {
  if (countedAmount > 0) return countedAmount
  return expectedAmount > 0 ? expectedAmount : countedAmount
}

export function closingVarianceLabel(diff: number): string | null {
  if (Math.abs(diff) < 0.01) return null
  const amount = formatClosingVarianceAmount(Math.abs(diff))
  return diff < 0 ? `Faltante ${amount}` : `Sobrante ${amount}`
}

export function closingComparisonNetDifference(
  lines: CashRegisterClosingComparisonLine[],
): number {
  return roundMoney(lines.reduce((sum, line) => sum + line.difference, 0))
}

function formatClosingVarianceAmount(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(n)
}

export function buildClosingComparisonLines(input: {
  efectivoTeorico: number
  cashCounted: number
  paymentMethods: Record<string, number>
  cobradoPorMedio: { paymentKind: string; total: number }[]
}): CashRegisterClosingComparisonLine[] {
  const lines: CashRegisterClosingComparisonLine[] = []
  const cashInformadoRaw = roundMoney(input.cashCounted)
  lines.push({
    key: "cash",
    paymentKind: "cash",
    label: "Efectivo en cajón",
    cobrado: roundMoney(input.efectivoTeorico),
    informadoRaw: cashInformadoRaw,
    informado: cashInformadoRaw,
    difference: roundMoney(cashInformadoRaw - input.efectivoTeorico),
    assumedFromSales: false,
  })

  const cobradoMap = new Map(
    input.cobradoPorMedio.map((row) => [row.paymentKind, row.total]),
  )
  const seen = new Set<string>()

  for (const [paymentKind, informadoRaw] of Object.entries(
    input.paymentMethods,
  )) {
    if (paymentKind === "cash") continue
    seen.add(paymentKind)
    const cobrado = roundMoney(cobradoMap.get(paymentKind) ?? 0)
    const raw = roundMoney(informadoRaw)
    const assumedFromSales = raw === 0 && cobrado > 0
    const informado = assumedFromSales ? cobrado : raw
    lines.push({
      key: paymentKind,
      paymentKind,
      label: operationPaymentKindLabel(paymentKind),
      cobrado,
      informadoRaw: raw,
      informado,
      difference: roundMoney(informado - cobrado),
      assumedFromSales,
    })
  }

  for (const row of input.cobradoPorMedio) {
    if (row.paymentKind === "cash" || seen.has(row.paymentKind)) continue
    if (row.total <= 0) continue
    const cobrado = roundMoney(row.total)
    lines.push({
      key: row.paymentKind,
      paymentKind: row.paymentKind,
      label: operationPaymentKindLabel(row.paymentKind),
      cobrado,
      informadoRaw: 0,
      informado: cobrado,
      difference: 0,
      assumedFromSales: true,
    })
  }

  return lines
}

export function buildClosingComparisonLinesByTreasury(input: {
  efectivoTeorico: number
  cashCounted: number
  treasuryLines: Record<string, number>
  cobradoPorLinea: {
    key: string
    paymentKind: string
    treasuryAccountId: string | null
    accountName: string | null
    label?: string
    total: number
  }[]
}): CashRegisterClosingComparisonLine[] {
  const lines: CashRegisterClosingComparisonLine[] = []
  const cashInformadoRaw = roundMoney(input.cashCounted)
  lines.push({
    key: "cash",
    paymentKind: "cash",
    label: "Efectivo en cajón",
    cobrado: roundMoney(input.efectivoTeorico),
    informadoRaw: cashInformadoRaw,
    informado: cashInformadoRaw,
    difference: roundMoney(cashInformadoRaw - input.efectivoTeorico),
    assumedFromSales: false,
  })

  const cobradoMap = new Map(
    input.cobradoPorLinea.map((row) => [row.key, row]),
  )
  const seen = new Set<string>()

  for (const [lineKey, informadoRaw] of Object.entries(input.treasuryLines)) {
    seen.add(lineKey)
    const cobro = cobradoMap.get(lineKey)
    const cobrado = roundMoney(cobro?.total ?? 0)
    const raw = roundMoney(informadoRaw)
    const assumedFromSales = raw === 0 && cobrado > 0
    const informado = assumedFromSales ? cobrado : raw
    const parsed = parseCloseTreasuryLineKey(lineKey)
    const lineLabel =
      cobro?.label ??
      (cobro?.accountName
        ? parsed.mode === "unassigned"
          ? formatTreasuryCloseLineLabel(null, cobro.paymentKind)
          : cobro.accountName
        : parsed.mode === "unassigned" && parsed.paymentKind
          ? operationPaymentKindLabel(parsed.paymentKind)
          : "—")
    lines.push({
      key: lineKey,
      paymentKind: cobro?.paymentKind ?? parsed.paymentKind ?? "other",
      treasuryAccountId:
        cobro?.treasuryAccountId ?? parsed.treasuryAccountId,
      label: lineLabel,
      cobrado,
      informadoRaw: raw,
      informado,
      difference: roundMoney(informado - cobrado),
      assumedFromSales,
    })
  }

  for (const cobro of input.cobradoPorLinea) {
    if (seen.has(cobro.key)) continue
    if (cobro.total <= 0) continue
    const cobrado = roundMoney(cobro.total)
    lines.push({
      key: cobro.key,
      paymentKind: cobro.paymentKind,
      treasuryAccountId: cobro.treasuryAccountId,
      label:
        cobro.label ??
        formatTreasuryCloseLineLabel(cobro.accountName, cobro.paymentKind),
      cobrado,
      informadoRaw: 0,
      informado: cobrado,
      difference: 0,
      assumedFromSales: true,
    })
  }

  return lines
}
