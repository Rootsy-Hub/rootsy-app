export const INTEGER_INPUT_MAX_LEN = 5

/** Entero no negativo opcional (vacío permitido). */
export function isValidNonNegativeIntegerInput(raw: string): boolean {
  if (raw === "") return true
  if (raw.length > INTEGER_INPUT_MAX_LEN) return false
  return /^\d+$/.test(raw)
}

/** Solo dígitos, respetando el largo máximo del regex. */
export function sanitizeNonNegativeIntegerInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, INTEGER_INPUT_MAX_LEN)
}

export function parseNonNegativeIntegerInput(
  raw: string,
  fallback = Number.NaN,
): number {
  const trimmed = raw.trim()
  if (!trimmed) return fallback
  const n = Number.parseInt(trimmed, 10)
  if (!Number.isFinite(n) || n < 0) return fallback
  return n
}

export function formatNonNegativeIntegerInput(
  n: number | null | undefined,
): string {
  if (n == null || !Number.isFinite(n) || n < 0) return ""
  return String(Math.trunc(n))
}

export function clampNonNegativeIntegerInput(
  raw: string,
  max: number,
): string {
  if (raw === "") return ""
  const parsed = parseNonNegativeIntegerInput(raw, Number.NaN)
  if (!Number.isFinite(parsed)) return ""
  return formatNonNegativeIntegerInput(Math.min(max, parsed))
}
