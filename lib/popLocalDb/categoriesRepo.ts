import {
  categorySnapshotBindValues,
  sqlCategoryRowToSnapshot,
} from "@/lib/popLocalDb/mapCategory"
import type { PopLocalDatabase } from "@/lib/popLocalDb/database"
import type { CategorySnapshot } from "@/lib/popLocalDb/types"

const UPSERT_CATEGORY_SQL = `
INSERT OR REPLACE INTO categories (
  id, name, item_kind, sort_order, show_in_sale, visible, show_in_menu, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`

const SALE_BOARD_WHERE = `
  item_kind = 'merchandise'
  AND show_in_sale = 1
`

export function upsertCategorySnapshots(
  db: PopLocalDatabase,
  rows: CategorySnapshot[],
  updatedAt = new Date().toISOString(),
) {
  if (rows.length === 0) return
  for (const row of rows) {
    db.run(UPSERT_CATEGORY_SQL, categorySnapshotBindValues(row, updatedAt))
  }
}

export function replaceAllCategories(
  db: PopLocalDatabase,
  rows: CategorySnapshot[],
  updatedAt = new Date().toISOString(),
) {
  db.transaction(() => {
    db.run("DELETE FROM categories")
    upsertCategorySnapshots(db, rows, updatedAt)
  })
}

export function getCategoryById(
  db: PopLocalDatabase,
  categoryId: string,
): CategorySnapshot | null {
  const id = categoryId.trim()
  if (!id) return null
  const row = db.get(
    "SELECT * FROM categories WHERE id = ?",
    [id],
  )
  return row ? sqlCategoryRowToSnapshot(row) : null
}

export function deleteCategoryById(db: PopLocalDatabase, categoryId: string) {
  db.run("DELETE FROM categories WHERE id = ?", [categoryId])
}

export function listSaleBoardCategories(db: PopLocalDatabase): CategorySnapshot[] {
  return db
    .all(
      `SELECT * FROM categories
       WHERE ${SALE_BOARD_WHERE}
       ORDER BY sort_order ASC, name COLLATE NOCASE ASC`,
    )
    .map(sqlCategoryRowToSnapshot)
}

export function listAllCategories(db: PopLocalDatabase): CategorySnapshot[] {
  return db
    .all(
      `SELECT * FROM categories
       ORDER BY sort_order ASC, name COLLATE NOCASE ASC`,
    )
    .map(sqlCategoryRowToSnapshot)
}
