import type { ChatRootsyToolItem } from "@/app/[siteId]/[popId]/chat/chatTypes"
import {
  getChatRootsyApiEndpoint,
  matchChatRootsyApiPath,
  normalizeChatRootsyApiMethod,
  type ChatRootsyApiEndpoint,
  type ChatRootsyApiMethod,
} from "@/lib/chat/apiDocumentacion"
import type { ChatRootsyToolFilters } from "@/lib/chat/tools/chatRootsyToolTypes"
import { CHAT_ROOTSY_PLANNER_COLLECTION_KEYS } from "@/lib/chat/plannerDomainCards"

export const CHAT_ROOTSY_PAGINATION_MAX = 50

const PAGINATION_SIZE_KEYS = new Set([
  "pageSize",
  "page_size",
  "limit",
  "perPage",
  "per_page",
  "take",
])

const API_PAYLOAD_MAX_CHARS = 40_000
const PLANNER_BODY_MAX_CHARS = 20_000
const PLANNER_BODY_MAX_DEPTH = 6
const PLANNER_BODY_MAX_KEYS = 40
const PLANNER_BODY_MAX_ITEMS = 50
const PLANNER_BODY_MAX_STRING = 2_000

export function isChatRootsyPaginationSizeKey(name: string): boolean {
  return PAGINATION_SIZE_KEYS.has(name)
}

export function capChatRootsyPaginationFilters(
  filters: ChatRootsyToolFilters,
): ChatRootsyToolFilters {
  const next: ChatRootsyToolFilters = { ...filters }
  for (const key of Object.keys(next)) {
    if (!PAGINATION_SIZE_KEYS.has(key)) continue
    const raw = next[key]
    const numberValue = typeof raw === "number" ? raw : Number(raw)
    if (!Number.isFinite(numberValue)) {
      delete next[key]
      continue
    }
    next[key] = Math.min(
      CHAT_ROOTSY_PAGINATION_MAX,
      Math.max(1, Math.floor(numberValue)),
    )
  }
  return next
}

function sanitizePlannerJsonValue(value: unknown, depth = 0): unknown {
  if (depth > PLANNER_BODY_MAX_DEPTH) return undefined
  if (value == null) return null
  if (typeof value === "string") return value.slice(0, PLANNER_BODY_MAX_STRING)
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined
  if (typeof value === "boolean") return value
  if (Array.isArray(value)) {
    return value
      .slice(0, PLANNER_BODY_MAX_ITEMS)
      .map((item) => sanitizePlannerJsonValue(item, depth + 1))
      .filter((item) => item !== undefined)
  }
  if (typeof value !== "object") return undefined
  const next: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(value as Record<string, unknown>).slice(
    0,
    PLANNER_BODY_MAX_KEYS,
  )) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue
    const sanitized = sanitizePlannerJsonValue(item, depth + 1)
    if (sanitized !== undefined) next[key] = sanitized
  }
  return next
}

export function readChatRootsyPlannerBody(
  raw: unknown,
): Record<string, unknown> | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined
  const sanitized = sanitizePlannerJsonValue(raw)
  if (!sanitized || typeof sanitized !== "object" || Array.isArray(sanitized)) {
    return undefined
  }
  try {
    const text = JSON.stringify(sanitized)
    if (!text || text === "{}" || text.length > PLANNER_BODY_MAX_CHARS) {
      return undefined
    }
    return sanitized as Record<string, unknown>
  } catch {
    return undefined
  }
}

export function chatRootsyApiActionTitle(
  method: string,
  path: string,
): string {
  const short = path.replace(/^\/v1\/pops\/:popId\/?/, "") || "negocio"
  return `${method} ${short}`
}

export function readChatRootsyPlannerFilters(raw: unknown): ChatRootsyToolFilters {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {}
  const safe: ChatRootsyToolFilters = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      const name = key.startsWith(":") ? key.slice(1) : key
      if (name) safe[name] = value
    }
  }
  return capChatRootsyPaginationFilters(safe)
}

export function chatRootsyApiQueryTitle(id: string): string {
  const endpoint = getChatRootsyApiEndpoint(id)
  if (!endpoint) return "Consulta"
  const first = endpoint.solves.split(/[.!]/)[0]?.trim() || endpoint.solves
  return first.length > 72 ? `${first.slice(0, 69)}…` : first
}

export function chatRootsyApiPeriodHint(
  filters?: ChatRootsyToolFilters,
): string | undefined {
  const from =
    typeof filters?.from === "string"
      ? filters.from
      : typeof filters?.dateFrom === "string"
        ? filters.dateFrom
        : null
  const to =
    typeof filters?.to === "string"
      ? filters.to
      : typeof filters?.dateTo === "string"
        ? filters.dateTo
        : null
  if (from && to) return `${from} – ${to}`
  if (from) return from
  if (to) return to
  return undefined
}

export function buildChatRootsyApiCall(
  popId: string,
  endpoint: ChatRootsyApiEndpoint,
  filters: ChatRootsyToolFilters,
  body?: Record<string, unknown>,
):
  | { ok: true; method: ChatRootsyApiMethod; path: string; body?: unknown }
  | { ok: false; error: string } {
  const used = new Set<string>()
  let missing = ""
  const path = endpoint.path.replace(/:([A-Za-z][A-Za-z0-9]*)/g, (_, key: string) => {
    if (key === "popId") return encodeURIComponent(popId)
    const value = filters[key] ?? filters[`:${key}`]
    if (value === undefined || value === "") {
      missing = key
      return `:${key}`
    }
    used.add(key)
    return encodeURIComponent(String(value))
  })
  if (missing) {
    return { ok: false, error: "Faltan datos para esa consulta." }
  }

  const leftover: ChatRootsyToolFilters = {}
  for (const [key, value] of Object.entries(filters)) {
    const name = key.startsWith(":") ? key.slice(1) : key
    if (!name || used.has(name) || used.has(key)) continue
    leftover[name] = value
  }

  const method = endpoint.method
  const queryFilters =
    method === "GET" || method === "DELETE"
      ? capChatRootsyPaginationFilters(leftover)
      : {}
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(queryFilters)) {
    qs.set(key, String(value))
  }
  const query = qs.toString()
  const requestPath = query ? `${path}?${query}` : path

  if (method === "GET") {
    return { ok: true, method, path: requestPath }
  }

  const merged: Record<string, unknown> = {}
  if (method === "POST" || method === "PATCH" || method === "PUT") {
    for (const [key, value] of Object.entries(leftover)) {
      merged[key] = value
    }
  }
  if (body) Object.assign(merged, body)
  return Object.keys(merged).length
    ? { ok: true, method, path: requestPath, body: merged }
    : { ok: true, method, path: requestPath }
}

export function buildChatRootsyApiRequestPath(
  popId: string,
  endpoint: ChatRootsyApiEndpoint,
  filters: ChatRootsyToolFilters,
): { ok: true; path: string } | { ok: false; error: string } {
  const built = buildChatRootsyApiCall(popId, endpoint, filters)
  if (!built.ok) return built
  return { ok: true, path: built.path }
}

export function formatChatRootsyPlannerRequest(
  endpoint: ChatRootsyApiEndpoint,
  filters: ChatRootsyToolFilters,
  body?: Record<string, unknown>,
): string {
  const built = buildChatRootsyApiCall("__POP__", endpoint, filters, body)
  if (!built.ok) return `${endpoint.method} ${endpoint.path}`
  return `${endpoint.method} ${built.path.replace("/pops/__POP__/", "/pops/:popId/")}`
}

export function readChatRootsyPathQuery(path: string): ChatRootsyToolFilters {
  const query = path.split("?")[1]
  if (!query) return {}
  const filters: ChatRootsyToolFilters = {}
  for (const [key, value] of new URLSearchParams(query).entries()) {
    if (!key) continue
    if (value === "true") filters[key] = true
    else if (value === "false") filters[key] = false
    else if (value !== "" && Number.isFinite(Number(value))) filters[key] = Number(value)
    else filters[key] = value
  }
  return filters
}

export function resolveChatRootsyPlannerRequest(input: {
  id?: string
  path?: string
  method?: unknown
}):
  | { ok: true; endpoint: ChatRootsyApiEndpoint; pathParams: ChatRootsyToolFilters }
  | { ok: false } {
  const method = normalizeChatRootsyApiMethod(input.method)
  if (input.path) {
    const matched = matchChatRootsyApiPath(input.path, method ?? "GET")
    if (matched) {
      return {
        ok: true,
        endpoint: matched.endpoint,
        pathParams: matched.pathParams,
      }
    }
  }
  if (input.id && (!method || method === "GET")) {
    const endpoint = getChatRootsyApiEndpoint(input.id)
    if (endpoint) return { ok: true, endpoint, pathParams: {} }
  }
  return { ok: false }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function unwrapApiPayload(data: unknown): unknown {
  const root = asRecord(data)
  if (!root) return data
  if ("data" in root && root.data !== undefined) return root.data
  return data
}

function numberish(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

function personName(row: Record<string, unknown>): string | null {
  const first =
    typeof row.firstName === "string" ? row.firstName.trim() : ""
  const last = typeof row.lastName === "string" ? row.lastName.trim() : ""
  const joined = [first, last].filter(Boolean).join(" ").trim()
  return joined || null
}

function rowName(row: Record<string, unknown>, index: number): string {
  const person = personName(row)
  if (person) {
    if (row.isActive === false) return `${person} · inactivo`
    return person
  }
  for (const key of [
    "name",
    "displayName",
    "accountName",
    "label",
    "kind",
    "title",
    "partyName",
    "code",
    "accountCode",
    "key",
  ]) {
    const value = row[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }
  return `Fila ${index + 1}`
}

function rowRecordId(row: Record<string, unknown>): string | null {
  for (const key of [
    "id",
    "userId",
    "memberUserId",
    "articleId",
    "accountId",
    "partyId",
    "employeeId",
    "roleId",
  ]) {
    const value = row[key]
    if (value == null) continue
    const id = String(value).trim()
    if (id) return id
  }
  return null
}

function compactDomainRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  const id = rowRecordId(row)
  if (id) out.id = id
  if (row.userId != null) out.userId = String(row.userId)
  const name = personName(row) || (typeof row.name === "string" ? row.name.trim() : "")
  if (name) out.name = name
  if (typeof row.firstName === "string") out.firstName = row.firstName
  if (typeof row.lastName === "string") out.lastName = row.lastName
  if (typeof row.displayName === "string") out.displayName = row.displayName
  if (row.roleId != null) out.roleId = String(row.roleId)
  if (typeof row.roleDisplayName === "string") out.roleDisplayName = row.roleDisplayName
  if (typeof row.roleName === "string") out.roleName = row.roleName
  if (typeof row.isActive === "boolean") out.isActive = row.isActive
  if (row.salePrice != null) out.salePrice = row.salePrice
  if (row.iva != null) out.iva = row.iva
  if (row.stockOnHand != null) out.stockOnHand = row.stockOnHand
  if (row.categoryId != null) out.categoryId = row.categoryId
  if (row.leftAt != null) out.leftAt = row.leftAt
  return out
}

function compactDomainCollections(data: unknown): Record<string, unknown> | null {
  const inner = unwrapApiPayload(data)
  const record = asRecord(inner)
  if (!record) return null
  const out: Record<string, unknown> = {}
  for (const key of CHAT_ROOTSY_PLANNER_COLLECTION_KEYS) {
    const value = record[key]
    if (!Array.isArray(value) || value.length === 0) continue
    out[key] = value.slice(0, CHAT_ROOTSY_PAGINATION_MAX).map((row) => {
      const item = asRecord(row)
      return item ? compactDomainRow(item) : row
    })
  }
  return Object.keys(out).length ? out : null
}

function arrayToItems(rows: unknown[]): ChatRootsyToolItem[] {
  return rows.slice(0, CHAT_ROOTSY_PAGINATION_MAX).map((row, index) => {
    const record = asRecord(row) ?? {}
    const item: ChatRootsyToolItem = {
      rank: index + 1,
      name: rowName(record, index),
    }
    const id = rowRecordId(record)
    if (id != null) item.id = id
    const sales = numberish(
      record.sales ?? record.salePrice ?? record.total ?? record.amount,
    )
    if (sales != null) item.sales = sales
    const balance = numberish(
      record.balance ?? record.closingBalance ?? record.total,
    )
    if (balance != null) item.balance = balance
    const overdue = numberish(record.overdueAmount ?? record.overdue)
    if (overdue != null) item.overdueAmount = overdue
    const profit = numberish(record.profit)
    if (profit != null) item.profit = profit
    const margin = numberish(record.marginPercent ?? record.margin)
    if (margin != null) item.marginPercent = margin
    const share = numberish(record.sharePercent ?? record.share)
    if (share != null) item.sharePercent = share
    return item
  })
}

type PeriodProductRow = {
  id: string
  name: string
  sales: number
  cost: number
  profit: number
  marginPercent: number
  quantity: number
}

function totalsFromTrendEntry(points: unknown): {
  sales: number
  profit: number
  quantity: number
} {
  if (Array.isArray(points)) {
    let sales = 0
    let profit = 0
    let quantity = 0
    for (const point of points) {
      const row = asRecord(point)
      if (!row) continue
      sales += numberish(row.value ?? row.sales) ?? 0
      profit += numberish(row.profit) ?? 0
      quantity += numberish(row.count ?? row.quantity) ?? 0
    }
    return { sales, profit, quantity }
  }
  const row = asRecord(points)
  if (!row) return { sales: 0, profit: 0, quantity: 0 }
  return {
    sales: numberish(row.sales ?? row.value) ?? 0,
    profit: numberish(row.profit) ?? 0,
    quantity: numberish(row.quantity ?? row.count) ?? 0,
  }
}

export function periodProductsFromStatistics(
  data: unknown,
): PeriodProductRow[] | null {
  const inner = unwrapApiPayload(data)
  const record = asRecord(inner)
  if (!record) return null
  if (Array.isArray(record.products) && record.productCount != null) {
    const rows = record.products
      .map((row) => asRecord(row))
      .filter((row): row is Record<string, unknown> => Boolean(row))
      .map((row) => {
        const sales = numberish(row.sales) ?? 0
        const profit = numberish(row.profit) ?? 0
        return {
          id: String(row.id ?? ""),
          name: typeof row.name === "string" ? row.name : String(row.id ?? ""),
          sales,
          cost: numberish(row.cost) ?? sales - profit,
          profit,
          marginPercent: numberish(row.marginPercent) ?? 0,
          quantity: numberish(row.quantity) ?? 0,
        }
      })
    return rows.length ? rows : null
  }
  const options = Array.isArray(record.productTrendOptions)
    ? record.productTrendOptions
    : null
  const byKey = asRecord(record.productTrendByKey)
  if (!options && !byKey) return null

  const labels = new Map<string, string>()
  for (const option of options ?? []) {
    const row = asRecord(option)
    if (!row) continue
    const key = String(row.key ?? row.id ?? "")
    const label =
      typeof row.label === "string"
        ? row.label
        : typeof row.name === "string"
          ? row.name
          : ""
    if (key) labels.set(key, label)
  }

  const keys = new Set<string>([
    ...labels.keys(),
    ...(byKey ? Object.keys(byKey) : []),
  ])
  const products: PeriodProductRow[] = []
  for (const key of keys) {
    const totals = totalsFromTrendEntry(byKey?.[key])
    const cost = totals.sales - totals.profit
    products.push({
      id: key,
      name: labels.get(key) || key,
      sales: totals.sales,
      cost,
      profit: totals.profit,
      marginPercent:
        totals.sales > 0
          ? Math.round((totals.profit / totals.sales) * 1000) / 10
          : 0,
      quantity: totals.quantity,
    })
  }
  products.sort((a, b) => b.sales - a.sales)
  return products
}

function productsToItems(products: PeriodProductRow[]): ChatRootsyToolItem[] {
  return products.slice(0, CHAT_ROOTSY_PAGINATION_MAX).map((row, index) => ({
    rank: index + 1,
    id: row.id,
    name: row.name,
    sales: row.sales,
    cost: row.cost,
    profit: row.profit,
    marginPercent: row.marginPercent,
  }))
}

export function itemsFromChatRootsyApiPayload(data: unknown): ChatRootsyToolItem[] {
  const products = periodProductsFromStatistics(data)
  if (products?.length) return productsToItems(products)
  const inner = unwrapApiPayload(data)
  if (Array.isArray(inner)) return arrayToItems(inner)
  const record = asRecord(inner)
  if (!record) return []
  for (const key of CHAT_ROOTSY_PLANNER_COLLECTION_KEYS) {
    const value = record[key]
    if (Array.isArray(value) && value.length > 0) return arrayToItems(value)
  }
  const name = rowName(record, 0)
  const amount = numberish(
    record.total ?? record.closingBalance ?? record.balance ?? record.count,
  )
  if (amount == null && name === "Fila 1") return []
  const item: ChatRootsyToolItem = { rank: 1, name }
  if (amount != null) {
    item.sales = amount
    item.balance = numberish(record.closingBalance ?? record.balance) ?? amount
  }
  return [item]
}

export function compactChatRootsyApiPayload(data: unknown): unknown {
  try {
    const products = periodProductsFromStatistics(data)
    if (products?.length) {
      return { products, productCount: products.length }
    }
    const collections = compactDomainCollections(data)
    const isPeopleHub = Boolean(
      collections &&
        (collections.members || collections.employees || collections.roles),
    )
    if (isPeopleHub && collections) return collections
    const text = JSON.stringify(data)
    if (!text) return data
    if (text.length <= API_PAYLOAD_MAX_CHARS) return JSON.parse(text) as unknown
    if (collections) return collections
    return { truncated: true, preview: text.slice(0, API_PAYLOAD_MAX_CHARS) }
  } catch {
    return { preview: String(data).slice(0, 500) }
  }
}
