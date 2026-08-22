export const ARCA_PTO_VTA_MIN = 1
export const ARCA_PTO_VTA_MAX = 99999

export function formatArcaPtoVta(value: number): string {
  return String(Math.max(0, Math.floor(value))).padStart(5, "0")
}

export function formatArcaExpiryLabel(iso: string | null | undefined): string | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return null
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number)
  if (!year || !month || !day) return null
  const d = new Date(year, month - 1, day)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export const ARCA_PTO_VTA_PAD = "00000"

export function sanitizeArcaPtoVtaInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 5)
}

export function padArcaPtoVtaDigits(raw: string): string {
  return raw.replace(/\D/g, "").slice(-5).padStart(5, "0")
}

export function pushArcaPtoVtaDigit(current: string, digit: string): string {
  if (!/^\d$/.test(digit)) return padArcaPtoVtaDigits(current)
  return padArcaPtoVtaDigits(`${current.replace(/\D/g, "")}${digit}`)
}

export function popArcaPtoVtaDigit(current: string): string {
  return padArcaPtoVtaDigits(current.replace(/\D/g, "").slice(0, -1))
}

export function formatArcaPtoVtaInput(raw: string): string {
  const digits = sanitizeArcaPtoVtaInput(raw)
  if (!digits) return ARCA_PTO_VTA_PAD
  return digits.padStart(5, "0")
}

export function parseArcaPtoVta(
  raw: string,
): { success: true; value: number } | { success: false; error: string } {
  const digits = raw.replace(/\D/g, "")
  if (!digits) {
    return { success: false, error: "Indicá el número de punto de venta." }
  }
  const value = Number(digits)
  if (
    !Number.isFinite(value) ||
    value < ARCA_PTO_VTA_MIN ||
    value > ARCA_PTO_VTA_MAX
  ) {
    return {
      success: false,
      error: "Punto de venta inválido (00001–99999).",
    }
  }
  return { success: true, value: Math.trunc(value) }
}

export function argentinaTodayYmd(): string {
  return new Date()
    .toLocaleString("sv-SE", { timeZone: "America/Argentina/Buenos_Aires" })
    .slice(0, 10)
}

export function daysUntilArcaDate(ymd: string | null | undefined): number | null {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}/.test(ymd)) return null
  const exp = Date.parse(`${ymd.slice(0, 10)}T00:00:00`)
  const today = Date.parse(`${argentinaTodayYmd()}T00:00:00`)
  if (!Number.isFinite(exp) || !Number.isFinite(today)) return null
  return Math.round((exp - today) / 86_400_000)
}

export function arcaSalePointStatusLabel(input: {
  configured: boolean
  daysUntilExpiry: number | null
}): string {
  if (!input.configured) return "Pendiente"
  if (input.daysUntilExpiry == null) return "Configurado"
  const days = input.daysUntilExpiry
  if (days === 0) return "Vence hoy"
  if (days > 0) return days === 1 ? "Vence en 1 día" : `Vence en ${days} días`
  const ago = Math.abs(days)
  return ago === 1 ? "Venció hace 1 día" : `Venció hace ${ago} días`
}
