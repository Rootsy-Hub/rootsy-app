const PREFIX = "rootsy:billing"

export type MercadoPagoBillingReference = {
  popId: string
  chargeId?: string | null
  organizationPaymentMethodId?: string | null
}

export function buildMercadoPagoBillingExternalReference(
  input: MercadoPagoBillingReference,
): string {
  const parts = [`${PREFIX}:pop:${input.popId}`]
  if (input.chargeId) {
    parts.push(`charge:${input.chargeId}`)
  }
  return parts.join(":")
}

export function buildMercadoPagoBillingMetadata(
  input: MercadoPagoBillingReference,
): Record<string, string> {
  const metadata: Record<string, string> = {
    rootsy_billing: "true",
    pop_id: input.popId,
  }
  if (input.chargeId) {
    metadata.charge_id = input.chargeId
  }
  if (input.organizationPaymentMethodId) {
    metadata.organization_payment_method_id = input.organizationPaymentMethodId
  }
  return metadata
}

export function parseMercadoPagoBillingContext(
  payment: {
    external_reference?: string | null
    metadata?: Record<string, unknown> | null
  },
): MercadoPagoBillingReference | null {
  const metadata = payment.metadata ?? {}
  const popIdFromMetadata = readString(metadata.pop_id)
  const chargeIdFromMetadata = readString(metadata.charge_id)
  const organizationPaymentMethodId = readString(
    metadata.organization_payment_method_id,
  )

  if (popIdFromMetadata) {
    return {
      popId: popIdFromMetadata,
      chargeId: chargeIdFromMetadata,
      organizationPaymentMethodId,
    }
  }

  const externalReference = payment.external_reference?.trim()
  if (!externalReference?.startsWith(`${PREFIX}:`)) {
    return null
  }

  const popMatch = externalReference.match(/:pop:([0-9a-f-]{36})/i)
  if (!popMatch) return null

  const chargeMatch = externalReference.match(/:charge:([0-9a-f-]{36})/i)

  return {
    popId: popMatch[1],
    chargeId: chargeMatch?.[1] ?? null,
    organizationPaymentMethodId,
  }
}

function readString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}
