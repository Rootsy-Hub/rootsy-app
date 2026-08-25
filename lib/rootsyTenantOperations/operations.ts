import { postServiceChargePaymentLedger } from "@/lib/serviceChargeAccountingPosting"
import {
  isServiceBillingPeriod,
  isServicePaymentTiming,
  type ServiceBillingPeriod,
  type ServicePaymentTiming,
} from "@/lib/serviceCatalogTypes"
import {
  computeChargeDueDate,
  deriveStoredStatusFromPayments,
  resolveChargePeriodRange,
  roundServiceChargeMoney,
} from "@/lib/serviceChargeTypes"
import { requireRootsyPlatformPopId } from "@/lib/rootsyPlatformPop"
import { getRootsyPlatformPopActorUserId } from "@/lib/rootsyTenantOperations/platformContext"
import { resolveMercadoPagoTreasuryAccountId } from "@/lib/rootsyTenantOperations/treasury"
import { createServiceRoleClient } from "@/utils/supabase/service-role"

function toPaidDateOnly(paidAt: string): string {
  const trimmed = paidAt.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed
  }
  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 10)
  }
  return parsed.toISOString().slice(0, 10)
}

export async function findPlatformOperationLink(
  externalPaymentId: string,
): Promise<{ chargeId: string; paymentId: string | null } | null> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("_platform_operation_links")
    .select("service_charge_id, service_charge_payment_id")
    .eq("external_payment_id", externalPaymentId.trim())
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }
  if (!data?.service_charge_id) return null

  return {
    chargeId: String(data.service_charge_id),
    paymentId:
      data.service_charge_payment_id != null
        ? String(data.service_charge_payment_id)
        : null,
  }
}

async function findOrCreateActiveServiceSubscription(input: {
  popId: string
  clientId: string
  serviceTypeId: string
  unitPrice: number
  periodStart: string
  actorUserId: string
  notes: string
}): Promise<string> {
  const supabase = createServiceRoleClient()

  const { data: existing, error: existingError } = await supabase
    .from("service_subscriptions")
    .select("id")
    .eq("pop_id", input.popId)
    .eq("client_id", input.clientId)
    .eq("service_type_id", input.serviceTypeId)
    .eq("status", "active")
    .maybeSingle()

  if (existingError) {
    throw new Error(existingError.message)
  }
  if (existing?.id) {
    return String(existing.id)
  }

  const { data: created, error: createError } = await supabase
    .from("service_subscriptions")
    .insert({
      pop_id: input.popId,
      client_id: input.clientId,
      service_type_id: input.serviceTypeId,
      status: "active",
      period_start: input.periodStart,
      unit_price: input.unitPrice,
      discount_mode: "none",
      discount_value: null,
      notes: input.notes,
      created_by: input.actorUserId,
    })
    .select("id")
    .single()

  if (createError || !created?.id) {
    throw new Error(
      createError?.message ?? "No se pudo crear la suscripción de servicio.",
    )
  }

  return String(created.id)
}

export type CreatePlatformServiceOperationInput = {
  clientId: string
  serviceTypeId: string
  amount: number
  paidAt: string
  externalPaymentId: string
  customerPopId: string
  organizationId: string
  notes?: string
  metadata?: Record<string, unknown>
}

export async function createPlatformServiceOperation(
  input: CreatePlatformServiceOperationInput,
): Promise<{ chargeId: string; paymentId: string }> {
  const rootsyPopId = requireRootsyPlatformPopId()
  const actorUserId = await getRootsyPlatformPopActorUserId()
  const supabase = createServiceRoleClient()

  const amount = roundServiceChargeMoney(input.amount)
  if (!(amount > 0)) {
    throw new Error("El importe debe ser mayor a cero.")
  }

  const paidDate = toPaidDateOnly(input.paidAt)
  const externalPaymentId = input.externalPaymentId.trim()
  const notes = input.notes?.trim() || "Cobro plataforma Rootsy"

  const { data: serviceRow, error: serviceError } = await supabase
    .from("service_types")
    .select("id, billing_period, payment_timing, due_days_after")
    .eq("id", input.serviceTypeId.trim())
    .eq("pop_id", rootsyPopId)
    .is("deleted_at", null)
    .maybeSingle()

  if (serviceError) {
    throw new Error(serviceError.message)
  }
  if (!serviceRow?.id) {
    throw new Error("El servicio no existe en el POP Rootsy.")
  }

  const billingPeriodRaw = String(serviceRow.billing_period ?? "monthly")
  const billingPeriod: ServiceBillingPeriod = isServiceBillingPeriod(
    billingPeriodRaw,
  )
    ? billingPeriodRaw
    : "monthly"

  const paymentTimingRaw = String(serviceRow.payment_timing ?? "end_of_period")
  const paymentTiming: ServicePaymentTiming = isServicePaymentTiming(
    paymentTimingRaw,
  )
    ? paymentTimingRaw
    : "end_of_period"

  const dueDaysAfter = Math.min(
    365,
    Math.floor(Number(serviceRow.due_days_after ?? 0) || 0),
  )

  const { periodStart, periodEnd } = resolveChargePeriodRange(
    0,
    billingPeriod,
    paidDate,
    null,
  )
  const dueDate = computeChargeDueDate(
    periodStart,
    periodEnd,
    paymentTiming,
    dueDaysAfter,
  )

  const subscriptionId = await findOrCreateActiveServiceSubscription({
    popId: rootsyPopId,
    clientId: input.clientId,
    serviceTypeId: input.serviceTypeId.trim(),
    unitPrice: amount,
    periodStart: paidDate,
    actorUserId,
    notes,
  })

  const { data: chargeRows, error: chargeError } = await supabase
    .from("service_charges")
    .insert({
      pop_id: rootsyPopId,
      client_id: input.clientId,
      service_type_id: input.serviceTypeId.trim(),
      subscription_id: subscriptionId,
      charge_group_id: null,
      sequence_index: 0,
      billing_scope: "subscription",
      period_count: 1,
      payment_mode: "one_time",
      period_start: periodStart,
      period_end: periodEnd,
      unit_price: amount,
      discount_mode: "none",
      discount_value: null,
      amount,
      due_date: dueDate,
      status: "pending",
      notes,
      metadata: {
        platform_payment_id: externalPaymentId,
        customer_pop_id: input.customerPopId,
        ...(input.metadata ?? {}),
      },
      created_by: actorUserId,
    })
    .select("id")
    .single()

  if (chargeError || !chargeRows?.id) {
    throw new Error(chargeError?.message ?? "No se pudo crear el cargo.")
  }

  const chargeId = String(chargeRows.id)
  const treasuryAccountId = await resolveMercadoPagoTreasuryAccountId()

  const { data: paymentRow, error: paymentError } = await supabase
    .from("service_charge_payments")
    .insert({
      pop_id: rootsyPopId,
      service_charge_id: chargeId,
      amount,
      paid_at: paidDate,
      payment_kind: treasuryAccountId ? "card_credit" : null,
      treasury_account_id: treasuryAccountId,
      notes: `${notes} · MP ${externalPaymentId}`,
      created_by: actorUserId,
    })
    .select("id")
    .single()

  if (paymentError || !paymentRow?.id) {
    throw new Error(paymentError?.message ?? "No se pudo registrar el cobro.")
  }

  const paymentId = String(paymentRow.id)

  if (treasuryAccountId) {
    const ledger = await postServiceChargePaymentLedger(supabase, {
      popId: rootsyPopId,
      userId: actorUserId,
      serviceChargePaymentId: paymentId,
    })
    if (!ledger.success) {
      throw new Error(ledger.error)
    }
  }

  const nextStatus = deriveStoredStatusFromPayments(amount, amount, "pending")
  const { error: statusError } = await supabase
    .from("service_charges")
    .update({ status: nextStatus })
    .eq("id", chargeId)
    .eq("pop_id", rootsyPopId)

  if (statusError) {
    throw new Error(statusError.message)
  }

  const { error: linkError } = await supabase
    .from("_platform_operation_links")
    .insert({
      external_payment_id: externalPaymentId,
      customer_pop_id: input.customerPopId,
      organization_id: input.organizationId,
      service_charge_id: chargeId,
      service_charge_payment_id: paymentId,
      amount,
      metadata: input.metadata ?? {},
    })

  if (linkError) {
    throw new Error(linkError.message)
  }

  return { chargeId, paymentId }
}
