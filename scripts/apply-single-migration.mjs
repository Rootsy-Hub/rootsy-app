#!/usr/bin/env node
/**
 * Aplica una migración SQL concreta vía Postgres directo.
 *
 * Uso:
 *   SUPABASE_DB_PASSWORD='...' node scripts/apply-single-migration.mjs 20260727180000_pop_cache_revisions.sql
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import pg from "pg"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const migrationsDir = path.join(root, "supabase/migrations")

function loadEnvLocal() {
  const p = path.join(root, ".env.local")
  if (!fs.existsSync(p)) return {}
  const out = {}
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue
    const i = line.indexOf("=")
    const k = line.slice(0, i).trim()
    let v = line.slice(i + 1).trim()
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1)
    }
    out[k] = v
  }
  return out
}

const file = process.argv[2]
if (!file) {
  console.error("Uso: node scripts/apply-single-migration.mjs <archivo.sql>")
  process.exit(1)
}

const env = { ...loadEnvLocal(), ...process.env }
const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const password = env.SUPABASE_DB_PASSWORD?.trim()

if (!url) {
  console.error("Falta NEXT_PUBLIC_SUPABASE_URL en .env.local")
  process.exit(1)
}
if (!password) {
  console.error(
    "Falta SUPABASE_DB_PASSWORD. Agregala en .env.local (Supabase → Project Settings → Database).",
  )
  process.exit(1)
}

const ref = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
if (!ref) {
  console.error("URL de Supabase inválida:", url)
  process.exit(1)
}

const sqlPath = path.join(migrationsDir, file)
if (!fs.existsSync(sqlPath)) {
  console.error("No se encontró:", sqlPath)
  process.exit(1)
}

const client = new pg.Client({
  host: env.SUPABASE_DB_HOST?.trim() || "aws-0-us-west-2.pooler.supabase.com",
  port: Number(env.SUPABASE_DB_PORT || 6543),
  database: "postgres",
  user: `postgres.${ref}`,
  password,
  ssl: { rejectUnauthorized: false },
})

const sql = fs.readFileSync(sqlPath, "utf8")

await client.connect()
try {
  console.log("Aplicando:", file)
  await client.query(sql)

  const { rows } = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'pop_cache_revisions'
  `)
  const { rows: fnRows } = await client.query(`
    SELECT routine_name FROM information_schema.routines
    WHERE routine_schema = 'public' AND routine_name = 'get_pop_cache_revisions'
  `)
  console.log(
    "Verificación:",
    rows.length ? "pop_cache_revisions OK" : "FALTA tabla",
    fnRows.length ? "get_pop_cache_revisions OK" : "FALTA RPC",
  )
} finally {
  await client.end()
}

console.log("Migración aplicada.")
