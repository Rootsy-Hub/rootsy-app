import { getAppBaseUrl } from "@/lib/appUrl"
import { sendResendEmail } from "@/lib/email/sendResendEmail"
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

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function formatTrialEndsAt(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date)
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
  const safePopName = escapeHtml(input.popName)
  const safeMessage = escapeHtml(input.failureMessage)
  const safeTrialEndsAt = escapeHtml(formatTrialEndsAt(input.trialEndsAt))

  const result = await sendResendEmail({
    to: input.ownerEmail,
    subject: `Rootsy: no pudimos cobrar la suscripción de ${input.popName}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#102018;max-width:560px">
        <p style="margin:0 0 16px">Hola,</p>
        <p style="margin:0 0 16px">
          Finalizó la prueba gratis de <strong>${safePopName}</strong>
          (${safeTrialEndsAt}) e intentamos cobrar la suscripción con la tarjeta guardada,
          pero el pago no se pudo completar.
        </p>
        <p style="margin:0 0 16px;padding:12px 14px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;color:#991b1b">
          ${safeMessage}
        </p>
        <p style="margin:0 0 20px">
          Actualizá tu medio de pago para evitar interrupciones en el servicio.
          El sistema reintentará el cobro automáticamente.
        </p>
        <p style="margin:0 0 24px">
          <a href="${homeUrl}" style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600">
            Ir a Rootsy
          </a>
        </p>
        <p style="margin:0;color:#64748b;font-size:13px">
          Si el problema persiste, respondé este correo o contactanos desde la app.
        </p>
      </div>
    `,
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
