"use client"

import { MenuPageSkeleton } from "@/app/[siteId]/[popId]/menu/MenuPageSkeleton"
import {
  DataWorkspaceTableListPage,
  DataWorkspaceTableListNatureShell,
} from "@/components/data-workspace/DataWorkspaceTableListLayout"
import { DataWorkspaceTableListLoadingBody } from "@/components/data-workspace/DataWorkspaceTableListLoadingBody"
import { isPopTableListModule } from "@/components/data-workspace/popTableListSkeletonConfig"
import { usePopWorkspaceOptional } from "@/context/PopWorkspaceContext"
import { usePopAccessData } from "@/hooks/usePopAccessData"
import { buildUserProfileFullName } from "@/app/home/homeUserDataResolve"
import { buildPopRoleLabel } from "@/lib/popWorkspaceFromAccess"
import { hasPopTableListSessionCache } from "@/lib/popTableListSessionCache"
import { popModuleKeyFromPath, isPopMenuPathname } from "@/lib/popRoutes"
import { useQueryClient } from "@tanstack/react-query"
import { useParams, usePathname } from "next/navigation"

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
  accounts: "Cuentas",
  expenses: "Gastos",
  inventory: "Inventario",
  hr: "RRHH",
  printers: "Impresoras",
  settings: "Ajustes",
  reports: "Reportes",
  statistics: "Estadísticas",
  sale: "Vender",
  purchases: "Comprar",
  mesas: "Mesas",
  comandas: "Comandas",
  mostrador: "Mostrador",
  "cobrar-servicios": "Cobrar servicios",
}

function moduleKeyFromPathname(pathname: string): string {
  return popModuleKeyFromPath(pathname)
}

export function PopModuleLoading({
  title: titleProp,
  moduleKey: moduleKeyProp,
}: {
  title?: string
  /** Destino real al navegar optimista (pathname puede seguir en /menu). */
  moduleKey?: string
}) {
  const params = useParams()
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : ""
  const workspace = usePopWorkspaceOptional()
  const accessQuery = usePopAccessData(popId, { enabled: Boolean(popId) })

  const popAccess = workspace?.popAccess ?? accessQuery.popAccess
  const profile = accessQuery.profile
  const popName =
    workspace?.bootstrap?.popName ?? popAccess?.pop.name ?? ""
  const userName =
    workspace?.bootstrap?.userFullName ||
    (profile ? buildUserProfileFullName(profile) : "")
  const userAvatarSrc =
    workspace?.bootstrap?.userImageUrl ?? profile?.imageUrl ?? undefined
  const userRoleLabel =
    workspace?.bootstrap?.roleLabel ||
    (popAccess ? buildPopRoleLabel(popAccess) : "")
  const title =
    titleProp ?? MODULE_TITLES[moduleKeyProp ?? moduleKeyFromPathname(pathname)] ?? "…"
  const moduleKey = moduleKeyProp ?? moduleKeyFromPathname(pathname)

  if (moduleKey === "menu" || isPopMenuPathname(pathname)) {
    return <MenuPageSkeleton />
  }

  if (hasPopTableListSessionCache(queryClient, popId, moduleKey)) {
    return null
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
            className="flex min-h-0 flex-1 flex-col gap-3 p-4"
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
