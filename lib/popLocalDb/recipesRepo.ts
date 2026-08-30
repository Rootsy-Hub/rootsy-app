import {
  recipeSnapshotBindValues,
  sqlRecipeRowToSnapshot,
} from "@/lib/popLocalDb/mapRecipe"
import type { PopLocalDatabase } from "@/lib/popLocalDb/database"
import type {
  ListMenuRecipesInput,
  ListMenuRecipesResult,
  RecipeSnapshot,
} from "@/lib/popLocalDb/types"

const UPSERT_RECIPE_SQL = `
INSERT OR REPLACE INTO recipes (
  id, name, description, image_url, category_id, category_name,
  sale_price, iva, is_active, allow_negative_stock, station_id,
  output_article_id, list_prices, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`

export function upsertRecipeSnapshots(
  db: PopLocalDatabase,
  rows: RecipeSnapshot[],
  updatedAt = new Date().toISOString(),
) {
  if (rows.length === 0) return
  for (const row of rows) {
    db.run(UPSERT_RECIPE_SQL, recipeSnapshotBindValues(row, updatedAt))
  }
}

function fillHydrateSeen(db: PopLocalDatabase, ids: string[]) {
  db.exec(
    "CREATE TEMP TABLE IF NOT EXISTS recipe_hydrate_seen (id TEXT PRIMARY KEY)",
  )
  db.exec("DELETE FROM recipe_hydrate_seen")
  for (const id of ids) {
    db.run("INSERT INTO recipe_hydrate_seen (id) VALUES (?)", [id])
  }
}

export function deleteRecipesNotIn(db: PopLocalDatabase, ids: string[]) {
  fillHydrateSeen(db, ids)
  db.run(
    `DELETE FROM recipe_ingredients
     WHERE recipe_id NOT IN (SELECT id FROM recipe_hydrate_seen)`,
  )
  db.run(
    `DELETE FROM recipes
     WHERE id NOT IN (SELECT id FROM recipe_hydrate_seen)`,
  )
  db.exec("DROP TABLE IF EXISTS recipe_hydrate_seen")
}

export function deleteRecipeById(db: PopLocalDatabase, recipeId: string) {
  db.run("DELETE FROM recipe_ingredients WHERE recipe_id = ?", [recipeId])
  db.run("DELETE FROM recipes WHERE id = ?", [recipeId])
}

export function getRecipeById(
  db: PopLocalDatabase,
  recipeId: string,
): RecipeSnapshot | null {
  const id = recipeId.trim()
  if (!id) return null
  const row = db.get("SELECT * FROM recipes WHERE id = ?", [id])
  return row ? sqlRecipeRowToSnapshot(row) : null
}

const MENU_RECIPE_WHERE = "is_active = 1"

function menuRecipeFilters(input: ListMenuRecipesInput): {
  where: string
  params: Array<string | number>
} {
  const clauses = [MENU_RECIPE_WHERE]
  const params: Array<string | number> = []
  const search = input.search?.trim() ?? ""
  if (search) {
    const like = `%${search.replace(/[%_]/g, "")}%`
    clauses.push(
      "(name LIKE ? COLLATE NOCASE OR description LIKE ? COLLATE NOCASE)",
    )
    params.push(like, like)
    if (input.categoryIds && input.categoryIds.length > 0) {
      clauses.push(
        `category_id IN (${input.categoryIds.map(() => "?").join(",")})`,
      )
      params.push(...input.categoryIds)
    }
  } else if (input.categoryId) {
    clauses.push("category_id = ?")
    params.push(input.categoryId)
  }
  return {
    where: clauses.join(" AND "),
    params,
  }
}

export function listMenuRecipes(
  db: PopLocalDatabase,
  input: ListMenuRecipesInput,
): ListMenuRecipesResult {
  const page = Math.max(1, input.page)
  const pageSize = Math.max(1, input.pageSize)
  const { where, params } = menuRecipeFilters(input)
  const countRow = db.get<{ total: number }>(
    `SELECT COUNT(*) AS total FROM recipes WHERE ${where}`,
    params,
  )
  const totalCount = Number(countRow?.total ?? 0)
  const rows = db.all(
    `SELECT * FROM recipes WHERE ${where} ORDER BY name COLLATE NOCASE LIMIT ? OFFSET ?`,
    [...params, pageSize, (page - 1) * pageSize],
  )
  return {
    recipes: rows.map(sqlRecipeRowToSnapshot),
    totalCount,
    page,
  }
}

export function listAllRecipes(db: PopLocalDatabase): RecipeSnapshot[] {
  return db
    .all(
      `SELECT * FROM recipes
       ORDER BY name COLLATE NOCASE ASC`,
    )
    .map(sqlRecipeRowToSnapshot)
}

export function renameRecipesCategory(
  db: PopLocalDatabase,
  categoryId: string,
  name: string,
): boolean {
  const id = categoryId.trim()
  const next = name.trim()
  if (!id || !next) return false
  const row = db.get<{ total: number }>(
    `SELECT COUNT(*) AS total FROM recipes WHERE category_id = ?`,
    [id],
  )
  if (Number(row?.total ?? 0) === 0) return false
  db.run(`UPDATE recipes SET category_name = ? WHERE category_id = ?`, [
    next,
    id,
  ])
  return true
}

export function updateRecipesStationForCategory(
  db: PopLocalDatabase,
  categoryId: string,
  stationId: string | null,
): boolean {
  const id = categoryId.trim()
  if (!id) return false
  const row = db.get<{ total: number }>(
    `SELECT COUNT(*) AS total FROM recipes WHERE category_id = ?`,
    [id],
  )
  if (Number(row?.total ?? 0) === 0) return false
  db.run(`UPDATE recipes SET station_id = ? WHERE category_id = ?`, [
    stationId,
    id,
  ])
  return true
}
