export type TaxDocumentInputMode = "cuit_only" | "cuit_or_dni"

/** Solo dígitos y guiones de formato CUIT; sin letras ni otros caracteres. */
export function sanitizeTaxDocumentInput(
  raw: string,
  mode: TaxDocumentInputMode,
): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11)
  if (!digits) return ""

  if (digits.length === 11) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`
  }

  if (mode === "cuit_only") {
    return digits
  }

  return digits
}
