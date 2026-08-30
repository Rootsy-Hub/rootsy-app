export type PopOperateCapabilities = {
  inventoryControl: boolean
  recipes: boolean
  promotions: boolean
  tables: boolean
  manufacturing: boolean
  recipeAvailability: boolean
  hydrateRecipes: boolean
  hydrateBom: boolean
  hydratePromotions: boolean
}

export function moduleKeysFromPopAccess(
  modules: ReadonlyArray<{ key: string }> | null | undefined,
): string[] {
  return (modules ?? []).map((mod) => mod.key)
}

export function derivePopOperateCapabilities(
  moduleKeys: readonly string[],
): PopOperateCapabilities {
  const keys = new Set(moduleKeys)
  const has = (key: string) => keys.has(key)
  const inventoryControl = has("inventory")
  const recipes = has("recipes")
  return {
    inventoryControl,
    recipes,
    promotions: has("promotions"),
    tables: has("mesas"),
    manufacturing: has("manufacturing"),
    recipeAvailability: recipes && inventoryControl,
    hydrateRecipes: recipes,
    hydrateBom: recipes && inventoryControl,
    hydratePromotions: has("promotions"),
  }
}

/** Sin workspace (tests / páginas sueltas): no recortar el catálogo. */
export const OPEN_POP_OPERATE_CAPABILITIES = derivePopOperateCapabilities([
  "inventory",
  "recipes",
  "promotions",
  "mesas",
  "manufacturing",
])
