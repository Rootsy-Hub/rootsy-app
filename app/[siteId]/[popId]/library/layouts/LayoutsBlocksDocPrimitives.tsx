"use client"

import "@/app/[siteId]/[popId]/library/color/rootsyNaturePalette.css"
import { TreasuryAccountCard } from "@/app/[siteId]/[popId]/accounts/TreasuryAccountCard"
import { TreasuryAccountsGridSkeleton } from "@/app/[siteId]/[popId]/accounts/TreasuryAccountsGridSkeleton"
import { CashRegisterCard } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterCard"
import { CashRegistersGridSkeleton } from "@/app/[siteId]/[popId]/cash-registers/CashRegistersGridSkeleton"
import { LayoutsTablesNightForestSurface } from "@/app/[siteId]/[popId]/library/layouts/LayoutsTablesNightForestSurface"
import {
  LayoutsTablesHeaderLeftZone,
  LayoutsTablesHeaderRightZone,
} from "@/app/[siteId]/[popId]/library/layouts/LayoutsTablesDocPrimitives"
import {
  DEMO_CASH_REGISTERS,
  DEMO_TREASURY_ACCOUNTS,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsBlocksMockData"
import { DataWorkspaceHeaderTitle } from "@/components/layouts/DataWorkspaceHeaderTitle"
import {
  dataWorkspaceBlocksContentInnerClass,
  dataWorkspaceBlocksPageContentClass,
  dataWorkspaceBlocksPageMainClass,
  dataWorkspaceBlocksContentScopeClass,
  dataWorkspaceBlocksEmptyStateClass,
  dataWorkspaceEntityCardBodyClass,
  dataWorkspaceEntityCardClass,
  dataWorkspaceEntityCardFooterClass,
  dataWorkspaceEntityCardHeaderClass,
  dataWorkspaceEntityCardsGridClass,
  workspaceTableNatureSkeletonTone,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
import { LayoutGrid } from "lucide-react"

const sk = workspaceTableNatureSkeletonTone

function LayoutsBlocksEarthScope({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rootsy-app-light rootsy-nature-palette bg-background", className)}>
      <div className={dataWorkspaceBlocksContentScopeClass}>{children}</div>
    </div>
  )
}

const HEADER_VARIANT = "dark" as const
const noop = () => {}

function LayoutHeightBadge({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute right-2 top-1.5 z-20 rounded-md bg-background/95 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground ring-1 ring-border/60">
      {label}
    </span>
  )
}

function LayoutsBlocksHeaderDemo({ composed = false }: { composed?: boolean }) {
  return (
    <LayoutsTablesNightForestSurface
      className={cn(
        composed ? "h-17 shrink-0" : "overflow-hidden rounded-xl",
      )}
      contentClassName={composed ? "h-full" : undefined}
    >
      <div
        className={cn(
          "grid h-full grid-cols-3 items-center gap-4 px-4",
          !composed && "h-18",
        )}
      >
        <LayoutsTablesHeaderLeftZone />
        <div className="flex flex-wrap items-center justify-center gap-2">
          <DataWorkspaceHeaderTitle title="Cuentas" headerVariant={HEADER_VARIANT} />
        </div>
        <LayoutsTablesHeaderRightZone />
      </div>
    </LayoutsTablesNightForestSurface>
  )
}

/** 1 · Grid del layout — header + área de contenido con tarjetas. */
export function LayoutsBlocksLayoutGridDemo() {
  return (
    <div
      className={cn(
        "mx-auto flex h-[28rem] max-w-4xl flex-col overflow-hidden rounded-2xl border border-neutral-300",
        "shadow-[0_24px_48px_-28px_rgba(41,37,36,0.38)]",
        "ring-1 ring-black/[0.04]",
      )}
    >
      <div className="relative shrink-0">
        <LayoutHeightBadge label="h-17" />
        <LayoutsTablesNightForestSurface className="h-17" contentClassName="h-full">
          <div className="grid h-full grid-cols-3 divide-x divide-[#263530]/60">
            <div className="min-w-0" />
            <div className="min-w-0" />
            <div className="min-w-0" />
          </div>
        </LayoutsTablesNightForestSurface>
      </div>

      <LayoutsBlocksEarthScope className="relative min-h-0 flex-1 overflow-auto">
        <LayoutHeightBadge label="tierra orgánica · px-4 py-6 · scroll" />
        <div className={cn(dataWorkspaceBlocksContentInnerClass, "gap-0 py-6 sm:py-6")}>
          <div className={dataWorkspaceEntityCardsGridClass}>
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className={cn(
                  dataWorkspaceEntityCardClass,
                  "pointer-events-none min-h-56 shadow-sm hover:shadow-sm",
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
                <div className={cn("min-h-19 px-4 py-4", dataWorkspaceEntityCardFooterClass)}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className={cn("h-6", sk.barSm)} />
                    <div className={cn("h-6", sk.barSm)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </LayoutsBlocksEarthScope>
    </div>
  )
}

export function LayoutsBlocksTreasuryCardsDemo() {
  return (
    <LayoutsBlocksEarthScope className="rounded-xl p-4 sm:p-6">
      <LayoutsBlocksTreasuryCardsGrid />
    </LayoutsBlocksEarthScope>
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

export function LayoutsBlocksCashRegisterCardsDemo() {
  return (
    <LayoutsBlocksEarthScope className="rounded-xl p-4 sm:p-6">
      <LayoutsBlocksCashRegisterCardsGrid />
    </LayoutsBlocksEarthScope>
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

export function LayoutsBlocksSkeletonDemo() {
  return (
    <LayoutsBlocksEarthScope className="space-y-8 rounded-xl p-4 sm:p-6">
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Cuentas
        </p>
        <TreasuryAccountsGridSkeleton count={4} />
      </div>
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Cajas
        </p>
        <CashRegistersGridSkeleton count={3} />
      </div>
    </LayoutsBlocksEarthScope>
  )
}

export function LayoutsBlocksEmptyStateDemo() {
  return (
    <LayoutsBlocksEarthScope className="rounded-xl p-4 sm:p-6">
      <p className={dataWorkspaceBlocksEmptyStateClass}>
        No hay cuentas configuradas.
      </p>
    </LayoutsBlocksEarthScope>
  )
}

export function LayoutsBlocksCardSurfaceDemo() {
  return (
    <LayoutsBlocksEarthScope className="max-w-md space-y-3 rounded-xl p-4 sm:p-6">
      <article className={cn(dataWorkspaceEntityCardClass, "shadow-sm hover:shadow-sm")}>
        <div className="absolute right-3 top-3 z-10 size-8 rounded-lg border border-dashed border-[var(--wt-border)] bg-white" />
        <div className={dataWorkspaceEntityCardHeaderClass}>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--wt-text-secondary)]">
            Cabecera · isotipo + meta + menú
          </p>
        </div>
        <div className={dataWorkspaceEntityCardBodyClass}>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--wt-text-secondary)]">
            Cuerpo · saldo principal
          </p>
        </div>
        <div className={cn("min-h-19 px-4 py-4", dataWorkspaceEntityCardFooterClass)}>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--wt-text-secondary)]">
            Pie · stats secundarios o CTA
          </p>
        </div>
      </article>
      <p className="text-xs text-muted-foreground">
        Fondo tierra:{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
          dataWorkspaceBlocksContentScopeClass
        </code>
        {" · "}
        tarjeta:{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
          dataWorkspaceEntityCardClass
        </code>
        {" · "}
        superficie interna:{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
          dataWorkspaceBlocksCardSurfaceClass
        </code>
        {" · "}
        radio:{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
          rounded-2xl
        </code>
        {" · "}
        elevación:{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
          shadow-sm → hover:shadow-md
        </code>
      </p>
    </LayoutsBlocksEarthScope>
  )
}

export function LayoutsBlocksFullPageDraft() {
  return (
    <div
      className={cn(
        "mx-auto flex h-[32rem] max-w-5xl flex-col overflow-hidden rounded-2xl border border-border/80",
        "shadow-[0_24px_48px_-28px_rgba(41,37,36,0.38)]",
        "ring-1 ring-black/[0.04]",
      )}
    >
      <LayoutsBlocksHeaderDemo composed />
      <div className={cn("rootsy-app-light rootsy-nature-palette min-h-0 flex-1 overflow-y-auto bg-background")}>
        <div className={dataWorkspaceBlocksPageContentClass}>
          <LayoutsBlocksTreasuryCardsGrid />
        </div>
      </div>
    </div>
  )
}

export function LayoutsBlocksOverviewIntro() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <LayoutGrid className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Grid de tarjetas
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Mismo shell workspace (header nocturno + cuerpo tierra orgánica) pero sin toolbar ni
            paginación: grid responsivo de tarjetas con elevación interactiva (
            <code className="text-[11px]">elevation.card.interactive</code>
            ), radio <code className="text-[11px]">rounded-2xl</code> y superficie blanca uniforme (
            <code className="text-[11px]">dataWorkspaceBlocksCardSurfaceClass</code>
            ). Referencia en producción:{" "}
            <span className="font-medium text-foreground">Cuentas</span> y{" "}
            <span className="font-medium text-foreground">Cajas</span>.
          </p>
        </div>
      </div>
    </div>
  )
}