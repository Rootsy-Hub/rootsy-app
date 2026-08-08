import { requireMercadoPagoAccessToken } from "@/lib/platformBilling/mercadopago/config"

const MP_API_BASE = "https://api.mercadopago.com"

export type MercadoPagoCustomer = {
  id: string
  email?: string
}

export type MercadoPagoSavedCard = {
  cardId: string
  brand: string | null
  last4: string | null
  expMonth: number | null
  expYear: number | null
}

type MercadoPagoApiError = {
  message?: string
  cause?: Array<{ description?: string }>
}

async function mpFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const accessToken = requireMercadoPagoAccessToken()
  const response = await fetch(`${MP_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  })

  const payload = (await response.json()) as T & MercadoPagoApiError

  if (!response.ok) {
    const detail =
      payload.message ??
      payload.cause?.[0]?.description ??
      "Error en la API de Mercado Pago"
    throw new Error(detail)
  }

  return payload
}

export async function findOrCreateMercadoPagoCustomer(
  email: string,
): Promise<MercadoPagoCustomer> {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) {
    throw new Error("Email requerido para guardar la tarjeta")
  }

  const search = await mpFetch<{
    results?: Array<{ id?: string | number; email?: string }>
  }>(`/v1/customers/search?email=${encodeURIComponent(normalizedEmail)}`)

  const existing = search.results?.[0]
  if (existing?.id != null) {
    return {
      id: String(existing.id),
      email: existing.email ?? normalizedEmail,
    }
  }

  const created = await mpFetch<{ id?: string | number; email?: string }>(
    "/v1/customers",
    {
      method: "POST",
      body: JSON.stringify({ email: normalizedEmail }),
    },
  )

  if (created.id == null) {
    throw new Error("Mercado Pago no devolvió un customer id")
  }

  return {
    id: String(created.id),
    email: created.email ?? normalizedEmail,
  }
}

export async function saveMercadoPagoCustomerCard(input: {
  customerId: string
  cardToken: string
}): Promise<MercadoPagoSavedCard> {
  const saved = await mpFetch<{
    id?: string | number
    last_four_digits?: string
    expiration_month?: number
    expiration_year?: number
    payment_method?: { id?: string }
  }>(`/v1/customers/${encodeURIComponent(input.customerId)}/cards`, {
    method: "POST",
    body: JSON.stringify({ token: input.cardToken }),
  })

  if (saved.id == null) {
    throw new Error("Mercado Pago no devolvió un card id")
  }

  return {
    cardId: String(saved.id),
    brand: saved.payment_method?.id ?? null,
    last4: saved.last_four_digits ?? null,
    expMonth: saved.expiration_month ?? null,
    expYear: saved.expiration_year ?? null,
  }
}

export async function getMercadoPagoCustomerCard(input: {
  customerId: string
  cardId: string
}): Promise<MercadoPagoSavedCard & { issuerId: string | null }> {
  const card = await mpFetch<{
    id?: string | number
    last_four_digits?: string
    expiration_month?: number
    expiration_year?: number
    payment_method?: { id?: string }
    issuer?: { id?: string | number }
  }>(
    `/v1/customers/${encodeURIComponent(input.customerId)}/cards/${encodeURIComponent(input.cardId)}`,
  )

  if (card.id == null) {
    throw new Error("Tarjeta guardada no encontrada en Mercado Pago")
  }

  return {
    cardId: String(card.id),
    brand: card.payment_method?.id ?? null,
    last4: card.last_four_digits ?? null,
    expMonth: card.expiration_month ?? null,
    expYear: card.expiration_year ?? null,
    issuerId: card.issuer?.id != null ? String(card.issuer.id) : null,
  }
}
