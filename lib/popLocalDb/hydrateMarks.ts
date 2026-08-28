import type { PopLocalDatabase } from "@/lib/popLocalDb/database"

const ARTICLES_HYDRATED_META = "articles_hydrated"
const ARTICLES_HYDRATED_BACKFILL_META = "articles_hydrated_backfilled"
const CATEGORIES_HYDRATED_META = "categories_hydrated"
const PROMOTIONS_HYDRATED_META = "promotions_hydrated"
const RECIPES_HYDRATED_META = "recipes_hydrated"
const RECIPE_CATEGORIES_HYDRATED_META = "recipe_categories_hydrated"
const MESAS_FLOOR_HYDRATED_META = "mesas_floor_hydrated"
const MOSTRADOR_BOARD_HYDRATED_META = "mostrador_board_hydrated"

export function isArticlesHydrated(db: PopLocalDatabase): boolean {
  return Boolean(db.getMeta(ARTICLES_HYDRATED_META))
}

export function markArticlesHydrated(
  db: PopLocalDatabase,
  at = new Date().toISOString(),
) {
  db.setMeta(ARTICLES_HYDRATED_META, at)
}

export function clearArticlesHydratedMarks(db: PopLocalDatabase) {
  db.run("DELETE FROM meta WHERE key = ?", [ARTICLES_HYDRATED_META])
  db.run("DELETE FROM meta WHERE key LIKE 'articles_hydrated:%'")
  db.run("DELETE FROM meta WHERE key = ?", [ARTICLES_HYDRATED_BACKFILL_META])
}

export function isCategoriesHydrated(db: PopLocalDatabase): boolean {
  return Boolean(db.getMeta(CATEGORIES_HYDRATED_META))
}

export function markCategoriesHydrated(
  db: PopLocalDatabase,
  at = new Date().toISOString(),
) {
  db.setMeta(CATEGORIES_HYDRATED_META, at)
}

export function clearCategoriesHydratedMark(db: PopLocalDatabase) {
  db.run("DELETE FROM meta WHERE key = ?", [CATEGORIES_HYDRATED_META])
}

export function isPromotionsHydrated(db: PopLocalDatabase): boolean {
  return Boolean(db.getMeta(PROMOTIONS_HYDRATED_META))
}

export function markPromotionsHydrated(
  db: PopLocalDatabase,
  at = new Date().toISOString(),
) {
  db.setMeta(PROMOTIONS_HYDRATED_META, at)
}

export function clearPromotionsHydratedMark(db: PopLocalDatabase) {
  db.run("DELETE FROM meta WHERE key = ?", [PROMOTIONS_HYDRATED_META])
}

export function isRecipesHydrated(db: PopLocalDatabase): boolean {
  return Boolean(db.getMeta(RECIPES_HYDRATED_META))
}

export function markRecipesHydrated(
  db: PopLocalDatabase,
  at = new Date().toISOString(),
) {
  db.setMeta(RECIPES_HYDRATED_META, at)
}

export function clearRecipesHydratedMark(db: PopLocalDatabase) {
  db.run("DELETE FROM meta WHERE key = ?", [RECIPES_HYDRATED_META])
}

export function isRecipeCategoriesHydrated(db: PopLocalDatabase): boolean {
  return Boolean(db.getMeta(RECIPE_CATEGORIES_HYDRATED_META))
}

export function markRecipeCategoriesHydrated(
  db: PopLocalDatabase,
  at = new Date().toISOString(),
) {
  db.setMeta(RECIPE_CATEGORIES_HYDRATED_META, at)
}

export function clearRecipeCategoriesHydratedMark(db: PopLocalDatabase) {
  db.run("DELETE FROM meta WHERE key = ?", [RECIPE_CATEGORIES_HYDRATED_META])
}

export function isMesasFloorHydrated(db: PopLocalDatabase): boolean {
  return Boolean(db.getMeta(MESAS_FLOOR_HYDRATED_META))
}

export function markMesasFloorHydrated(
  db: PopLocalDatabase,
  at = new Date().toISOString(),
) {
  db.setMeta(MESAS_FLOOR_HYDRATED_META, at)
}

export function clearMesasFloorHydratedMark(db: PopLocalDatabase) {
  db.run("DELETE FROM meta WHERE key = ?", [MESAS_FLOOR_HYDRATED_META])
}

export function isMostradorBoardHydrated(db: PopLocalDatabase): boolean {
  return Boolean(db.getMeta(MOSTRADOR_BOARD_HYDRATED_META))
}

export function markMostradorBoardHydrated(
  db: PopLocalDatabase,
  at = new Date().toISOString(),
) {
  db.setMeta(MOSTRADOR_BOARD_HYDRATED_META, at)
}

export function clearMostradorBoardHydratedMark(db: PopLocalDatabase) {
  db.run("DELETE FROM meta WHERE key = ?", [MOSTRADOR_BOARD_HYDRATED_META])
}
