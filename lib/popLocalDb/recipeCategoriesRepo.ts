import {
  recipeCategorySnapshotBindValues,
  sqlRecipeCategoryRowToSnapshot,
} from "@/lib/popLocalDb/mapRecipeCategory"
import type { PopLocalDatabase } from "@/lib/popLocalDb/database"
import type { RecipeCategorySnapshot } from "@/lib/popLocalDb/types"

const UPSERT_RECIPE_CATEGORY_SQL = `
INSERT OR REPLACE INTO recipe_categories (
  id, name, sort_order, show_in_menu, is_active, station_id, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?)
`

export function upsertRecipeCategorySnapshots(
  db: PopLocalDatabase,
  rows: RecipeCategorySnapshot[],
  updatedAt = new Date().toISOString(),
) {
  if (rows.length === 0) return
  for (const row of rows) {
    db.run(UPSERT_RECIPE_CATEGORY_SQL, recipeCategorySnapshotBindValues(row, updatedAt))
  }
}

export function replaceAllRecipeCategories(
  db: PopLocalDatabase,
  rows: RecipeCategorySnapshot[],
  updatedAt = new Date().toISOString(),
) {
  db.transaction(() => {
    db.run("DELETE FROM recipe_categories")
    upsertRecipeCategorySnapshots(db, rows, updatedAt)
  })
}

export function getRecipeCategoryById(
  db: PopLocalDatabase,
  categoryId: string,
): RecipeCategorySnapshot | null {
  const id = categoryId.trim()
  if (!id) return null
  const row = db.get("SELECT * FROM recipe_categories WHERE id = ?", [id])
  return row ? sqlRecipeCategoryRowToSnapshot(row) : null
}

export function deleteRecipeCategoryById(
  db: PopLocalDatabase,
  categoryId: string,
) {
  db.run("DELETE FROM recipe_categories WHERE id = ?", [categoryId])
}

export function listAllRecipeCategories(
  db: PopLocalDatabase,
): RecipeCategorySnapshot[] {
  return db
    .all(
      `SELECT * FROM recipe_categories
       ORDER BY sort_order ASC, name COLLATE NOCASE ASC`,
    )
    .map(sqlRecipeCategoryRowToSnapshot)
}

export function listMenuRecipeCategories(
  db: PopLocalDatabase,
): RecipeCategorySnapshot[] {
  return db
    .all(
      `SELECT * FROM recipe_categories
       WHERE is_active = 1 AND show_in_menu = 1
       ORDER BY sort_order ASC, name COLLATE NOCASE ASC`,
    )
    .map(sqlRecipeCategoryRowToSnapshot)
}
