import type { Database as SqlJsDatabase, SqlValue } from "sql.js"
import {
  POP_LOCAL_DROP_SQL,
  POP_LOCAL_SCHEMA_SQL,
  POP_LOCAL_SCHEMA_VERSION,
} from "@/lib/popLocalDb/schema"

export type SqlParams = SqlValue[]

export class PopLocalDatabase {
  constructor(private readonly db: SqlJsDatabase) {}

  exec(sql: string) {
    this.db.exec(sql)
  }

  run(sql: string, params: SqlParams = []) {
    this.db.run(sql, params)
  }

  get<T extends object>(sql: string, params: SqlParams = []): T | undefined {
    const stmt = this.db.prepare(sql)
    try {
      stmt.bind(params)
      if (!stmt.step()) return undefined
      return stmt.getAsObject() as T
    } finally {
      stmt.free()
    }
  }

  all<T extends object>(sql: string, params: SqlParams = []): T[] {
    const stmt = this.db.prepare(sql)
    try {
      stmt.bind(params)
      const rows: T[] = []
      while (stmt.step()) rows.push(stmt.getAsObject() as T)
      return rows
    } finally {
      stmt.free()
    }
  }

  transaction(fn: () => void) {
    this.exec("BEGIN")
    try {
      fn()
      this.exec("COMMIT")
    } catch (error) {
      this.exec("ROLLBACK")
      throw error
    }
  }

  export(): Uint8Array {
    return this.db.export()
  }

  getMeta(key: string): string | null {
    const row = this.get<{ value: string }>(
      "SELECT value FROM meta WHERE key = ?",
      [key],
    )
    return row?.value ?? null
  }

  setMeta(key: string, value: string) {
    this.run("INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)", [
      key,
      value,
    ])
  }
}

function tableHasColumn(
  db: PopLocalDatabase,
  table: string,
  column: string,
): boolean {
  return db
    .all<{ name: string }>(`PRAGMA table_info(${table})`)
    .some((row) => row.name === column)
}

function migratePopLocalSchema(db: PopLocalDatabase, fromVersion: number) {
  if (fromVersion < 4) {
    if (!tableHasColumn(db, "recipes", "station_id")) {
      db.exec("ALTER TABLE recipes ADD COLUMN station_id TEXT")
    }
  }
  if (fromVersion < 8) {
    if (!tableHasColumn(db, "recipes", "output_article_id")) {
      db.exec("ALTER TABLE recipes ADD COLUMN output_article_id TEXT")
    }
    db.exec(`
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  recipe_id TEXT NOT NULL,
  article_id TEXT NOT NULL,
  quantity REAL NOT NULL,
  waste_pct REAL,
  article_default_waste_pct REAL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (recipe_id, article_id)
);
`)
    db.exec(
      "CREATE INDEX IF NOT EXISTS recipe_ingredients_article ON recipe_ingredients (article_id)",
    )
    db.exec(
      "CREATE INDEX IF NOT EXISTS recipes_output_article_id ON recipes (output_article_id)",
    )
  }
}

export function applyPopLocalSchema(db: PopLocalDatabase) {
  db.exec(POP_LOCAL_SCHEMA_SQL)
  const current = Number(db.getMeta("schema_version") ?? 0)
  if (current > POP_LOCAL_SCHEMA_VERSION) {
    db.exec(POP_LOCAL_DROP_SQL)
    db.exec(POP_LOCAL_SCHEMA_SQL)
  } else if (current > 0 && current < POP_LOCAL_SCHEMA_VERSION) {
    migratePopLocalSchema(db, current)
  }
  db.exec("CREATE INDEX IF NOT EXISTS recipes_station_id ON recipes (station_id)")
  db.exec(
    "CREATE INDEX IF NOT EXISTS recipes_output_article_id ON recipes (output_article_id)",
  )
  db.exec(
    "CREATE INDEX IF NOT EXISTS recipe_ingredients_article ON recipe_ingredients (article_id)",
  )
  db.setMeta("schema_version", String(POP_LOCAL_SCHEMA_VERSION))
}
