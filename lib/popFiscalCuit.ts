import { normalizeCuitDigits } from "@/lib/argentinaPadronLookup"

/** CUIT del POP listo para emitir comprobantes fiscales (11 dígitos). */
export function hasValidPopFiscalCuit(raw: string | null | undefined): boolean {
  const trimmed = String(raw ?? "").trim()
  if (!trimmed) return false
  return normalizeCuitDigits(trimmed) != null
}
