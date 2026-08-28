"use client"

import "@/components/statistics/statisticsNavRail.css"
import { InventoryHomeSkeleton } from "@/app/[siteId]/[popId]/inventory/InventoryHomeSkeleton"
import { ExpensePageSkeleton } from "@/app/[siteId]/[popId]/expenses/ExpensePageSkeleton"
import { HrPageSkeleton } from "@/app/[siteId]/[popId]/hr/HrPageSkeleton"
import { PrintersPageSkeleton } from "@/app/[siteId]/[popId]/printers/PrintersPageSkeleton"
import { CashRegistersPageSkeleton } from "@/app/[siteId]/[popId]/cash-registers/CashRegistersGridSkeleton"
import { RootsIconButton } from "@/components/rootsy-button"
import { Plus } from "lucide-react"
import { TreasuryAccountsGridSkeleton } from "@/app/[siteId]/[popId]/accounts/TreasuryAccountsGridSkeleton"
import { ComandasBoardSkeleton } from "@/app/[siteId]/[popId]/comandas/components/ComandasBoard"
import { comandasBrisaPageMainClass } from "@/app/[siteId]/[popId]/comandas/comandasBrisaStyles"
import {
  dataWorkspaceBlocksEmptyStateClass,
  dataWorkspaceBlocksSkeletonTone,
  dataWorkspaceCashRegistersPageMainClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceBlocksSection } from "@/components/data-workspace/DataWorkspaceBlocksSection"
import {
  BlocksModulePageSkeleton,
  OperationsModulePageSkeleton,
} from "@/components/pop-workspace/popModuleSkeletonShell"
import type { PopModuleSkeletonLayout } from "@/components/pop-workspace/popModuleSkeletonShell"
import { PopSettingsSectionLoading } from "@/components/settings/PopSettingsSectionLoading"
import { PopSettingsSectionNav } from "@/components/settings/PopSettingsSectionNav"
import { reportHubGridClass } from "@/components/reports/ReportHubCard"
import { StatisticsModulePageSkeleton as StatisticsModulePageSkeletonView } from "@/components/statistics/StatisticsModulePageSkeleton"
import { MenuSidebar } from "@/components/MenuSidebar"
import { statisticsMainContentClass } from "@/components/statistics/statisticsWorkspaceStyles"
import { OperationsModuleBackdrop } from "@/components/layouts-module/DataWorkspaceOperationsLayout"
import { LayoutsOperarMainGrid } from "@/components/layouts-module/LayoutsOperarMainGrid"
import { SaleCatalogBrowserSkeleton } from "@/components/sale-operation/SaleCatalogBrowserSkeleton"
import { SaleCatalogSidebarNavSkeleton } from "@/components/sale-operation/SaleCatalogSidebarNavSkeleton"
import { SaleCatalogToolbarSkeleton } from "@/components/sale-operation/SaleCatalogToolbarSkeleton"
import { SaleOperationToolboxSkeleton } from "@/components/sale-operation/SaleOperationToolboxSkeleton"
import {
  MesasFloorPlanSkeleton,
  MesasTablePickerListSkeleton,
  MostradorBoardSkeleton,
} from "@/components/sale-operation/OperarChannelCanvasSkeletons"
import {
  layoutsOperarCatalogCanvasBodyClass,
  layoutsOperarCatalogCanvasClass,
  layoutsOperarCatalogCanvasScrollClass,
  layoutsOperarCatalogColumnClass,
  layoutsOperarCatalogSidebarClass,
  layoutsOperarCatalogSidebarOpenClass,
  layoutsOperarSummaryPanelClass,
  layoutsOperarSummaryPanelMobileStackClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { POP_SETTINGS_SECTIONS } from "@/lib/popSettingsCatalog"
import { cn } from "@/lib/utils"

const sk = dataWorkspaceBlocksSkeletonTone

function TicketPanelSkeleton({ listTitle }: { listTitle: string }) {
  return (
    <aside
      className={cn(
        layoutsOperarSummaryPanelClass,
        layoutsOperarSummaryPanelMobileStackClass,
      )}
      aria-label={listTitle}
    >
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <div className="px-4 pt-4">
          <div className={cn(sk.bar, "h-5 w-24")} />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="space-y-2 rounded-xl border border-[var(--rootsy-bruma-200)] p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className={cn(sk.bar, "h-4 w-[58%]")} />
                <div className={cn(sk.barSm, "h-4 w-16")} />
              </div>
              <div className={cn(sk.barSm, "h-3 w-[42%]")} />
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

function OperarCatalogColumnSkeleton() {
  return (
    <div className={layoutsOperarCatalogColumnClass}>
      <MenuSidebar
        collapseBelow={false}
        padded={false}
        fixedWidth={false}
        className={cn(
          "max-md:hidden",
          layoutsOperarCatalogSidebarClass,
          layoutsOperarCatalogSidebarOpenClass,
        )}
        aria-hidden
      >
        <SaleCatalogSidebarNavSkeleton />
      </MenuSidebar>
      <section className={cn(layoutsOperarCatalogCanvasClass, "relative")}>
        <SaleCatalogToolbarSkeleton />
        <div className={layoutsOperarCatalogCanvasBodyClass}>
          <div
            className={cn(
              "min-h-0 h-full",
              layoutsOperarCatalogCanvasScrollClass,
            )}
          >
            <SaleCatalogBrowserSkeleton />
          </div>
        </div>
      </section>
    </div>
  )
}

export function HrModulePageSkeleton(layout: PopModuleSkeletonLayout) {
  return (
    <BlocksModulePageSkeleton
      layout={layout}
      title="Personal"
      mainClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
      contentClassName={null}
    >
      <HrPageSkeleton />
    </BlocksModulePageSkeleton>
  )
}

export function ExpenseModulePageSkeleton(layout: PopModuleSkeletonLayout) {
  return (
    <BlocksModulePageSkeleton layout={layout} title="Gastos">
      <ExpensePageSkeleton />
    </BlocksModulePageSkeleton>
  )
}

export function InventoryModulePageSkeleton(layout: PopModuleSkeletonLayout) {
  return (
    <BlocksModulePageSkeleton layout={layout} title="Inventario">
      <InventoryHomeSkeleton />
    </BlocksModulePageSkeleton>
  )
}

export function CashRegistersModulePageSkeleton(layout: PopModuleSkeletonLayout) {
  return (
    <BlocksModulePageSkeleton
      layout={layout}
      title="Cajas"
      mainClassName={dataWorkspaceCashRegistersPageMainClass}
      contentClassName={null}
      headerActions={
        <RootsIconButton
          label="Nueva caja"
          semantic="primary"
          atmosphere="eter"
          size="default"
          disabled
        >
          <Plus className="size-5" aria-hidden />
        </RootsIconButton>
      }
    >
      <CashRegistersPageSkeleton />
    </BlocksModulePageSkeleton>
  )
}

export function AccountsModulePageSkeleton(layout: PopModuleSkeletonLayout) {
  return (
    <BlocksModulePageSkeleton layout={layout} title="Dinero">
      <TreasuryAccountsGridSkeleton />
    </BlocksModulePageSkeleton>
  )
}

export function PrintersModulePageSkeleton(layout: PopModuleSkeletonLayout) {
  return (
    <BlocksModulePageSkeleton layout={layout} title="Impresoras">
      <PrintersPageSkeleton />
    </BlocksModulePageSkeleton>
  )
}

export function SettingsModulePageSkeleton(layout: PopModuleSkeletonLayout) {
  return (
    <BlocksModulePageSkeleton
      layout={layout}
      title="Ajustes"
      pillLabel="Configuración"
      mainClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
      mainMaxWidthClass="max-w-none"
      contentClassName={null}
    >
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:overflow-hidden">
        <MenuSidebar layout="strip" aria-label="Secciones de ajustes">
          <PopSettingsSectionNav
            sections={POP_SETTINGS_SECTIONS}
            activeSectionId="business"
            onSectionSelect={() => {}}
          />
        </MenuSidebar>
        <div
          className={cn(
            statisticsMainContentClass,
            "min-h-0 flex-1 overflow-y-auto",
          )}
        >
          <PopSettingsSectionLoading label="Cargando datos del negocio…" />
        </div>
      </div>
    </BlocksModulePageSkeleton>
  )
}

export function StatisticsModulePageSkeleton(layout: PopModuleSkeletonLayout) {
  return <StatisticsModulePageSkeletonView {...layout} />
}

export function ReportsModulePageSkeleton(layout: PopModuleSkeletonLayout) {
  return (
    <BlocksModulePageSkeleton
      layout={layout}
      title="Reportes"
      mainMaxWidthClass="max-w-[88rem]"
    >
      <DataWorkspaceBlocksSection>
        <div className={cn(sk.box, "h-11 w-full max-w-md rounded-lg")} />
        <div className={reportHubGridClass}>
          {Array.from({ length: 10 }, (_, index) => (
            <div
              key={index}
              className={cn(sk.box, "h-32 rounded-[1.375rem]")}
            />
          ))}
        </div>
      </DataWorkspaceBlocksSection>
    </BlocksModulePageSkeleton>
  )
}

function ComingSoonModulePageSkeleton({
  layout,
  title,
  description,
}: {
  layout: PopModuleSkeletonLayout
  title: string
  description: string
}) {
  return (
    <BlocksModulePageSkeleton
      layout={layout}
      title={title}
      pillLabel="Próximamente"
      mainClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
      contentClassName={null}
    >
      <div className={dataWorkspaceBlocksEmptyStateClass}>
        <p className="text-base font-medium text-foreground">{title}</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </BlocksModulePageSkeleton>
  )
}

const COMING_SOON_COPY =
  "Esta pantalla todavía no está lista. El módulo ya existe: se puede dar permiso en RRHH y va a aparecer en el menú."

export function AlertsModulePageSkeleton(layout: PopModuleSkeletonLayout) {
  return (
    <ComingSoonModulePageSkeleton
      layout={layout}
      title="Alertas"
      description={COMING_SOON_COPY}
    />
  )
}

export function ComandasModulePageSkeleton(layout: PopModuleSkeletonLayout) {
  return (
    <BlocksModulePageSkeleton
      layout={layout}
      title="Comandas"
      mainClassName={comandasBrisaPageMainClass}
      contentClassName={null}
    >
      <ComandasBoardSkeleton />
    </BlocksModulePageSkeleton>
  )
}

function OperarCatalogModulePageSkeleton({
  layout,
  title,
  ticketTitle,
}: {
  layout: PopModuleSkeletonLayout
  title: string
  ticketTitle: string
}) {
  return (
    <OperationsModulePageSkeleton layout={layout} title={title}>
      <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden">
        <OperationsModuleBackdrop />
        <LayoutsOperarMainGrid
          catalog={<OperarCatalogColumnSkeleton />}
          toolbox={<SaleOperationToolboxSkeleton />}
          ticket={<TicketPanelSkeleton listTitle={ticketTitle} />}
        />
      </div>
    </OperationsModulePageSkeleton>
  )
}

export function SaleModulePageSkeleton(layout: PopModuleSkeletonLayout) {
  return (
    <OperarCatalogModulePageSkeleton
      layout={layout}
      title="Vender"
      ticketTitle="Pedido"
    />
  )
}

export function PurchasesModulePageSkeleton(layout: PopModuleSkeletonLayout) {
  return (
    <OperarCatalogModulePageSkeleton
      layout={layout}
      title="Comprar"
      ticketTitle="Compra"
    />
  )
}

export function CobrarServiciosModulePageSkeleton(
  layout: PopModuleSkeletonLayout,
) {
  return (
    <OperarCatalogModulePageSkeleton
      layout={layout}
      title="Vender servicio"
      ticketTitle="Servicio"
    />
  )
}

export function MesasModulePageSkeleton(layout: PopModuleSkeletonLayout) {
  return (
    <OperationsModulePageSkeleton layout={layout} title="Mesas">
      <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden">
        <OperationsModuleBackdrop />
        <LayoutsOperarMainGrid
          mobileHomeLabel="Mesas"
          mobileHome={
            <section className={cn(layoutsOperarCatalogColumnClass, "flex-col")}>
              <div
                className={cn(
                  layoutsOperarCatalogCanvasClass,
                  "[grid-template-rows:minmax(0,1fr)]",
                )}
              >
                <MesasTablePickerListSkeleton />
              </div>
            </section>
          }
          catalog={
            <section className={cn(layoutsOperarCatalogColumnClass, "flex-col")}>
              <div
                className={cn(
                  layoutsOperarCatalogCanvasClass,
                  "[grid-template-rows:minmax(0,1fr)]",
                )}
              >
                <MesasFloorPlanSkeleton />
              </div>
            </section>
          }
          ticket={
            <aside className={layoutsOperarSummaryPanelClass} aria-hidden>
              <div className="space-y-3 p-4">
                <div className={cn(sk.bar, "h-4 w-28")} />
                <div className={cn(sk.box, "h-40")} />
                <div className={cn(sk.box, "h-24")} />
              </div>
            </aside>
          }
        />
      </div>
    </OperationsModulePageSkeleton>
  )
}

export function MostradorModulePageSkeleton(layout: PopModuleSkeletonLayout) {
  return (
    <OperationsModulePageSkeleton layout={layout} title="Mostrador">
      <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden">
        <OperationsModuleBackdrop />
        <LayoutsOperarMainGrid
          mobileHomeLabel="Mostrador"
          mobileHome={
            <section className={cn(layoutsOperarCatalogColumnClass, "flex-col")}>
              <div
                className={cn(
                  layoutsOperarCatalogCanvasClass,
                  "[grid-template-rows:minmax(0,1fr)]",
                )}
              >
                <MostradorBoardSkeleton />
              </div>
            </section>
          }
          catalog={
            <section className={cn(layoutsOperarCatalogColumnClass, "flex-col")}>
              <div
                className={cn(
                  layoutsOperarCatalogCanvasClass,
                  "[grid-template-rows:minmax(0,1fr)]",
                )}
              >
                <MostradorBoardSkeleton />
              </div>
            </section>
          }
          ticket={
            <aside className={layoutsOperarSummaryPanelClass} aria-hidden>
              <div className="space-y-3 p-4">
                <div className={cn(sk.bar, "h-4 w-32")} />
                <div className={cn(sk.box, "h-48")} />
              </div>
            </aside>
          }
        />
      </div>
    </OperationsModulePageSkeleton>
  )
}

