export const POP_PERMS = {
  SETTINGS_READ: { resource: "settings", action: "read" },
  SETTINGS_UPDATE: { resource: "settings", action: "update" },

  HR_READ: { resource: "hr", action: "read" },
  HR_CREATE: { resource: "hr", action: "create" },
  HR_UPDATE: { resource: "hr", action: "update" },
  HR_DELETE: { resource: "hr", action: "delete" },
  SALE_READ: { resource: "sale", action: "read" },
  SALE_CREATE: { resource: "sale", action: "create" },
  SALE_UPDATE: { resource: "sale", action: "update" },
  ARTICLE_READ: { resource: "articles", action: "read" },
  ARTICLE_CREATE: { resource: "articles", action: "create" },
  ARTICLE_UPDATE: { resource: "articles", action: "update" },
  ARTICLE_DELETE: { resource: "articles", action: "delete" },

  ACCOUNTS_READ: { resource: "accounts", action: "read" },
  ACCOUNTS_CREATE: { resource: "accounts", action: "create" },
  ACCOUNTS_UPDATE: { resource: "accounts", action: "update" },
  ACCOUNTS_DELETE: { resource: "accounts", action: "delete" },

  CLIENT_READ: { resource: "clients", action: "read" },
  CLIENT_CREATE: { resource: "clients", action: "create" },
  CLIENT_UPDATE: { resource: "clients", action: "update" },
  CLIENT_DELETE: { resource: "clients", action: "delete" },

  SUPPLIER_READ: { resource: "suppliers", action: "read" },
  SUPPLIER_CREATE: { resource: "suppliers", action: "create" },
  SUPPLIER_UPDATE: { resource: "suppliers", action: "update" },
  SUPPLIER_DELETE: { resource: "suppliers", action: "delete" },

  INVOICES_READ: { resource: "invoices", action: "read" },
  INVOICES_CREATE: { resource: "invoices", action: "create" },
  INVOICES_UPDATE: { resource: "invoices", action: "update" },
  INVOICES_DELETE: { resource: "invoices", action: "delete" },

  PAYMENT_METHOD_READ: { resource: "payment_methods", action: "read" },
  PAYMENT_METHOD_CREATE: { resource: "payment_methods", action: "create" },
  PAYMENT_METHOD_UPDATE: { resource: "payment_methods", action: "update" },
  PAYMENT_METHOD_DELETE: { resource: "payment_methods", action: "delete" },

  PRINTER_READ: { resource: "printers", action: "read" },
  PRINTER_CREATE: { resource: "printers", action: "create" },
  PRINTER_UPDATE: { resource: "printers", action: "update" },
  PRINTER_DELETE: { resource: "printers", action: "delete" },

  CASH_REGISTER_READ: { resource: "cash_registers", action: "read" },
  CASH_REGISTER_CREATE: { resource: "cash_registers", action: "create" },
  CASH_REGISTER_UPDATE: { resource: "cash_registers", action: "update" },
  CASH_REGISTER_DELETE: { resource: "cash_registers", action: "delete" },

  INVENTORY_READ: { resource: "inventory", action: "read" },
  INVENTORY_CREATE: { resource: "inventory", action: "create" },
  INVENTORY_UPDATE: { resource: "inventory", action: "update" },
  INVENTORY_DELETE: { resource: "inventory", action: "delete" },

  OPERATIONS_READ: { resource: "operations", action: "read" },
  OPERATIONS_CREATE: { resource: "operations", action: "create" },
  OPERATIONS_UPDATE: { resource: "operations", action: "update" },
  OPERATIONS_DELETE: { resource: "operations", action: "delete" },

  EXPENSES_READ: { resource: "expenses", action: "read" },
  EXPENSES_CREATE: { resource: "expenses", action: "create" },
  EXPENSES_UPDATE: { resource: "expenses", action: "update" },
  EXPENSES_DELETE: { resource: "expenses", action: "delete" },

  MESAS_READ: { resource: "mesas", action: "read" },
  MESAS_CREATE: { resource: "mesas", action: "create" },
  MESAS_UPDATE: { resource: "mesas", action: "update" },
  MESAS_DELETE: { resource: "mesas", action: "delete" },

  MOSTRADOR_READ: { resource: "mostrador", action: "read" },
  MOSTRADOR_CREATE: { resource: "mostrador", action: "create" },
  MOSTRADOR_UPDATE: { resource: "mostrador", action: "update" },
  MOSTRADOR_DELETE: { resource: "mostrador", action: "delete" },

  RECIPE_READ: { resource: "recipes", action: "read" },
  RECIPE_CREATE: { resource: "recipes", action: "create" },
  RECIPE_UPDATE: { resource: "recipes", action: "update" },
  RECIPE_DELETE: { resource: "recipes", action: "delete" },

  SERVICE_READ: { resource: "services", action: "read" },
  SERVICE_CREATE: { resource: "services", action: "create" },
  SERVICE_UPDATE: { resource: "services", action: "update" },
  SERVICE_DELETE: { resource: "services", action: "delete" },

  SERVICE_CHARGE_READ: { resource: "service_charges", action: "read" },
  SERVICE_CHARGE_CREATE: { resource: "service_charges", action: "create" },
  SERVICE_CHARGE_UPDATE: { resource: "service_charges", action: "update" },
  SERVICE_CHARGE_DELETE: { resource: "service_charges", action: "delete" },

  PROMOTION_READ: { resource: "promotions", action: "read" },
  PROMOTION_CREATE: { resource: "promotions", action: "create" },
  PROMOTION_UPDATE: { resource: "promotions", action: "update" },
  PROMOTION_DELETE: { resource: "promotions", action: "delete" },

  CHECK_READ: { resource: "checks", action: "read" },
  CHECK_CREATE: { resource: "checks", action: "create" },
  CHECK_UPDATE: { resource: "checks", action: "update" },
  CHECK_DELETE: { resource: "checks", action: "delete" },

  CURRENT_ACCOUNT_READ: { resource: "current_accounts", action: "read" },
  CURRENT_ACCOUNT_CREATE: { resource: "current_accounts", action: "create" },
  CURRENT_ACCOUNT_UPDATE: { resource: "current_accounts", action: "update" },
  CURRENT_ACCOUNT_DELETE: { resource: "current_accounts", action: "delete" },

  REPORTS_READ: { resource: "reports", action: "read" },
  STATISTICS_READ: { resource: "statistics", action: "read" },
  ALERTS_READ: { resource: "alerts", action: "read" },
  CHAT_READ: { resource: "chat", action: "read" },
  CHAT_CREATE: { resource: "chat", action: "create" },
  CHAT_UPDATE: { resource: "chat", action: "update" },
  CHAT_DELETE: { resource: "chat", action: "delete" },
  MANUFACTURING_READ: { resource: "manufacturing", action: "read" },
  MANUFACTURING_CREATE: { resource: "manufacturing", action: "create" },
  QUOTES_READ: { resource: "quotes", action: "read" },
  QUOTES_CREATE: { resource: "quotes", action: "create" },
  QUOTES_DELETE: { resource: "quotes", action: "delete" },
  PURCHASES_READ: { resource: "purchases", action: "read" },
  PURCHASES_CREATE: { resource: "purchases", action: "create" },
  PURCHASE_ORDERS_READ: { resource: "purchase_orders", action: "read" },
  PURCHASE_ORDERS_CREATE: { resource: "purchase_orders", action: "create" },
  PURCHASE_ORDERS_DELETE: { resource: "purchase_orders", action: "delete" },

  AUDIT_READ: { resource: "audit", action: "read" },
} as const

export function permissionKeysInclude(
  keys: readonly string[],
  resource: string,
  action: string,
): boolean {
  return keys.includes(`${resource}:${action}`)
}

export function permissionRowToKey(row: unknown): string | null {
  if (row == null) return null
  if (typeof row === "string") {
    const t = row.trim()
    return t.includes(":") ? t : null
  }
  if (Array.isArray(row) && row.length >= 2) {
    const a = row[0]
    const b = row[1]
    if (typeof a === "string" && typeof b === "string") return `${a}:${b}`
  }
  if (typeof row === "object") {
    const o = row as Record<string, unknown>
    const r = o.resource ?? o.Resource
    const act = o.action ?? o.Action
    if (typeof r === "string" && typeof act === "string") return `${r}:${act}`
  }
  return null
}

export function permissionRowsToKeys(data: unknown): string[] {
  if (!Array.isArray(data)) return []
  const out: string[] = []
  for (const row of data) {
    const k = permissionRowToKey(row)
    if (k) out.push(k)
  }
  return out
}
