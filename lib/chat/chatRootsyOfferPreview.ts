import type { ChatRootsyToolProposal } from "@/lib/chat/tools/chatRootsyToolTypes"
import type { ChatRootsyPlannerResultado } from "@/lib/chat/chatRootsyPlannerStep"
import { formatReportMoneyAr } from "@/lib/reportFormatters"

export type ChatRootsyOfferChange = {
  field: string
  before: string
  after: string
  key?: string
  beforeValue?: number | string | boolean
  afterValue?: number | string | boolean
}

export type ChatRootsyOfferPreview = {
  subject: string
  changes: ChatRootsyOfferChange[]
  previous?: Record<string, unknown>
}

const ID_KEYS = [
  "articleId",
  "recipeId",
  "serviceId",
  "clientId",
  "supplierId",
  "promotionId",
  "employeeId",
  "memberUserId",
  "userId",
  "hrRoleId",
  "printerId",
  "registerId",
  "id",
] as const

const MONEY_FIELDS = new Set([
  "salePrice",
  "defaultPrice",
  "unitPrice",
  "price",
  "amount",
  "cost",
  "costPrice",
])

const FIELD_LABELS: Record<string, string> = {
  salePrice: "Precio",
  defaultPrice: "Precio",
  unitPrice: "Precio",
  price: "Precio",
  amount: "Importe",
  cost: "Costo",
  costPrice: "Costo",
  name: "Nombre",
  isActive: "Estado",
  iva: "IVA",
  description: "Detalle",
  roleId: "Rol",
}

const COLLECTION_KEYS = [
  "data",
  "articles",
  "items",
  "rows",
  "results",
  "clients",
  "suppliers",
  "services",
  "recipes",
  "promotions",
  "members",
  "employees",
  "roles",
] as const

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function rowId(row: Record<string, unknown>): string | null {
  for (const key of [
    "id",
    "articleId",
    "recipeId",
    "serviceId",
    "clientId",
    "userId",
    "memberUserId",
  ]) {
    const value = row[key]
    if (value == null) continue
    const id = String(value).trim()
    if (id) return id
  }
  return null
}

function collectResultRows(value: unknown, out: Record<string, unknown>[]): void {
  if (Array.isArray(value)) {
    for (const item of value) collectResultRows(item, out)
    return
  }
  const record = asRecord(value)
  if (!record) return
  if (rowId(record) || typeof record.name === "string" || record.salePrice != null) {
    out.push(record)
  }
  for (const key of COLLECTION_KEYS) {
    if (record[key] != null) collectResultRows(record[key], out)
  }
}

export function rowsFromPlannerResultados(
  resultados: ChatRootsyPlannerResultado[] | undefined,
): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = []
  for (const item of resultados ?? []) {
    collectResultRows(item.response, out)
  }
  return out
}

export function readPlannerTargetId(
  proposal: Pick<ChatRootsyToolProposal, "filters" | "path">,
): string | null {
  for (const key of ID_KEYS) {
    const value = proposal.filters?.[key]
    if (value == null) continue
    const id = String(value).trim()
    if (id) return id
  }
  const path = proposal.path ?? ""
  const match = path.match(
    /\/(?:articles|recipes|services|clients|suppliers|promotions|employees|members|printers|cash-registers)\/([0-9a-f-]{36})(?:\b|$)/i,
  )
  return match?.[1] ?? null
}

function collectRoleLabels(
  resultados: ChatRootsyPlannerResultado[] | undefined,
): Map<string, string> {
  const labels = new Map<string, string>()
  const walk = (value: unknown) => {
    if (Array.isArray(value)) {
      for (const row of value) walk(row)
      return
    }
    const record = asRecord(value)
    if (!record) return
    if (Array.isArray(record.roles)) {
      for (const role of record.roles) {
        const item = asRecord(role)
        if (!item) continue
        const id = String(item.id ?? "").trim()
        const label = String(item.displayName ?? item.name ?? "").trim()
        if (id && label) labels.set(id, label)
      }
    }
    for (const key of COLLECTION_KEYS) {
      if (record[key] != null) walk(record[key])
    }
  }
  for (const item of resultados ?? []) walk(item.response)
  return labels
}

function formatChangeValue(
  field: string,
  value: unknown,
  roleLabels?: Map<string, string>,
): string | null {
  if (value == null) return null
  if (field === "roleId" && typeof value === "string") {
    const id = value.trim()
    return roleLabels?.get(id) ?? null
  }
  if (field === "isActive") {
    if (typeof value === "boolean") return value ? "Activo" : "Inactivo"
    return null
  }
  if (field === "iva") {
    const n = Number(value)
    if (!Number.isFinite(n)) return null
    return `${n.toLocaleString("es-AR", { maximumFractionDigits: 2 })}%`
  }
  if (MONEY_FIELDS.has(field)) {
    const n = Number(value)
    if (!Number.isFinite(n)) return null
    return formatReportMoneyAr(n)
  }
  if (typeof value === "string") {
    const text = value.trim()
    return text || null
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value)
  }
  if (typeof value === "boolean") return value ? "Sí" : "No"
  return null
}

function currentFieldValue(
  row: Record<string, unknown>,
  field: string,
): unknown {
  if (field === "roleId") {
    return row.roleDisplayName ?? row.roleId
  }
  if (row[field] != null) return row[field]
  if (field === "salePrice") return row.sales
  if (field === "defaultPrice") return row.sales ?? row.price
  return undefined
}

function fieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field
}

export function buildChatRootsyOfferPreview(
  proposal: Pick<ChatRootsyToolProposal, "filters" | "path" | "body" | "action" | "method">,
  resultados?: ChatRootsyPlannerResultado[],
): ChatRootsyOfferPreview | undefined {
  const body = proposal.body
  if (!body || typeof body !== "object") return undefined
  const keys = Object.keys(body)
  if (!keys.length) return undefined

  const rows = rowsFromPlannerResultados(resultados)
  const roleLabels = collectRoleLabels(resultados)
  const id = readPlannerTargetId(proposal)
  const current =
    (id ? rows.find((row) => rowId(row) === id) : undefined) ??
    rows.find((row) => {
      const first =
        typeof row.firstName === "string" ? row.firstName.trim() : ""
      const last = typeof row.lastName === "string" ? row.lastName.trim() : ""
      const person = [first, last].filter(Boolean).join(" ").trim()
      const name =
        (typeof row.name === "string" ? row.name.trim() : "") || person
      const action = (proposal.action ?? "").toLowerCase()
      return Boolean(name && action.includes(name.toLowerCase()))
    })

  const changes: ChatRootsyOfferChange[] = []
  const previous: Record<string, unknown> = {}
  for (const key of keys) {
    const after = formatChangeValue(key, body[key], roleLabels)
    if (!after) continue
    const rawBefore = current ? currentFieldValue(current, key) : undefined
    const before = current
      ? formatChangeValue(key, rawBefore, roleLabels) ??
        (typeof rawBefore === "string" ? rawBefore : null)
      : "—"
    if (before === after) continue
    if (rawBefore !== undefined) previous[key] = rawBefore
    const afterValue = compactChangeRaw(body[key])
    const beforeValue = compactChangeRaw(rawBefore)
    changes.push({
      field: fieldLabel(key),
      before: before ?? "—",
      after,
      key,
      ...(beforeValue !== undefined ? { beforeValue } : {}),
      ...(afterValue !== undefined ? { afterValue } : {}),
    })
  }
  if (!changes.length) return undefined

  const person = [current?.firstName, current?.lastName]
    .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
    .join(" ")
    .trim()
  const subject =
    (typeof current?.name === "string" && current.name.trim()) ||
    person ||
    (proposal.action ?? "").replace(/^Actualizar (el |la |los |las )?/i, "").trim() ||
    "Este registro"

  return {
    subject,
    changes,
    ...(Object.keys(previous).length ? { previous } : {}),
  }
}

function compactChangeRaw(
  value: unknown,
): number | string | boolean | undefined {
  if (typeof value === "boolean") return value
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const text = value.trim()
    return text || undefined
  }
  return undefined
}
