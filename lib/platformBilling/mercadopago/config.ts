import {
  MP_ACCESS_TOKEN_ENV,
  MP_PUBLIC_KEY_ENV,
  MP_WEBHOOK_SECRET_ENV,
} from "@/lib/platformBilling/constants"

export type MercadoPagoRuntimeConfig = {
  publicKey: string | null
  accessToken: string | null
  webhookSecret: string | null
  isConfigured: boolean
}

export function getMercadoPagoRuntimeConfig(): MercadoPagoRuntimeConfig {
  const publicKey = process.env[MP_PUBLIC_KEY_ENV]?.trim() || null
  const accessToken = process.env[MP_ACCESS_TOKEN_ENV]?.trim() || null
  const webhookSecret = process.env[MP_WEBHOOK_SECRET_ENV]?.trim() || null

  return {
    publicKey,
    accessToken,
    webhookSecret,
    isConfigured: Boolean(publicKey && accessToken),
  }
}

export function requireMercadoPagoAccessToken(): string {
  const { accessToken, isConfigured } = getMercadoPagoRuntimeConfig()
  if (!isConfigured || !accessToken) {
    throw new Error(
      "Mercado Pago no está configurado. Definí NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY y MERCADOPAGO_ACCESS_TOKEN.",
    )
  }
  return accessToken
}
