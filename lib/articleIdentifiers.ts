/** Normaliza SKU interno (alfanumérico, guiones). Vacío → null. */
export function normalizeArticleSku(raw: string | null | undefined): string | null {
  const trimmed = String(raw ?? "").trim()
  if (!trimmed) return null
  return trimmed.slice(0, 64)
}

/** Normaliza código de barras (solo dígitos). Vacío → null. */
export function normalizeArticleBarcode(
  raw: string | null | undefined,
): string | null {
  const digits = String(raw ?? "").replace(/\D/g, "")
  if (!digits) return null
  if (digits.length < 8 || digits.length > 14) {
    return null
  }
  return digits
}

export function validateArticleBarcodeInput(
  raw: string | null | undefined,
): { ok: true; value: string | null } | { ok: false; error: string } {
  const trimmed = String(raw ?? "").trim()
  if (!trimmed) return { ok: true, value: null }
  const normalized = normalizeArticleBarcode(trimmed)
  if (!normalized) {
    return {
      ok: false,
      error: "El código de barras debe tener entre 8 y 14 dígitos (EAN/UPC).",
    }
  }
  return { ok: true, value: normalized }
}
