import type {
  BankStatementLineRow,
  PaymentMethodMovementRow,
  TreasuryPeriodSummary,
  TreasuryReconciliationEventRow,
} from "@/app/[siteId]/[popId]/accounts/treasuryDetailActions"
import { formatPopDateShort, formatPopTime, popTimeIntlOptions, toPopCalendarDate } from "@/lib/popTimezone"
import { buildCsv, downloadCsv } from "@/lib/exportCsv"
import { operationPaymentKindLabel } from "@/lib/operationPaymentKinds"

export const treasuryMoneyFmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

export function formatTreasurySignedAmount(
  direction: "in" | "out",
  amount: number,
): string {
  const sign = direction === "in" ? "+" : "−"
  return `${sign}${treasuryMoneyFmt.format(amount)}`
}

/** Importe en negro: positivo `$ 1.000,00`, negativo `$ -1.000,00`. */
export function formatTreasuryMovementAmount(
  direction: "in" | "out",
  amount: number,
): string {
  const formatted = treasuryMoneyFmt.format(amount)
  if (direction === "in") return formatted
  return formatted.replace(/^\$\s*/, "$ -")
}

export type TreasurySaleChannel = "table" | "counter" | "pos"

export function parseTreasurySaleChannel(raw: unknown): TreasurySaleChannel {
  const channel = String(raw ?? "pos")
  if (channel === "table" || channel === "counter" || channel === "pos") {
    return channel
  }
  return "pos"
}

export function formatTreasuryPosSaleLabel(options: {
  saleChannel: TreasurySaleChannel
  tableLabel?: string | null
  counterOrderLabel?: string | null
  customerName?: string | null
  paymentKind?: string | null
  /** En cuentas madre (banco/billetera/efectivo), pos = medio de cobro, no terminal POS. */
  usePaymentKindForPosChannel?: boolean
}): string {
  const channelLabel =
    options.saleChannel === "table"
      ? "Mesas"
      : options.saleChannel === "counter"
        ? "Mostrador"
        : options.usePaymentKindForPosChannel
          ? options.paymentKind
            ? operationPaymentKindLabel(options.paymentKind)
            : "Cobro directo"
          : "POS"

  const parts: string[] = ["Venta", channelLabel]

  if (options.saleChannel === "table") {
    parts.push(options.tableLabel?.trim() || "Mesa")
  } else if (options.saleChannel === "counter") {
    parts.push(options.counterOrderLabel?.trim() || "Pedido")
  }

  parts.push(options.customerName?.trim() || "sin cliente")

  return parts.join(", ")
}

const TREASURY_PURCHASE_KIND_LABEL: Record<string, string> = {
  merchandise: "Mercadería",
  raw_material: "Materia prima",
  supply: "Insumo",
}

export function treasuryPurchaseKindLabel(kind: string): string {
  return TREASURY_PURCHASE_KIND_LABEL[kind] ?? kind
}

export function formatTreasuryPurchasePaymentLabel(options: {
  purchaseKind?: string | null
  supplierName?: string | null
  documentNumber?: string | null
}): string {
  const parts: string[] = [
    "Compra",
    treasuryPurchaseKindLabel(String(options.purchaseKind ?? "merchandise")),
  ]

  const supplier = options.supplierName?.trim()
  parts.push(supplier || "sin proveedor")

  const documentNumber = options.documentNumber?.trim()
  if (documentNumber) parts.push(documentNumber)

  return parts.join(", ")
}

export function formatTreasuryExpensePaymentLabel(options: {
  categoryName?: string | null
  description?: string | null
}): string {
  const parts: string[] = ["Gasto"]

  const category = options.categoryName?.trim()
  if (category) parts.push(category)

  parts.push(options.description?.trim() || "sin detalle")

  return parts.join(", ")
}

export function treasuryMovementCalendarKey(
  iso: string,
  timeZone?: string,
): string {
  if (!iso) return ""
  if (timeZone) return toPopCalendarDate(iso, timeZone)
  if (/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso.slice(0, 10)
  return iso
}

export function formatTreasuryGroupDate(
  iso: string,
  timeZone?: string,
): string {
  const key = treasuryMovementCalendarKey(iso, timeZone)
  if (!key) return "—"
  const [y, m, d] = key.split("-").map(Number)
  if (!y || !m || !d) return key
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
  })
    .format(new Date(y, m - 1, d))
    .toLocaleLowerCase("es-AR")
}

export function treasuryMovementDescription(
  movement: PaymentMethodMovementRow,
): string {
  if (movement.kind === "pos_liquidation") {
    return formatTreasuryReconciliationSummaryLabel({
      isPos: true,
      adjustmentAmount: movement.adjustmentAmount ?? 0,
    })
  }
  if (movement.kind === "funding_out") {
    return formatTreasuryReconciliationSummaryLabel({
      isPos: false,
      adjustmentAmount: movement.adjustmentAmount ?? 0,
    })
  }
  const label = movement.label.trim()
  if (label) return label
  const counterparty = treasuryMovementCounterpartyLabel(movement)
  if (counterparty && counterparty !== "—") return counterparty
  return treasuryMovementTypeLabel(movement)
}

export type TreasuryMovementDateGroup = {
  dateKey: string
  dateLabel: string
  movements: PaymentMethodMovementRow[]
}

export type TreasuryMovementYearGroup = {
  year: string
  dateGroups: TreasuryMovementDateGroup[]
}

export type TreasuryDateGroupedItems<T> = {
  dateKey: string
  dateLabel: string
  items: T[]
}

export type TreasuryYearGroupedItems<T> = {
  year: string
  dateGroups: TreasuryDateGroupedItems<T>[]
}

export function groupItemsByYearAndDate<
  T extends { date: string; sortAt?: string },
>(items: T[], timeZone?: string): TreasuryYearGroupedItems<T>[] {
  const dateGroups: TreasuryDateGroupedItems<T>[] = []
  const indexByKey = new Map<string, number>()

  for (const item of items) {
    const dateKey = treasuryMovementCalendarKey(item.date, timeZone)
    const existingIndex = indexByKey.get(dateKey)
    if (existingIndex === undefined) {
      indexByKey.set(dateKey, dateGroups.length)
      dateGroups.push({
        dateKey,
        dateLabel: formatTreasuryGroupDate(item.date, timeZone),
        items: [item],
      })
      continue
    }
    dateGroups[existingIndex]?.items.push(item)
  }

  for (const dateGroup of dateGroups) {
    dateGroup.items.sort((a, b) => {
      const aKey = (a.sortAt ?? a.date).trim()
      const bKey = (b.sortAt ?? b.date).trim()
      const cmp = bKey.localeCompare(aKey)
      if (cmp !== 0) return cmp
      return 0
    })
  }

  const yearGroups: TreasuryYearGroupedItems<T>[] = []
  const indexByYear = new Map<string, number>()

  for (const dateGroup of dateGroups) {
    const year = dateGroup.dateKey.slice(0, 4)
    const existingIndex = indexByYear.get(year)
    if (existingIndex === undefined) {
      indexByYear.set(year, yearGroups.length)
      yearGroups.push({ year, dateGroups: [dateGroup] })
      continue
    }
    yearGroups[existingIndex]?.dateGroups.push(dateGroup)
  }

  return yearGroups
}

export function groupTreasuryMovementsByDate(
  movements: PaymentMethodMovementRow[],
  timeZone?: string,
): TreasuryMovementDateGroup[] {
  return groupItemsByYearAndDate(movements, timeZone).flatMap((yearGroup) =>
    yearGroup.dateGroups.map((dateGroup) => ({
      dateKey: dateGroup.dateKey,
      dateLabel: dateGroup.dateLabel,
      movements: dateGroup.items,
    })),
  )
}

export function groupTreasuryMovementsByYearAndDate(
  movements: PaymentMethodMovementRow[],
  timeZone?: string,
): TreasuryMovementYearGroup[] {
  return groupItemsByYearAndDate(movements, timeZone).map((yearGroup) => ({
    year: yearGroup.year,
    dateGroups: yearGroup.dateGroups.map((dateGroup) => ({
      dateKey: dateGroup.dateKey,
      dateLabel: dateGroup.dateLabel,
      movements: dateGroup.items,
    })),
  }))
}

export function formatTreasuryShortDate(iso: string, timeZone?: string) {
  if (!iso) return "—"
  if (timeZone) return formatPopDateShort(iso, timeZone)
  if (!/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso || "—"
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
    case "cash_register_close":
      return "Cierre de caja"
    case "pos_liquidation":
      return "Liquidación POS"
    case "pos_liquidation_fee":
      return "Comisión liquidación"
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
  if (
    movement.kind === "cash_register_close" ||
    movement.kind === "pos_liquidation" ||
    movement.kind === "pos_liquidation_fee"
  ) {
    return movement.label.trim() || "—"
  }
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
  if (movement.kind === "sale" && movement.sourceAccountName) {
    return "POS"
  }
  if (movement.paymentKind) {
    return operationPaymentKindLabel(movement.paymentKind)
  }
  if (movement.kind === "funding_out") return operationPaymentKindLabel("transfer")
  if (
    movement.kind === "pos_liquidation" ||
    movement.kind === "pos_liquidation_fee"
  ) {
    return "Liquidación"
  }
  if (movement.kind === "cash_register_close") return "—"
  return "—"
}

export function exportTreasuryAccountPeriodCsv(options: {
  accountName: string
  dateFrom: string
  dateTo: string
  movements: PaymentMethodMovementRow[]
  totals: { in: number; out: number; net: number }
  periodSummary?: TreasuryPeriodSummary | null
  includeTreasuryDetails?: boolean
}): void {
  const {
    accountName,
    dateFrom,
    dateTo,
    movements,
    totals,
    periodSummary = null,
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
  if (periodSummary?.openingBalance != null) {
    rows.push(["", "Saldo anterior al período", "", "", "", "", ""])
    rows.push([
      "",
      "",
      "",
      "",
      "",
      periodSummary.openingBalance.toFixed(2),
      "",
    ])
    rows.push([])
  }
  if (periodSummary) {
    rows.push(["", "Saldo del período", "", "", "", "", ""])
    rows.push([
      "",
      "",
      "",
      "",
      "",
      periodSummary.currentBalance.toFixed(2),
      "",
    ])
    rows.push([])
  }
  if (includeTreasuryDetails) {
    rows.push(["", "Ingresos del período", "", "", "", totals.in.toFixed(2), ""])
    rows.push(["", "Egresos del período", "", "", "", "", totals.out.toFixed(2)])
    rows.push(["", "Neto del período", "", "", String(totals.net), "", ""])
  } else {
    rows.push(["", "Ingresos del período", "", totals.in.toFixed(2), "", ""])
    rows.push(["", "Egresos del período", "", "", totals.out.toFixed(2), ""])
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

/** Texto de ayuda al registrar comisiones en liquidación POS. */
export const TREASURY_RECONCILE_COMMISSIONS_ACCOUNT_HINT =
  "Se contabiliza en Comisiones y gastos comerciales."

export const TREASURY_CARD_STATEMENT_CHARGES_LABEL =
  "Intereses y otros cargos del resumen"

/** Etiqueta corta para tablas e historial de tarjeta. */
export const TREASURY_CARD_STATEMENT_CHARGES_SHORT_LABEL = "Otros cargos del resumen"

/** Etiqueta breve para resúmenes de pago de tarjeta (p. ej. entre paréntesis). */
export const TREASURY_CARD_OTHER_CHARGES_LABEL = "Otros cargos"

/** Texto de ayuda al registrar cargos extra del resumen de tarjeta. */
export const TREASURY_CARD_STATEMENT_CHARGES_ACCOUNT_HINT =
  "Se contabiliza en Intereses y gastos financieros."

export function formatTreasuryMovementTime(
  value: string,
  timeZone?: string,
): string {
  if (!value.trim()) return ""
  if (timeZone) return formatPopTime(value, timeZone)
  if (!/T\d/.test(value.trim())) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return new Intl.DateTimeFormat("es-AR", popTimeIntlOptions()).format(d)
}

export function treasuryMovementSortKey(
  date: string,
  occurredAt?: string,
): string {
  return (occurredAt ?? date).trim()
}

export function formatTreasuryInlineMovementDescription(
  description: string,
  timeLabel?: string,
): string {
  const time = timeLabel?.trim()
  if (!time) return description
  return `${time} · ${description}`
}

export type TreasuryDisplayMovementRow = {
  rowKey: string
  date: string
  sortAt: string
  timeLabel: string
  description: string
  amount: string
  suppressTopBorder?: boolean
  descriptionClassName?: string
  amountClassName?: string
  sourceMovement?: PaymentMethodMovementRow
}

export const treasuryReconciliationChargesAmountClass =
  "text-rose-700 dark:text-rose-400"

export const treasuryReconciliationChargesDescriptionClass =
  "text-muted-foreground"

/** Resumen compacto de liquidación/pago (p. ej. modal, CSV). */
export function formatTreasuryReconciliationSummaryLabel(options: {
  isPos: boolean
  adjustmentAmount: number
}): string {
  const base = options.isPos ? "Liquidación" : "Pago"
  if (options.adjustmentAmount <= 0) return base
  const chargesLabel = options.isPos
    ? TREASURY_RECONCILE_COMMISSIONS_LABEL
    : TREASURY_CARD_OTHER_CHARGES_LABEL
  const chargesAmount = formatTreasuryMovementAmount(
    "out",
    options.adjustmentAmount,
  )
  return `${base} (${chargesLabel} ${chargesAmount})`
}

/** Neto que impacta el saldo real de la cuenta madre (banco/caja). */
export function treasuryMovementAccountImpact(
  movement: PaymentMethodMovementRow,
): { direction: "in" | "out"; amount: number } {
  const adjustment = movement.adjustmentAmount ?? 0
  if (movement.kind === "pos_liquidation") {
    return { direction: "in", amount: roundMoney(movement.amount) }
  }
  if (movement.kind === "funding_out") {
    return {
      direction: "out",
      amount: roundMoney(movement.amount + adjustment),
    }
  }
  return { direction: movement.direction, amount: movement.amount }
}

export type ExpandTreasuryMovementRowsOptions = {
  timeZone?: string
  /** Una fila con el neto que entró/salió de la cuenta (extracto general). */
  netAccountImpact?: boolean
}

export function expandTreasuryPaymentMethodMovementRows(
  movements: PaymentMethodMovementRow[],
  options?: ExpandTreasuryMovementRowsOptions | string,
): TreasuryDisplayMovementRow[] {
  const resolvedOptions: ExpandTreasuryMovementRowsOptions =
    typeof options === "string" ? { timeZone: options } : (options ?? {})
  const { timeZone, netAccountImpact = false } = resolvedOptions
  const rows: TreasuryDisplayMovementRow[] = []

  for (const movement of movements) {
    const sortAt = treasuryMovementSortKey(movement.date, movement.occurredAt)
    const timeLabel = formatTreasuryMovementTime(
      movement.occurredAt ?? movement.date,
      timeZone,
    )

    if (netAccountImpact && movement.kind === "pos_liquidation") {
      const impact = treasuryMovementAccountImpact(movement)
      rows.push({
        rowKey: `${movement.kind}-${movement.id}`,
        date: movement.date,
        sortAt,
        timeLabel,
        description: "Liquidación",
        amount: formatTreasuryMovementAmount(impact.direction, impact.amount),
        sourceMovement: movement,
      })
      continue
    }

    if (netAccountImpact && movement.kind === "funding_out") {
      const impact = treasuryMovementAccountImpact(movement)
      rows.push({
        rowKey: `${movement.kind}-${movement.id}`,
        date: movement.date,
        sortAt,
        timeLabel,
        description: "Pago de consumos",
        amount: formatTreasuryMovementAmount(impact.direction, impact.amount),
        sourceMovement: movement,
      })
      continue
    }

    if (movement.kind === "pos_liquidation") {
      const adjustment = movement.adjustmentAmount ?? 0
      const totalLiquidated = roundMoney(movement.amount + adjustment)
      rows.push({
        rowKey: `${movement.kind}-${movement.id}-principal`,
        date: movement.date,
        sortAt,
        timeLabel,
        description: "Liquidación",
        amount: formatTreasuryMovementAmount("in", totalLiquidated),
        sourceMovement: movement,
      })
      if (adjustment > 0) {
        rows.push({
          rowKey: `${movement.kind}-${movement.id}-adjustment`,
          date: movement.date,
          sortAt,
          timeLabel: "",
          description: TREASURY_RECONCILE_COMMISSIONS_LABEL,
          amount: formatTreasuryMovementAmount("out", adjustment),
          descriptionClassName: treasuryReconciliationChargesDescriptionClass,
          sourceMovement: movement,
        })
      }
      continue
    }

    if (movement.kind === "funding_out") {
      rows.push({
        rowKey: `${movement.kind}-${movement.id}-principal`,
        date: movement.date,
        sortAt,
        timeLabel,
        description: "Pago de consumos",
        amount: formatTreasuryMovementAmount("out", movement.amount),
        sourceMovement: movement,
      })
      const adjustment = movement.adjustmentAmount ?? 0
      if (adjustment > 0) {
        rows.push({
          rowKey: `${movement.kind}-${movement.id}-adjustment`,
          date: movement.date,
          sortAt,
          timeLabel: "",
          description: TREASURY_CARD_OTHER_CHARGES_LABEL,
          amount: formatTreasuryMovementAmount("out", adjustment),
          descriptionClassName: treasuryReconciliationChargesDescriptionClass,
          sourceMovement: movement,
        })
      }
      continue
    }

    rows.push({
      rowKey: `${movement.kind}-${movement.id}-${movement.sourceAccountName ?? ""}-${movement.treasuryAccountLabel ?? ""}`,
      date: movement.date,
      sortAt,
      timeLabel,
      description: treasuryMovementDescription(movement),
      amount: formatTreasuryMovementAmount(movement.direction, movement.amount),
      sourceMovement: movement,
    })
  }

  return rows
}

export function expandTreasuryReconciliationEventRows(
  events: TreasuryReconciliationEventRow[],
  isPos: boolean,
  timeZone?: string,
): TreasuryDisplayMovementRow[] {
  const rows: TreasuryDisplayMovementRow[] = []

  for (const event of events) {
    const user = event.createdByName?.trim() || "—"
    const sortAt = treasuryMovementSortKey(
      event.eventDate,
      event.eventOccurredAt,
    )
    const timeLabel = formatTreasuryMovementTime(
      event.eventOccurredAt ?? event.eventDate,
      timeZone,
    )

    if (isPos) {
      const totalLiquidated = roundMoney(
        event.principalAmount + event.adjustmentAmount,
      )
      rows.push({
        rowKey: `${event.kind}-${event.id}-principal`,
        date: event.eventDate,
        sortAt,
        timeLabel,
        description: `Liquidado por ${user}`,
        amount: formatTreasuryMovementAmount("in", totalLiquidated),
      })
      if (event.adjustmentAmount > 0) {
        rows.push({
          rowKey: `${event.kind}-${event.id}-adjustment`,
          date: event.eventDate,
          sortAt,
          timeLabel: "",
          description: TREASURY_RECONCILE_COMMISSIONS_LABEL,
          amount: formatTreasuryMovementAmount("out", event.adjustmentAmount),
          suppressTopBorder: true,
          descriptionClassName: treasuryReconciliationChargesDescriptionClass,
        })
      }
      continue
    }

    rows.push({
      rowKey: `${event.kind}-${event.id}-principal`,
      date: event.eventDate,
      sortAt,
      timeLabel,
      description: "Pago de consumos",
      amount: formatTreasuryMovementAmount("out", event.principalAmount),
    })
    if (event.adjustmentAmount > 0) {
      rows.push({
        rowKey: `${event.kind}-${event.id}-adjustment`,
        date: event.eventDate,
        sortAt,
        timeLabel: "",
        description: TREASURY_CARD_OTHER_CHARGES_LABEL,
        amount: formatTreasuryMovementAmount("out", event.adjustmentAmount),
        suppressTopBorder: true,
        descriptionClassName: treasuryReconciliationChargesDescriptionClass,
      })
    }
  }

  return rows
}

/** @deprecated Preferir filas expandidas en listados. */
export function formatTreasuryReconciliationEventDescription(options: {
  isPos: boolean
  createdByName: string | null | undefined
  adjustmentAmount: number
}): string {
  const user = options.createdByName?.trim() || "—"
  const verb = options.isPos ? "Liquidado" : "Pagado"
  const base = `${verb} por ${user}`
  if (options.adjustmentAmount <= 0) return base
  const chargesLabel = options.isPos
    ? TREASURY_RECONCILE_COMMISSIONS_LABEL
    : TREASURY_CARD_OTHER_CHARGES_LABEL
  const chargesAmount = formatTreasuryMovementAmount(
    "out",
    options.adjustmentAmount,
  )
  return `${base} (${chargesLabel} ${chargesAmount})`
}

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
