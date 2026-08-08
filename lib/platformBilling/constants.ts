import type { PlatformBillingProvider } from "@/lib/platformBilling/types"

export const DEFAULT_PLATFORM_BILLING_PROVIDER: PlatformBillingProvider =
  "mercadopago"

export const PLATFORM_BILLING_PROVIDERS = [
  "mercadopago",
  "stripe",
  "manual",
] as const satisfies readonly PlatformBillingProvider[]

export const MP_PUBLIC_KEY_ENV = "NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY"
export const MP_ACCESS_TOKEN_ENV = "MERCADOPAGO_ACCESS_TOKEN"
export const MP_WEBHOOK_SECRET_ENV = "MERCADOPAGO_WEBHOOK_SECRET"
export const CRON_SECRET_ENV = "CRON_SECRET"
export const BILLING_TRIAL_JOB_ENABLED_ENV = "BILLING_TRIAL_JOB_ENABLED"
export const BILLING_ALERTS_ENABLED_ENV = "BILLING_ALERTS_ENABLED"
