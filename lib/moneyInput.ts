export const MONEY_INPUT_MAX_LEN = 14
export const MONEY_INPUT_DISPLAY_MAX_LEN = 22

const moneyFieldDisplayFmt = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Permite dígitos con separador decimal opcional (`,` o `.`). */
export function isValidMoneyInput(raw: string): boolean {
  const sanitized = sanitizeMoneyInput(raw)
  if (sanitized.length > MONEY_INPUT_MAX_LEN) return false
  return /^\d*[.,]?\d*$/.test(sanitized)
}

function simpleMoneySanitize(stripped: string): string {
  let out = ""
  let hasSep = false
  for (const ch of stripped) {
    if (ch >= "0" && ch <= "9") {
      if (out.length >= MONEY_INPUT_MAX_LEN) break
      out += ch
    } else if ((ch === "," || ch === ".") && !hasSep) {
      if (out.length >= MONEY_INPUT_MAX_LEN) break
      out += ","
      hasSep = true
    }
  }
  if (
    /[.,]$/.test(stripped) &&
    !out.endsWith(",") &&
    !hasSep &&
    out.length < MONEY_INPUT_MAX_LEN
  ) {
    out += ","
  }
  return out.slice(0, MONEY_INPUT_MAX_LEN)
}

/**
 * Limpia el texto respetando las mismas reglas que isValidMoneyInput.
 * Ignora caracteres inválidos y normaliza `.` a `,` para una carga más fluida.
 */
export function sanitizeMoneyInput(raw: string): string {
  if (!raw) return ""
  const stripped = raw.replace(/[^\d.,]/g, "")
  if (!stripped) return ""

  const sepCount = (stripped.match(/[.,]/g) ?? []).length
  if (sepCount <= 1) {
    return simpleMoneySanitize(stripped)
  }

  const lastComma = stripped.lastIndexOf(",")
  const lastDot = stripped.lastIndexOf(".")

  if (lastComma > lastDot) {
    const intPart = stripped.slice(0, lastComma).replace(/[.,]/g, "")
    const decPart = stripped.slice(lastComma + 1).replace(/\D/g, "").slice(0, 2)
    return simpleMoneySanitize(
      decPart.length > 0 ? `${intPart},${decPart}` : `${intPart},`,
    )
  }

  if (lastDot > lastComma) {
    const after = stripped.slice(lastDot + 1).replace(/\D/g, "")
    if (after.length <= 2) {
      const intPart = stripped.slice(0, lastDot).replace(/[.,]/g, "")
      return simpleMoneySanitize(
        after.length > 0 ? `${intPart},${after}` : `${intPart},`,
      )
    }
  }

  return stripped.replace(/[.,]/g, "").slice(0, MONEY_INPUT_MAX_LEN)
}

/** Convierte texto ingresado a monto (hasta 2 decimales). */
export function parseMoneyInput(raw: string, fallback = 0): number {
  const trimmed = raw.trim()
  if (!trimmed) return fallback

  if (trimmed.includes(",")) {
    const normalized = trimmed.replace(/\./g, "").replace(",", ".")
    const n = Number.parseFloat(normalized)
    if (!Number.isFinite(n) || n < 0) return fallback
    return Math.round(n * 100) / 100
  }

  // Sin coma decimal: los puntos son separadores de miles del formato visual.
  const digits = trimmed.replace(/\./g, "").replace(/\D/g, "")
  if (!digits) return fallback
  const n = Number.parseInt(digits, 10)
  if (!Number.isFinite(n) || n < 0) return fallback
  return n
}

/** Formato final de presentación: miles + 2 decimales (`1.250,00`). */
export function formatMoneyInputForField(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return ""
  const rounded = Math.round(n * 100) / 100
  return moneyFieldDisplayFmt.format(rounded)
}

function formatMoneyDecimalLive(sanitized: string): string {
  const parsed = parseMoneyInput(sanitized, Number.NaN)
  if (Number.isFinite(parsed)) {
    return formatMoneyInputForField(parsed)
  }
  return sanitized
}

/** Si el usuario escribe después de `,00`, el dígito pasa a la parte entera (`1,002` → `12,00`). */
function normalizeMoneyTypingOverflow(raw: string): string {
  const stripped = raw.replace(/[^\d,]/g, "")
  const match = stripped.match(/^(\d+),(\d{2})(\d+)$/)
  if (!match) return raw
  const [, intPart, decPart, overflow] = match
  return `${intPart}${overflow},${decPart}`
}

/**
 * Formatea en vivo con el estilo final siempre visible: miles + `,XX`.
 * Ej: `1` → `1,00` · `1250` → `1.250,00` · `1250,5` → `1.250,50`.
 */
export function formatMoneyInputLive(raw: string): string {
  if (!raw) return ""

  const normalizedRaw = raw.includes(",") ? normalizeMoneyTypingOverflow(raw) : raw

  if (normalizedRaw.includes(",")) {
    const sanitized = sanitizeMoneyInput(normalizedRaw)
    if (!sanitized) return ""
    return formatMoneyDecimalLive(sanitized)
  }

  const digits = normalizedRaw.replace(/\D/g, "")
  if (!digits) return ""
  const parsed = Number.parseInt(digits, 10)
  if (!Number.isFinite(parsed)) return ""
  return formatMoneyInputForField(parsed)
}

/** Aplica sanitize + formato en vivo en cada cambio del input. */
export function applyMoneyInputChange(raw: string): string {
  return formatMoneyInputLive(raw)
}

type MoneyCursorContext = {
  intDigitsBefore: number
  decDigitsBefore: number
  inDecimal: boolean
}

function countDigitsInSlice(str: string): number {
  return (str.match(/\d/g) ?? []).length
}

function getMoneyCursorContext(raw: string, pos: number): MoneyCursorContext {
  const safePos = Math.max(0, Math.min(pos, raw.length))
  const commaIdx = raw.indexOf(",")

  if (commaIdx < 0 || safePos <= commaIdx) {
    return {
      intDigitsBefore: countDigitsInSlice(raw.slice(0, safePos)),
      decDigitsBefore: 0,
      inDecimal: false,
    }
  }

  return {
    intDigitsBefore: countDigitsInSlice(raw.slice(0, commaIdx)),
    decDigitsBefore: countDigitsInSlice(raw.slice(commaIdx + 1, safePos)),
    inDecimal: true,
  }
}

function positionAfterDigitCount(
  str: string,
  digitCount: number,
  from = 0,
  to = str.length,
): number {
  if (digitCount <= 0) return from
  let digits = 0
  for (let i = from; i < to; i++) {
    if (/\d/.test(str[i]!)) {
      digits++
      if (digits >= digitCount) return i + 1
    }
  }
  return to
}

function resolveMoneyInputCursor(
  formatted: string,
  ctx: MoneyCursorContext,
): number {
  const commaIdx = formatted.indexOf(",")

  if (!ctx.inDecimal || commaIdx < 0) {
    const end = commaIdx >= 0 ? commaIdx : formatted.length
    return positionAfterDigitCount(formatted, ctx.intDigitsBefore, 0, end)
  }

  if (ctx.decDigitsBefore <= 0) return commaIdx + 1

  return positionAfterDigitCount(
    formatted,
    ctx.decDigitsBefore,
    commaIdx + 1,
    formatted.length,
  )
}

/** Formatea el monto y recalcula la selección para no saltar al final del input. */
export function applyMoneyInputChangeWithSelection(
  raw: string,
  selectionStart: number,
  selectionEnd: number,
): { value: string; selectionStart: number; selectionEnd: number } {
  const value = applyMoneyInputChange(raw)
  const startCtx = getMoneyCursorContext(raw, selectionStart)
  const endCtx = getMoneyCursorContext(raw, selectionEnd)

  const newStart = resolveMoneyInputCursor(value, startCtx)
  const newEnd =
    selectionStart === selectionEnd
      ? newStart
      : resolveMoneyInputCursor(value, endCtx)

  return {
    value,
    selectionStart: Math.min(newStart, value.length),
    selectionEnd: Math.min(newEnd, value.length),
  }
}

/** Cierra decimales parciales al salir del campo (`1.250,5` → `1.250,50`). */
export function finalizeMoneyInput(raw: string): string {
  const sanitized = sanitizeMoneyInput(raw)
  if (!sanitized) return ""
  const parsed = parseMoneyInput(sanitized, Number.NaN)
  if (!Number.isFinite(parsed)) return formatMoneyInputLive(sanitized)
  return formatMoneyInputForField(parsed)
}

/** @deprecated Usar applyMoneyInputChange — el campo ya no cambia de formato al foco. */
export function moneyInputToEditable(raw: string): string {
  return formatMoneyInputLive(raw)
}

export function isMoneyInputComplete(raw: string): boolean {
  const trimmed = raw.trim()
  if (!trimmed) return false
  return Number.isFinite(parseMoneyInput(trimmed, Number.NaN))
}
