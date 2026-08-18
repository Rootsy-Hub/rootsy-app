const NAME_CHARS = /[^a-zA-ZÀ-ÖØ-öø-ÿÁÉÍÓÚáéíóúÑñ\s]/g
const NAME_PATTERN =
  /^[a-zA-ZÀ-ÖØ-öø-ÿÁÉÍÓÚáéíóúÑñ]+(?:\s[a-zA-ZÀ-ÖØ-öø-ÿÁÉÍÓÚáéíóúÑñ]+)*$/

const EMAIL_ALLOWED = /[^a-zA-Z0-9._%+\-@]/g
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

/** Letras y espacios — descarta números y símbolos al tipear. */
export function sanitizeNameInput(raw: string): string {
  return raw.replace(NAME_CHARS, "")
}

export function formatNameInput(raw: string): string {
  return sanitizeNameInput(raw).replace(/\s+/g, " ").trim()
}

/** Charset típico de correo — no deja `][;]` ni espacios. */
export function sanitizeEmailInput(raw: string): string {
  const allowed = raw.replace(/\s/g, "").replace(EMAIL_ALLOWED, "")
  const at = allowed.indexOf("@")
  if (at === -1) return allowed
  const local = allowed.slice(0, at)
  const domain = allowed.slice(at + 1).replace(/@/g, "")
  return `${local}@${domain}`
}

export function formatEmailInput(raw: string): string {
  return sanitizeEmailInput(raw).trim().toLowerCase()
}

export function validateNameField(label: string, value: string): string {
  const v = formatNameInput(value)
  if (!v) return `${label} es requerido`
  if (!NAME_PATTERN.test(v)) {
    return `${label} solo puede contener letras y espacios`
  }
  return ""
}

export function validateEmailField(value: string): string {
  const v = formatEmailInput(value)
  if (!v) return "El correo electrónico es requerido"
  if (!EMAIL_PATTERN.test(v)) {
    return "Ingresá un correo electrónico válido"
  }
  return ""
}

/** Email opcional — vacío es válido; con texto exige formato de correo. */
export function validateOptionalEmailField(value: string): string {
  const v = formatEmailInput(value)
  if (!v) return ""
  if (!EMAIL_PATTERN.test(v)) {
    return "Ingresá un correo electrónico válido"
  }
  return ""
}

const WEAK_SEQUENCE =
  /(?:0123|1234|2345|3456|4567|5678|6789|7890|abcd|qwer|asdf|password|clave)/i

export function validateSignupPassword(value: string): string {
  if (!value) return "La contraseña es requerida"
  if (value.length < 8) return "Usá al menos 8 caracteres"
  if (/(.)\1\1/.test(value)) {
    return "No uses caracteres repetidos como aaa"
  }
  if (WEAK_SEQUENCE.test(value) || /(?:012|123|234|345|456|567|678|789)/.test(value)) {
    return "No uses secuencias como 123"
  }
  return ""
}

export const SIGNUP_PASSWORD_HINT =
  "Mínimo 8 caracteres. Evitá secuencias como 123 o repeticiones como aaa."
