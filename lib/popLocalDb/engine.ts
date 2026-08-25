import type { SqlJsStatic } from "sql.js"
import { applyPopLocalSchema, PopLocalDatabase } from "@/lib/popLocalDb/database"

let enginePromise: Promise<SqlJsStatic> | null = null

export function loadSqlEngine(): Promise<SqlJsStatic> {
  if (!enginePromise) {
    enginePromise = import("sql.js").then((mod) => {
      const initSqlJs = mod.default
      if (typeof window === "undefined") return initSqlJs()
      return initSqlJs({
        locateFile: (file) => `/sql-js/${file}`,
      })
    })
  }
  return enginePromise
}

export async function createPopLocalDatabase(
  bytes?: Uint8Array | null,
): Promise<PopLocalDatabase> {
  const SQL = await loadSqlEngine()
  const db = bytes && bytes.byteLength > 0 ? new SQL.Database(bytes) : new SQL.Database()
  const local = new PopLocalDatabase(db)
  applyPopLocalSchema(local)
  return local
}
