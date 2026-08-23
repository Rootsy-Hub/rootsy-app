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
  "operations",
  "reports",
  "accounts",
  "cash-registers",
  "statistics",
  "printers",
  "hr",
  "chat",
] as const satisfies readonly MenuDockItemId[]

const READY = new Set<string>(MENU_API_READY_IDS)

export function isMenuApiReady(id: string | null | undefined): boolean {
  return Boolean(id && READY.has(id))
}

/** Poner en `false` para ocultar el check de API lista. */
export const SHOW_MENU_API_READY_BADGE = true

export function shouldShowMenuApiReadyBadge(
  id: string | null | undefined,
): boolean {
  return SHOW_MENU_API_READY_BADGE && isMenuApiReady(id)
}
