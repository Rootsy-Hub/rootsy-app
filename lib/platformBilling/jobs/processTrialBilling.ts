import { getMercadoPagoRuntimeConfig } from "@/lib/platformBilling/mercadopago/config"
import { createMercadoPagoPaymentWithSavedCard } from "@/lib/platformBilling/mercadopago/client"
import { getMercadoPagoCustomerCard } from "@/lib/platformBilling/mercadopago/customers"
import {
  findMercadoPagoSubscriptionPayment,
  registerPopSubscriptionPaymentAsSystem,
} from "@/lib/platformBilling/serviceActions"
import type { TrialBillingQueueItem } from "@/lib/platformBilling/types"
import {
  createTrialConversionCharge,
  findTrialConversionCharge,
  getOrganizationPaymentMethodAsSystem,
  getPopBillingOwnerEmail,
  listPopsPendingTrialBillingAsSystem,
  logSubscriptionBillingEvent,
} from "@/lib/platformBilling/trialBillingService"
import { notifyTrialConversionFailure } from "@/lib/platformBilling/trialBillingAlerts"
import { mirrorPlatformSubscriptionPayment } from "@/lib/rootsyTenantOperations"

export type TrialBillingJobItemResult = {
  popId: string
  subscriptionId: string
  status: "paid" | "pending" | "failed" | "skipped"
  message: string
  alertSent?: boolean
}

export type TrialBillingJobResult = {
  processed: number
  succeeded: number
  failed: number
  pending: number
  skipped: number
  alertsSent: number
  items: TrialBillingJobItemResult[]
}

async function ensureTrialConversionCharge(
  item: TrialBillingQueueItem,
): Promise<{ chargeId: string; balanceDue: number }> {
  const existing = await findTrialConversionCharge({
    subscriptionId: item.subscriptionId,
    trialEndsAt: item.trialEndsAt,
  })

  if (existing) {
    if (existing.balanceDue <= 0) {
      return { chargeId: existing.chargeId, balanceDue: 0 }
    }
    return {
      chargeId: existing.chargeId,
      balanceDue: existing.balanceDue,
    }
  }

  const chargeId = await createTrialConversionCharge({
    subscriptionId: item.subscriptionId,
    trialEndsAt: item.trialEndsAt,
  })

  const created = await findTrialConversionCharge({
    subscriptionId: item.subscriptionId,
    trialEndsAt: item.trialEndsAt,
  })

  if (!created) {
    throw new Error("No se pudo confirmar el cargo de conversión de trial")
  }

  return {
    chargeId: created.chargeId ?? chargeId,
    balanceDue: created.balanceDue,
  }
}

async function notifyFailureIfNeeded(
  item: TrialBillingQueueItem,
  failureMessage: string,
  owner?: { email: string; popName: string } | null,
): Promise<boolean> {
  const resolvedOwner = owner ?? (await getPopBillingOwnerEmail(item.popId))
  if (!resolvedOwner?.email) return false

  const alert = await notifyTrialConversionFailure({
    popId: item.popId,
    subscriptionId: item.subscriptionId,
    trialEndsAt: item.trialEndsAt,
    popName: resolvedOwner.popName,
    ownerEmail: resolvedOwner.email,
    failureMessage,
  })

  return alert.sent
}

async function processTrialBillingItem(
  item: TrialBillingQueueItem,
): Promise<TrialBillingJobItemResult> {
  const base = {
    popId: item.popId,
    subscriptionId: item.subscriptionId,
  }

  try {
    const { chargeId, balanceDue } = await ensureTrialConversionCharge(item)

    if (balanceDue <= 0) {
      return {
        ...base,
        status: "skipped",
        message: "El cargo post-trial ya está saldado",
      }
    }

    if (!item.mpPayerId) {
      throw new Error("La organización no tiene mp_payer_id configurado")
    }

    const paymentMethod = await getOrganizationPaymentMethodAsSystem(
      item.organizationPaymentMethodId,
    )

    if (!paymentMethod || paymentMethod.provider !== "mercadopago") {
      throw new Error("Medio de pago de Mercado Pago inválido o inactivo")
    }

    const owner = await getPopBillingOwnerEmail(item.popId)
    if (!owner?.email) {
      throw new Error("No se pudo resolver el email del owner del POP")
    }

    const savedCard = await getMercadoPagoCustomerCard({
      customerId: item.mpPayerId,
      cardId: paymentMethod.externalPaymentMethodId,
    })

    const mpPayment = await createMercadoPagoPaymentWithSavedCard({
      transactionAmount: balanceDue,
      customerId: item.mpPayerId,
      cardId: savedCard.cardId,
      paymentMethodId: savedCard.brand,
      issuerId: savedCard.issuerId,
      description: `Rootsy — fin de prueba (${owner.popName})`,
      payerEmail: owner.email,
      billing: {
        popId: item.popId,
        chargeId,
        organizationPaymentMethodId: item.organizationPaymentMethodId,
      },
      metadata: {
        trial_conversion: true,
        subscription_id: item.subscriptionId,
        scheduled_plan_id: item.scheduledPlanId,
        billing_cycle: item.scheduledBillingCycle,
      },
    })

    const paymentId = String(mpPayment.id)

    if (mpPayment.status === "approved") {
      const existing = await findMercadoPagoSubscriptionPayment(paymentId)
      if (!existing) {
        await registerPopSubscriptionPaymentAsSystem({
          popId: item.popId,
          amount: balanceDue,
          paidAt: mpPayment.date_approved ?? new Date().toISOString(),
          paymentMethodId: item.organizationPaymentMethodId,
          externalPaymentId: paymentId,
          metadata: {
            trial_conversion: true,
            charge_id: chargeId,
            mercadopago_status: mpPayment.status,
            source: "trial_billing_job",
          },
        })

        await mirrorPlatformSubscriptionPayment({
          customerPopId: item.popId,
          amount: balanceDue,
          paidAt: mpPayment.date_approved ?? new Date().toISOString(),
          externalPaymentId: paymentId,
          notes: `Conversión trial — ${owner.popName}`,
          metadata: {
            source: "trial_billing_job",
            trial_conversion: true,
            charge_id: chargeId,
            subscription_id: item.subscriptionId,
          },
        })
      }

      await logSubscriptionBillingEvent({
        popId: item.popId,
        subscriptionId: item.subscriptionId,
        eventType: "trial_converted",
        payload: {
          charge_id: chargeId,
          payment_id: paymentId,
          amount: balanceDue,
          scheduled_plan_id: item.scheduledPlanId,
          billing_cycle: item.scheduledBillingCycle,
        },
      })

      return {
        ...base,
        status: "paid",
        message: `Cobro aprobado (${paymentId})`,
      }
    }

    if (mpPayment.status === "pending" || mpPayment.status === "in_process") {
      await logSubscriptionBillingEvent({
        popId: item.popId,
        subscriptionId: item.subscriptionId,
        eventType: "trial_conversion_payment_pending",
        payload: {
          charge_id: chargeId,
          payment_id: paymentId,
          mercadopago_status: mpPayment.status,
        },
      })

      return {
        ...base,
        status: "pending",
        message: `Pago pendiente en MP (${paymentId})`,
      }
    }

    await logSubscriptionBillingEvent({
      popId: item.popId,
      subscriptionId: item.subscriptionId,
      eventType: "trial_conversion_payment_failed",
      payload: {
        charge_id: chargeId,
        payment_id: paymentId,
        mercadopago_status: mpPayment.status,
        mercadopago_status_detail: mpPayment.status_detail ?? null,
      },
    })

    const failureMessage =
      mpPayment.status_detail ?? mpPayment.status ?? "rejected"
    const alertSent = await notifyFailureIfNeeded(
      item,
      failureMessage,
      owner,
    )

    return {
      ...base,
      status: "failed",
      message: failureMessage,
      alertSent,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido"

    try {
      await logSubscriptionBillingEvent({
        popId: item.popId,
        subscriptionId: item.subscriptionId,
        eventType: "trial_conversion_payment_failed",
        payload: {
          error: message,
          source: "trial_billing_job",
        },
      })
    } catch {
      // best-effort logging
    }

    const alertSent = await notifyFailureIfNeeded(item, message)

    return {
      ...base,
      status: "failed",
      message,
      alertSent,
    }
  }
}

export async function processTrialBillingJob(): Promise<TrialBillingJobResult> {
  const mpConfig = getMercadoPagoRuntimeConfig()
  if (!mpConfig.isConfigured) {
    throw new Error("Mercado Pago no está configurado")
  }

  const queue = await listPopsPendingTrialBillingAsSystem()
  const items: TrialBillingJobItemResult[] = []

  for (const item of queue) {
    items.push(await processTrialBillingItem(item))
  }

  return {
    processed: items.length,
    succeeded: items.filter((item) => item.status === "paid").length,
    failed: items.filter((item) => item.status === "failed").length,
    pending: items.filter((item) => item.status === "pending").length,
    skipped: items.filter((item) => item.status === "skipped").length,
    alertsSent: items.filter((item) => item.alertSent).length,
    items,
  }
}
