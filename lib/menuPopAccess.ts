import type { PopAccessModule } from "@/app/home/homeUserDataTypes"
import type { MenuItemDef, MenuItemLink, MenuSectionKey } from "@/lib/menuCatalog"
import { getRootsModuleIcon } from "@/lib/rootsyModuleIcons"
import { ROOTS_MODULE_SECTION_LABELS } from "@/lib/rootsySubscriptionCatalog"
import { Banknote } from "lucide-react"

/** Link del menú → key de módulo en `_pop-access` / catálogo de suscripción. */
export const MENU_LINK_TO_MODULE_KEY: Partial<Record<MenuItemLink, string>> = {
  sale: "sale",
  quotes: "quotes",
  "purchase-orders": "purchase_orders",
  mostrador: "mostrador",
  mesas: "mesas",
  purchases: "purchases",
  expenses: "expenses",
  articles: "stock",
  clients: "clients",
  suppliers: "suppliers",
  promotions: "promotions",
  recipes: "recipes",
  services: "services",
  "active-services": "active_services",
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
  Object.entries(MENU_LINK_TO_MODULE_KEY)
    .filter(([link]) => link !== "cobrar-servicios")
    .map(([link, key]) => [key, link as MenuItemLink]),
) as Partial<Record<string, MenuItemLink>>

const MENU_MODULE_SECTION_ORDER = [
  "operar",
  "administrar",
  "configurar",
  "extras",
] as const satisfies readonly PopAccessModule["section"][]

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

export function buildMenuSectionsFromEnabledModules(
  enabledModules: readonly PopAccessModule[],
): Record<string, MenuSectionFromModules> {
  const grouped = new Map<PopAccessModule["section"], MenuItemDef[]>()

  for (const mod of enabledModules) {
    if (!mod.permissions?.read) continue
    if (mod.key === "summary") continue

    const link = menuLinkForModuleKey(mod.key)
    const items = grouped.get(mod.section) ?? []
    items.push({
      moduleKey: mod.key,
      name: mod.label,
      icon: getRootsModuleIcon(mod.key),
      link,
      badge: link === "section" ? "Pronto" : mod.isExtra ? "Extra" : undefined,
    })
    grouped.set(mod.section, items)
  }

  const operarItems = grouped.get("operar")
  if (
    operarItems?.some(
      (item) =>
        item.moduleKey === "active_services" || item.link === "active-services",
    ) &&
    !operarItems.some((item) => item.link === "cobrar-servicios")
  ) {
    const anchorIndex = operarItems.findIndex(
      (item) =>
        item.link === "active-services" || item.moduleKey === "active_services",
    )
    const cobrarItem: MenuItemDef = {
      moduleKey: "active_services",
      name: "Vender servicio",
      icon: Banknote,
      link: "cobrar-servicios",
      badge: "NUEVO",
    }
    if (anchorIndex >= 0) {
      operarItems.splice(anchorIndex, 0, cobrarItem)
    } else {
      operarItems.push(cobrarItem)
    }
  }

  const out: Record<string, MenuSectionFromModules> = {}
  for (const section of MENU_MODULE_SECTION_ORDER) {
    const items = grouped.get(section)
    if (!items?.length) continue
    out[section] = {
      title: ROOTS_MODULE_SECTION_LABELS[section],
      items,
    }
  }
  return out
}

export function canAccessMenuItemFromPopAccess(
  enabledModules: readonly PopAccessModule[],
  menuLink?: MenuItemLink,
): boolean {
  if (!menuLink || menuLink === "section") return false
  const moduleKey = MENU_LINK_TO_MODULE_KEY[menuLink]
  if (!moduleKey) return false
  const mod = enabledModules.find((entry) => entry.key === moduleKey)
  return Boolean(mod?.permissions?.read)
}
