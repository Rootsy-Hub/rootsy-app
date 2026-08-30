import type { PopLocalDatabase } from "@/lib/popLocalDb/database"
import type { RecipeIngredientSnapshot } from "@/lib/popLocalDb/types"

const UPSERT_SQL = `
INSERT OR REPLACE INTO recipe_ingredients (
  recipe_id, article_id, quantity, waste_pct, article_default_waste_pct, sort_order
) VALUES (?, ?, ?, ?, ?, ?)
`

function asNullableNumber(value: unknown): number | null {
  if (value == null || value === "") return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function upsertRecipeIngredientSnapshots(
  db: PopLocalDatabase,
  rows: RecipeIngredientSnapshot[],
) {
  if (rows.length === 0) return
  for (const row of rows) {
    db.run(UPSERT_SQL, [
      row.recipeId,
      row.articleId,
      row.quantity,
      row.wastePct,
      row.articleDefaultWastePct,
      row.sortOrder,
    ])
  }
}

export function replaceAllRecipeIngredients(
  db: PopLocalDatabase,
  rows: RecipeIngredientSnapshot[],
) {
  db.exec("DELETE FROM recipe_ingredients")
  upsertRecipeIngredientSnapshots(db, rows)
}

export function listAllRecipeIngredients(
  db: PopLocalDatabase,
): RecipeIngredientSnapshot[] {
  return db
    .all<{
      recipe_id: unknown
      article_id: unknown
      quantity: unknown
      waste_pct: unknown
      article_default_waste_pct: unknown
      sort_order: unknown
    }>(
      `SELECT recipe_id, article_id, quantity, waste_pct, article_default_waste_pct, sort_order
       FROM recipe_ingredients
       ORDER BY recipe_id, sort_order`,
    )
    .map((row) => ({
      recipeId: String(row.recipe_id),
      articleId: String(row.article_id),
      quantity: Number(row.quantity) || 0,
      wastePct: asNullableNumber(row.waste_pct),
      articleDefaultWastePct: asNullableNumber(row.article_default_waste_pct),
      sortOrder: Number(row.sort_order) || 0,
    }))
}

export function listArticleStockSnaps(db: PopLocalDatabase): Array<{
  id: string
  stockOnHand: number
  allowNegativeStock: boolean
}> {
  return db
    .all<{
      id: unknown
      stock_on_hand: unknown
      allow_negative_stock: unknown
    }>(
      `SELECT id, stock_on_hand, allow_negative_stock FROM articles`,
    )
    .map((row) => ({
      id: String(row.id),
      stockOnHand: Number(row.stock_on_hand) || 0,
      allowNegativeStock:
        row.allow_negative_stock === 1 ||
        row.allow_negative_stock === true ||
        row.allow_negative_stock === "1",
    }))
}
