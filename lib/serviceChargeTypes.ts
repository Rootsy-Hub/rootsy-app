import type {
  ServiceBillingPeriod,
  ServiceDiscountMode,
  ServicePaymentTiming,
} from "@/lib/serviceCatalogTypes"

export const SERVICE_CHARGE_BILLING_SCOPES = [
  "one_period",
  "multi_period",
  "subscription",
] as const

export type ServiceChargeBillingScope =
  (typeof SERVICE_CHARGE_BILLING_SCOPES)[number]

export const SERVICE_CHARGE_BILLING_SCOPE_LABELS: Record<
  ServiceChargeBillingScope,
  string
> = {
  one_period: "1 período",
  multi_period: "N períodos",
  subscription: "Suscripción",
}

export const SERVICE_CHARGE_PAYMENT_MODES = ["one_time", "subscription"] as const

export type ServiceChargePaymentMode =
  (typeof SERVICE_CHARGE_PAYMENT_MODES)[number]

export const SERVICE_CHARGE_PAYMENT_MODE_LABELS: Record<
  ServiceChargePaymentMode,
  string
> = {
  one_time: "Pago único",
  subscription: "Suscripción",
}

export const SERVICE_CHARGE_STORED_STATUSES = [
  "pending",
  "partial",
  "paid",
  "cancelled",
] as const

export type ServiceChargeStoredStatus =
  (typeof SERVICE_CHARGE_STORED_STATUSES)[number]

export type ServiceChargeEffectiveStatus =
  | ServiceChargeStoredStatus
  | "overdue"

export const SERVICE_CHARGE_STATUS_LABELS: Record<
  ServiceChargeEffectiveStatus,
  string
> = {
  pending: "Pendiente",
  partial: "Parcial",
  paid: "Pagado",
  overdue: "Vencido",
  cancelled: "Cancelado",
}

export function isServiceChargeBillingScope(
  v: unknown,
): v is ServiceChargeBillingScope {
  return (
    typeof v === "string" &&
    (SERVICE_CHARGE_BILLING_SCOPES as readonly string[]).includes(v)
  )
}

export function isServiceChargePaymentMode(
  v: unknown,
): v is ServiceChargePaymentMode {
  return (
    typeof v === "string" &&
    (SERVICE_CHARGE_PAYMENT_MODES as readonly string[]).includes(v)
  )
}

export function roundServiceChargeMoney(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 100) / 100
}

export function computeChargeAmount(
  unitPrice: number,
  discountMode: ServiceDiscountMode | "none",
  discountValue: number | null,
): number {
  const base = roundServiceChargeMoney(unitPrice)
  if (discountMode === "none" || discountValue == null || discountValue <= 0) {
    return base
  }
  if (discountMode === "porcentaje") {
    const pct = Math.min(100, Math.max(0, discountValue))
    return roundServiceChargeMoney(base * (1 - pct / 100))
  }
  return roundServiceChargeMoney(Math.max(0, base - discountValue))
}

function parseIsoDateOnly(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y!, (m ?? 1) - 1, d ?? 1)
}

function formatIsoDateOnly(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function addBillingPeriodsToDate(
  isoDate: string,
  billingPeriod: ServiceBillingPeriod,
  count: number,
): string {
  const d = parseIsoDateOnly(isoDate)
  const n = Math.max(0, Math.floor(count))
  switch (billingPeriod) {
    case "hourly":
      d.setHours(d.getHours() + n)
      break
    case "weekly":
      d.setDate(d.getDate() + n * 7)
      break
    case "monthly":
      d.setMonth(d.getMonth() + n)
      break
    case "yearly":
      d.setFullYear(d.getFullYear() + n)
      break
    case "custom":
    case "none":
    default:
      d.setDate(d.getDate() + n)
      break
  }
  return formatIsoDateOnly(d)
}

export function computePeriodEnd(
  periodStart: string,
  billingPeriod: ServiceBillingPeriod,
): string {
  if (billingPeriod === "none") return periodStart
  return addBillingPeriodsToDate(periodStart, billingPeriod, 1)
}

export function billingPeriodRequiresManualPeriodEnd(
  billingPeriod: ServiceBillingPeriod,
): boolean {
  return billingPeriod === "hourly" || billingPeriod === "custom"
}

function diffDaysBetweenIsoDates(start: string, end: string): number {
  const a = parseIsoDateOnly(start)
  const b = parseIsoDateOnly(end)
  return Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000))
}

export function resolveChargePeriodEnd(
  periodStart: string,
  billingPeriod: ServiceBillingPeriod,
  manualPeriodEndDate: string | null | undefined,
): string {
  if (billingPeriodRequiresManualPeriodEnd(billingPeriod)) {
    const manual = manualPeriodEndDate?.trim()
    return manual && /^\d{4}-\d{2}-\d{2}$/.test(manual) ? manual : periodStart
  }
  return computePeriodEnd(periodStart, billingPeriod)
}

export function resolveChargePeriodRange(
  index: number,
  billingPeriod: ServiceBillingPeriod,
  periodStartDate: string,
  manualPeriodEndDate: string | null | undefined,
): { periodStart: string; periodEnd: string } {
  const firstStart = periodStartDate.trim()
  if (billingPeriodRequiresManualPeriodEnd(billingPeriod)) {
    const firstEnd = resolveChargePeriodEnd(
      firstStart,
      billingPeriod,
      manualPeriodEndDate,
    )
    if (index === 0) {
      return { periodStart: firstStart, periodEnd: firstEnd }
    }
    const spanDays = Math.max(1, diffDaysBetweenIsoDates(firstStart, firstEnd))
    const offset = spanDays * index
    return {
      periodStart: addDaysToIsoDate(firstStart, offset),
      periodEnd: addDaysToIsoDate(firstEnd, offset),
    }
  }
  const periodStart = addBillingPeriodsToDate(firstStart, billingPeriod, index)
  return {
    periodStart,
    periodEnd: computePeriodEnd(periodStart, billingPeriod),
  }
}

export function addDaysToIsoDate(isoDate: string, days: number): string {
  const d = parseIsoDateOnly(isoDate)
  d.setDate(d.getDate() + Math.max(0, Math.floor(days)))
  return formatIsoDateOnly(d)
}

export function billingPeriodAllowsMultiPeriodScope(
  billingPeriod: ServiceBillingPeriod,
): boolean {
  return (
    billingPeriod === "hourly" ||
    billingPeriod === "custom" ||
    billingPeriod === "none"
  )
}

export function billingPeriodAllowsSubscriptionScope(
  billingPeriod: ServiceBillingPeriod,
): boolean {
  return (
    billingPeriod === "weekly" ||
    billingPeriod === "monthly" ||
    billingPeriod === "yearly"
  )
}

export function availableBillingScopesForService(
  billingPeriod: ServiceBillingPeriod,
): ServiceChargeBillingScope[] {
  const scopes: ServiceChargeBillingScope[] = ["one_period"]
  if (billingPeriodAllowsMultiPeriodScope(billingPeriod)) {
    scopes.push("multi_period")
  }
  if (billingPeriodAllowsSubscriptionScope(billingPeriod)) {
    scopes.push("subscription")
  }
  return scopes
}

export function computeChargeDueDate(
  periodStart: string,
  periodEnd: string,
  paymentTiming: ServicePaymentTiming,
  dueDaysAfter: number,
): string {
  const anchor = getChargeDueDateAnchor(
    periodStart,
    periodEnd,
    paymentTiming,
  )
  return addDaysToIsoDate(anchor, dueDaysAfter)
}

export function getChargeDueDateAnchor(
  periodStart: string,
  periodEnd: string,
  paymentTiming: ServicePaymentTiming,
): string {
  return paymentTiming === "during_period" ? periodStart : periodEnd
}

export function describeChargeDueDateRule(
  periodStart: string,
  periodEnd: string,
  paymentTiming: ServicePaymentTiming,
  dueDaysAfter: number,
): string {
  const anchor = getChargeDueDateAnchor(
    periodStart,
    periodEnd,
    paymentTiming,
  )
  const anchorLabel =
    paymentTiming === "during_period"
      ? "inicio del período"
      : "fin del período"
  if (dueDaysAfter > 0) {
    return `${anchorLabel} (${anchor}) + ${dueDaysAfter} día${dueDaysAfter === 1 ? "" : "s"}`
  }
  return `${anchorLabel} (${anchor})`
}

export function todayIsoDateOnly(): string {
  const t = new Date()
  return formatIsoDateOnly(t)
}

export function resolveServiceChargeEffectiveStatus(input: {
  storedStatus: ServiceChargeStoredStatus
  cancelledAt: string | null
  amount: number
  paidTotal: number
  dueDate: string
  today?: string
}): ServiceChargeEffectiveStatus {
  if (input.storedStatus === "cancelled" || input.cancelledAt) {
    return "cancelled"
  }
  const balance = roundServiceChargeMoney(input.amount - input.paidTotal)
  if (balance <= 0) return "paid"
  const today = input.today ?? todayIsoDateOnly()
  const isOverdue = input.dueDate < today
  if (isOverdue) return "overdue"
  if (input.paidTotal > 0 || input.storedStatus === "partial") return "partial"
  return "pending"
}

export function deriveStoredStatusFromPayments(
  amount: number,
  paidTotal: number,
  current: ServiceChargeStoredStatus,
): ServiceChargeStoredStatus {
  if (current === "cancelled") return "cancelled"
  const balance = roundServiceChargeMoney(amount - paidTotal)
  if (balance <= 0) return "paid"
  if (paidTotal > 0) return "partial"
  return "pending"
}

export function billingPeriodDisplayForCharge(
  billingPeriod: ServiceBillingPeriod,
  billingPeriodLabel: string | null,
  periodStart: string | null,
  periodEnd: string | null,
  sequenceIndex: number,
  periodCount: number,
): string {
  const range =
    periodStart && periodEnd
      ? periodStart === periodEnd
        ? periodStart
        : `${periodStart} → ${periodEnd}`
      : null
  if (periodCount > 1) {
    return `Período ${sequenceIndex + 1}/${periodCount}${range ? ` · ${range}` : ""}`
  }
  if (range) return range
  if (billingPeriod === "custom" && billingPeriodLabel?.trim()) {
    return billingPeriodLabel.trim()
  }
  return billingPeriod
}
