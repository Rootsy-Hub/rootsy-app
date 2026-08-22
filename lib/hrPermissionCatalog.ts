import { POP_ACCESS_MODULE_TO_PAGE_KEY } from "@/lib/popAccessModuleMap"
import {
  POP_PAGES,
  type PopPageKey,
  permissionKeysForPage,
} from "@/lib/popPageCrudConstants"
import {
  modulesAvailableForPop,
  type RootsModuleDefinition,
} from "@/lib/rootsySubscriptionCatalog"

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

export type HrPopModuleScope = {
  businessTypeName?: string | null
  allModules?: boolean
  extraModuleKeys?: readonly string[]
}

function sectionsFromModules(
  modules: readonly RootsModuleDefinition[],
): HrPermissionSection[] {
  const actionOrder = ["read", "create", "update", "delete"]
  const availablePages = new Set<PopPageKey>()
  for (const mod of modules) {
    const pageKey = POP_ACCESS_MODULE_TO_PAGE_KEY[mod.key]
    if (pageKey && pageKey in POP_PAGES) availablePages.add(pageKey)
  }

  const ordered: PopPageKey[] = [
    ...SECTION_ORDER.filter((key) => availablePages.has(key)),
    ...[...availablePages].filter((key) => !SECTION_ORDER.includes(key)),
  ]

  return ordered.map((pageKey) => {
    const permissions = permissionKeysForPage(pageKey)
      .map(rowFromKey)
      .sort(
        (a, b) =>
          actionOrder.indexOf(a.action) - actionOrder.indexOf(b.action) ||
          a.key.localeCompare(b.key, "es"),
      )
    return {
      pageKey,
      label: SECTION_LABELS[pageKey] ?? pageKey,
      permissions,
    }
  })
}

/** Catálogo del tipo de POP (rubro + extras). */
export function buildHrPermissionSectionsForPop(
  scope?: HrPopModuleScope,
): HrPermissionSection[] {
  return sectionsFromModules(
    modulesAvailableForPop({
      businessTypeName: scope?.businessTypeName ?? "platform_full",
      allModules: scope?.allModules ?? true,
      extraModuleKeys: scope?.extraModuleKeys,
    }),
  )
}

/** Filas planas (compatibilidad con actions existentes). */
export function buildHrPermissionCatalogRows(
  scope?: HrPopModuleScope,
): HrPermissionCatalogRow[] {
  return buildHrPermissionSections(scope).flatMap((s) => s.permissions)
}

/** Una sección por módulo disponible en el POP. */
export function buildHrPermissionSections(
  scope?: HrPopModuleScope,
): HrPermissionSection[] {
  return buildHrPermissionSectionsForPop(scope)
}

export function sectionGrantKeys(section: HrPermissionSection): string[] {
  return section.permissions.map((p) => p.key)
}
