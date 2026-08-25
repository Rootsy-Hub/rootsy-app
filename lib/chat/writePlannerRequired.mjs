#!/usr/bin/env node
/**
 * Saca campos obligatorios de los Zod de rootsy-api y escribe
 * plannerRequired.generated.ts para el prompt del Planificador.
 *
 *   node lib/chat/writePlannerRequired.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const apiSrc = join(here, "../../../rootsy-api/src")
const SKIP_KEYS = new Set(["confirmationTyped"])

function read(path) {
  return readFileSync(path, "utf8")
}

function stripNestedBraces(text) {
  let out = ""
  let depth = 0
  for (const ch of text) {
    if (ch === "{") {
      depth += 1
      if (depth === 1) out += "{"
      continue
    }
    if (ch === "}") {
      if (depth === 1) out += "}"
      depth = Math.max(0, depth - 1)
      continue
    }
    if (depth === 0) out += ch
  }
  return out
}

function extractObjectBody(source, startIdx) {
  const open = source.indexOf("{", startIdx)
  if (open < 0) return null
  let depth = 0
  for (let i = open; i < source.length; i += 1) {
    const ch = source[i]
    if (ch === "{") depth += 1
    else if (ch === "}") {
      depth -= 1
      if (depth === 0) return source.slice(open + 1, i)
    }
  }
  return null
}

function parseZodObjectFields(objectBody) {
  const fields = []
  const lines = objectBody.split("\n")
  let topIndent = null
  let current = null
  const flush = () => {
    if (!current) return
    fields.push({ name: current.name, expr: current.expr.join("\n").trim() })
    current = null
  }
  for (const line of lines) {
    const key = line.match(/^(\s*)([A-Za-z][A-Za-z0-9]*)\s*:/)
    if (key) {
      const indent = key[1].length
      if (topIndent == null) topIndent = indent
      if (indent === topIndent) {
        flush()
        current = { name: key[2], expr: [line.slice(key[0].length)] }
        continue
      }
    }
    if (current) current.expr.push(line)
  }
  flush()
  return fields
}

function collectSchemaDefs(source) {
  const defs = new Map()
  const objectRe =
    /(?:export\s+)?const\s+([A-Za-z][A-Za-z0-9]*)\s*=\s*z\.object\s*\(/g
  let match
  while ((match = objectRe.exec(source))) {
    const body = extractObjectBody(source, match.index)
    if (body != null) defs.set(match[1], { kind: "object", body })
  }
  const aliasRe =
    /(?:export\s+)?const\s+([A-Za-z][A-Za-z0-9]*)\s*=\s*([A-Za-z][A-Za-z0-9]*)\s*(?:;|\n(?!\s*\.))/g
  while ((match = aliasRe.exec(source))) {
    if (match[2] === "z" || defs.has(match[1])) continue
    defs.set(match[1], { kind: "alias", ref: match[2] })
  }
  const identRe =
    /(?:export\s+)?const\s+([A-Za-z][A-Za-z0-9]*)\s*=\s*(z[\s\S]*?)(?=\n(?:export\s+)?(?:const|type|function)\s)/g
  while ((match = identRe.exec(source))) {
    if (defs.has(match[1])) continue
    const expr = match[2].trim()
    if (/^z(?:\.|\s)/.test(expr)) defs.set(match[1], { kind: "expr", expr })
  }
  return defs
}

function resolveDef(defs, name, seen = new Set()) {
  if (seen.has(name)) return null
  seen.add(name)
  const def = defs.get(name)
  if (!def) return null
  if (def.kind === "alias") return resolveDef(defs, def.ref, seen)
  return def
}

function exprLooksOptional(expr) {
  const flat = stripNestedBraces(expr)
  return /\.optional\s*\(|\.default\s*\(/.test(flat)
}

function requiredKeys(defs, schemaName) {
  const def = resolveDef(defs, schemaName)
  if (!def) return []
  if (def.kind === "expr") return exprLooksOptional(def.expr) ? [] : []
  if (def.kind !== "object") return []
  const keys = []
  for (const field of parseZodObjectFields(def.body)) {
    if (SKIP_KEYS.has(field.name)) continue
    const trimmed = field.expr.replace(/,\s*$/, "").trim()
    if (/^[A-Za-z][A-Za-z0-9]*$/.test(trimmed)) {
      const ref = resolveDef(defs, trimmed)
      if (ref?.kind === "expr" && exprLooksOptional(ref.expr)) continue
      if (ref?.kind === "object") {
        keys.push(field.name)
        continue
      }
      if (ref?.kind === "expr") {
        keys.push(field.name)
        continue
      }
    }
    if (exprLooksOptional(trimmed)) continue
    keys.push(field.name)
  }
  return keys
}

function mergeDefs(...maps) {
  const out = new Map()
  for (const map of maps) {
    for (const [k, v] of map) out.set(k, v)
  }
  return out
}

function routePrefixes() {
  const app = read(join(apiSrc, "app.ts"))
  const prefixes = new Map()
  const re = /pop\.route\(\s*"([^"]+)"\s*,\s*([A-Za-z][A-Za-z0-9]*)\s*\)/g
  let match
  while ((match = re.exec(app))) {
    prefixes.set(match[2], match[1])
  }
  return prefixes
}

function splitTopLevelCalls(source, routerName) {
  const needle = `${routerName}.`
  const starts = []
  let idx = 0
  while (idx < source.length) {
    const found = source.indexOf(needle, idx)
    if (found < 0) break
    const methodMatch = source
      .slice(found + needle.length)
      .match(/^(get|post|patch|put|delete)\s*\(/)
    if (methodMatch) {
      starts.push({
        at: found,
        method: methodMatch[1].toUpperCase(),
        argsAt: found + needle.length + methodMatch[0].length,
      })
    }
    idx = found + needle.length
  }
  const blocks = []
  for (let i = 0; i < starts.length; i += 1) {
    const end = i + 1 < starts.length ? starts[i + 1].at : source.length
    blocks.push({
      method: starts[i].method,
      text: source.slice(starts[i].argsAt, end),
    })
  }
  return blocks
}

function firstStringArg(text) {
  const match = text.match(/^\s*"([^"]*)"/)
  return match ? match[1] : null
}

function isParamIdSchema(name) {
  return (
    name === "idSchema" ||
    name === "accountIdSchema" ||
    (/IdSchema$/.test(name) && !/(Body|Query)Schema$/.test(name))
  )
}

function firstSchemaName(text) {
  if (/\bparsePatchBody\s*\(/.test(text)) return { patch: true, name: null }
  const names = [...text.matchAll(/\b([A-Za-z][A-Za-z0-9]*Schema)\.safeParse\s*\(/g)].map(
    (m) => m[1],
  )
  const name =
    names.find((row) => /(?:Body|Query)Schema$/.test(row)) ??
    names.find((row) => !isParamIdSchema(row)) ??
    null
  return { patch: false, name }
}

function collectDomainDirs() {
  const domains = join(apiSrc, "domains")
  const dirs = []
  for (const name of readdirSync(domains, { withFileTypes: true })) {
    if (!name.isDirectory()) continue
    const dir = join(domains, name.name)
    const files = readdirSync(dir)
      .filter((file) => file.endsWith(".ts"))
      .map((file) => join(dir, file))
    dirs.push(files)
  }
  return dirs
}

function catalogPath(path) {
  return path
    .replaceAll("/treasury/:accountId", "/treasury/:treasuryAccountId")
    .replaceAll("/cash-registers/:registerId", "/cash-registers/:cashRegisterId")
    .replaceAll("/hr/members/:userId", "/hr/members/:memberUserId")
    .replaceAll("/hr/roles/:roleId", "/hr/roles/:hrRoleId")
    .replaceAll("/price-lists/:listId", "/price-lists/:priceListId")
    .replaceAll("/comanda-stations/:stationId", "/comanda-stations/:comandaStationId")
}

function buildRequiredLines() {
  const prefixes = routePrefixes()
  const lines = []
  const seen = new Set()
  for (const files of collectDomainDirs()) {
    const schemaFiles = files.filter((p) => !p.endsWith("/routes.ts"))
    const file = files.find((p) => p.endsWith("/routes.ts"))
    if (!file) continue
    const source = read(file)
    const localDefs = mergeDefs(
      ...schemaFiles.map((p) => collectSchemaDefs(read(p))),
      collectSchemaDefs(source),
    )
    const routerMatch = source.match(
      /export const ([A-Za-z][A-Za-z0-9]*) = new Hono/,
    )
    if (!routerMatch) continue
    const routerName = routerMatch[1]
    const prefix = prefixes.get(routerName)
    if (!prefix) continue

    for (const block of splitTopLevelCalls(source, routerName)) {
      const rel = firstStringArg(block.text)
      if (rel == null) continue
      const { patch, name } = firstSchemaName(block.text)
      if (patch || !name) continue
      const keys = requiredKeys(localDefs, name)
      if (!keys.length) continue
      const path = catalogPath(
        `${prefix}${rel === "/" ? "" : rel}`.replace(/\/{2,}/g, "/"),
      )
      const line = `${block.method} ${path} ${keys.join(" ")}`
      if (seen.has(line)) continue
      seen.add(line)
      lines.push(line)
    }
  }

  const rank = { GET: 0, POST: 1, PATCH: 2, PUT: 3, DELETE: 4 }
  lines.sort((a, b) => {
    const [ma, pa] = a.split(" ")
    const [mb, pb] = b.split(" ")
    return (rank[ma] ?? 9) - (rank[mb] ?? 9) || pa.localeCompare(pb)
  })
  return lines
}

const lines = buildRequiredLines()
const text = [
  "OBLIGATORIOS",
  "Query o body. Sin estos la API responde 400. Los :id del path ya van. PATCH parcial: ningún campo es obligatorio. confirmationTyped lo pone la app; no lo armes.",
  ...lines,
].join("\n")

const escaped = text.replaceAll("\\", "\\\\").replaceAll("`", "\\`").replaceAll("${", "\\${")
writeFileSync(
  join(here, "plannerRequired.generated.ts"),
  `// Generado desde los Zod de rootsy-api. No editar a mano.\n// node lib/chat/writePlannerRequired.mjs\n\nexport const CHAT_ROOTSY_PLANNER_REQUIRED_TEXT = \`${escaped}\`\n`,
)

console.log(`${lines.length} endpoints con campos obligatorios`)
