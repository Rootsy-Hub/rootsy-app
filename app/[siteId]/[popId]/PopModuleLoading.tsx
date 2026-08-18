"use client"

import {
  DataWorkspaceTableListPage,
  DataWorkspaceTableListNatureShell,
} from "@/components/data-workspace/DataWorkspaceTableListLayout"
import { usePopWorkspaceOptional } from "@/context/PopWorkspaceContext"
import { usePopAccessData } from "@/hooks/usePopAccessData"
import { buildUserProfileFullName } from "@/app/home/homeUserDataResolve"
import { buildPopRoleLabel } from "@/lib/popWorkspaceFromAccess"
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
  "active-services": "Servicios activos",
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
  accounting: "Contabilidad",
  reports: "Reportes",
  statistics: "Estadísticas",
  sale: "Vender",
  purchases: "Comprar",
  mesas: "Mesas",
  mostrador: "Mostrador",
  "cobrar-servicios": "Cobrar servicios",
}

function moduleKeyFromPathname(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean)
  return parts[2] ?? ""
}

export function PopModuleLoading() {
  const params = useParams()
  const pathname = usePathname()
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
  const title = MODULE_TITLES[moduleKeyFromPathname(pathname)] ?? "…"

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
        <div
          className="flex min-h-0 flex-1 flex-col gap-3 p-4"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <span className="sr-only">Cargando {title}</span>
          <div className="h-11 animate-pulse rounded-lg bg-white/35" />
          <div className="min-h-0 flex-1 animate-pulse rounded-2xl bg-white/25" />
        </div>
      </DataWorkspaceTableListNatureShell>
    </DataWorkspaceTableListPage>
  )
}
