export type AuditEventView = {
  id: string
  occurred_at: string
  expires_at: string
  resource: string
  resource_id: string | null
  action: string
  http_method: string
  path: string
  previous_state: unknown
  new_state: unknown
  requester_user_id: string | null
  approver_user_id: string | null
  requester_name: string | null
  approver_name: string | null
  execution_source: string
  kind: string | null
}

export type AuditFieldChange = {
  key: string
  label: string
  from: string
  to: string
}

export type AuditEventPresentation = {
  activity: string
  resourceLabel: string
  recordTitle: string
  changeSummary: string
  whoLabel: string
  sourceLabel: string
  approvedByLabel: string | null
  fieldChanges: AuditFieldChange[]
}

const ACTION_LABEL: Record<string, string> = {
  create: "Alta",
  update: "Edición",
  delete: "Baja",
}

const SOURCE_LABEL: Record<string, string> = {
  user: "Persona",
  rootsy_ai: "Rootsy IA",
  system: "Sistema",
}

const RESOURCE_LABEL: Record<string, string> = {
  articles: "Artículos",
  "arca-sale-points": "Puntos de venta ARCA",
  categories: "Categorías",
  "cash_registers": "Cajas",
  checks: "Cheques",
  clients: "Clientes",
  "comanda-stations": "Estaciones de comanda",
  "current_accounts": "Cuentas corrientes",
  "expense-categories": "Categorías de gasto",
  expenses: "Gastos",
  hr: "Equipo",
  inventory: "Inventario",
  manufacturing: "Fabricación",
  printers: "Impresoras",
  "price-lists": "Listas de precio",
  promotions: "Promociones",
  "purchase-orders": "Órdenes de compra",
  quotes: "Presupuestos",
  "recipe-categories": "Categorías de receta",
  recipes: "Recetas",
  "service-categories": "Categorías de servicio",
  services: "Servicios",
  settings: "Ajustes",
  suppliers: "Proveedores",
  treasury: "Tesorería",
}

const KIND_LABEL: Record<string, string> = {
  "arca-sale-points.create": "Alta de punto ARCA",
  "arca-sale-points.patch": "Editó un punto ARCA",
  "articles.create": "Alta de artículo",
  "articles.delete": "Eliminó un artículo",
  "articles.patch": "Editó un artículo",
  "cash_registers.create": "Alta de caja",
  "cash_registers.delete": "Eliminó una caja",
  "cash_registers.movement": "Movimiento de caja",
  "cash_registers.patch": "Editó una caja",
  "cash_registers.session.close": "Cerró una caja",
  "cash_registers.session.open": "Abrió una caja",
  "categories.create": "Alta de categoría",
  "categories.delete": "Eliminó una categoría",
  "categories.patch": "Editó una categoría",
  "checks.clear": "Acreditó un cheque",
  "checks.create": "Alta de cheque",
  "checks.deposit": "Depositó un cheque",
  "checks.reject": "Rechazó un cheque",
  "checks.void": "Anuló un cheque",
  "clients.create": "Alta de cliente",
  "clients.delete": "Eliminó un cliente",
  "clients.patch": "Editó un cliente",
  "comanda-stations.create": "Alta de estación de comanda",
  "comanda-stations.delete": "Eliminó una estación de comanda",
  "comanda-stations.patch": "Editó una estación de comanda",
  "current_accounts.apply": "Aplicó un movimiento de cuenta",
  "current_accounts.enrollment": "Enroló una cuenta corriente",
  "current_accounts.settle": "Saldó una cuenta corriente",
  "expense-categories.create": "Alta de categoría de gasto",
  "expense-categories.delete": "Eliminó una categoría de gasto",
  "expense-categories.patch": "Editó una categoría de gasto",
  "expenses.create": "Registró un gasto",
  "expenses.delete": "Eliminó un gasto",
  "expenses.payment": "Registró un pago de gasto",
  "expenses.void": "Anuló un gasto",
  "hr.employee.clock_in": "Fichó entrada",
  "hr.employee.clock_out": "Fichó salida",
  "hr.employee.create": "Alta de persona",
  "hr.employee.franco": "Cargó un franco o falta",
  "hr.employee.franco.delete": "Quitó un franco o falta",
  "hr.employee.left": "Registró una baja del equipo",
  "hr.employee.patch": "Editó a alguien del equipo",
  "hr.employee.returned": "Registró un reingreso",
  "hr.invitation.create": "Invitó al equipo",
  "hr.invitation.renew": "Renovó una invitación",
  "hr.invitation.revoke": "Revocó una invitación",
  "hr.member.deactivate": "Desactivó un acceso",
  "hr.member.delete": "Quitó a alguien del local",
  "hr.member.reactivate": "Reactivó un acceso",
  "hr.member.role": "Cambió un rol",
  "hr.payment.create": "Registró un pago de sueldo",
  "inventory.adjust": "Ajustó stock",
  "inventory.expiry": "Actualizó un vencimiento",
  "inventory.location.archive": "Archivó un depósito",
  "inventory.location.create": "Alta de depósito",
  "inventory.location.rename": "Renombró un depósito",
  "inventory.min_stock": "Cambió el stock mínimo",
  "inventory.movement.delete": "Eliminó un movimiento de stock",
  "inventory.transfer": "Transfirió stock",
  "manufacturing.run": "Registró una fabricación",
  "printers.create": "Alta de impresora",
  "printers.delete": "Eliminó una impresora",
  "printers.patch": "Editó una impresora",
  "price-lists.create": "Alta de lista de precio",
  "price-lists.delete": "Eliminó una lista de precio",
  "price-lists.patch": "Editó una lista de precio",
  "promotions.create": "Alta de promoción",
  "promotions.delete": "Eliminó una promoción",
  "promotions.patch": "Editó una promoción",
  "purchase-orders.create": "Alta de orden de compra",
  "purchase-orders.delete": "Eliminó una orden de compra",
  "quotes.create": "Alta de presupuesto",
  "quotes.delete": "Eliminó un presupuesto",
  "recipe-categories.create": "Alta de categoría de receta",
  "recipe-categories.delete": "Eliminó una categoría de receta",
  "recipe-categories.patch": "Editó una categoría de receta",
  "recipes.create": "Alta de receta",
  "recipes.delete": "Eliminó una receta",
  "recipes.patch": "Editó una receta",
  "service-categories.create": "Alta de categoría de servicio",
  "service-categories.delete": "Eliminó una categoría de servicio",
  "service-categories.patch": "Editó una categoría de servicio",
  "services.create": "Alta de servicio",
  "services.delete": "Eliminó un servicio",
  "services.patch": "Editó un servicio",
  "settings.patch": "Cambió ajustes del local",
  "suppliers.create": "Alta de proveedor",
  "suppliers.delete": "Eliminó un proveedor",
  "suppliers.patch": "Editó un proveedor",
  "treasury.account.active": "Activó o pausó una cuenta",
  "treasury.account.create": "Alta de cuenta",
  "treasury.account.delete": "Eliminó una cuenta",
  "treasury.account.patch": "Editó una cuenta",
  "treasury.child.create": "Alta de subcuenta",
  "treasury.mark.clear": "Quitó una conciliación",
  "treasury.mark.set": "Marcó una conciliación",
  "treasury.pos.acreditation": "Acreditó un POS",
  "treasury.settlement": "Liquidó una cuenta",
  "treasury.statement.add": "Agregó un movimiento de extracto",
  "treasury.statement.delete": "Eliminó un movimiento de extracto",
  "treasury.statement.import": "Importó un extracto",
}

const FIELD_LABEL: Record<string, string> = {
  amount: "Importe",
  auto_apply: "Aplicación automática",
  barcode: "Código de barras",
  brand: "Marca",
  clocked_out_at: "Salida",
  clocked_in_at: "Entrada",
  currency: "Moneda",
  description: "Descripción",
  discount_mode: "Modo de descuento",
  discountMode: "Modo de descuento",
  discount_value: "Descuento",
  discountValue: "Descuento",
  document_number: "Documento",
  due_date: "Vencimiento",
  email: "Email",
  expense_date: "Fecha del gasto",
  first_name: "Nombre",
  fixed_price: "Precio fijo",
  hired_at: "Ingreso",
  image_url: "Imagen",
  imageUrl: "Imagen",
  is_active: "Activo",
  isActive: "Activo",
  isSellable: "Vendible",
  iva: "IVA",
  job_title: "Puesto",
  last_name: "Apellido",
  minStockLevel: "Stock mínimo",
  monthly_salary: "Sueldo",
  name: "Nombre",
  notes: "Notas",
  phone: "Teléfono",
  salePrice: "Precio de venta",
  sku: "SKU",
  slots: "Franjas",
  unitOfMeasure: "Unidad",
  valid_from: "Vigencia desde",
  valid_until: "Vigencia hasta",
}

const DETAIL_SKIP_KEYS = new Set([
  "id",
  "pop_id",
  "created_by",
  "invited_by",
  "role_id",
  "employee_id",
  "category_id",
  "user_id",
  "token",
  "image_url",
  "imageUrl",
  "costs",
  "listPrices",
  "slots",
])

const TABLE_SKIP_KEYS = new Set([
  ...DETAIL_SKIP_KEYS,
  "monthly_salary",
  "name",
  "first_name",
  "last_name",
  "description",
  "email",
  "currency",
])

const MONEY_KEY =
  /price|amount|cost|salary|total|importe/i
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const ISO_RE = /^\d{4}-\d{2}-\d{2}(?:[T\s].+)?$/

const moneyFmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
})

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function fieldLabel(key: string): string {
  return FIELD_LABEL[key] ?? key.replace(/_/g, " ")
}

export function auditActionLabel(action: string): string {
  return ACTION_LABEL[action] ?? action
}

export function auditSourceLabel(source: string): string {
  return SOURCE_LABEL[source] ?? source
}

export function auditResourceLabel(resource: string): string {
  return RESOURCE_LABEL[resource] ?? resource
}

export function auditActivityLabel(
  kind: string | null,
  resource: string,
  action: string,
): string {
  if (kind && KIND_LABEL[kind]) return KIND_LABEL[kind]
  return `${auditActionLabel(action)} · ${auditResourceLabel(resource)}`
}

function formatAuditValue(key: string, value: unknown): string {
  if (value == null || value === "") return "—"
  if (typeof value === "boolean") return value ? "Sí" : "No"
  if (typeof value === "number" && Number.isFinite(value)) {
    return MONEY_KEY.test(key) ? moneyFmt.format(value) : value.toLocaleString("es-AR")
  }
  if (typeof value === "string") {
    if (UUID_RE.test(value)) return "—"
    if (ISO_RE.test(value)) {
      const date = new Date(value)
      if (!Number.isNaN(date.getTime())) {
        const hasTime = value.includes("T") || value.includes(" ")
        return new Intl.DateTimeFormat("es-AR", {
          dateStyle: "short",
          ...(hasTime ? { timeStyle: "short" } : {}),
        }).format(date)
      }
    }
    return value
  }
  if (Array.isArray(value)) {
    return value.length === 0 ? "—" : `${value.length} ítems`
  }
  if (typeof value === "object") return "…"
  return String(value)
}

function collectKeys(
  previous: Record<string, unknown> | null,
  next: Record<string, unknown> | null,
): string[] {
  return [
    ...new Set([
      ...Object.keys(previous ?? {}),
      ...Object.keys(next ?? {}),
    ]),
  ]
}

function fieldChangesFor(
  previous: unknown,
  next: unknown,
  skip: Set<string>,
): AuditFieldChange[] {
  const prev = asRecord(previous)
  const nxt = asRecord(next)
  if (!prev && !nxt) return []
  return collectKeys(prev, nxt)
    .filter((key) => !skip.has(key))
    .map((key) => {
      const from = formatAuditValue(key, prev?.[key])
      const to = formatAuditValue(key, nxt?.[key])
      if (from === to) return null
      if (from === "—" && to === "—") return null
      return { key, label: fieldLabel(key), from, to }
    })
    .filter((row): row is AuditFieldChange => row != null)
}

function recordTitleFromState(state: unknown): string {
  const rec = asRecord(state)
  if (!rec) return ""
  const person = `${str(rec.first_name)} ${str(rec.last_name)}`.trim()
  if (person) return person
  for (const key of ["name", "description", "email", "sku", "job_title", "title"]) {
    const value = str(rec[key])
    if (value) return value
  }
  if (typeof rec.amount === "number") return moneyFmt.format(rec.amount)
  return ""
}

function recordTitle(event: AuditEventView): string {
  return (
    recordTitleFromState(event.new_state) ||
    recordTitleFromState(event.previous_state) ||
    "Sin nombre"
  )
}

function changeSummary(
  event: AuditEventView,
  changes: AuditFieldChange[],
  title: string,
): string {
  if (event.action === "delete") return "Eliminado"
  const visible = changes.filter(
    (row) => !TABLE_SKIP_KEYS.has(row.key) && row.to !== title && row.from !== title,
  )
  if (visible.length === 0) return "—"
  const shown = visible.slice(0, 2).map((row) => {
    if (event.action === "create" || row.from === "—") return `${row.label} ${row.to}`
    if (row.to === "—") return `${row.label} ${row.from} → —`
    return `${row.label} ${row.from} → ${row.to}`
  })
  const extra = visible.length - shown.length
  return extra > 0 ? `${shown.join(" · ")} · +${extra}` : shown.join(" · ")
}

function whoLabel(event: AuditEventView): string {
  if (event.requester_name?.trim()) return event.requester_name.trim()
  if (event.execution_source === "rootsy_ai") return "Rootsy IA"
  if (event.execution_source === "system") return "Sistema"
  return "Alguien del equipo"
}

function approvedByLabel(event: AuditEventView): string | null {
  if (!event.approver_user_id) return null
  if (event.approver_user_id === event.requester_user_id) return null
  return event.approver_name?.trim() || "Alguien del equipo"
}

export function presentAuditEvent(event: AuditEventView): AuditEventPresentation {
  const fieldChanges = fieldChangesFor(
    event.previous_state,
    event.new_state,
    DETAIL_SKIP_KEYS,
  )
  const title = recordTitle(event)
  return {
    activity: auditActivityLabel(event.kind, event.resource, event.action),
    resourceLabel: auditResourceLabel(event.resource),
    recordTitle: title,
    changeSummary: changeSummary(event, fieldChanges, title),
    whoLabel: whoLabel(event),
    sourceLabel: auditSourceLabel(event.execution_source),
    approvedByLabel: approvedByLabel(event),
    fieldChanges,
  }
}

export { ACTION_LABEL as AUDIT_ACTION_FILTER_LABEL }
export { SOURCE_LABEL as AUDIT_SOURCE_FILTER_LABEL }
