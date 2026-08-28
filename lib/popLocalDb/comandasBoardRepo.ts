import { isComandaTicketStored } from "@/app/[siteId]/[popId]/comandas/comandasLogic"
import type { ComandaTicket } from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import type { PopLocalDatabase } from "@/lib/popLocalDb/database"
import {
  sqlTicketRowToSnapshot,
  ticketBindValues,
} from "@/lib/popLocalDb/mapComandasBoard"

const UPSERT_TICKET_SQL = `
INSERT OR REPLACE INTO comandas_tickets (
  id, station_id, status, source_kind, source_id, cart_line_id, recipe_id,
  recipe_name, quantity, comment, origin_label, customer_name, created_at,
  updated_at, status_changed_at, sent_at, preparing_at, ready_at, delivered_at,
  send_id, send_kind, send_comment
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`

const LIST_STATION_SQL = `
SELECT * FROM comandas_tickets
WHERE station_id = ?
ORDER BY created_at ASC, id ASC
`

export function replaceComandaTickets(
  db: PopLocalDatabase,
  tickets: ComandaTicket[],
) {
  db.transaction(() => {
    db.run("DELETE FROM comandas_tickets")
    for (const ticket of tickets) {
      if (!isComandaTicketStored(ticket)) continue
      db.run(UPSERT_TICKET_SQL, ticketBindValues(ticket))
    }
  })
}

export function upsertComandaTicket(db: PopLocalDatabase, ticket: ComandaTicket) {
  if (!isComandaTicketStored(ticket)) {
    deleteComandaTicket(db, ticket.id)
    return
  }
  db.run(UPSERT_TICKET_SQL, ticketBindValues(ticket))
}

export function deleteComandaTicket(db: PopLocalDatabase, ticketId: string) {
  db.run("DELETE FROM comandas_tickets WHERE id = ?", [ticketId])
}

export function deleteComandaTicketsBySendId(
  db: PopLocalDatabase,
  sendId: string,
) {
  db.run("DELETE FROM comandas_tickets WHERE send_id = ?", [sendId])
}

export function listComandaTicketsByStation(
  db: PopLocalDatabase,
  stationId: string,
): ComandaTicket[] {
  return db
    .all(LIST_STATION_SQL, [stationId])
    .map((row) => sqlTicketRowToSnapshot(row))
    .filter((ticket) => isComandaTicketStored(ticket))
}
