export type PopPagePermissionMap = Record<string, string>

export type PopPageDefinition = {
  readonly path: string
  readonly permissions: PopPagePermissionMap
}

/** Execute keys + hermanas `:request_approval` para writes. `read` no tiene hermana. */
function withWriteApproval(permissions: PopPagePermissionMap): PopPagePermissionMap {
  const out: PopPagePermissionMap = { ...permissions }
  for (const [label, key] of Object.entries(permissions)) {
    if (label === "read") continue
    out[`${label}RequestApproval`] = `${key}:request_approval`
  }
  return out
}

export const POP_PAGES = {
  articles: {
    path: "articles",
    permissions: withWriteApproval({
      read: "articles:read",
      create: "articles:create",
      update: "articles:update",
      delete: "articles:delete",
    }),
  },
  "cash-registers": {
    path: "cash-registers",
    permissions: withWriteApproval({
      read: "cash_registers:read",
      create: "cash_registers:create",
      update: "cash_registers:update",
      delete: "cash_registers:delete",
    }),
  },
  clients: {
    path: "clients",
    permissions: withWriteApproval({
      read: "clients:read",
      create: "clients:create",
      update: "clients:update",
      delete: "clients:delete",
    }),
  },
  expenses: {
    path: "expenses",
    permissions: withWriteApproval({
      read: "expenses:read",
      create: "expenses:create",
      update: "expenses:update",
      delete: "expenses:delete",
    }),
  },
  hr: {
    path: "hr",
    permissions: withWriteApproval({
      read: "hr:read",
      create: "hr:create",
      update: "hr:update",
      delete: "hr:delete",
    }),
  },
  inventory: {
    path: "inventory",
    permissions: withWriteApproval({
      read: "inventory:read",
      create: "inventory:create",
      update: "inventory:update",
      delete: "inventory:delete",
    }),
  },
  invoices: {
    path: "invoices",
    permissions: withWriteApproval({
      read: "invoices:read",
      create: "invoices:create",
      update: "invoices:update",
      delete: "invoices:delete",
    }),
  },
  menu: {
    path: "menu",
    permissions: withWriteApproval({
      read: "menu:read",
      create: "menu:create",
      update: "menu:update",
      delete: "menu:delete",
    }),
  },
  operations: {
    path: "operations",
    permissions: withWriteApproval({
      read: "operations:read",
      create: "operations:create",
      update: "operations:update",
      delete: "operations:delete",
    }),
  },
  reports: {
    path: "reports",
    permissions: withWriteApproval({
      read: "reports:read",
      create: "reports:create",
      update: "reports:update",
      delete: "reports:delete",
    }),
  },
  statistics: {
    path: "statistics",
    permissions: withWriteApproval({
      read: "statistics:read",
      create: "statistics:create",
      update: "statistics:update",
      delete: "statistics:delete",
    }),
  },
  alerts: {
    path: "alerts",
    permissions: withWriteApproval({
      read: "alerts:read",
      create: "alerts:create",
      update: "alerts:update",
      delete: "alerts:delete",
    }),
  },
  manufacturing: {
    path: "manufacturing",
    permissions: withWriteApproval({
      read: "manufacturing:read",
      create: "manufacturing:create",
      update: "manufacturing:update",
      delete: "manufacturing:delete",
    }),
  },
  chat: {
    path: "chat",
    permissions: withWriteApproval({
      read: "chat:read",
      create: "chat:create",
      update: "chat:update",
      delete: "chat:delete",
    }),
  },
  comandas: {
    path: "comandas",
    permissions: withWriteApproval({
      read: "comandas:read",
      create: "comandas:create",
      update: "comandas:update",
      delete: "comandas:delete",
    }),
  },
  purchases: {
    path: "purchases",
    permissions: withWriteApproval({
      read: "purchases:read",
      create: "purchases:create",
      update: "purchases:update",
      delete: "purchases:delete",
    }),
  },
  purchase_orders: {
    path: "purchase-orders",
    permissions: withWriteApproval({
      read: "purchase_orders:read",
      create: "purchase_orders:create",
      update: "purchase_orders:update",
      delete: "purchase_orders:delete",
    }),
  },
  accounts: {
    path: "accounts",
    permissions: withWriteApproval({
      read: "payment_methods:read",
      create: "payment_methods:create",
      update: "payment_methods:update",
      delete: "payment_methods:delete",
    }),
  },
  printers: {
    path: "printers",
    permissions: withWriteApproval({
      read: "printers:read",
      create: "printers:create",
      update: "printers:update",
      delete: "printers:delete",
    }),
  },
  sale: {
    path: "sale",
    permissions: withWriteApproval({
      read: "sale:read",
      create: "sale:create",
      update: "sale:update",
      delete: "sale:delete",
    }),
  },
  quotes: {
    path: "quotes",
    permissions: withWriteApproval({
      read: "quotes:read",
      create: "quotes:create",
      update: "quotes:update",
      delete: "quotes:delete",
    }),
  },
  mesas: {
    path: "mesas",
    permissions: withWriteApproval({
      read: "mesas:read",
      create: "mesas:create",
      update: "mesas:update",
      delete: "mesas:delete",
    }),
  },
  mostrador: {
    path: "mostrador",
    permissions: withWriteApproval({
      read: "mostrador:read",
      create: "mostrador:create",
      update: "mostrador:update",
      delete: "mostrador:delete",
    }),
  },
  recipes: {
    path: "recipes",
    permissions: withWriteApproval({
      read: "recipes:read",
      create: "recipes:create",
      update: "recipes:update",
      delete: "recipes:delete",
    }),
  },
  services: {
    path: "services",
    permissions: withWriteApproval({
      read: "services:read",
      create: "services:create",
      update: "services:update",
      delete: "services:delete",
    }),
  },
  "cobrar-servicios": {
    path: "cobrar-servicios",
    permissions: withWriteApproval({
      read: "service_charges:read",
      create: "service_charges:create",
      update: "service_charges:update",
      delete: "service_charges:delete",
    }),
  },
  promotions: {
    path: "promotions",
    permissions: withWriteApproval({
      read: "promotions:read",
      create: "promotions:create",
      update: "promotions:update",
      delete: "promotions:delete",
    }),
  },
  settings: {
    path: "settings",
    permissions: withWriteApproval({
      read: "settings:read",
      create: "settings:create",
      update: "settings:update",
      delete: "settings:delete",
    }),
  },
  suppliers: {
    path: "suppliers",
    permissions: withWriteApproval({
      read: "suppliers:read",
      create: "suppliers:create",
      update: "suppliers:update",
      delete: "suppliers:delete",
    }),
  },
  checks: {
    path: "checks",
    permissions: withWriteApproval({
      read: "checks:read",
      create: "checks:create",
      update: "checks:update",
      delete: "checks:delete",
    }),
  },
  "current-accounts": {
    path: "current-accounts",
    permissions: withWriteApproval({
      read: "current_accounts:read",
      create: "current_accounts:create",
      update: "current_accounts:update",
      delete: "current_accounts:delete",
    }),
  },
  audit: {
    path: "audit",
    permissions: { read: "audit:read" } as PopPagePermissionMap,
  },
} satisfies Record<string, PopPageDefinition>

export type PopPageKey = keyof typeof POP_PAGES

export const POP_PAGE_KEYS = Object.keys(POP_PAGES) as PopPageKey[]

export function permissionKeysForPage(key: PopPageKey): string[] {
  return Object.values(POP_PAGES[key].permissions)
}

export function allUniquePermissionKeys(): string[] {
  const set = new Set<string>()
  for (const k of POP_PAGE_KEYS) {
    for (const p of permissionKeysForPage(k)) set.add(p)
  }
  return [...set].sort()
}

export function permissionByLabel(
  pageKey: PopPageKey,
  label: string,
): string | undefined {
  const map = POP_PAGES[pageKey].permissions as PopPagePermissionMap
  return map[label]
}
