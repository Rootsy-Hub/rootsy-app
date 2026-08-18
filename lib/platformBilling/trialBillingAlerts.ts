import { getAppBaseUrl } from "@/lib/appUrl"
import { sendResendEmail } from "@/lib/email/sendResendEmail"
import { buildTrialBillingFailureEmail } from "@/lib/email/templates/trialBillingFailureEmail"
import { BILLING_ALERTS_ENABLED_ENV } from "@/lib/platformBilling/constants"
import {
  hasTrialFailureAlertBeenSent,
  logSubscriptionBillingEvent,
} from "@/lib/platformBilling/trialBillingService"

function isBillingAlertsEnabled(): boolean {
  const raw = process.env[BILLING_ALERTS_ENABLED_ENV]?.trim().toLowerCase()
  if (!raw) return true
  return raw === "1" || raw === "true" || raw === "yes"
}

export async function notifyTrialConversionFailure(input: {
  popId: string
  subscriptionId: string
  trialEndsAt: string
  popName: string
  ownerEmail: string
  failureMessage: string
}): Promise<{ sent: boolean; skipped?: string; error?: string }> {
  if (!isBillingAlertsEnabled()) {
    return { sent: false, skipped: "Alertas de billing deshabilitadas" }
  }

  const alreadySent = await hasTrialFailureAlertBeenSent({
    subscriptionId: input.subscriptionId,
    trialEndsAt: input.trialEndsAt,
  })

  if (alreadySent) {
    return {
      sent: false,
      skipped: "Ya se envió una alerta para este fin de trial",
    }
  }

  const appUrl = getAppBaseUrl()
  const homeUrl = `${appUrl}/home`

  const billingEmail = buildTrialBillingFailureEmail({
    popName: input.popName,
    trialEndsAt: input.trialEndsAt,
    failureMessage: input.failureMessage,
    homeUrl,
  })

  const result = await sendResendEmail({
    to: input.ownerEmail,
    subject: billingEmail.subject,
    html: billingEmail.html,
    text: billingEmail.text,
  })

  if (!result.sent) {
    return { sent: false, error: result.error }
  }

  await logSubscriptionBillingEvent({
    popId: input.popId,
    subscriptionId: input.subscriptionId,
    eventType: "trial_conversion_alert_sent",
    payload: {
      to: input.ownerEmail,
      failure_message: input.failureMessage,
      trial_ends_at: input.trialEndsAt,
    },
  })

  return { sent: true }
}
