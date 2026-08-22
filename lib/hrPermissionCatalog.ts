import {
  POP_PAGES,
  type PopPageKey,
  permissionKeysForPage,
} from "@/lib/popPageCrudConstants"

export type HrPermissionCatalogRow = {
  key: string
  resource: string
  action: string
  description: string | null
  actionLabel: string
}

export type HrPermissionSection = {
  pageKey: PopPageKey
  label: string
  permissions: HrPermissionCatalogRow[]
}

const SECTION_LABELS: Record<PopPageKey, string> = {
  sale: "Vender (POS)",
  mesas: "Mesas",
  mostrador: "Mostrador",
  comandas: "Comandas",
  operations: "Operaciones",
  reports: "Reportes",
  statistics: "Estadísticas",
  purchases: "Compras",
  purchase_orders: "Órdenes de compra",
  quotes: "Presupuestos",
  expenses: "Gastos",
  articles: "Artículos",
  recipes: "Recetas",
  services: "Servicios",
  "cobrar-servicios": "Vender servicio",
  promotions: "Promociones",
  inventory: "Inventario",
  manufacturing: "Fabricación",
  clients: "Clientes",
  suppliers: "Proveedores",
  invoices: "Facturas",
  accounts: "Cuentas / tesorería",
  "cash-registers": "Cajas",
  printers: "Impresoras",
  alerts: "Alertas",
  chat: "Chat",
  settings: "Ajustes",
  hr: "Recursos humanos",
  menu: "Menú",
  checks: "Cheques",
  "current-accounts": "Cuentas corrientes",
}

/** Orden de secciones en el editor de permisos (alineado al menú del POP). */
const SECTION_ORDER: PopPageKey[] = [
  "sale",
  "mesas",
  "mostrador",
  "comandas",
  "purchases",
  "expenses",
  "inventory",
  "manufacturing",
  "current-accounts",
  "clients",
  "suppliers",
  "invoices",
  "articles",
  "recipes",
  "promotions",
  "services",
  "checks",
  "operations",
  "statistics",
  "reports",
  "quotes",
  "purchase_orders",
  "accounts",
  "hr",
  "cash-registers",
  "printers",
  "alerts",
  "chat",
  "settings",
  "cobrar-servicios",
]

const ACTION_LABELS: Record<string, string> = {
  read: "Ver",
  create: "Crear / cargar",
  update: "Editar",
  delete: "Eliminar",
}

const ACTION_DESCRIPTIONS: Record<string, string> = {
  read: "Entrar a la sección y consultar datos.",
  create: "Registrar operaciones nuevas (ventas, cargas, altas).",
  update: "Modificar registros ya existentes.",
  delete: "Anular, quitar o eliminar registros.",
}

function splitGrantKey(key: string): { resource: string; action: string } {
  const i = key.indexOf(":")
  if (i <= 0) return { resource: key, action: "" }
  return { resource: key.slice(0, i), action: key.slice(i + 1) }
}

function rowFromKey(key: string): HrPermissionCatalogRow {
  const { resource, action } = splitGrantKey(key)
  return {
    key,
    resource,
    action,
    actionLabel: ACTION_LABELS[action] ?? action,
    description: ACTION_DESCRIPTIONS[action] ?? null,
  }
}

/** Filas planas (compatibilidad con actions existentes). */
export function buildHrPermissionCatalogRows(): HrPermissionCatalogRow[] {
  return buildHrPermissionSections().flatMap((s) => s.permissions)
}

/** Una sección por módulo, con sus keys propias (sin fusionar pantallas). */
export function buildHrPermissionSections(): HrPermissionSection[] {
  const actionOrder = ["read", "create", "update", "delete"]
  const seen = new Set<PopPageKey>()
  const sections: HrPermissionSection[] = []

  const push = (pageKey: PopPageKey) => {
    if (seen.has(pageKey)) return
    seen.add(pageKey)
    const permissions = permissionKeysForPage(pageKey)
      .map(rowFromKey)
      .sort(
        (a, b) =>
          actionOrder.indexOf(a.action) - actionOrder.indexOf(b.action) ||
          a.key.localeCompare(b.key, "es"),
      )
    if (!permissions.length) return
    sections.push({
      pageKey,
      label: SECTION_LABELS[pageKey] ?? pageKey,
      permissions,
    })
  }

  for (const pageKey of SECTION_ORDER) push(pageKey)
  for (const pageKey of Object.keys(POP_PAGES) as PopPageKey[]) {
    if (pageKey === "menu") continue
    push(pageKey)
  }

  return sections
}

export function sectionGrantKeys(section: HrPermissionSection): string[] {
  return section.permissions.map((p) => p.key)
}
