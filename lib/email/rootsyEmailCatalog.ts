export type RootsyEmailProvider = "resend"

export type RootsyEmailId =
  | "pop_invitation"
  | "trial_billing_failure"
  | "auth_signup_confirmation"
  | "auth_password_recovery"

export type RootsyEmailDefinition = {
  id: RootsyEmailId
  name: string
  description: string
  provider: RootsyEmailProvider
  subjectExample: string
  trigger: string
  templateLocation: string
  testNote?: string
}

export const ROOTSY_EMAIL_CATALOG: RootsyEmailDefinition[] = [
  {
    id: "pop_invitation",
    name: "Invitación a un POP",
    description:
      "Se envía cuando el dueño invita a un correo a unirse a su punto de venta. Si no tiene cuenta, la crea con el mismo enlace.",
    provider: "resend",
    subjectExample: "Te invitaron a {nombre del POP}",
    trigger: "RRHH → Invitar usuario (`inviteUserToPop`)",
    templateLocation:
      "lib/email/templates/popInvitationEmail.ts + layout transaccional mínimo",
  },
  {
    id: "trial_billing_failure",
    name: "Fallo de cobro post-trial",
    description:
      "Alerta al owner cuando termina la prueba gratis y Mercado Pago rechaza el cobro automático.",
    provider: "resend",
    subjectExample: "No pude cobrar {nombre del POP}",
    trigger: "Cron `/api/cron/trial-billing`",
    templateLocation:
      "lib/email/templates/trialBillingFailureEmail.ts + layout transaccional mínimo",
  },
  {
    id: "auth_signup_confirmation",
    name: "Confirmación de cuenta",
    description:
      "Link para confirmar el correo al registrarse con email y contraseña.",
    provider: "resend",
    subjectExample: "Falta confirmar tu correo",
    trigger: "Registro en `/register` (`registerAccountWithEmail`)",
    templateLocation:
      "lib/email/templates/authConfirmSignupEmail.ts + layout transaccional mínimo",
  },
  {
    id: "auth_password_recovery",
    name: "Recuperación de contraseña",
    description: "Link para restablecer la contraseña desde `/recovery-password`.",
    provider: "resend",
    subjectExample: "Te dejo el enlace para tu contraseña",
    trigger: "Formulario en `/recovery-password` (`requestPasswordRecoveryEmail`)",
    templateLocation:
      "lib/email/templates/authResetPasswordEmail.ts + layout transaccional mínimo",
    testNote:
      "En producción, si el correo no tiene cuenta, igual mostramos éxito por seguridad.",
  },
]

export function getRootsyEmailDefinition(
  id: RootsyEmailId,
): RootsyEmailDefinition | undefined {
  return ROOTSY_EMAIL_CATALOG.find((entry) => entry.id === id)
}
