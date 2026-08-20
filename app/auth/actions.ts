"use server"

import { formatEmailInput, validateEmailField, validateSignupPassword } from "@/lib/authValidation"
import {
  getSignupEmailStatus,
  resendSignupConfirmationViaResend,
  sendPasswordRecoveryViaResend,
  sendSignupConfirmationViaResend,
  type SignupEmailStatus,
} from "@/lib/auth/authEmailService"

export async function registerAccountWithEmail(input: {
  email: string
  password: string
  next?: string
}): Promise<
  | { success: true; needsConfirmation: true; resent?: boolean }
  | { success: false; error: string }
> {
  const email = formatEmailInput(input.email)
  const emailError = validateEmailField(email)
  if (emailError) {
    return { success: false, error: emailError }
  }

  const passwordError = validateSignupPassword(input.password)
  if (passwordError) {
    return { success: false, error: passwordError }
  }

  const firstName = email.split("@")[0] || "Usuario"
  const result = await sendSignupConfirmationViaResend({
    email,
    password: input.password,
    firstName,
    next: input.next,
  })

  if (!result.sent) {
    return {
      success: false,
      error: result.error,
    }
  }

  return { success: true, needsConfirmation: true, resent: result.resent }
}

export async function checkSignupEmailStatus(input: {
  email: string
}): Promise<{ status: SignupEmailStatus }> {
  const email = formatEmailInput(input.email)
  if (validateEmailField(email)) {
    return { status: "missing" }
  }
  return { status: await getSignupEmailStatus(email) }
}

export async function resendSignupConfirmationEmail(input: {
  email: string
  next?: string
}): Promise<{ success: true } | { success: false; error: string }> {
  const email = formatEmailInput(input.email)
  const emailError = validateEmailField(email)
  if (emailError) {
    return { success: false, error: emailError }
  }

  const result = await resendSignupConfirmationViaResend({
    email,
    next: input.next,
  })
  if (!result.sent) {
    return { success: false, error: result.error }
  }

  return { success: true }
}

export async function requestPasswordRecoveryEmail(input: {
  email: string
}): Promise<{ success: true } | { success: false; error: string }> {
  const email = formatEmailInput(input.email)
  const emailError = validateEmailField(email)
  if (emailError) {
    return { success: false, error: emailError }
  }

  const result = await sendPasswordRecoveryViaResend({ email })

  if (!result.sent && result.userFacing) {
    return { success: false, error: result.error ?? "No se pudo enviar el correo." }
  }

  return { success: true }
}
