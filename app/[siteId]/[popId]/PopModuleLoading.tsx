"use client"

import { MenuPageSkeleton } from "@/app/[siteId]/[popId]/menu/MenuPageSkeleton"
import {
  DataWorkspaceTableListPage,
  DataWorkspaceTableListNatureShell,
} from "@/components/data-workspace/DataWorkspaceTableListLayout"
import { DataWorkspaceTableListLoadingBody } from "@/components/data-workspace/DataWorkspaceTableListLoadingBody"
import { isPopTableListModule } from "@/components/data-workspace/popTableListSkeletonConfig"
import { getPopModulePageSkeleton } from "@/components/pop-workspace/popModuleSkeletons"
import { usePopWorkspaceOptional } from "@/context/PopWorkspaceContext"
import { usePopAccessData } from "@/hooks/usePopAccessData"
import { usePopMenuCache } from "@/hooks/usePopMenuCache"
import { buildUserProfileFullName } from "@/app/home/homeUserDataResolve"
import { buildPopRoleLabel } from "@/lib/popWorkspaceFromAccess"
import { prefetchComandasWorkspaceQuery } from "@/lib/comandasWorkspaceQuery"
import { prefetchCashRegistersListQuery } from "@/lib/cashRegistersListQuery"
import { prefetchAuditWorkspaceQuery } from "@/lib/auditWorkspaceQuery"
import { prefetchChatWorkspaceQuery } from "@/lib/chatWorkspaceQuery"
import { prefetchCurrentAccountsWorkspaceQuery } from "@/lib/currentAccountsWorkspaceQuery"
import { prefetchPrintersWorkspaceQuery } from "@/lib/printersWorkspaceQuery"
import { prefetchSettingsWorkspaceQuery } from "@/lib/settingsWorkspaceQuery"
import { prefetchExpensesWorkspaceQuery } from "@/lib/expensesWorkspaceQuery"
import { prefetchInventoryWorkspaceQuery } from "@/lib/inventoryWorkspaceQuery"
import { prefetchManufacturingWorkspaceQuery } from "@/lib/manufacturingWorkspaceQuery"
import { prefetchHrDashboardQuery } from "@/lib/hrDashboardQuery"
import { prefetchMesasWorkspaceQuery } from "@/lib/mesasWorkspaceQuery"
import { prefetchMostradorWorkspaceQuery } from "@/lib/mostradorWorkspaceQuery"
import { prefetchPurchaseWorkspaceQuery } from "@/lib/purchaseWorkspaceQuery"
import { prefetchSaleWorkspaceQuery } from "@/lib/saleWorkspaceQuery"
import { prefetchServiceOperateWorkspaceQuery } from "@/lib/serviceOperateWorkspaceQuery"
import { prefetchTreasuryAccountsListQuery } from "@/lib/treasuryAccountsListQuery"
import { popModuleKeyFromPath } from "@/lib/popRoutes"
import { useParams, usePathname } from "@/lib/pop-spa/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

const MODULE_TITLES: Record<string, string> = {
  clients: "Clientes",
  suppliers: "Proveedores",
  articles: "Artículos",
  operations: "Operaciones",
  invoices: "Facturas",
  checks: "Cheques",
  recipes: "Recetas",
  promotions: "Promociones",
  services: "Servicios",
  "current-accounts": "Cuentas corrientes",
  quotes: "Presupuestos",
  "purchase-orders": "Órdenes de compra",
  "cash-registers": "Cajas",
  accounts: "Dinero",
  expenses: "Gastos",
  inventory: "Inventario",
  hr: "Personal",
  printers: "Impresoras",
  settings: "Ajustes",
  reports: "Reportes",
  statistics: "Estadísticas",
  sale: "Vender",
  purchases: "Comprar",
  mesas: "Mesas",
  comandas: "Comandas",
  mostrador: "Mostrador",
  "cobrar-servicios": "Vender servicio",
  alerts: "Alertas",
  chat: "Chat",
  manufacturing: "Fabricar",
  audit: "Auditoría",
}

function moduleKeyFromPathname(pathname: string): string {
  return popModuleKeyFromPath(pathname)
}

export function PopModuleLoading({
  title: titleProp,
  moduleKey: moduleKeyProp,
}: {
  title?: string
  /** Destino mientras baja el chunk (p. ej. primer salto SPA, outlet aún null). */
  moduleKey?: string
}) {
  const params = useParams()
  const pathname = usePathname()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : ""
  const workspace = usePopWorkspaceOptional()
  const menuCache = usePopMenuCache(popId)
  const accessQuery = usePopAccessData(popId, { enabled: Boolean(popId) })

  const popAccess =
    workspace?.popAccess ?? menuCache.popAccess ?? accessQuery.popAccess
  const profile = menuCache.profile ?? accessQuery.profile
  const popName =
    workspace?.bootstrap?.popName ??
    menuCache.popAccess?.pop.name ??
    popAccess?.pop.name ??
    ""
  const userName =
    workspace?.bootstrap?.userFullName ||
    menuCache.profileFullName ||
    (profile ? buildUserProfileFullName(profile) : "")
  const userAvatarSrc =
    workspace?.bootstrap?.userImageUrl ??
    menuCache.profile?.imageUrl ??
    profile?.imageUrl ??
    undefined
  const userRoleLabel =
    workspace?.bootstrap?.roleLabel ||
    menuCache.roleLabel ||
    (popAccess ? buildPopRoleLabel(popAccess) : "")
  const moduleKey = moduleKeyProp ?? moduleKeyFromPathname(pathname)
  const moduleTitle = MODULE_TITLES[moduleKey] ?? "…"
  const title = titleProp ?? moduleTitle
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!popId) return
    if (moduleKey === "hr") {
      void prefetchHrDashboardQuery(popId, queryClient)
      return
    }
    if (moduleKey === "cash-registers") {
      void prefetchCashRegistersListQuery(popId, queryClient)
      return
    }
    if (moduleKey === "accounts") {
      void prefetchTreasuryAccountsListQuery(popId, queryClient)
      return
    }
    if (moduleKey === "sale") {
      void prefetchSaleWorkspaceQuery(popId, queryClient)
      return
    }
    if (moduleKey === "mostrador") {
      void prefetchMostradorWorkspaceQuery(popId, queryClient)
      return
    }
    if (moduleKey === "mesas") {
      void prefetchMesasWorkspaceQuery(popId, queryClient)
      return
    }
    if (moduleKey === "purchases") {
      void prefetchPurchaseWorkspaceQuery(popId, queryClient)
      return
    }
    if (moduleKey === "cobrar-servicios") {
      void prefetchServiceOperateWorkspaceQuery(popId, queryClient)
      return
    }
    if (moduleKey === "comandas") {
      void prefetchComandasWorkspaceQuery(popId, queryClient)
      return
    }
    if (moduleKey === "expenses") {
      void prefetchExpensesWorkspaceQuery(popId, queryClient)
      return
    }
    if (moduleKey === "inventory") {
      void prefetchInventoryWorkspaceQuery(popId, queryClient)
      return
    }
    if (moduleKey === "manufacturing") {
      void prefetchManufacturingWorkspaceQuery(popId, queryClient)
      return
    }
    if (moduleKey === "current-accounts") {
      void prefetchCurrentAccountsWorkspaceQuery(popId, queryClient)
      return
    }
    if (moduleKey === "settings") {
      void prefetchSettingsWorkspaceQuery(popId, queryClient)
      return
    }
    if (moduleKey === "audit") {
      void prefetchAuditWorkspaceQuery(popId, queryClient)
      return
    }
    if (moduleKey === "printers") {
      void prefetchPrintersWorkspaceQuery(popId, queryClient)
      return
    }
    if (moduleKey === "chat") {
      void prefetchChatWorkspaceQuery(popId, queryClient)
    }
  }, [moduleKey, popId, queryClient])

  if (moduleKey === "menu") {
    return <MenuPageSkeleton />
  }

  const customPage = getPopModulePageSkeleton(moduleKey)
  if (customPage) {
    return (
      <>
        {customPage.renderPage({
          siteId,
          popId,
          popName,
          title: moduleTitle,
          userName,
          userAvatarSrc,
          userRoleLabel,
          headerLoading: !popName,
        })}
      </>
    )
  }

  return (
    <DataWorkspaceTableListPage
      layout={{
        siteId,
        popId,
        popName,
        title,
        loading: !popName,
        userName,
        userAvatarSrc,
        userRoleLabel,
      }}
    >
      <DataWorkspaceTableListNatureShell>
        {isPopTableListModule(moduleKey) ? (
          <DataWorkspaceTableListLoadingBody moduleKey={moduleKey} title={title} />
        ) : (
          <div
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <span className="sr-only">Cargando {title}</span>
            <div className="h-11 animate-pulse rounded-lg bg-rootsy-bruma-200" />
            <div className="min-h-0 flex-1 animate-pulse rounded-2xl bg-rootsy-bruma-200" />
          </div>
        )}
      </DataWorkspaceTableListNatureShell>
    </DataWorkspaceTableListPage>
  )
}
