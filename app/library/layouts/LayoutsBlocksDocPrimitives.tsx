"use client"

import { TreasuryAccountCard } from "@/app/[siteId]/[popId]/accounts/TreasuryAccountCard"
import { TreasuryAccountsGridSkeleton } from "@/app/[siteId]/[popId]/accounts/TreasuryAccountsGridSkeleton"
import { CashRegisterCard } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterCard"
import { CashRegistersGridSkeleton } from "@/app/[siteId]/[popId]/cash-registers/CashRegistersGridSkeleton"
import {
  DEMO_CASH_REGISTERS,
  DEMO_TREASURY_ACCOUNTS,
} from "@/app/library/layouts/layoutsBlocksMockData"
import {
  LAYOUTS_BLOCKS_LAYOUT_SPEC_ROWS,
} from "@/app/library/layouts/layoutsBlocksHardcodedSpec"
import {
  LAYOUTS_BLOCKS_EMPTY_STATE_DEMO_COPY,
  LAYOUTS_BLOCKS_EMPTY_STATE_SPEC_ROWS,
} from "@/app/library/layouts/layoutsBlocksEmptyStateSpec"
import { LayoutsModuleShellWithContent } from "@/app/library/layouts/LayoutsModuleDocPrimitives"
import {
  LayoutsTablesHeaderLeftZone,
  LayoutsTablesHeaderRightZone,
} from "@/app/library/layouts/LayoutsTablesDocPrimitives"
import { LayoutsTablesNightForestSurface } from "@/app/library/layouts/LayoutsTablesNightForestSurface"
import "@/app/library/color/rootsyNaturePalette.css"
import { FoundationSpecCard } from "@/app/library/libraryFoundationDocShared"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import { DataWorkspaceHeaderTitle } from "@/components/layouts/DataWorkspaceHeaderTitle"
import { layoutsModuleContentShellClass } from "@/components/layouts-module/rootsLayoutsModuleProductStyles"
import {
  dataWorkspaceBlocksContentInnerClass,
  dataWorkspaceBlocksEmptyStateClass,
  dataWorkspaceBlocksSkeletonTone,
  dataWorkspaceEntityCardBodyClass,
  dataWorkspaceEntityCardClass,
  dataWorkspaceEntityCardFooterClass,
  dataWorkspaceEntityCardHeaderClass,
  dataWorkspaceEntityCardsGridClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
import { Banknote, History, List } from "lucide-react"
import type { ReactNode } from "react"

const sk = dataWorkspaceBlocksSkeletonTone
const HEADER_VARIANT = "dark" as const
const noop = () => {}

function LayoutHeightBadge({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute right-2 top-1.5 z-20 rounded-md bg-background/95 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground ring-1 ring-border/60">
      {label}
    </span>
  )
}

export function LayoutsBlocksDocSubsection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h4 className="font-canopy text-sm font-semibold text-foreground">{title}</h4>
        {description ? (
          <p className="font-canopy text-xs leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  )
}

/** Fondo layout.module.content · bruma-50 — tokens light como en producto (cuentas/cajas). */
function LayoutsBlocksModuleContentScope({
  children,
  className,
  badge,
}: {
  children: ReactNode
  className?: string
  badge?: string
}) {
  return (
    <div
      className={cn(
        "relative min-h-0 flex-1 rootsy-app-light rootsy-nature-palette text-foreground",
        layoutsModuleContentShellClass,
        className,
      )}
    >
      {badge ? <LayoutHeightBadge label={badge} /> : null}
      <div className={dataWorkspaceBlocksContentInnerClass}>{children}</div>
    </div>
  )
}

function LayoutsBlocksHeaderDemo({ composed = false }: { composed?: boolean }) {
  return (
    <LayoutsTablesNightForestSurface
      className={cn(composed ? "h-17 shrink-0" : "overflow-hidden rounded-xl")}
      contentClassName={composed ? "h-full" : undefined}
    >
      <div className={cn("grid h-full grid-cols-3 items-center gap-4 px-4", !composed && "h-18")}>
        <LayoutsTablesHeaderLeftZone />
        <div className="flex flex-wrap items-center justify-center gap-2">
          <DataWorkspaceHeaderTitle title="Cuentas" headerVariant={HEADER_VARIANT} />
        </div>
        <LayoutsTablesHeaderRightZone />
      </div>
    </LayoutsTablesNightForestSurface>
  )
}

function LayoutsBlocksWireframeCard({ index }: { index: number }) {
  return (
    <div
      className={cn(
        dataWorkspaceEntityCardClass,
        "pointer-events-none min-h-52 shadow-sm hover:shadow-sm",
      )}
    >
      <div className={dataWorkspaceEntityCardHeaderClass}>
        <div className="flex items-start gap-3">
          <div className={cn("size-11 shrink-0 rounded-xl", sk.box)} />
          <div className="min-w-0 flex-1 space-y-2">
            <div className={cn("h-2.5 w-16 rounded-full", sk.pill)} />
            <div className={cn("h-5 w-28", sk.bar)} />
          </div>
        </div>
      </div>
      <div className={dataWorkspaceEntityCardBodyClass}>
        <div className={cn("h-2.5 w-20 rounded-full", sk.pill)} />
        <div className={cn("mt-2 h-8 w-32", sk.bar)} />
      </div>
      <div className={cn("min-h-16 px-4 py-4", dataWorkspaceEntityCardFooterClass)}>
        <div className="grid grid-cols-2 gap-3">
          <div className={cn("h-6", sk.barSm)} />
          <div className={cn("h-6", sk.barSm)} />
        </div>
      </div>
      <span className="sr-only">Bloque {index + 1}</span>
    </div>
  )
}

export function LayoutsBlocksLayoutSpecTable() {
  return (
    <FoundationSpecCard className="space-y-4">
      <p className="font-canopy text-xs leading-relaxed text-muted-foreground">
        Grid auto-fill al 100% de ancho: mínimo 18rem por bloque, columnas fluidas en{" "}
        <span className="font-mono">1fr</span> según el espacio disponible.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-border/70">
              {["Rol", "Token", "Valor", "Producto"].map((heading) => (
                <th
                  key={heading}
                  className="px-2 py-2 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground first:pl-0"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LAYOUTS_BLOCKS_LAYOUT_SPEC_ROWS.map((row) => (
              <tr key={`${row.role}-${row.token}`} className="border-b border-border/40 align-top">
                <td className="py-2.5 pr-3 font-canopy text-xs font-medium text-foreground">{row.role}</td>
                <td className="py-2.5 pr-3 font-mono text-[11px] text-muted-foreground">{row.token}</td>
                <td className="max-w-[14rem] py-2.5 pr-3 font-mono text-[10px] leading-relaxed break-all text-foreground">
                  {row.value}
                </td>
                <td className="py-2.5 font-canopy text-[11px] leading-relaxed text-muted-foreground">
                  {row.product}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FoundationSpecCard>
  )
}

function LayoutsBlocksPreviewCardsGrid() {
  return (
    <div className={dataWorkspaceEntityCardsGridClass}>
      {DEMO_TREASURY_ACCOUNTS.map((row) => (
        <TreasuryAccountCard
          key={row.id}
          row={row}
          canCreate
          canUpdate
          canDelete
          detailHref="#"
          onMenuAction={noop}
        />
      ))}
      {DEMO_CASH_REGISTERS.slice(0, 2).map((row) => (
        <CashRegisterCard
          key={row.id}
          row={row}
          canCreate
          canUpdate
          canDelete
          detailHref="#"
          onEdit={noop}
          onDelete={noop}
          onOpen={noop}
          onClose={noop}
          onDeposit={noop}
          onWithdraw={noop}
        />
      ))}
    </div>
  )
}

/** Vista previa — bloques dentro del shell módulo completo. */
export function LayoutsBlocksModulePreviewDemo() {
  return (
    <LayoutsModuleShellWithContent
      height="34rem"
      contentLabel="layout.module.content · bloques"
    >
      <LayoutsBlocksFullPageDraft composed />
    </LayoutsModuleShellWithContent>
  )
}

/** 1 · Layout — fondo bruma-50 + grid responsivo con bloques wireframe. */
export function LayoutsBlocksLayoutSectionDemo() {
  return (
    <div className="space-y-6">
      <LayoutsBlocksLayoutSpecTable />
      <div
        className={cn(
          "mx-auto flex max-w-5xl flex-col overflow-hidden rounded-2xl border border-[var(--rootsy-bruma-200)]",
          "rootsy-app-light rootsy-nature-palette",
          layoutsModuleContentShellClass,
        )}
        style={{ minHeight: "20rem" }}
      >
        <LayoutsBlocksModuleContentScope badge="grid · auto-fill · min 18rem · max 22rem">
          <div className={dataWorkspaceEntityCardsGridClass}>
            {Array.from({ length: 8 }, (_, index) => (
              <LayoutsBlocksWireframeCard key={index} index={index} />
            ))}
          </div>
        </LayoutsBlocksModuleContentScope>
      </div>
    </div>
  )
}

function LayoutsBlocksTreasuryCardsGrid() {
  return (
    <div className={dataWorkspaceEntityCardsGridClass}>
      {DEMO_TREASURY_ACCOUNTS.map((row) => (
        <TreasuryAccountCard
          key={row.id}
          row={row}
          canCreate
          canUpdate
          canDelete
          detailHref="#"
          onMenuAction={noop}
        />
      ))}
    </div>
  )
}

function LayoutsBlocksCashRegisterCardsGrid() {
  return (
    <div className={dataWorkspaceEntityCardsGridClass}>
      {DEMO_CASH_REGISTERS.map((row) => (
        <CashRegisterCard
          key={row.id}
          row={row}
          canCreate
          canUpdate
          canDelete
          detailHref="#"
          onEdit={noop}
          onDelete={noop}
          onOpen={noop}
          onClose={noop}
          onDeposit={noop}
          onWithdraw={noop}
        />
      ))}
    </div>
  )
}

/** 2 · Diseño de caja y cuentas — variantes en bruma-50. */
export function LayoutsBlocksEntityDesignSectionDemo() {
  return (
    <div className="space-y-8">
      <LayoutsBlocksDocSubsection
        title="Cuentas · treasury"
        description="Loseta interactiva — elevation.shadow.raised · hover raised · cabecera · saldo · liquidaciones."
      >
        <div
          className={cn(
            "overflow-hidden rounded-2xl border border-[var(--rootsy-bruma-200)]",
            "rootsy-app-light rootsy-nature-palette text-foreground",
            layoutsModuleContentShellClass,
          )}
        >
          <LayoutsBlocksModuleContentScope>
            <LayoutsBlocksTreasuryCardsGrid />
          </LayoutsBlocksModuleContentScope>
        </div>
      </LayoutsBlocksDocSubsection>

      <LayoutsBlocksDocSubsection
        title="Cajas · POS"
        description="Misma loseta que cuentas — cobrado hero · pie efectivo + CTA · menú ⋮ · pill de sesión."
      >
        <div
          className={cn(
            "overflow-hidden rounded-2xl border border-[var(--rootsy-bruma-200)]",
            "rootsy-app-light rootsy-nature-palette text-foreground",
            layoutsModuleContentShellClass,
          )}
        >
          <LayoutsBlocksModuleContentScope>
            <LayoutsBlocksCashRegisterCardsGrid />
          </LayoutsBlocksModuleContentScope>
        </div>
      </LayoutsBlocksDocSubsection>

      <LayoutsBlocksDocSubsection
        title="Estados de carga y vacío"
        description="Skeleton alineado al grid · empty states grid y detalle."
      >
        <div
          className={cn(
            "space-y-8 overflow-hidden rounded-2xl border border-[var(--rootsy-bruma-200)] p-0",
            "rootsy-app-light rootsy-nature-palette text-foreground",
            layoutsModuleContentShellClass,
          )}
        >
          <LayoutsBlocksModuleContentScope>
            <div className="space-y-8">
              <div>
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  Skeleton · cuentas
                </p>
                <TreasuryAccountsGridSkeleton count={4} />
              </div>
              <div>
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  Skeleton · cajas
                </p>
                <CashRegistersGridSkeleton count={3} />
              </div>
            </div>
          </LayoutsBlocksModuleContentScope>
        </div>
      </LayoutsBlocksDocSubsection>
    </div>
  )
}

export function LayoutsBlocksFullPageDraft({ composed = false }: { composed?: boolean }) {
  const grid = (
    <LayoutsBlocksModuleContentScope className="overflow-y-auto">
      <LayoutsBlocksPreviewCardsGrid />
    </LayoutsBlocksModuleContentScope>
  )

  if (composed) {
    return grid
  }

  return (
    <div
      className={cn(
        "mx-auto flex h-[32rem] max-w-5xl flex-col overflow-hidden rounded-2xl border border-border/80",
        "shadow-[0_24px_48px_-28px_rgba(41,37,36,0.38)]",
        "ring-1 ring-black/[0.04]",
      )}
    >
      <LayoutsBlocksHeaderDemo composed />
      {grid}
    </div>
  )
}

/** @deprecated Usar LayoutsBlocksLayoutSectionDemo */
export function LayoutsBlocksLayoutGridDemo({ contentOnly = false }: { contentOnly?: boolean }) {
  return (
    <div className={contentOnly ? "h-64 overflow-hidden" : undefined}>
      <LayoutsBlocksLayoutSectionDemo />
    </div>
  )
}

/** @deprecated Usar LayoutsBlocksEntityDesignSectionDemo */
export function LayoutsBlocksTreasuryCardsDemo() {
  return (
    <div className={cn("rounded-xl", layoutsModuleContentShellClass, "p-4 sm:p-6")}>
      <LayoutsBlocksTreasuryCardsGrid />
    </div>
  )
}

/** @deprecated Usar LayoutsBlocksEntityDesignSectionDemo */
export function LayoutsBlocksCashRegisterCardsDemo() {
  return (
    <div className={cn("rounded-xl", layoutsModuleContentShellClass, "p-4 sm:p-6")}>
      <LayoutsBlocksCashRegisterCardsGrid />
    </div>
  )
}

export function LayoutsBlocksEmptyStateSpecTable() {
  return (
    <FoundationSpecCard className="space-y-4">
      <p className="font-canopy text-xs leading-relaxed text-muted-foreground">
        Dos variantes: grid dashed para listados vacíos · detalle con icon tile para paneles flush
        (liquidaciones, arqueos, operaciones).
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-border/70">
              {["Rol", "Token", "Valor", "Producto"].map((heading) => (
                <th
                  key={heading}
                  className="px-2 py-2 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground first:pl-0"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LAYOUTS_BLOCKS_EMPTY_STATE_SPEC_ROWS.map((row) => (
              <tr key={`${row.role}-${row.token}`} className="border-b border-border/40 align-top">
                <td className="py-2.5 pr-3 font-canopy text-xs font-medium text-foreground">{row.role}</td>
                <td className="py-2.5 pr-3 font-mono text-[11px] text-muted-foreground">{row.token}</td>
                <td className="max-w-[14rem] py-2.5 pr-3 font-mono text-[10px] leading-relaxed break-all text-foreground">
                  {row.value}
                </td>
                <td className="py-2.5 font-canopy text-[11px] leading-relaxed text-muted-foreground">
                  {row.product}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FoundationSpecCard>
  )
}

export function LayoutsBlocksEmptyStatesSectionDemo() {
  return (
    <div className="space-y-8">
      <LayoutsBlocksEmptyStateSpecTable />

      <LayoutsBlocksDocSubsection
        title="Grid · listado vacío"
        description="Borde dashed · bruma-300 · mensaje único centrado en el área del grid."
      >
        <div
          className={cn(
            "overflow-hidden rounded-2xl border border-[var(--rootsy-bruma-200)]",
            "rootsy-app-light rootsy-nature-palette text-foreground",
            layoutsModuleContentShellClass,
          )}
        >
          <LayoutsBlocksModuleContentScope>
            <p className={dataWorkspaceBlocksEmptyStateClass}>
              {LAYOUTS_BLOCKS_EMPTY_STATE_DEMO_COPY.grid}
            </p>
          </LayoutsBlocksModuleContentScope>
        </div>
      </LayoutsBlocksDocSubsection>

      <LayoutsBlocksDocSubsection
        title="Detalle · panel flush"
        description="Icon tile bruma-50 · título body.medium · sin descripción salvo contexto extra (p. ej. cierre de caja)."
      >
        <div
          className={cn(
            "overflow-hidden rounded-2xl border border-[var(--rootsy-bruma-200)] bg-white",
            "rootsy-app-light rootsy-nature-palette text-foreground",
          )}
        >
          <div className="grid gap-px bg-[var(--rootsy-bruma-200)] sm:grid-cols-3">
            <div className="bg-white">
              <p className="border-b border-[var(--rootsy-bruma-200)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                Liquidaciones
              </p>
              <DataWorkspaceDetailEmptyState
                icon={Banknote}
                title={LAYOUTS_BLOCKS_EMPTY_STATE_DEMO_COPY.detailLiquidaciones.title}
                className="min-h-52"
              />
            </div>
            <div className="bg-white">
              <p className="border-b border-[var(--rootsy-bruma-200)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                Arqueos
              </p>
              <DataWorkspaceDetailEmptyState
                icon={History}
                title={LAYOUTS_BLOCKS_EMPTY_STATE_DEMO_COPY.detailArqueos.title}
                className="min-h-52"
              />
            </div>
            <div className="bg-white">
              <p className="border-b border-[var(--rootsy-bruma-200)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                Operaciones
              </p>
              <DataWorkspaceDetailEmptyState
                icon={List}
                title={LAYOUTS_BLOCKS_EMPTY_STATE_DEMO_COPY.detailOperaciones.title}
                className="min-h-52"
              />
            </div>
          </div>
        </div>
      </LayoutsBlocksDocSubsection>
    </div>
  )
}

export function LayoutsBlocksSkeletonDemo() {
  return (
    <div className={cn("space-y-8 rounded-xl p-4 sm:p-6", layoutsModuleContentShellClass)}>
      <TreasuryAccountsGridSkeleton count={4} />
      <CashRegistersGridSkeleton count={3} />
    </div>
  )
}

export function LayoutsBlocksEmptyStateDemo() {
  return (
    <div className={cn("rounded-xl p-4 sm:p-6", layoutsModuleContentShellClass)}>
      <p className={dataWorkspaceBlocksEmptyStateClass}>
        {LAYOUTS_BLOCKS_EMPTY_STATE_DEMO_COPY.grid}
      </p>
    </div>
  )
}

export function LayoutsBlocksCardSurfaceDemo() {
  return (
    <div className={cn("max-w-md space-y-3 rounded-xl p-4 sm:p-6", layoutsModuleContentShellClass)}>
      <article className={cn(dataWorkspaceEntityCardClass, "shadow-sm hover:shadow-sm")}>
        <div className={dataWorkspaceEntityCardHeaderClass}>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Cabecera · isotipo + meta + menú
          </p>
        </div>
        <div className={dataWorkspaceEntityCardBodyClass}>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Cuerpo · saldo principal
          </p>
        </div>
        <div className={cn("min-h-16 px-4 py-4", dataWorkspaceEntityCardFooterClass)}>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Pie · stats secundarios o CTA
          </p>
        </div>
      </article>
    </div>
  )
}
