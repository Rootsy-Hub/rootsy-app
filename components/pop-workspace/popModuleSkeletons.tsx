import { ChatModulePageSkeleton } from "@/app/[siteId]/[popId]/chat/ChatWorkspaceSkeleton"
import {
  AccountsModulePageSkeleton,
  AlertsModulePageSkeleton,
  CashRegistersModulePageSkeleton,
  CobrarServiciosModulePageSkeleton,
  ComandasModulePageSkeleton,
  ExpenseModulePageSkeleton,
  HrModulePageSkeleton,
  InventoryModulePageSkeleton,
  MesasModulePageSkeleton,
  MostradorModulePageSkeleton,
  PrintersModulePageSkeleton,
  PurchasesModulePageSkeleton,
  ReportsModulePageSkeleton,
  SaleModulePageSkeleton,
  SettingsModulePageSkeleton,
  StatisticsModulePageSkeleton,
} from "@/components/pop-workspace/popModulePageSkeletons"
import type { PopModuleSkeletonLayout } from "@/components/pop-workspace/popModuleSkeletonShell"
import type { ReactNode } from "react"

export type { PopModuleSkeletonLayout }

type PopModulePageSkeleton = {
  renderPage: (layout: PopModuleSkeletonLayout) => ReactNode
}

function page(
  render: (layout: PopModuleSkeletonLayout) => ReactNode,
): PopModulePageSkeleton {
  return { renderPage: render }
}

/**
 * Esqueleto de página que cada módulo usa al entrar.
 * El portero lo pinta antes de montar la vista.
 */
const POP_MODULE_PAGE_SKELETONS: Record<string, PopModulePageSkeleton> = {
  chat: page((layout) => (
    <ChatModulePageSkeleton
      siteId={layout.siteId}
      popId={layout.popId}
      popName={layout.popName}
      userName={layout.userName}
      userAvatarSrc={layout.userAvatarSrc}
      userRoleLabel={layout.userRoleLabel}
      headerLoading={layout.headerLoading}
    />
  )),
  hr: page(HrModulePageSkeleton),
  expenses: page(ExpenseModulePageSkeleton),
  inventory: page(InventoryModulePageSkeleton),
  "cash-registers": page(CashRegistersModulePageSkeleton),
  accounts: page(AccountsModulePageSkeleton),
  printers: page(PrintersModulePageSkeleton),
  settings: page(SettingsModulePageSkeleton),
  statistics: page(StatisticsModulePageSkeleton),
  reports: page(ReportsModulePageSkeleton),
  sale: page(SaleModulePageSkeleton),
  purchases: page(PurchasesModulePageSkeleton),
  "cobrar-servicios": page(CobrarServiciosModulePageSkeleton),
  mesas: page(MesasModulePageSkeleton),
  comandas: page(ComandasModulePageSkeleton),
  mostrador: page(MostradorModulePageSkeleton),
  alerts: page(AlertsModulePageSkeleton),
}

export function getPopModulePageSkeleton(
  moduleKey: string,
): PopModulePageSkeleton | null {
  return POP_MODULE_PAGE_SKELETONS[moduleKey] ?? null
}
