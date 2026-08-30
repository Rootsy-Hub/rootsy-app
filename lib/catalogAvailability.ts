export type CatalogAvailabilityStatus =
  | "available"
  | "limited"
  | "unavailable"
  | "warn"
  | "stale"
  | "unknown"

export type CatalogAvailability = {
  status: CatalogAvailabilityStatus
  servings: number | null
  blocked: boolean
  allowNegative: boolean
  stale: boolean
}

export type ArticleStockSnap = {
  stockOnHand: number
  allowNegativeStock: boolean
}

export type RecipeAvailabilityIngredient = {
  articleId: string
  quantity: number
  wastePct: number | null
  defaultWastePct: number | null
}

export type RecipeAvailabilityPlan = {
  allowNegative: boolean
  outputArticleId: string | null
  ingredients: RecipeAvailabilityIngredient[]
}

export type ComboAvailabilitySlot = {
  quantity: number
  options: Array<{ kind: "article" | "recipe"; refId: string }>
}

export const CATALOG_AVAILABILITY_LIMITED_MAX = 3
export const CATALOG_STOCK_STALE_MS = 15 * 60 * 1000

export function effectiveWastePct(
  lineWastePct: number | null | undefined,
  articleDefaultWastePct: number | null | undefined,
): number {
  if (lineWastePct != null && Number.isFinite(lineWastePct)) {
    return Math.max(0, Math.min(100, lineWastePct))
  }
  if (articleDefaultWastePct != null && Number.isFinite(articleDefaultWastePct)) {
    return Math.max(0, Math.min(100, articleDefaultWastePct))
  }
  return 0
}

export function consumptionQuantity(
  quantity: number,
  wastePct: number | null | undefined,
  articleDefaultWastePct: number | null | undefined,
  unitsProduced = 1,
): number {
  const waste = effectiveWastePct(wastePct, articleDefaultWastePct)
  return quantity * unitsProduced * (1 + waste / 100)
}

export function isCatalogStockStale(
  hydratedAt: string | null | undefined,
  now = Date.now(),
  maxAgeMs = CATALOG_STOCK_STALE_MS,
): boolean {
  if (!hydratedAt) return true
  const t = Date.parse(hydratedAt)
  if (!Number.isFinite(t)) return true
  return now - t > maxAgeMs
}

function servingsFromStock(stock: number, perUnit: number): number {
  if (!(perUnit > 1e-9) || !(stock > 1e-6)) return 0
  return Math.floor((stock + 1e-9) / perUnit)
}

function finishAvailability(
  servings: number,
  allowNegative: boolean,
  stale: boolean,
): CatalogAvailability {
  const out = servings <= 0
  const blocked = out && !allowNegative
  let status: CatalogAvailabilityStatus
  if (stale) status = "stale"
  else if (out && allowNegative) status = "warn"
  else if (out) status = "unavailable"
  else if (servings <= CATALOG_AVAILABILITY_LIMITED_MAX) status = "limited"
  else status = "available"
  return {
    status,
    servings,
    blocked,
    allowNegative,
    stale,
  }
}

export function unknownAvailability(
  allowNegative = false,
  stale = false,
): CatalogAvailability {
  return {
    status: "unknown",
    servings: null,
    blocked: false,
    allowNegative,
    stale,
  }
}

export function projectArticleAvailability(
  article: ArticleStockSnap,
  stale = false,
): CatalogAvailability {
  return finishAvailability(
    servingsFromStock(article.stockOnHand, 1),
    article.allowNegativeStock,
    stale,
  )
}

export function projectRecipeAvailability(
  plan: RecipeAvailabilityPlan | null | undefined,
  stockByArticleId: Map<string, ArticleStockSnap>,
  stale = false,
): CatalogAvailability {
  if (!plan) return unknownAvailability(false, stale)
  if (plan.outputArticleId) {
    const output = stockByArticleId.get(plan.outputArticleId)
    if (!output) return unknownAvailability(plan.allowNegative, stale)
    return finishAvailability(
      servingsFromStock(output.stockOnHand, 1),
      plan.allowNegative || output.allowNegativeStock,
      stale,
    )
  }
  if (plan.ingredients.length === 0) {
    return unknownAvailability(plan.allowNegative, stale)
  }
  let servings = Number.POSITIVE_INFINITY
  for (const ing of plan.ingredients) {
    const perUnit = consumptionQuantity(
      ing.quantity,
      ing.wastePct,
      ing.defaultWastePct,
      1,
    )
    const stock = stockByArticleId.get(ing.articleId)
    if (!stock) return unknownAvailability(plan.allowNegative, stale)
    servings = Math.min(servings, servingsFromStock(stock.stockOnHand, perUnit))
  }
  if (!Number.isFinite(servings)) {
    return unknownAvailability(plan.allowNegative, stale)
  }
  return finishAvailability(servings, plan.allowNegative, stale)
}

export function projectComboAvailability(
  slots: ComboAvailabilitySlot[],
  stockByArticleId: Map<string, ArticleStockSnap>,
  recipes: Map<string, RecipeAvailabilityPlan>,
  stale = false,
): CatalogAvailability {
  if (slots.length === 0) return unknownAvailability(false, stale)
  let servings = Number.POSITIVE_INFINITY
  let allowNegative = true
  let sawKnown = false
  for (const slot of slots) {
    const need = Math.max(1, Number(slot.quantity) || 1)
    let best: CatalogAvailability | null = null
    for (const option of slot.options) {
      const optionAvail =
        option.kind === "article"
          ? stockByArticleId.has(option.refId)
            ? projectArticleAvailability(
                stockByArticleId.get(option.refId)!,
                stale,
              )
            : unknownAvailability(false, stale)
          : projectRecipeAvailability(
              recipes.get(option.refId),
              stockByArticleId,
              stale,
            )
      if (optionAvail.status === "unknown" || optionAvail.servings == null) {
        continue
      }
      if (!best || (optionAvail.servings ?? 0) > (best.servings ?? 0)) {
        best = optionAvail
      }
    }
    if (!best || best.servings == null) {
      return unknownAvailability(false, stale)
    }
    sawKnown = true
    allowNegative = allowNegative && best.allowNegative
    servings = Math.min(servings, Math.floor((best.servings + 1e-9) / need))
  }
  if (!sawKnown || !Number.isFinite(servings)) {
    return unknownAvailability(false, stale)
  }
  return finishAvailability(servings, allowNegative, stale)
}

export function applyAvailabilityToProduct<
  T extends {
    stockOnHand?: number
    allowNegativeStock?: boolean
    unitOfMeasure?: string
    kind?: string
  },
>(product: T, availability: CatalogAvailability | null | undefined): T {
  if (!availability || availability.status === "unknown") return product
  return {
    ...product,
    stockOnHand: availability.servings ?? 0,
    allowNegativeStock: availability.allowNegative,
    unitOfMeasure:
      product.unitOfMeasure ??
      (product.kind === "recipe" || product.kind === "promotion"
        ? "porción"
        : product.unitOfMeasure),
  }
}
