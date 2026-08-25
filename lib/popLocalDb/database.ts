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

export function applyPopLocalSchema(db: PopLocalDatabase) {
  db.exec(POP_LOCAL_SCHEMA_SQL)
  const current = Number(db.getMeta("schema_version") ?? 0)
  if (current !== 0 && current !== POP_LOCAL_SCHEMA_VERSION) {
    db.exec(POP_LOCAL_DROP_SQL)
    db.exec(POP_LOCAL_SCHEMA_SQL)
  }
  db.setMeta("schema_version", String(POP_LOCAL_SCHEMA_VERSION))
}
