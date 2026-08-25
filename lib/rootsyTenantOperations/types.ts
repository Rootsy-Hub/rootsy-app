export type PlatformBillingCycle = "monthly" | "yearly"

export type CustomerPopBillingMirrorContext = {
  customerPopId: string
  organizationId: string
  organizationName: string
  ownerUserId: string
  planName: string
  businessTypeName: string | null
  billingCycle: PlatformBillingCycle
}

export type MirrorPlatformSubscriptionPaymentInput = {
  customerPopId: string
  amount: number
  paidAt: string
  externalPaymentId: string
  notes?: string
  metadata?: Record<string, unknown>
}

export type MirrorPlatformSubscriptionPaymentResult =
  | { mirrored: true; chargeId: string; paymentId: string }
  | { mirrored: false; reason: string }

export type EnsureRootsyPlatformClientInput = {
  organizationId: string
  organizationName: string
  ownerUserId: string
  ownerEmail?: string | null
}

export type EnsureRootsyPlatformClientResult =
  | { ok: true; clientId: string; created: boolean }
  | { ok: false; error: string }
