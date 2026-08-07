export type PlatformBillingProvider = "mercadopago" | "stripe" | "manual"

export type PlatformBillingPaymentSource =
  | PlatformBillingProvider
  | "system"

export type OrganizationBillingContext = {
  organizationId: string
  organizationName: string
  trialAvailable: boolean
  billingProvider: PlatformBillingProvider
  stripeCustomerId: string | null
  mpPayerId: string | null
  defaultPaymentMethodId: string | null
  defaultPaymentProvider: PlatformBillingProvider | null
  defaultCardBrand: string | null
  defaultCardLast4: string | null
}

export type UpsertOrganizationPaymentMethodInput = {
  organizationId: string
  provider: PlatformBillingProvider
  externalPaymentMethodId: string
  mpPayerId?: string | null
  stripeCustomerId?: string | null
  cardBrand?: string | null
  cardLast4?: string | null
  cardExpMonth?: number | null
  cardExpYear?: number | null
  setDefault?: boolean
  metadata?: Record<string, unknown>
}

export type TrialBillingQueueItem = {
  popId: string
  subscriptionId: string
  organizationId: string
  trialEndsAt: string
  scheduledPlanId: string
  scheduledBillingCycle: "monthly" | "yearly"
  organizationPaymentMethodId: string
  mpPayerId: string | null
}
