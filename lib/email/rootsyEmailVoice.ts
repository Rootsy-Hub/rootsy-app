/**
 * Voz de Rootsy en correos transaccionales.
 *
 * Tono: primera persona, rioplatense (vos), cercana y clara — como la mascota
 * en la app ("No encontré nada. ¿Probamos otra búsqueda?").
 *
 * Más onda = frases cortas, invitación a actuar sin presión, calidez sutil.
 * Evitar: slang, exclamaciones de más, chistes forzados, tono corporativo.
 */
export const ROOTSY_EMAIL_GREETING = "Hola,"

export const ROOTSY_EMAIL_LINK_FALLBACK =
  "Si el enlace no abre, copiá y pegá esto en el navegador:"

export const ROOTSY_EMAIL_SIGNATURE_LINE = "— Rootsy"

export const ROOTSY_EMAIL_PREVIEW = {
  generic: "Es un mail de prueba desde Uroboros.",
  invitation:
    "Es un mail de prueba desde Uroboros. El enlace no sirve para aceptar una invitación real.",
  billing: "Es un mail de prueba desde Uroboros. No es un cobro real.",
} as const

export function popInvitationEmailSubject(popName: string): string {
  return `Te invitaron a ${popName}`
}

export function popInvitationEmailPreheader(popName: string): string {
  return `Quedó una invitación pendiente para ${popName}. ¿La vemos?`
}

export function popInvitationEmailBody(popName: string): string {
  return `${popName} quiere que te sumes al equipo. Si no tenés cuenta, la creás con el mismo enlace.`
}

export const POP_INVITATION_EMAIL_MESSAGE_INTRO = "Te dejaron un mensaje:"

export const POP_INVITATION_EMAIL_CTA = "Sumarme al equipo"

export function authConfirmSignupEmailSubject(): string {
  return "Falta confirmar tu correo"
}

export const AUTH_CONFIRM_SIGNUP_EMAIL_PREHEADER =
  "Un paso más y activamos tu cuenta."

export const AUTH_CONFIRM_SIGNUP_EMAIL_BODY =
  "Qué bueno que te sumes. Confirmá tu correo y arrancamos con tu negocio."

export const AUTH_CONFIRM_SIGNUP_EMAIL_CTA = "Confirmar mi correo"

export const AUTH_CONFIRM_SIGNUP_EMAIL_DISCLAIMER =
  "Si no fuiste vos, ignorá este mail — no cambia nada."

export const AUTH_CONFIRM_SIGNUP_EMAIL_FOOTER =
  "Te escribí porque acabás de registrarte."

export function authResetPasswordEmailSubject(): string {
  return "Te dejo el enlace para tu contraseña"
}

export const AUTH_RESET_PASSWORD_EMAIL_PREHEADER =
  "Con este enlace elegís una contraseña nueva."

export const AUTH_RESET_PASSWORD_EMAIL_BODY =
  "Recibí tu pedido para cambiar la contraseña. Te dejo el enlace acá abajo."

export const AUTH_RESET_PASSWORD_EMAIL_CTA = "Elegir contraseña nueva"

export const AUTH_RESET_PASSWORD_EMAIL_DISCLAIMER =
  "Si no pediste esto, no hace falta que hagas nada."

export const AUTH_RESET_PASSWORD_EMAIL_FOOTER =
  "Por seguridad, el enlace expira en un rato."

export function trialBillingFailureEmailSubject(popName: string): string {
  return `No pude cobrar ${popName}`
}

export function trialBillingFailureEmailPreheader(popName: string): string {
  return `Revisemos el medio de pago de ${popName}.`
}

export function trialBillingFailureEmailBody(
  popName: string,
  trialEndsAt: string,
): string {
  return `La prueba gratis de ${popName} terminó el ${trialEndsAt}. Intenté cobrar con la tarjeta guardada, pero no salió.`
}

export const TRIAL_BILLING_FAILURE_EMAIL_ACTION =
  "Actualizá el medio de pago y seguimos sin pausa. Voy a reintentar el cobro en unos días."

export const TRIAL_BILLING_FAILURE_EMAIL_CTA = "Actualizar medio de pago"

export const TRIAL_BILLING_FAILURE_EMAIL_SUPPORT =
  "Si no se resuelve, respondeme este mail o escribime desde la app."

export const TRIAL_BILLING_FAILURE_EMAIL_FOOTER =
  "Te aviso porque sos quien administra la cuenta."

export const TRIAL_BILLING_FAILURE_EMAIL_ERROR_PREFIX = "Detalle:"
