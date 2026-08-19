import type { OperationServiceChargeRow } from "@/app/[siteId]/[popId]/operations/actions"
import { billingPeriodDisplayLabel } from "@/lib/serviceCatalogTypes"
import {
  SERVICE_CHARGE_BILLING_SCOPE_LABELS,
  SERVICE_CHARGE_PAYMENT_MODE_LABELS,
  SERVICE_CHARGE_STATUS_LABELS,
} from "@/lib/serviceChargeTypes"

export function serviceChargeStatusLabel(row: OperationServiceChargeRow): string {
  return SERVICE_CHARGE_STATUS_LABELS[row.effectiveStatus]
}

export function serviceChargeRhythmLabel(row: OperationServiceChargeRow): string {
  const period = billingPeriodDisplayLabel(
    row.billingPeriod,
    row.billingPeriodLabel,
  )
  const scope = SERVICE_CHARGE_BILLING_SCOPE_LABELS[row.billingScope]
  if (row.billingPeriod === "none") return scope
  return `${period} · ${scope}`
}

export function serviceChargePaymentModeLabel(
  row: OperationServiceChargeRow,
): string {
  return SERVICE_CHARGE_PAYMENT_MODE_LABELS[row.paymentMode]
}
