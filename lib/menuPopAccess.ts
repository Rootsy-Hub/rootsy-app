import type {
  HomePopListItem,
  PopAccessCache,
  PopAccessModule,
  PopAccessModulePermissions,
} from "@/app/home/homeUserDataTypes"
import { POP_ACCESS_MODULE_TO_PAGE_KEY } from "@/lib/popAccessModuleMap"
import { POP_PAGES, type PopPageKey } from "@/lib/popPageCrudConstants"
import type { MenuItemDef, MenuItemLink, MenuSectionKey } from "@/lib/menuCatalog"
import { isPopMenuPathname, popModuleKeyFromPath } from "@/lib/popRoutes"
import { getRootsModuleIcon } from "@/lib/rootsyModuleIcons"
import {
  ROOTS_BUSINESS_TYPE_MODULES,
  ROOTS_MODULE_SECTION_LABELS,
  ROOTS_SHARED_MODULES,
} from "@/lib/rootsySubscriptionCatalog"
import { Banknote, ChefHat } from "lucide-react"

/** Link del menú → key de módulo en `_pop-access` / catálogo de suscripción. */
export const MENU_LINK_TO_MODULE_KEY: Partial<Record<MenuItemLink, string>> = {
  sale: "sale",
  quotes: "quotes",
  "purchase-orders": "purchase_orders",
  mostrador: "mostrador",
  mesas: "mesas",
  comandas: "comandas",
  purchases: "purchases",
  expenses: "expenses",
  articles: "stock",
  clients: "clients",
  suppliers: "suppliers",
  promotions: "promotions",
  recipes: "recipes",
  services: "services",
  "cobrar-servicios": "active_services",
  operations: "operations",
  reports: "reports",
  statistics: "statistics",
  inventory: "inventory",
  invoices: "invoices",
  accounts: "accounts",
  "cash-registers": "cash_registers",
  hr: "hr",
  printers: "printers",
  settings: "settings",
  checks: "checks",
  "current-accounts": "current_accounts",
  alerts: "alerts",
  chat: "chat",
  manufacturing: "manufacturing",
}

/** Módulo de suscripción → link principal del menú (sin alias como cobrar-servicios). */
const MODULE_KEY_TO_MENU_LINK = Object.fromEntries(
  Object.entries(MENU_LINK_TO_MODULE_KEY).map(([link, key]) => [
    key,
    link as MenuItemLink,
  ]),
) as Partial<Record<string, MenuItemLink>>

type MenuModuleSection = Exclude<PopAccessModule["section"], "extras">

const MENU_MODULE_SECTION_ORDER = [
  "operar",
  "administrar",
  "configurar",
] as const satisfies readonly MenuModuleSection[]

/** Orden canónico de tiles por sección (extras se fusionan acá, no hay pestaña Extras). */
const MENU_MODULE_KEY_ORDER: Record<MenuModuleSection, readonly string[]> = {
  operar: [
    "sale",
    "mostrador",
    "mesas",
    "comandas",
    "active_services",
    "purchases",
    "expenses",
    "inventory",
    "manufacturing",
    "current_accounts",
  ],
  administrar: [
    "clients",
    "suppliers",
    "invoices",
    "stock",
    "recipes",
    "promotions",
    "services",
    "checks",
    "operations",
    "statistics",
    "reports",
    "quotes",
    "purchase_orders",
  ],
  configurar: [
    "accounts",
    "hr",
    "cash_registers",
    "printers",
    "alerts",
    "chat",
    "settings",
  ],
}

const LEGACY_EXTRA_MODULE_SECTION: Record<string, MenuModuleSection> = {
  manufacturing: "operar",
  invoices: "administrar",
  printers: "configurar",
  chat: "configurar",
}

export function menuLinkForModuleKey(moduleKey: string): MenuItemLink {
  return MODULE_KEY_TO_MENU_LINK[moduleKey] ?? "section"
}

/** Sección visual del ícono (extras comparte estilo con configurar). */
export function menuStyleSectionForModuleSection(
  section: PopAccessModule["section"],
): MenuSectionKey {
  return section === "extras" ? "configurar" : section
}

export type MenuSectionFromModules = {
  title: string
  items: MenuItemDef[]
}

function buildMenuModuleCanonicalSectionMap(): Record<string, MenuModuleSection> {
  const out: Record<string, MenuModuleSection> = {}
  for (const [section, keys] of Object.entries(MENU_MODULE_KEY_ORDER) as Array<
    [MenuModuleSection, readonly string[]]
  >) {
    for (const key of keys) {
      out[key] = section
    }
  }
  return out
}

const MENU_MODULE_CANONICAL_SECTION = buildMenuModuleCanonicalSectionMap()

function resolveMenuModuleSection(mod: PopAccessModule): MenuModuleSection {
  const canonical = MENU_MODULE_CANONICAL_SECTION[mod.key]
  if (canonical) return canonical
  if (mod.section !== "extras") return mod.section
  return LEGACY_EXTRA_MODULE_SECTION[mod.key] ?? "configurar"
}

function menuItemSortRank(section: MenuModuleSection, item: MenuItemDef): number {
  const order = MENU_MODULE_KEY_ORDER[section]
  if (item.link === "cobrar-servicios") {
    const activeIndex = order.indexOf("active_services")
    return activeIndex >= 0 ? activeIndex - 0.5 : 999
  }
  const index = order.indexOf(item.moduleKey ?? "")
  return index >= 0 ? index : 999
}

function sortMenuSectionItems(
  section: MenuModuleSection,
  items: MenuItemDef[],
): MenuItemDef[] {
  return [...items].sort(
    (a, b) => menuItemSortRank(section, a) - menuItemSortRank(section, b),
  )
}

export function buildMenuSectionsFromEnabledModules(
  enabledModules: readonly PopAccessModule[],
): Record<string, MenuSectionFromModules> {
  const grouped = new Map<MenuModuleSection, MenuItemDef[]>()
  const seenKeys = new Set<string>()

  for (const mod of enabledModules) {
    if (!mod.permissions?.read) continue
    if (mod.key === "summary") continue
    if (mod.key === "accounting") continue
    if (mod.key === "active_services") continue

    const section = resolveMenuModuleSection(mod)
    const dedupeKey = `${section}:${mod.key}`
    if (seenKeys.has(dedupeKey)) continue
    seenKeys.add(dedupeKey)

    const link = menuLinkForModuleKey(mod.key)
    const items = grouped.get(section) ?? []
    items.push({
      moduleKey: mod.key,
      name: mod.label,
      icon: getRootsModuleIcon(mod.key),
      link,
    })
    grouped.set(section, items)
  }

  const hasKitchenOps = enabledModules.some(
    (mod) =>
      (mod.key === "mesas" || mod.key === "mostrador") &&
      mod.permissions?.read,
  )
  if (hasKitchenOps) {
    const operarItems = grouped.get("operar") ?? []
    if (!operarItems.some((item) => item.link === "comandas")) {
      operarItems.push({
        moduleKey: "comandas",
        name: "Comandas",
        icon: ChefHat,
        link: "comandas",
      })
      grouped.set("operar", operarItems)
    }
  }

  const hasActiveServices = enabledModules.some(
    (mod) => mod.key === "active_services" && mod.permissions?.read,
  )
  if (hasActiveServices) {
    const operarItems = grouped.get("operar") ?? []
    if (!operarItems.some((item) => item.link === "cobrar-servicios")) {
      operarItems.push({
        moduleKey: "active_services",
        name: "Vender servicio",
        icon: Banknote,
        link: "cobrar-servicios",
      })
      grouped.set("operar", operarItems)
    }
  }

  const out: Record<string, MenuSectionFromModules> = {}
  for (const section of MENU_MODULE_SECTION_ORDER) {
    const items = grouped.get(section)
    if (!items?.length) continue
    out[section] = {
      title: ROOTS_MODULE_SECTION_LABELS[section],
      items: sortMenuSectionItems(section, items),
    }
  }
  return out
}

function moduleReadKey(moduleKey: string): string | null {
  const pageKey = POP_ACCESS_MODULE_TO_PAGE_KEY[moduleKey]
  if (!pageKey) return null
  return POP_PAGES[pageKey as PopPageKey]?.permissions.read ?? null
}

export function hasModuleReadPermission(
  permissions: readonly string[],
  isOwner: boolean,
  moduleKey: string,
): boolean {
  if (isOwner) return true
  if (moduleKey === "comandas") {
    return (
      permissions.includes("comandas:read") ||
      permissions.includes("mesas:read") ||
      permissions.includes("mostrador:read")
    )
  }
  const read = moduleReadKey(moduleKey)
  return read ? permissions.includes(read) : false
}

function moduleCrud(
  permissions: readonly string[],
  isOwner: boolean,
  moduleKey: string,
): PopAccessModulePermissions {
  if (isOwner) {
    return { read: true, create: true, update: true, delete: true }
  }
  const pageKey = POP_ACCESS_MODULE_TO_PAGE_KEY[moduleKey]
  if (!pageKey || !(pageKey in POP_PAGES)) {
    return {
      read: hasModuleReadPermission(permissions, false, moduleKey),
      create: false,
      update: false,
      delete: false,
    }
  }
  const perms = POP_PAGES[pageKey].permissions
  return {
    read: permissions.includes(perms.read),
    create: permissions.includes(perms.create),
    update: permissions.includes(perms.update),
    delete: permissions.includes(perms.delete),
  }
}

function catalogModulesForMenu(): Array<{
  key: string
  label: string
  section: MenuModuleSection
  isExtra: boolean
}> {
  const catalog = ROOTS_BUSINESS_TYPE_MODULES.platform_full
  const extraKeys = new Set(catalog.extras.map((mod) => mod.key))
  const byKey = new Map<
    string,
    { key: string; label: string; section: MenuModuleSection; isExtra: boolean }
  >()

  for (const section of MENU_MODULE_SECTION_ORDER) {
    for (const mod of [
      ...ROOTS_SHARED_MODULES[section],
      ...catalog.specific[section],
    ]) {
      if (!byKey.has(mod.key)) {
        byKey.set(mod.key, {
          key: mod.key,
          label: mod.label,
          section,
          isExtra: extraKeys.has(mod.key),
        })
      }
    }
  }
  for (const mod of catalog.extras) {
    if (byKey.has(mod.key)) continue
    byKey.set(mod.key, {
      key: mod.key,
      label: mod.label,
      section: LEGACY_EXTRA_MODULE_SECTION[mod.key] ?? "configurar",
      isExtra: true,
    })
  }
  return [...byKey.values()]
}

export function enabledModulesFromPermissionKeys(
  permissions: readonly string[],
  isOwner: boolean,
): PopAccessModule[] {
  const out: PopAccessModule[] = []
  for (const mod of catalogModulesForMenu()) {
    const crud = moduleCrud(permissions, isOwner, mod.key)
    if (!crud.read) continue
    out.push({
      key: mod.key,
      label: mod.label,
      section: mod.section,
      isExtra: mod.isExtra,
      permissions: crud,
    })
  }
  return out
}

export function homePopToMenuAccess(
  pop: HomePopListItem,
  enabledModules: PopAccessModule[],
): PopAccessCache {
  return {
    pop: {
      id: pop.id,
      name: pop.name,
      imageUrl: pop.imageUrl,
      backgroundImageUrl: pop.backgroundImageUrl,
      siteId: pop.siteId,
      streetAddress: pop.streetAddress,
      isActive: pop.isActive,
    },
    subscription: pop.subscription,
    enabledModules,
    limits: pop.limits,
    fiscal: {
      hasValidCuit: false,
      emisorIvaCondition: "responsable_inscripto",
    },
    isOwner: pop.isOwner,
    role: {
      name: pop.roleName,
      displayName: pop.roleName,
      permissionGrants: pop.permissions,
    },
    canEnter: pop.canEnter,
  }
}

const PATH_SEGMENT_TO_MENU_LINK: Record<string, MenuItemLink> = {
  sale: "sale",
  quotes: "quotes",
  "purchase-orders": "purchase-orders",
  mesas: "mesas",
  comandas: "comandas",
  mostrador: "mostrador",
  operations: "operations",
  purchases: "purchases",
  expenses: "expenses",
  suppliers: "suppliers",
  invoices: "invoices",
  settings: "settings",
  hr: "hr",
  articles: "articles",
  clients: "clients",
  accounts: "accounts",
  printers: "printers",
  "cash-registers": "cash-registers",
  inventory: "inventory",
  recipes: "recipes",
  services: "services",
  "cobrar-servicios": "cobrar-servicios",
  promotions: "promotions",
  reports: "reports",
  statistics: "statistics",
  checks: "checks",
  "current-accounts": "current-accounts",
  "active-services": "operations",
  alerts: "alerts",
  chat: "chat",
  manufacturing: "manufacturing",
}

/** Segmento de URL POP → ítem de menú, o null si la ruta no se controla. */
export function menuLinkFromPopPath(pathname: string): MenuItemLink | null {
  if (isPopMenuPathname(pathname)) return null
  const segment = popModuleKeyFromPath(pathname)
  return PATH_SEGMENT_TO_MENU_LINK[segment] ?? null
}

export function canAccessMenuItemFromPopAccess(
  enabledModules: readonly PopAccessModule[],
  menuLink?: MenuItemLink,
): boolean {
  if (!menuLink || menuLink === "section") return false
  if (menuLink === "comandas") {
    return enabledModules.some(
      (mod) =>
        (mod.key === "mesas" ||
          mod.key === "mostrador" ||
          mod.key === "comandas") &&
        Boolean(mod.permissions?.read),
    )
  }
  const moduleKey = MENU_LINK_TO_MODULE_KEY[menuLink]
  if (!moduleKey) return false
  const mod = enabledModules.find((entry) => entry.key === moduleKey)
  return Boolean(mod?.permissions?.read)
}
