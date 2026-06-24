#!/usr/bin/env node
/**
 * Aplica migraciones pendientes en supabase/migrations vía Postgres directo.
 * Requiere SUPABASE_DB_PASSWORD (Supabase → Project Settings → Database).
 *
 * Uso:
 *   SUPABASE_DB_PASSWORD='...' node scripts/apply-pending-migrations.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import pg from "pg"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const migrationsDir = path.join(root, "supabase/migrations")

const PENDING = [
  "20260623160000_payment_methods_usage.sql",
  "20260623170000_treasury_card_settlements.sql",
  "20260623180000_bank_reconciliation.sql",
]

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
    "Falta SUPABASE_DB_PASSWORD. Agregala en .env.local o exportala al ejecutar.",
  )
  process.exit(1)
}

const ref = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
if (!ref) {
  console.error("URL de Supabase inválida:", url)
  process.exit(1)
}

const client = new pg.Client({
  host: "aws-0-us-west-2.pooler.supabase.com",
  port: 6543,
  database: "postgres",
  user: `postgres.${ref}`,
  password,
  ssl: { rejectUnauthorized: false },
})

await client.connect()
try {
  for (const file of PENDING) {
    const sqlPath = path.join(migrationsDir, file)
    if (!fs.existsSync(sqlPath)) {
      console.error("No se encontró:", file)
      process.exit(1)
    }
    const sql = fs.readFileSync(sqlPath, "utf8")
    console.log("Aplicando:", file)
    await client.query(sql)
  }

  const { rows: usageCol } = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payment_methods' AND column_name = 'usage'
  `)
  const { rows: settleTbl } = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'treasury_settlements'
  `)
  console.log(
    "Verificación:",
    usageCol.length ? "payment_methods.usage OK" : "FALTA usage",
    settleTbl.length ? "treasury_settlements OK" : "FALTA treasury_settlements",
  )
} finally {
  await client.end()
}

console.log("Migraciones aplicadas.")
