"use server"

import { createClient } from "@/utils/supabase/server"
import type {
  OrganizationBillingContext,
  PlatformBillingProvider,
  TrialBillingQueueItem,
  UpsertOrganizationPaymentMethodInput,
} from "@/lib/platformBilling/types"

function mapBillingProvider(value: unknown): PlatformBillingProvider {
  if (value === "stripe" || value === "manual" || value === "mercadopago") {
    return value
  }
  return "mercadopago"
}

export async function getOrganizationBillingContext(): Promise<OrganizationBillingContext | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_organization_billing_context")

  if (error || !data || data.length === 0) return null

  const row = data[0] as Record<string, unknown>

  return {
    organizationId: String(row.organization_id ?? ""),
    organizationName: String(row.organization_name ?? ""),
    trialAvailable: Boolean(row.trial_available),
    billingProvider: mapBillingProvider(row.billing_provider),
    stripeCustomerId:
      row.stripe_customer_id != null ? String(row.stripe_customer_id) : null,
    mpPayerId: row.mp_payer_id != null ? String(row.mp_payer_id) : null,
    defaultPaymentMethodId:
      row.default_payment_method_id != null
        ? String(row.default_payment_method_id)
        : null,
    defaultPaymentProvider:
      row.default_payment_provider != null
        ? mapBillingProvider(row.default_payment_provider)
        : null,
    defaultCardBrand:
      row.default_card_brand != null ? String(row.default_card_brand) : null,
    defaultCardLast4:
      row.default_card_last4 != null ? String(row.default_card_last4) : null,
  }
}

export async function upsertOrganizationPaymentMethod(
  input: UpsertOrganizationPaymentMethodInput,
): Promise<{ paymentMethodId: string } | { error: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("upsert_organization_payment_method", {
    p_organization_id: input.organizationId,
    p_provider: input.provider,
    p_external_payment_method_id: input.externalPaymentMethodId,
    p_stripe_customer_id: input.stripeCustomerId ?? null,
    p_mp_payer_id: input.mpPayerId ?? null,
    p_card_brand: input.cardBrand ?? null,
    p_card_last4: input.cardLast4 ?? null,
    p_card_exp_month: input.cardExpMonth ?? null,
    p_card_exp_year: input.cardExpYear ?? null,
    p_set_default: input.setDefault ?? true,
    p_metadata: input.metadata ?? {},
  })

  if (error) {
    return { error: error.message }
  }

  return { paymentMethodId: String(data) }
}

export async function listPopsPendingTrialBilling(): Promise<
  TrialBillingQueueItem[]
> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("list_pops_pending_trial_billing")

  if (error || !data) return []

  return (data as Record<string, unknown>[]).map((row) => ({
    popId: String(row.pop_id ?? ""),
    subscriptionId: String(row.subscription_id ?? ""),
    organizationId: String(row.organization_id ?? ""),
    trialEndsAt: String(row.trial_ends_at ?? ""),
    scheduledPlanId: String(row.scheduled_plan_id ?? ""),
    scheduledBillingCycle:
      row.scheduled_billing_cycle === "yearly" ? "yearly" : "monthly",
    organizationPaymentMethodId: String(
      row.organization_payment_method_id ?? "",
    ),
    mpPayerId: row.mp_payer_id != null ? String(row.mp_payer_id) : null,
  }))
}

export async function startPopTrial(input: {
  popId: string
  scheduledPlanId: string
  billingCycle: "monthly" | "yearly"
  paymentMethodId: string
}): Promise<{ subscriptionId: string } | { error: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("start_pop_trial", {
    p_pop_id: input.popId,
    p_scheduled_plan_id: input.scheduledPlanId,
    p_billing_cycle: input.billingCycle,
    p_payment_method_id: input.paymentMethodId,
    p_extra_modules: [],
  })

  if (error) {
    return { error: error.message }
  }

  return { subscriptionId: String(data) }
}

export async function startPopPaidSubscription(input: {
  popId: string
  planId: string
  billingCycle: "monthly" | "yearly"
  paymentMethodId: string
}): Promise<{ subscriptionId: string } | { error: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("start_pop_paid_subscription", {
    p_pop_id: input.popId,
    p_plan_id: input.planId,
    p_billing_cycle: input.billingCycle,
    p_payment_method_id: input.paymentMethodId,
    p_extra_modules: [],
  })

  if (error) {
    return { error: error.message }
  }

  return { subscriptionId: String(data) }
}

export async function registerPopSubscriptionPayment(input: {
  popId: string
  amount: number
  paymentMethodId?: string | null
  externalPaymentId: string
  metadata?: Record<string, unknown>
}): Promise<{ paymentId: string } | { error: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("register_pop_subscription_payment", {
    p_pop_id: input.popId,
    p_amount: input.amount,
    p_source: "mercadopago",
    p_payment_method_id: input.paymentMethodId ?? null,
    p_external_payment_id: input.externalPaymentId,
    p_metadata: input.metadata ?? {},
  })

  if (error) {
    return { error: error.message }
  }

  return { paymentId: String(data) }
}

export async function getPopPrimaryOpenCharge(input: {
  popId: string
}): Promise<
  | {
      chargeId: string
      balanceDue: number
    }
  | { error: string }
> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("_subscription_charges")
    .select("id, total, amount_paid, status")
    .eq("pop_id", input.popId)
    .in("status", ["open", "partial", "overdue"])
    .order("due_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    return { error: error.message }
  }

  if (!data) {
    return { error: "No hay cargos pendientes para este POP" }
  }

  const total = Number(data.total ?? 0)
  const amountPaid = Number(data.amount_paid ?? 0)
  const balanceDue = Math.max(total - amountPaid, 0)

  if (balanceDue <= 0) {
    return { error: "El cargo inicial ya está saldado" }
  }

  return {
    chargeId: String(data.id),
    balanceDue,
  }
}
