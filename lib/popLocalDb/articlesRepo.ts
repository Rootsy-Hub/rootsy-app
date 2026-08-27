import {
  articleSnapshotBindValues,
  sqlArticleRowToSnapshot,
} from "@/lib/popLocalDb/mapArticle"
import type { PopLocalDatabase } from "@/lib/popLocalDb/database"
import type {
  ArticleSnapshot,
  ListSaleBoardArticlesInput,
  ListSaleBoardArticlesResult,
} from "@/lib/popLocalDb/types"

const UPSERT_ARTICLE_SQL = `
INSERT OR REPLACE INTO articles (
  id, name, description, image_url, barcode, sku, item_kind,
  category_id, category_name, sale_price, iva, discount_mode, discount_value,
  unit_of_measure, is_sellable, is_active, allow_negative_stock, stock_on_hand,
  list_prices, updated_at
) VALUES (
  ?, ?, ?, ?, ?, ?, ?,
  ?, ?, ?, ?, ?, ?,
  ?, ?, ?, ?, ?,
  ?, ?
)
`

const SALE_BOARD_WHERE = `
  is_active = 1
  AND is_sellable = 1
  AND item_kind = 'merchandise'
`

function saleBoardFilters(input: ListSaleBoardArticlesInput): {
  where: string
  params: Array<string | number>
} {
  const clauses = [SALE_BOARD_WHERE]
  const params: Array<string | number> = []
  const search = input.search?.trim() ?? ""
  if (search) {
    const like = `%${search.replace(/[%_]/g, "")}%`
    clauses.push("(name LIKE ? COLLATE NOCASE OR IFNULL(barcode, '') LIKE ? OR IFNULL(sku, '') LIKE ?)")
    params.push(like, like, like)
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

export function upsertArticleSnapshots(
  db: PopLocalDatabase,
  rows: ArticleSnapshot[],
  updatedAt = new Date().toISOString(),
) {
  if (rows.length === 0) return
  for (const row of rows) {
    db.run(UPSERT_ARTICLE_SQL, articleSnapshotBindValues(row, updatedAt))
  }
}

function fillHydrateSeen(db: PopLocalDatabase, ids: string[]) {
  db.exec(
    "CREATE TEMP TABLE IF NOT EXISTS article_hydrate_seen (id TEXT PRIMARY KEY)",
  )
  db.exec("DELETE FROM article_hydrate_seen")
  for (const id of ids) {
    db.run("INSERT INTO article_hydrate_seen (id) VALUES (?)", [id])
  }
}

export function deleteMerchandiseNotIn(db: PopLocalDatabase, ids: string[]) {
  fillHydrateSeen(db, ids)
  db.run(
    `DELETE FROM articles
     WHERE item_kind = 'merchandise'
       AND id NOT IN (SELECT id FROM article_hydrate_seen)`,
  )
  db.exec("DROP TABLE IF EXISTS article_hydrate_seen")
}

export function deleteMerchandiseNotInCategory(
  db: PopLocalDatabase,
  categoryId: string,
  ids: string[],
) {
  fillHydrateSeen(db, ids)
  db.run(
    `DELETE FROM articles
     WHERE item_kind = 'merchandise'
       AND category_id = ?
       AND id NOT IN (SELECT id FROM article_hydrate_seen)`,
    [categoryId],
  )
  db.exec("DROP TABLE IF EXISTS article_hydrate_seen")
}

export function replaceMerchandiseArticles(
  db: PopLocalDatabase,
  rows: ArticleSnapshot[],
  updatedAt = new Date().toISOString(),
) {
  db.transaction(() => {
    upsertArticleSnapshots(db, rows, updatedAt)
    deleteMerchandiseNotIn(
      db,
      rows.map((row) => row.id),
    )
  })
}

export function listSaleBoardArticles(
  db: PopLocalDatabase,
  input: ListSaleBoardArticlesInput,
): ListSaleBoardArticlesResult {
  const page = Math.max(1, input.page)
  const pageSize = Math.max(1, input.pageSize)
  const { where, params } = saleBoardFilters(input)
  const countRow = db.get<{ total: number }>(
    `SELECT COUNT(*) AS total FROM articles WHERE ${where}`,
    params,
  )
  const totalCount = Number(countRow?.total ?? 0)
  const rows = db.all(
    `SELECT * FROM articles WHERE ${where} ORDER BY name COLLATE NOCASE LIMIT ? OFFSET ?`,
    [...params, pageSize, (page - 1) * pageSize],
  )
  return {
    articles: rows.flatMap((row) => {
      const snap = sqlArticleRowToSnapshot(row)
      return snap ? [snap] : []
    }),
    totalCount,
    page,
  }
}

export function deleteArticleById(db: PopLocalDatabase, articleId: string) {
  db.run("DELETE FROM articles WHERE id = ?", [articleId])
}

export function getArticleById(
  db: PopLocalDatabase,
  articleId: string,
): ArticleSnapshot | null {
  const id = articleId.trim()
  if (!id) return null
  const row = db.get("SELECT * FROM articles WHERE id = ?", [id])
  return row ? sqlArticleRowToSnapshot(row) : null
}

/** Scan de Vender: barcode o sku exacto, o nombre único. Solo merchandise vendible. */
export function findSaleBoardArticleByScan(
  db: PopLocalDatabase,
  rawQuery: string,
): ArticleSnapshot | null {
  const query = rawQuery.trim()
  if (!query) return null

  const barcodeRows = db.all(
    `SELECT * FROM articles
     WHERE ${SALE_BOARD_WHERE}
       AND IFNULL(barcode, '') = ?
     ORDER BY name COLLATE NOCASE`,
    [query],
  )
  if (barcodeRows.length === 1) {
    return sqlArticleRowToSnapshot(barcodeRows[0]!) ?? null
  }
  if (barcodeRows.length > 1) return null

  const skuRows = db.all(
    `SELECT * FROM articles
     WHERE ${SALE_BOARD_WHERE}
       AND IFNULL(sku, '') = ?
     ORDER BY name COLLATE NOCASE`,
    [query],
  )
  if (skuRows.length === 1) {
    return sqlArticleRowToSnapshot(skuRows[0]!) ?? null
  }
  if (skuRows.length > 1) return null

  const nameRows = db.all(
    `SELECT * FROM articles
     WHERE ${SALE_BOARD_WHERE}
       AND name = ? COLLATE NOCASE
     ORDER BY name COLLATE NOCASE`,
    [query],
  )
  if (nameRows.length !== 1) return null
  return sqlArticleRowToSnapshot(nameRows[0]!) ?? null
}

/** Renombra la categoría denormalizada en artículos locales. Sin rehidratar. */
export function renameArticlesCategory(
  db: PopLocalDatabase,
  categoryId: string,
  name: string,
): boolean {
  const id = categoryId.trim()
  const next = name.trim()
  if (!id || !next) return false
  const row = db.get<{ total: number }>(
    `SELECT COUNT(*) AS total FROM articles WHERE category_id = ?`,
    [id],
  )
  if (Number(row?.total ?? 0) === 0) return false
  db.run(`UPDATE articles SET category_name = ? WHERE category_id = ?`, [
    next,
    id,
  ])
  return true
}

export function countLocalArticles(db: PopLocalDatabase): number {
  const row = db.get<{ total: number }>("SELECT COUNT(*) AS total FROM articles")
  return Number(row?.total ?? 0)
}
