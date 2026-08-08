import type { PopAccessModule } from "@/app/home/homeUserDataTypes"
import type { MenuItemLink } from "@/lib/menuCatalog"

/** Link del menú → key de módulo en `_pop-access` / catálogo de suscripción. */
export const MENU_LINK_TO_MODULE_KEY: Partial<Record<MenuItemLink, string>> = {
  sale: "sale",
  mostrador: "mostrador",
  mesas: "mesas",
  purchases: "purchases",
  expenses: "expenses",
  articles: "stock",
  clients: "clients",
  suppliers: "suppliers",
  promotions: "promotions",
  recipes: "recipes",
  operations: "operations",
  inventory: "inventory",
  invoices: "invoices",
  accounts: "accounts",
  "cash-registers": "cash_registers",
  accounting: "accounting",
  hr: "hr",
  printers: "printers",
  settings: "settings",
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
