import type { CounterOrder } from "@/app/[siteId]/[popId]/mostrador/mostradorTypes"
import type { PopLocalDatabase } from "@/lib/popLocalDb/database"
import {
  orderSlimBindValues,
  sqlOrderRowToSnapshot,
} from "@/lib/popLocalDb/mapMostradorBoard"

const UPSERT_ORDER_SQL = `
INSERT OR REPLACE INTO mostrador_orders_slim (
  id, order_day, order_number, status, fulfillment_type, delivery_address,
  phone, driver_name, estimated_minutes, notes, immediate_fulfillment,
  sale_id, opened_at, updated_at, delivered_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`

export function replaceMostradorOrdersSlim(
  db: PopLocalDatabase,
  orders: CounterOrder[],
) {
  db.transaction(() => {
    db.run("DELETE FROM mostrador_orders_slim")
    for (const order of orders) {
      if (order.saleId || order.status === "cancelled") continue
      db.run(UPSERT_ORDER_SQL, orderSlimBindValues({ ...order, checkout: null }))
    }
  })
}

export function upsertMostradorOrderSlim(db: PopLocalDatabase, order: CounterOrder) {
  if (order.saleId || order.status === "cancelled") {
    deleteMostradorOrderSlim(db, order.id)
    return
  }
  db.run(UPSERT_ORDER_SQL, orderSlimBindValues({ ...order, checkout: null }))
}

export function deleteMostradorOrderSlim(db: PopLocalDatabase, orderId: string) {
  db.run("DELETE FROM mostrador_orders_slim WHERE id = ?", [orderId])
}

export function listMostradorOrdersSlim(db: PopLocalDatabase): CounterOrder[] {
  return db
    .all("SELECT * FROM mostrador_orders_slim ORDER BY opened_at DESC")
    .map((row) => sqlOrderRowToSnapshot(row))
}
