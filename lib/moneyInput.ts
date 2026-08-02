export const MONEY_INPUT_MAX_LEN = 14

/** Permite dígitos con separador decimal opcional (`,` o `.`). */
export function isValidMoneyInput(raw: string): boolean {
  if (raw.length > MONEY_INPUT_MAX_LEN) return false
  return /^\d*[.,]?\d*$/.test(raw)
}

/** Convierte texto ingresado a monto (hasta 2 decimales). */
export function parseMoneyInput(raw: string, fallback = 0): number {
  const trimmed = raw.trim()
  if (!trimmed) return fallback
  const normalized = trimmed.includes(",")
    ? trimmed.replace(/\./g, "").replace(",", ".")
    : trimmed
  const n = Number.parseFloat(normalized)
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.round(n * 100) / 100
}

/** Formatea un monto para edición en campo (decimal con coma). */
export function formatMoneyInputForField(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return ""
  const rounded = Math.round(n * 100) / 100
  if (rounded === 0) return "0"
  return String(rounded).replace(".", ",")
}

/** Quita separadores de miles y deja el texto listo para editar. */
export function moneyInputToEditable(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ""
  const parsed = parseMoneyInput(trimmed, Number.NaN)
  if (Number.isFinite(parsed)) {
    return formatMoneyInputForField(parsed)
  }
  if (trimmed.includes(",")) {
    return trimmed.replace(/\./g, "")
  }
  return trimmed
}

export function isMoneyInputComplete(raw: string): boolean {
  const trimmed = raw.trim()
  if (!trimmed) return false
  return Number.isFinite(parseMoneyInput(trimmed, Number.NaN))
}
