"use server"

import { createPop } from "@/lib/popHelpers"
import { requireAuthenticatedUser } from "@/lib/authHelpers"
import { getMercadoPagoRuntimeConfig } from "@/lib/platformBilling/mercadopago/config"
import {
  findOrCreateMercadoPagoCustomer,
  saveMercadoPagoCustomerCard,
} from "@/lib/platformBilling/mercadopago/customers"
import { createMercadoPagoPayment } from "@/lib/platformBilling/mercadopago/client"
import {
  getOrganizationBillingContext,
  getPopPrimaryOpenCharge,
  registerPopSubscriptionPayment,
  startPopPaidSubscription,
  startPopTrial,
  upsertOrganizationPaymentMethod,
} from "@/lib/platformBilling/actions"
import { createClient } from "@/utils/supabase/server"

export type BusinessTypeOption = {
  id: string
  name: string
  displayName: string
  description: string | null
}

export type PopCreatePlanOption = {
  id: string
  name: string
  displayName: string
  description: string | null
  priceMonthly: number
  priceYearly: number
}

export type PopCreateBillingSetup = {
  trialAvailable: boolean
  mercadoPagoPublicKey: string | null
  mercadoPagoConfigured: boolean
}

export type FinalizePopCreationInput = {
  popName: string
  businessTypeId?: string
  planId: string
  billingCycle: "monthly" | "yearly"
  cardToken: string
  paymentCardToken?: string
}

export async function getActiveBusinessTypes(): Promise<BusinessTypeOption[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("_business_types")
      .select("id, name, display_name, description")
      .eq("is_active", true)
      .eq("is_public", true)
      .order("display_name", { ascending: true })

    if (error || !data) return []

    return data.map((row) => ({
      id: String(row.id),
      name: String(row.name ?? ""),
      displayName: String(row.display_name ?? row.name ?? ""),
      description:
        row.description != null ? String(row.description) : null,
    }))
  } catch {
    return []
  }
}

export async function getPopCreateBillingSetup(): Promise<PopCreateBillingSetup> {
  const mpConfig = getMercadoPagoRuntimeConfig()
  const billingContext = await getOrganizationBillingContext()

  return {
    trialAvailable: billingContext?.trialAvailable ?? true,
    mercadoPagoPublicKey: mpConfig.publicKey,
    mercadoPagoConfigured: mpConfig.isConfigured,
  }
}

export async function getPopCreatePlanOptions(
  businessTypeId: string,
): Promise<PopCreatePlanOption[]> {
  if (!businessTypeId.trim()) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("_subscription_plan_limits")
    .select(
      `
      price_monthly,
      price_yearly,
      plan:_subscription_plans (
        id,
        name,
        display_name,
        description,
        sort_order,
        is_active,
        is_public
      )
    `,
    )
    .eq("business_type_id", businessTypeId)
    .order("price_monthly", { ascending: true })

  if (error || !data) return []

  const plans = new Map<string, PopCreatePlanOption>()

  for (const row of data) {
    const planRaw = Array.isArray(row.plan) ? row.plan[0] : row.plan
    if (!planRaw || planRaw.is_active !== true || planRaw.is_public !== true) continue
    if (planRaw.name === "free_trial" || planRaw.name === "enterprise") continue

    const planId = String(planRaw.id)
    plans.set(planId, {
      id: planId,
      name: String(planRaw.name ?? ""),
      displayName: String(planRaw.display_name ?? planRaw.name ?? ""),
      description:
        planRaw.description != null ? String(planRaw.description) : null,
      priceMonthly: Number(row.price_monthly ?? 0),
      priceYearly: Number(row.price_yearly ?? 0),
    })
  }

  return [...plans.values()].sort((a, b) => {
    const order = ["starter", "professional", "enterprise"]
    return order.indexOf(a.name) - order.indexOf(b.name)
  })
}

export async function finalizePopCreation(
  input: FinalizePopCreationInput,
): Promise<
  | {
      success: true
      pop: { id: string; name: string; siteId: string }
      mode: "trial" | "paid"
    }
  | { success: false; error: string; details?: string }
> {
  try {
    const user = await requireAuthenticatedUser()
    const mpConfig = getMercadoPagoRuntimeConfig()

    if (!mpConfig.isConfigured) {
      return {
        success: false,
        error: "Mercado Pago no configurado",
        details:
          "Definí NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY y MERCADOPAGO_ACCESS_TOKEN.",
      }
    }

    const billingSetup = await getPopCreateBillingSetup()
    const billingContext = await getOrganizationBillingContext()

    const popResult = await createPop({
      name: input.popName.trim(),
      businessTypeId: input.businessTypeId,
    })

    if (!popResult.success) {
      return popResult
    }

    const supabase = await createClient()
    const { data: popRow, error: popError } = await supabase
      .from("pops")
      .select("organization_id")
      .eq("id", popResult.pop.id)
      .single()

    if (popError || !popRow?.organization_id) {
      return {
        success: false,
        error: "No se pudo resolver la organización del negocio",
        details: popError?.message,
      }
    }

    const organizationId = String(popRow.organization_id)
    const mpCustomer = await findOrCreateMercadoPagoCustomer(user.email ?? "")
    const savedCard = await saveMercadoPagoCustomerCard({
      customerId: mpCustomer.id,
      cardToken: input.cardToken,
    })

    const paymentMethodResult = await upsertOrganizationPaymentMethod({
      organizationId,
      provider: "mercadopago",
      externalPaymentMethodId: savedCard.cardId,
      mpPayerId: mpCustomer.id,
      cardBrand: savedCard.brand,
      cardLast4: savedCard.last4,
      cardExpMonth: savedCard.expMonth,
      cardExpYear: savedCard.expYear,
      setDefault: true,
      metadata: {
        source: "pop_create",
        pop_id: popResult.pop.id,
      },
    })

    if ("error" in paymentMethodResult) {
      return {
        success: false,
        error: "No se pudo guardar la tarjeta",
        details: paymentMethodResult.error,
      }
    }

    const paymentMethodId = paymentMethodResult.paymentMethodId
    const trialAvailable =
      billingSetup.trialAvailable && (billingContext?.trialAvailable ?? true)

    if (trialAvailable) {
      const trialResult = await startPopTrial({
        popId: popResult.pop.id,
        scheduledPlanId: input.planId,
        billingCycle: input.billingCycle,
        paymentMethodId,
      })

      if ("error" in trialResult) {
        return {
          success: false,
          error: "No se pudo iniciar la prueba gratis",
          details: trialResult.error,
        }
      }

      return {
        success: true,
        pop: popResult.pop,
        mode: "trial",
      }
    }

    const paidResult = await startPopPaidSubscription({
      popId: popResult.pop.id,
      planId: input.planId,
      billingCycle: input.billingCycle,
      paymentMethodId,
    })

    if ("error" in paidResult) {
      return {
        success: false,
        error: "No se pudo activar la suscripción",
        details: paidResult.error,
      }
    }

    const openCharge = await getPopPrimaryOpenCharge({ popId: popResult.pop.id })
    if ("error" in openCharge) {
      return {
        success: false,
        error: "No se pudo obtener el cargo inicial",
        details: openCharge.error,
      }
    }

    const mpPayment = await createMercadoPagoPayment({
      transactionAmount: openCharge.balanceDue,
      token: input.paymentCardToken ?? input.cardToken,
      description: `Suscripción Rootsy — ${popResult.pop.name}`,
      payerEmail: user.email ?? "",
      billing: {
        popId: popResult.pop.id,
        chargeId: openCharge.chargeId,
        organizationPaymentMethodId: paymentMethodId,
      },
      metadata: {
        subscription_id: paidResult.subscriptionId,
        billing_cycle: input.billingCycle,
      },
    })

    if (mpPayment.status === "approved") {
      const registerResult = await registerPopSubscriptionPayment({
        popId: popResult.pop.id,
        amount: openCharge.balanceDue,
        paymentMethodId,
        externalPaymentId: String(mpPayment.id),
        metadata: {
          mercadopago_status: mpPayment.status,
          charge_id: openCharge.chargeId,
          source: "pop_create_paid",
        },
      })

      if ("error" in registerResult) {
        return {
          success: false,
          error: "El pago se aprobó pero no se registró en Rootsy",
          details: registerResult.error,
        }
      }
    } else if (
      mpPayment.status !== "pending" &&
      mpPayment.status !== "in_process"
    ) {
      return {
        success: false,
        error: "El pago fue rechazado",
        details: mpPayment.status_detail ?? mpPayment.status ?? "rejected",
      }
    }

    return {
      success: true,
      pop: popResult.pop,
      mode: "paid",
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido"
    return {
      success: false,
      error: "Error inesperado al crear el negocio",
      details: message,
    }
  }
}
