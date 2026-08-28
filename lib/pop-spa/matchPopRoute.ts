import { isPopMenuPathname, popScopedHref } from "@/lib/popRoutes"
import { popIdsFromPathname } from "@/lib/pop-spa/href"

export type PopViewKey =
  | "menu"
  | "sale"
  | "quotes"
  | "purchase-orders"
  | "mesas"
  | "comandas"
  | "mostrador"
  | "operations"
  | "purchases"
  | "expenses"
  | "suppliers"
  | "invoices"
  | "settings"
  | "hr"
  | "hr-fichar"
  | "hr-person"
  | "articles"
  | "clients"
  | "accounts"
  | "account-detail"
  | "printers"
  | "cash-registers"
  | "cash-register-detail"
  | "inventory"
  | "recipes"
  | "services"
  | "cobrar-servicios"
  | "promotions"
  | "reports"
  | "statistics"
  | "checks"
  | "current-accounts"
  | "alerts"
  | "chat"
  | "manufacturing"
  | "audit"

const LIST_VIEWS = new Set<PopViewKey>([
  "sale",
  "quotes",
  "purchase-orders",
  "mesas",
  "comandas",
  "mostrador",
  "operations",
  "purchases",
  "expenses",
  "suppliers",
  "invoices",
  "settings",
  "hr",
  "articles",
  "clients",
  "accounts",
  "printers",
  "cash-registers",
  "inventory",
  "recipes",
  "services",
  "cobrar-servicios",
  "promotions",
  "reports",
  "statistics",
  "checks",
  "current-accounts",
  "alerts",
  "chat",
  "manufacturing",
  "audit",
])

export type PopRouteMatch = {
  view: PopViewKey
  moduleKey: string
  params: Record<string, string>
  redirectTo?: string
}

function emptyMatch(
  siteId: string,
  popId: string,
  extra: Partial<PopRouteMatch> = {},
): PopRouteMatch {
  return {
    view: "menu",
    moduleKey: "menu",
    params: { siteId, popId },
    ...extra,
  }
}

export function matchPopRoute(pathname: string): PopRouteMatch {
  const { siteId, popId } = popIdsFromPathname(pathname)
  const parts = pathname.split("/").filter(Boolean)
  const rest = parts.slice(2)

  if (!siteId || !popId) {
    return emptyMatch(siteId, popId)
  }

  if (rest.length === 0) {
    return emptyMatch(siteId, popId, {
      redirectTo: popScopedHref(siteId, popId, "menu"),
    })
  }

  if (isPopMenuPathname(pathname)) {
    return emptyMatch(siteId, popId)
  }

  const [segment, nested] = rest

  if (segment === "active-services") {
    return emptyMatch(siteId, popId, {
      view: "operations",
      moduleKey: "operations",
      redirectTo: popScopedHref(siteId, popId, "operations"),
    })
  }

  if (segment === "accounts") {
    if (!nested) {
      return {
        view: "accounts",
        moduleKey: "accounts",
        params: { siteId, popId },
      }
    }
    return {
      view: "account-detail",
      moduleKey: "accounts",
      params: { siteId, popId, accountId: nested },
    }
  }

  if (segment === "hr") {
    if (!nested) {
      return { view: "hr", moduleKey: "hr", params: { siteId, popId } }
    }
    if (nested === "fichar") {
      return {
        view: "hr-fichar",
        moduleKey: "hr",
        params: { siteId, popId },
      }
    }
    return {
      view: "hr-person",
      moduleKey: "hr",
      params: { siteId, popId, employeeId: nested },
    }
  }

  if (segment === "cash-registers") {
    if (!nested) {
      return {
        view: "cash-registers",
        moduleKey: "cash-registers",
        params: { siteId, popId },
      }
    }
    return {
      view: "cash-register-detail",
      moduleKey: "cash-registers",
      params: { siteId, popId, registerId: nested },
    }
  }

  if (segment && LIST_VIEWS.has(segment as PopViewKey) && rest.length === 1) {
    return {
      view: segment as PopViewKey,
      moduleKey: segment,
      params: { siteId, popId },
    }
  }

  return emptyMatch(siteId, popId, {
    redirectTo: popScopedHref(siteId, popId, "menu"),
  })
}
