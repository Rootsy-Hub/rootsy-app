import { getRootsyPlatformPopId } from "@/lib/rootsyPlatformPop"
import { getCustomerPopBillingMirrorContext } from "@/lib/rootsyTenantOperations/billingContext"
import { ensureRootsyPlatformClient } from "@/lib/rootsyTenantOperations/clients"
import {
  createPlatformServiceOperation,
  findPlatformOperationLink,
} from "@/lib/rootsyTenantOperations/operations"
import { resolvePlatformServiceBinding } from "@/lib/rootsyTenantOperations/platformContext"
import type {
  MirrorPlatformSubscriptionPaymentInput,
  MirrorPlatformSubscriptionPaymentResult,
} from "@/lib/rootsyTenantOperations/types"

export async function mirrorPlatformSubscriptionPayment(
  input: MirrorPlatformSubscriptionPaymentInput,
): Promise<MirrorPlatformSubscriptionPaymentResult> {
  try {
    if (!getRootsyPlatformPopId()) {
      return { mirrored: false, reason: "ROOTSY_POP_ID no configurado" }
    }

    const externalPaymentId = input.externalPaymentId.trim()
    if (!externalPaymentId) {
      return { mirrored: false, reason: "externalPaymentId vacío" }
    }

    const amount = Number(input.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      return { mirrored: false, reason: "Importe inválido o cero" }
    }

    const existing = await findPlatformOperationLink(externalPaymentId)
    if (existing) {
      return {
        mirrored: true,
        chargeId: existing.chargeId,
        paymentId: existing.paymentId ?? existing.chargeId,
      }
    }

    const billingContext = await getCustomerPopBillingMirrorContext(
      input.customerPopId,
    )
    if (!billingContext) {
      return {
        mirrored: false,
        reason: "No se pudo resolver plan/ciclo del POP cliente",
      }
    }

    const serviceTypeId = await resolvePlatformServiceBinding({
      planName: billingContext.planName,
      businessTypeName: billingContext.businessTypeName,
      billingCycle: billingContext.billingCycle,
    })

    if (!serviceTypeId) {
      return {
        mirrored: false,
        reason: `Sin binding para plan ${billingContext.planName} (${billingContext.billingCycle})`,
      }
    }

    const clientResult = await ensureRootsyPlatformClient({
      organizationId: billingContext.organizationId,
      organizationName: billingContext.organizationName,
      ownerUserId: billingContext.ownerUserId,
    })

    if (!clientResult.ok) {
      return {
        mirrored: false,
        reason: clientResult.error,
      }
    }

    const operation = await createPlatformServiceOperation({
      clientId: clientResult.clientId,
      serviceTypeId,
      amount,
      paidAt: input.paidAt,
      externalPaymentId,
      customerPopId: input.customerPopId,
      organizationId: billingContext.organizationId,
      notes: input.notes,
      metadata: input.metadata,
    })

    return {
      mirrored: true,
      chargeId: operation.chargeId,
      paymentId: operation.paymentId,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido"
    console.warn(
      "[rootsyTenantOperations] mirrorPlatformSubscriptionPayment failed:",
      message,
    )
    return { mirrored: false, reason: message }
  }
}
