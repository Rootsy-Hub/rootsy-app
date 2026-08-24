export type ChatRootsyApiErrorContext = {
  subject?: string
  method?: string
  path?: string
  tool?: string
}

type TableCopy = {
  one: string
  gender: "m" | "f"
  asChild?: string
}

/**
 * Tablas de Postgres → copy de negocio del chat.
 * Si aparece un constraint nuevo, agregá la tabla acá (no un if por FK).
 */
const TABLE_COPY: Record<string, TableCopy> = {
  articles: { one: "artículo", gender: "m" },
  inventory_movements: {
    one: "movimiento de stock",
    gender: "m",
    asChild: "movimientos de stock",
  },
  clients: { one: "cliente", gender: "m" },
  suppliers: { one: "proveedor", gender: "m" },
  recipes: { one: "receta", gender: "f", asChild: "recetas" },
  recipe_ingredients: {
    one: "ingrediente",
    gender: "m",
    asChild: "recetas",
  },
  promotions: { one: "promoción", gender: "f", asChild: "promociones" },
  promotion_items: {
    one: "ítem de promo",
    gender: "m",
    asChild: "promociones",
  },
  services: { one: "servicio", gender: "m" },
  categories: { one: "categoría", gender: "f", asChild: "artículos" },
  article_categories: {
    one: "categoría",
    gender: "f",
    asChild: "artículos",
  },
  recipe_categories: {
    one: "categoría de receta",
    gender: "f",
    asChild: "recetas",
  },
  service_categories: {
    one: "categoría de servicio",
    gender: "f",
    asChild: "servicios",
  },
  price_lists: { one: "lista de precios", gender: "f" },
  article_list_prices: {
    one: "precio de lista",
    gender: "m",
    asChild: "precios en listas",
  },
  employees: { one: "empleado", gender: "m" },
  members: { one: "miembro", gender: "m" },
  user_pop_roles: { one: "miembro", gender: "m", asChild: "miembros" },
  roles: { one: "rol", gender: "m" },
  sales: { one: "venta", gender: "f", asChild: "ventas" },
  sale_items: { one: "ítem de venta", gender: "m", asChild: "ventas" },
  sale_payments: { one: "cobro", gender: "m", asChild: "cobros" },
  purchases: { one: "compra", gender: "f", asChild: "compras" },
  purchase_items: { one: "ítem de compra", gender: "m", asChild: "compras" },
  purchase_payments: { one: "pago", gender: "m", asChild: "pagos" },
  purchase_orders: {
    one: "pedido a proveedor",
    gender: "m",
    asChild: "pedidos a proveedores",
  },
  invoices: { one: "comprobante", gender: "m", asChild: "comprobantes" },
  expenses: { one: "gasto", gender: "m", asChild: "gastos" },
  expense_payments: { one: "pago de gasto", gender: "m", asChild: "gastos" },
  checks: { one: "cheque", gender: "m", asChild: "cheques" },
  quotes: { one: "presupuesto", gender: "m", asChild: "presupuestos" },
  pop_manufacturing_runs: {
    one: "producción",
    gender: "f",
    asChild: "producciones",
  },
  manufacturing_runs: {
    one: "producción",
    gender: "f",
    asChild: "producciones",
  },
  current_account_entries: {
    one: "movimiento de cuenta",
    gender: "m",
    asChild: "movimientos de cuenta corriente",
  },
  current_account_movements: {
    one: "movimiento de cuenta",
    gender: "m",
    asChild: "movimientos de cuenta corriente",
  },
  cash_registers: { one: "caja", gender: "f" },
  printers: { one: "impresora", gender: "f" },
  comanda_stations: { one: "estación de comanda", gender: "f" },
}

const COLUMN_PARENT: Record<string, string> = {
  article_id: "articles",
  output_article_id: "articles",
  client_id: "clients",
  supplier_id: "suppliers",
  recipe_id: "recipes",
  promotion_id: "promotions",
  service_id: "services",
  category_id: "categories",
  recipe_category_id: "recipe_categories",
  service_category_id: "service_categories",
  price_list_id: "price_lists",
  employee_id: "employees",
  member_user_id: "members",
  user_id: "members",
  role_id: "roles",
  sale_id: "sales",
  purchase_id: "purchases",
  invoice_id: "invoices",
  expense_id: "expenses",
  check_id: "checks",
  quote_id: "quotes",
  cash_register_id: "cash_registers",
  printer_id: "printers",
}

const PATH_TABLE: Array<{ pattern: RegExp; table: string }> = [
  { pattern: /\/article-categories\b/i, table: "article_categories" },
  { pattern: /\/recipe-categories\b/i, table: "recipe_categories" },
  { pattern: /\/service-categories\b/i, table: "service_categories" },
  { pattern: /\/price-lists\b/i, table: "price_lists" },
  { pattern: /\/purchase-orders\b/i, table: "purchase_orders" },
  { pattern: /\/cash-registers\b/i, table: "cash_registers" },
  { pattern: /\/comanda-stations\b/i, table: "comanda_stations" },
  { pattern: /\/articles\b/i, table: "articles" },
  { pattern: /\/clients\b/i, table: "clients" },
  { pattern: /\/suppliers\b/i, table: "suppliers" },
  { pattern: /\/recipes\b/i, table: "recipes" },
  { pattern: /\/promotions\b/i, table: "promotions" },
  { pattern: /\/services\b/i, table: "services" },
  { pattern: /\/categories\b/i, table: "categories" },
  { pattern: /\/employees\b/i, table: "employees" },
  { pattern: /\/members\b/i, table: "members" },
  { pattern: /\/roles\b/i, table: "roles" },
  { pattern: /\/invoices\b/i, table: "invoices" },
  { pattern: /\/expenses\b/i, table: "expenses" },
  { pattern: /\/checks\b/i, table: "checks" },
  { pattern: /\/quotes\b/i, table: "quotes" },
  { pattern: /\/printers\b/i, table: "printers" },
]

const SQL_MARK =
  /violates|constraint|relation |sqlstate|postgres|update or delete on table|insert or update on table|duplicate key|null value in column|new row for relation/i

type ParsedPgError = {
  kind: "fk_parent" | "fk_child" | "unique" | "not_null" | "check" | "sql"
  mutatedTable?: string
  otherTable?: string
  constraint?: string
}

function tableCopy(table?: string): TableCopy | undefined {
  if (!table) return undefined
  return TABLE_COPY[table]
}

function ese(copy: TableCopy): string {
  return copy.gender === "f" ? "esa" : "ese"
}

function un(copy: TableCopy): string {
  return copy.gender === "f" ? "una" : "un"
}

function tableFromConstraintName(name: string): string | undefined {
  const parts = name
    .replace(/_(fkey|key|pkey)$/i, "")
    .split("_")
    .filter(Boolean)
  for (let size = parts.length; size >= 1; size -= 1) {
    const candidate = parts.slice(0, size).join("_")
    if (TABLE_COPY[candidate]) return candidate
  }
  return undefined
}

function parseConstraint(name: string): { owner: string; column: string } {
  const base = name.replace(/_fkey$/i, "").replace(/_key$/i, "")
  const column = base.match(/_([a-z0-9]+_id)$/i)?.[1] ?? ""
  const owner = column ? base.slice(0, -(column.length + 1)) : base
  return { owner, column }
}

function parsePostgresError(raw: string): ParsedPgError | null {
  const parentBlocked = raw.match(
    /update or delete on table "([^"]+)" violates foreign key constraint "([^"]+)"(?: on table "([^"]+)")?/i,
  )
  if (parentBlocked) {
    const parsed = parseConstraint(parentBlocked[2] ?? "")
    return {
      kind: "fk_parent",
      mutatedTable: parentBlocked[1],
      otherTable:
        parentBlocked[3] ||
        tableFromConstraintName(parentBlocked[2] ?? "") ||
        parsed.owner,
      constraint: parentBlocked[2],
    }
  }

  const childBlocked = raw.match(
    /insert or update on table "([^"]+)" violates foreign key constraint "([^"]+)"(?: on table "([^"]+)")?/i,
  )
  if (childBlocked) {
    const parsed = parseConstraint(childBlocked[2] ?? "")
    return {
      kind: "fk_child",
      mutatedTable: childBlocked[1],
      otherTable:
        childBlocked[3] || COLUMN_PARENT[parsed.column] || parsed.owner,
      constraint: childBlocked[2],
    }
  }

  const unique = raw.match(
    /duplicate key(?: value)? violates unique constraint "([^"]+)"/i,
  )
  if (unique) {
    return {
      kind: "unique",
      mutatedTable: tableFromConstraintName(unique[1] ?? ""),
      constraint: unique[1],
    }
  }

  const notNull = raw.match(
    /null value in column "[^"]+" of relation "([^"]+)" violates not-null constraint/i,
  )
  if (notNull) {
    return { kind: "not_null", mutatedTable: notNull[1] }
  }

  const check = raw.match(
    /new row (?:for relation )?"([^"]+)" violates check constraint/i,
  )
  if (check) {
    return { kind: "check", mutatedTable: check[1] }
  }

  if (SQL_MARK.test(raw)) return { kind: "sql" }
  return null
}

function tableFromPath(path?: string, tool?: string): string | undefined {
  const source = `${path ?? ""} ${tool ?? ""}`
  for (const row of PATH_TABLE) {
    if (row.pattern.test(source)) return row.table
  }
  return undefined
}

function looksLikeSpanishBusiness(text: string): boolean {
  if (SQL_MARK.test(text)) return false
  return /[áéíóúñü]|escribí|indicá|elegí|falt[ae]|no se |no pude|no tenés|sin permiso|ya existe|no encontr/i.test(
    text,
  )
}

function verbFor(method: string | undefined, fallback: "eliminar" | "guardar") {
  const verb = (method ?? "").toUpperCase()
  if (verb === "DELETE") return "eliminar"
  if (verb === "POST") return "crear"
  if (verb === "PATCH" || verb === "PUT") return "actualizar"
  return fallback
}

function named(verb: string, subject?: string): string {
  return subject ? `No se puede ${verb} ${subject}` : `No se puede ${verb}`
}

function humanizeParsed(
  parsed: ParsedPgError,
  context: ChatRootsyApiErrorContext,
  subject?: string,
): string {
  const pathTable = tableFromPath(context.path, context.tool)
  const parent = tableCopy(parsed.mutatedTable) ?? tableCopy(pathTable)
  const related = tableCopy(parsed.otherTable)
  const verb = verbFor(context.method, parsed.kind === "fk_parent" ? "eliminar" : "guardar")

  if (parsed.kind === "fk_parent") {
    const child = related?.asChild
    if (subject && child) return `${named(verb, subject)}: tiene ${child}.`
    if (subject) {
      return `${named(verb, subject)}: hay otros datos del negocio que lo siguen usando.`
    }
    if (parent && child) {
      return `No se puede ${verb}: ${ese(parent)} ${parent.one} tiene ${child}.`
    }
    if (child) return `No se puede ${verb}: tiene ${child}.`
    if (parent) {
      return `No se puede ${verb}: ${ese(parent)} ${parent.one} sigue en uso en el negocio.`
    }
    return `No se puede ${verb}: hay otros datos del negocio que lo siguen usando.`
  }

  if (parsed.kind === "fk_child") {
    const target = related ?? parent
    if (target) {
      return `Ese dato apunta a ${un(target)} ${target.one} que no existe.`
    }
    return "Falta un dato relacionado para guardar."
  }

  if (parsed.kind === "unique") {
    if (parent) return `Ya existe ${un(parent)} ${parent.one} con esos datos.`
    return "Ese registro ya existe."
  }

  if (parsed.kind === "not_null") {
    return "Falta un dato obligatorio."
  }

  if (parsed.kind === "check") {
    return "Ese cambio no cumple una regla del negocio."
  }

  return "No pude completar esa acción con los datos actuales del negocio."
}

export function humanizeChatRootsyApiError(
  raw: string,
  context: ChatRootsyApiErrorContext = {},
): string {
  const text = raw.replace(/\s+/g, " ").trim()
  if (!text) return "No pude completar esa acción."

  const lower = text.toLowerCase()
  const subject = context.subject?.replace(/\s+/g, " ").trim() || undefined

  if (
    /sin permiso|forbidden|unauthorized|not allowed/.test(lower) ||
    /\b401\b|\b403\b/.test(lower)
  ) {
    return "No tenés permiso para esa acción."
  }

  if (
    /failed to fetch|networkerror|econnreset|etimedout|timeout|aborted|network request failed/.test(
      lower,
    )
  ) {
    return "No pude conectar con el negocio. Probá de nuevo en un rato."
  }

  if (/\b404\b|not found|no encontr/.test(lower) && SQL_MARK.test(text) === false) {
    if (looksLikeSpanishBusiness(text) && /no encontr/.test(lower)) {
      return text.slice(0, 280)
    }
    const resource = tableCopy(tableFromPath(context.path, context.tool))
    if (resource) return `No encontré ${ese(resource)} ${resource.one}.`
    return "No encontré ese registro."
  }

  const parsed = parsePostgresError(text)
  if (parsed) return humanizeParsed(parsed, context, subject)

  if (looksLikeSpanishBusiness(text)) return text.slice(0, 280)

  if (/bad request|invalid|validation/i.test(text)) {
    return "Ese cambio no es válido."
  }

  return text.slice(0, 280)
}
