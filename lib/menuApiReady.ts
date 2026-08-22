import type { MenuDockItemId } from "@/lib/menuCatalog"

/** Módulos ya migrados a rootsy-api + UX (listado al entrar, URL shallow, sin loading de page). */
export const MENU_API_READY_IDS = [
  "articles",
  "recipes",
  "promotions",
  "clients",
  "suppliers",
  "services",
  "invoices",
  "quotes",
  "purchase-orders",
  "checks",
  "settings",
  "current-accounts",
  "expenses",
  "inventory",
] as const satisfies readonly MenuDockItemId[]

const READY = new Set<string>(MENU_API_READY_IDS)

export function isMenuApiReady(id: string | null | undefined): boolean {
  return Boolean(id && READY.has(id))
}
