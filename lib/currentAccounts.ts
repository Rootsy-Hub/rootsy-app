export type CurrentAccountDirection = "receivable" | "payable"

export type CurrentAccountDocumentKind = "sale" | "purchase"

export const CURRENT_ACCOUNT_DIRECTIONS: {
  value: CurrentAccountDirection
  label: string
}[] = [
  { value: "receivable", label: "Clientes" },
  { value: "payable", label: "Proveedores" },
]

export const CURRENT_ACCOUNT_DOCUMENT_KINDS: {
  value: CurrentAccountDocumentKind
  label: string
}[] = [
  { value: "sale", label: "Venta" },
  { value: "purchase", label: "Compra" },
]

export function currentAccountDirectionLabel(
  direction: CurrentAccountDirection | string,
): string {
  return (
    CURRENT_ACCOUNT_DIRECTIONS.find((item) => item.value === direction)?.label ??
    String(direction || "—")
  )
}

export function currentAccountDocumentKindLabel(
  kind: CurrentAccountDocumentKind | string,
): string {
  return (
    CURRENT_ACCOUNT_DOCUMENT_KINDS.find((item) => item.value === kind)?.label ??
    String(kind || "—")
  )
}

export function isCurrentAccountDirection(
  value: string,
): value is CurrentAccountDirection {
  return CURRENT_ACCOUNT_DIRECTIONS.some((item) => item.value === value)
}

export function isCurrentAccountDocumentKind(
  value: string,
): value is CurrentAccountDocumentKind {
  return CURRENT_ACCOUNT_DOCUMENT_KINDS.some((item) => item.value === value)
}

export function currentAccountDocumentKindForDirection(
  direction: CurrentAccountDirection,
): CurrentAccountDocumentKind {
  return direction === "payable" ? "purchase" : "sale"
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

/** Saldo abierto de un comprobante o recibo. Nunca negativo. */
export function currentAccountOpenAmount(
  total: number,
  allocated: number,
): number {
  return Math.max(0, roundMoney(total) - roundMoney(allocated))
}

export function currentAccountIsOpen(total: number, allocated: number): boolean {
  return currentAccountOpenAmount(total, allocated) > 0.009
}

export function currentAccountDocumentLabel(
  kind: CurrentAccountDocumentKind,
  documentNumber: string,
): string {
  const number = documentNumber.trim()
  if (kind === "purchase") {
    return number ? `Compra ${number}` : "Compra"
  }
  return number ? `Venta ${number}` : "Venta"
}

export type CurrentAccountAgingBucket =
  | "current"
  | "d1_30"
  | "d31_60"
  | "d61_plus"

export type CurrentAccountAgingFilter = "all" | CurrentAccountAgingBucket

export type CurrentAccountAgingTotals = Record<CurrentAccountAgingBucket, number>

export const CURRENT_ACCOUNT_AGING_BUCKETS: {
  value: CurrentAccountAgingBucket
  label: string
}[] = [
  { value: "current", label: "Al día" },
  { value: "d1_30", label: "1–30" },
  { value: "d31_60", label: "31–60" },
  { value: "d61_plus", label: "+61" },
]

export const CURRENT_ACCOUNT_AGING_FILTERS: {
  value: CurrentAccountAgingFilter
  label: string
}[] = [
  { value: "all", label: "Todos" },
  ...CURRENT_ACCOUNT_AGING_BUCKETS,
]

export function isCurrentAccountAgingFilter(
  value: string,
): value is CurrentAccountAgingFilter {
  return CURRENT_ACCOUNT_AGING_FILTERS.some((item) => item.value === value)
}

export function currentAccountAgingBucketLabel(
  bucket: CurrentAccountAgingBucket | string,
): string {
  return (
    CURRENT_ACCOUNT_AGING_BUCKETS.find((item) => item.value === bucket)?.label ??
    String(bucket || "—")
  )
}

export function currentAccountAgingFilterLabel(
  filter: CurrentAccountAgingFilter | string,
): string {
  return (
    CURRENT_ACCOUNT_AGING_FILTERS.find((item) => item.value === filter)?.label ??
    String(filter || "—")
  )
}

export const CURRENT_ACCOUNT_SALE_DEFAULT_DUE_DAYS = 30

/** Suma días a una fecha ISO `YYYY-MM-DD` sin corrimiento por huso. */
export function addIsoCalendarDays(isoDate: string, days: number): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate
  const [year, month, day] = isoDate.split("-").map(Number)
  const next = new Date(Date.UTC(year, month - 1, day + days))
  return next.toISOString().slice(0, 10)
}

function isoDateMs(iso: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  const ms = Date.parse(`${iso}T12:00:00`)
  return Number.isFinite(ms) ? ms : null
}

/** Días corridos desde el vencimiento. Cero o negativo = al día. */
export function currentAccountDaysOverdue(
  dueDate: string,
  today: string,
): number {
  const due = isoDateMs(dueDate)
  const now = isoDateMs(today)
  if (due == null || now == null) return 0
  return Math.floor((now - due) / 86_400_000)
}

export function currentAccountAgingBucket(
  dueDate: string,
  today: string,
): CurrentAccountAgingBucket {
  const days = currentAccountDaysOverdue(dueDate, today)
  if (days <= 0) return "current"
  if (days <= 30) return "d1_30"
  if (days <= 60) return "d31_60"
  return "d61_plus"
}

export function emptyCurrentAccountAgingTotals(): CurrentAccountAgingTotals {
  return { current: 0, d1_30: 0, d31_60: 0, d61_plus: 0 }
}

export function addCurrentAccountAgingAmount(
  totals: CurrentAccountAgingTotals,
  bucket: CurrentAccountAgingBucket,
  amount: number,
): CurrentAccountAgingTotals {
  const next = { ...totals }
  next[bucket] = roundMoney(next[bucket] + amount)
  return next
}

export function currentAccountWorstAgingBucket(
  totals: CurrentAccountAgingTotals,
): CurrentAccountAgingBucket {
  if (totals.d61_plus > 0.009) return "d61_plus"
  if (totals.d31_60 > 0.009) return "d31_60"
  if (totals.d1_30 > 0.009) return "d1_30"
  return "current"
}

export function currentAccountOpenDocumentAgingLabel(
  daysOverdue: number,
): string {
  if (daysOverdue <= 0) return "al día"
  if (daysOverdue === 1) return "1 día vencida"
  return `${daysOverdue} días vencida`
}
