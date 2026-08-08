#!/usr/bin/env node
/**
 * Aplica la migración de operaciones vía conexión Postgres directa.
 * Requiere SUPABASE_DB_PASSWORD (Settings → Database en el dashboard).
 *
 * Uso:
 *   SUPABASE_DB_PASSWORD='...' node scripts/apply-operations-migration.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import pg from "pg"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")

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

const env = { ...loadEnvLocal(), ...process.env }
const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const password = env.SUPABASE_DB_PASSWORD?.trim()

if (!url) {
  console.error("Falta NEXT_PUBLIC_SUPABASE_URL en .env.local")
  process.exit(1)
}
if (!password) {
  console.error(
    "Falta SUPABASE_DB_PASSWORD. Obtenela en Supabase → Project Settings → Database.",
  )
  process.exit(1)
}

const ref = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
if (!ref) {
  console.error("URL de Supabase inválida:", url)
  process.exit(1)
}

const migrationPath = path.join(
  root,
  "supabase/migrations/20260623140000_operations_mesas_mostrador_rentals_services.sql",
)
const coreMigrationPath = path.resolve(
  root,
  "../Rootsy/rootsy-core/supabase/migrations/20260623140000_operations_mesas_mostrador_rentals_services.sql",
)
const sqlPath = fs.existsSync(migrationPath)
  ? migrationPath
  : fs.existsSync(coreMigrationPath)
    ? coreMigrationPath
    : null

if (!sqlPath) {
  console.error("No se encontró el archivo de migración.")
  process.exit(1)
}

const sql = fs.readFileSync(sqlPath, "utf8")
const client = new pg.Client({
  host: "aws-0-us-west-2.pooler.supabase.com",
  port: 6543,
  database: "postgres",
  user: `postgres.${ref}`,
  password,
  ssl: { rejectUnauthorized: false },
})

console.log("Aplicando migración:", path.basename(sqlPath))
await client.connect()
try {
  await client.query(sql)
  const { rows } = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
        'dining_tables', 'service_types', 'service_categories',
        'rental_assets', 'rentals', 'service_orders'
      )
    ORDER BY table_name
  `)
  console.log("Tablas creadas:", rows.map((r) => r.table_name).join(", "))
} finally {
  await client.end()
}
