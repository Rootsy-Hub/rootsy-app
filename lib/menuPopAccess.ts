import type { PopAccessModule } from "@/app/home/homeUserDataTypes"
import type { MenuItemDef, MenuItemLink, MenuSectionKey } from "@/lib/menuCatalog"
import { getRootsModuleIcon } from "@/lib/rootsyModuleIcons"
import { ROOTS_MODULE_SECTION_LABELS } from "@/lib/rootsySubscriptionCatalog"
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
  accounting: "accounting",
  hr: "hr",
  printers: "printers",
  settings: "settings",
  checks: "checks",
  "current-accounts": "current_accounts",
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
    "accounting",
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

export function canAccessMenuItemFromPopAccess(
  enabledModules: readonly PopAccessModule[],
  menuLink?: MenuItemLink,
): boolean {
  if (!menuLink || menuLink === "section") return false
  if (menuLink === "comandas") {
    return enabledModules.some(
      (mod) =>
        (mod.key === "mesas" || mod.key === "mostrador") &&
        Boolean(mod.permissions?.read),
    )
  }
  const moduleKey = MENU_LINK_TO_MODULE_KEY[menuLink]
  if (!moduleKey) return false
  const mod = enabledModules.find((entry) => entry.key === moduleKey)
  return Boolean(mod?.permissions?.read)
}
