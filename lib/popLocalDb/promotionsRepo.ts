import {
  promotionSnapshotBindValues,
  sqlPromotionRowToSnapshot,
} from "@/lib/popLocalDb/mapPromotion"
import type { PopLocalDatabase } from "@/lib/popLocalDb/database"
import type { PromotionSnapshot } from "@/lib/popLocalDb/types"

const UPSERT_PROMOTION_SQL = `
INSERT OR REPLACE INTO promotions (
  id, name, description, image_url, promotion_type, pricing_mode,
  fixed_price, discount_mode, discount_value, buy_quantity, benefit_quantity,
  benefit_discount_pct, apply_benefit_to, auto_apply, show_in_menu, is_active,
  sort_order, valid_from, valid_until, valid_time_start, valid_time_end,
  schedule_days, slots, updated_at
) VALUES (
  ?, ?, ?, ?, ?, ?,
  ?, ?, ?, ?, ?,
  ?, ?, ?, ?, ?,
  ?, ?, ?, ?, ?,
  ?, ?, ?
)
`

export function upsertPromotionSnapshots(
  db: PopLocalDatabase,
  rows: PromotionSnapshot[],
  updatedAt = new Date().toISOString(),
) {
  if (rows.length === 0) return
  for (const row of rows) {
    db.run(UPSERT_PROMOTION_SQL, promotionSnapshotBindValues(row, updatedAt))
  }
}

function fillHydrateSeen(db: PopLocalDatabase, ids: string[]) {
  db.exec(
    "CREATE TEMP TABLE IF NOT EXISTS promotion_hydrate_seen (id TEXT PRIMARY KEY)",
  )
  db.exec("DELETE FROM promotion_hydrate_seen")
  for (const id of ids) {
    db.run("INSERT INTO promotion_hydrate_seen (id) VALUES (?)", [id])
  }
}

export function deletePromotionsNotIn(db: PopLocalDatabase, ids: string[]) {
  fillHydrateSeen(db, ids)
  db.run(
    `DELETE FROM promotions
     WHERE id NOT IN (SELECT id FROM promotion_hydrate_seen)`,
  )
  db.exec("DROP TABLE IF EXISTS promotion_hydrate_seen")
}

export function deletePromotionById(db: PopLocalDatabase, promotionId: string) {
  db.run("DELETE FROM promotions WHERE id = ?", [promotionId])
}

export function listAllPromotions(db: PopLocalDatabase): PromotionSnapshot[] {
  return db
    .all(
      `SELECT * FROM promotions
       ORDER BY sort_order ASC, name COLLATE NOCASE ASC`,
    )
    .map(sqlPromotionRowToSnapshot)
}
