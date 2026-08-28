import type {
  MesasFloorDecorRow,
  MesasLayoutData,
  MesasTableRow,
} from "@/app/[siteId]/[popId]/mesas/actions"
import type { MesasReservationSettingsCache } from "@/app/[siteId]/[popId]/mesas/mesasQueryCache"
import { readMesasReservationSettings } from "@/app/[siteId]/[popId]/mesas/mesasReservationLogic"
import type { MesaReservation, MesaSession } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { DEFAULT_OPERATIONAL_DAY_CLOSE_TIME } from "@/lib/popOperationalDay"
import type { PopLocalDatabase } from "@/lib/popLocalDb/database"
import {
  decorBindValues,
  layoutFromRows,
  MESAS_SETTINGS_ROW_ID,
  reservationSlimBindValues,
  salonBindValues,
  sessionSlimBindValues,
  settingsBindValues,
  sqlDecorRowToSnapshot,
  sqlReservationRowToSnapshot,
  sqlSalonRowToSnapshot,
  sqlSessionRowToSnapshot,
  sqlSettingsRowToSnapshot,
  sqlTableRowToSnapshot,
  tableBindValues,
} from "@/lib/popLocalDb/mapMesasFloor"

const UPSERT_SALON_SQL = `
INSERT OR REPLACE INTO mesas_salons (id, name, sort_order, is_active)
VALUES (?, ?, ?, ?)
`

const UPSERT_TABLE_SQL = `
INSERT OR REPLACE INTO mesas_tables (
  id, salon_id, label, shape, x, y, rotation, seats, sort_order, is_active
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`

const UPSERT_DECOR_SQL = `
INSERT OR REPLACE INTO mesas_decors (
  id, salon_id, kind, x, y, width, height, rotation, label, sort_order, is_active
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`

const UPSERT_SESSION_SQL = `
INSERT OR REPLACE INTO mesas_sessions_slim (
  id, table_ids, waiter_id, guest_count, note, opened_at, updated_at, floor_status
) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`

const UPSERT_RESERVATION_SQL = `
INSERT OR REPLACE INTO mesas_reservations_slim (
  id, table_id, table_ids, client_id, client_name, guest_count, arrival_at, status, note, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`

const UPSERT_SETTINGS_SQL = `
INSERT OR REPLACE INTO mesas_reservation_settings (
  id, floor_buffer_minutes, grace_minutes, operational_day_close_time
) VALUES (?, ?, ?, ?)
`

const EMPTY_SETTINGS: MesasReservationSettingsCache = {
  settings: readMesasReservationSettings(null),
  operationalDayCloseTime: DEFAULT_OPERATIONAL_DAY_CLOSE_TIME,
}

export function replaceMesasLayout(db: PopLocalDatabase, layout: MesasLayoutData) {
  db.transaction(() => {
    db.run("DELETE FROM mesas_salons")
    db.run("DELETE FROM mesas_tables")
    db.run("DELETE FROM mesas_decors")
    for (const salon of layout.salons) {
      db.run(UPSERT_SALON_SQL, salonBindValues(salon))
    }
    for (const table of layout.tables) {
      db.run(UPSERT_TABLE_SQL, tableBindValues(table))
    }
    for (const decor of layout.decors) {
      db.run(UPSERT_DECOR_SQL, decorBindValues(decor))
    }
  })
}

export function listMesasLayout(db: PopLocalDatabase): MesasLayoutData {
  return layoutFromRows(
    db.all("SELECT * FROM mesas_salons ORDER BY sort_order ASC, name COLLATE NOCASE ASC")
      .map((row) => sqlSalonRowToSnapshot(row)),
    db.all("SELECT * FROM mesas_tables ORDER BY sort_order ASC, label COLLATE NOCASE ASC")
      .map((row) => sqlTableRowToSnapshot(row)),
    db.all("SELECT * FROM mesas_decors ORDER BY sort_order ASC, id ASC")
      .map((row) => sqlDecorRowToSnapshot(row)),
  )
}

export function patchMesasTablePosition(
  db: PopLocalDatabase,
  tableId: string,
  patch: { x?: number; y?: number; rotation?: number },
) {
  const current = db.get("SELECT * FROM mesas_tables WHERE id = ?", [tableId])
  if (!current) return
  const next: MesasTableRow = {
    ...sqlTableRowToSnapshot(current),
    ...(patch.x != null ? { x: patch.x } : {}),
    ...(patch.y != null ? { y: patch.y } : {}),
    ...(patch.rotation != null ? { rotation: patch.rotation } : {}),
  }
  db.run(UPSERT_TABLE_SQL, tableBindValues(next))
}

export function patchMesasDecorPosition(
  db: PopLocalDatabase,
  decorId: string,
  patch: { x?: number; y?: number; rotation?: number },
) {
  const current = db.get("SELECT * FROM mesas_decors WHERE id = ?", [decorId])
  if (!current) return
  const next: MesasFloorDecorRow = {
    ...sqlDecorRowToSnapshot(current),
    ...(patch.x != null ? { x: patch.x } : {}),
    ...(patch.y != null ? { y: patch.y } : {}),
    ...(patch.rotation != null ? { rotation: patch.rotation } : {}),
  }
  db.run(UPSERT_DECOR_SQL, decorBindValues(next))
}

export function replaceMesasSessionsSlim(
  db: PopLocalDatabase,
  sessions: MesaSession[],
) {
  db.transaction(() => {
    db.run("DELETE FROM mesas_sessions_slim")
    for (const session of sessions) {
      db.run(UPSERT_SESSION_SQL, sessionSlimBindValues({ ...session, checkout: null }))
    }
  })
}

export function upsertMesasSessionSlim(db: PopLocalDatabase, session: MesaSession) {
  db.run(UPSERT_SESSION_SQL, sessionSlimBindValues({ ...session, checkout: null }))
}

export function deleteMesasSessionSlim(db: PopLocalDatabase, sessionId: string) {
  db.run("DELETE FROM mesas_sessions_slim WHERE id = ?", [sessionId])
}

export function listMesasSessionsSlim(db: PopLocalDatabase): MesaSession[] {
  return db
    .all("SELECT * FROM mesas_sessions_slim ORDER BY opened_at ASC")
    .map((row) => sqlSessionRowToSnapshot(row))
}

export function replaceMesasReservationsSlim(
  db: PopLocalDatabase,
  reservations: MesaReservation[],
) {
  db.transaction(() => {
    db.run("DELETE FROM mesas_reservations_slim")
    for (const reservation of reservations) {
      db.run(UPSERT_RESERVATION_SQL, reservationSlimBindValues(reservation))
    }
  })
}

export function upsertMesasReservationSlim(
  db: PopLocalDatabase,
  reservation: MesaReservation,
) {
  db.run(UPSERT_RESERVATION_SQL, reservationSlimBindValues(reservation))
}

export function listMesasReservationsSlim(db: PopLocalDatabase): MesaReservation[] {
  return db
    .all("SELECT * FROM mesas_reservations_slim ORDER BY arrival_at ASC")
    .map((row) => sqlReservationRowToSnapshot(row))
}

export function replaceMesasReservationSettings(
  db: PopLocalDatabase,
  cache: MesasReservationSettingsCache,
) {
  db.run(
    UPSERT_SETTINGS_SQL,
    settingsBindValues(cache.settings, cache.operationalDayCloseTime),
  )
}

export function patchMesasReservationSettingsLocal(
  db: PopLocalDatabase,
  settings: MesasReservationSettingsCache["settings"],
) {
  const current = listMesasReservationSettings(db)
  replaceMesasReservationSettings(db, {
    ...current,
    settings,
  })
}

export function listMesasReservationSettings(
  db: PopLocalDatabase,
): MesasReservationSettingsCache {
  const row = db.get(
    "SELECT * FROM mesas_reservation_settings WHERE id = ?",
    [MESAS_SETTINGS_ROW_ID],
  )
  return sqlSettingsRowToSnapshot(row, EMPTY_SETTINGS)
}

export function replaceMesasFloorSnapshot(
  db: PopLocalDatabase,
  input: {
    layout: MesasLayoutData
    sessions: MesaSession[]
    reservations: MesaReservation[]
    settings: MesasReservationSettingsCache
  },
) {
  db.transaction(() => {
    db.run("DELETE FROM mesas_salons")
    db.run("DELETE FROM mesas_tables")
    db.run("DELETE FROM mesas_decors")
    db.run("DELETE FROM mesas_sessions_slim")
    db.run("DELETE FROM mesas_reservations_slim")
    for (const salon of input.layout.salons) {
      db.run(UPSERT_SALON_SQL, salonBindValues(salon))
    }
    for (const table of input.layout.tables) {
      db.run(UPSERT_TABLE_SQL, tableBindValues(table))
    }
    for (const decor of input.layout.decors) {
      db.run(UPSERT_DECOR_SQL, decorBindValues(decor))
    }
    for (const session of input.sessions) {
      db.run(UPSERT_SESSION_SQL, sessionSlimBindValues({ ...session, checkout: null }))
    }
    for (const reservation of input.reservations) {
      db.run(UPSERT_RESERVATION_SQL, reservationSlimBindValues(reservation))
    }
    db.run(
      UPSERT_SETTINGS_SQL,
      settingsBindValues(
        input.settings.settings,
        input.settings.operationalDayCloseTime,
      ),
    )
  })
}

