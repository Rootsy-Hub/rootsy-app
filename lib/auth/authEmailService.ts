import { getAppBaseUrl } from "@/lib/appUrl"
import { getAuthCallbackUrl } from "@/lib/authCallbackRedirect"
import { POP_CREATE_PATH } from "@/lib/signupIntent"
import {
  buildAuthConfirmSignupEmail,
} from "@/lib/email/templates/authConfirmSignupEmail"
import {
  buildAuthResetPasswordEmail,
} from "@/lib/email/templates/authResetPasswordEmail"
import { isResendConfigured, sendResendEmail } from "@/lib/email/sendResendEmail"
import { createServiceRoleClient } from "@/utils/supabase/service-role"

function authCallbackUrl(next?: string): string {
  const base = getAuthCallbackUrl(getAppBaseUrl())
  if (!next) return base
  const url = new URL(base)
  url.searchParams.set("next", next)
  return url.toString()
}

function confirmationCallbackUrl(): string {
  return authCallbackUrl(POP_CREATE_PATH)
}

function isAlreadyRegisteredError(message: string): boolean {
  const lower = message.toLowerCase()
  return (
    lower.includes("already registered") ||
    lower.includes("already exists") ||
    lower.includes("user already registered")
  )
}

function mapSignupLinkError(message: string): string | null {
  if (isAlreadyRegisteredError(message)) {
    return "Este correo ya está registrado. Iniciá sesión."
  }
  if (message.toLowerCase().includes("invalid") && message.toLowerCase().includes("email")) {
    return "Ingresá un correo electrónico válido"
  }
  return null
}

function confirmationUrlFromLink(properties: {
  action_link?: string | null
  hashed_token?: string | null
  verification_type?: string | null
} | null | undefined): string | null {
  const hashedToken = properties?.hashed_token?.trim()
  const verificationType = properties?.verification_type?.trim()
  if (hashedToken && verificationType) {
    const url = new URL(confirmationCallbackUrl())
    url.searchParams.set("token_hash", hashedToken)
    url.searchParams.set("type", verificationType)
    return url.toString()
  }
  return properties?.action_link?.trim() || null
}

type AuthUserLookup = {
  id: string
  emailConfirmed: boolean
}

async function findAuthUserByEmail(email: string): Promise<AuthUserLookup | null> {
  const normalized = email.trim().toLowerCase()
  const supabase = createServiceRoleClient()
  const admin = supabase.auth.admin as typeof supabase.auth.admin & {
    getUserByEmail?: (value: string) => Promise<{
      data: { user: { id: string; email_confirmed_at?: string | null } | null }
      error: { message: string } | null
    }>
  }

  if (typeof admin.getUserByEmail === "function") {
    const { data, error } = await admin.getUserByEmail(normalized)
    if (!error && data.user) {
      return {
        id: data.user.id,
        emailConfirmed: Boolean(data.user.email_confirmed_at),
      }
    }
  }

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.listUsers({ page, perPage: 200 })
    if (error) break
    const user = data.users.find((row) => row.email?.toLowerCase() === normalized)
    if (user) {
      return {
        id: user.id,
        emailConfirmed: Boolean(user.email_confirmed_at),
      }
    }
    if (data.users.length < 200) break
  }

  return null
}

export type SignupEmailStatus = "missing" | "unconfirmed" | "confirmed"

export async function getSignupEmailStatus(
  email: string,
): Promise<SignupEmailStatus> {
  const existing = await findAuthUserByEmail(email)
  if (!existing) return "missing"
  return existing.emailConfirmed ? "confirmed" : "unconfirmed"
}

export async function emailNeedsConfirmation(email: string): Promise<boolean> {
  return (await getSignupEmailStatus(email)) === "unconfirmed"
}

async function deliverConfirmationEmail(input: {
  email: string
  confirmationUrl: string
}): Promise<{ sent: true } | { sent: false; error: string }> {
  const email = buildAuthConfirmSignupEmail({
    confirmationUrl: input.confirmationUrl,
  })
  const emailResult = await sendResendEmail({
    to: input.email,
    subject: email.subject,
    html: email.html,
    text: email.text,
  })
  if (!emailResult.sent) {
    return {
      sent: false,
      error: emailResult.error ?? "No se pudo enviar el correo de confirmación.",
    }
  }
  return { sent: true }
}

async function sendConfirmationForExistingUser(
  email: string,
): Promise<
  | { sent: true; userId: string; resent: true }
  | { sent: false; error: string; userFacing?: boolean }
> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: confirmationCallbackUrl(),
    },
  })

  if (error) {
    return {
      sent: false,
      error: error.message,
      userFacing: false,
    }
  }

  const confirmationUrl = confirmationUrlFromLink(data.properties)
  const userId = data.user?.id
  if (!confirmationUrl || !userId) {
    return { sent: false, error: "No se pudo generar el enlace de confirmación." }
  }

  const delivered = await deliverConfirmationEmail({ email, confirmationUrl })
  if (!delivered.sent) {
    return { sent: false, error: delivered.error, userFacing: true }
  }

  return { sent: true, userId, resent: true }
}

export async function sendSignupConfirmationViaResend(input: {
  email: string
  password: string
  firstName: string
  isPreview?: boolean
}): Promise<
  | { sent: true; userId: string; resent?: boolean }
  | { sent: false; error: string; userFacing?: boolean; alreadyConfirmed?: boolean }
> {
  if (!input.isPreview && !isResendConfigured()) {
    return {
      sent: false,
      error: "Resend no está conectado en este entorno.",
      userFacing: true,
    }
  }

  if (input.isPreview) {
    const email = buildAuthConfirmSignupEmail({
      confirmationUrl: `${getAppBaseUrl()}/auth/callback?preview=signup`,
      isPreview: true,
    })
    const emailResult = await sendResendEmail({
      to: input.email,
      subject: `[Prueba Uroboros] ${email.subject}`,
      html: email.html,
      text: email.text,
    })
    if (!emailResult.sent) {
      return { sent: false, error: emailResult.error ?? "No se pudo enviar el correo de confirmación." }
    }
    return { sent: true, userId: "preview" }
  }

  const existing = await findAuthUserByEmail(input.email)
  if (existing?.emailConfirmed) {
    return {
      sent: false,
      error: "Este correo ya está registrado. Iniciá sesión.",
      userFacing: true,
      alreadyConfirmed: true,
    }
  }
  if (existing && !existing.emailConfirmed) {
    return sendConfirmationForExistingUser(input.email)
  }

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "signup",
    email: input.email,
    password: input.password,
    options: {
      redirectTo: confirmationCallbackUrl(),
      data: {
        first_name: input.firstName,
        last_name: "",
      },
    },
  })

  if (error) {
    if (isAlreadyRegisteredError(error.message)) {
      const leftover = await findAuthUserByEmail(input.email)
      if (leftover && !leftover.emailConfirmed) {
        return sendConfirmationForExistingUser(input.email)
      }
      return {
        sent: false,
        error: "Este correo ya está registrado. Iniciá sesión.",
        userFacing: true,
        alreadyConfirmed: true,
      }
    }
    const mapped = mapSignupLinkError(error.message)
    return {
      sent: false,
      error: mapped ?? error.message,
      userFacing: Boolean(mapped),
    }
  }

  const confirmationUrl = confirmationUrlFromLink(data.properties)
  const userId = data.user?.id
  if (!confirmationUrl || !userId) {
    return {
      sent: false,
      error: "No se pudo generar el enlace de confirmación.",
    }
  }

  const delivered = await deliverConfirmationEmail({
    email: input.email,
    confirmationUrl,
  })
  if (!delivered.sent) {
    return {
      sent: false,
      error: delivered.error,
      userFacing: true,
    }
  }

  return { sent: true, userId }
}

export async function resendSignupConfirmationViaResend(input: {
  email: string
}): Promise<
  | { sent: true }
  | { sent: false; error: string; alreadyConfirmed?: boolean }
> {
  if (!isResendConfigured()) {
    return {
      sent: false,
      error: "Resend no está conectado en este entorno.",
    }
  }

  const existing = await findAuthUserByEmail(input.email)
  if (!existing) {
    return { sent: true }
  }
  if (existing.emailConfirmed) {
    return {
      sent: false,
      error: "Este correo ya está confirmado. Iniciá sesión.",
      alreadyConfirmed: true,
    }
  }

  const result = await sendConfirmationForExistingUser(input.email)
  if (!result.sent) {
    return { sent: false, error: result.error }
  }
  return { sent: true }
}

export async function sendPasswordRecoveryViaResend(input: {
  email: string
  isPreview?: boolean
}): Promise<{ sent: boolean; error?: string; userFacing?: boolean }> {
  if (!input.isPreview && !isResendConfigured()) {
    return {
      sent: false,
      error: "Resend no está conectado en este entorno.",
      userFacing: true,
    }
  }

  if (input.isPreview) {
    const email = buildAuthResetPasswordEmail({
      recoveryUrl: `${getAppBaseUrl()}/auth/callback?preview=recovery`,
      isPreview: true,
    })
    const emailResult = await sendResendEmail({
      to: input.email,
      subject: `[Prueba Uroboros] ${email.subject}`,
      html: email.html,
      text: email.text,
    })
    if (!emailResult.sent) {
      return { sent: false, error: emailResult.error }
    }
    return { sent: true }
  }

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email: input.email,
    options: {
      redirectTo: authCallbackUrl(),
    },
  })

  if (error || !data.properties?.action_link) {
    return { sent: true }
  }

  const email = buildAuthResetPasswordEmail({
    recoveryUrl: data.properties.action_link,
  })

  const emailResult = await sendResendEmail({
    to: input.email,
    subject: email.subject,
    html: email.html,
    text: email.text,
  })

  if (!emailResult.sent) {
    return {
      sent: false,
      error: emailResult.error ?? "No se pudo enviar el correo de recuperación.",
      userFacing: true,
    }
  }

  return { sent: true }
}
