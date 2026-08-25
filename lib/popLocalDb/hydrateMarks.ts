import type { PopLocalDatabase } from "@/lib/popLocalDb/database"

const BACKFILL_META = "articles_hydrated_backfilled"

export function articlesHydratedMetaKey(categoryId: string) {
  return `articles_hydrated:${categoryId}`
}

export function backfillArticlesHydratedMarks(db: PopLocalDatabase): boolean {
  if (db.getMeta(BACKFILL_META)) return false
  const at = new Date().toISOString()
  const rows = db.all<{ category_id: string }>(
    `SELECT DISTINCT category_id AS category_id
     FROM articles
     WHERE item_kind = 'merchandise'
       AND IFNULL(category_id, '') != ''`,
  )
  for (const row of rows) {
    db.setMeta(articlesHydratedMetaKey(row.category_id), at)
  }
  db.setMeta(BACKFILL_META, at)
  return true
}

export function isArticlesCategoryHydrated(
  db: PopLocalDatabase,
  categoryId: string,
): boolean {
  return Boolean(db.getMeta(articlesHydratedMetaKey(categoryId)))
}

export function markArticlesCategoryHydrated(
  db: PopLocalDatabase,
  categoryId: string,
  at = new Date().toISOString(),
) {
  db.setMeta(articlesHydratedMetaKey(categoryId), at)
}

export function clearArticlesHydratedMarks(db: PopLocalDatabase) {
  db.run("DELETE FROM meta WHERE key LIKE 'articles_hydrated:%'")
}
