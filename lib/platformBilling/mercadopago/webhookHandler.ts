import { getMercadoPagoRuntimeConfig } from "@/lib/platformBilling/mercadopago/config"
import { getMercadoPagoPayment } from "@/lib/platformBilling/mercadopago/client"
import { parseMercadoPagoBillingContext } from "@/lib/platformBilling/mercadopago/externalReference"
import { verifyMercadoPagoWebhookSignature } from "@/lib/platformBilling/mercadopago/webhookSignature"
import type { MercadoPagoWebhookPayload } from "@/lib/platformBilling/mercadopago/types"
import {
  findMercadoPagoSubscriptionPayment,
  markBillingProviderEventProcessed,
  recordBillingProviderEvent,
  registerPopSubscriptionPaymentAsSystem,
} from "@/lib/platformBilling/serviceActions"

export type MercadoPagoWebhookRequest = {
  url: string
  body: MercadoPagoWebhookPayload
  dataId?: string | null
  topic?: string | null
  signatureHeader?: string | null
  requestId?: string | null
}

export type MercadoPagoWebhookResult =
  | { ok: true; status: number; message: string }
  | { ok: false; status: number; message: string }

export async function handleMercadoPagoWebhook(
  request: MercadoPagoWebhookRequest,
): Promise<MercadoPagoWebhookResult> {
  const config = getMercadoPagoRuntimeConfig()

  if (!config.webhookSecret) {
    if (process.env.NODE_ENV === "production") {
      return {
        ok: false,
        status: 503,
        message: "Webhook de Mercado Pago no configurado",
      }
    }
  } else {
    const isValid = verifyMercadoPagoWebhookSignature({
      dataId: request.dataId,
      requestId: request.requestId,
      signatureHeader: request.signatureHeader,
      secret: config.webhookSecret,
    })

    if (!isValid) {
      return { ok: false, status: 401, message: "Firma de webhook inválida" }
    }
  }

  if (!config.isConfigured) {
    return {
      ok: false,
      status: 503,
      message: "Mercado Pago no está configurado",
    }
  }

  const payload = request.body
  const topic = request.topic ?? payload.type ?? "unknown"
  const resourceId =
    request.dataId ??
    (payload.data?.id != null ? String(payload.data.id) : null)
  const externalEventId = `${topic}:${payload.id ?? resourceId ?? "unknown"}`

  const eventId = await recordBillingProviderEvent({
    provider: "mercadopago",
    externalEventId,
    eventType: payload.action ?? topic,
    payload: {
      topic,
      resource_id: resourceId,
      notification: payload,
      request_url: request.url,
    },
  })

  try {
    if (topic !== "payment" || !resourceId) {
      await markBillingProviderEventProcessed(eventId)
      return {
        ok: true,
        status: 200,
        message: "Evento registrado sin procesamiento adicional",
      }
    }

    const payment = await getMercadoPagoPayment(resourceId)
    const paymentId = String(payment.id)

    if (payment.status !== "approved") {
      await markBillingProviderEventProcessed(eventId)
      return {
        ok: true,
        status: 200,
        message: `Pago ${paymentId} ignorado (${payment.status ?? "sin estado"})`,
      }
    }

    const existing = await findMercadoPagoSubscriptionPayment(paymentId)
    if (existing) {
      await markBillingProviderEventProcessed(eventId)
      return {
        ok: true,
        status: 200,
        message: `Pago ${paymentId} ya registrado`,
      }
    }

    const billingContext = parseMercadoPagoBillingContext(payment)
    if (!billingContext?.popId) {
      await markBillingProviderEventProcessed(
        eventId,
        "Pago aprobado sin contexto de billing Rootsy",
      )
      return {
        ok: true,
        status: 200,
        message: "Pago aprobado sin metadata de Rootsy",
      }
    }

    const amount = payment.transaction_amount
    if (amount == null || amount <= 0) {
      throw new Error(`Importe inválido para pago ${paymentId}`)
    }

    await registerPopSubscriptionPaymentAsSystem({
      popId: billingContext.popId,
      amount,
      paidAt: payment.date_approved ?? new Date().toISOString(),
      paymentMethodId: billingContext.organizationPaymentMethodId ?? null,
      externalPaymentId: paymentId,
      metadata: {
        mercadopago_payment_id: paymentId,
        mercadopago_status: payment.status,
        mercadopago_status_detail: payment.status_detail ?? null,
        charge_id: billingContext.chargeId ?? null,
        external_reference: payment.external_reference ?? null,
        webhook_event_id: eventId,
      },
    })

    await markBillingProviderEventProcessed(eventId)
    return {
      ok: true,
      status: 200,
      message: `Pago ${paymentId} registrado para POP ${billingContext.popId}`,
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error procesando webhook"
    await markBillingProviderEventProcessed(eventId, message)
    return { ok: false, status: 500, message }
  }
}
