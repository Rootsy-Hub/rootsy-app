/** Alineado con purchases.purchase_kind — un solo vocabulario en catálogo y compras. */
export const ARTICLE_ITEM_KINDS = [
  "merchandise",
  "raw_material",
  "supply",
] as const

export type ArticleItemKind = (typeof ARTICLE_ITEM_KINDS)[number]

export const ARTICLE_ITEM_KIND_LABEL: Record<ArticleItemKind, string> = {
  merchandise: "Mercadería",
  raw_material: "Materia prima",
  supply: "Insumo",
}

/** Etiquetas en pantalla Stock (merchandise → Producto). */
export const ARTICLE_ITEM_KIND_STOCK_LABEL: Record<ArticleItemKind, string> = {
  merchandise: "Producto",
  raw_material: "Materia prima",
  supply: "Insumo",
}

/** Texto corto en selector al crear/editar artículo. */
export const ARTICLE_ITEM_KIND_SELECTOR_HINT: Record<ArticleItemKind, string> = {
  merchandise: "Para venta al público",
  raw_material: "Producción o cocina · no se vende",
  supply: "Uso operativo · no se vende",
}

export const ARTICLE_ITEM_KIND_HINT: Record<ArticleItemKind, string> = {
  merchandise:
    "Productos vendibles: unidades, kg, fracciones. Ej. carne al kilo, frutos secos.",
  raw_material:
    "Insumos de producción o cocina. Ej. harina para elaborar, no la bolsa vendida al público.",
  supply:
    "Insumos operativos: cajas, packaging, limpieza. Stock contable; no se venden.",
}

export function isArticleItemKind(v: string): v is ArticleItemKind {
  return (ARTICLE_ITEM_KINDS as readonly string[]).includes(v)
}

export function defaultIsSellableForKind(kind: ArticleItemKind): boolean {
  return kind === "merchandise"
}

export function defaultUnitForKind(kind: ArticleItemKind): UnitOfMeasureValue {
  return kind === "merchandise" ? "unidad" : "kg"
}

export const UNIT_OF_MEASURE_VALUES = [
  "unidad",
  "kg",
  "g",
  "lt",
  "ml",
  "m",
  "cm",
  "caja",
] as const

export type UnitOfMeasureValue = (typeof UNIT_OF_MEASURE_VALUES)[number]

/** Valor del select cuando el usuario elige unidad personalizada. */
export const CUSTOM_UNIT_OF_MEASURE_SELECT = "__custom__" as const

export const MAX_CUSTOM_UNIT_OF_MEASURE_LENGTH = 64

export const UNIT_OF_MEASURE_OPTIONS: {
  value: UnitOfMeasureValue
  label: string
  short: string
}[] = [
  { value: "unidad", label: "Unidad", short: "u." },
  { value: "kg", label: "Kilogramo", short: "kg" },
  { value: "g", label: "Gramo", short: "g" },
  { value: "lt", label: "Litro", short: "lt" },
  { value: "ml", label: "Mililitro", short: "ml" },
  { value: "m", label: "Metro", short: "m" },
  { value: "cm", label: "Centímetro", short: "cm" },
  { value: "caja", label: "Caja", short: "caja" },
]

const UOM_LABEL = Object.fromEntries(
  UNIT_OF_MEASURE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<string, string>

const UOM_SHORT = Object.fromEntries(
  UNIT_OF_MEASURE_OPTIONS.map((o) => [o.value, o.short]),
) as Record<string, string>

export function isUnitOfMeasure(v: string): v is UnitOfMeasureValue {
  return (UNIT_OF_MEASURE_VALUES as readonly string[]).includes(v)
}

export function isValidStoredUnitOfMeasure(v: string): boolean {
  const trimmed = v.trim()
  if (!trimmed) return false
  if (isUnitOfMeasure(trimmed)) return true
  return trimmed.length <= MAX_CUSTOM_UNIT_OF_MEASURE_LENGTH
}

export function normalizeStoredUnitOfMeasure(
  raw: string | null | undefined,
  fallback = "unidad",
): string {
  const trimmed = String(raw ?? "").trim()
  if (!trimmed) return fallback
  if (isValidStoredUnitOfMeasure(trimmed)) return trimmed
  return fallback
}

export function unitOfMeasureToFormState(stored: string): {
  unitOfMeasure: string
  customUnitOfMeasure: string
} {
  const normalized = String(stored ?? "").trim()
  if (!normalized || isUnitOfMeasure(normalized)) {
    return {
      unitOfMeasure: normalized || "unidad",
      customUnitOfMeasure: "",
    }
  }
  return {
    unitOfMeasure: CUSTOM_UNIT_OF_MEASURE_SELECT,
    customUnitOfMeasure: normalized,
  }
}

export function parseUnitOfMeasureFromForm(
  unitSelect: string,
  customText: string,
): { ok: true; value: string } | { ok: false; error: string } {
  if (unitSelect === CUSTOM_UNIT_OF_MEASURE_SELECT) {
    const trimmed = customText.trim()
    if (!trimmed) {
      return {
        ok: false,
        error: "Indicá la unidad personalizada.",
      }
    }
    if (trimmed.length > MAX_CUSTOM_UNIT_OF_MEASURE_LENGTH) {
      return {
        ok: false,
        error: `La unidad personalizada no puede superar ${MAX_CUSTOM_UNIT_OF_MEASURE_LENGTH} caracteres.`,
      }
    }
    return { ok: true, value: trimmed }
  }
  if (!isUnitOfMeasure(unitSelect)) {
    return { ok: false, error: "Unidad de medida inválida." }
  }
  return { ok: true, value: unitSelect }
}

export function labelUnitOfMeasure(value: string | null | undefined): string {
  if (!value?.trim()) return "—"
  return UOM_LABEL[value] ?? value
}

export function shortUnitOfMeasure(value: string | null | undefined): string {
  if (!value?.trim()) return ""
  return UOM_SHORT[value] ?? value
}

export function isPartialItemKindsFilter(
  kinds: readonly ArticleItemKind[],
): boolean {
  return (
    kinds.length > 0 &&
    kinds.length < ARTICLE_ITEM_KINDS.length &&
    kinds.every((k) => (ARTICLE_ITEM_KINDS as readonly string[]).includes(k))
  )
}

export function itemKindsFilterLabel(kinds: readonly ArticleItemKind[]): string {
  return kinds.map((k) => ARTICLE_ITEM_KIND_STOCK_LABEL[k]).join(", ")
}

export function parseItemKindsCsv(raw: string | null | undefined): ArticleItemKind[] {
  if (!raw?.trim()) return []
  const out: ArticleItemKind[] = []
  for (const part of raw.split(",")) {
    const token = part.trim()
    if (isArticleItemKind(token) && !out.includes(token)) {
      out.push(token)
    }
  }
  return out
}
