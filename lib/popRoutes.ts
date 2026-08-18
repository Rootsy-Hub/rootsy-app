import { DEFAULT_SALE_SITE_ID } from "@/lib/saleInvoiceTypes"

export function siteIdFromPopSettings(settings: unknown): string {
  if (settings == null || typeof settings !== "object") {
    return DEFAULT_SALE_SITE_ID
  }
  const s = settings as Record<string, unknown>
  const v = s.site_id
  if (typeof v === "string" && v.trim()) return v.trim()
  return DEFAULT_SALE_SITE_ID
}

export function siteIdFromPopRow(row: {
  site_id?: string | null
  settings?: unknown
}): string {
  const col = row.site_id
  if (typeof col === "string" && col.trim()) return col.trim()
  return siteIdFromPopSettings(row.settings)
}

export function popScopedHref(
  siteId: string,
  popId: string,
  pathname: string,
): string {
  const p = pathname.startsWith("/") ? pathname.slice(1) : pathname
  return `/${siteId}/${popId}/${p}`
}

export function popMenuHref(siteId: string, popId: string): string {
  return popScopedHref(siteId, popId, "menu")
}

/** Path sin query ni hash (p. ej. destino de Link / router). */
export function popPathFromHref(href: string): string {
  const queryIndex = href.indexOf("?")
  const hashIndex = href.indexOf("#")
  const end =
    queryIndex >= 0 && hashIndex >= 0
      ? Math.min(queryIndex, hashIndex)
      : queryIndex >= 0
        ? queryIndex
        : hashIndex
  return end >= 0 ? href.slice(0, end) : href
}

/** Segmento de módulo POP en rutas `/siteId/popId/module/...`. */
export function popModuleKeyFromPath(pathOrHref: string): string {
  const parts = popPathFromHref(pathOrHref).split("/").filter(Boolean)
  return parts[2] ?? ""
}

/** Ruta del menú POP (`/…/menu`, `/…/menu/…`), excluye `menu-catalog`. */
export function isPopMenuPathname(pathname: string): boolean {
  return /\/menu(?:\/|$)/.test(pathname) && !pathname.includes("/menu-catalog")
}

export function siteIdsMatchClientRoute(
  routeSiteId: string,
  popSiteId: string,
): boolean {
  return routeSiteId.trim().toLowerCase() === popSiteId.trim().toLowerCase()
}
