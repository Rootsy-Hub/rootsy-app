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
  operations: "Operaciones",
  purchases: "Compras",
  expenses: "Gastos",
  articles: "Artículos",
  recipes: "Recetas",
  services: "Servicios",
  "cobrar-servicios": "Vender servicio",
  promotions: "Promociones",
  inventory: "Inventario",
  clients: "Clientes",
  suppliers: "Proveedores",
  invoices: "Facturas",
  accounts: "Cuentas / tesorería",
  "cash-registers": "Cajas",
  printers: "Impresoras",
  settings: "Ajustes",
  hr: "Recursos humanos",
  menu: "Menú",
  quotes: "Presupuestos",
  purchase_orders: "Órdenes de compra",
  checks: "Cheques",
  "current-accounts": "Cuentas corrientes",
}

/** Orden de secciones en el editor de permisos (alineado al menú del POP). */
const SECTION_ORDER: PopPageKey[] = [
  "sale",
  "mesas",
  "operations",
  "purchases",
  "expenses",
  "articles",
  "recipes",
  "services",
  "cobrar-servicios",
  "promotions",
  "inventory",
  "clients",
  "suppliers",
  "checks",
  "current-accounts",
  "invoices",
  "accounts",
  "cash-registers",
  "printers",
  "settings",
  "hr",
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

/** Agrupa permisos por pantalla del POP para el editor de roles. */
export function buildHrPermissionSections(): HrPermissionSection[] {
  const keyToPage = new Map<string, PopPageKey>()

  for (const pageKey of SECTION_ORDER) {
    for (const permKey of permissionKeysForPage(pageKey)) {
      if (!keyToPage.has(permKey)) {
        keyToPage.set(permKey, pageKey)
      }
    }
  }

  for (const pageKey of Object.keys(POP_PAGES) as PopPageKey[]) {
    if (SECTION_ORDER.includes(pageKey)) continue
    for (const permKey of permissionKeysForPage(pageKey)) {
      if (!keyToPage.has(permKey)) {
        keyToPage.set(permKey, pageKey)
      }
    }
  }

  const byPage = new Map<PopPageKey, HrPermissionCatalogRow[]>()

  for (const [permKey, pageKey] of keyToPage.entries()) {
    const list = byPage.get(pageKey) ?? []
    list.push(rowFromKey(permKey))
    byPage.set(pageKey, list)
  }

  const actionOrder = ["read", "create", "update", "delete"]

  const sections: HrPermissionSection[] = []
  for (const pageKey of SECTION_ORDER) {
    const perms = byPage.get(pageKey)
    if (!perms?.length) continue
    perms.sort(
      (a, b) =>
        actionOrder.indexOf(a.action) - actionOrder.indexOf(b.action) ||
        a.key.localeCompare(b.key, "es"),
    )
    sections.push({
      pageKey,
      label: SECTION_LABELS[pageKey] ?? pageKey,
      permissions: perms,
    })
    byPage.delete(pageKey)
  }

  for (const [pageKey, perms] of byPage.entries()) {
    perms.sort((a, b) => a.key.localeCompare(b.key, "es"))
    sections.push({
      pageKey,
      label: SECTION_LABELS[pageKey] ?? pageKey,
      permissions: perms,
    })
  }

  return sections
}

export function sectionGrantKeys(section: HrPermissionSection): string[] {
  return section.permissions.map((p) => p.key)
}
