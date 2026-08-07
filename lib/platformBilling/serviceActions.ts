import { createServiceRoleClient } from "@/utils/supabase/service-role"
import type { PlatformBillingPaymentSource } from "@/lib/platformBilling/types"

export async function recordBillingProviderEvent(input: {
  provider: PlatformBillingPaymentSource
  externalEventId: string
  eventType: string
  payload: Record<string, unknown>
}): Promise<string> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.rpc("record_billing_provider_event", {
    p_provider: input.provider,
    p_external_event_id: input.externalEventId,
    p_event_type: input.eventType,
    p_payload: input.payload,
  })

  if (error) {
    throw new Error(error.message)
  }

  return String(data)
}

export async function markBillingProviderEventProcessed(
  eventId: string,
  errorMessage?: string | null,
): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase.rpc("mark_billing_provider_event_processed", {
    p_event_id: eventId,
    p_error: errorMessage ?? null,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function findMercadoPagoSubscriptionPayment(
  externalPaymentId: string,
): Promise<{ id: string } | null> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("_subscription_payments")
    .select("id")
    .eq("source", "mercadopago")
    .eq("external_payment_id", externalPaymentId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? { id: String(data.id) } : null
}

export async function registerPopSubscriptionPaymentAsSystem(input: {
  popId: string
  amount: number
  paidAt?: string | null
  paymentMethodId?: string | null
  externalPaymentId: string
  metadata?: Record<string, unknown>
}): Promise<string> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.rpc("register_pop_subscription_payment", {
    p_pop_id: input.popId,
    p_amount: input.amount,
    p_paid_at: input.paidAt ?? new Date().toISOString(),
    p_source: "mercadopago",
    p_payment_method_id: input.paymentMethodId ?? null,
    p_external_payment_id: input.externalPaymentId,
    p_metadata: input.metadata ?? {},
  })

  if (error) {
    throw new Error(error.message)
  }

  return String(data)
}
