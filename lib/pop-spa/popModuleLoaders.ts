"use client"

import {
  lazy,
  type ComponentType,
  type LazyExoticComponent,
} from "react"
import { prefetchCashRegistersListQuery } from "@/lib/cashRegistersListQuery"
import { prefetchHrDashboardQuery } from "@/lib/hrDashboardQuery"
import { prefetchTreasuryAccountsListQuery } from "@/lib/treasuryAccountsListQuery"
import type { PopViewKey } from "@/lib/pop-spa/matchPopRoute"
import { matchPopRoute } from "@/lib/pop-spa/matchPopRoute"
import { bindPopSpaPreload } from "@/lib/pop-spa/preload"

type Loader = () => Promise<{ default: ComponentType }>

const LOADERS: Record<PopViewKey, Loader> = {
  menu: () => import("./chunks/menu").then((m) => m.default()),
  sale: () => import("./chunks/sale").then((m) => m.default()),
  quotes: () => import("./chunks/quotes").then((m) => m.default()),
  "purchase-orders": () =>
    import("./chunks/purchase-orders").then((m) => m.default()),
  mesas: () => import("./chunks/mesas").then((m) => m.default()),
  comandas: () => import("./chunks/comandas").then((m) => m.default()),
  mostrador: () => import("./chunks/mostrador").then((m) => m.default()),
  operations: () => import("./chunks/operations").then((m) => m.default()),
  purchases: () => import("./chunks/purchases").then((m) => m.default()),
  expenses: () => import("./chunks/expenses").then((m) => m.default()),
  suppliers: () => import("./chunks/suppliers").then((m) => m.default()),
  invoices: () => import("./chunks/invoices").then((m) => m.default()),
  settings: () => import("./chunks/settings").then((m) => m.default()),
  hr: () =>
    Promise.all([
      import("./chunks/hr").then((m) => m.default()),
      prefetchHrDashboardQuery(
        typeof window === "undefined"
          ? ""
          : matchPopRoute(window.location.pathname).params.popId,
      ),
    ]).then(([mod]) => mod),
  "hr-fichar": () => import("./chunks/hr-fichar").then((m) => m.default()),
  "hr-person": () => import("./chunks/hr-person").then((m) => m.default()),
  articles: () => import("./chunks/articles").then((m) => m.default()),
  clients: () => import("./chunks/clients").then((m) => m.default()),
  accounts: () =>
    Promise.all([
      import("./chunks/accounts").then((m) => m.default()),
      prefetchTreasuryAccountsListQuery(
        typeof window === "undefined"
          ? ""
          : matchPopRoute(window.location.pathname).params.popId,
      ),
    ]).then(([mod]) => mod),
  "account-detail": () =>
    import("./chunks/account-detail").then((m) => m.default()),
  printers: () => import("./chunks/printers").then((m) => m.default()),
  "cash-registers": () =>
    Promise.all([
      import("./chunks/cash-registers").then((m) => m.default()),
      prefetchCashRegistersListQuery(
        typeof window === "undefined"
          ? ""
          : matchPopRoute(window.location.pathname).params.popId,
      ),
    ]).then(([mod]) => mod),
  "cash-register-detail": () =>
    import("./chunks/cash-register-detail").then((m) => m.default()),
  inventory: () => import("./chunks/inventory").then((m) => m.default()),
  recipes: () => import("./chunks/recipes").then((m) => m.default()),
  services: () => import("./chunks/services").then((m) => m.default()),
  "cobrar-servicios": () =>
    import("./chunks/cobrar-servicios").then((m) => m.default()),
  promotions: () => import("./chunks/promotions").then((m) => m.default()),
  reports: () => import("./chunks/reports").then((m) => m.default()),
  statistics: () => import("./chunks/statistics").then((m) => m.default()),
  checks: () => import("./chunks/checks").then((m) => m.default()),
  "current-accounts": () =>
    import("./chunks/current-accounts").then((m) => m.default()),
  alerts: () => import("./chunks/alerts").then((m) => m.default()),
  chat: () => import("./chunks/chat").then((m) => m.default()),
  manufacturing: () =>
    import("./chunks/manufacturing").then((m) => m.default()),
  audit: () => import("./chunks/audit").then((m) => m.default()),
}

const viewCache = new Map<PopViewKey, LazyExoticComponent<ComponentType>>()
const loadCache = new Map<PopViewKey, ReturnType<Loader>>()

function loadView(view: PopViewKey) {
  const cached = loadCache.get(view)
  if (cached) return cached
  const pending = LOADERS[view]()
  loadCache.set(view, pending)
  return pending
}

export function getPopSpaView(view: PopViewKey) {
  const cached = viewCache.get(view)
  if (cached) return cached
  const Comp = lazy(() => loadView(view))
  viewCache.set(view, Comp)
  return Comp
}

export function preloadPopView(view: PopViewKey) {
  getPopSpaView(view)
  void loadView(view)
}

export function preloadPopViewFromHref(href: string) {
  const path = href.split(/[?#]/)[0] ?? href
  const match = matchPopRoute(path)
  if (match.redirectTo) return
  preloadPopView(match.view)
  if (match.view === "hr") {
    void prefetchHrDashboardQuery(match.params.popId)
  }
  if (match.view === "cash-registers") {
    void prefetchCashRegistersListQuery(match.params.popId)
  }
  if (match.view === "accounts") {
    void prefetchTreasuryAccountsListQuery(match.params.popId)
  }
}

export const POP_IDLE_PRELOAD_VIEWS: readonly PopViewKey[] = [
  "sale",
  "mesas",
  "articles",
  "settings",
]

bindPopSpaPreload({
  href: preloadPopViewFromHref,
  idle: () => {
    for (const view of POP_IDLE_PRELOAD_VIEWS) preloadPopView(view)
  },
})
