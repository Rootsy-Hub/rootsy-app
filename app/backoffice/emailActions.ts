"use server"

import { requireBackofficeAccess } from "@/app/backoffice/backofficeAuth"
import {
  sendPasswordRecoveryViaResend,
  sendSignupConfirmationViaResend,
} from "@/lib/auth/authEmailService"
import { getAppBaseUrl } from "@/lib/appUrl"
import { formatEmailInput, validateEmailField } from "@/lib/authValidation"
import {
  getRootsyEmailDefinition,
  ROOTSY_EMAIL_CATALOG,
  type RootsyEmailId,
} from "@/lib/email/rootsyEmailCatalog"
import {
  getResendFromAddress,
  isResendConfigured,
  sendResendEmail,
} from "@/lib/email/sendResendEmail"
import {
  buildPopInvitationEmail,
} from "@/lib/email/templates/popInvitationEmail"
import {
  buildTrialBillingFailureEmail,
} from "@/lib/email/templates/trialBillingFailureEmail"

export type BackofficeEmailOverview = {
  emails: typeof ROOTSY_EMAIL_CATALOG
  resendConfigured: boolean
  resendFrom: string
}

export type BackofficeEmailTestResult =
  | { success: true; message: string }
  | { success: false; error: string }

export async function getBackofficeEmailOverview(): Promise<BackofficeEmailOverview> {
  await requireBackofficeAccess()
  return {
    emails: ROOTSY_EMAIL_CATALOG,
    resendConfigured: isResendConfigured(),
    resendFrom: getResendFromAddress(),
  }
}

async function sendBackofficeResendTestEmail(
  emailId: RootsyEmailId,
  to: string,
): Promise<BackofficeEmailTestResult> {
  if (!isResendConfigured()) {
    return {
      success: false,
      error: "Resend no está conectado en este entorno.",
    }
  }

  const appUrl = getAppBaseUrl()

  if (emailId === "pop_invitation") {
    const popName = "Punto de venta de prueba"
    const email = buildPopInvitationEmail({
      popName,
      inviteUrl: `${appUrl}/invite/pop/preview-uroboros`,
      message: "Mensaje opcional de ejemplo desde Uroboros.",
      isPreview: true,
    })
    const result = await sendResendEmail({
      to,
      subject: `[Prueba Uroboros] ${email.subject}`,
      html: email.html,
      text: email.text,
    })

    if (!result.sent) {
      return { success: false, error: result.error ?? "No se pudo enviar el correo." }
    }

    return {
      success: true,
      message: `Correo de invitación de prueba enviado a ${to}.`,
    }
  }

  if (emailId === "trial_billing_failure") {
    const popName = "Mi comercio (prueba)"
    const email = buildTrialBillingFailureEmail({
      popName,
      trialEndsAt: new Date().toISOString(),
      failureMessage: "Tarjeta rechazada (simulación desde Uroboros).",
      homeUrl: `${appUrl}/home`,
      isPreview: true,
    })
    const result = await sendResendEmail({
      to,
      subject: `[Prueba Uroboros] ${email.subject}`,
      html: email.html,
      text: email.text,
    })

    if (!result.sent) {
      return { success: false, error: result.error ?? "No se pudo enviar el correo." }
    }

    return {
      success: true,
      message: `Correo de fallo de cobro de prueba enviado a ${to}.`,
    }
  }

  if (emailId === "auth_signup_confirmation") {
    const result = await sendSignupConfirmationViaResend({
      email: to,
      password: "preview-password-not-used",
      firstName: "Usuario",
      isPreview: true,
    })

    if (!result.sent) {
      return { success: false, error: result.error ?? "No se pudo enviar el correo." }
    }

    return {
      success: true,
      message: `Correo de confirmación de prueba enviado a ${to}.`,
    }
  }

  const result = await sendPasswordRecoveryViaResend({
    email: to,
    isPreview: true,
  })

  if (!result.sent) {
    return { success: false, error: result.error ?? "No se pudo enviar el correo." }
  }

  return {
    success: true,
    message: `Correo de recuperación de prueba enviado a ${to}.`,
  }
}

export async function sendBackofficeEmailTest(
  emailId: RootsyEmailId,
  toRaw: string,
): Promise<BackofficeEmailTestResult> {
  await requireBackofficeAccess()

  const definition = getRootsyEmailDefinition(emailId)
  if (!definition) {
    return { success: false, error: "Tipo de correo no reconocido." }
  }

  const to = formatEmailInput(toRaw)
  const emailError = validateEmailField(to)
  if (emailError) {
    return { success: false, error: emailError }
  }

  return sendBackofficeResendTestEmail(emailId, to)
}
