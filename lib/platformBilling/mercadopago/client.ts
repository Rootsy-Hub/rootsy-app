import type { MercadoPagoPayment } from "@/lib/platformBilling/mercadopago/types"
import { requireMercadoPagoAccessToken } from "@/lib/platformBilling/mercadopago/config"
import {
  buildMercadoPagoBillingExternalReference,
  buildMercadoPagoBillingMetadata,
  type MercadoPagoBillingReference,
} from "@/lib/platformBilling/mercadopago/externalReference"

const MP_API_BASE = "https://api.mercadopago.com"

type CreateMercadoPagoPaymentInput = {
  transactionAmount: number
  token: string
  description: string
  payerEmail: string
  billing: MercadoPagoBillingReference
  metadata?: Record<string, unknown>
}

export async function createMercadoPagoPayment(
  input: CreateMercadoPagoPaymentInput,
): Promise<MercadoPagoPayment> {
  const accessToken = requireMercadoPagoAccessToken()
  const externalReference = buildMercadoPagoBillingExternalReference(input.billing)
  const billingMetadata = buildMercadoPagoBillingMetadata(input.billing)

  const response = await fetch(`${MP_API_BASE}/v1/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": externalReference,
    },
    body: JSON.stringify({
      transaction_amount: input.transactionAmount,
      token: input.token,
      description: input.description,
      external_reference: externalReference,
      installments: 1,
      payer: {
        email: input.payerEmail,
      },
      metadata: {
        ...billingMetadata,
        ...(input.metadata ?? {}),
      },
    }),
  })

  const payload = (await response.json()) as MercadoPagoPayment & {
    message?: string
    cause?: Array<{ description?: string }>
  }

  if (!response.ok) {
    const detail =
      payload.message ??
      payload.cause?.[0]?.description ??
      "Error al crear pago en Mercado Pago"
    throw new Error(detail)
  }

  return payload
}

export async function getMercadoPagoPayment(
  paymentId: string | number,
): Promise<MercadoPagoPayment> {
  const accessToken = requireMercadoPagoAccessToken()

  const response = await fetch(`${MP_API_BASE}/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  })

  const payload = (await response.json()) as MercadoPagoPayment & {
    message?: string
  }

  if (!response.ok) {
    throw new Error(payload.message ?? "No se pudo consultar el pago en MP")
  }

  return payload
}

type CreateMercadoPagoSavedCardPaymentInput = {
  transactionAmount: number
  customerId: string
  cardId: string
  paymentMethodId?: string | null
  issuerId?: string | null
  description: string
  payerEmail: string
  billing: MercadoPagoBillingReference
  metadata?: Record<string, unknown>
}

export async function createMercadoPagoPaymentWithSavedCard(
  input: CreateMercadoPagoSavedCardPaymentInput,
): Promise<MercadoPagoPayment> {
  const accessToken = requireMercadoPagoAccessToken()
  const externalReference = buildMercadoPagoBillingExternalReference(input.billing)
  const billingMetadata = buildMercadoPagoBillingMetadata(input.billing)

  const body: Record<string, unknown> = {
    transaction_amount: input.transactionAmount,
    token: input.cardId,
    description: input.description,
    external_reference: externalReference,
    installments: 1,
    payer: {
      type: "customer",
      id: input.customerId,
      email: input.payerEmail,
    },
    metadata: {
      ...billingMetadata,
      saved_card_id: input.cardId,
      ...(input.metadata ?? {}),
    },
  }

  if (input.paymentMethodId) {
    body.payment_method_id = input.paymentMethodId
  }
  if (input.issuerId) {
    body.issuer_id = input.issuerId
  }

  const response = await fetch(`${MP_API_BASE}/v1/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": `${externalReference}:saved-card`,
    },
    body: JSON.stringify(body),
  })

  const payload = (await response.json()) as MercadoPagoPayment & {
    message?: string
    cause?: Array<{ description?: string }>
  }

  if (!response.ok) {
    const detail =
      payload.message ??
      payload.cause?.[0]?.description ??
      "Error al cobrar con tarjeta guardada en Mercado Pago"
    throw new Error(detail)
  }

  return payload
}
