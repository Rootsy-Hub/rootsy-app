export const ARTICLE_DISCOUNT_MODES = ["porcentaje", "fijo"] as const

export type ArticleDiscountMode = (typeof ARTICLE_DISCOUNT_MODES)[number]

export function isArticleDiscountMode(v: string): v is ArticleDiscountMode {
  return (ARTICLE_DISCOUNT_MODES as readonly string[]).includes(v)
}

export function roundArticleMoney(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 100) / 100
}

export function articleHasCatalogDiscount(
  mode: ArticleDiscountMode | null | undefined,
  value: number | null | undefined,
): boolean {
  return (
    mode != null &&
    isArticleDiscountMode(mode) &&
    value != null &&
    Number.isFinite(value) &&
    value > 0
  )
}

export function effectiveArticleSalePrice(
  salePrice: number,
  mode: ArticleDiscountMode | null | undefined,
  value: number | null | undefined,
): number {
  const base = Number.isFinite(salePrice) ? salePrice : 0
  if (!articleHasCatalogDiscount(mode, value)) return roundArticleMoney(base)
  const v = Number(value)
  if (mode === "porcentaje") {
    const pct = Math.min(100, Math.max(0, v))
    return roundArticleMoney(base * (1 - pct / 100))
  }
  return roundArticleMoney(Math.max(0, base - v))
}

export function formatArticleDiscountBadge(
  mode: ArticleDiscountMode,
  value: number,
): string {
  if (mode === "porcentaje") {
    const pct = Number.isInteger(value) ? String(value) : value.toLocaleString("es-AR", { maximumFractionDigits: 2 })
    return `−${pct} %`
  }
  return `−${value.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function parseArticleDiscountInput(
  itemKind: string,
  modeRaw: string,
  valueRaw: string,
): {
  discountMode: ArticleDiscountMode | null
  discountValue: number | null
  error?: string
} {
  if (itemKind !== "merchandise") {
    return { discountMode: null, discountValue: null }
  }
  const modeTrim = modeRaw.trim()
  const valueTrim = valueRaw.trim().replace(",", ".")
  if (!modeTrim && !valueTrim) {
    return { discountMode: null, discountValue: null }
  }
  if (!isArticleDiscountMode(modeTrim)) {
    return {
      discountMode: null,
      discountValue: null,
      error: "Elegí un tipo de descuento válido.",
    }
  }
  if (!valueTrim) {
    return {
      discountMode: null,
      discountValue: null,
      error: "Indicá el monto o porcentaje del descuento.",
    }
  }
  const n = Number.parseFloat(valueTrim)
  if (!Number.isFinite(n) || n <= 0) {
    return {
      discountMode: null,
      discountValue: null,
      error: "El descuento debe ser mayor que cero.",
    }
  }
  if (modeTrim === "porcentaje" && n > 100) {
    return {
      discountMode: null,
      discountValue: null,
      error: "El descuento porcentual no puede superar 100 %.",
    }
  }
  return {
    discountMode: modeTrim,
    discountValue: roundArticleMoney(n),
  }
}
